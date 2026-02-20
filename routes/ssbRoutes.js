const express = require("express");
const router = express.Router();
const authGuard = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');
const {
  createSSB,
  getAllSsb,
  getSsbById,
  deleteSsb,
  getSsbByIdDetail,
  updateSsb
} = require("../controllers/ssbController");

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

router.post("/", createSSB);
router.get("/", getAllSsb);
router.get("/:id/detail", getSsbByIdDetail);
router.get("/:id", getSsbById);
router.put("/:id", updateSsb);
router.delete("/:id", deleteSsb);

module.exports = router;
