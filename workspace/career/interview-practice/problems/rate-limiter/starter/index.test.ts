import request from 'supertest';
import app from './index';

describe('Rate Limiter', () => {
  it('should allow requests under the limit', async () => {
    const res = await request(app).get('/api/resource');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Success');
  });

  it('should return 429 when limit exceeded', async () => {
    // Make 101 requests - the 101st should fail
    const requests = [];
    for (let i = 0; i < 101; i++) {
      requests.push(request(app).get('/api/resource'));
    }

    const responses = await Promise.all(requests);
    const rejected = responses.filter(r => r.status === 429);

    expect(rejected.length).toBeGreaterThan(0);
  });

  it('should include Retry-After header on 429', async () => {
    // Exhaust the limit first
    const requests = [];
    for (let i = 0; i < 101; i++) {
      requests.push(request(app).get('/api/resource'));
    }

    const responses = await Promise.all(requests);
    const rejected = responses.find(r => r.status === 429);

    expect(rejected).toBeDefined();
    expect(rejected?.headers['retry-after']).toBeDefined();
  });

  it('should include rate limit headers', async () => {
    const res = await request(app).get('/api/resource');

    // These headers should be present on all responses
    expect(res.headers['x-ratelimit-limit']).toBeDefined();
    expect(res.headers['x-ratelimit-remaining']).toBeDefined();
  });
});
