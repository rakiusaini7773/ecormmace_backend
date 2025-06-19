const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { verifyUser } = require('../middleware/auth'); // ✅ Correct import

const router = express.Router();

// 📝 User Registration
router.post('/register', [
  body('name').notEmpty().withMessage("Name is required"),
  body('email').isEmail().withMessage("Valid email is required"),
  body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], registerUser);

// 🔐 User Login
router.post('/login', loginUser);

// 👤 Get User Profile (Protected)
router.get('/profile', verifyUser, getUserProfile);

module.exports = router;
