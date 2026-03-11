import request from 'supertest';
import app from './index';

describe('Slow Code Optimization', () => {
  describe('Correctness', () => {
    it('should return all users with post counts', async () => {
      const res = await request(app).get('/users-with-posts');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(50); // 50 users

      // Check structure
      const user = res.body[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('postCount');
    });

    it('should have correct post counts', async () => {
      const res = await request(app).get('/users-with-posts');

      // Each user has 4 posts (200 posts / 50 users)
      const user1 = res.body.find((u: { id: number }) => u.id === 1);
      expect(user1.postCount).toBe(4);
    });
  });

  describe('Performance', () => {
    it('should respond in under 200ms (optimized)', async () => {
      const start = Date.now();
      await request(app).get('/users-with-posts');
      const duration = Date.now() - start;

      // This test will fail for starter (takes ~2.5s)
      // It should pass for solution (<200ms)
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Data minimization', () => {
    it('should only return necessary fields', async () => {
      const res = await request(app).get('/users-with-posts');

      const user = res.body[0];

      // Should have these
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('postCount');

      // Should NOT have these (data minimization)
      expect(user).not.toHaveProperty('bio');
      expect(user).not.toHaveProperty('avatar');
      expect(user).not.toHaveProperty('preferences');
    });
  });
});
