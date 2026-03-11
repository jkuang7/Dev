# Caching Solution

## Approach: Cache-Aside Pattern

This solution implements cache-aside (also called "lazy loading") caching.

## Key Implementation Details

### Cache Class with TTL

```typescript
class Cache {
  private store = new Map<string, { value: T, expiresAt: number }>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const expiresAt = Date.now() + (ttlSeconds || this.defaultTTL) * 1000;
    this.store.set(key, { value, expiresAt });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }
}
```

### Cache-Aside Read

```typescript
app.get('/users/:id', async (req, res) => {
  const cacheKey = `user:${id}`;

  // 1. Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }

  // 2. Cache miss - fetch from DB
  const user = await fetchFromDB(id);

  // 3. Populate cache
  cache.set(cacheKey, user);

  res.set('X-Cache', 'MISS');
  res.json(user);
});
```

### Invalidation on Update

```typescript
app.put('/users/:id', async (req, res) => {
  // Update database
  await updateInDB(id, req.body);

  // Invalidate cache
  cache.delete(`user:${id}`);

  res.json(updatedUser);
});
```

## Cache Patterns Comparison

| Pattern | Description | Pros | Cons |
|---------|-------------|------|------|
| **Cache-Aside** | App manages cache | Simple, flexible | App complexity |
| **Write-Through** | Write to cache + DB | Strong consistency | Write latency |
| **Write-Behind** | Write cache, async DB | Fast writes | Eventual consistency |
| **Read-Through** | Cache fetches from DB | Simpler app code | Cache complexity |

## TTL Considerations

- **Too short**: High miss rate, cache is useless
- **Too long**: Stale data, memory pressure
- **Just right**: Balance freshness vs performance

### Common TTLs by Data Type

| Data Type | TTL | Why |
|-----------|-----|-----|
| User profile | 5-15 min | Changes infrequently |
| Session data | 30 min | Security balance |
| Product catalog | 1-24 hours | Stable data |
| Real-time data | 1-5 sec | Freshness critical |

## Production Considerations

### Redis Extension

```typescript
import Redis from 'ioredis';
const redis = new Redis();

async function getUser(id: string) {
  const cacheKey = `user:${id}`;

  // Check Redis
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from DB
  const user = await db.users.findById(id);

  // Cache with TTL
  await redis.setex(cacheKey, 300, JSON.stringify(user));

  return user;
}
```

### Cache Key Design

```
namespace:entity:id:variant
user:123           # Basic user
user:123:full      # Full profile with relations
user:123:minimal   # Just name and avatar
v2:user:123        # Version for cache invalidation
```

## Common Mistakes

1. **Forgetting to invalidate**: Always invalidate on update
2. **N+1 cache calls**: Batch lookups with mget/mset
3. **Cache stampede**: Multiple requests miss simultaneously
4. **Stale cache after deploys**: Version your cache keys
