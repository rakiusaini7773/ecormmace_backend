const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:userId', cartController.getCart);
router.post('/add', cartController.addToCart);
router.post('/increment', cartController.incrementQuantity);
router.post('/decrement', cartController.decrementQuantity);
router.post('/remove', cartController.removeItem);
router.delete('/clear/:userId', cartController.clearCart);

module.exports = router;
