# _reference_goals.md - Detailed Templates & Examples

> **Used by**: `/goals` for templates, examples, and edge cases. Not loaded by default.

---

## The Core Model

```
SPECS.md      →  project-wide intent + judgment boundaries
        ↓
CONTRACTS.md  →  data shapes + observable behaviors
        ↓
GOALS.md      →  per-goal constraints (subset, made specific)
        ↓
/run          →  executes one goal at a time from queue
```

**Key insight**: Goals are self-contained LLM prompts. /run reads one goal prompt and has everything it needs to execute.

---

## Full Goal Prompt Template

```markdown
### G{n} ⬜ — {verb} {noun} {context}

**Task:** {One sentence describing what "done" means.
Must be one sentence. No "and". Imperative form.}

**File scope:** `{path/to/file.ext}` ({new file | modify existing})
{If multiple files, list each on own line, max 3}

**Input:** {What this goal receives}
  - Shape: {reference to CONTRACTS.md or inline type}
  - Source: {where it comes from — API, user input, previous goal}

**Output:** {What this goal produces}
  - Shape: {reference to CONTRACTS.md or inline type}
  - Destination: {where it goes — next goal, UI, database}

**Constraints:**
- {Do NOT...} — {why}
- {Do NOT...} — {why}
- {MUST...} — {why}
- {MUST...} — {why}

**Verify:** {The one observation that proves this works}
  - {Specific test or command}
  - {Expected output}

**Acceptance criteria:**
- [ ] {Binary pass/fail criterion 1}
- [ ] {Binary pass/fail criterion 2}
- [ ] {Binary pass/fail criterion 3}

**Depends on:** {G{n} — brief reason | None}
**PRD ref:** §{SPECS.md section} [{DECIDED}: {decision}]
**Contract ref:** CONTRACTS.md → {section}

**Risk gate:** If {assumption} is wrong, {what to do}.
```

---

## Sizing Rules Deep Dive

### Check 1: One Sentence Task

**The rule**: If you can't describe WHAT in one sentence, split.

```
BAD:  "Parse Yahoo Finance response and transform into internal schema
       and validate required fields and handle missing data gracefully."

GOOD: "Transform raw Yahoo JSON into internal StockData schema."
```

**Why**: A multi-sentence task hides multiple concerns. Each concern is a separate goal.

---

### Check 2: 1-3 Files Touched

**The rule**: More than 3 files = multiple concerns tangled.

```
BAD:  File scope:
      - src/api/yahoo.ts
      - src/data/normalize.ts
      - src/cache/redis.ts
      - src/components/StockCard.tsx
      - src/hooks/useStock.ts

GOOD: File scope: `src/data/normalize.ts` (new file)
```

**Why**: If one goal touches many files, it's doing too much. Split by layer or concern.

**Exception**: If files are tightly coupled (e.g., component + its styles), OK to count as 1.

---

### Check 3: One Observation to Verify

**The rule**: If you need two unrelated checks, you have two goals.

```
BAD:  Verify:
      - Unit test passes for transformation
      - API response time < 200ms
      - UI shows loading skeleton

GOOD: Verify: Unit test — raw fixture JSON in, normalized StockData out.
      - All fields present and correctly typed
      - sparklineData sorted ascending by date
```

**Why**: Multiple unrelated verifications = multiple goals bundled together. Split them.

**OK**: Multiple related verifications (all testing same behavior) are fine.

---

### Check 4: Short Constraints List

**The rule**: If constraints list has 10+ items, scope is too wide.

```
BAD:  Constraints:
      - Do NOT call API directly
      - Do NOT handle errors here
      - Do NOT modify cache
      - Do NOT touch UI layer
      - Do NOT add dependencies
      - MUST use TypeScript strict mode
      - MUST handle all field types
      - MUST sort chronologically
      - MUST validate input shape
      - MUST throw typed errors
      - MUST support partial data
      - MUST log transformation steps

GOOD: Constraints:
      - Do NOT call API — receives already-fetched JSON
      - Do NOT handle errors here — caller handles (G5, G6)
      - Missing fields → throw typed error, not partial data
      - sparklineData[] must be sorted chronologically
```

