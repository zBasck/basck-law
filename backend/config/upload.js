// backend/config/upload.js
// Configuração do multer para upload de documentos

const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const MAX_MB = parseInt(process.env.MAX_UPLOAD_MB || '25', 10);

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const safe = ext.replace(/[^a-z0-9.]/gi, '');
    const stamp = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    cb(null, `${stamp}${safe}`);
  }
});

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain'
]);

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME.has(file.mimetype) || file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_MB * 1024 * 1024 }
});

module.exports = { upload, UPLOAD_DIR };
