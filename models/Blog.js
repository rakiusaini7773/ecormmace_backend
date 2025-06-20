const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true }, // rich HTML content
  imageUrl: { type: String, required: true },    // thumbnail image (Cloudinary)
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true }); // adds createdAt and updatedAt

module.exports = mongoose.model('Blog', blogSchema);
