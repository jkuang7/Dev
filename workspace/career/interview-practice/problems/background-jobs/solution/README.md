# Background Jobs Solution

## Approach

Simple in-memory job queue with retry logic and dead letter queue.

## Key Implementation Details

### Queue with Retry

```typescript
class Queue {
  private jobs: Job[] = [];
  private deadLetterQueue: Job[] = [];
  private baseDelay = 1000; // 1 second

  async processNext(): Promise<boolean> {
    const job = this.findNextReady();
    if (!job) return false;

    job.status = 'processing';
    job.attempts++;

    try {
      await this.handlers.get(job.type)(job);
      job.status = 'completed';
    } catch (error) {
      job.lastError = error.message;

      if (job.attempts >= job.maxAttempts) {
        this.moveToDLQ(job);
      } else {
        this.scheduleRetry(job);
      }
    }

    return true;
  }

  private scheduleRetry(job: Job): void {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    const delay = this.baseDelay * Math.pow(2, job.attempts - 1);
    job.nextRetryAt = new Date(Date.now() + delay);
    job.status = 'pending';
  }
}
```

### Async Registration

```typescript
app.post('/register', (req, res) => {
  // Queue job - returns immediately
  const job = queue.add('send_welcome_email', {
    email: req.body.email,
    userId: req.body.userId,
  });

  // Response doesn't wait for email
  res.status(201).json({
    message: 'Registration successful',
    jobId: job.id,
  });
});
```

## Retry Patterns

### Exponential Backoff

```
Attempt 1: immediate
Attempt 2: wait 1s
Attempt 3: wait 2s
Attempt 4: wait 4s (if maxAttempts > 3)
...
```

**Why exponential?**
- Temporary failures often resolve with time
- Prevents hammering failing service
- Gives systems time to recover

### With Jitter

```typescript
const delay = baseDelay * Math.pow(2, attempts - 1);
const jitter = Math.random() * 1000; // Add 0-1s random
job.nextRetryAt = new Date(Date.now() + delay + jitter);
```

**Why jitter?**
- Prevents "thundering herd" when many jobs retry at same time
- Spreads load on downstream services

## Dead Letter Queue

### When to Use

- After max retries exhausted
- For unrecoverable errors
- When manual investigation needed

### DLQ Handling

```typescript
private moveToDLQ(job: Job): void {
  job.status = 'failed';
  this.deadLetterQueue.push(job);

  // Could also:
  // - Alert ops team
  // - Log to monitoring
  // - Trigger alarm
}
```

## Production Considerations

### Redis-Based Queue (Bull)

```typescript
import Queue from 'bull';

const emailQueue = new Queue('email', 'redis://localhost:6379');

// Producer
emailQueue.add('send_welcome', { email, userId }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
});

// Consumer
emailQueue.process('send_welcome', async (job) => {
  await sendEmail(job.data.email);
});

// Failed jobs handler
emailQueue.on('failed', (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    // Move to DLQ
  }
});
```

### Idempotency

```typescript
emailQueue.process(async (job) => {
  // Check if already sent
  const sent = await redis.get(`email:sent:${job.data.userId}`);
  if (sent) return; // Already done

  await sendEmail(job.data.email);

  // Mark as sent (with TTL)
  await redis.setex(`email:sent:${job.data.userId}`, 86400, '1');
});
```

## Common Interview Questions

1. **How to handle exactly-once delivery?**
   - Impossible in distributed systems
   - Use at-least-once + idempotency

2. **What if worker crashes mid-job?**
   - Job stays in "processing" state
   - Use visibility timeout (job returns to queue if not acked)

3. **How to prioritize jobs?**
   - Priority queues
   - Multiple queues with different workers

4. **How to scale?**
   - Multiple workers pulling from same queue
   - Horizontal scaling
