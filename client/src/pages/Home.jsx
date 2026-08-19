import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

      console.log('LIVE SEARCH SUCCESS:', res.data);

      setProducts(res.data.data || []);

    } catch (error) {
      console.error('========== LIVE SEARCH ERROR ==========');
      console.error('Message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Server response:', error.response?.data);
      console.error('Full error:', error);
      console.error('======================================');

      alert(
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch live products'
      );

    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Best Deals
          </h1>

          <p className="text-gray-600">
            Compare prices across Amazon, Flipkart, Croma, and Reliance Digital.
          </p>
        </div>

        <form onSubmit={handleLiveSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search live on Amazon..."
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            type="submit"
            disabled={isSearching}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {products.length === 0 && !isSearching && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No products found.
          </div>
        )}

        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col group"
          >
            <Link
              to={`/product/${product._id}`}
              className="relative bg-gray-50 h-56 flex justify-center items-center p-4"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            <div className="p-5 flex flex-col flex-grow">

              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {product.brand}
                </span>
              </div>

              <Link to={`/product/${product._id}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="mt-auto pt-4 border-t border-gray-100">

                <div className="flex justify-between items-end">

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Cheapest on{' '}
                      <span className="font-semibold text-gray-700">
                        {product.cheapestPlatform}
                      </span>
                    </p>

                    <p className="text-xl font-bold text-gray-900">
                      ₹{product.cheapestPrice?.toLocaleString()}
                    </p>
                  </div>

                  <Link
                    to={`/product/${product._id}`}
                    className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Compare
                  </Link>

                </div>

              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Home;
