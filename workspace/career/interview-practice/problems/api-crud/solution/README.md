# REST API Solution

## Approach

This solution implements a complete CRUD API with proper HTTP semantics, validation, and consistent error handling.

## Key Implementation Details

### Validation with Zod

```typescript
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  completed: z.boolean().optional().default(false),
});

function validate(schema: z.ZodSchema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Transform to API error format
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Invalid input', details));
      }
    }
  };
}
```

### Consistent Error Response

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

function errorResponse(code: string, message: string, details?): ApiError {
  return {
    error: { code, message, ...(details && { details }) },
  };
}
```

### HTTP Status Codes Used

| Status | When Used |
|--------|-----------|
| 200 | GET success, PUT success |
| 201 | POST success (resource created) |
| 204 | DELETE success (no content) |
| 400 | Validation error |
| 404 | Resource not found |
| 500 | Unexpected server error |

## REST Best Practices

### 1. Use Nouns for Resources
- `/tasks` not `/getTasks` or `/createTask`

### 2. HTTP Methods Define Actions
- GET = Read
- POST = Create
- PUT = Replace
- PATCH = Partial update
- DELETE = Remove

### 3. Idempotency
- GET, PUT, DELETE are idempotent
- POST is not idempotent

### 4. Status Codes Matter
- 2xx = Success
- 4xx = Client error (your fault)
- 5xx = Server error (our fault)

### 5. Consistent Response Structure
All errors follow same structure:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [...]
  }
}
```

## Common Interview Questions

1. **PUT vs PATCH?**
   - PUT: Replace entire resource
   - PATCH: Partial update

2. **POST vs PUT for creation?**
   - POST: Server generates ID
   - PUT: Client provides ID

3. **What about 422 Unprocessable Entity?**
   - 400: Malformed request
   - 422: Valid syntax, semantic error
   - Either is acceptable for validation errors

4. **When to use 204 vs 200?**
   - 204: Success, no body
   - 200: Success with body
