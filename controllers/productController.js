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
      text,
      ingredientText,
      for: forValue,
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

    // Upload product images
    let imageUrls = [];
    if (req.files && req.files.productImages) {
      const files = Array.isArray(req.files.productImages)
        ? req.files.productImages
        : [req.files.productImages];

      for (const file of files) {
        const upload = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'products',
        });
        imageUrls.push(upload.secure_url);
      }
    }

    // Upload video
    let finalVideoUrl = videoUrl;
    if (req.files && req.files.videoUrl) {
      const videoUpload = await cloudinary.uploader.upload(req.files.videoUrl.tempFilePath, {
        folder: 'products/videos',
        resource_type: 'video',
      });
      finalVideoUrl = videoUpload.secure_url;
    }

    // Parse JSON fields
    const parsedHelpsWith = helpsWith
      ? (typeof helpsWith === 'string' ? JSON.parse(helpsWith) : helpsWith)
      : [];

    let parsedOffers = {};
    if (offers) {
      parsedOffers = typeof offers === 'string' ? JSON.parse(offers) : offers;

      if (parsedOffers.discountType === '') delete parsedOffers.discountType;
      if (parsedOffers.discountValue === '') delete parsedOffers.discountValue;
      if (parsedOffers.couponType === '') delete parsedOffers.couponType;
      if (parsedOffers.expiryDate === '') delete parsedOffers.expiryDate;
      if (parsedOffers.source === '') delete parsedOffers.source;
    }

    const parsedUsageRestrictions = usageRestrictions
      ? (typeof usageRestrictions === 'string' ? JSON.parse(usageRestrictions) : usageRestrictions)
      : {};

    const parsedUsageLimits = usageLimits
      ? (typeof usageLimits === 'string' ? JSON.parse(usageLimits) : usageLimits)
      : {};

    // Handle helpsWith icon uploads
    const helpsWithFinal = [];
    for (let i = 0; i < parsedHelpsWith.length; i++) {
      let iconUrl = parsedHelpsWith[i].icon || '';
      const iconField = `helpsWithIcons${i}`;

      if (req.files && req.files[iconField]) {
        const iconFile = req.files[iconField];
        const upload = await cloudinary.uploader.upload(iconFile.tempFilePath, {
          folder: 'products/icons',
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
      text,
      ingredientText,
      for: forValue,
      offers: parsedOffers,
      usageRestrictions: parsedUsageRestrictions,
      usageLimits: parsedUsageLimits,
      status: status || 'Inactive',
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (err) {
    console.error('❌ Add Product Error:', err.message);
    res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
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

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

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
      text,
      ingredientText,
      for: forValue,
      offers,
      usageRestrictions,
      usageLimits,
      status,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (offerCode && offerCode !== product.offerCode) {
      const existingProduct = await Product.findOne({ offerCode });
      if (existingProduct) {
        return res.status(409).json({ message: 'Offer code already exists.' });
      }
    }

    // Handle new images
    let imageUrls = product.imageUrls;
    if (req.files && req.files.productImages) {
      const files = Array.isArray(req.files.productImages)
        ? req.files.productImages
        : [req.files.productImages];

      imageUrls = [];
      for (const file of files) {
        const upload = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'products',
        });
        imageUrls.push(upload.secure_url);
      }
    }

    // Handle video upload
    let finalVideoUrl = videoUrl || product.videoUrl;
    if (req.files && req.files.videoUrl) {
      const videoUpload = await cloudinary.uploader.upload(req.files.videoUrl.tempFilePath, {
        folder: 'products/videos',
        resource_type: 'video',
      });
      finalVideoUrl = videoUpload.secure_url;
    }

    // Parse nested fields
    const parsedHelpsWith = helpsWith
      ? (typeof helpsWith === 'string' ? JSON.parse(helpsWith) : helpsWith)
      : [];

    let parsedOffers = {};
    if (offers) {
      parsedOffers = typeof offers === 'string' ? JSON.parse(offers) : offers;

      if (parsedOffers.discountType === '') delete parsedOffers.discountType;
      if (parsedOffers.discountValue === '') delete parsedOffers.discountValue;
      if (parsedOffers.couponType === '') delete parsedOffers.couponType;
      if (parsedOffers.expiryDate === '') delete parsedOffers.expiryDate;
      if (parsedOffers.source === '') delete parsedOffers.source;
    }

    const parsedUsageRestrictions = usageRestrictions
      ? (typeof usageRestrictions === 'string' ? JSON.parse(usageRestrictions) : usageRestrictions)
      : {};

    const parsedUsageLimits = usageLimits
      ? (typeof usageLimits === 'string' ? JSON.parse(usageLimits) : usageLimits)
      : {};

    // Handle helpsWith icons
    const helpsWithFinal = [];
    for (let i = 0; i < parsedHelpsWith.length; i++) {
      let iconUrl = parsedHelpsWith[i].icon || '';
      const iconField = `helpsWithIcons${i}`;
      if (req.files && req.files[iconField]) {
        const iconFile = req.files[iconField];
        const upload = await cloudinary.uploader.upload(iconFile.tempFilePath, {
          folder: 'products/icons',
        });
        iconUrl = upload.secure_url;
      }
      helpsWithFinal.push({ text: parsedHelpsWith[i].text, icon: iconUrl });
    }

    // Update fields
    product.heading = heading || product.heading;
    product.subHeading = subHeading || product.subHeading;
    product.subDescription = subDescription || product.subDescription;
    product.description = description || product.description;
    product.price = price || product.price;
    product.rating = rating || product.rating;
    product.tag = tag || product.tag;
    product.offerCode = offerCode || product.offerCode;
    product.videoUrl = finalVideoUrl;
    product.category = category || product.category;
    product.imageUrls = imageUrls;
    product.helpsWith = helpsWithFinal;
    product.text = text || product.text;
    product.ingredientText = ingredientText || product.ingredientText;
    product.for = forValue || product.for;
    product.offers = parsedOffers;
    product.usageRestrictions = parsedUsageRestrictions;
    product.usageLimits = parsedUsageLimits;
    product.status = status || product.status;

    await product.save();

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error('❌ Update Product Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.deleteOne();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Product Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
