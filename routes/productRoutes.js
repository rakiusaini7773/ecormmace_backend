const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const {
  addProduct,
  getAllProducts,
  updateProductStatus,
  updateProductImage
} = require('../controllers/productController');

// ✅ POST /api/products/add (Admin only)
router.post('/add', verifyAdmin, addProduct);

// ✅ GET /api/products/all (Public access)
router.get('/all', getAllProducts);

// ✅ PATCH /api/products/:id/status (Admin only)
router.patch('/:id/status', verifyAdmin, updateProductStatus);

// ✅ PATCH /api/products/:id/image (Admin only)
router.patch('/:id/image', verifyAdmin, updateProductImage);

module.exports = router;
