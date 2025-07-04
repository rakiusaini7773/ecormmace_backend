const express = require('express');
const router = express.Router();
const { verifyAdmin, verifyToken } = require('../middleware/auth');
const {
  addProduct,
  getAllProducts,
  getSingleProduct,       // ✅ Import new controller
  toggleProductStatus,
  updateProductImage,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// ✅ Add a new product
router.post('/add', verifyToken, verifyAdmin, addProduct);

// ✅ Get all products
router.get('/all', getAllProducts);

// ✅ Get single product by ID (Public/Admin)
router.get('/:id', getSingleProduct);

// ✅ Toggle product status (Active/Inactive)
router.patch('/:id/status', verifyToken, verifyAdmin, toggleProductStatus);

// ✅ Update product images
router.patch('/:id/image', verifyToken, verifyAdmin, updateProductImage);

// ✅ Update a product
router.put('/:id', verifyToken, verifyAdmin, updateProduct);

// ✅ Delete a product
router.delete('/:id', verifyToken, verifyAdmin, deleteProduct);

module.exports = router;
