const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken, verifyUser } = require('../middleware/auth');

// 🛒 User-based Cart Routes
router.get('/', verifyToken, verifyUser, cartController.getCart);
router.post('/add', verifyToken, verifyUser, cartController.addToCart);
router.post('/increment', verifyToken, verifyUser, cartController.incrementQuantity);
router.post('/decrement', verifyToken, verifyUser, cartController.decrementQuantity);
router.post('/remove', verifyToken, verifyUser, cartController.removeItem);
router.delete('/clear', verifyToken, verifyUser, cartController.clearCart);

module.exports = router;
