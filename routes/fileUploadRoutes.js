const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const { uploadPoster, uploadVideo } = require('../controllers/fileUploadController');

// Create upload folders if they don't exist
['uploads/videos', 'uploads/posters'].forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') cb(null, 'uploads/videos');
    else if (file.fieldname === 'poster') cb(null, 'uploads/posters');
    else cb(new Error('Unexpected field'), null);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Multer middleware for multiple field types
const upload = multer({ storage });

const fileUploadMiddleware = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'poster', maxCount: 10 }
]);

// Routes
router.post('/upload', auth, fileUploadMiddleware, (req, res) => {
  if (req.files.poster) {
    return uploadPoster(req, res);
  } else if (req.files.video) {
    return uploadVideo(req, res);
  } else {
    return res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;
