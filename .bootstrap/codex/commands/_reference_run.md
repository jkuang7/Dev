# /run Reference - Detailed Examples & Edge Cases

> **This is a reference document.** For core execution flow, see `run.md`.
> Load this file when debugging edge cases or understanding specific scenarios.

---

## Runner v2 Snapshot (Evidence + Epoch)

```
## CHECKPOINT: Epoch 2 / Iteration 20

Invariant suite:
- build ✅
- tests ✅
- lint ✅
- typecheck ✅
- contracts ✅

Evidence captured:
- tests: artifacts/tests-iter20.txt
- trace: artifacts/playwright-flow-refresh.zip
- screenshot: artifacts/stockcard-success.png

Score:
- prior: 68
- current: 72
- delta: +4

Decision: ACCEPT (invariants pass + artifact-backed gain)
```

---

## Example Session: Happy Path

```
## /run stock-dashboard

Reading GOALS.md...
  Milestone: M1 — Stock Data Pipeline
  Goals: 6 total | ⬜ 4 | ✅ 2 | 🅿️ 0

## ORIENT: stock-dashboard

**Milestone**: M1 — Stock Data Pipeline
**Progress**: 2/6 goals | ⬜ 4 | ✅ 2
**Next goal**: G3 — Parse Yahoo response
**Dependencies**: G2 ✅ (met)

---

## Executing: G3 — Parse Yahoo response

**Task**: Transform raw Yahoo JSON into StockData schema
**File scope**: src/data/normalize.ts
**Constraints**:
- Do NOT call API
- Missing fields → throw error
**Verify**: Unit test passes

### Implementation
Creating normalize.ts...

### Verification
**Acceptance Criteria Check:**
- [x] normalize(fixture) returns valid StockData
- [x] normalize(incomplete) throws NormalizeError
- [x] No API calls in module

✅ G3 complete
Continue to G4? [y]

---

## Executing: G4 — Wire StockCard to fetch

**Task**: Connect StockCard to /api/stocks endpoint
**File scope**: src/components/StockCard.tsx

### Implementation
Adding fetch hook...

### Verification
- [x] StockCard fetches on mount
- [x] Refresh button works
- [x] Loading state shows

✅ G4 complete

---

## Session Complete

**Progress**: 4/6 goals | ⬜ 2 | ✅ 4
**Completed this session**: G3, G4
**Next**: G5 — Handle rate limiting
```

---

## Example Session: With Parking

```
## /run stock-dashboard

## ORIENT: stock-dashboard

**Milestone**: M1 — Stock Data Pipeline
**Progress**: 4/6 goals | ⬜ 2 | ✅ 4
**Next goal**: G5 — Handle rate limiting
**Dependencies**: G4 ✅ (met)

---

## Executing: G5 — Handle rate limiting

**Task**: Add client-side throttle for API calls
**File scope**: src/lib/rateLimiter.ts

### Implementation (Attempt 1)
Adding token bucket...

### Verification
- [x] Limits to 1 req/sec
- [ ] Queue handles burst ← FAIL (drops requests)

### Debug Attempt 1
HYPOTHESIS: Queue size too small
FIX: Increase to 10
RESULT: Still drops under burst ✗

### Debug Attempt 2
HYPOTHESIS: Need backpressure
FIX: Add wait queue
RESULT: Deadlock on concurrent calls ✗

### Debug Attempt 3
HYPOTHESIS: Wrong pattern entirely
FIX: Use sliding window
RESULT: Complex, still flaky ✗

---

## 🅿️ PARKING: G5

3 failed approaches. Parking.

**Blocked because**: Token bucket, backpressure, sliding window all fail under burst
**Tried**:
- Token bucket (drops requests)
- Wait queue (deadlocks)
- Sliding window (flaky)
**Needs**: Decision on acceptable behavior under burst
**Route to**: /spec (rate limiting strategy is [OPEN])

---

## Executing: G6 — Error fallback UI

**Task**: Show stale data when API fails
**File scope**: src/components/StockCard.tsx

(Continuing with next unblocked goal...)

### Verification
- [x] Shows cached data on error
- [x] "May be stale" label appears
- [x] Retry button works

✅ G6 complete

---

## Session Complete

**Progress**: 5/6 goals | ⬜ 0 | ✅ 5 | 🅿️ 1
**Completed**: G6
**Parked**: G5 (rate limiting - needs /spec decision)
```

