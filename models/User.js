const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  role: { type: String, default: 'user' },

  addresses: [
    {
      type: {
        type: String,
        enum: ['Home', 'Work', 'Other'],
        default: 'Home'
      },
      addressLine: String,
      city: String,
      state: String,
      zip: String,
      country: String
    }
  ],

  orderHistory: [
    {
      orderId: String,
      date: Date,
      totalAmount: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
