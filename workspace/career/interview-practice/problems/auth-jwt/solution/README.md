# JWT Authentication Solution

## Approach

This solution implements stateless authentication using JWT with proper security practices.

## Key Implementation Details

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Why bcrypt?**
- Adaptive: Salt rounds can increase as hardware improves
- Built-in salt: No need to manage salt separately
- Timing-safe: `bcrypt.compare` prevents timing attacks

### JWT Generation

```typescript
function generateToken(userId: string): string {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET,
    { expiresIn: '1h', algorithm: 'HS256' }
  );
}
```

**Claims explained:**
- `sub`: Subject (user ID) - who this token is for
- `exp`: Expiration - automatically added by `expiresIn`
- `iat`: Issued at - automatically added

### Preventing Email Enumeration

```typescript
// Bad: Reveals email exists
if (!user) return res.status(404).json({ error: 'User not found' });
if (!validPassword) return res.status(401).json({ error: 'Wrong password' });

// Good: Same error for both
if (!user || !validPassword) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

### Timing Attack Prevention

Even if user doesn't exist, we still run a password comparison:

```typescript
if (!user) {
  // Dummy compare to take same time as real comparison
  await bcrypt.compare(password, '$2b$10$invalid');
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

## Security Checklist

- [x] Passwords hashed with bcrypt (never plain text)
- [x] JWT has expiration (`exp` claim)
- [x] Same error for wrong email and wrong password
- [x] Protected routes verify token on every request
- [x] Token validated with proper secret
- [x] Password minimum length enforced

## Common Mistakes to Avoid

1. **Storing plain text passwords** - Always hash
2. **Using MD5/SHA for passwords** - Use bcrypt/argon2
3. **Putting sensitive data in JWT** - Token is base64, not encrypted
4. **No token expiration** - Always set `exp`
5. **Leaking email existence** - Same error message for all auth failures

## Production Considerations

1. **Use environment variables for secrets**
   ```bash
   JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Consider refresh tokens** for better security:
   - Access token: 15 minutes
   - Refresh token: 7 days, stored in httpOnly cookie

3. **Add rate limiting** on login to prevent brute force

4. **Use HTTPS** - JWT is not encrypted, just signed
