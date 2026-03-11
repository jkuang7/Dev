# Caching Strategy

Implement caching with proper invalidation.

## Problem

Add caching to an existing "get user profile" endpoint:
- First request hits "database" (simulated with 500ms delay)
- Subsequent requests hit cache (should be <10ms)
- Cache invalidates on user update
- Cache has TTL (time-to-live) to prevent stale data

## Requirements

- Implement cache-aside pattern
- TTL of 60 seconds (use 2s for tests)
- Invalidate cache on PUT /users/:id
- Proper cache key design

## API Endpoints

```
GET /users/:id       → Return user profile (cached)
PUT /users/:id       → Update user, invalidate cache
```

## How to Think About It

1. **Cache-Aside Pattern**:
   ```
   GET /users/123:
   1. Check cache for "user:123"
   2. If hit → return cached data
   3. If miss → fetch from DB, store in cache, return

   PUT /users/123:
   1. Update database
   2. Delete cache key "user:123"
   3. Next GET will re-populate cache
   ```

2. **Why cache-aside?**
   - Simple to implement
   - Cache only populated for accessed data
   - Works with any cache backend

3. **Cache Key Design**:
   - Namespaced: `user:123` not just `123`
   - Versioned: `v1:user:123` for cache invalidation
   - Include relevant params: `user:123:minimal` vs `user:123:full`

4. **TTL Considerations**:
   - Too short: High miss rate, defeats purpose
   - Too long: Stale data
   - Balance based on data change frequency

5. **Invalidation Strategies**:
   - Delete on update (cache-aside)
   - Write-through: Update cache on write
   - Time-based: Let TTL expire

## Tests

```bash
npm test
```

Tests check:
- First request is slow (~500ms)
- Second request is fast (<10ms)
- Update invalidates cache
- TTL causes re-fetch after expiration
