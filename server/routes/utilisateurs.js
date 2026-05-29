const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

router.put('/compte', verifierToken, async (req, res) => {
  try {
    const { email, ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

    if (!ancien_mot_de_passe) {
      return res.status(400).json({ succes: false, message: 'Ancien mot de passe obligatoire' });
    }

    const [rows] = await db.query('SELECT * FROM utilisateurs WHERE id = ?', [req.utilisateur.id]);
    const utilisateur = rows[0];

    if (!utilisateur || !(await bcrypt.compare(ancien_mot_de_passe, utilisateur.mot_de_passe))) {
      return res.status(401).json({ succes: false, message: 'Ancien mot de passe incorrect' });
    }

    const updates = [];
    const params = [];

    if (email && email !== utilisateur.email) {
      const [exists] = await db.query('SELECT id FROM utilisateurs WHERE email = ? AND id != ?', [email, utilisateur.id]);
      if (exists.length) {
        return res.status(409).json({ succes: false, message: 'Cet email est deja utilise' });
      }
      updates.push('email = ?');
      params.push(email);
    }

    if (nouveau_mot_de_passe) {
      if (String(nouveau_mot_de_passe).length < 6) {
        return res.status(400).json({ succes: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caracteres' });
      }
      updates.push('mot_de_passe = ?');
      params.push(await bcrypt.hash(nouveau_mot_de_passe, 10));
    }

    if (!updates.length) {
      return res.status(400).json({ succes: false, message: 'Aucune modification envoyee' });
    }

    params.push(utilisateur.id);
    await db.query(`UPDATE utilisateurs SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updatedRows] = await db.query(
      'SELECT id, nom, prenom, email, role, telephone, adresse, ville FROM utilisateurs WHERE id = ?',
      [utilisateur.id]
    );
    const updatedUser = updatedRows[0];
    const token = jwt.sign(
      {
        id: updatedUser.id,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom,
        email: updatedUser.email,
        role: updatedUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ succes: true, message: 'Compte modifie', utilisateur: updatedUser, token });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

module.exports = router;
