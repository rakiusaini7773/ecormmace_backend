const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');

// 🔒 Validation middleware
const validateAdminCreate = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateAdminLogin = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ✅ Create admin (via backend/API only — not UI)
router.post('/create', validateAdminCreate, adminController.createAdmin);

// ✅ Login admin (UI access allowed)
router.post('/login', validateAdminLogin, adminController.login);

module.exports = router;