**Why**: Long constraints = trying to prevent too many things = goal is too big.

---

### Check 5: No "And" in Task

**The rule**: "X and Y" = two goals.

```
BAD:  Task: "Add Redis caching AND wire cached data to StockCard"

GOOD:
  G7: Task: "Add Redis cache layer for Yahoo API responses"
  G8: Task: "Wire StockCard to use cached stock data"
```

**Why**: "And" is a tell that you're bundling separate concerns.

---

## Constraint Inheritance Examples

### From SPECS.md → GOALS.md

**SPECS.md says:**
```markdown
### Performance
**Latency budget**: [DECIDED] 2 second refresh
- Critical path: API call → cache check → return
```

**Goal G4 constraints include:**
```markdown
**Constraints:**
- Cache lookup must complete in < 50ms
- API call timeout: 2000ms max

**PRD ref:** §Performance [DECIDED: 2 second refresh]
```

The goal's constraint is a **specific subset** of the project-wide constraint.

---

### From CONTRACTS.md → GOALS.md

**CONTRACTS.md says:**
```markdown
### Data Shape
Response: { ticker, price, dcfValue, marginOfSafety, sparklineData[] }
sparklineData: { date: ISO string, close: number }[]
```

**Goal G3 references:**
```markdown
**Output:** StockData { ticker, price, dcfValue, marginOfSafety, sparklineData[] }

**Contract ref:** CONTRACTS.md → StockCard → Data Shape
```

The goal **points to** the contract for the authoritative shape definition.

---

### Checking Constraint Coverage

After generating all goals, verify:

```
SPECS.md constraint                 | Covered by goal(s)
────────────────────────────────────┼────────────────────
Refresh under 2 seconds             | G4 (cache), G5 (timeout)
Data from Yahoo Finance             | G2 (API call), G3 (parse)
Error shows "Retry?" button         | G6 (error handling)
Stale data shows "may be stale"     | G7 (fallback state)
Auth: none required                 | (no goals needed)
```

**AI flags**: "SPECS.md says 'rate limiting TBD' — no goal addresses this. Add or mark [OPEN]?"

---

## Dependency Wiring

### Simple Chain

```
G1 → G2 → G3 → G4
```

G2 depends on G1. G3 depends on G2. Etc.

```markdown
### G2 ⬜ — Parse Yahoo Finance response
...
**Depends on:** G1 (need API response shape first)
```

### Parallel + Converge

```
G1 → G2 ─┐
         ├→ G4
G1 → G3 ─┘
```

G4 depends on both G2 and G3.

```markdown
### G4 ⬜ — Wire data to StockCard
...
**Depends on:** G2 (normalized data), G3 (cache layer)
```

### No Dependencies

```markdown
### G1 ⬜ — Set up Redis connection
...
**Depends on:** None (foundation task)
```

---

## Risk Gates

### When to Add Risk Gates

| Situation | Risk Gate |
|-----------|-----------|
| Assumption about external API | If API shape differs from docs |
| Third-party service dependency | If service unavailable |
| Performance assumption | If latency exceeds budget |
| Data availability | If required data not in response |

### Risk Gate Examples

```markdown
**Risk gate:** If Yahoo's actual response differs from documented shape,
update CONTRACTS.md → YahooResponse and revisit G3.
```

```markdown
**Risk gate:** If Redis connection fails during testing,
fall back to in-memory cache for M1, defer Redis to M2.
```

```markdown
**Risk gate:** If API latency exceeds 2s in testing,
escalate to /spec to revisit caching strategy.
```

---

## Round 1: Candidate Generation

### What to Generate

From SPECS.md + CONTRACTS.md, extract:
- Each [DECIDED] that needs implementation
- Each data shape that needs code
- Each action that needs a handler
- Each state in state machines
- Each error case

### Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GOAL CANDIDATES — stock-dashboard M1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UNORDERED — you decide priority:

From SPECS.md [DECIDED] items:
• Set up Redis cache layer
• Configure Yahoo Finance API client
• Implement 5-minute cache TTL
• Add retry logic (1 retry on cache miss)

