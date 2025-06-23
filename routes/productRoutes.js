const express = require('express');
const router = express.Router();
const { verifyAdmin, verifyToken } = require('../middleware/auth');
const {
  addProduct,
  getAllProducts,
  toggleProductStatus, // ✅ Correct name
  updateProductImage   // ✅ Only if you implemented this
} = require('../controllers/productController');

// ✅ Add a new product
router.post('/add', verifyToken, verifyAdmin, addProduct);

// ✅ Get all products
router.get('/all', getAllProducts);

// ✅ Toggle product status
router.patch('/:id/status', verifyToken, verifyAdmin, toggleProductStatus);

// ✅ (Optional) Update image - make sure this exists in controller
router.patch('/:id/image', verifyToken, verifyAdmin, updateProductImage);

module.exports = router;
