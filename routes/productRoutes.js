const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addProduct, getProductsByCategory } = require('../controllers/productController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
['uploads/images', 'uploads/videos', 'uploads/posters'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') cb(null, 'uploads/videos');
    else if (file.fieldname === 'poster') cb(null, 'uploads/posters');
    else cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post(
  '/add',
  auth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'poster', maxCount: 1 }
  ]),
  addProduct
);

router.get('/category/:categoryId', auth, getProductsByCategory);

module.exports = router;
