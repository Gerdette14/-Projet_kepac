const express = require('express');
const { Readable } = require('stream');
const db = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');
const { upload, cloudinary } = require('../middlewares/upload');

const router = express.Router();

// Upload vers Cloudinary depuis le buffer memoire
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'kepac/produits' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

// Verifie que l'image n'est pas un doublon via etag Cloudinary
async function verifierDoublonImage(req, res, next) {
  if (!req.file) return next();
  try {
    const result = await uploadToCloudinary(req.file.buffer);
    const hash = result.etag;

    const [rows] = await db.query(
      'SELECT id, nom FROM produits WHERE image_hash = ? LIMIT 1',
      [hash]
    );

    if (rows.length > 0) {
      await cloudinary.uploader.destroy(result.public_id).catch(() => {});
      return res.status(409).json({
        succes: false,
        message: `Cette image est deja utilisee par le produit "${rows[0].nom}" (id: ${rows[0].id})`
      });
    }

    req.imageHash = hash;
    req.imageUrl = result.secure_url;
    next();
  } catch (err) {
    next(err);
  }
}

// ROUTE : upload image
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
      image: req.imageUrl,
      image_hash: req.imageHash
    });
  }
);

// ROUTE : nettoyage des doublons existants
router.post('/nettoyer-doublons', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const [doublons] = await db.query(`
      SELECT image_hash, COUNT(*) AS nb, MIN(id) AS id_a_garder
      FROM produits
      WHERE image_hash IS NOT NULL AND actif = 1
      GROUP BY image_hash
      HAVING COUNT(*) > 1
    `);
    if (doublons.length === 0) {
      return res.json({ succes: true, message: 'Aucun doublon trouve', desactives: 0 });
    }
    let totalDesactives = 0;
    const details = [];
    for (const doublon of doublons) {
      const [produitsConcernes] = await db.query(
        `SELECT id, nom FROM produits WHERE image_hash = ? AND id != ? AND actif = 1`,
        [doublon.image_hash, doublon.id_a_garder]
      );
      const idsADesactiver = produitsConcernes.map((p) => p.id);
      if (idsADesactiver.length > 0) {
        await db.query(`UPDATE produits SET actif = 0 WHERE id IN (?)`, [idsADesactiver]);
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
      message: `${totalDesactives} produit(s) en doublon desactive(s)`,
      desactives: totalDesactives,
      details
    });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ROUTE : migration hash pour produits existants
router.post('/migrer-hash', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const [produits] = await db.query(
      `SELECT id, image FROM produits WHERE image IS NOT NULL AND image_hash IS NULL`
    );
    let mis_a_jour = 0;
    let echecs = 0;
    const erreurs = [];
    for (const produit of produits) {
      try {
        let hash = null;
        if (produit.image && produit.image.includes('cloudinary.com')) {
          const matches = produit.image.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
          if (matches) {
            const publicId = matches[1];
            const info = await cloudinary.api.resource(publicId);
            hash = info.etag || publicId;
          }
        } else {
          hash = require('crypto').createHash('md5').update(produit.image).digest('hex');
        }
        if (!hash) {
          echecs++;
          erreurs.push({ id: produit.id, raison: 'Impossible d extraire le hash' });
          continue;
        }
        const [existe] = await db.query(
          'SELECT id FROM produits WHERE image_hash = ? AND id != ? LIMIT 1',
          [hash, produit.id]
        );
        if (existe.length > 0) {
          echecs++;
          erreurs.push({ id: produit.id, raison: `Hash deja utilise par le produit id ${existe[0].id}` });
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
      message: `Migration terminee : ${mis_a_jour} hash ajoutes, ${echecs} echec(s)`,
      mis_a_jour,
      echecs,
      erreurs
    });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ROUTE : liste des produits
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

// ROUTE : liste des categories
router.get('/categories/liste', async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT id, nom, slug, description FROM categories ORDER BY parent_id IS NOT NULL, nom`
    );
    res.json({ succes: true, categories });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ROUTE : detail d'un produit
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

// ROUTE : creer un produit
router.post('/', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const {
      nom, description, prix, prix_promo, stock,
      categorie_id, taille, couleur, marque,
      image, image_hash, actif = 1
    } = req.body;
    if (!nom || prix === undefined) {
      return res.status(400).json({ succes: false, message: 'Nom et prix obligatoires' });
    }
    if (image_hash) {
      const [existe] = await db.query(
        'SELECT id, nom FROM produits WHERE image_hash = ? LIMIT 1',
        [image_hash]
      );
      if (existe.length > 0) {
        return res.status(409).json({
          succes: false,
          message: `Cette image est deja utilisee par le produit "${existe[0].nom}" (id: ${existe[0].id})`
        });
      }
    }
    const [resultat] = await db.query(
      `INSERT INTO produits
       (nom, description, prix, prix_promo, stock, categorie_id, taille, couleur, marque, image, image_hash, actif)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nom, description || null, prix, prix_promo || null,
        stock || 0, categorie_id || null, taille || null,
        couleur || null, marque || null,
        image || null, image_hash || null, actif
      ]
    );
    res.status(201).json({ succes: true, message: 'Produit cree', id: resultat.insertId });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

// ROUTE : modifier un produit
router.put('/:id', verifierToken, verifierAdmin, async (req, res) => {
  try {
    if (req.body.image_hash) {
      const [existe] = await db.query(
        'SELECT id, nom FROM produits WHERE image_hash = ? AND id != ? LIMIT 1',
        [req.body.image_hash, req.params.id]
      );
      if (existe.length > 0) {
        return res.status(409).json({
          succes: false,
          message: `Cette image est deja utilisee par le produit "${existe[0].nom}" (id: ${existe[0].id})`
        });
      }
    }
    const champs = [
      'nom', 'description', 'prix', 'prix_promo', 'stock',
      'categorie_id', 'taille', 'couleur', 'marque', 'image', 'image_hash', 'actif'
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

// ROUTE : desactiver un produit
router.delete('/:id', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const [resultat] = await db.query('UPDATE produits SET actif = 0 WHERE id = ?', [req.params.id]);
    res.json({ succes: true, message: 'Produit desactive', lignes: resultat.affectedRows });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

module.exports = router; 
