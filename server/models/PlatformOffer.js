const mongoose = require('mongoose');

const PlatformOfferSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  platform: {
    type: String,
    enum: ['Amazon', 'Flipkart', 'Croma', 'Reliance Digital'],
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  discountPercentage: {
    type: Number
  },
  inStock: {
    type: Boolean,
    default: true
  },
  url: {
    type: String
  },
  sellerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  deliveryTimeDays: {
    type: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlatformOffer', PlatformOfferSchema);
