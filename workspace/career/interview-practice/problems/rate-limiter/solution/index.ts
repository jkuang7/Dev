import express, { Request, Response, NextFunction } from 'express';

const app = express();

// Sliding window rate limiter
const LIMIT = 100;
const WINDOW_MS = 60 * 1000; // 1 minute

// Store: IP -> array of request timestamps
const requestLogs = new Map<string, number[]>();

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Get or create request log for this IP
  let timestamps = requestLogs.get(ip) || [];

  // Remove timestamps outside the window
  timestamps = timestamps.filter(t => t > windowStart);

  // Set rate limit headers
  res.set('X-RateLimit-Limit', String(LIMIT));
  res.set('X-RateLimit-Remaining', String(Math.max(0, LIMIT - timestamps.length)));

  // Check if limit exceeded
  if (timestamps.length >= LIMIT) {
    // Calculate when the oldest request in window will expire
    const oldestInWindow = timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000);

    res.set('Retry-After', String(retryAfter));
    res.set('X-RateLimit-Reset', String(Math.ceil((oldestInWindow + WINDOW_MS) / 1000)));

    return res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: retryAfter,
    });
  }

  // Record this request
  timestamps.push(now);
  requestLogs.set(ip, timestamps);

  next();
}

app.use(rateLimiter);

app.get('/api/resource', (req: Request, res: Response) => {
  res.json({ message: 'Success' });
});

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
