const mongoose = require('mongoose');

const AutomationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Triggered', 'Failed', 'Disabled'],
    default: 'Active'
  },
  triggeredOrder: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Automation', AutomationSchema);
