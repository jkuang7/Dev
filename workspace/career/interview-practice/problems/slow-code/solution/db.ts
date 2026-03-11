// Simulated database with intentional performance issues

export interface User {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  preferences: Record<string, unknown>;
  createdAt: string;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

// Generate sample data
const users: User[] = [];
const posts: Post[] = [];

for (let i = 1; i <= 50; i++) {
  users.push({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    bio: `This is a long bio for user ${i}. `.repeat(10),
    avatar: `https://example.com/avatars/${i}.jpg`,
    preferences: { theme: 'dark', notifications: true },
    createdAt: new Date().toISOString(),
  });
}

for (let i = 1; i <= 200; i++) {
  posts.push({
    id: i,
    userId: Math.ceil(i / 4), // 4 posts per user
    title: `Post ${i}`,
    content: `This is the content of post ${i}. `.repeat(20),
    tags: ['tag1', 'tag2', 'tag3'],
    createdAt: new Date().toISOString(),
  });
}

// Simulated slow database operations
// Each call has 50ms latency to simulate network/disk

export async function getAllUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...users];
}

export async function getUserById(id: number): Promise<User | undefined> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return users.find(u => u.id === id);
}

export async function getPostsByUserId(userId: number): Promise<Post[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return posts.filter(p => p.userId === userId);
}

export async function getAllPosts(): Promise<Post[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...posts];
}

// Optimized operations (for solution)

export async function getUsersWithPostCounts(): Promise<Array<{
  id: number;
  name: string;
  email: string;
  postCount: number;
}>> {
  // Simulates a JOIN query - single DB call
  await new Promise(resolve => setTimeout(resolve, 50));

  const postCounts = new Map<number, number>();
  for (const post of posts) {
    postCounts.set(post.userId, (postCounts.get(post.userId) || 0) + 1);
  }

  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    postCount: postCounts.get(user.id) || 0,
  }));
}
