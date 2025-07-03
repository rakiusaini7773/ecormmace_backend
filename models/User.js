// models/User.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  company: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  province: String,
  country: String,
  zipCode: String,
  phone: String,
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  role: { type: String, default: 'user' },
  phonenumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
  },
  addresses: [addressSchema],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
