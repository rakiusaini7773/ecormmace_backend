const express = require('express');
const router = express.Router();
const {
  addBlog,
  getAllBlogs,
  updateBlogImage,
  toggleBlogStatus,
} = require('../controllers/blogController');
const { verifyAdmin, verifyToken } = require('../middleware/auth');

// Admin-only routes
router.post('/add',verifyToken, verifyAdmin, addBlog);
router.put('/:id/image',verifyToken, verifyAdmin, updateBlogImage);
router.put('/:id/status', verifyToken,verifyAdmin, toggleBlogStatus);

// Public route
router.get('/', getAllBlogs);

module.exports = router;
