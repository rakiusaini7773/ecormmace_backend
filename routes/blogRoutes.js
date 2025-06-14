// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addBlog,
  getAllBlogs,
  updateBlogImage,
  toggleBlogStatus,
} = require('../controllers/blogController');

router.post('/add', auth, addBlog);
router.put('/:id/image', auth, updateBlogImage);
router.put('/:id/status', auth, toggleBlogStatus);
router.get('/', getAllBlogs);

module.exports = router;