# Background Jobs

Implement a job queue with retry and dead letter queue.

## Problem

Build a job queue for "send welcome email after registration":
- Jobs queue asynchronously (don't block request)
- Failed jobs retry 3 times with exponential backoff
- Jobs that fail all retries go to dead letter queue (DLQ)
- Track job status: pending → processing → completed/failed

## Requirements

- `POST /register` queues email job and returns immediately
- Jobs process in background
- Retry with exponential backoff (1s, 2s, 4s)
- Maximum 3 retry attempts
- Jobs failing all retries move to DLQ

## Job Schema

```typescript
interface Job {
  id: string;
  type: 'send_welcome_email';
  data: { userId: string; email: string };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: Date;
  processedAt?: Date;
}
```

## How to Think About It

1. **Why async?**
   - Don't block HTTP response waiting for email
   - Handle failures gracefully (retry later)
   - Decouple registration from email sending

2. **Idempotency**:
   - What if job runs twice? (network timeout, crash)
   - Use idempotency key or check if email already sent
   - At-least-once vs exactly-once delivery

3. **Exponential backoff**:
   - Why: Temporary failures often recover with time
   - Formula: `delay = baseDelay * 2^attempt`
   - 1s → 2s → 4s → DLQ

4. **Dead Letter Queue (DLQ)**:
   - Where jobs go after max retries
   - Allows investigation of repeated failures
   - Can be manually retried or discarded

5. **Preventing duplicates**:
   - Job ID as idempotency key
   - Check "was email sent to this user?" before processing

## Tests

```bash
npm test
```

Tests check:
- Job queued on registration (not sent synchronously)
- Failed job retries with delay
- Job moves to DLQ after 3 failures
- Successful job marked completed
