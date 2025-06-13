const Banner = require('../models/Banner');
const { cloudinary } = require('../config/cloudinary'); // ✅ FIXED import
const fs = require('fs');

exports.createBanner = async (req, res) => {
  try {
    let { title, link, status } = req.body;

    // ✅ Normalize status to match enum (e.g., "Active", "Inactive")
    if (status) {
      status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const file = req.files.image;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'banners',
      resource_type: 'image',
    });

    fs.unlinkSync(file.tempFilePath);

    const banner = new Banner({
      title,
      link,
      status,
      imageUrl: result.secure_url,
    });

    await banner.save();

    res.status(201).json({ message: 'Banner created', banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Failed to create banner', error: error.message });
  }
};


exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.status(200).json({ message: 'Status updated successfully', banner });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
