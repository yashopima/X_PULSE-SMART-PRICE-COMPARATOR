import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { TrendingDown, ShieldAlert, CheckCircle2, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
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

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!product) {
    return <div className="text-center py-12 text-gray-500">Product not found</div>;
  }

  const { offers, comparison, analysis, history } = product;
  const { cheapestOffer } = comparison;

  // Format history data for chart
  const formattedHistory = history.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    price: item.price,
    platform: item.platform
  }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 p-8 bg-gray-50 flex justify-center items-center">
            <img src={product.imageUrl} alt={product.name} className="max-h-96 object-contain mix-blend-multiply" />
          </div>
          <div className="md:w-3/5 p-8 flex flex-col justify-center">
            <div className="uppercase tracking-wider text-sm text-blue-600 font-semibold mb-2">{product.brand}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            {/* AI Analysis Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className={`p-4 rounded-xl border ${analysis.prediction === 'Buy Now' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className={analysis.prediction === 'Buy Now' ? 'text-green-600' : 'text-yellow-600'} size={20} />
                  <h3 className="font-semibold text-gray-900">AI Recommendation</h3>
                </div>
                <p className="text-lg font-bold">{analysis.prediction}</p>
                <p className="text-sm text-gray-600">Confidence: {analysis.confidence}%</p>
              </div>

              {analysis.fakeDiscountDetected ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="text-red-600" size={20} />
                    <h3 className="font-semibold text-red-900">Fake Discount Warning</h3>
                  </div>
                  <p className="text-sm text-red-700">{analysis.fakeDiscountDetails}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-blue-900">Genuine Deal</h3>
                  </div>
                  <p className="text-sm text-blue-700">Prices are aligned with historical averages.</p>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex items-end justify-between border-t pt-6">
                <div>
                  <p className="text-gray-500 mb-1">Best Price Available</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-gray-900">₹{cheapestOffer.currentPrice.toLocaleString()}</span>
                    {cheapestOffer.discountPercentage > 0 && (
                      <span className="text-lg text-gray-500 line-through mb-1">₹{cheapestOffer.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <p className="text-sm text-green-600 font-medium mt-1">Save ₹{comparison.priceDifference.toLocaleString()} across platforms</p>
                </div>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                  <ShoppingCart size={20} /> Add to Smart Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Price History (Last 30 Days)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" minTickGap={30} />
                <YAxis domain={['auto', 'auto']} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Price']} labelFormatter={(label) => `Date: ${label}`} />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Compare Sellers</h2>
          <div className="space-y-4">
            {offers.sort((a,b)=>a.currentPrice - b.currentPrice).map((offer, idx) => (
              <div key={offer._id} className={`p-4 rounded-xl border ${idx === 0 ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">{offer.platform}</span>
                  {idx === 0 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">BEST DEAL</span>}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">₹{offer.currentPrice.toLocaleString()}</span>
                    {offer.discountPercentage > 0 && <span className="ml-2 text-sm text-red-500 font-medium">-{offer.discountPercentage}%</span>}
                  </div>
                  <a href={offer.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">View Store</a>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex justify-between">
                  <span>Rating: {offer.sellerRating} ⭐</span>
                  <span>Delivery: {offer.deliveryTimeDays} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
