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
    description: 'The PS5 console unleashes next-gen gaming possibilities with ultra-high speed SSD, ray tracing, and 3D audio.',
    imageUrl: 'https://m.media-amazon.com/images/I/51051FiD9AQ._SX522_.jpg',
    historicalAveragePrice: 52000
  },
  {
    name: 'Apple iPhone 14 Pro Max (128GB)',
    brand: 'Apple',
    category: 'Mobile',
    description: '6.7-inch Super Retina XDR display featuring Always-On, Dynamic Island, and 48MP main camera.',
    imageUrl: 'https://m.media-amazon.com/images/I/71yzJoE7WlL._SX679_.jpg',
    historicalAveragePrice: 129000
  },
  {
    name: 'Samsung Galaxy S23 Ultra 5G',
    brand: 'Samsung',
    category: 'Mobile',
    description: 'Snapdragon 8 Gen 2, 200MP camera, built-in S Pen, and 120Hz Dynamic AMOLED display.',
    imageUrl: 'https://m.media-amazon.com/images/I/61VfL-aiToL._SX679_.jpg',
    historicalAveragePrice: 114000
  },
  {
    name: 'Asus ROG Strix G15 Gaming Laptop',
    brand: 'Asus',
    category: 'Laptop',
    description: 'AMD Ryzen 7 6800H, NVIDIA GeForce RTX 3060, 16GB DDR5, 1TB SSD, 300Hz FHD Display.',
    imageUrl: 'https://m.media-amazon.com/images/I/714hB--1MvL._SX679_.jpg',
    historicalAveragePrice: 88000
  },
  {
    name: 'Apple MacBook Air M2 (13.6-inch)',
    brand: 'Apple',
    category: 'Laptop',
    description: 'Strikingly thin design with Apple M2 chip, 8-core CPU, 10-core GPU, 8GB RAM, and 256GB SSD.',
    imageUrl: 'https://m.media-amazon.com/images/I/710TJuHTMhL._SX679_.jpg',
    historicalAveragePrice: 99000
  },
  {
    name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    brand: 'Sony',
    category: 'Electronics',
    description: 'Industry-leading noise cancellation with 8 microphones, 30-hour battery life, and crystal-clear hands-free calling.',
    imageUrl: 'https://m.media-amazon.com/images/I/61+elL4upXL._SX679_.jpg',
    historicalAveragePrice: 28000
  },
  {
    name: 'Google Pixel 8 Pro (128GB)',
    brand: 'Google',
    category: 'Mobile',
    description: 'Google Tensor G3, immersive 6.7-inch Super Actua display, pro-level triple camera system with AI editing.',
    imageUrl: 'https://m.media-amazon.com/images/I/71r5E-L0pPL._SX679_.jpg',
    historicalAveragePrice: 89000
  },
  {
    name: 'Dell XPS 15 9530 Core i7 Laptop',
    brand: 'Dell',
    category: 'Laptop',
    description: '13th Gen Intel Core i7-13700H, 15.6-inch 3.5K OLED Touch, 16GB DDR5, 1TB SSD, NVIDIA RTX 4050.',
    imageUrl: 'https://m.media-amazon.com/images/I/71B9KzP9vWL._SX679_.jpg',
    historicalAveragePrice: 175000
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

    for (let index = 0; index < createdProducts.length; index++) {
      const product = createdProducts[index];
      const basePrice = product.historicalAveragePrice;

      // Platform variations
      for (let pIdx = 0; pIdx < platforms.length; pIdx++) {
        const platform = platforms[pIdx];

        // Give each platform a slightly different price spread
        const platformFactor = 1 + ((pIdx - 1.5) * 0.035); // -5% to +5% spread across stores
        let currentPrice = Math.round(basePrice * platformFactor);
        let originalPrice = Math.round(currentPrice * 1.15); // standard 15% discount
        let discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

        // Intentionally create a Deceptive Pricing scenario for product index 1 (iPhone on Flipkart)
        // Seller inflates original price by 38% while charging full baseline price
        if (index === 1 && platform === 'Flipkart') {
          originalPrice = Math.round(basePrice * 1.45);
          currentPrice = Math.round(basePrice * 1.02);
          discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        }

        // Intentionally create a "Strong Buy / Deep Genuine Discount" scenario for product index 3 (Asus on Amazon)
        if (index === 3 && platform === 'Amazon') {
          originalPrice = Math.round(basePrice * 1.20);
          currentPrice = Math.round(basePrice * 0.88); // 12% below historical average
          discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        }

        const offer = await PlatformOffer.create({
          product: product._id,
          platform,
          currentPrice,
          originalPrice,
          discountPercentage,
          url: `https://www.${platform.toLowerCase().replace(' ', '')}.com/product/${product._id}`,
          sellerRating: (4.0 + (Math.random() * 0.9)).toFixed(1), // 4.0 to 4.9
          deliveryTimeDays: Math.floor(Math.random() * 4) + 1
        });

        // Generate 30 days of realistic chronological price history
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);

          // Simulate realistic price trajectories:
          // Product 3 (Asus ROG) has a downward trend towards the current deal
          // Product 1 has had steady or rising prices
          let dayNoise = (Math.random() * 0.04 - 0.02); // +/- 2% random fluctuation
          let trendAdjustment = 0;

          if (index === 3) {
            // Gradual price reduction over the 30 days
            trendAdjustment = (i / 30) * 0.10; // was 10% higher 30 days ago
          } else if (index === 7) {
            // Dell XPS has high price swings
            trendAdjustment = Math.sin(i / 3) * 0.06;
          }

          const historicalPrice = Math.round(offer.currentPrice * (1 + dayNoise + trendAdjustment));

          await PriceHistory.create({
            product: product._id,
            platform,
            price: historicalPrice,
            date
          });
        }
      }
    }

    console.log('Seeded database successfully with 8 products, multi-store offers, and 30-day price trajectories!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  seedData();
} else {
  console.log('Use `node seeder.js -i` to import data.');
  process.exit(0);
}
