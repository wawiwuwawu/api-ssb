const express = require("express");
const router = express.Router({ mergeParams: true });
const upload = require('../utils/multer');
const authGuard = require('../middlewares/auth.middleware');
const {
  createSiswa,
  getAllSiswa,
  getSiswaById,
  updateSiswa,
  deleteSiswa
} = require('../controllers/siswaController');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak request, coba lagi nanti.' },
  keyGenerator: (req) => req.ip,
});

router.use(authGuard);
router.use(limiter);

router.post("/", upload.single('foto'), createSiswa);
router.get("/", getAllSiswa);
router.get("/:id", getSiswaById);
router.put("/:id", upload.single('foto'), updateSiswa);
router.delete("/:id", deleteSiswa);

module.exports = router;