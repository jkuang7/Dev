import { v4 as uuidv4 } from 'uuid';

export interface Job {
  id: string;
  type: string;
  data: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: Date;
  processedAt?: Date;
  nextRetryAt?: Date;
}

export type JobHandler = (job: Job) => Promise<void>;

class Queue {
  private jobs: Job[] = [];
  private deadLetterQueue: Job[] = [];
  private handlers: Map<string, JobHandler> = new Map();
  private baseDelay = 1000; // 1 second base delay

  add(type: string, data: Record<string, unknown>, maxAttempts = 3): Job {
    const job: Job = {
      id: uuidv4(),
      type,
      data,
      status: 'pending',
      attempts: 0,
      maxAttempts,
      createdAt: new Date(),
    };

    this.jobs.push(job);
    return job;
  }

  registerHandler(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  async processNext(): Promise<boolean> {
    const now = new Date();

    // Find next job that's ready to process
    const jobIndex = this.jobs.findIndex(job =>
      job.status === 'pending' &&
      (!job.nextRetryAt || job.nextRetryAt <= now)
    );

    if (jobIndex === -1) {
      return false;
    }

    const job = this.jobs[jobIndex];
    const handler = this.handlers.get(job.type);

    if (!handler) {
      console.error(`No handler for job type: ${job.type}`);
      return false;
    }

    job.status = 'processing';
    job.attempts++;

    try {
      await handler(job);

      // Success
      job.status = 'completed';
      job.processedAt = new Date();

    } catch (error) {
      job.lastError = error instanceof Error ? error.message : String(error);

      if (job.attempts >= job.maxAttempts) {
        // Max retries exhausted - move to DLQ
        this.moveToDLQ(job);
      } else {
        // Schedule retry
        this.scheduleRetry(job);
      }
    }

    return true;
  }

  private scheduleRetry(job: Job): void {
    // Exponential backoff: baseDelay * 2^(attempts - 1)
    const delay = this.baseDelay * Math.pow(2, job.attempts - 1);
    job.nextRetryAt = new Date(Date.now() + delay);
    job.status = 'pending'; // Back to pending for retry
  }

  private moveToDLQ(job: Job): void {
    job.status = 'failed';
    job.processedAt = new Date();

    // Remove from main queue
    const index = this.jobs.indexOf(job);
    if (index > -1) {
      this.jobs.splice(index, 1);
    }

    // Add to DLQ
    this.deadLetterQueue.push(job);
  }

  getJobs(): Job[] {
    return [...this.jobs];
  }

  getDLQ(): Job[] {
    return [...this.deadLetterQueue];
  }

  getJob(id: string): Job | undefined {
    return this.jobs.find(j => j.id === id) || this.deadLetterQueue.find(j => j.id === id);
  }

  clear(): void {
    this.jobs = [];
    this.deadLetterQueue = [];
  }
}

export default Queue;
