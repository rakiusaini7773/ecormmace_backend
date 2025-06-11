const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true }, // Cloudinary image URL
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // status instead of Boolean
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
