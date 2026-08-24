const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const safeBaseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniquePrefix}-${safeBaseName}`);
  }
});

const allowedMIMETypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

function fileFilter(req, file, cb) {
  if (allowedMIMETypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type '${file.mimetype}'. Allowed formats: PDF, PNG, JPG, DOC, DOCX, TXT.`), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB maximum size
  }
});

module.exports = {
  upload,
  uploadDir
};