From CONTRACTS.md data shapes:
• Parse Yahoo Finance response → StockData
• Transform sparkline data (sort chronologically)

From CONTRACTS.md actions:
• Handle refresh button click
• Handle search input submit
• Handle add-to-watchlist action

From CONTRACTS.md state machines:
• Implement loading → success | error | stale transitions
• Add empty state ("No stocks added yet")
• Add error state with retry button

From CONTRACTS.md timing:
• Ensure refresh < 2 seconds (with caching)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What's wrong?
- What's missing?
- What should I split?
- What should I merge?
- What's out of scope for M1?
- What's the riskiest (should be first)?
```

---

## Round 2: Human Steering Examples

### Reordering by Risk

**Human says:**
```
Redis first — it's the riskiest, need to validate connection early.
Then API client. Then parsing. Then UI wiring last.
```

**AI interprets:**
```
New order:
1. Redis cache layer (risk: connection issues)
2. Yahoo API client (risk: rate limits, response shape)
3. Parse response (depends on 2)
4. Cache integration (depends on 1, 3)
5. UI wiring (depends on 4)
...
```

---

### Splitting Goals

**Human says:**
```
Split "error handling" into:
- Rate limit errors (need exponential backoff)
- Network errors (simple retry)
- Invalid ticker (no retry, user error)
```

**AI creates:**
```
• Handle rate limit errors with exponential backoff
• Handle network errors with simple retry
• Handle invalid ticker (show error immediately, no retry)
```

---

### Killing Out-of-Scope

**Human says:**
```
Kill dark mode and settings page — that's M2.
```

**AI removes from candidates, notes:**
```
Deferred to M2:
- Dark mode toggle
- Settings page
```

---

### Adding Missing

**Human says:**
```
Missing: we need to handle the case where cache is stale but API is down.
Should show cached data with "may be stale" indicator.
```

**AI adds:**
```
• Handle stale fallback (show cached + "may be stale" when API down)
```

---

### Merging Goals

**Human says:**
```
Merge "loading skeleton" and "loading state" — they're the same concern.
```

**AI merges:**
```
Before:
• Show loading skeleton
• Implement loading state

After:
• Implement loading state with skeleton UI
```

---

## Round 3: Sizing Flags

### Flag Format

```markdown
### G7 ⬜ — Add caching and wire to UI

⚠️ **SIZING FLAG**: "and" in task — suggests two goals
   Suggested split:
   - G7a: Add Redis cache layer for API responses
   - G7b: Wire StockCard to consume cached data

**Task:** Add Redis caching for API responses AND wire cached data to StockCard.
```

### Common Flags

| Violation | Flag Message |
|-----------|--------------|
| Multi-sentence task | "Task has multiple sentences — split by concern" |
| 4+ files | "Touches {n} files — likely multiple concerns" |
| Multiple verifications | "Verify section has {n} unrelated checks — split" |
| 10+ constraints | "Constraint list is long ({n} items) — scope too wide" |
| "And" in task | "'and' in task — suggests two goals" |

---

## Round 4: Final Pass Checklist

```markdown
FINAL REVIEW — {project} M1
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Goal count: {n}
Dependency chains: {visualized}

CHECK EACH GOAL:
□ Task is one sentence, no "and"
□ File scope is 1-3 files
□ Input/Output shapes reference CONTRACTS.md
□ Constraints are specific (not generic)
□ Verify is one observation
□ Acceptance criteria are binary
□ Dependencies are correct
□ PRD ref points to actual SPECS.md section
□ Contract ref points to actual CONTRACTS.md section
□ Risk gate covers uncertain assumptions

COVERAGE CHECK:
□ All SPECS.md [DECIDED] items have goals
□ All CONTRACTS.md actions have handlers
□ All CONTRACTS.md states have implementations
□ Constraint union covers SPECS.md constraints

READY?
- "Ship it" → Emit GOALS.md
- Corrections → AI updates, repeat Round 4
```

---

## GOALS.md Full Template

```markdown
# GOALS.md

