const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const file = req.files.image;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'categories',
    });

    // Remove temporary file
    fs.unlinkSync(file.tempFilePath);

    // Save category to DB
    const category = new Category({
      name,
      status,
      imageUrl: result.secure_url,
    });

    await category.save();

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};





// GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// PUT /api/categories/:id/toggle
exports.toggleCategoryActive = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.active = !category.active;
    await category.save();

    res.status(200).json({ message: 'Category status updated', active: category.active });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
