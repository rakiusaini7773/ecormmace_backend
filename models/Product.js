// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  tag: { type: String },
  subDescription: { type: String },
  offerCode: { type: String },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
  },
  image: { type: String, required: true },
  videoUrl: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