---

## Example: Judgment Call

```
## Executing: G3 — Parse Yahoo response

### JUDGMENT CALL

**Goal**: G3
**Situation**: Yahoo returns `regularMarketPrice` not `price`
**Intent says**: "Data shapes must match CONTRACTS.md"
**Decision**: Map `regularMarketPrice` → `price` in normalizer
**Rationale**: Field rename is mechanical, shape contract preserved
**Flag for review**: NO (confident this is within MAY decide)

(Continuing implementation...)
```

---

## Example: Autonomous Checkpoint

```
## CHECKPOINT: G4

### Before
- [x] Goal status set to 🔄 in STATE.md
- [x] Dependencies verified: G3 ✅
- [x] File scope: src/components/StockCard.tsx
- [x] Acceptance criteria understood (4 items)

### Implementation
GOAL: G4 — Wire StockCard to fetch
FILE: src/components/StockCard.tsx
CHANGE: Add useFetch hook, wire to refresh button

### After
- [x] All acceptance criteria pass (4/4)
- [x] No regressions (G3 normalize still works)
- [x] STATE.md updated

### Gate
- [x] **✅ DONE** → next goal G5
```

---

## STATE.md Example (Mid-Session)

```markdown
# STATE: stock-dashboard

## Overview
**Milestone**: M1 — Stock Data Pipeline
**Updated**: 2024-01-15 14:30
**Goals**: 6 total | ⬜ 1 | 🔄 1 | ✅ 3 | 🅿️ 1

---

## Goal Progress

### G1 ✅ — Set up Redis cache
**Completed**: 2024-01-15 10:00
**Notes**: Using ioredis, 5min TTL

### G2 ✅ — Fetch Yahoo Finance data
**Completed**: 2024-01-15 11:30
**Notes**: Added retry on 429

### G3 ✅ — Parse Yahoo response
**Completed**: 2024-01-15 13:00
**Notes**: Mapped regularMarketPrice → price

### G4 🔄 — Wire StockCard to fetch
**Started**: 2024-01-15 14:00
**Current**: Adding loading state

### G5 🅿️ — Handle rate limiting
**Parked**: 2024-01-15 12:00
**Reason**: Strategy [OPEN] in SPECS.md
**Route to**: /spec

### G6 ⬜ — Error fallback UI
**Blocked by**: G4

---

## 🅿️ PARKING LOT

### G5 — Handle rate limiting
**Blocked because**: Rate limiting strategy is [OPEN] in SPECS.md
**Tried**: Token bucket, backpressure, sliding window
**Needs**: Decision on acceptable burst behavior
**Route to**: /spec

---

## JUDGMENT CALLS

| Goal | Decision | Rationale | Flagged? |
|------|----------|-----------|----------|
| G3 | Mapped regularMarketPrice → price | Field rename, shape preserved | NO |

---

## For Next Session
**Next goal**: G4 (in progress) → G6
**Context**: G4 loading state WIP, G5 parked
**Don't repeat**: Token bucket for rate limiting
```

---

## Morning Handoff Summary Template

```
┌─────────────────────────────────────────────────────────────────┐
│                    MORNING HANDOFF SUMMARY                       │
├─────────────────────────────────────────────────────────────────┤
│  Project: stock-dashboard                                        │
│  Milestone: M1 — Stock Data Pipeline                            │
│  Goals: 5/6 ✅  |  1 🅿️                                         │
│                                                                  │
│  ✅ COMPLETED (5 goals)                                         │
│    G1: Set up Redis cache                                       │
│    G2: Fetch Yahoo Finance data                                 │
│    G3: Parse Yahoo response                                     │
│    G4: Wire StockCard to fetch                                  │
│    G6: Error fallback UI                                        │
│                                                                  │
│  🅿️ PARKED (1 goal)                                             │
│    G5: Handle rate limiting                                     │
│        → Route to /spec (strategy [OPEN])                       │
│                                                                  │
│  ⚠️ JUDGMENT CALLS (flagged for review)                         │
│    (none this session)                                          │
│                                                                  │
│  📋 NEXT STEPS                                                   │
│  □ /review to see full status                                   │
│  □ /spec to resolve G5 rate limiting decision                   │
│  □ /goals to update G5 after decision                           │
│                                                                  │
│  To rollback: git reset --hard pre-run-{timestamp}             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Experiment-First Pattern

For risky or uncertain approaches: experiment in isolation BEFORE implementing.

### When to Experiment

| Scenario | Approach |
|----------|----------|
| Simple, well-known operation | Direct implement |
| New library/tool you haven't used | Experiment first |
| Complex multi-step operation | Experiment first |
| High-risk (could corrupt state) | Experiment first |
| Trivial change (typo, comment) | Direct implement |

### Flow

1. **CREATE EXPERIMENT**: `git checkout -b experiment/G{n}-{approach}`
2. **TRY APPROACH**: Make changes, observe results
3. **CAPTURE LEARNINGS**: What worked, what syntax, what order
4. **CLEANUP**: `git checkout main && git branch -D experiment/G{n}-{approach}`
5. **IMPLEMENT FOR REAL**: Use validated approach

### Example

```
## Experiment: G5 rate limiting with token bucket

