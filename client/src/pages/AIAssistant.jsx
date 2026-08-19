import { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import api from '../utils/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your PricePulse AI Assistant. How can I help you optimize your shopping today?", isAi: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, isAi: false }];
    setMessages(newMessages);
    setInput('');

    // Fetch real AI Response
    const fetchAIResponse = async () => {
      try {
        // Format messages for OpenAI (role: 'user' or 'assistant')
        const formattedMessages = newMessages.map(m => ({
          role: m.isAi ? 'assistant' : 'user',
          content: m.text
        }));

        const res = await api.post('/ai/chat', { messages: formattedMessages });
        
        if (res.data && res.data.success) {
          setMessages(prev => [...prev, { text: res.data.data, isAi: true }]);
        }
      } catch (error) {
        console.error('Error fetching AI response:', error);
        setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to my brain right now.", isAi: true }]);
      }
    };

    fetchAIResponse();
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
        <Bot size={28} />
        <div>
          <h2 className="font-bold text-lg">AI Shopping Assistant</h2>
          <p className="text-blue-100 text-sm">Powered by PricePulse Intelligence</p>
        </div>
      </div>

      <div className="flex-grow p-6 overflow-y-auto bg-gray-50 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.isAi ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isAi ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                {msg.isAi ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.isAi ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-grow px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask for recommendations, price trends, or cart optimization..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
