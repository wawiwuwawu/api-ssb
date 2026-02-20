const express = require('express');
const router = express.Router();

const authGuard     = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

const { 
    registerUser,
    loginUser,
    getCurrentUser,
    updateCurrentUser,
    resetPassword,
    deleteCurrentUser
} = require('../controllers/userController');

const { validateRegistration, validateLogin } = require('../middlewares/validation');
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

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/me', getCurrentUser);
router.put('/me', updateCurrentUser);
router.delete('/me', deleteCurrentUser);
router.post('/reset-password', validateLogin, resetPassword);

module.exports = router;