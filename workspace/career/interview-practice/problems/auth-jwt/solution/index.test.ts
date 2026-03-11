import request from 'supertest';
import app, { users, hashPassword, verifyPassword } from './index';

describe('JWT Authentication', () => {
  beforeEach(() => {
    // Clear users between tests
    users.length = 0;
  });

  describe('POST /register', () => {
    it('should create a user with hashed password', async () => {
      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.passwordHash).toBeUndefined(); // Should not expose hash

      // Verify password is hashed in storage
      const user = users.find(u => u.email === 'test@example.com');
      expect(user).toBeDefined();
      expect(user?.passwordHash).not.toBe('password123'); // Should be hashed
    });

    it('should reject weak passwords', async () => {
      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('password');
    });

    it('should reject duplicate emails', async () => {
      await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'password123' });

      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'different123' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'password123' });
    });

    it('should return JWT on valid credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');

      // Token should be valid JWT format (header.payload.signature)
      expect(res.body.token.split('.')).toHaveLength(3);
    });

    it('should return 401 on invalid password', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      // Should not leak whether email exists
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return 401 on non-existent email', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      // Should return same error as wrong password
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /me', () => {
    let token: string;

    beforeEach(async () => {
      await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'password123' });

      const loginRes = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      token = loginRes.body.token;
    });

    it('should return user info with valid token', async () => {
      const res = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('Password hashing', () => {
    it('should use bcrypt for hashing', async () => {
      const hash = await hashPassword('testpassword');

      // Bcrypt hashes start with $2b$ or $2a$
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should verify passwords correctly', async () => {
      const hash = await hashPassword('testpassword');

      expect(await verifyPassword('testpassword', hash)).toBe(true);
      expect(await verifyPassword('wrongpassword', hash)).toBe(false);
    });
  });
});
