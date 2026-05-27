const express = require('express');
const db = require('../config/db');
const { verifierToken } = require('../middlewares/auth');

const router = express.Router();

router.put('/profil', verifierToken, async (req, res) => {
  try {
    const champs = ['nom', 'prenom', 'telephone', 'adresse', 'ville'];
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

    params.push(req.utilisateur.id);
    await db.query(`UPDATE utilisateurs SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ succes: true, message: 'Profil modifie' });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

module.exports = router;
