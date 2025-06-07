const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');

const validateAdmin = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post('/create', validateAdmin, adminController.createAdmin);
router.post('/login', validateAdmin, adminController.login);

module.exports = router;