## Overview
**Project**: stock-dashboard
**Milestone**: M1 — Stock Data Pipeline
**Specs ref**: SPECS.md v1
**Contracts ref**: CONTRACTS.md v1
**Generated**: {date}

## Summary
Goals: 9 total | ⬜ 9 pending | 🔄 0 in progress | ✅ 0 done | 🅿️ 0 parked

---

## Goals

### G1 ⬜ — Set up Redis connection and cache layer

**Task:** Initialize Redis client with connection pooling and basic get/set operations.

**File scope:** `src/cache/redis.ts` (new file)

**Input:** None (infrastructure setup)
**Output:** Redis client singleton with get/set/del methods

**Constraints:**
- Do NOT add application-specific cache logic here
- Connection timeout: 5 seconds
- Retry connection 3 times on failure
- Log connection status

**Verify:** Integration test — connect, set key, get key, delete key.
  - All operations succeed
  - Connection timeout triggers retry

**Acceptance criteria:**
- [ ] `redis.set('test', 'value')` succeeds
- [ ] `redis.get('test')` returns 'value'
- [ ] `redis.del('test')` succeeds
- [ ] Connection failure triggers 3 retries

**Depends on:** None (foundation task)
**PRD ref:** §Caching [DECIDED: Server-side Redis]
**Contract ref:** N/A (infrastructure)

**Risk gate:** If Redis connection fails in CI, add fallback to in-memory cache.

---

### G2 ⬜ — Configure Yahoo Finance API client

**Task:** Create typed API client for Yahoo Finance quote endpoint.

**File scope:** `src/api/yahoo.ts` (new file)

**Input:** Ticker symbol (string)
**Output:** Raw Yahoo Finance response (shape in CONTRACTS.md → YahooResponse)

