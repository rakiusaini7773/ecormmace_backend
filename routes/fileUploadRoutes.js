const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Middleware only for this route
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

router.post('/', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
      folder: 'banners', // You can change this folder name
    });

    // Delete temp file
    fs.unlinkSync(req.files.image.tempFilePath);

    res.status(200).json({
      message: 'Upload successful',
      url: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;