### Setup
git checkout -b experiment/G5-token-bucket

### Step 1: Basic token bucket
BEFORE: No rate limiting
ACTION: Add TokenBucket class with 1 token/sec
AFTER: Limits requests ✓
LEARN: Basic limiting works

### Step 2: Burst handling
BEFORE: 1 req/sec steady
ACTION: Send 5 requests simultaneously
AFTER: 4 dropped immediately ✗
LEARN: Token bucket drops bursts, need queue

### Cleanup
git checkout main
git branch -D experiment/G5-token-bucket

### Learnings
Token bucket alone won't work for burst traffic.
Need different approach or accept dropped requests.
```

---

## Pivot Protocol

### When to Pivot (Not Fix)

**FIX signals:**
- Different errors each time (making progress)
- Error is clearly a bug in implementation
- Fix is mechanical (typo, missing import)

**PIVOT signals:**
- Same error 2+ times despite different fixes
- Fixing one thing breaks another
- Complexity spiraling
- "This shouldn't be this hard"

### Pivot Process

1. PAUSE: Stop fixing. Step back.
2. DIAGNOSE: Why is the approach failing?
3. PARK: Document what was tried
4. ROUTE: To /spec (decision needed) or /goals (restructure)
5. CONTINUE: Move to next unblocked goal

---

## Verification Checklist

### Observable Behaviors

**PRESENCE / ABSENCE**
- Element IS on page
- Element is NOT on page
- Element APPEARED
- Element DISAPPEARED

**STATE CHANGES**
- Button enabled → disabled
- Input empty → has value
- Loading → loaded

**CASCADING EFFECTS**
- Parent change affects children
- Setting change updates UI elsewhere

### Verification Example

```
Acceptance: StockCard shows live data

BEFORE: StockCard shows "Loading..."
STEP: Wait for fetch to complete
AFTER: StockCard shows "$182.52" with ticker "AAPL"
RESULT: ✓
```

---

## Goal Dependency Handling

### Checking Dependencies

Before picking a goal:

```
G4 depends on: G2, G3
  G2: ✅ (met)
  G3: ✅ (met)
→ G4 can proceed

G6 depends on: G4, G5
  G4: 🔄 (in progress)
  G5: 🅿️ (parked)
→ G6 blocked, skip for now
```

### Regression Check

After completing a goal, verify dependencies still work:

```
✅ G4 complete

Regression check:
  G2 (fetch): still works ✓
  G3 (normalize): still works ✓

No regressions. Continue.
```

---

## Cleanup Protocol

Before ending session:

```
## Cleanup Checklist

Experiment branches:
  git branch | grep experiment/ → (none)

Temp files:
  ls /tmp/test-* → (none)

Debug artifacts:
  grep -r "console.log" src/ → (none added)

STATE.md:
  Updated with current progress ✓

Repo state:
  git status → clean ✓
```

---

## Isolation-Friendly Code Principles

Write implementation that's easy to verify:

1. **Pure functions**: Input → Output, no side effects
2. **Explicit dependencies**: Pass params, not hardcoded
3. **Small units**: One function = one thing
4. **Observable state**: Verifiable results
5. **Reversible operations**: create ↔ delete

Anti-patterns:
- Global state modifications
- Hidden side effects
- Hardcoded paths
- Monolithic functions
