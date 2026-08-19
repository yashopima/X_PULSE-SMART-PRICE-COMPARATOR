const mongoose = require('mongoose');

const PriceHistorySchema = new mongoose.Schema({
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
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// To easily query price history by product and date
PriceHistorySchema.index({ product: 1, date: -1 });

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);
