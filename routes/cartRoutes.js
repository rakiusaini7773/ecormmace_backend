const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// 🛒 Session-based Cart Routes
router.get('/', cartController.getCart);                // Get cart by session
router.post('/add', cartController.addToCart);          // Add product to cart
router.post('/increment', cartController.incrementQuantity); // Increment quantity
router.post('/decrement', cartController.decrementQuantity); // Decrement quantity
router.post('/remove', cartController.removeItem);      // Remove item
router.delete('/clear', cartController.clearCart);      // Clear full cart

module.exports = router;
