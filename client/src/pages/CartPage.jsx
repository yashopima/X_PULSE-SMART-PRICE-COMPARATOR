import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/authContextValue';
import { Trash2, Zap, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizerData, setOptimizerData] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleOptimize = async () => {
    try {
      const res = await api.get('/cart/optimize');
      setOptimizerData(res.data.data);
    } catch (error) {
      console.error('Optimization error:', error);
    }
  };

  const applyOptimization = async (recommendation) => {
    try {
      // Remove old item and add new item
      await api.delete(`/cart/${recommendation.cartItemId}`);
      await api.post('/cart', {
        productId: recommendation.product,
        platformOfferId: recommendation.suggestedOfferId,
        quantity: 1 // Simplifying for now
      });
      setOptimizerData(prev => ({
        ...prev,
        recommendations: prev.recommendations.filter(r => r.cartItemId !== recommendation.cartItemId)
      }));
      fetchCart();
    } catch (error) {
      console.error('Error applying optimization:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      await api.post('/orders/checkout', {
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'MH',
          zipCode: '400001',
          country: 'India'
        }
      });
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (!user) {
    return <div className="text-center py-12"><h2 className="text-2xl font-bold mb-4">Please login to view your cart</h2><Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Login</Link></div>;
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const calculateTotal = () => {
    return cart?.items.reduce((acc, item) => acc + (item.platformOffer?.currentPrice || 0) * item.quantity, 0) || 0;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Unified Smart Cart</h1>
      
      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-600">Your cart is empty.</h2>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm flex items-center border border-gray-100 relative">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-contain mr-6" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{item.product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">Platform: <span className="font-medium text-gray-700">{item.platformOffer.platform}</span></p>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold">₹{item.platformOffer.currentPrice.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                  </div>
                </div>
                <button onClick={() => handleRemove(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-yellow-300" size={24} />
                <h3 className="font-bold text-lg">AI Cart Optimizer</h3>
              </div>
              <p className="text-sm text-blue-100 mb-6">Let AI scan across all platforms to find cheaper alternatives for items in your cart.</p>
              <button onClick={handleOptimize} className="w-full bg-white text-blue-700 font-bold py-3 rounded-xl shadow hover:bg-gray-50 transition-colors">
                Run Optimizer
              </button>
            </div>

            {optimizerData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="font-bold text-yellow-800 mb-2">{optimizerData.message}</h3>
                {optimizerData.recommendations.map((rec) => (
                  <div key={rec.cartItemId} className="bg-white p-3 rounded-lg shadow-sm border border-yellow-100 mt-3 text-sm">
                    <p className="font-medium text-gray-800">Switch from {rec.currentPlatform} to {rec.suggestedPlatform}</p>
                    <p className="text-green-600 font-bold mb-2">Save ₹{rec.savings.toLocaleString()}</p>
                    <button onClick={() => applyOptimization(rec)} className="bg-yellow-500 text-white px-3 py-1.5 rounded-md font-medium text-xs hover:bg-yellow-600 w-full">
                      Apply Switch
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Order Summary</h3>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Items ({cart.items.reduce((a,b)=>a+b.quantity, 0)})</span>
                <span>₹{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-4 text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-4 mb-6 flex justify-between items-end">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">₹{calculateTotal().toLocaleString()}</span>
              </div>
              <button onClick={handleCheckout} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
