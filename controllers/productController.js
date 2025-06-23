const Product = require('../models/Product');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

// @desc    Add a new product
// @route   POST /api/products/add
// @access  Admin
exports.addProduct = async (req, res) => {
  try {
    const {
      heading,
      subHeading,
      subDescription,
      description,
      price,
      rating,
      tag,
      offerCode,
      videoUrl,
      category,
      helpsWith,
      ingredients,
      text,
      offers,
      usageRestrictions,
      usageLimits,
      status
    } = req.body;

    if (!heading || !price || !category) {
      return res.status(400).json({ message: 'Heading, price, and category are required.' });
    }

    const categoryExists = await Category.findOne({ _id: category, status: 'Active' });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found or inactive.' });
    }

    if (offerCode) {
      const existingProduct = await Product.findOne({ offerCode });
      if (existingProduct) {
        return res.status(409).json({ message: 'Offer code already exists.' });
      }
    }

    let imageUrls = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const file of files) {
        const upload = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'products',
        });
        imageUrls.push(upload.secure_url);
      }
    }

    let finalVideoUrl = videoUrl;
    if (req.files && req.files.video) {
      const videoUpload = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
        folder: 'products/videos',
        resource_type: 'video',
      });
      finalVideoUrl = videoUpload.secure_url;
    }

    // Safe parsing of inputs
    const parsedHelpsWith = helpsWith
      ? (typeof helpsWith === 'string' ? JSON.parse(helpsWith) : helpsWith)
      : [];

    const parsedIngredients = ingredients
      ? (typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients)
      : [];

    const parsedOffers = offers
      ? (typeof offers === 'string' ? JSON.parse(offers) : offers)
      : {};

    const parsedUsageRestrictions = usageRestrictions
      ? (typeof usageRestrictions === 'string' ? JSON.parse(usageRestrictions) : usageRestrictions)
      : {};

    const parsedUsageLimits = usageLimits
      ? (typeof usageLimits === 'string' ? JSON.parse(usageLimits) : usageLimits)
      : {};

    // Upload helpsWith icons if provided
    const helpsWithFinal = [];
    for (let i = 0; i < parsedHelpsWith.length; i++) {
      let iconUrl = parsedHelpsWith[i].icon || '';
      const iconField = `helpsWithIcons${i}`;
      if (req.files && req.files[iconField]) {
        const iconFile = req.files[iconField];
        const upload = await cloudinary.uploader.upload(iconFile.tempFilePath, {
          folder: 'products/icons'
        });
        iconUrl = upload.secure_url;
      }
      helpsWithFinal.push({ text: parsedHelpsWith[i].text, icon: iconUrl });
    }

    const product = new Product({
      heading,
      subHeading,
      subDescription,
      description,
      price,
      rating,
      tag,
      offerCode,
      videoUrl: finalVideoUrl,
      category,
      imageUrls,
      helpsWith: helpsWithFinal,
      ingredients: parsedIngredients,
      text,
      offers: parsedOffers,
      usageRestrictions: parsedUsageRestrictions,
      usageLimits: parsedUsageLimits,
      status: status || 'Inactive',
    });

    await product.save();

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error('❌ Add Product Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// @desc    Get all products
// @route   GET /api/products
// @access  Public/Admin
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name status imageUrl')
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Toggle product status
// @route   PUT /api/products/:id/status
// @access  Admin
exports.toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.status = product.status === 'Active' ? 'Inactive' : 'Active';
    await product.save();

    res.status(200).json({ message: 'Product status updated', status: product.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update product image (replace all images)
exports.updateProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    let imageUrls = [];

    if (!req.files || !req.files.images) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

    for (const file of files) {
      const upload = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'products',
      });
      imageUrls.push(upload.secure_url);
    }

    const updated = await Product.findByIdAndUpdate(id, { imageUrls }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product image(s) updated', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};