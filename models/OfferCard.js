const mongoose = require('mongoose');

const offerCardSchema = new mongoose.Schema({
  productImage: String,
  tag: String,
  title: String,
  subDescription: String,
  price: Number,
  rating: Number,
  offerCode: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Inactive',
  },
}, { timestamps: true });

module.exports = mongoose.model('OfferCard', offerCardSchema);
