const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const bannerController = require('../controllers/bannerController');

// ✅ Admin-only route: Create a banner (with Cloudinary upload)
router.post('/add', verifyAdmin, bannerController.createBanner);

// ✅ Public route: Get all banners
router.get('/', bannerController.getAllBanners);

// ✅ Admin-only: Update banner status
router.patch('/:id/status', verifyAdmin, bannerController.updateBannerStatus);

module.exports = router;
