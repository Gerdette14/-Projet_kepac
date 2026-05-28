const express = require('express');
const db = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(verifierToken, verifierAdmin);

router.get('/dashboard', async (req, res) => {
  try {
    const [[produits]] = await db.query('SELECT COUNT(*) AS total FROM produits');
    const [[commandes]] = await db.query('SELECT COUNT(*) AS total FROM commandes');
    const [[clients]] = await db.query("SELECT COUNT(*) AS total FROM utilisateurs WHERE role = 'client'");
    const [[ventes]] = await db.query("SELECT COALESCE(SUM(total), 0) AS total FROM commandes WHERE statut <> 'annulee'");

    res.json({
      succes: true,
      stats: {
        produits: produits.total,
        commandes: commandes.total,
        clients: clients.total,
        ventes: Number(ventes.total)
      }
    });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

router.get('/commandes', async (req, res) => {
  try {
    const [commandes] = await db.query(
      `SELECT
         c.*,
         u.nom,
         u.prenom,
         u.email,
         (
           SELECT GROUP_CONCAT(ci.nom_produit SEPARATOR ' | ')
           FROM commande_items ci
           WHERE ci.commande_id = c.id
         ) AS produits,
         (
           SELECT GROUP_CONCAT(ci.quantite SEPARATOR ' | ')
           FROM commande_items ci
           WHERE ci.commande_id = c.id
         ) AS quantites,
         (
           SELECT GROUP_CONCAT(COALESCE(p.image, '') SEPARATOR ' | ')
           FROM commande_items ci
           LEFT JOIN produits p ON p.id = ci.produit_id
           WHERE ci.commande_id = c.id
         ) AS images
       FROM commandes c
       LEFT JOIN utilisateurs u ON u.id = c.utilisateur_id
       ORDER BY c.created_at DESC
       LIMIT 30`
    );

    res.json({ succes: true, commandes });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

router.put('/commandes/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    const statuts = ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee'];

    if (!statuts.includes(statut)) {
      return res.status(400).json({ succes: false, message: 'Statut invalide' });
    }

    await db.query('UPDATE commandes SET statut = ? WHERE id = ?', [statut, req.params.id]);
    res.json({ succes: true, message: 'Statut modifie' });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

module.exports = router;
