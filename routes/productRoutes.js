// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fileUpload = require('express-fileupload');
const { addProduct, getAllProducts, updateProductStatus, updateProductImage } = require('../controllers/productController');

// Enable file upload middleware
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// POST /api/products/add (Admin only)
router.post('/add', auth, addProduct);

// Route: Get all products
router.get('/all', getAllProducts);

// Change status
router.patch('/:id/status', auth, updateProductStatus);

// Change image
router.patch('/:id/image', auth, updateProductImage);


module.exports = router;
