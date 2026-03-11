# Rate Limiter

Build middleware that limits requests per IP address.

## Problem

Implement an Express middleware that:
- Limits to 100 requests per minute per IP
- Returns 429 Too Many Requests when limit exceeded
- Includes Retry-After header showing seconds until reset

## Constraints

- O(1) time per request
- Handle concurrent requests safely
- Memory-efficient for many IPs

## How to Think About It

1. **Data Structure**: What tracks requests per IP? Consider a Map with IP -> request timestamps.

2. **Algorithm Choice**:
   - Fixed window: Simple, but allows bursts at window boundaries
   - Sliding window: Smoother limits, slightly more complex
   - Token bucket: Allows controlled bursts

3. **Distributed Systems**: How would you scale this across multiple servers?
   - Redis for shared state
   - Sticky sessions (less ideal)

4. **Headers**: What should the response include?
   - X-RateLimit-Limit: Max requests
   - X-RateLimit-Remaining: Requests left
   - X-RateLimit-Reset: Window reset time
   - Retry-After: Seconds to wait (on 429)

## Tests

```bash
npm test
```

Tests check:
- Requests under limit pass through
- 101st request returns 429
- Retry-After header is present on 429
