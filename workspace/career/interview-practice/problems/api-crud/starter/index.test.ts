import request from 'supertest';
import app, { tasks } from './index';

describe('REST API CRUD', () => {
  beforeEach(() => {
    tasks.length = 0;
  });

  describe('POST /tasks', () => {
    it('should create a task and return 201', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test task' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Test task');
      expect(res.body.completed).toBe(false);
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
      expect(res.body.error.details[0].field).toBe('title');
    });

    it('should return 400 when title is too long', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'a'.repeat(101) });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /tasks', () => {
    it('should return empty array when no tasks', async () => {
      const res = await request(app).get('/tasks');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all tasks', async () => {
      await request(app).post('/tasks').send({ title: 'Task 1' });
      await request(app).post('/tasks').send({ title: 'Task 2' });

      const res = await request(app).get('/tasks');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return task by id', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ title: 'Test task' });

      const res = await request(app).get(`/tasks/${createRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Test task');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).get('/tasks/non-existent-id');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update task', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ title: 'Original title' });

      const res = await request(app)
        .put(`/tasks/${createRes.body.id}`)
        .send({ title: 'Updated title', completed: true });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated title');
      expect(res.body.completed).toBe(true);
      expect(res.body.updatedAt).not.toBe(createRes.body.updatedAt);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .put('/tasks/non-existent-id')
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid update data', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ title: 'Test task' });

      const res = await request(app)
        .put(`/tasks/${createRes.body.id}`)
        .send({ title: '' }); // Empty title not allowed

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete task and return 204', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ title: 'Test task' });

      const res = await request(app).delete(`/tasks/${createRes.body.id}`);

      expect(res.status).toBe(204);

      // Verify task is gone
      const getRes = await request(app).get(`/tasks/${createRes.body.id}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).delete('/tasks/non-existent-id');

      expect(res.status).toBe(404);
    });
  });

  describe('Response structure', () => {
    it('should have consistent error structure', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: '' });

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
    });

    it('should have consistent success structure for single resource', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test' });

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('completed');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });
  });
});
