const mongoose = require('mongoose');

// 🛒 Cart Item Subdocument Schema
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
});

// 🛒 Main Cart Schema
const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true // Faster lookup
  },
  items: [cartItemSchema]
}, {
  timestamps: true // createdAt & updatedAt
});

module.exports = mongoose.model('Cart', cartSchema);
