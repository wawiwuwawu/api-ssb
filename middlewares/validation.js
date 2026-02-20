const { body, param } = require("express-validator");

const validateRegistration = [
  body('name')
    .notEmpty().withMessage('Nama wajib diisi')
    .isLength({ min: 3 }).withMessage('Nama minimal 3 karakter')
    .trim(),
  body('email')
    .isEmail().withMessage('Email tidak valid')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
    .matches(/[0-9]/).withMessage('Password harus mengandung angka')
    .matches(/[a-zA-Z]/).withMessage('Password harus mengandung huruf')
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
];

module.exports = { 
    validateRegistration,
    validateLogin
};