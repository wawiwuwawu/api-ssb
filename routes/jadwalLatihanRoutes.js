const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams untuk akses :ssb_id dari parent route
const authGuard = require('../middlewares/auth.middleware');
const {
  createJadwalLatihan,
  getAllJadwalLatihan,
  getJadwalLatihanById,
  updateJadwalLatihan,
  deleteJadwalLatihan
} = require('../controllers/jadwalLatihanController');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak request, coba lagi nanti.' },
  keyGenerator: (req) => req.ip,
});

router.use(authGuard);
router.use(limiter);

router.post("/", createJadwalLatihan);
router.get("/", getAllJadwalLatihan);
router.get("/:id", getJadwalLatihanById);
router.put("/:id", updateJadwalLatihan);
router.delete("/:id", deleteJadwalLatihan);

module.exports = router;