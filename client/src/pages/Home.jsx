import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Sparkles, ShieldCheck, TrendingUp, Cpu, ArrowRight, Bot } from 'lucide-react';

const CATEGORIES = ['All', 'Mobile', 'Laptop', 'Electronics'];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleLiveSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.get(
        `/products/live-search?query=${encodeURIComponent(searchQuery)}`
      );
      setProducts(res.data.data || []);
    } catch (error) {
      alert(
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch live products'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium text-sm">Loading multi-platform price intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Hero AI Highlights Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 lg:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-200 mb-4 border border-white/10">
            <Sparkles size={14} className="text-blue-300" />
            AI & Machine Learning Powered Shopping Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Compare Across 4 Stores.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">
              Predict Price Drops with ML.
            </span>
          </h1>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
            Real-time price comparisons across Amazon, Flipkart, Croma, and Reliance Digital. 
            Equipped with 30-day time-series regression forecasting, deceptive pricing anomaly detection, and vector similarity recommendations.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/ai-assistant"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <Bot size={18} /> Launch AI Shopping Assistant
            </Link>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl"><TrendingUp size={18} className="text-blue-300" /></div>
            <div><p className="text-xs font-bold">7D Price Forecast</p><p className="text-[11px] text-blue-200">Linear regression & EMA</p></div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl"><ShieldCheck size={18} className="text-emerald-300" /></div>
            <div><p className="text-xs font-bold">Fake Discount Radar</p><p className="text-[11px] text-blue-200">Z-score anomaly filter</p></div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl"><Cpu size={18} className="text-purple-300" /></div>
            <div><p className="text-xs font-bold">Smart Alternatives</p><p className="text-[11px] text-blue-200">Cosine similarity</p></div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl"><Sparkles size={18} className="text-amber-300" /></div>
            <div><p className="text-xs font-bold">Sentiment Score</p><p className="text-[11px] text-blue-200">Aspect-based NLP</p></div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Search */}
        <form onSubmit={handleLiveSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search live on Amazon..."
            className="border border-gray-200 bg-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer flex-shrink-0"
          >
            {isSearching ? 'Searching...' : 'Live Search'}
          </button>
        </form>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.length === 0 && !isSearching && (
          <div className="col-span-full text-center text-gray-500 py-16 bg-white rounded-3xl border border-gray-100">
            No products found in this category.
          </div>
        )}

        {filteredProducts.map((product) => {
          const isStrongBuy = product.mlBadge?.includes('Strong Buy');
          const isGreatDeal = product.mlBadge?.includes('Great Deal');

          return (
            <div
              key={product._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <Link
                to={`/product/${product._id}`}
                className="relative bg-gradient-to-b from-gray-50/50 to-white h-56 flex justify-center items-center p-6"
              >
                {product.mlBadge && (
                  <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs ${
                    isStrongBuy 
                      ? 'bg-emerald-600 text-white' 
                      : isGreatDeal 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.mlBadge}
                  </span>
                )}

                {product.offersCount > 1 && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-gray-600 bg-white/80 backdrop-blur px-2 py-0.5 rounded-md border border-gray-200">
                    {product.offersCount} Stores
                  </span>
                )}

                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                />
              </Link>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {product.category}
                  </span>
                </div>

                <Link to={`/product/${product._id}`}>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">
                        Lowest on{' '}
                        <span className="font-bold text-gray-700">
                          {product.cheapestPlatform}
                        </span>
                      </p>
                      <p className="text-xl font-extrabold text-gray-900 tracking-tight">
                        ₹{product.cheapestPrice?.toLocaleString()}
                      </p>
                    </div>

                    <Link
                      to={`/product/${product._id}`}
                      className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      Compare <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
