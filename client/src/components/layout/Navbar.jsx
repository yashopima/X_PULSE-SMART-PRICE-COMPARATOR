import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContextValue';
import { ShoppingCart, User, Search, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-xs border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-1">
              PricePulse<span className="text-gray-900">X</span>
            </Link>

            <Link 
              to="/ai-assistant" 
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full border border-indigo-200/60 transition-all shadow-2xs"
            >
              <Sparkles size={14} className="text-indigo-600" />
              <span>AI Assistant</span>
              <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                RAG
              </span>
            </Link>
          </div>
          
          <div className="flex-grow max-w-md mx-6 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products across Amazon, Flipkart, Croma..."
                className="w-full px-4 py-2 pl-9 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <Link 
              to="/ai-assistant" 
              className="sm:hidden text-indigo-600 hover:text-indigo-700"
              title="AI Shopping Assistant"
            >
              <Sparkles size={20} />
            </Link>

            {user ? (
              <>
                <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative p-1">
                  <ShoppingCart size={22} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    0
                  </span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1.5 text-gray-700 hover:text-blue-600 focus:outline-none font-medium text-sm cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">Orders</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-bold">Admin Dashboard</Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-semibold text-sm">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-bold text-sm shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
