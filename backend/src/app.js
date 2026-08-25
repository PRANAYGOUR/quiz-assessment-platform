const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize app
const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running successfully' });
});

// Advanced In-Memory Cache to speed up Render+Supabase latency
const apiCache = new Map();
const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    // Clear cache on writes (POST/PUT/DELETE) so data stays fresh
    if (req.method !== 'OPTIONS') apiCache.clear();
    return next();
  }
  
  // Create a unique key using URL and user token (to prevent data leaking between users)
  const key = req.originalUrl + (req.headers.authorization || '');
  const cached = apiCache.get(key);
  
  if (cached && Date.now() < cached.expiry) {
    return res.status(200).json(cached.data);
  }
  
  const originalJson = res.json;
  res.json = (body) => {
    // Cache the response for 30 seconds
    apiCache.set(key, { data: body, expiry: Date.now() + 30000 });
    originalJson.call(res, body);
  };
  next();
};

// Apply cache middleware
app.use(cacheMiddleware);

const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const attemptRoutes = require('./routes/attemptRoutes');

// Feature Routes will be imported here by the team
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
