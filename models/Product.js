const mongoose = require('mongoose');

// HelpsWith schema
const helpsWithSchema = new mongoose.Schema({
  icon: { type: String },
  text: { type: String }
}, { _id: false });

// Offer schema
const offerSchema = new mongoose.Schema({
  discountType: {
    type: String,
    enum: ['Flat', 'Percentage'],
    required: false,
    validate: {
      validator: function (v) {
        return !v || ['Flat', 'Percentage'].includes(v);
      },
      message: props => `${props.value} is not a valid discount type`
    }
  },
  discountValue: { type: Number },
  couponType: { type: String },
  expiryDate: { type: Date },
  source: { type: String }
}, { _id: false });

// Usage Restrictions schema
const usageRestrictionsSchema = new mongoose.Schema({
  minSpend: Number,
  products: [String]
}, { _id: false });

// Usage Limits schema
const usageLimitsSchema = new mongoose.Schema({
  perCoupon: Number,
  perUser: Number
}, { _id: false });

// Main Product schema
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

  text: { type: String },
  ingredientText: { type: String },
  for: { type: String },

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
