const express = require('express');
const router = express.Router();
const { uploadFroalaImage } = require('../controllers/uploadController');

// Froala inline image upload route
router.post('/froala-image', uploadFroalaImage);

module.exports = router;
