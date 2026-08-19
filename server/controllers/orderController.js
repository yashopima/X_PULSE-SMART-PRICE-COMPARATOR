const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Checkout and create order
// @route   POST /api/v1/orders/checkout
// @access  Private
exports.checkout = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.platformOffer');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    // Split items by platform
    const platformGroups = {};
    let grandTotal = 0;

    cart.items.forEach(item => {
      const platform = item.platformOffer.platform;
      if (!platformGroups[platform]) {
        platformGroups[platform] = {
          items: [],
          total: 0
        };
      }

      const price = item.platformOffer.currentPrice;
      platformGroups[platform].items.push({
        product: item.product,
        quantity: item.quantity,
        priceAtPurchase: price
      });
      platformGroups[platform].total += (price * item.quantity);
      grandTotal += (price * item.quantity);
    });

    // Create PlatformOrders array
    const platformOrders = Object.keys(platformGroups).map(platform => ({
      platform,
      platformOrderId: `${platform.substring(0,3).toUpperCase()}-${Math.floor(Math.random() * 100000)}`,
      items: platformGroups[platform].items,
      platformTotal: platformGroups[platform].total,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    }));

    // Create Consolidated Order
    const order = await Order.create({
      user: req.user.id,
      consolidatedOrderId: `PPX-${Date.now()}`,
      platformOrders,
      grandTotal,
      shippingAddress,
      paymentStatus: 'Completed' // Simulated checkout
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/v1/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt').populate('platformOrders.items.product');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
