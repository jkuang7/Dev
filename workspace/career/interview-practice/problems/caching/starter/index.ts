import express, { Request, Response } from 'express';
import Cache from './cache';

const app = express();
app.use(express.json());

// In-memory "database"
interface User {
  id: string;
  name: string;
  email: string;
}

const users: Record<string, User> = {
  '1': { id: '1', name: 'Alice', email: 'alice@example.com' },
  '2': { id: '2', name: 'Bob', email: 'bob@example.com' },
};

// Simulated slow database fetch (500ms delay)
async function fetchUserFromDB(id: string): Promise<User | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return users[id] || null;
}

// Cache instance (2 second TTL for testing)
const cache = new Cache(2);

// GET /users/:id - Return user profile (should be cached)
app.get('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Implement cache-aside pattern
  // 1. Check cache for user
  // 2. If hit, return cached data with X-Cache: HIT header
  // 3. If miss, fetch from DB, store in cache, return with X-Cache: MISS header

  // Current implementation (no caching):
  const user = await fetchUserFromDB(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.set('X-Cache', 'MISS');
  res.json(user);
});

// PUT /users/:id - Update user (should invalidate cache)
app.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!users[id]) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update "database"
  if (name) users[id].name = name;
  if (email) users[id].email = email;

  // TODO: Invalidate cache for this user

  res.json(users[id]);
});

export default app;
export { cache, users };

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
