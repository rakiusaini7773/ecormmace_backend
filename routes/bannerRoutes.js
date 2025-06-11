const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const isAdmin = require('../middleware/auth');
const fileUpload = require('express-fileupload');

// Middleware to handle file uploads
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Create a banner with Cloudinary upload (no multer)
router.post('/add', isAdmin, bannerController.createBanner);

// Get all banners
router.get('/', bannerController.getAllBanners);

// Update banner status
router.patch('/:id/status', isAdmin, bannerController.updateBannerStatus);

module.exports = router;
