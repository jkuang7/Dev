import express, { Request, Response } from 'express';
import Queue from './queue';

const app = express();
app.use(express.json());

// Create queue instance
const queue = new Queue();

// Simulated email sending (fails when flag is set)
let emailShouldFail = false;

async function sendEmail(to: string, subject: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));

  if (emailShouldFail) {
    throw new Error('Email service unavailable');
  }

  console.log(`Email sent to ${to}: ${subject}`);
}

// Register job handler
queue.registerHandler('send_welcome_email', async (job) => {
  const { email, userId } = job.data as { email: string; userId: string };
  await sendEmail(email, `Welcome, user ${userId}!`);
});

// POST /register - Queue welcome email job
app.post('/register', (req: Request, res: Response) => {
  const { email, userId } = req.body;

  if (!email || !userId) {
    return res.status(400).json({ error: 'email and userId required' });
  }

  // Queue the welcome email job (async - returns immediately)
  const job = queue.add('send_welcome_email', { email, userId });

  res.status(201).json({
    message: 'Registration successful',
    jobId: job.id,
  });
});

// GET /jobs/:id - Get job status
app.get('/jobs/:id', (req: Request, res: Response) => {
  const job = queue.getJob(req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

// For testing: control email failure
export function setEmailShouldFail(fail: boolean): void {
  emailShouldFail = fail;
}

export default app;
export { queue };

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
