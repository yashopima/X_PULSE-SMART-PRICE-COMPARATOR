const Product = require('../models/Product');
const PlatformOffer = require('../models/PlatformOffer');
const PriceHistory = require('../models/PriceHistory');
const { fetchLiveProductsFromRapidAPI } = require('../utils/rapidApiHelper');

// @desc    Search Live Products from RapidAPI
// @route   GET /api/v1/products/live-search
// @access  Public
exports.searchLiveProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Please provide a search query' });
    }

    // Fetch from RapidAPI
    const liveResults = await fetchLiveProductsFromRapidAPI(query);

    // Process and save to MongoDB
    const processedProducts = [];

    for (let item of liveResults) {
      // Find or create product
      let product = await Product.findOne({ name: item.name });
      if (!product) {
        product = await Product.create({
          name: item.name,
          brand: item.brand,
          category: item.category,
          imageUrl: item.imageUrl,
          historicalAveragePrice: item.originalPrice || item.price
        });
      }

      // Find or create offer
      let offer = await PlatformOffer.findOne({ product: product._id, platform: item.platform });
      
      const discountPercentage = item.originalPrice && item.originalPrice > item.price 
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

      if (!offer) {
        offer = await PlatformOffer.create({
          product: product._id,
          platform: item.platform,
          currentPrice: item.price,
          originalPrice: item.originalPrice || item.price,
          discountPercentage,
          url: item.url,
          inStock: true
        });
      } else {
        // Update price
        offer.currentPrice = item.price;
        offer.originalPrice = item.originalPrice || item.price;
        offer.discountPercentage = discountPercentage;
        offer.lastUpdated = Date.now();
        await offer.save();
      }

      // Add to price history
      await PriceHistory.create({
        product: product._id,
        platform: item.platform,
        price: item.price
      });

      // Prepare response data matching getProducts structure
      processedProducts.push({
        ...product._doc,
        cheapestPrice: offer.currentPrice,
        cheapestPlatform: offer.platform,
        offersCount: 1
      });
    }

    res.status(200).json({
      success: true,
      count: processedProducts.length,
      data: processedProducts
    });

  } catch (err) {
    console.error('Live Search Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch live products' });
  }
};

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    if (req.query.search) {
      query = Product.find({ $text: { $search: req.query.search } });
    } else {
      query = Product.find(reqQuery);
    }

    const products = await query;

    const productsWithOffers = await Promise.all(products.map(async (product) => {
      const offers = await PlatformOffer.find({ product: product._id }).sort('currentPrice');
      const cheapestOffer = offers.length > 0 ? offers[0] : null;
      
      return {
        ...product._doc,
        cheapestPrice: cheapestOffer ? cheapestOffer.currentPrice : null,
        cheapestPlatform: cheapestOffer ? cheapestOffer.platform : null,
        offersCount: offers.length
      };
    }));

    if (req.query.sort === 'price') {
      productsWithOffers.sort((a, b) => a.cheapestPrice - b.cheapestPrice);
    }

    res.status(200).json({
      success: true,
      count: productsWithOffers.length,
      data: productsWithOffers
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single product details
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const offers = await PlatformOffer.find({ product: product._id });
    const history = await PriceHistory.find({ product: product._id }).sort('date');

    let cheapestOffer = offers.length > 0 ? offers[0] : null;
    let highestDiscount = offers.length > 0 ? offers[0] : null;
    
    offers.forEach(offer => {
      if (offer.currentPrice < cheapestOffer.currentPrice) cheapestOffer = offer;
      if (offer.discountPercentage > highestDiscount.discountPercentage) highestDiscount = offer;
    });

    let fakeDiscountDetected = false;
    let fakeDiscountDetails = null;
    if (cheapestOffer && product.historicalAveragePrice) {
      if (cheapestOffer.currentPrice >= product.historicalAveragePrice && cheapestOffer.discountPercentage > 20) {
        fakeDiscountDetected = true;
        fakeDiscountDetails = `The sale price (₹${cheapestOffer.currentPrice}) is not lower than the historical average (₹${product.historicalAveragePrice}), despite claiming a ${cheapestOffer.discountPercentage}% discount.`;
      }
    }

    let prediction = 'Buy Now';
    let confidence = 85;
    if (cheapestOffer && product.historicalAveragePrice) {
      if (cheapestOffer.currentPrice > product.historicalAveragePrice * 1.05) {
        prediction = 'Wait for Sale';
        confidence = 90;
      } else if (cheapestOffer.currentPrice < product.historicalAveragePrice * 0.9) {
        prediction = 'Buy Now';
        confidence = 95;
      } else {
        prediction = 'Wait 7 Days';
        confidence = 60;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...product._doc,
        offers,
        history,
        comparison: {
          cheapestOffer,
          highestDiscount,
          priceDifference: offers.length > 1 ? (Math.max(...offers.map(o => o.currentPrice)) - cheapestOffer.currentPrice) : 0,
        },
        analysis: {
          fakeDiscountDetected,
          fakeDiscountDetails,
          prediction,
          confidence
        }
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
