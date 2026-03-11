import express, { Request, Response } from 'express';
import { getAllUsers, getPostsByUserId } from './db';

const app = express();

// SLOW: This endpoint has N+1 query problem and fetches unnecessary data
// Current time: ~2.5 seconds (50 users × 50ms per getPostsByUserId)
// Target time: <200ms

app.get('/users-with-posts', async (req: Request, res: Response) => {
  // Issue 1: Fetches ALL user fields (SELECT *)
  const users = await getAllUsers();

  // Issue 2: N+1 query - one query per user to get their posts
  const result = [];
  for (const user of users) {
    const posts = await getPostsByUserId(user.id);

    // Issue 3: Returns more data than needed
    result.push({
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,           // Not needed
      avatar: user.avatar,     // Not needed
      preferences: user.preferences,  // Not needed
      postCount: posts.length,
    });
  }

  res.json(result);
});

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
