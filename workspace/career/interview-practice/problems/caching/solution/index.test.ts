import request from 'supertest';
import app, { cache, users } from './index';

describe('Caching', () => {
  beforeEach(() => {
    cache.clear();
    // Reset user data
    users['1'] = { id: '1', name: 'Alice', email: 'alice@example.com' };
    users['2'] = { id: '2', name: 'Bob', email: 'bob@example.com' };
  });

  describe('Cache miss (first request)', () => {
    it('should be slow on first request (cache miss)', async () => {
      const start = Date.now();
      const res = await request(app).get('/users/1');
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Alice');
      expect(res.headers['x-cache']).toBe('MISS');
      expect(duration).toBeGreaterThan(400); // Should be ~500ms
    });
  });

  describe('Cache hit (second request)', () => {
    it('should be fast on second request (cache hit)', async () => {
      // First request - populates cache
      await request(app).get('/users/1');

      // Second request - should hit cache
      const start = Date.now();
      const res = await request(app).get('/users/1');
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Alice');
      expect(res.headers['x-cache']).toBe('HIT');
      expect(duration).toBeLessThan(50); // Should be very fast
    });
  });

  describe('Cache invalidation on update', () => {
    it('should invalidate cache when user is updated', async () => {
      // First request - populates cache
      await request(app).get('/users/1');

      // Update user
      await request(app)
        .put('/users/1')
        .send({ name: 'Alice Updated' });

      // Third request - should be cache miss (invalidated)
      const res = await request(app).get('/users/1');

      expect(res.headers['x-cache']).toBe('MISS');
      expect(res.body.name).toBe('Alice Updated');
    });
  });

  describe('TTL expiration', () => {
    it('should re-fetch after TTL expires', async () => {
      // First request - populates cache
      await request(app).get('/users/1');

      // Wait for TTL to expire (cache is 2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2100));

      // Next request should be cache miss
      const res = await request(app).get('/users/1');

      expect(res.headers['x-cache']).toBe('MISS');
    }, 10000); // Extended timeout for this test
  });

  describe('Cache key design', () => {
    it('should cache different users separately', async () => {
      // Fetch user 1
      await request(app).get('/users/1');

      // Fetch user 2 - should be cache miss
      const res = await request(app).get('/users/2');

      expect(res.headers['x-cache']).toBe('MISS');
      expect(res.body.name).toBe('Bob');
    });

    it('should cache user 2 after fetching', async () => {
      // Fetch user 2
      await request(app).get('/users/2');

      // Second fetch of user 2 - should hit cache
      const res = await request(app).get('/users/2');

      expect(res.headers['x-cache']).toBe('HIT');
    });
  });
});
