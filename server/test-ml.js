/**
 * Unit Verification Test for PricePulse X Machine Learning Suite
 */
const { forecastPriceTrends, calculateLinearRegression } = require('./ml/priceForecaster');
const { detectDeceptivePricing } = require('./ml/anomalyDetector');
const { getSmartRecommendations } = require('./ml/recommender');
const { analyzeProductSentiment } = require('./ml/sentimentAnalyzer');

console.log('==========================================');
console.log('Testing PricePulse X Machine Learning Modules');
console.log('==========================================\n');

// 1. Test Price Forecaster
const mockHistory = [
  { date: '2026-08-01', price: 89000 },
  { date: '2026-08-05', price: 88000 },
  { date: '2026-08-10', price: 86500 },
  { date: '2026-08-15', price: 85000 },
  { date: '2026-08-20', price: 84000 },
  { date: '2026-08-25', price: 83500 },
  { date: '2026-08-30', price: 83000 }
];

const forecastResult = forecastPriceTrends(mockHistory, 83000);
console.log('1. Price Forecaster Test:');
console.log('   Prediction:', forecastResult.prediction);
console.log('   Buy Score:', forecastResult.buyScore, '/ 100');
console.log('   Confidence:', forecastResult.confidence, '%');
console.log('   R^2 Fit Score:', forecastResult.r2Score);
console.log('   Expected 7d Change:', forecastResult.expectedChangePercent, '%');
console.log('   7-Day Forecast Points Count:', forecastResult.forecastedTrajectory.length);
if (forecastResult.forecastedTrajectory.length === 7 && forecastResult.buyScore > 0) {
  console.log('   [PASS] Price Forecaster functional.\n');
} else {
  console.error('   [FAIL] Price Forecaster failed.');
  process.exit(1);
}

// 2. Test Anomaly Detector (Fake Discount)
const deceptiveOffer = {
  platform: 'Flipkart',
  currentPrice: 85000,
  originalPrice: 130000, // Artificially high MRP
  discountPercentage: 35
};
const normalHistoricalPrices = [84000, 85000, 84500, 86000, 85500, 85000];

const anomalyResult = detectDeceptivePricing(deceptiveOffer, normalHistoricalPrices, 85000);
console.log('2. Anomaly & Deceptive Pricing Detector Test:');
console.log('   Fake Discount Detected:', anomalyResult.fakeDiscountDetected);
console.log('   Deception Risk Score:', anomalyResult.deceptionRiskScore, '%');
console.log('   True Discount:', anomalyResult.trueDiscountPercentage, '%');
console.log('   Claimed Discount:', anomalyResult.claimedDiscountPercentage, '%');
console.log('   MRP Z-Score:', anomalyResult.zScore);
if (anomalyResult.fakeDiscountDetected && anomalyResult.deceptionRiskScore >= 50) {
  console.log('   [PASS] Anomaly Detector successfully caught deceptive markup.\n');
} else {
  console.error('   [FAIL] Anomaly Detector failed.');
  process.exit(1);
}

// 3. Test Recommender Engine
const sampleCatalog = [
  { _id: '1', name: 'Asus ROG Strix G15', brand: 'Asus', category: 'Laptop', cheapestPrice: 85000 },
  { _id: '2', name: 'Acer Predator Helios Neo', brand: 'Acer', category: 'Laptop', cheapestPrice: 82000 },
  { _id: '3', name: 'Lenovo Legion 5', brand: 'Lenovo', category: 'Laptop', cheapestPrice: 87000 },
  { _id: '4', name: 'Apple iPhone 14 Pro Max', brand: 'Apple', category: 'Mobile', cheapestPrice: 135000 }
];

const recommendations = getSmartRecommendations(sampleCatalog[0], sampleCatalog, 3);
console.log('3. Recommender Engine Test:');
console.log('   Recommended Alternatives Count:', recommendations.length);
console.log('   Top Alternative:', recommendations[0]?.name, `(${recommendations[0]?.matchPercentage}% match, ${recommendations[0]?.reasonBadge})`);
if (recommendations.length > 0 && recommendations[0].category === 'Laptop') {
  console.log('   [PASS] Recommender accurately prioritized laptops over mobiles.\n');
} else {
  console.error('   [FAIL] Recommender failed.');
  process.exit(1);
}

// 4. Test Sentiment Analyzer
const sentimentResult = analyzeProductSentiment(sampleCatalog[0], [{ sellerRating: 4.6 }], forecastResult);
console.log('4. Sentiment & Review Intelligence Test:');
console.log('   Overall AI Quality Score:', sentimentResult.overallRating, '/ 10');
console.log('   Aspects Evaluated:', sentimentResult.aspects.map(a => `${a.name}: ${a.score}%`).join(' | '));
if (sentimentResult.overallRating > 7 && sentimentResult.aspects.length === 4) {
  console.log('   [PASS] Sentiment Analyzer functional.\n');
} else {
  console.error('   [FAIL] Sentiment Analyzer failed.');
  process.exit(1);
}

console.log('==========================================');
console.log('ALL 4 ML MODULE TESTS PASSED PERFECTLY!');
console.log('==========================================');
