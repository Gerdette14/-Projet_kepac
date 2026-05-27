const jwt = require('jsonwebtoken');

function verifierToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      succes: false,
      message: 'Connexion requise'
    });
  }

  try {
    req.utilisateur = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      succes: false,
      message: 'Session invalide ou expiree'
    });
  }
}

function verifierAdmin(req, res, next) {
  if (req.utilisateur?.role !== 'admin') {
    return res.status(403).json({
      succes: false,
      message: 'Acces reserve aux administrateurs'
    });
  }

  next();
}

module.exports = {
  verifierToken,
  verifierAdmin
};
