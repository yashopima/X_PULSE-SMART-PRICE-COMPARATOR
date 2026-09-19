import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, User, Sparkles, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';
import api from '../utils/api';

const QUICK_PROMPTS = [
  '🔥 What are the best deals right now?',
  '💻 Best gaming laptop under ₹90k?',
  '📱 Is Apple iPhone 14 Pro Max price dropping?',
  '🛡️ How does your fake discount detection work?'
];

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am your PricePulse AI Shopping Assistant. I monitor real-time prices across Amazon, Flipkart, Croma, and Reliance Digital using time-series machine learning models.\n\nAsk me anything about price predictions, product comparisons, or fake discount verification!", 
      isAi: true 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendQuery = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { text: textToSend, isAi: false }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const formattedMessages = newMessages.map(m => ({
        role: m.isAi ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await api.post('/ai/chat', { messages: formattedMessages });
      
      if (res.data && res.data.success) {
        setMessages(prev => [
          ...prev, 
          { 
            text: res.data.data, 
            isAi: true,
            suggestedProducts: res.data.suggestedProducts || []
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prev => [
        ...prev, 
        { 
          text: "I experienced an error connecting to my neural engine. Please check that the server is active.", 
          isAi: true 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[82vh] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight">PricePulse AI Assistant</h2>
              <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                RAG Engine
              </span>
            </div>
            <p className="text-blue-100 text-xs">Real-time catalog pricing & ML trend predictions</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-white/90">Catalog Synced</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-gray-50/80 px-6 py-2.5 border-b border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendQuery(prompt)}
            disabled={loading}
            className="text-xs bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium px-3 py-1.5 rounded-full border border-gray-200 transition-all whitespace-nowrap shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-grow p-6 overflow-y-auto bg-gradient-to-b from-gray-50/30 to-white space-y-5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.isAi ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm shadow-xs ${
                msg.isAi ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
              }`}>
                {msg.isAi ? <Bot size={16} /> : <User size={16} />}
              </div>

              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.isAi 
                    ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none font-medium'
                }`}>
                  {msg.text}
                </div>

                {/* Render Suggested Product Cards from RAG */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {msg.suggestedProducts.map((prod) => (
                      <div 
                        key={prod.id} 
                        className="bg-white border border-blue-100 rounded-2xl p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3"
                      >
                        <div className="overflow-hidden">
                          <span className="text-[10px] uppercase font-bold text-blue-600">{prod.brand}</span>
                          <h4 className="font-bold text-xs text-gray-900 truncate">{prod.name}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                            <span className="font-extrabold text-gray-900">₹{prod.cheapestPrice?.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-500 font-medium">on {prod.cheapestPlatform}</span>
                          </div>
                        </div>
                        <Link 
                          to={`/product/${prod.id}`}
                          className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white p-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center flex-shrink-0"
                          title="View Price Comparison"
                        >
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%] flex-row items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-2xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-gray-500 font-medium ml-2">Consulting catalog & ML models...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendQuery(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            className="flex-grow px-5 py-3.5 bg-gray-50 rounded-2xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium"
            placeholder="Ask about prices, 7-day forecasts, fake discounts, or best laptops/phones..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
