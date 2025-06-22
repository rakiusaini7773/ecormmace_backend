const OfferCard = require('../models/OfferCard');
const cloudinary = require('../utils/cloudinary');

// Create Offer
exports.createOffer = async (req, res) => {
  try {
    const {
      tag, title, subDescription,
      price, rating, offerCode, status
    } = req.body;

    if (!offerCode) return res.status(400).json({ message: 'Offer code is required' });

    // Check unique offerCode
    const existing = await OfferCard.findOne({ offerCode });
    if (existing) return res.status(409).json({ message: 'Offer code already exists' });

    let productImage = '';
    if (req.files && req.files.productImage) {
      const file = req.files.productImage;
      const upload = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'offers',
      });
      productImage = upload.secure_url;
    }

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
    res.status(201).json({ message: 'Offer created', data: newOffer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Offers
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await OfferCard.find().sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change Offer Status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await OfferCard.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Offer not found' });

    res.status(200).json({ message: 'Status updated', data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
