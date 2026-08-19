# PricePulse X - Autonomous Multi-Platform Shopping & Checkout System

PricePulse X is a portfolio-grade, full-stack MERN web application that acts as an intelligent shopping assistant. It aggregates products across multiple platforms (Amazon, Flipkart, Croma, Reliance Digital), compares prices, detects fake discounts, and allows users to checkout from a single, unified smart cart.

## Features

- **Product Aggregation & Comparison:** Compare prices for the same product across different simulated platforms.
- **AI Cart Optimizer:** Analyzes your unified cart and automatically suggests cheaper sellers for the same items to maximize savings.
- **Smart Checkout:** A consolidated checkout experience that splits your cart into sub-orders for each respective platform.
- **Fake Discount Detection:** Compares current sale prices against historical averages to warn you about fake sales.
- **Buy Now or Wait Prediction:** A predictive algorithm that advises whether to buy now or wait based on price trends.
- **AI Shopping Assistant:** An integrated chat UI to help you make purchasing decisions.
- **Admin Dashboard:** A high-level overview of revenue, fake discounts detected, and user growth.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4, Context API, React Router v7, Recharts, Lucide React
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or Atlas URI)

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory.
2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```
3. **Configure Environment Variables:**
   Copy `server/.env.example` to `server/.env`, then update `MONGO_URI`, `JWT_SECRET`, and any API keys for your local setup.
4. **Seed the Database:**
   ```bash
   node seeder.js -i
   ```
5. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd server
   npm run dev  # or node server.js
   ```
   *The server will run on http://localhost:5000*

2. **Start the Frontend Client:**
   ```bash
   cd client
   npm run dev
   ```
   *The client will run on http://localhost:5173*

## Demo Walkthrough

1. Create a new account or log in.
2. Browse products on the Home page and view the "Cheapest on" platform.
3. Click on a product to see the Price Comparison Dashboard.
4. Note the AI Recommendation ("Buy Now" / "Wait") and Fake Discount Warnings.
5. Add items from different platforms to your Cart.
6. Go to the Cart page and click **"Run Optimizer"** to see if AI can save you money.
7. Click **"Proceed to Checkout"** to simulate the order.
8. Go to your **Orders** page to see the split sub-orders by platform.
9. Interact with the **AI Assistant** or visit the **Admin Dashboard** for analytics.

---
*Developed as a portfolio project for software engineering placements.*
