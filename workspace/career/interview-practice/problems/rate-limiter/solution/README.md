# Rate Limiter Solution

## Approach: Sliding Window Log

We use a sliding window approach that tracks timestamps of recent requests per IP.

### Why Sliding Window?

- **Fixed Window Problem**: Allows 2x burst at window boundaries (e.g., 100 requests at 0:59, 100 more at 1:01)
- **Sliding Window**: Smoother limiting, counts requests in the last 60 seconds from NOW

### Implementation

```typescript
const requests = new Map<string, number[]>();  // IP -> timestamps

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const windowStart = now - 60000;  // 1 minute ago

  // Get or create request log for this IP
  let timestamps = requests.get(ip) || [];

  // Remove old entries (outside window)
  timestamps = timestamps.filter(t => t > windowStart);

  // Check limit
  if (timestamps.length >= 100) {
    const oldestInWindow = timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + 60000 - now) / 1000);

    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Too Many Requests' });
  }

  // Allow request
  timestamps.push(now);
  requests.set(ip, timestamps);

  res.set('X-RateLimit-Limit', '100');
  res.set('X-RateLimit-Remaining', String(100 - timestamps.length));

  next();
}
```

### Complexity

- **Time**: O(n) for filtering, but n is bounded by limit (100)
- **Space**: O(IPs × limit) = O(IPs × 100)

### Production Considerations

1. **Memory Cleanup**: Add periodic cleanup of IPs with no recent requests
2. **Redis**: For distributed systems, use Redis sorted sets with ZADD/ZRANGEBYSCORE
3. **Token Bucket**: Alternative for allowing controlled bursts

### Redis Extension

```typescript
async function rateLimiterRedis(req, res, next) {
  const key = `ratelimit:${req.ip}`;
  const now = Date.now();
  const windowStart = now - 60000;

  // Atomic operation with Redis transaction
  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, windowStart);  // Remove old
  multi.zcard(key);                              // Count current
  multi.zadd(key, now, `${now}`);               // Add this request
  multi.expire(key, 60);                         // Auto-cleanup

  const [, count] = await multi.exec();

  if (count >= 100) {
    return res.status(429).json({ error: 'Too Many Requests' });
  }

  next();
}
```
