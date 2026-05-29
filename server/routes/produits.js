const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');
const { upload, cloudinary } = require('../middlewares/upload');

const router = express.Router();

// ─────────────────────────────────────────────
// UTILITAIRE : calcule le hash MD5 d'un fichier
// ─────────────────────────────────────────────
function calculerHashFichier(cheminFichier) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(cheminFichier);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// ─────────────────────────────────────────────
// MIDDLEWARE : vérifie que l'image n'est pas un doublon
// ─────────────────────────────────────────────
async function verifierDoublonImage(req, res, next) {
  if (!req.file) return next();
  if (!req.file.path || !fs.existsSync(req.file.path)) return next();

  try {
    const hash = await calculerHashFichier(req.file.path);

    const [rows] = await db.query(
      'SELECT id, nom FROM produits WHERE image_hash = ? LIMIT 1',
      [hash]
    );

    if (rows.length > 0) {
      fs.unlink(req.file.path, () => {});
      return res.status(409).json({
        succes: false,
        message: `Cette image est déjà utilisée par le produit "${rows[0].nom}" (id: ${rows[0].id})`
      });
    }

    req.imageHash = hash;
    next();
  } catch (err) {
    fs.unlink(req.file.path, () => {});
    next(err);
  }
}

// ─────────────────────────────────────────────
// ROUTE : upload image (avec détection de doublon)
// ─────────────────────────────────────────────
router.post(
  '/upload',
  verifierToken,
  verifierAdmin,
  upload.single('image'),
  verifierDoublonImage,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ succes: false, message: 'Image obligatoire' });
    }

    res.status(201).json({
      succes: true,
      image: req.file.path || req.file.secure_url || `/images/uploads/${req.file.filename}`,
      image_hash: req.imageHash
    });
  }
);

