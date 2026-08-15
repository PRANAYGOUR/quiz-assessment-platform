// Mock the database pool
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/authRoutes');
const { errorHandler } = require('../src/middleware/authMiddleware'); // We'll just mock error handling loosely or use app directly
const pool = require('../src/config/db');
const bcrypt = require('bcryptjs');

// Create a mock app for testing the routes
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});

describe('Authentication API Endpoints', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' }); // missing name, password
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Please add all fields');
    });

    it('should return 400 if user already exists', async () => {
      // Mock db to simulate user exists
      pool.query.mockResolvedValue([[{ id: 1 }]]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password', role: 'student' });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('should successfully register a new user', async () => {
      // 1st query: check if user exists (returns empty)
      // 2nd query: insert user (returns insertId)
      pool.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password', role: 'student' });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id', 1);
    });
  });
});
