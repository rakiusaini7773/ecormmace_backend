const { cloudinary } = require('../config/cloudinary');

// Froala inline image upload handler
exports.uploadFroalaImage = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const file = req.files.file;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'blog-description-images',
    });

    // Froala expects the image URL in the `link` field
    res.status(200).json({ link: result.secure_url });
  } catch (err) {
    console.error('Froala image upload error:', err);
    res.status(500).json({ message: 'Image upload failed' });
  }
};
