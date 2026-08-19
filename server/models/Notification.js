const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['PriceDrop', 'OrderUpdate', 'AutomationTriggered', 'System'],
    default: 'System'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    entityType: String, // 'Product', 'Order', etc.
    entityId: mongoose.Schema.ObjectId
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
