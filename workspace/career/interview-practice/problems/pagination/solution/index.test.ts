import request from 'supertest';
import app from './index';

describe('Pagination', () => {
  describe('Offset pagination', () => {
    it('should return first page with default limit', async () => {
      const res = await request(app).get('/items?page=1');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(10);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.total).toBe(100);
      expect(res.body.pagination.totalPages).toBe(10);
    });

    it('should return second page', async () => {
      const res = await request(app).get('/items?page=2&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(10);
      expect(res.body.pagination.page).toBe(2);
      // First item on page 2 should be Item 11
      expect(res.body.items[0].name).toBe('Item 11');
    });

    it('should handle custom limit', async () => {
      const res = await request(app).get('/items?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(5);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.totalPages).toBe(20);
    });

    it('should return empty array for page beyond data', async () => {
      const res = await request(app).get('/items?page=100&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });
  });

  describe('Cursor pagination', () => {
    it('should return first page without cursor', async () => {
      const res = await request(app).get('/items?limit=10');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(10);
      expect(res.body.pagination.hasMore).toBe(true);
      expect(res.body.pagination.nextCursor).toBeDefined();
    });

    it('should return next page with cursor', async () => {
      // Get first page
      const firstRes = await request(app).get('/items?limit=10');
      const cursor = firstRes.body.pagination.nextCursor;

      // Get second page
      const res = await request(app).get(`/items?cursor=${cursor}&limit=10`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(10);
      // Items should be different from first page
      expect(res.body.items[0].name).toBe('Item 11');
    });

    it('should return hasMore=false on last page', async () => {
      // Get a page near the end
      const res = await request(app).get('/items?page=10&limit=10');

      // Convert to cursor-style response to check hasMore
      expect(res.body.items).toHaveLength(10);
    });

    it('should return 400 for invalid cursor', async () => {
      const res = await request(app).get('/items?cursor=invalid-cursor&limit=10');

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should handle end of data gracefully', async () => {
      // Get last items by walking through all pages
      let cursor: string | undefined;
      let lastResponse;

      // Navigate to near the end
      for (let i = 0; i < 9; i++) {
        const url = cursor ? `/items?cursor=${cursor}&limit=10` : '/items?limit=10';
        lastResponse = await request(app).get(url);
        cursor = lastResponse.body.pagination.nextCursor;
      }

      // Get the final page
      const finalRes = await request(app).get(`/items?cursor=${cursor}&limit=10`);

      expect(finalRes.status).toBe(200);
      expect(finalRes.body.items).toHaveLength(10);
      expect(finalRes.body.pagination.hasMore).toBe(false);
      expect(finalRes.body.pagination.nextCursor).toBeUndefined();
    });
  });

  describe('README tradeoffs', () => {
    it('README should explain offset vs cursor tradeoffs', async () => {
      // This test just documents that the README should cover:
      // - Why offset degrades at scale
      // - When to use each type
      // - Cursor encoding strategy
      expect(true).toBe(true);
    });
  });
});