**Constraints:**
- Do NOT parse or transform response (that's G3)
- Do NOT cache (that's G4)
- Timeout: 2000ms
- No retry logic here (caller handles)

**Verify:** Integration test — fetch real ticker, receive raw JSON.
  - Response matches YahooResponse shape
  - Timeout triggers after 2000ms

**Acceptance criteria:**
- [ ] `fetchStock('AAPL')` returns raw Yahoo JSON
- [ ] Response has all expected fields
- [ ] Invalid ticker returns error (not crash)
- [ ] Timeout works

**Depends on:** None
**PRD ref:** §Data Sources [DECIDED: Yahoo Finance API]
**Contract ref:** CONTRACTS.md → YahooResponse

**Risk gate:** If Yahoo response shape differs from docs, update CONTRACTS.md.

---

### G3 ⬜ — Parse and normalize Yahoo Finance response

**Task:** Transform raw Yahoo Finance JSON into internal StockData schema.

**File scope:** `src/data/normalize.ts` (new file)

**Input:** Raw Yahoo JSON (from G2)
**Output:** StockData { ticker, price, dcfValue, marginOfSafety, sparklineData[] }

**Constraints:**
- Do NOT call API — receives already-fetched JSON
- Do NOT handle errors — caller handles (G6)
- Missing fields → throw NormalizeError
- sparklineData[] must be sorted chronologically

**Verify:** Unit test — raw fixture in, normalized StockData out.
  - All fields correctly typed
  - sparklineData sorted ascending

**Acceptance criteria:**
- [ ] `normalize(fixture)` returns valid StockData
- [ ] `normalize(incomplete)` throws NormalizeError
- [ ] sparklineData is sorted by date
- [ ] No API calls, no side effects

**Depends on:** G2 (need response shape verified)
**PRD ref:** §Data Schema [DECIDED: StockData interface]
**Contract ref:** CONTRACTS.md → StockCard → Data Shape

**Risk gate:** None (unit testable with fixtures)

---

{... more goals ...}

---

## 🅿️ PARKING LOT

{Empty initially — /run populates when goals get blocked}

---

## Dependency Graph

```
G1 (Redis) ─────────────────┐
                            ├→ G4 (Cache integration) → G5 (Refresh) → G7 (UI)
G2 (API) → G3 (Normalize) ──┘
                                                    ↗
G6 (Error handling) ────────────────────────────────┘
```

---

## Coverage Matrix

| SPECS.md Constraint | Goal(s) |
|---------------------|---------|
| Refresh < 2 seconds | G4, G5 |
| Yahoo Finance data source | G2, G3 |
| Redis caching, 5min TTL | G1, G4 |
| Error state with retry | G6 |
| Stale fallback | G4 (fallback logic) |

| CONTRACTS.md Item | Goal(s) |
|-------------------|---------|
| StockCard data shape | G3 |
| Refresh action | G5 |
| State machine | G4 (states), G6 (error), G7 (UI) |
| Empty state | G7 |

---

## History
| Date | Change | Why |
|------|--------|-----|
| {date} | Created | Initial goals from /goals session |
```

---

## Edge Cases

### When SPECS.md Has [OPEN] Decisions

```
[OPEN] decisions = goals cannot depend on them.

Example:
  SPECS.md has: "Rate limiting: [OPEN] — waiting for usage data"

/goals should:
  - NOT create goals that depend on rate limiting decision
  - Flag: "Cannot create rate limiting goals until [OPEN] is resolved"
  - Suggest: "Proceed with M1 without rate limiting, add in M2"
```

### When CONTRACTS.md Conflicts with SPECS.md

```
/goals detects conflict during candidate generation.

Example:
  CONTRACTS.md: "Refresh complete within 2 seconds"
  SPECS.md: "Yahoo API timeout: 3 seconds"

/goals should:
  - Flag conflict
  - Ask human: "Contract says 2s but spec allows 3s API timeout.
    Should I: (A) update contract to 3s, (B) require caching for 2s guarantee?"
  - Wait for resolution before generating goals
```

### When Goals Have Circular Dependencies

```
/goals detects during dependency wiring.

Example:
  G4 depends on G5 (needs error handling)
  G5 depends on G4 (needs cached data to test errors)

/goals should:
  - Flag: "Circular dependency: G4 ↔ G5"
  - Suggest: "Split G4 into G4a (basic cache) and G4b (error-aware cache).
    G4a → G5 → G4b"
```

### When Human Rejects All Candidates

```
Human: "These are all wrong. We need to rethink the approach."

/goals should:
  - Acknowledge
  - Ask: "Should we go back to /spec to revisit decisions?"
  - Or: "What's the right framing for this milestone?"
  - Do NOT force the current candidates
```

---

## Anti-Patterns

### Too Generic Constraints

```
BAD:
**Constraints:**
- Follow best practices
- Write clean code
- Handle errors appropriately

GOOD:
**Constraints:**
- Do NOT call API directly — receives pre-fetched JSON
- Missing required field → throw NormalizeError (not null)
- sparklineData must be sorted ascending by date
```

### Vague Acceptance Criteria

```
BAD:
**Acceptance criteria:**
- [ ] Works correctly
- [ ] Handles edge cases
- [ ] Performs well

GOOD:
**Acceptance criteria:**
- [ ] `normalize(fixture)` returns valid StockData
- [ ] `normalize(missingTicker)` throws NormalizeError
- [ ] `normalize(fixture).sparklineData` is sorted ascending
```

### Missing Contract Reference

```
BAD:
**Output:** StockData with ticker, price, and sparkline data

GOOD:
**Output:** StockData { ticker, price, dcfValue, marginOfSafety, sparklineData[] }
  (shape in CONTRACTS.md → StockCard → Data Shape)
```

### Risk Gate That Doesn't Help

```
BAD:
**Risk gate:** If something goes wrong, investigate.

GOOD:
**Risk gate:** If Yahoo's actual response lacks `dcfValue` field,
update CONTRACTS.md to remove DCF from StockCard, cascade to G3+G7.
```

---

## When /goals Is Complete

```
□ Human approved ordering (Round 2)
□ All sizing flags resolved (Round 3)
□ All goals have complete prompts (Round 3)
□ Coverage matrix shows all SPECS.md constraints covered
□ Coverage matrix shows all CONTRACTS.md items covered
□ No circular dependencies
□ Risk gates defined for uncertain assumptions
□ Human said "ship it" (Round 4)
```

**Exit to /run when:**
- GOALS.md written
- Human approves
- Ready for execution
