const Cart = require('../models/Cart');
const PlatformOffer = require('../models/PlatformOffer');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name brand imageUrl category'
      })
      .populate({
        path: 'items.platformOffer',
        select: 'platform currentPrice originalPrice url deliveryTimeDays sellerRating'
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, platformOfferId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if product with same offer exists
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.platformOffer.toString() === platformOfferId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += (quantity || 1);
    } else {
      cart.items.push({
        product: productId,
        platformOffer: platformOfferId,
        quantity: quantity || 1
      });
    }

    await cart.save();
    
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    
    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    AI Cart Optimizer
// @route   GET /api/v1/cart/optimize
// @access  Private
exports.optimizeCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.platformOffer');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const recommendations = [];
    let estimatedSavings = 0;

    for (let item of cart.items) {
      // Find all offers for this product
      const allOffers = await PlatformOffer.find({ product: item.product }).sort('currentPrice');
      
      const currentOffer = item.platformOffer;
      const cheapestOffer = allOffers[0];

      if (cheapestOffer && cheapestOffer._id.toString() !== currentOffer._id.toString() && cheapestOffer.currentPrice < currentOffer.currentPrice) {
        const savings = (currentOffer.currentPrice - cheapestOffer.currentPrice) * item.quantity;
        estimatedSavings += savings;

        recommendations.push({
          cartItemId: item._id,
          product: item.product,
          currentPlatform: currentOffer.platform,
          suggestedPlatform: cheapestOffer.platform,
          currentPrice: currentOffer.currentPrice,
          suggestedPrice: cheapestOffer.currentPrice,
          savings,
          suggestedOfferId: cheapestOffer._id
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        estimatedSavings,
        message: recommendations.length > 0 ? `We found cheaper alternatives! You can save ₹${estimatedSavings}.` : 'Your cart is already optimized!'
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
