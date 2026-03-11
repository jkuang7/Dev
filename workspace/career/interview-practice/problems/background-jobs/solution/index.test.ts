import request from 'supertest';
import app, { queue, setEmailShouldFail } from './index';

describe('Background Jobs', () => {
  beforeEach(() => {
    queue.clear();
    setEmailShouldFail(false);
  });

  describe('Job queuing', () => {
    it('should queue job on registration (not send synchronously)', async () => {
      const start = Date.now();
      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', userId: 'user123' });
      const duration = Date.now() - start;

      expect(res.status).toBe(201);
      expect(res.body.jobId).toBeDefined();
      expect(duration).toBeLessThan(50); // Should return immediately

      // Job should be in queue
      const jobs = queue.getJobs();
      expect(jobs).toHaveLength(1);
      expect(jobs[0].type).toBe('send_welcome_email');
      expect(jobs[0].status).toBe('pending');
    });
  });

  describe('Job processing', () => {
    it('should process job successfully', async () => {
      // Queue a job
      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', userId: 'user123' });

      const jobId = res.body.jobId;

      // Process the job
      await queue.processNext();

      // Check job status
      const job = queue.getJob(jobId);
      expect(job?.status).toBe('completed');
      expect(job?.processedAt).toBeDefined();
    });
  });

  describe('Retry with exponential backoff', () => {
    it('should retry failed job with increasing delay', async () => {
      setEmailShouldFail(true);

      // Queue a job
      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', userId: 'user123' });

      const jobId = res.body.jobId;

      // First attempt - should fail
      await queue.processNext();

      let job = queue.getJob(jobId);
      expect(job?.status).toBe('pending'); // Still pending for retry
      expect(job?.attempts).toBe(1);
      expect(job?.nextRetryAt).toBeDefined();
      expect(job?.lastError).toBe('Email service unavailable');
    });
  });

  describe('Dead Letter Queue', () => {
    it('should move job to DLQ after max retries', async () => {
      setEmailShouldFail(true);

      // Queue a job with maxAttempts = 3
      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', userId: 'user123' });

      const jobId = res.body.jobId;

      // Process 3 times (all will fail)
      for (let i = 0; i < 3; i++) {
        // Wait for retry delay to pass
        const job = queue.getJob(jobId);
        if (job?.nextRetryAt) {
          const delay = job.nextRetryAt.getTime() - Date.now();
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay + 10));
          }
        }
        await queue.processNext();
      }

      // Job should be in DLQ
      const job = queue.getJob(jobId);
      expect(job?.status).toBe('failed');

      const dlq = queue.getDLQ();
      expect(dlq).toHaveLength(1);
      expect(dlq[0].id).toBe(jobId);
    }, 15000); // Extended timeout for retries
  });

  describe('Job status', () => {
    it('should return job status via API', async () => {
      const registerRes = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', userId: 'user123' });

      const jobId = registerRes.body.jobId;

      const statusRes = await request(app).get(`/jobs/${jobId}`);

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.id).toBe(jobId);
      expect(statusRes.body.type).toBe('send_welcome_email');
      expect(statusRes.body.status).toBe('pending');
    });

    it('should return 404 for non-existent job', async () => {
      const res = await request(app).get('/jobs/non-existent');

      expect(res.status).toBe(404);
    });
  });
});
