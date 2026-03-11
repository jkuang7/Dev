# Debug Slow Code

Identify and fix performance bottlenecks in an API endpoint.

## Problem

Given: An API endpoint that takes 5+ seconds to respond
Task: Identify bottlenecks and optimize to <200ms
Constraint: Don't change the API contract, maintain correctness

## The Endpoint

`GET /users-with-posts` - Returns all users with their post counts

Currently takes ~5 seconds. Your goal: make it fast.

## How to Think About It

1. **Where to start?**
   - Measure first, don't guess
   - Add timing logs around each operation
   - Profile to find the bottleneck

2. **Common culprits:**
   - **N+1 queries**: Fetching related data in a loop
   - **Missing indexes**: Table scans instead of index lookups
   - **SELECT ***: Fetching more data than needed
   - **No pagination**: Loading entire dataset

3. **How to identify N+1:**
   - Look for loops with database calls inside
   - Count queries - should be O(1), not O(n)
   - Use query logging to see repeated patterns

4. **When to add indexes:**
   - Columns used in WHERE clauses
   - Columns used in JOIN conditions
   - Columns used in ORDER BY

5. **Profiling approaches:**
   - Console.time / timeEnd
   - APM tools (Datadog, New Relic)
   - Database query explain plans

## Intentional Problems (find and fix them)

The starter code has these issues:
1. N+1 query pattern
2. Missing index on a frequently queried column
3. Unnecessary data fetching (SELECT *)

## Tests

```bash
npm test
```

Tests check:
- Correctness preserved (same data returned)
- Performance improved (before vs after timing)
