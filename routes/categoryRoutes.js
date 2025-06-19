const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth'); // ✅ Use named import

const {
  createCategory,
  getAllCategories,
  deleteCategory,
  toggleCategoryActive
} = require('../controllers/categoryController');



// ✅ Admin-only routes
router.post('/add', verifyAdmin, createCategory);         // Create category
router.delete('/:id', verifyAdmin, deleteCategory);       // Delete category
router.put('/:id/toggle', verifyAdmin, toggleCategoryActive); // Toggle active status

// ✅ Public route
router.get('/', getAllCategories);                        // Get all categories

module.exports = router;
