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

// Job handler type
export type JobHandler = (job: Job) => Promise<void>;

class Queue {
  private jobs: Job[] = [];
  private deadLetterQueue: Job[] = [];
  private handlers: Map<string, JobHandler> = new Map();
  private baseDelay = 1000; // 1 second base delay for retry

  // TODO: Implement add - create job and add to queue
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
    // Add to queue
    return job;
  }

  // TODO: Implement registerHandler - register a handler for job type
  registerHandler(type: string, handler: JobHandler): void {
    // Register handler
  }

  // TODO: Implement processNext - process the next pending job
  async processNext(): Promise<boolean> {
    // Find next pending job that's ready to process
    // Execute handler
    // Handle success/failure
    // Return true if job was processed, false if queue empty
    return false;
  }

  // TODO: Implement retry logic with exponential backoff
  private scheduleRetry(job: Job): void {
    // Calculate delay: baseDelay * 2^attempt
    // Set nextRetryAt
  }

  // TODO: Implement moveToDLQ
  private moveToDLQ(job: Job): void {
    // Move job to dead letter queue
  }

  // Get all jobs (for testing)
  getJobs(): Job[] {
    return [...this.jobs];
  }

  // Get DLQ jobs (for testing)
  getDLQ(): Job[] {
    return [...this.deadLetterQueue];
  }

  // Get job by ID
  getJob(id: string): Job | undefined {
    return this.jobs.find(j => j.id === id) || this.deadLetterQueue.find(j => j.id === id);
  }

  // Clear all (for testing)
  clear(): void {
    this.jobs = [];
    this.deadLetterQueue = [];
  }
}

export default Queue;
