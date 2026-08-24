const request = require('supertest');
const app = require('../src/app');

describe('API Health Check', () => {
  it('should return 200 OK and success message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.message).toBe('API is running successfully');
  });
});
