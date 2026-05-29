const express = require('express');
const db = require('../config/db');
const { verifierToken } = require('../middlewares/auth');

const router = express.Router();

async function ensureCommandeTables(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS commandes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      utilisateur_id INT NULL,
      total DECIMAL(10, 2) NOT NULL DEFAULT 0,
      statut ENUM('en_attente','confirmee','en_preparation','expediee','livree','annulee') NOT NULL DEFAULT 'en_attente',
      mode_paiement ENUM('mobile_money','carte','virement','a_la_livraison') NOT NULL DEFAULT 'mobile_money',
      statut_paiement ENUM('non_paye','paye','rembourse') NOT NULL DEFAULT 'non_paye',
      adresse_livraison VARCHAR(255) NOT NULL,
      ville VARCHAR(100) NOT NULL,
      telephone VARCHAR(20) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS commande_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      commande_id INT NOT NULL,
      produit_id INT NULL,
      nom_produit VARCHAR(200) NOT NULL,
      quantite INT NOT NULL DEFAULT 1,
      prix_unitaire DECIMAL(10, 2) NOT NULL,
      taille VARCHAR(50),
      couleur VARCHAR(50)
    )
  `);
}

router.post('/', async (req, res) => {
  const connection = await db.getConnection();

  try {
    await ensureCommandeTables(connection);

    const {
      utilisateur_id,
      items,
      adresse_livraison,
      ville,
      telephone,
      mode_paiement = 'a_la_livraison',
      notes
    } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ succes: false, message: 'La commande doit contenir au moins un produit' });
    }

    if (!adresse_livraison || !ville || !telephone) {
      return res.status(400).json({ succes: false, message: 'Adresse, ville et téléphone sont obligatoires' });
    }

    const ids = items.map((item) => Number(item.produit_id));
    const placeholders = ids.map(() => '?').join(',');
    const [produits] = await connection.query(
      `SELECT id, nom, prix, prix_promo, stock, taille, couleur FROM produits WHERE id IN (${placeholders}) AND actif = 1`,
      ids
    );

    const lignes = items.map((item) => {
      const produit = produits.find((p) => p.id === Number(item.produit_id));
      if (!produit) {
        throw new Error(`Produit ${item.produit_id} introuvable`);
      }

      const quantite = Number(item.quantite || 1);
      if (produit.stock < quantite) {
        throw new Error(`Stock insuffisant pour ${produit.nom}`);
      }

      const prix = Number(produit.prix_promo || produit.prix);
      return {
        produit,
        quantite,
        prix,
        taille: item.taille || produit.taille,
        couleur: item.couleur || produit.couleur
      };
    });

    const total = lignes.reduce((sum, item) => sum + item.prix * item.quantite, 0);

    await connection.beginTransaction();

    const [commande] = await connection.query(
      `INSERT INTO commandes
       (utilisateur_id, total, mode_paiement, adresse_livraison, ville, telephone, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [utilisateur_id || null, total, mode_paiement, adresse_livraison, ville, telephone, notes || null]
    );

    for (const ligne of lignes) {
      await connection.query(
        `INSERT INTO commande_items
         (commande_id, produit_id, nom_produit, quantite, prix_unitaire, taille, couleur)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          commande.insertId,
          ligne.produit.id,
          ligne.produit.nom,
          ligne.quantite,
          ligne.prix,
          ligne.taille || null,
          ligne.couleur || null
        ]
      );

      await connection.query('UPDATE produits SET stock = stock - ? WHERE id = ?', [
        ligne.quantite,
        ligne.produit.id
      ]);
    }

    await connection.commit();

    res.status(201).json({
      succes: true,
      message: 'Commande enregistree',
      commande_id: commande.insertId,
      total
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ succes: false, message: error.message });
  } finally {
    connection.release();
  }
});

router.get('/mes-commandes', verifierToken, async (req, res) => {
  try {
    await ensureCommandeTables(db);

    const [commandes] = await db.query(
      'SELECT * FROM commandes WHERE utilisateur_id = ? ORDER BY created_at DESC',
      [req.utilisateur.id]
    );

    res.json({ succes: true, commandes });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await ensureCommandeTables(db);

    const [commandes] = await db.query('SELECT * FROM commandes WHERE id = ?', [req.params.id]);
    if (!commandes.length) {
      return res.status(404).json({ succes: false, message: 'Commande introuvable' });
    }

    const [items] = await db.query('SELECT * FROM commande_items WHERE commande_id = ?', [req.params.id]);
    res.json({ succes: true, commande: commandes[0], items });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

module.exports = router;
