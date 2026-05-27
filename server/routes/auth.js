const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifierToken } = require('../middlewares/auth');

const router = express.Router();

function creerToken(utilisateur) {
  return jwt.sign(
    {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function publicUser(utilisateur) {
  return {
    id: utilisateur.id,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    email: utilisateur.email,
    role: utilisateur.role,
    telephone: utilisateur.telephone,
    adresse: utilisateur.adresse,
    ville: utilisateur.ville
  };
}

router.post('/inscription', async (req, res) => {
  res.status(403).json({
    succes: false,
    message: 'La création de compte client est désactivée. Veuillez commander sur WhatsApp.'
  });
});

router.post('/connexion', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({
        succes: false,
        message: 'Email et mot de passe obligatoires'
      });
    }

    const [rows] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
    const utilisateur = rows[0];

    if (!utilisateur || !(await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe))) {
      return res.status(401).json({
        succes: false,
        message: 'Identifiants incorrects'
      });
    }

    if (utilisateur.role !== 'admin') {
      return res.status(403).json({
        succes: false,
        message: "Connexion réservée à l'administrateur"
      });
    }

    res.json({
      succes: true,
      message: 'Connexion reussie',
      token: creerToken(utilisateur),
      utilisateur: publicUser(utilisateur)
    });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

router.get('/profil', verifierToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nom, prenom, email, role, telephone, adresse, ville, created_at FROM utilisateurs WHERE id = ?',
      [req.utilisateur.id]
    );

    if (!rows.length) {
      return res.status(404).json({ succes: false, message: 'Utilisateur introuvable' });
    }

    res.json({ succes: true, utilisateur: rows[0] });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

module.exports = router;
