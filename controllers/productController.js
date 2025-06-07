const Product = require('../models/Product');
const Category = require('../models/Category');

exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, categoryId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const image = req.files['image']?.[0]?.path || '';
    const video = req.files['video']?.[0]?.path || '';
    const poster = req.files['poster']?.[0]?.path || '';

    const product = new Product({
      title,
      description,
      price,
      image,
      video,
      poster,
      category: category._id
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId }).populate('category');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};