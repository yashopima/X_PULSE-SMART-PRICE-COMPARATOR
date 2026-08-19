const mongoose = require('mongoose');

const AIRecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true
  },
  recommendations: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    reason: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AIRecommendation', AIRecommendationSchema);
