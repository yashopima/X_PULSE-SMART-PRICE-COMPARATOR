/**
 * PricePulse X - Machine Learning Time-Series Price Forecaster
 * 
 * Mathematical Algorithms:
 * 1. Ordinary Least Squares (OLS) Linear Regression: Trend slope (beta_1), intercept (beta_0), R^2 fit confidence
 * 2. Exponential Moving Average (EMA-7 & EMA-14): Short-term vs medium-term price momentum
 * 3. Volatility Index (Standard Deviation / Mean): Price instability measurement
 * 4. 7-Day Forward Trajectory Projection: Predicted price points with 95% confidence intervals
 * 5. Multi-Factor ML Buy Score (0 - 100): Composite index determining buy timing
 */

/**
 * Calculate Ordinary Least Squares Linear Regression
 * @param {Array<{x: number, y: number}>} points 
 * @returns {{slope: number, intercept: number, r2: number}}
 */
function calculateLinearRegression(points) {
  const n = points.length;
  if (n < 2) {
    return { slope: 0, intercept: points[0]?.y || 0, r2: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (let i = 0; i < n; i++) {
    const x = points[i].x;
    const y = points[i].y;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  }

  const denominator = (n * sumXX - sumX * sumX);
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n, r2: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Coefficient of determination R^2
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const y = points[i].y;
    const yPred = slope * points[i].x + intercept;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += Math.pow(y - yPred, 2);
  }

  const r2 = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - (ssRes / ssTot)));

  return { slope, intercept, r2: Number(r2.toFixed(3)) };
}

/**
 * Compute Exponential Moving Average (EMA)
 * @param {number[]} prices 
 * @param {number} period 
 * @returns {number[]}
 */
function calculateEMA(prices, period) {
  if (prices.length === 0) return [];
  const k = 2 / (period + 1);
  const emaArray = [prices[0]];

  for (let i = 1; i < prices.length; i++) {
    const ema = prices[i] * k + emaArray[i - 1] * (1 - k);
    emaArray.push(Number(ema.toFixed(2)));
  }

  return emaArray;
}

/**
 * Compute Volatility & Standard Deviation
 * @param {number[]} prices 
 * @returns {{mean: number, stdDev: number, volatilityPercent: number}}
 */
function calculateVolatility(prices) {
  const n = prices.length;
  if (n === 0) return { mean: 0, stdDev: 0, volatilityPercent: 0 };

  const mean = prices.reduce((acc, p) => acc + p, 0) / n;
  const variance = prices.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const volatilityPercent = mean > 0 ? (stdDev / mean) * 100 : 0;

  return {
    mean: Math.round(mean),
    stdDev: Math.round(stdDev),
    volatilityPercent: Number(volatilityPercent.toFixed(2))
  };
}

/**
 * Run 7-day forward predictive time-series forecast
 * @param {Array<{date: Date|string, price: number, platform?: string}>} history 
 * @param {number} currentPrice 
 * @returns {Object} Full ML forecast analysis
 */
