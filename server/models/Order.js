const mongoose = require('mongoose');

const PlatformOrderSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['Amazon', 'Flipkart', 'Croma', 'Reliance Digital'],
    required: true
  },
  platformOrderId: {
    type: String, // e.g. AMZ-12345
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    priceAtPurchase: Number
  }],
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  platformTotal: {
    type: Number,
    required: true
  },
  estimatedDelivery: {
    type: Date
  }
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  consolidatedOrderId: {
    type: String, // e.g. PPX-987654321
    required: true,
    unique: true
  },
  platformOrders: [PlatformOrderSchema],
  grandTotal: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
