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
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak request, coba lagi nanti.' },
  keyGenerator: (req) => req.ip,
});

router.use(limiter);

router.post("/", authGuard, createSSB);
router.get("/", authGuard, getAllSsb);
router.get("/:id/detail", authGuard, getSsbByIdDetail);
router.get("/:id", getSsbById);
router.put("/:id", authGuard, updateSsb);
router.delete("/:id", authGuard, deleteSsb);

module.exports = router;