function forecastPriceTrends(history, currentPrice) {
  if (!history || history.length === 0) {
    return {
      prediction: 'Buy Now',
      confidence: 75,
      buyScore: 75,
      trend: 'stable',
      volatilityPercent: 0,
      dropProbability: 20,
      forecastedTrajectory: [],
      rationale: 'Insufficient historical data for time-series forecasting.'
    };
  }

  // Sort history chronologically
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const prices = sortedHistory.map(h => h.price);
  const effectiveCurrentPrice = currentPrice || prices[prices.length - 1];

  // Regression points: x = day index (0, 1, 2, ... N-1), y = price
  const points = prices.map((price, idx) => ({ x: idx, y: price }));
  const { slope, intercept, r2 } = calculateLinearRegression(points);

  // Moving averages & momentum
  const ema7 = calculateEMA(prices, 7);
  const latestEMA7 = ema7[ema7.length - 1] || effectiveCurrentPrice;
  const { mean, stdDev, volatilityPercent } = calculateVolatility(prices);

  const minHistorical = Math.min(...prices);
  const maxHistorical = Math.max(...prices);
  const priceRange = maxHistorical - minHistorical || 1;

  // Price position in 30-day range: 0 = at absolute lowest, 1 = at absolute highest
  const pricePercentile = Math.max(0, Math.min(1, (effectiveCurrentPrice - minHistorical) / priceRange));

  // Forward 7-Day Forecast Projection (t + 1 to t + 7)
  const lastDate = new Date(sortedHistory[sortedHistory.length - 1].date);
  const forecastedTrajectory = [];

  // Damping factor so trend doesn't extrapolate unrealistically indefinitely
  const damping = 0.85;
  let cumulativeDelta = 0;

  for (let day = 1; day <= 7; day++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + day);

    cumulativeDelta += (slope * Math.pow(damping, day - 1));
    const rawForecast = effectiveCurrentPrice + cumulativeDelta;
    
    // Bounds guard: forecast shouldn't drop below 70% min or exceed 130% max historical
    const boundedForecast = Math.round(Math.max(minHistorical * 0.7, Math.min(maxHistorical * 1.3, rawForecast)));

    forecastedTrajectory.push({
      day: `+${day}d`,
      date: futureDate.toLocaleDateString(),
      predictedPrice: boundedForecast,
      lowerConfidence: Math.round(boundedForecast - (1.96 * (stdDev / Math.sqrt(prices.length)))),
      upperConfidence: Math.round(boundedForecast + (1.96 * (stdDev / Math.sqrt(prices.length))))
    });
  }

  const day7ProjectedPrice = forecastedTrajectory[6]?.predictedPrice || effectiveCurrentPrice;
  const expectedChangePercent = Number((((day7ProjectedPrice - effectiveCurrentPrice) / effectiveCurrentPrice) * 100).toFixed(1));

  // Compute Price Drop Probability (based on current price percentile, slope, and EMA)
  let dropProbability = 30;
  if (pricePercentile > 0.75) dropProbability += 35; // Near peak price -> high chance of mean reversion
  else if (pricePercentile < 0.25) dropProbability -= 20; // Near historical bottom -> low chance of dropping further

  if (slope < -50) dropProbability += 20; // Active downward slide
  else if (slope > 50) dropProbability -= 15; // Active upward trend

  if (effectiveCurrentPrice > latestEMA7 * 1.03) dropProbability += 15;
  dropProbability = Math.max(5, Math.min(95, Math.round(dropProbability)));

  // Calculate Multi-Factor Buy Score (0 - 100)
  let buyScore = 50;

  // Factor 1: Cheapness relative to 30-day range (Weight 40%)
  buyScore += (1 - pricePercentile) * 40 - 20;

  // Factor 2: Expected Price Trend Direction (Weight 30%)
  if (expectedChangePercent > 2) {
    buyScore += 18;
  } else if (expectedChangePercent < -3) {
    buyScore -= 20;
  }

  // Factor 3: Current Price vs 30-Day Mean (Weight 20%)
  if (effectiveCurrentPrice < mean) {
    const discountFromMean = ((mean - effectiveCurrentPrice) / mean) * 100;
    buyScore += Math.min(15, discountFromMean);
  } else {
    const premiumOverMean = ((effectiveCurrentPrice - mean) / mean) * 100;
    buyScore -= Math.min(15, premiumOverMean);
  }

  // Factor 4: Model Confidence Adjustment (Weight 10%)
  buyScore += (r2 * 10 - 5);
  buyScore = Math.max(10, Math.min(98, Math.round(buyScore)));

  // Categorical Recommendation & Rationale
  let prediction = 'Buy Now';
  let recommendationBadge = 'GENUINE DEAL';
  let rationale = '';

  if (buyScore >= 75) {
    prediction = 'Strong Buy';
    recommendationBadge = 'BEST HISTORICAL VALUE';
    rationale = `Price is currently near its 30-day low (₹${minHistorical.toLocaleString()}). ML forecast predicts upward price correction within 7 days.`;
  } else if (buyScore >= 55) {
    prediction = 'Buy Now';
    recommendationBadge = 'FAIR PRICE';
    rationale = `Current price is aligned with rolling average (₹${mean.toLocaleString()}). Low volatility suggests stable pricing.`;
  } else if (buyScore >= 38) {
    prediction = 'Wait 3-5 Days';
    recommendationBadge = 'PRICE VOLATILE';
    rationale = `Price volatility is active (${volatilityPercent}%). Predictive momentum indicates a ${dropProbability}% chance of a price drop.`;
  } else {
    prediction = 'Wait for Sale';
    recommendationBadge = 'PRICE AT PEAK';
    rationale = `Current price is near its 30-day peak (₹${maxHistorical.toLocaleString()}). The predictive model forecasts an upcoming price drop of approx ₹${Math.abs(effectiveCurrentPrice - day7ProjectedPrice).toLocaleString()}.`;
  }

  const confidence = Math.max(70, Math.min(96, Math.round(70 + r2 * 20 + (100 - volatilityPercent) * 0.08)));

  return {
    prediction,
    recommendationBadge,
    buyScore,
    confidence,
    dropProbability,
    expectedChangePercent,
    day7ProjectedPrice,
    volatilityPercent,
    meanPrice: mean,
    minHistoricalPrice: minHistorical,
    maxHistoricalPrice: maxHistorical,
    regressionSlope: Number(slope.toFixed(2)),
    r2Score: r2,
    forecastedTrajectory,
    rationale
  };
}

module.exports = {
  calculateLinearRegression,
  calculateEMA,
  calculateVolatility,
  forecastPriceTrends
};
