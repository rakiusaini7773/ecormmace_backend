const Product = require('../models/Product');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

// ✅ Add a new product
const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      tag,
      subDescription,
      offerCode,
      status,
      category,
      rating,
    } = req.body;

    // Basic validation
    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Validate images
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    // Handle multiple image uploads
    let imageFiles = req.files.image;
    if (!Array.isArray(imageFiles)) {
      imageFiles = [imageFiles]; // single file support
    }

    const imageUrls = [];
    for (const file of imageFiles) {
      const uploaded = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'products/images',
        resource_type: 'image',
      });
      imageUrls.push(uploaded.secure_url);
    }

    // Optional video upload
    let videoUrl = '';
    if (req.files.video) {
      const video = req.files.video;
      const uploadedVideo = await cloudinary.uploader.upload(video.tempFilePath, {
        folder: 'products/videos',
        resource_type: 'video',
      });
      videoUrl = uploadedVideo.secure_url;
    }

    // Save to database
    const product = new Product({
      title,
      description,
      price,
      tag,
      subDescription,
      offerCode,
      status,
      category,
      rating,
      imageUrls,
      videoUrl,
    });

    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('❌ Add Product Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ✅ Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name status')
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (error) {
    console.error('❌ Get Products Error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// ✅ Change product status
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const product = await Product.findByIdAndUpdate(id, { status }, { new: true });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Status updated', product });
  } catch (error) {
    console.error('❌ Update Status Error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// ✅ Add image to existing product
const updateProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageFile = req.files.image;

    const uploaded = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: 'products/images',
      resource_type: 'image',
    });

    const product = await Product.findByIdAndUpdate(
      id,
      { $push: { imageUrls: uploaded.secure_url } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Image added successfully', product });
  } catch (error) {
    console.error('❌ Update Image Error:', error);
    res.status(500).json({ error: 'Failed to update product image' });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  updateProductStatus,
  updateProductImage,
};
