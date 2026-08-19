const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const Product = require('./models/Product');
const PlatformOffer = require('./models/PlatformOffer');
const PriceHistory = require('./models/PriceHistory');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const products = [
  {
    name: 'Sony PlayStation 5 Console',
    brand: 'Sony',
    category: 'Electronics',
    description: 'The PS5 console unleashes new gaming possibilities that you never anticipated.',
    imageUrl: 'https://m.media-amazon.com/images/I/51051FiD9AQ._SX522_.jpg',
    historicalAveragePrice: 50000
  },
  {
    name: 'Apple iPhone 14 Pro Max',
    brand: 'Apple',
    category: 'Mobile',
    description: '6.7-inch Super Retina XDR display featuring Always-On and ProMotion.',
    imageUrl: 'https://m.media-amazon.com/images/I/71yzJoE7WlL._SX679_.jpg',
    historicalAveragePrice: 135000
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    brand: 'Samsung',
    category: 'Mobile',
    description: 'The ultimate smartphone with epic camera, performance, and S Pen.',
    imageUrl: 'https://m.media-amazon.com/images/I/61VfL-aiToL._SX679_.jpg',
    historicalAveragePrice: 120000
  },
  {
    name: 'Asus ROG Strix G15 Gaming Laptop',
    brand: 'Asus',
    category: 'Laptop',
    description: 'High performance gaming laptop with RTX 3060.',
    imageUrl: 'https://m.media-amazon.com/images/I/714hB--1MvL._SX679_.jpg',
    historicalAveragePrice: 85000
  }
];

const platforms = ['Amazon', 'Flipkart', 'Croma', 'Reliance Digital'];

const seedData = async () => {
  try {
    await Product.deleteMany();
    await PlatformOffer.deleteMany();
    await PriceHistory.deleteMany();
    await User.deleteMany();

    const createdProducts = await Product.insertMany(products);

    for (let product of createdProducts) {
      for (let platform of platforms) {
        const basePrice = product.historicalAveragePrice;
        const currentPrice = basePrice + (Math.random() * 0.2 - 0.1) * basePrice;
        const originalPrice = currentPrice * (1 + Math.random() * 0.3); // 0-30% discount
        const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        
        const offer = await PlatformOffer.create({
          product: product._id,
          platform,
          currentPrice: Math.round(currentPrice),
          originalPrice: Math.round(originalPrice),
          discountPercentage,
          url: `https://www.${platform.toLowerCase().replace(' ', '')}.com/product/${product._id}`,
          sellerRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
          deliveryTimeDays: Math.floor(Math.random() * 5) + 1
        });

        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          await PriceHistory.create({
            product: product._id,
            platform,
            price: Math.round(offer.currentPrice + (Math.random() * 0.1 - 0.05) * offer.currentPrice),
            date
          });
        }
      }
    }

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  seedData();
}
