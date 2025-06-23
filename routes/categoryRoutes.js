const express = require('express');
const router = express.Router();
const { verifyAdmin, verifyToken } = require('../middleware/auth'); // ✅ Use named import

const {
  createCategory,
  getAllCategories,
  deleteCategory,
  toggleCategoryActive
} = require('../controllers/categoryController');



// ✅ Admin-only routes
router.post('/add',verifyToken, verifyAdmin, createCategory);         // Create category
router.delete('/:id',verifyToken, verifyAdmin, deleteCategory);       // Delete category
router.put('/:id/toggle',verifyToken, verifyAdmin, toggleCategoryActive); // Toggle active status

// ✅ Public route
router.get('/', getAllCategories);                        // Get all categories

module.exports = router;
