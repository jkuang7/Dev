import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

// In-memory user store (use a real database in production)
interface User {
  id: string;
  email: string;
  passwordHash: string;
}

const users: User[] = [];
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// TODO: Implement password hashing
async function hashPassword(password: string): Promise<string> {
  // Use bcrypt to hash the password
  return password; // placeholder
}

// TODO: Implement password verification
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Use bcrypt to compare password with hash
  return password === hash; // placeholder
}

// TODO: Implement JWT generation
function generateToken(userId: string): string {
  // Use jsonwebtoken to create a token
  // Include: sub (userId), exp (1 hour), iat
  return 'placeholder-token';
}

// TODO: Implement JWT verification middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check Authorization header for Bearer token
  // Verify token and attach user to request
  // Return 401 if invalid/missing
  next();
}

// POST /register
app.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // TODO: Validate input
  // TODO: Check if user exists
  // TODO: Hash password
  // TODO: Create user
  // TODO: Return success (don't return password hash)

  res.status(501).json({ error: 'Not implemented' });
});

// POST /login
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // TODO: Find user by email
  // TODO: Verify password
  // TODO: Generate and return JWT
  // Don't leak whether email exists

  res.status(501).json({ error: 'Not implemented' });
});

// GET /me - Protected route
app.get('/me', authMiddleware, (req: Request, res: Response) => {
  // TODO: Return current user info (from authMiddleware)

  res.status(501).json({ error: 'Not implemented' });
});

export default app;
export { users, hashPassword, verifyPassword };

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
