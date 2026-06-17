const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('./logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set up HTTP request logging using Morgan and Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 1. Secure HTTP headers using Helmet
app.use(helmet());

// 2. Configure Strict CORS policies
const allowedOrigins = [
  process.env.FRONTEND_URL, // Vercel production link
  'http://localhost:3000',  // Local Vite frontend port
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or postman requests in dev, else restrict
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked: Origin unauthorized.'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Defend against large body payload floods

// 3. Define Rate Limiting parameters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { message: 'Too many requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', apiLimiter);

// Database Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  logger.warn('WARNING: MONGO_URI environment variable is missing. Database functionality will fail.');
} else {
  mongoose.connect(mongoURI)
    .then(() => logger.info('MongoDB connection established successfully.'))
    .catch((error) => logger.error('MongoDB connection error: %O', error));
}

// Public status route
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running successfully', dbConnected: mongoose.connection.readyState === 1 });
});
app.get('/api/v1/status', (req, res) => {
  res.json({ status: 'API v1 is running successfully', dbConnected: mongoose.connection.readyState === 1 });
});

// Register Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/portfolio', require('./routes/portfolio'));
app.use('/api/v1/messages', require('./routes/messages'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled server error: %O', err);
  res.status(500).json({ message: 'An internal server error occurred.' });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`Server is running on port: ${PORT}`);
});
