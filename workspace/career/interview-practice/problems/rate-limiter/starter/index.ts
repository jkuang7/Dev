import express, { Request, Response, NextFunction } from 'express';

const app = express();

// TODO: Implement rate limiter middleware
// Requirements:
// - Limit: 100 requests per minute per IP
// - Return 429 when limit exceeded
// - Include Retry-After header (seconds until reset)
// - Include X-RateLimit-* headers

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  // Your implementation here
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
