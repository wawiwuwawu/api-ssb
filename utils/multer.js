const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads/siswa ada
const uploadDir = 'uploads/siswa';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomnumber.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'siswa-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter hanya file gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file harus JPG, JPEG, atau PNG'), false);
  }
};

// Konfigurasi multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Max 5MB
  }
});

module.exports = upload;