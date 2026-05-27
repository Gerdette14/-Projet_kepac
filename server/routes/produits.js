const express = require('express');
const db = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post('/upload', verifierToken, verifierAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ succes: false, message: 'Image obligatoire' });
  }

  res.status(201).json({
    succes: true,
    image: `/images/uploads/${req.file.filename}`
  });
});

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

router.put('/:id', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const champs = [
      'nom',
      'description',
      'prix',
      'prix_promo',
      'stock',
      'categorie_id',
      'taille',
      'couleur',
      'marque',
      'image',
      'actif'
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
    const [resultat] = await db.query(`UPDATE produits SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ succes: true, message: 'Produit modifie', lignes: resultat.affectedRows });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

router.delete('/:id', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const [resultat] = await db.query('UPDATE produits SET actif = 0 WHERE id = ?', [req.params.id]);
    res.json({ succes: true, message: 'Produit desactive', lignes: resultat.affectedRows });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

module.exports = router;
