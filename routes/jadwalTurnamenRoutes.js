const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams untuk akses :ssb_id dari parent route
const authGuard = require('../middlewares/auth.middleware');
const {
  createJadwalTurnamen,
  getAllJadwalTurnamen,
  getJadwalTurnamenById,
  updateJadwalTurnamen,
  deleteJadwalTurnamen
} = require('../controllers/jadwalTurnamenController');
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

router.post("/", createJadwalTurnamen);
router.get("/", getAllJadwalTurnamen);
router.get("/:id", getJadwalTurnamenById);
router.put("/:id", updateJadwalTurnamen);
router.delete("/:id", deleteJadwalTurnamen);

module.exports = router;