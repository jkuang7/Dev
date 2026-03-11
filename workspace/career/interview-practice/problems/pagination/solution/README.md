# Pagination Solution

## Approach

This solution implements both offset and cursor pagination, choosing automatically based on query parameters.

## Key Implementation Details

### Cursor Encoding

```typescript
function encodeCursor(id: number, createdAt: string): string {
  const data = JSON.stringify({ id, createdAt });
  return Buffer.from(data).toString('base64');
}

function decodeCursor(cursor: string): { id: number; createdAt: string } | null {
  try {
    const data = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}
```

**Why composite cursor (timestamp + id)?**
- Timestamp alone fails if multiple items have same second
- ID alone fails if items are reordered
- Composite ensures stable, unique position

### Cursor Query

```sql
SELECT id, name, created_at
FROM items
WHERE (created_at, id) > (?, ?)
ORDER BY created_at ASC, id ASC
LIMIT ?
```

**Why this works:**
- `(created_at, id) > (cursor_ts, cursor_id)` is a single indexed comparison
- Works correctly even with duplicate timestamps
- No OFFSET = no scanning discarded rows

### hasMore Detection

```typescript
// Fetch limit + 1 items
items = query(limit + 1);
hasMore = items.length > limit;
items = items.slice(0, limit);  // Return only limit items
```

**Why fetch one extra?**
- Avoids second COUNT query
- If we got limit+1, there's more data
- Only return limit items to client

## Performance Comparison

### Offset Pagination

```sql
SELECT * FROM items LIMIT 10 OFFSET 10000;
```

**Performance**: O(offset + limit)
- DB scans 10000 rows, discards them
- Gets worse as offset increases

### Cursor Pagination

```sql
SELECT * FROM items
WHERE (created_at, id) > ('2024-01-01', 100)
LIMIT 10;
```

**Performance**: O(limit)
- Index seek directly to position
- Constant time regardless of "page"

## When to Use Each

| Scenario | Use |
|----------|-----|
| Admin dashboards, small data | Offset |
| Need "jump to page 50" | Offset |
| Total count required | Offset |
| Large/infinite lists | Cursor |
| Real-time data (new items) | Cursor |
| Mobile infinite scroll | Cursor |

## Edge Cases Handled

1. **Empty results**: Return empty array, hasMore: false
2. **Invalid cursor**: Return 400 with error message
3. **End of data**: hasMore: false, no nextCursor
4. **Deleted items**: Cursor still works (position preserved)

## Common Interview Follow-ups

1. **How to handle deleted items?**
   - Cursor points to (ts, id) - works even if item deleted
   - May skip items if many deleted between requests

2. **How to implement "previous page" with cursor?**
   - Either: Store both forward/backward cursors
   - Or: Reverse sort direction with `<` instead of `>`

3. **What if timestamp has duplicates?**
   - Composite key (timestamp, id) ensures uniqueness
   - Both fields must be in WHERE and ORDER BY
