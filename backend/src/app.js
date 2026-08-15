const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize app
const app = express();

// Global Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running successfully' });
});

const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Feature Routes will be imported here by the team
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
