const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fileUpload = require('express-fileupload');
const {
  createCategory,
  getAllCategories,
  deleteCategory,
  toggleCategoryActive
} = require('../controllers/categoryController');

// Enable file upload
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Routes
router.post('/add', auth, createCategory);        // Create category
router.get('/', getAllCategories);                // Get all categories
router.delete('/:id', auth, deleteCategory);      // Delete category
router.put('/:id/toggle', auth, toggleCategoryActive); // Toggle active

module.exports = router;
