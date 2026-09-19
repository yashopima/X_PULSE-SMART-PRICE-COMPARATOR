# PricePulse X - Autonomous Multi-Platform Shopping & AI Price Intelligence System

PricePulse X is a portfolio-grade, full-stack web application that serves as an autonomous multi-store shopping assistant. It aggregates product prices across multiple platforms (Amazon, Flipkart, Croma, Reliance Digital), performs machine learning time-series price forecasting, flags deceptive discounts using statistical anomaly detection, and provides smart vector-similarity recommendations.

---

## 🧠 Core AI & Machine Learning Architecture

PricePulse X integrates **5 genuine AI & Machine Learning modules** designed with formal mathematical principles:

### 1. Time-Series Machine Learning Price Forecasting (`server/ml/priceForecaster.js`)
- **Least-Squares Linear & Polynomial Regression**: Fits trend slope ($\beta_1$), intercept ($\beta_0$), and evaluates goodness-of-fit via Coefficient of Determination ($R^2$).
- **Exponential Moving Average (EMA-7 & EMA-14)**: Identifies short-term vs. medium-term price momentum.
- **Price Volatility Index ($\sigma$)**: Measures price variance and risk of sudden price fluctuations.
- **7-Day Trajectory Projection**: Generates forward-looking daily price projections with 95% confidence intervals, visualized via dual-series Recharts graphs.
- **Multi-Factor ML Buy Score (0-100)**: Evaluates percentile position in 30-day range (40%), slope direction (30%), mean deviation (20%), and model confidence (10%) to output actionable verdicts:
  - `Strong Buy` (at historical low, upward bounce projected)
  - `Buy Now` (fair, stable price)
  - `Wait 3-5 Days` (high volatility, dip probability > 60%)
  - `Wait for Sale` (near 30-day peak)

### 2. Statistical Anomaly & Deceptive Pricing Detector (`server/ml/anomalyDetector.js`)
- **E-Commerce Deceptive Pricing / Price Jacking Problem**: Retailers frequently inflate the list price (M.R.P.) right before or during discount events to advertise faux "40% OFF" discounts.
- **Z-Score Anomaly Detection**:
  $$Z = \frac{\text{Claimed M.R.P.} - \mu_{\text{history}}}{\sigma_{\text{history}}}$$
- **True Discount vs. Claimed Discount Metric**:
  Calculates actual savings relative to the verified rolling median baseline price ($P_{\text{median}}$).
- **Deception Risk Score (0-100%)**: Detects artificial price inflation and warns consumers with specific rupee amounts.

### 3. Content-Based Vector Recommendation Engine (`server/ml/recommender.js`)
- **Multi-Attribute Feature Vector Space**: Maps products across category weights (35%), brand ecosystem (20%), normalized price proximity (25%), and lexical tag tokens (20%).
- **Weighted Cosine Similarity**: Computes similarity scores between items to recommend top alternatives with higher specifications or lower price points.

### 4. Aspect-Based Review Sentiment & Quality Intelligence (`server/ml/sentimentAnalyzer.js`)
- **Multi-Dimensional Polarity Breakdown**: Evaluates user sentiment across 4 key dimensions:
  1. Build Quality & Materials
  2. Performance & Speed
  3. Value for Money
  4. Seller & Shipping Reliability
- **Composite AI Quality Score**: Aggregated 0-10 index with AI-synthesized pros and caveats.

### 5. Context-Aware RAG AI Shopping Assistant (`server/controllers/aiController.js`)
- **Retrieval-Augmented Generation (RAG)**: Connects the conversational AI directly to live catalog prices and ML trend predictions stored in MongoDB.
- **Resilient Fallback**: Automatically serves contextual answers and recommended product cards even if external LLM APIs are unreachable.

---

## Tech Stack

- **Frontend:** React 19 (Vite), Tailwind CSS v4, Context API, React Router v7, Recharts, Lucide React
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Machine Learning Suite:** Modular Pure Mathematical/Statistical ML Engine in Node.js (Linear Regression, EMA, Z-Score Outlier Analysis, Cosine Similarity)
- **AI Integration:** Google Gemini API (OpenAI-compatible client) with local RAG context injection
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance running on `mongodb://127.0.0.1:27017` or Atlas URI)

### Installation

1. **Clone the repository and install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables:**
   Ensure `server/.env` contains your `MONGO_URI`, `JWT_SECRET`, and optional `GEMINI_API_KEY`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/pricepulse_x
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Seed the Database with Multi-Store Data & 30-Day Histories:**
   ```bash
   node seeder.js -i
   ```

4. **Run the Machine Learning Unit Test Suite:**
   ```bash
   npm test
   # or: npm run test:ml
   ```

5. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

## Running the Application

### Option A: Using the Automated Script (Windows)
Double-click `run-all.bat` or run:
```bash
.\run-all.bat
```

### Option B: Manual Execution
1. **Start Backend Server:**
   ```bash
   cd server
   npm run dev
   ```
   *Server runs on http://localhost:5000*

2. **Start Frontend Client:**
   ```bash
   cd client
   npm run dev
   ```
   *Client runs on http://localhost:5173*

---

## Demo Walkthrough

1. Open `http://localhost:5173` to view products with real-time **ML Deal Badges** (`Strong Buy 🔥`, `Great Deal`, `Fair Value`).
2. Click any product (e.g. *Asus ROG Strix G15* or *Apple iPhone 14 Pro Max*) to access the **AI Price Intelligence Dashboard**.
3. View the **Interactive Chart**: Switch between **30-Day History** and the **7-Day ML Forecast Trajectory** (dashed purple curve).
4. Inspect the **ML Buy Decision Gauge** (Confidence, Drop Probability, and Volatility Index).
5. Review the **Deceptive Pricing Radar** (flags artificial MRP inflation and calculates True Savings).
6. Explore the **Aspect-Based Sentiment Intelligence** breakdown (Build Quality, Performance, Value, Seller Reliability).
7. Scroll down to see **AI Recommended Alternatives** computed via Cosine Similarity.
8. Click **AI Assistant** in the navigation bar to interact with the RAG-powered shopping assistant.
