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
  productQuantity: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
  },
}, { timestamps: true });

module.exports = mongoose.model('OfferCard', offerCardSchema);
