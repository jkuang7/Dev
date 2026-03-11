# Pagination

Implement both offset-based and cursor-based pagination.

## Problem

Create a paginated GET /items endpoint that supports:

1. **Offset pagination**: `?page=2&limit=10`
2. **Cursor pagination**: `?cursor=abc123&limit=10`

## Requirements

- Handle edge cases: empty results, end of data, invalid cursor
- Return appropriate metadata:
  - Offset: total count, current page, total pages
  - Cursor: hasMore, nextCursor

## Response Format

**Offset pagination:**
```json
{
  "items": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 95,
    "totalPages": 10
  }
}
```

**Cursor pagination:**
```json
{
  "items": [...],
  "pagination": {
    "limit": 10,
    "hasMore": true,
    "nextCursor": "eyJpZCI6MTAsInRzIjoxNzA0NTY3ODkwfQ=="
  }
}
```

## How to Think About It

1. **Why offset pagination degrades at scale:**
   - `OFFSET 10000` means DB scans 10000 rows, discards them
   - O(n) where n = offset value
   - Inconsistent when data changes during pagination

2. **What makes a good cursor:**
   - Unique: No duplicates (timestamp alone fails if same second)
   - Immutable: Value doesn't change
   - Indexed: Fast lookups
   - Common pattern: `timestamp_id` composite

3. **Cursor encoding:**
   - Base64 encode to make opaque to client
   - Client shouldn't parse/modify cursor
   - Encode: `{id, timestamp}` → base64

4. **Edge cases:**
   - Empty results: Return empty array, hasMore: false
   - Invalid cursor: Return 400
   - End of data: hasMore: false, no nextCursor
   - Deleted items: Cursor still works (points to position)

5. **When to use each:**
   - Offset: Small datasets, need total count, admin pages
   - Cursor: Large/infinite lists, real-time data, mobile apps

## Tests

```bash
npm test
```

Tests check:
- Offset pagination with page/limit
- Cursor pagination with cursor/limit
- Edge cases for both types
