# Interview Practice Kit

Practice problems for senior backend engineer interviews. Each problem is self-contained with starter code, tests, and solutions.

## Quick Start

```bash
# List available problems
./practice.sh list

# Start a problem (copies to workspace)
./practice.sh start rate-limiter
cd workspace/rate-limiter
npm install
npm test

# Reset if you want to start over
./practice.sh reset rate-limiter

# See the solution when ready
./practice.sh reveal rate-limiter
```

## Requirements

- Node 18+
- npm

## Problems

| Problem | Difficulty | Topics |
|---------|------------|--------|
| rate-limiter | Core | Middleware, algorithms, distributed systems |
| auth-jwt | Core | Security, JWT, password hashing |
| api-crud | Warm-up | REST, HTTP semantics, validation |
| pagination | Core | Cursor vs offset, database optimization |
| caching | Core | Cache-aside, TTL, invalidation |
| background-jobs | Core | Async, retry, dead letter queues |
| slow-code | Advanced | Debugging, N+1, profiling |

### Difficulty Levels

- **Warm-up**: Fundamentals, good for starting
- **Core**: Expected at senior level, asked frequently
- **Advanced**: Deep dives, senior+ expectations

## How to Practice Effectively

1. **Set a timer** (45-60 min) - real interviews are timed
2. **Talk out loud** - narrate your thought process
3. **No peeking** - try to solve before revealing solution
4. **Focus on tests** - make them pass one at a time
5. **Review solution** - understand the "why" not just the "how"

## Workspace

Your work goes in `workspace/`. It's gitignored so you can experiment freely. Use `reset` to start fresh.
