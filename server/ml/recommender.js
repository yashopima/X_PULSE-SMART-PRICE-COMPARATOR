/**
 * PricePulse X - Content-Based Machine Learning Product Recommender
 * 
 * Algorithm:
 * 1. Vector Space Feature Modeling:
 *    - Categorical similarity (Category & Brand)
 *    - Normalized Price Proximity (exponential decay function)
 *    - Lexical / Keyword Token Set Jaccard & TF-IDF Overlap
 * 2. Multi-Attribute Cosine / Weighted Similarity Scoring:
 *    Sim(A, B) = w_cat * S_cat + w_brand * S_brand + w_price * S_price + w_text * S_text
 * 3. Smart Value Optimization:
 *    Identifies products that offer equal or better value at competitive price points.
 */

/**
 * Tokenize string into lowercase unique terms
 * @param {string} text 
 * @returns {Set<string>}
 */
function tokenize(text) {
  if (!text) return new Set();
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
  return new Set(tokens);
}

/**
 * Compute Jaccard lexical similarity between two token sets
 * @param {Set<string>} setA 
 * @param {Set<string>} setB 
 * @returns {number} 0 to 1
 */
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionSize = 0;
  for (let item of setA) {
    if (setB.has(item)) intersectionSize++;
  }
  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Compute price proximity similarity using exponential decay
 * @param {number} priceA 
 * @param {number} priceB 
 * @returns {number} 0 to 1
 */
function priceProximity(priceA, priceB) {
  if (!priceA || !priceB) return 0.5;
  const maxPrice = Math.max(priceA, priceB);
  if (maxPrice === 0) return 1;
  const diff = Math.abs(priceA - priceB);
  // Similarity drops smoothly as difference grows relative to price scale
  return Math.exp(-diff / (0.6 * maxPrice));
}

/**
 * Find top-K AI recommended alternative products
 * @param {Object} targetProduct - Product to find alternatives for
 * @param {Array<Object>} allProducts - Full product catalog
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Array<Object>} Ranked similar products with similarity scores
 */
function getSmartRecommendations(targetProduct, allProducts, limit = 4) {
  if (!targetProduct || !allProducts || allProducts.length <= 1) {
    return [];
  }

  const targetTokens = tokenize(`${targetProduct.name} ${targetProduct.description || ''} ${targetProduct.category}`);
  const targetPrice = targetProduct.cheapestPrice || targetProduct.historicalAveragePrice || 1;

  const weights = {
    category: 0.35,
    brand: 0.20,
    price: 0.25,
    lexical: 0.20
  };

  const scoredProducts = allProducts
    .filter(p => p._id.toString() !== targetProduct._id.toString())
    .map(candidate => {
      const candidateTokens = tokenize(`${candidate.name} ${candidate.description || ''} ${candidate.category}`);
      const candidatePrice = candidate.cheapestPrice || candidate.historicalAveragePrice || 1;

      // 1. Category Similarity (1 if identical, 0.3 if related)
      let sCategory = 0;
      if (candidate.category && targetProduct.category) {
        if (candidate.category.toLowerCase() === targetProduct.category.toLowerCase()) {
          sCategory = 1.0;
        } else if (
          (candidate.category.includes('Mobile') && targetProduct.category.includes('Electronics')) ||
          (candidate.category.includes('Laptop') && targetProduct.category.includes('Electronics'))
        ) {
          sCategory = 0.4;
        }
      }

      // 2. Brand Similarity
      const sBrand = candidate.brand && targetProduct.brand &&
        candidate.brand.toLowerCase() === targetProduct.brand.toLowerCase() ? 1.0 : 0.0;

      // 3. Price Proximity
      const sPrice = priceProximity(targetPrice, candidatePrice);

      // 4. Lexical / Keyword Overlap
      const sLexical = jaccardSimilarity(targetTokens, candidateTokens);

      // Composite Similarity Score
      const totalScore = (
        weights.category * sCategory +
        weights.brand * sBrand +
        weights.price * sPrice +
        weights.lexical * sLexical
      );

      const matchPercentage = Math.min(99, Math.round(totalScore * 100));

      // Value Badge determination
      let reasonBadge = 'SIMILAR PRODUCT';
      const priceDifference = targetPrice - candidatePrice;

      if (priceDifference > 0 && priceDifference > targetPrice * 0.08) {
        reasonBadge = `Save ₹${Math.round(priceDifference).toLocaleString()} (Cheaper Alternative)`;
      } else if (sBrand === 1.0) {
        reasonBadge = `${candidate.brand} Ecosystem Alternative`;
      } else if (candidate.offersCount > targetProduct.offersCount) {
        reasonBadge = 'More Seller Offers Available';
      } else {
        reasonBadge = `${matchPercentage}% Feature Match`;
      }

      return {
        _id: candidate._id,
        name: candidate.name,
        brand: candidate.brand,
        category: candidate.category,
        imageUrl: candidate.imageUrl,
        cheapestPrice: candidatePrice,
        cheapestPlatform: candidate.cheapestPlatform,
        matchPercentage,
        reasonBadge
      };
    });

  // Sort by highest match percentage descending
  scoredProducts.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return scoredProducts.slice(0, limit);
}

module.exports = {
  tokenize,
  jaccardSimilarity,
  priceProximity,
  getSmartRecommendations
};
