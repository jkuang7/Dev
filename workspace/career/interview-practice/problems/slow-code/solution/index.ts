import express, { Request, Response } from 'express';
import { getUsersWithPostCounts } from './db';

const app = express();

// OPTIMIZED: Single query with JOIN, returns only needed fields
// Time: ~100ms (single DB call)

app.get('/users-with-posts', async (req: Request, res: Response) => {
  // Fix 1: Use optimized query that does JOIN in DB
  // Fix 2: Only selects needed fields (no bio, avatar, preferences)
  // Fix 3: No N+1 - single query for all data
  const result = await getUsersWithPostCounts();

  res.json(result);
});

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
