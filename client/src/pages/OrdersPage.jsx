import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/authContextValue';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  if (!user) return <div className="text-center py-12">Please login to view orders.</div>;
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-600">No orders placed yet.</h2>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Consolidated Order ID</p>
                  <p className="text-gray-900 font-bold">{order.consolidatedOrderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Placed On</p>
                  <p className="text-gray-900 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Total Amount</p>
                  <p className="text-gray-900 font-bold text-lg">₹{order.grandTotal.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Platform Sub-Orders</h3>
                <div className="space-y-4">
                  {order.platformOrders.map((platformOrder, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                          {platformOrder.platform}
                        </span>
                        <p className="text-sm text-gray-500">Order ID: {platformOrder.platformOrderId}</p>
                      </div>
                      
                      <div className="flex-grow">
                        {platformOrder.items.map((item, i) => (
                          <p key={i} className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name}</p>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {platformOrder.status === 'Processing' && <Clock size={16} className="text-yellow-500" />}
                        {platformOrder.status === 'Shipped' && <Truck size={16} className="text-blue-500" />}
                        {platformOrder.status === 'Delivered' && <CheckCircle size={16} className="text-green-500" />}
                        <span className={`text-sm font-semibold ${platformOrder.status === 'Processing' ? 'text-yellow-600' : 'text-gray-700'}`}>
                          {platformOrder.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
