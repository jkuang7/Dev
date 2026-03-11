import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Task, ApiError } from './types';

const app = express();
app.use(express.json());

// In-memory store
const tasks: Task[] = [];

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().optional(),
  completed: z.boolean().optional().default(false),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(100, 'Title must be 100 characters or less').optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

// Error response helper
function errorResponse(code: string, message: string, details?: Array<{ field: string; message: string }>): ApiError {
  return {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

// Validation middleware factory
function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const details = err.errors.map(e => ({
          field: e.path.join('.') || 'body',
          message: e.message,
        }));
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Invalid input', details));
      }
      next(err);
    }
  };
}

// GET /tasks - List all tasks
app.get('/tasks', (req: Request, res: Response) => {
  res.json(tasks);
});

// GET /tasks/:id - Get single task
app.get('/tasks/:id', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Task not found'));
  }

  res.json(task);
});

// POST /tasks - Create task
app.post('/tasks', validate(createTaskSchema), (req: Request, res: Response) => {
  const now = new Date().toISOString();

  const task: Task = {
    id: uuidv4(),
    title: req.body.title,
    description: req.body.description,
    completed: req.body.completed ?? false,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  res.status(201).json(task);
});

// PUT /tasks/:id - Update task
app.put('/tasks/:id', validate(updateTaskSchema), (req: Request, res: Response) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);

  if (taskIndex === -1) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Task not found'));
  }

  const existingTask = tasks[taskIndex];
  const updatedTask: Task = {
    ...existingTask,
    ...(req.body.title !== undefined && { title: req.body.title }),
    ...(req.body.description !== undefined && { description: req.body.description }),
    ...(req.body.completed !== undefined && { completed: req.body.completed }),
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// DELETE /tasks/:id - Delete task
app.delete('/tasks/:id', (req: Request, res: Response) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);

  if (taskIndex === -1) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Task not found'));
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred'));
});

export default app;
export { tasks };

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
