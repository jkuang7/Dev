# Debug Slow Code Solution

## Problems Identified

### 1. N+1 Query Pattern

**Before (slow):**
```typescript
const users = await getAllUsers();         // 1 query
for (const user of users) {
  const posts = await getPostsByUserId(user.id);  // 50 queries!
}
// Total: 51 queries, 50 × 50ms = 2.5s
```

**After (fast):**
```typescript
const result = await getUsersWithPostCounts();  // 1 query with JOIN
// Total: 1 query, ~50ms
```

### 2. SELECT * (Unnecessary Data)

**Before:**
```sql
SELECT * FROM users  -- Returns bio, avatar, preferences
```

**After:**
```sql
SELECT id, name, email FROM users  -- Only needed fields
```

### 3. Missing JOIN

**Before:** Separate queries for users and posts
**After:** Single query with aggregation

```sql
SELECT u.id, u.name, u.email, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.name, u.email
```

## Profiling Approach

### Step 1: Add Timing

```typescript
app.get('/users-with-posts', async (req, res) => {
  console.time('total');

  console.time('fetch-users');
  const users = await getAllUsers();
  console.timeEnd('fetch-users');

  console.time('fetch-posts');
  for (const user of users) {
    const posts = await getPostsByUserId(user.id);
  }
  console.timeEnd('fetch-posts');

  console.timeEnd('total');
});
```

### Step 2: Analyze Output

```
fetch-users: 50ms
fetch-posts: 2500ms   ← Bottleneck!
total: 2550ms
```

### Step 3: Fix the Bottleneck

Replace N+1 with single JOIN query.

## Performance Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Queries | 51 | 1 | 51x fewer |
| Latency | 2550ms | 100ms | 25x faster |
| Data transferred | Large | Minimal | Less bandwidth |

## How to Identify These Issues

### N+1 Queries

Signs:
- Loop with await inside
- Query count grows with data size
- Linear slowdown with more records

Detection:
- Enable query logging
- Count queries per request
- Look for repeated patterns

### Missing Indexes

Signs:
- Full table scans in EXPLAIN
- Slow WHERE clauses
- Slow ORDER BY

Detection:
```sql
EXPLAIN SELECT * FROM posts WHERE user_id = 1;
-- Look for "Seq Scan" vs "Index Scan"
```

### Unnecessary Data

Signs:
- Large response payloads
- Fetching unused columns
- Transferring BLOBs unnecessarily

Detection:
- Check response size
- Compare fields used vs fetched
- Review SELECT statements

## Production Tips

1. **Always measure first** - Don't guess where the bottleneck is
2. **Use APM tools** - DataDog, New Relic for real production profiling
3. **Add query logging in dev** - See exactly what queries run
4. **Test with realistic data** - N+1 problems may not show with 5 rows
