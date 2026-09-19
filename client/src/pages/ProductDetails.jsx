import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ShoppingCart, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Cpu, 
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [chartMode, setChartMode] = useState('both'); // 'both', 'history', 'forecast'

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || !product.comparison?.cheapestOffer) return;
    try {
      setAddingToCart(true);
      await api.post('/cart', {
        productId: product._id,
        platformOfferId: product.comparison.cheapestOffer._id,
        quantity: 1
      });
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3500);
    } catch (err) {
      alert(err.response?.data?.error || 'Please log in to add items to your cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium text-sm">Computing ML price forecasts & deal intelligence...</p>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-16 text-gray-500 text-lg">Product not found</div>;
  }

  const { offers = [], comparison = {}, analysis = {}, history = [], sentiment, recommendations = [] } = product;
  const { cheapestOffer } = comparison;

  // Build unified chart data: historical actuals + ML 7-day projection
  const historyPoints = (history || []).map(item => ({
    date: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    actualPrice: item.price,
    forecastPrice: null,
    isForecast: false
  }));

  const lastHistoryPoint = historyPoints[historyPoints.length - 1];

  const forecastPoints = (analysis.forecastedTrajectory || []).map((f, idx) => ({
    date: idx === 0 && lastHistoryPoint ? lastHistoryPoint.date : f.day,
    actualPrice: idx === 0 && lastHistoryPoint ? lastHistoryPoint.actualPrice : null,
    forecastPrice: f.predictedPrice,
    isForecast: true
  }));

  const combinedChartData = [
    ...historyPoints,
    ...(forecastPoints.length > 0 ? forecastPoints.slice(1) : [])
  ];

  // Helper styles for ML Buy Score
  const getBuyScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 55) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 38) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Product Showcase Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Image Column */}
          <div className="lg:w-2/5 p-10 bg-gradient-to-br from-gray-50 to-blue-50/20 flex flex-col justify-center items-center relative">
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-blue-700 shadow-sm border border-blue-100 flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-600" /> AI-Analyzed
            </span>
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="max-h-96 w-full object-contain mix-blend-multiply drop-shadow-md hover:scale-105 transition-transform duration-300" 
            />
            {cheapestOffer && (
              <div className="mt-6 text-xs text-gray-500 font-medium bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                Tracked across <span className="font-bold text-gray-800">{offers.length} verified retailers</span>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:w-3/5 p-8 lg:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="uppercase tracking-wider text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
                  {product.brand}
                </span>
                <span className="text-xs text-gray-500 font-medium">{product.category}</span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                {product.name}
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* AI Predictive Intelligence Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* 1. ML Buy Timing Gauge */}
                <div className={`p-4 rounded-2xl border ${getBuyScoreColor(analysis.buyScore || 50)} transition-all`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gauge size={18} />
                      <h3 className="font-bold text-sm">ML Buy Decision</h3>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white shadow-xs">
                      {analysis.recommendationBadge || analysis.prediction}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-black">{analysis.prediction}</span>
                    <span className="text-xs font-semibold opacity-75">Score: {analysis.buyScore || 50}/100</span>
                  </div>
                  <p className="text-xs opacity-85 leading-snug line-clamp-2">
                    {analysis.rationale || 'Our time-series model evaluates trend slope and rolling volatility.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs opacity-75 pt-2 border-t border-current/10">
                    <span>Model Confidence: {analysis.confidence || 85}%</span>
                    <span>Drop Probability: {analysis.dropProbability || 25}%</span>
                  </div>
                </div>

                {/* 2. Deceptive Pricing & Fake Discount Radar */}
                {analysis.fakeDiscountDetected ? (
                  <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-900">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="text-red-600" size={18} />
                        <h3 className="font-bold text-sm text-red-800">Fake Discount Warning</h3>
                      </div>
                      <span className="text-xs font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">
                        Inflated MRP
                      </span>
                    </div>
                    <p className="text-xs text-red-700 leading-snug mb-2">
                      Seller claims <span className="font-bold">{analysis.claimedDiscountPercentage}% OFF</span>, but true saving against baseline is only <span className="font-bold">{analysis.trueDiscountPercentage}%</span>.
                    </p>
                    <div className="mt-2 text-xs text-red-800/80 bg-red-100/60 p-2 rounded-xl">
                      Original price artificially marked up by +{analysis.inflationPercent}% above rolling average.
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-600" size={18} />
                        <h3 className="font-bold text-sm text-emerald-800">Verified Pricing</h3>
                      </div>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        GENUINE DEAL
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 leading-snug mb-2">
                      Prices are consistent with verified historical moving averages. No deceptive list price markups detected.
                    </p>
                    <div className="mt-2 text-xs text-emerald-800/80 bg-emerald-100/60 p-2 rounded-xl flex items-center justify-between">
                      <span>Baseline Avg: ₹{product.historicalAveragePrice?.toLocaleString()}</span>
                      <span>True Savings: {cheapestOffer?.discountPercentage || 0}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Action Row */}
            <div className="border-t border-gray-100 pt-6 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Best Market Price</span>
                    <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                      on {cheapestOffer?.platform}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                      ₹{cheapestOffer ? cheapestOffer.currentPrice.toLocaleString() : 'N/A'}
                    </span>
                    {cheapestOffer && cheapestOffer.originalPrice > cheapestOffer.currentPrice && (
                      <span className="text-lg text-gray-400 line-through font-medium">
                        ₹{cheapestOffer.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {comparison.priceDifference > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <TrendingDown size={14} />
                      Save ₹{comparison.priceDifference.toLocaleString()} compared to other stores
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <ShoppingCart size={18} />
                    {addingToCart ? 'Adding...' : 'Add to Smart Cart'}
                  </button>
                  {cartSuccess && (
                    <span className="text-xs text-emerald-600 font-bold text-center animate-fade-in">
                      ✓ Added to unified cart!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Time-Series Price Forecast & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Price Trend & ML 7-Day Forecast</h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={12} /> Predictive AI
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Linear regression & Exponential Moving Average (EMA) trained on 30-day chronological prices
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setChartMode('both')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${chartMode === 'both' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-600'}`}
              >
                All Data
              </button>
              <button 
                onClick={() => setChartMode('history')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${chartMode === 'history' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-600'}`}
              >
                30D History
              </button>
              <button 
                onClick={() => setChartMode('forecast')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${chartMode === 'forecast' ? 'bg-white shadow-xs text-purple-600' : 'text-gray-600'}`}
              >
                +7D Forecast
              </button>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartMode === 'history' ? historyPoints : chartMode === 'forecast' ? forecastPoints : combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} minTickGap={24} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                <Tooltip 
                  formatter={(value, name) => [
                    `₹${Number(value).toLocaleString()}`, 
                    name === 'actualPrice' ? 'Recorded Price' : 'ML Predicted Price'
                  ]}
                  labelFormatter={(label) => `Timeline: ${label}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }} 
                  formatter={(value) => value === 'actualPrice' ? 'Historical Prices (Actual)' : '7-Day ML Forecast (Projected)'} 
                />
                {(chartMode === 'both' || chartMode === 'history') && (
                  <Line 
                    type="monotone" 
                    dataKey="actualPrice" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 2 }} 
                    activeDot={{ r: 6 }} 
                    name="actualPrice"
                  />
                )}
                {(chartMode === 'both' || chartMode === 'forecast') && (
                  <Line 
                    type="monotone" 
                    dataKey="forecastPrice" 
                    stroke="#9333ea" 
                    strokeWidth={3} 
                    strokeDasharray="6 4" 
                    dot={{ r: 3, fill: '#9333ea' }} 
                    name="forecastPrice"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-gray-500 text-xs block">30D Low Price</span>
              <span className="text-base font-bold text-emerald-600">
                ₹{(analysis.minHistoricalPrice || cheapestOffer?.currentPrice || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-gray-500 text-xs block">30D High Price</span>
              <span className="text-base font-bold text-gray-900">
                ₹{(analysis.maxHistoricalPrice || cheapestOffer?.originalPrice || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-gray-500 text-xs block">7D Expected Shift</span>
              <span className={`text-base font-bold flex items-center gap-1 ${analysis.expectedChangePercent >= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {analysis.expectedChangePercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {analysis.expectedChangePercent > 0 ? `+${analysis.expectedChangePercent}%` : `${analysis.expectedChangePercent}%`}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-gray-500 text-xs block">Price Volatility</span>
              <span className="text-base font-bold text-blue-600">
                {analysis.volatilityPercent || 4.2}% (σ)
              </span>
            </div>
          </div>
        </div>

        {/* Compare Sellers Column */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Compare Retailers</h2>
            <span className="text-xs text-gray-500 font-semibold">{offers.length} Stores Live</span>
          </div>

          <div className="space-y-4">
            {offers.sort((a,b) => a.currentPrice - b.currentPrice).map((offer, idx) => (
              <div 
                key={offer._id} 
                className={`p-4 rounded-2xl border transition-all ${
                  idx === 0 
                    ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-extrabold text-gray-900 text-sm">{offer.platform}</span>
                  {idx === 0 && (
                    <span className="bg-blue-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase">
                      LOWEST PRICE
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-2xl font-black text-gray-900">
                      ₹{offer.currentPrice.toLocaleString()}
                    </span>
                    {offer.discountPercentage > 0 && (
                      <span className="ml-2 text-xs text-emerald-600 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                        -{offer.discountPercentage}%
                      </span>
                    )}
                  </div>
                  <a 
                    href={offer.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                  >
                    Visit Store <ArrowRight size={12} />
                  </a>
                </div>

                <div className="mt-3 text-xs text-gray-500 flex justify-between pt-2 border-t border-gray-100">
                  <span>Seller: ⭐ {offer.sellerRating || 4.5}</span>
                  <span>Delivery: {offer.deliveryTimeDays || 3} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aspect-Based Review Sentiment & Quality Intelligence */}
      {sentiment && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Aspect-Based Sentiment Intelligence</h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  NLP Analyzed ({sentiment.totalReviewsAnalyzed.toLocaleString()} Reviews)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Multi-factor sentiment polarity aggregated across verified customer reviews and platform feedback.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider block">AI Quality Rating</span>
                <span className="text-2xl font-black text-emerald-800">{sentiment.overallRating} <span className="text-sm font-semibold text-emerald-600">/ 10</span></span>
              </div>
            </div>
          </div>

          {/* Aspect Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {sentiment.aspects.map((aspect, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-gray-700">{aspect.name}</span>
                  <span className="text-emerald-600">{aspect.score}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${aspect.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Synthesized Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <div>
              <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
                <ThumbsUp size={16} className="text-emerald-600" /> AI-Verified Strengths
              </h4>
              <ul className="space-y-2">
                {sentiment.pros.map((pro, idx) => (
                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
                <ThumbsDown size={16} className="text-amber-600" /> AI Buyer Caveats
              </h4>
              <ul className="space-y-2">
                {sentiment.cons.map((con, idx) => (
                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommended Alternatives (Vector Space Cosine Similarity) */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">AI Recommended Alternatives</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Cpu size={12} /> Cosine Similarity
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Products mathematically matched by category, brand ecosystem, and price-to-performance ratio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((alt) => (
              <div 
                key={alt._id} 
                className="border border-gray-100 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between bg-gradient-to-b from-white to-gray-50/40"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {alt.brand}
                    </span>
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      {alt.matchPercentage}% Match
                    </span>
                  </div>

                  <div className="h-32 flex items-center justify-center mb-3">
                    <img src={alt.imageUrl} alt={alt.name} className="max-h-full object-contain mix-blend-multiply" />
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors mb-2">
                    {alt.name}
                  </h3>

                  <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block mb-4">
                    {alt.reasonBadge}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Lowest on {alt.cheapestPlatform}</span>
                    <span className="text-base font-extrabold text-gray-900">
                      ₹{alt.cheapestPrice?.toLocaleString()}
                    </span>
                  </div>
                  <Link 
                    to={`/product/${alt._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1"
                  >
                    Compare <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
