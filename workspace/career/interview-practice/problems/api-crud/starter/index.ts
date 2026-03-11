import express, { Request, Response } from 'express';
import { Task } from './types';

const app = express();
app.use(express.json());

// In-memory store
const tasks: Task[] = [];

// GET /tasks - List all tasks
app.get('/tasks', (req: Request, res: Response) => {
  // TODO: Return all tasks
  res.status(501).json({ error: 'Not implemented' });
});

// GET /tasks/:id - Get single task
app.get('/tasks/:id', (req: Request, res: Response) => {
  // TODO: Find task by ID
  // TODO: Return 404 if not found
  res.status(501).json({ error: 'Not implemented' });
});

// POST /tasks - Create task
app.post('/tasks', (req: Request, res: Response) => {
  // TODO: Validate input (title required, 1-100 chars)
  // TODO: Create task with id, timestamps
  // TODO: Return 201 with created task
  res.status(501).json({ error: 'Not implemented' });
});

// PUT /tasks/:id - Update task
app.put('/tasks/:id', (req: Request, res: Response) => {
  // TODO: Find task by ID
  // TODO: Return 404 if not found
  // TODO: Validate input
  // TODO: Update task and updatedAt
  // TODO: Return updated task
  res.status(501).json({ error: 'Not implemented' });
});

// DELETE /tasks/:id - Delete task
app.delete('/tasks/:id', (req: Request, res: Response) => {
  // TODO: Find task by ID
  // TODO: Return 404 if not found
  // TODO: Remove task
  // TODO: Return 204 No Content
  res.status(501).json({ error: 'Not implemented' });
});

export default app;
export { tasks };

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
