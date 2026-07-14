# WealthifyMe - Personal and Shared Finance Tracker

WealthifyMe is a comprehensive personal finance tracking web application built with the MERN stack. It features individual transaction logging, dynamic analytics visualizations using Recharts, shared household budgeting for collaborative tracking, and an integrated Gemini AI-powered advisor for personalized financial advice and automated transaction categorization.

---

## Technical Stack

* **Frontend**: React, Tailwind CSS, Recharts, Vite, Lucide React
* **Backend**: Node.js, Express, Mongoose (MongoDB)
* **AI Engine**: Google Gemini API (gemini-1.5-flash)
* **Payment Processing**: Stripe API integrations (for plan upgrades)

---

## Core System Features

### 1. Dashboard and Transaction Tracking
* Log individual income and expense items.
* Assign transactions to custom categories with dynamic filters.
* Auto-calculate savings rate, net balance, and cumulative monthly expenditures.

### 2. Shared Budgeting (Households)
* Create or join a household workspace with multiple members.
* Coordinate shared expenses and track spending against a collective threshold.
* Real-time warnings when expenditure reaches 80% and 100% of the household budget.

### 3. Gemini AI Financial Assistant
* Interactive chat with Gemini model `gemini-1.5-flash`.
* AI contextual analysis of up to 100 historical transactions to recommend savings paths.
* Automatic text description analysis to auto-classify categories.

### 4. Subscription Management
* Stripe-ready payment workflows supporting tier progression from Free to Pro plans.

---

## Setup and Local Development

### Prerequisites
* Node.js (v18 or higher)
* Local MongoDB instance or MongoDB Atlas cluster connection string
* Google Gemini API key (optional; offline mock mode runs automatically if key is missing)

### 1. Configure and Run Backend
1. Navigate to the `wealthifyme-backend` directory.
2. Create a `.env` file containing the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/wealthifyme
   JWT_SECRET=your_secret_jwt_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2. Configure and Run Frontend
1. Navigate to the `finance-tracker-frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web application at the local host port output (typically `http://localhost:5173`).

---

## Production Deployment

### Backend (Render)
* Set Root Directory to `wealthifyme/wealthifyme-backend`.
* Configure Build Command to `npm install` and Start Command to `npm start`.
* Set environment variables for `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` in the Render environment panel.
* Change the Health Check Path to `/` to coordinate with Express router configurations.

### Frontend (Vercel)
* Set Root Directory to `wealthifyme/finance-tracker-frontend`.
* Add the environment variable `VITE_API_URL` pointing to your deployed Render service URL.
* Deploy. Single Page Routing is managed automatically using the built-in `vercel.json` rewrites configuration.