// ─────────────────────────────────────────────
// ROUTE : nettoyage des doublons existants en base
// Garde le produit le plus ancien, désactive les autres
// ─────────────────────────────────────────────
router.post('/nettoyer-doublons', verifierToken, verifierAdmin, async (req, res) => {
  try {
    // 1. Trouver tous les produits dont l'image_hash est partagé par plusieurs produits
    const [doublons] = await db.query(`
      SELECT image_hash, COUNT(*) AS nb, MIN(id) AS id_a_garder
      FROM produits
      WHERE image_hash IS NOT NULL AND actif = 1
      GROUP BY image_hash
      HAVING COUNT(*) > 1
    `);

    if (doublons.length === 0) {
      return res.json({ succes: true, message: 'Aucun doublon trouvé', desactives: 0 });
    }

    let totalDesactives = 0;
    const details = [];

    for (const doublon of doublons) {
      // 2. Récupérer tous les IDs en doublon sauf celui à garder
      const [produitsConcernes] = await db.query(
        `SELECT id, nom FROM produits
         WHERE image_hash = ? AND id != ? AND actif = 1`,
        [doublon.image_hash, doublon.id_a_garder]
      );

      const idsADesactiver = produitsConcernes.map((p) => p.id);

      if (idsADesactiver.length > 0) {
        // 3. Désactiver les doublons
        await db.query(
          `UPDATE produits SET actif = 0 WHERE id IN (?)`,
          [idsADesactiver]
        );

        totalDesactives += idsADesactiver.length;
        details.push({
          image_hash: doublon.image_hash,
          id_conserve: doublon.id_a_garder,
          ids_desactives: idsADesactiver,
          noms_desactives: produitsConcernes.map((p) => p.nom)
        });
      }
    }

    res.json({
      succes: true,
      message: `${totalDesactives} produit(s) en doublon désactivé(s)`,
      desactives: totalDesactives,
      details
    });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE : migration — calcule et remplit image_hash
// pour les produits existants qui n'en ont pas encore
// ─────────────────────────────────────────────
router.post('/migrer-hash', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR
      ? require('path').resolve(__dirname, '../..', process.env.UPLOAD_DIR)
      : require('path').join(__dirname, '../../public/images/uploads');

    const [produits] = await db.query(
      `SELECT id, image FROM produits WHERE image IS NOT NULL AND image_hash IS NULL`
    );

    let mis_a_jour = 0;
    let echecs = 0;
    const erreurs = [];

    for (const produit of produits) {
      try {
        // Extraire le nom du fichier depuis l'URL stockée en base
        const nomFichier = require('path').basename(produit.image);
        const cheminFichier = require('path').join(uploadDir, nomFichier);

        if (!fs.existsSync(cheminFichier)) {
          echecs++;
          erreurs.push({ id: produit.id, raison: 'Fichier introuvable sur disque' });
          continue;
        }

        const hash = await calculerHashFichier(cheminFichier);

        // Vérifie si ce hash est déjà pris par un autre produit
        const [existe] = await db.query(
          'SELECT id FROM produits WHERE image_hash = ? AND id != ? LIMIT 1',
          [hash, produit.id]
        );

        if (existe.length > 0) {
          echecs++;
          erreurs.push({ id: produit.id, raison: `Hash déjà utilisé par le produit id ${existe[0].id}` });
          continue;
        }

        await db.query('UPDATE produits SET image_hash = ? WHERE id = ?', [hash, produit.id]);
        mis_a_jour++;
      } catch (e) {
        echecs++;
        erreurs.push({ id: produit.id, raison: e.message });
      }
    }

    res.json({
      succes: true,
      message: `Migration terminée : ${mis_a_jour} hash ajoutés, ${echecs} échec(s)`,
      mis_a_jour,
      echecs,
      erreurs
    });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE : liste des produits
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { recherche, categorie, actif = '1' } = req.query;
    const params = [];
    const conditions = [];

    if (actif !== 'tous') {
      conditions.push('p.actif = ?');
      params.push(Number(actif));
    }

    if (recherche) {
      conditions.push('(p.nom LIKE ? OR p.description LIKE ? OR p.marque LIKE ?)');
      params.push(`%${recherche}%`, `%${recherche}%`, `%${recherche}%`);
    }

    if (categorie) {
      conditions.push('(c.slug = ? OR c.nom = ? OR p.categorie_id = ?)');
      params.push(categorie, categorie, Number(categorie) || 0);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [produits] = await db.query(
      `SELECT p.*, c.nom AS categorie_nom, c.slug AS categorie_slug
       FROM produits p
       LEFT JOIN categories c ON c.id = p.categorie_id
       ${where}
       ORDER BY p.created_at DESC`,
      params
    );

    res.json({ succes: true, total: produits.length, produits });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE : liste des catégories
// ─────────────────────────────────────────────
router.get('/categories/liste', async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT id, nom, slug, description
       FROM categories
       ORDER BY parent_id IS NOT NULL, nom`
    );

    res.json({ succes: true, categories });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE : détail d'un produit
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.nom AS categorie_nom, c.slug AS categorie_slug
       FROM produits p
       LEFT JOIN categories c ON c.id = p.categorie_id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ succes: false, message: 'Produit introuvable' });
    }

    res.json({ succes: true, produit: rows[0] });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE : créer un produit
// ─────────────────────────────────────────────
router.post('/', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const {
      nom,
      description,
      prix,
      prix_promo,
      stock,
      categorie_id,
      taille,
      couleur,
      marque,
      image,
      actif = 1
    } = req.body;

    if (!nom || prix === undefined) {
      return res.status(400).json({ succes: false, message: 'Nom et prix obligatoires' });
    }

    const [resultat] = await db.query(
      `INSERT INTO produits
       (nom, description, prix, prix_promo, stock, categorie_id, taille, couleur, marque, image, actif)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nom,
        description || null,
        prix,
        prix_promo || null,
        stock || 0,
        categorie_id || null,
        taille || null,
        couleur || null,
        marque || null,
        image || null,
        actif
      ]
    );

    res.status(201).json({ succes: true, message: 'Produit cree', id: resultat.insertId });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE : modifier un produit
// ─────────────────────────────────────────────
router.put('/:id', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const champs = [
      'nom', 'description', 'prix', 'prix_promo', 'stock',
      'categorie_id', 'taille', 'couleur', 'marque', 'image', 'actif'
    ];
    const updates = [];
    const params = [];

    champs.forEach((champ) => {
      if (Object.prototype.hasOwnProperty.call(req.body, champ)) {
        updates.push(`${champ} = ?`);
        params.push(req.body[champ]);
      }
    });

    if (!updates.length) {
      return res.status(400).json({ succes: false, message: 'Aucune modification envoyee' });
    }

    params.push(req.params.id);
    const [resultat] = await db.query(
      `UPDATE produits SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ succes: true, message: 'Produit modifie', lignes: resultat.affectedRows });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE : désactiver un produit (soft delete)
// ─────────────────────────────────────────────
router.delete('/:id', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const [resultat] = await db.query('UPDATE produits SET actif = 0 WHERE id = ?', [req.params.id]);
    res.json({ succes: true, message: 'Produit desactive', lignes: resultat.affectedRows });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

module.exports = router; 
