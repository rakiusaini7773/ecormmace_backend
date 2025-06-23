const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
}, { _id: false });

const helpsWithSchema = new mongoose.Schema({
  icon: { type: String },
  text: { type: String }
}, { _id: false });

const offerSchema = new mongoose.Schema({
  discountType: { type: String, enum: ['Flat', 'Percent'] },
  discountValue: { type: Number },
  couponType: { type: String },
  expiryDate: { type: Date }
}, { _id: false });

const usageRestrictionsSchema = new mongoose.Schema({
  minSpend: Number,
  products: [String]
}, { _id: false });

const usageLimitsSchema = new mongoose.Schema({
  perCoupon: Number,
  perUser: Number
}, { _id: false });

const productSchema = new mongoose.Schema({
  heading: { type: String, required: true, unique: true },
  subHeading: { type: String },
  subDescription: { type: String },
  description: { type: String },

  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },

  imageUrls: [{ type: String }],
  videoUrl: { type: String, default: '' },

  tag: { type: String },
  offerCode: { type: String },

  offers: offerSchema,

  usageRestrictions: usageRestrictionsSchema,
  usageLimits: usageLimitsSchema,

  helpsWith: [helpsWithSchema],
  ingredients: [ingredientSchema],

  text: { type: String },

  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Inactive'
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
