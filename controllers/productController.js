const Product = require('../models/Product');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

// Add a product
const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      rating,
      tag,
      subDescription,
      offerCode,
      status,
      category,
    } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const imageFile = req.files?.image;
    if (!imageFile) return res.status(400).json({ error: 'Image file is required' });

    const imageUpload = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: 'products/images',
      resource_type: 'image',
    });

    const videoFile = req.files?.video;
    if (!videoFile) return res.status(400).json({ error: 'Video file is required' });

    const videoUpload = await cloudinary.uploader.upload(videoFile.tempFilePath, {
      folder: 'products/videos',
      resource_type: 'video',
    });

    const product = new Product({
      title,
      description,
      price,
      rating,
      tag,
      subDescription,
      offerCode,
      status,
      image: imageUpload.secure_url,
      videoUrl: videoUpload.secure_url,
      category,
    });

    await product.save();

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error(error);
    if (error.code === 11000 && error.keyPattern?.title) {
      return res.status(400).json({ error: 'Product title must be unique' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name status')
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};


// Change product status (Active/Inactive)
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Active or Inactive' });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Status updated successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};
 

// Update product image
const updateProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    const imageFile = req.files?.image;
    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const uploadResult = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: 'products/images',
      resource_type: 'image',
    });

    const product = await Product.findByIdAndUpdate(
      id,
      { image: uploadResult.secure_url },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Image updated successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product image' });
  }
};


module.exports = {
  addProduct,
  getAllProducts,
  updateProductStatus,
  updateProductImage,
};
