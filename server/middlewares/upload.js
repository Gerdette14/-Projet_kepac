const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─────────────────────────────────────────────
// Configuration Cloudinary (via variables Render)
// ─────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─────────────────────────────────────────────
// Stockage : les images vont directement sur Cloudinary
// ─────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kepac/produits',         // dossier dans ton compte Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Veuillez choisir une image valide'));
    }
    cb(null, true);
  }
});

module.exports = upload;
module.exports.cloudinary = cloudinary;
