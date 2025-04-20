const request = require('supertest');
const app = require('../app'); // 

describe('GET /api/products', () => {
  it('should return a list of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toEqual(200);
  });
});
