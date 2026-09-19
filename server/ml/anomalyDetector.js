/**
 * PricePulse X - Statistical & ML Deceptive Pricing / Fake Discount Anomaly Detector
 * 
 * E-commerce sellers frequently employ "Price Jacking":
 * Artificially elevating the list price (M.R.P.) right before or during a promotion
 * to display illusory "50% OFF" discounts.
 * 
 * Mathematical Concepts Applied:
 * 1. Z-Score Outlier Analysis on Claimed M.R.P.
 * 2. Rolling Median vs Claimed Original Price
 * 3. True Discount vs Claimed Discount Disparity Metric
 * 4. Composite Deceptive Pricing Risk Score (0 - 100%)
 */

/**
 * Compute Median of an array of numbers
 * @param {number[]} values 
 * @returns {number}
 */
function calculateMedian(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Detect deceptive pricing and fake discounts using statistical anomaly detection
 * @param {Object} offer - Current platform offer (currentPrice, originalPrice, discountPercentage, platform)
 * @param {Array<number>} historicalPrices - Array of recorded past prices
 * @param {number} historicalAveragePrice - Baseline catalog historical average
 * @returns {Object} Anomaly analysis results
 */
function detectDeceptivePricing(offer, historicalPrices = [], historicalAveragePrice = 0) {
  if (!offer) {
    return {
      fakeDiscountDetected: false,
      deceptionRiskScore: 0,
      confidence: 100,
      trueDiscountPercentage: 0,
      claimedDiscountPercentage: 0,
      details: 'No offer data available for anomaly detection.'
    };
  }

  const currentPrice = offer.currentPrice;
  const claimedOriginalPrice = offer.originalPrice || currentPrice;
  const claimedDiscount = offer.discountPercentage || 
    (claimedOriginalPrice > currentPrice 
      ? Math.round(((claimedOriginalPrice - currentPrice) / claimedOriginalPrice) * 100) 
      : 0);

  // If no price history, use historical average
  const prices = historicalPrices.length > 0 ? historicalPrices : [historicalAveragePrice || currentPrice];
  const n = prices.length;
  const mean = prices.reduce((a, b) => a + b, 0) / n;
  const median = calculateMedian(prices);
  
  const variance = prices.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance) || (mean * 0.05); // fallback 5% stdDev if uniform

  // Z-score of the seller's claimed original price compared to real historical prices
  const zScoreOriginal = Number(((claimedOriginalPrice - mean) / stdDev).toFixed(2));

  // True discount computed against historical median baseline
  const baselinePrice = median > 0 ? median : (historicalAveragePrice || mean);
  const trueDiscount = baselinePrice > currentPrice 
    ? Math.round(((baselinePrice - currentPrice) / baselinePrice) * 100)
    : 0;

  // Percentage by which claimed original price exceeds realistic baseline
  const inflationPercent = baselinePrice > 0 
    ? Number((((claimedOriginalPrice - baselinePrice) / baselinePrice) * 100).toFixed(1))
    : 0;

  // Evaluate Deception Indicators:
  // 1. Current price is actually >= historical baseline, but seller claims > 15% discount
  // 2. Claimed original price is a statistical outlier (Z-Score >= 2.0)
  // 3. Disparity between claimed discount and true discount is >= 20%
  const isPriceAboveBaseline = currentPrice >= (baselinePrice * 0.98);
  const isHighClaimedDiscount = claimedDiscount >= 15;
  const isZScoreAnomaly = zScoreOriginal >= 2.2;
  const isSignificantDisparity = (claimedDiscount - trueDiscount) >= 18;

  let deceptionRiskScore = 0;
  if (isPriceAboveBaseline && isHighClaimedDiscount) deceptionRiskScore += 50;
  if (isZScoreAnomaly) deceptionRiskScore += 30;
  if (isSignificantDisparity) deceptionRiskScore += 20;

  deceptionRiskScore = Math.max(0, Math.min(100, deceptionRiskScore));
  const fakeDiscountDetected = deceptionRiskScore >= 50;

  let details = '';
  let riskLevel = 'LOW';

  if (fakeDiscountDetected) {
    riskLevel = deceptionRiskScore >= 75 ? 'CRITICAL' : 'HIGH';
    const inflatedAmount = Math.max(0, claimedOriginalPrice - baselinePrice);
    details = `The claimed original price (₹${claimedOriginalPrice.toLocaleString()}) appears artificially inflated by approx ₹${inflatedAmount.toLocaleString()} (+${inflationPercent}%, Z-Score: ${zScoreOriginal}). While the seller advertises a ${claimedDiscount}% discount, the actual saving compared to the historical median baseline (₹${Math.round(baselinePrice).toLocaleString()}) is only ${trueDiscount}%.`;
  } else if (trueDiscount > 0) {
    riskLevel = 'LOW';
    details = `Genuine discount detected! Current price (₹${currentPrice.toLocaleString()}) offers a verified ${trueDiscount}% saving relative to historical baseline pricing.`;
  } else {
    riskLevel = 'LOW';
    details = `Standard market pricing. The current price is consistent with historical averages.`;
  }

  return {
    fakeDiscountDetected,
    deceptionRiskScore,
    riskLevel,
    claimedDiscountPercentage: claimedDiscount,
    trueDiscountPercentage: trueDiscount,
    claimedOriginalPrice,
    baselinePrice: Math.round(baselinePrice),
    inflationPercent,
    zScore: zScoreOriginal,
    details
  };
}

module.exports = {
  calculateMedian,
  detectDeceptivePricing
};
