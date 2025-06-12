// backend/config/cloudinary.js
const cloudinaryModule = require('cloudinary');
const dotenv = require('dotenv');
dotenv.config();

const cloudinary = cloudinaryModule.v2; // Correct v2 usage

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = { cloudinary };
