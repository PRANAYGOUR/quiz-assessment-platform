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
