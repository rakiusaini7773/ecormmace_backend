const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth'); // ✅ Proper admin middleware
const {
  addBlog,
  getAllBlogs,
  updateBlogImage,
  toggleBlogStatus,
} = require('../controllers/blogController');

// ✅ Admin-only routes
router.post('/add', verifyAdmin, addBlog);
router.put('/:id/image', verifyAdmin, updateBlogImage);
router.put('/:id/status', verifyAdmin, toggleBlogStatus);

// ✅ Public route
router.get('/', getAllBlogs);

module.exports = router;
