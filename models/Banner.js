// models/Banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: String,
  link: String,
 status: {
    type: String,
    enum: ['Active', 'Inactive'],
  },
  imageUrl: String, // <-- Add this field
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
