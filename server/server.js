const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/produits', require('./routes/produits'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/utilisateurs', require('./routes/utilisateurs'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({ succes: true, message: 'API KEPAC active' });
});

app.use('/api', (req, res) => {
  res.status(404).json({
    succes: false,
    message: 'Route API introuvable'
  });
});

app.use(express.static(path.join(__dirname, '../public')));

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    succes: false,
    message: err.message || 'Erreur serveur'
  });
});

const db = require('./config/db');
db.query('SELECT 1')
  .then(() => console.log('MySQL connecte'))
  .catch((err) => console.error('Erreur MySQL :', err.message));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lance sur http://localhost:${PORT}`);
});
