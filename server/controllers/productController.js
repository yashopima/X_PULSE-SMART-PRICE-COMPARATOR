const Product = require('../models/Product');
const PlatformOffer = require('../models/PlatformOffer');
const PriceHistory = require('../models/PriceHistory');
const { fetchLiveProductsFromRapidAPI } = require('../utils/rapidApiHelper');

// Machine Learning Modules
const { forecastPriceTrends } = require('../ml/priceForecaster');
const { detectDeceptivePricing } = require('../ml/anomalyDetector');
const { getSmartRecommendations } = require('../ml/recommender');
const { analyzeProductSentiment } = require('../ml/sentimentAnalyzer');

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

// @desc    Get all products with ML insights
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
      
      const priceDiff = (product.historicalAveragePrice && cheapestOffer)
        ? ((product.historicalAveragePrice - cheapestOffer.currentPrice) / product.historicalAveragePrice) * 100
        : 0;

      let mlBadge = 'Fair Value';
      if (priceDiff >= 10) mlBadge = 'Strong Buy 🔥';
      else if (priceDiff >= 4) mlBadge = 'Great Deal';
      else if (priceDiff <= -8) mlBadge = 'Price High';

      return {
        ...product._doc,
        cheapestPrice: cheapestOffer ? cheapestOffer.currentPrice : product.historicalAveragePrice,
        cheapestPlatform: cheapestOffer ? cheapestOffer.platform : 'Various',
        offersCount: offers.length,
        mlBadge,
        discountPercentage: cheapestOffer ? cheapestOffer.discountPercentage : 0
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

// @desc    Get single product details with ML Forecast, Anomaly & Sentiment Intelligence
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

    const currentPrice = cheapestOffer ? cheapestOffer.currentPrice : (product.historicalAveragePrice || 0);

    // 1. Time-Series Machine Learning Price Forecasting
    const forecast = forecastPriceTrends(history, currentPrice);

    // 2. Statistical Anomaly & Deceptive Pricing Detection
    const historicalPriceValues = history.map(h => h.price);
    const anomaly = detectDeceptivePricing(cheapestOffer, historicalPriceValues, product.historicalAveragePrice);

    // 3. Aspect-Based Review Sentiment & Quality Intelligence
    const sentiment = analyzeProductSentiment(product, offers, forecast);

    // 4. Content-Based Recommendations (AI Smart Alternatives)
    const allOtherProducts = await Product.find({ _id: { $ne: product._id } }).limit(10);
    const otherProductsWithOffers = await Promise.all(allOtherProducts.map(async (p) => {
      const pOffers = await PlatformOffer.find({ product: p._id }).sort('currentPrice');
      return {
        ...p._doc,
        cheapestPrice: pOffers.length > 0 ? pOffers[0].currentPrice : p.historicalAveragePrice,
        cheapestPlatform: pOffers.length > 0 ? pOffers[0].platform : 'Store',
        offersCount: pOffers.length
      };
    }));

    const recommendations = getSmartRecommendations(
      { ...product._doc, cheapestPrice: currentPrice, offersCount: offers.length },
      otherProductsWithOffers,
      3
    );

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
          fakeDiscountDetected: anomaly.fakeDiscountDetected,
          fakeDiscountDetails: anomaly.details,
          deceptionRiskScore: anomaly.deceptionRiskScore,
          trueDiscountPercentage: anomaly.trueDiscountPercentage,
          claimedDiscountPercentage: anomaly.claimedDiscountPercentage,
          inflationPercent: anomaly.inflationPercent,
          prediction: forecast.prediction,
          confidence: forecast.confidence,
          buyScore: forecast.buyScore,
          recommendationBadge: forecast.recommendationBadge,
          dropProbability: forecast.dropProbability,
          expectedChangePercent: forecast.expectedChangePercent,
          volatilityPercent: forecast.volatilityPercent,
          forecastedTrajectory: forecast.forecastedTrajectory,
          rationale: forecast.rationale
        },
        forecast,
        sentiment,
        recommendations
      }
    });
  } catch (err) {
    console.error('Error in getProduct:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get smart AI recommendations for a product
// @route   GET /api/v1/products/:id/recommendations
// @access  Public
exports.getProductRecommendations = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const allProducts = await Product.find({ _id: { $ne: product._id } });
    const allWithOffers = await Promise.all(allProducts.map(async (p) => {
      const pOffers = await PlatformOffer.find({ product: p._id }).sort('currentPrice');
      return {
        ...p._doc,
        cheapestPrice: pOffers.length > 0 ? pOffers[0].currentPrice : p.historicalAveragePrice,
        cheapestPlatform: pOffers.length > 0 ? pOffers[0].platform : 'Store'
      };
    }));

    const recommendations = getSmartRecommendations(product, allWithOffers, 4);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
