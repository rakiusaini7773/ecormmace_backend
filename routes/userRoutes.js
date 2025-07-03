const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  addUserAddress,
  getUserAddresses
} = require('../controllers/userController');

const {
  verifyUser,
  verifyAdmin,
  verifyToken
} = require('../middleware/auth');

const router = express.Router();

// 📝 Register
router.post('/register', [
  body('name').notEmpty().withMessage("Name is required"),
  body('phonenumber')
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits'),
  body('email').isEmail().withMessage("Valid email is required"),
  body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], registerUser);

// 🔐 Login
router.post('/login', loginUser);

// 👤 Profile (User)
router.get('/profile', verifyToken, verifyUser, getUserProfile);


// 🔐 All users (Admin only)
router.get('/all', verifyToken, verifyAdmin, getAllUsers);

router.post('/address', verifyToken, verifyUser, addUserAddress);
router.get('/address', verifyToken, verifyUser, getUserAddresses);

module.exports = router;
