const { cloudinary } = require('../config/cloudinary'); // ✅ Correct import
const OfferCard = require('../models/OfferCard');

// ✅ Create Offer Card
exports.createOffer = async (req, res) => {
  try {
    const {
      tag,
      title,
      subDescription,
      price,
      rating,
      offerCode,
      status,
    } = req.body;

    if (!offerCode) {
      return res.status(400).json({ message: 'Offer code is required' });
    }

    // Check for unique offer code
    const existing = await OfferCard.findOne({ offerCode });
    if (existing) {
      return res.status(409).json({ message: 'Offer code already exists' });
    }

    // Upload image to Cloudinary
    let productImage = '';
    if (req.files && req.files.productImage) {
      const file = req.files.productImage;

      const upload = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'offers',
      });

      productImage = upload.secure_url;
    }

    // Save new offer
    const newOffer = new OfferCard({
      productImage,
      tag,
      title,
      subDescription,
      price,
      rating,
      offerCode,
      status: status || 'Inactive',
    });

    await newOffer.save();

    res.status(201).json({
      message: 'Offer created successfully',
      data: newOffer,
    });
  } catch (err) {
    console.error('❌ Offer Creation Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get All Offers
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await OfferCard.find().sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Offer Status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await OfferCard.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Offer not found' });

    res.status(200).json({ message: 'Status updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
