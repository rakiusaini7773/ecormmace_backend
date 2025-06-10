const Category = require('../models/Category');

// POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, iconUrl, active = true } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name, iconUrl, active });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
