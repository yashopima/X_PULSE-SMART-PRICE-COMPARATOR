const OpenAI = require('openai');

exports.chat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Please provide an array of messages' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini_api_key_here')) {
      // Fallback to mocked response if no API key is provided
      const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let mockResponse = "I can certainly help with that. Analyzing across platforms...";
      
      if (userMessage.includes('laptop') || userMessage.includes('gaming')) {
        mockResponse = "For gaming laptops, I recommend the Asus ROG Strix G15. It's currently at its lowest price on Amazon (₹85,000) and represents a 15% drop from its 30-day average. Would you like me to add it to your Smart Cart?";
      } else if (userMessage.includes('phone') || userMessage.includes('photography')) {
        mockResponse = "The Samsung Galaxy S23 Ultra is excellent for photography. However, our price prediction engine suggests waiting 7 days as historical trends indicate an upcoming sale on Flipkart.";
      } else if (userMessage.includes('cart') || userMessage.includes('optimize')) {
        mockResponse = "I've analyzed your cart. You can save ₹4,500 by purchasing the headphones from Croma instead of Reliance Digital. I've highlighted this in your Cart Dashboard.";
      }

      return res.status(200).json({
        success: true,
        data: `[MOCK MODE] ${mockResponse}\n\n(Note: Add your Gemini API key in server/.env for real AI responses!)`,
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
    

    const systemPrompt = {
      role: 'system',
      content: `You are the PricePulse X AI Shopping Assistant. 
      You help users find the best deals, analyze price trends, and optimize their shopping cart.
      Be helpful, concise, and friendly.`
    };

    const response = await openai.chat.completions.create({
    model: 'gemini-3.6-flash',
    messages: [systemPrompt, ...messages],
    max_tokens: 500,
});
    res.status(200).json({
      success: true,
      data: response.choices[0].message.content,
    });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ success: false, error: 'Failed to communicate with AI service' });
  }
};
