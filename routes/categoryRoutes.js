const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createCategory,
  getAllCategories,
  deleteCategory,
  toggleCategoryActive
} = require('../controllers/categoryController');

// Use express-fileupload middleware
const fileUpload = require('express-fileupload');
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Cloudinary-based image upload
router.post('/add', auth, createCategory);

router.get('/', getAllCategories);
router.delete('/:id', auth, deleteCategory);
router.put('/:id/toggle', auth, toggleCategoryActive);

module.exports = router;
