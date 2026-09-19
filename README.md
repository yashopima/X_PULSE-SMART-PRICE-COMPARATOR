# PricePulse X

PricePulse X is a full-stack price comparison and AI shopping intelligence app. It compares products across shopping platforms, stores price history, forecasts future price movement, detects suspicious discount behavior, recommends similar alternatives, and includes a conversational AI shopping assistant.

The project is built as a MERN-style application with a React/Vite client and an Express/MongoDB API.

## Features

- Product listing with search, sorting, current cheapest price, platform count, and deal badges
- Product detail dashboard with price history, 7-day forecast, buy score, volatility, confidence, and drop probability
- Deceptive pricing detection using historical pricing and claimed discount analysis
- Smart product recommendations using content-based similarity
- Aspect-based sentiment and quality scoring
- User authentication with JWT and bcrypt
- Cart and order flows for logged-in users
- AI assistant powered by catalog context, local ML insights, and optional Gemini API access
- Optional live product search through RapidAPI

## AI and ML Modules

The backend includes modular JavaScript ML/statistical utilities:

- `server/ml/priceForecaster.js` - trend forecasting, EMA, volatility, confidence, buy score, and forecast trajectory
- `server/ml/anomalyDetector.js` - suspicious MRP/discount analysis and deception risk scoring
- `server/ml/recommender.js` - content-based product similarity recommendations
- `server/ml/sentimentAnalyzer.js` - product quality and sentiment intelligence
- `server/controllers/aiController.js` - RAG-style shopping assistant using product data and ML context

## Tech Stack

**Frontend**

- React 19
- Vite
- Tailwind CSS 4
- React Router
- Axios
- Recharts
- Framer Motion
- Lucide React

**Backend**

- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT
- bcryptjs
- OpenAI-compatible client for Gemini

## Project Structure

```text
XPULSE_PRICE_COMPARATOR/
  client/                 React/Vite frontend
    src/
      components/
      context/
      pages/
      utils/
  server/                 Express API
    config/
    controllers/
    middleware/
    ml/
    models/
    routes/
    utils/
    seeder.js
    server.js
  run-all.bat             Windows helper to start client and server
  README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string

## Environment Variables

Create `server/.env` from the example file:

```powershell
cd server
copy .env.example .env
```

Then update the values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pricepulse_x
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=30d

GEMINI_API_KEY=replace_with_your_gemini_api_key
RAPIDAPI_KEY=replace_with_your_rapidapi_key
RAPIDAPI_HOST=real-time-amazon-data.p.rapidapi.com
```

Notes:

- `GEMINI_API_KEY` is optional for fallback AI behavior, but recommended for full assistant responses.
- `RAPIDAPI_KEY` and `RAPIDAPI_HOST` are required only for live product search.
- Do not commit `server/.env` to GitHub.

## Installation

Install backend dependencies:

```powershell
cd server
npm install
```

Install frontend dependencies:

```powershell
cd ../client
npm install
```

## Seed the Database

From the `server` folder:

```powershell
node seeder.js -i
```

This loads sample products, platform offers, and price history data for the app.

## Run Locally

### Option 1: Windows helper

From the project root:

```powershell
.\run-all.bat
```

This opens separate terminal windows for the backend and frontend.

### Option 2: Manual start

Start the API:

```powershell
cd server
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

Start the frontend in another terminal:

```powershell
cd client
npm run dev
```

The client runs at:

```text
http://localhost:5173
```

## API Routes

Base URL:

```text
http://localhost:5000/api/v1
```

Main routes:

- `POST /auth/register` - register a new user
- `POST /auth/login` - log in and receive a JWT
- `GET /auth/me` - get the current logged-in user
- `GET /products` - get products with pricing insights
- `GET /products/live-search?query=phone` - search live products through RapidAPI
- `GET /products/:id` - get product details with ML analysis
- `GET /products/:id/recommendations` - get smart alternatives
- `GET /cart` - get user cart
- `POST /cart` - add/update cart item
- `DELETE /cart/:itemId` - remove cart item
- `GET /cart/optimize` - optimize cart pricing
- `GET /orders` - get user orders
- `POST /orders` - create an order
- `POST /orders/checkout` - checkout cart
- `POST /ai/chat` - chat with the AI shopping assistant

Protected routes require:

```text
Authorization: Bearer <token>
```

## Useful Scripts

Backend:

```powershell
cd server
npm run dev
npm start
npm test
npm run test:ml
```

Frontend:

```powershell
cd client
npm run dev
npm run build
npm run lint
npm run preview
```

## Demo Flow

1. Start MongoDB, the backend, and the frontend.
2. Open `http://localhost:5173`.
3. Register or log in.
4. Browse products and compare prices across platforms.
5. Open a product detail page to inspect price history, forecast, buy score, and discount risk.
6. Add products to the cart and test checkout.
7. Open the AI Assistant and ask for shopping recommendations.

## Updating This Project on GitHub

After editing files locally, run these commands from the project root:

```powershell
git status
git add README.md
git commit -m "Update README"
git push
```

If you also want to push all other changed files:

```powershell
git status
git add .
git commit -m "Update project files"
git push
```

If this is your first push for the current branch:

```powershell
git branch --show-current
git push -u origin <branch-name>
```

Replace `<branch-name>` with the branch shown by `git branch --show-current`, for example `main`.

## GitHub Setup for a New Remote

If the local project is not connected to a GitHub repository yet:

```powershell
git remote -v
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repository name.

## Security Notes

- Keep `.env` files private.
- Rotate any API keys that were accidentally committed.
- Use a strong `JWT_SECRET`.
- For production, set a deployed frontend URL in CORS configuration instead of allowing every origin.
