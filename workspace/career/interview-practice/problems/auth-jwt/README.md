# JWT Authentication

Implement user authentication using JSON Web Tokens.

## Problem

Build an Express API with:
- `POST /register` - Create user with email/password
- `POST /login` - Return JWT on valid credentials
- `GET /me` - Protected route, return user info if valid token

## Requirements

- Hash passwords with bcrypt (never store plain text)
- JWT should include `sub` (user id), `exp`, `iat` claims
- Protected routes return 401 if no/invalid token
- Token expires in 1 hour

## Constraints

- Passwords must be at least 8 characters
- Use timing-safe comparison for secrets
- Don't leak whether email exists on login failure

## How to Think About It

1. **Why JWT?**
   - Stateless: No server-side session storage
   - Portable: Can be used across services
   - Self-contained: Claims embedded in token

2. **Access + Refresh Pattern** (bonus):
   - Access token: Short-lived (15min), used for API calls
   - Refresh token: Long-lived (7d), used to get new access token
   - Why: If access token leaked, damage is time-limited

3. **What claims belong in JWT?**
   - `sub`: Subject (user ID)
   - `exp`: Expiration time
   - `iat`: Issued at time
   - `iss`: Issuer (optional, for multi-service)
   - NEVER: passwords, PII, sensitive data

4. **Security Considerations**:
   - Use strong secret (256+ bits of entropy)
   - Set reasonable expiration
   - Validate `exp` claim on every request
   - Use HTTPS in production

## Tests

```bash
npm test
```

Tests check:
- Registration creates user with hashed password
- Login returns valid JWT
- Protected route works with valid token
- Protected route returns 401 without token
