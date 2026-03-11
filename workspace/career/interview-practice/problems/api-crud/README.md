# REST API Design

Build a complete CRUD API with proper HTTP semantics.

## Problem

Create a REST API for a "tasks" resource (todo-like):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | List all tasks |
| GET | /tasks/:id | Get single task |
| POST | /tasks | Create task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

## Requirements

- Proper HTTP status codes (200, 201, 400, 404, 500)
- Structured error responses with error codes
- Input validation with helpful error messages
- Consistent response structure

## Task Schema

```typescript
interface Task {
  id: string;
  title: string;      // required, 1-100 chars
  description?: string;
  completed: boolean; // default: false
  createdAt: string;
  updatedAt: string;
}
```

## How to Think About It

1. **HTTP Methods**:
   - GET: Read (safe, idempotent)
   - POST: Create (not idempotent)
   - PUT: Replace (idempotent)
   - PATCH: Partial update (not always idempotent)
   - DELETE: Remove (idempotent)

2. **Status Codes**:
   - 200: Success (with body)
   - 201: Created (POST success)
   - 204: No Content (DELETE success, optional)
   - 400: Bad Request (validation error)
   - 404: Not Found
   - 409: Conflict (duplicate)
   - 500: Server Error

3. **Error Response Structure**:
   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Invalid input",
       "details": [
         { "field": "title", "message": "Title is required" }
       ]
     }
   }
   ```

4. **Idempotency**:
   - PUT same data twice = same result
   - DELETE same resource twice = 404 on second (or 204)
   - POST same data twice = two resources

## Tests

```bash
npm test
```

Tests check:
- All 5 CRUD operations work
- Validation errors return 400
- Missing resources return 404
- Response structure is consistent
