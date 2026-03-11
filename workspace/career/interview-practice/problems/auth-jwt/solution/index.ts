import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// In-memory user store
interface User {
  id: string;
  email: string;
  passwordHash: string;
}

const users: User[] = [];
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-min-256-bits-in-production';
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '1h';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

// Password hashing with bcrypt
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Password verification with bcrypt (timing-safe comparison built-in)
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT generation with proper claims
function generateToken(userId: string): string {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET,
    {
      expiresIn: TOKEN_EXPIRY,
      algorithm: 'HS256',
    }
  );
}

// JWT verification middleware
function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = users.find(u => u.id === decoded.sub);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /register
app.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' });
  }

  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user: User = {
    id: `user_${Date.now()}`,
    email,
    passwordHash,
  };
  users.push(user);

  // Return success (without password hash)
  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

// POST /login
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email);

  // Use same error for both cases to not leak email existence
  if (!user) {
    // Still do a hash compare to prevent timing attacks
    await bcrypt.compare(password || '', '$2b$10$invalid');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify password
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate token
  const token = generateToken(user.id);
  res.json({ token });
});

// GET /me - Protected route
app.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    id: req.user!.id,
    email: req.user!.email,
  });
});

export default app;
export { users, hashPassword, verifyPassword };

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
