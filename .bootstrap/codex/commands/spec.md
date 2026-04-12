---
model: opus
---

Resource Hint: opus

# /spec - Decide What You Can't See

> **For invisible decisions.** CONTRACTS.md tells you what the UI promises. /spec decides how to fulfill those promises.
> **Inherits**: `problem-solving.md` (Two-Phase Model), `_task_lifecycle.md`

**Purpose**: Walk through every backend decision needed to support the UI contracts, then compile an executable spec bundle (flows, weighted rubric, invariants).

**Input**: CONTRACTS.md (from `/ui`) + .memory/ + your constraints (budget, scale, platform preferences)
**Output**: `SPECS.md` in `Repos/{project}/.memory/` with intent, decisions, user flows, weighted rubric, and invariant suite.

**Does NOT**: Decompose into tasks (that's `/goals`), modify source code, or implement anything.

`/spec` captures decision intent and boundaries, not implementation recipes.

---

## What /spec Is and Isn't

| /spec IS | /spec is NOT |
|----------|--------------|
| Deciding invisible behaviors | Documenting UI behavior (that's CONTRACTS.md) |
| Structured debate on backend choices | Task decomposition (that's /goals) |
| Capturing intent + decisions + boundaries | Implementation planning |
| Walking through decision areas one at a time | Reading code and extracting specs |

**Key insight**: CONTRACTS.md says what the user sees. SPECS.md says how you make that happen invisibly.

---

## Human-AI Collaboration Contract

`/spec` is a structured dialogue, not a one-shot dump.

For each decision area, AI must:

1. Show context pulled from CONTRACTS.md + constraints
2. Offer 2-3 options with concrete tradeoffs
3. Recommend one option and why
4. Ask for decision in plain language
5. Record result as `[DECIDED]` or `[OPEN]`

Human should reply in natural language (no strict format needed):

- "Pick B, but keep free-tier only"
- "Open for now, need usage data"
- "Use A in MVP, revisit at 1k users"

If human intent and constraints conflict, /spec must surface conflict explicitly and pause that area as `[OPEN]`.

---

## The Input: CONTRACTS.md

/spec reads CONTRACTS.md to know what the UI promises:

```markdown
## StockCard (from CONTRACTS.md)

### Data Shape
Response: { ticker, price, dcfValue, marginOfSafety, sparklineData[] }

### Action: Refresh Stock
Trigger: user clicks refresh button
Request: GET /api/stocks/:ticker
Timing: complete within 2 seconds

### State Machine
idle → loading → success | error | stale
```

From this, /spec asks: *"How do we fulfill these promises?"*
- Where does stock data come from? (data source)
- How do we hit 2 second timing? (caching? CDN?)
- What happens when the source is down? (error strategy)

---

## The Debate Format

/spec walks through decision areas one at a time. Each area is a structured debate:

```
DECISION AREA: {area}
─────────────────────

CONTEXT:
CONTRACTS.md requires: {what the UI promises}
Constraint: {user's stated constraint if any}

OPTIONS:
A) {option} — {tradeoffs}
B) {option} — {tradeoffs}
C) {option} — {tradeoffs}

RECOMMENDATION: {which and why}

DECISION: [DECIDED] {choice} | [OPEN] {needs human input}
RATIONALE: {why this choice serves intent}
```

**Human steers.** OpenCode surfaces tradeoffs. Human decides. OpenCode marks [DECIDED] or [OPEN].

---

## Decision Areas (Walk Through)

/spec walks through each area relevant to the project:

| Area | What to Decide |
|------|----------------|
| **Data Sources** | Where does each data shape come from? APIs, databases, computed? |
| **Caching Strategy** | TTL, invalidation, what to cache, where (client/server/CDN)? |
| **Auth Model** | Session, JWT, API keys? What scopes? |
| **Error Handling** | Retry strategy, fallbacks, user-facing errors vs silent failures? |
| **Rate Limiting** | Client-side? Server-side? What limits? |
| **Deployment** | Platform? Environment configs? Secrets management? |
| **Performance** | What needs to be fast? Acceptable latency budgets? |
| **Observability** | Logging? Metrics? Alerts? |

**Skip areas that don't apply.** A simple project might only need Data Sources + Error Handling.

---

## Usage

```bash
# Start spec debate (reads CONTRACTS.md)
/spec {project}

# With constraints
/spec {project} --budget "free tier only"
/spec {project} --scale "< 100 users"

# Update existing
/spec {project} --update "revisit caching"
/spec {project} --open          # Show [OPEN] decisions
```

---

## Spec Exit Gate (Before /goals)

Before handing off to `/goals`, SPECS.md must include:

- Intent section (clear north star)
- At least 1 critical user flow
- Weighted rubric that sums to 100
- Invariant suite with executable commands (or explicit `N/A`)
- Judgment boundaries (`MAY` and `MUST ask`)

If any item is missing, stay in `/spec` and patch SPECS.md first.

---

## The Flow

```
PHASE 1: ORIENT → READ CONTRACTS
────────────────────────────────
/spec {project}
    ↓
1. INIT: Create .memory/ if first use (see _task_lifecycle.md)
2. Read .memory/ + CONTRACTS.md — project context + what UI promises
3. Read user constraints — budget, scale, platform?
4. Identify decision areas needed
    ↓
Output: Decision areas to debate

PHASE 2: DEBATE (one area at a time)
────────────────────────────────────
4. For each decision area:
   - Surface options + tradeoffs
   - Make recommendation
   - Human decides
   - Mark [DECIDED] or [OPEN]
    ↓
5. After all areas debated:
   - Define judgment boundaries (MAY vs MUST ASK)
   - Capture intent for the whole system
    ↓
6. Emit SPECS.md + update .memory/context.md (decisions made, what's next)

NEXT: /goals reads SPECS.md + CONTRACTS.md to create execution prompts
```

---

## SPECS.md Structure

```markdown
# SPECS.md

## Overview
**Project**: {name}
**Version**: {n}
**Contracts ref**: CONTRACTS.md v{n}

---

## Intent
{2-3 sentences: WHY this system exists, what experience it provides.
This is the north star when decisions conflict.}

---

## User Flows (Critical Paths)

- Flow 1: {actor} does {steps} and sees {observable outcome}
- Flow 2: {actor} does {steps} and sees {observable outcome}

Each flow should be testable via MCP walkthrough.

---

## Weighted Rubric

| Axis | Weight | What "good" means |
|------|--------|--------------------|
| Correctness | 40 | Matches contracts and acceptance checks |
| UX Flow Quality | 25 | User path completes without confusion |
| Reliability | 20 | Handles failures without regression |
| Performance | 15 | Meets latency and resource budgets |

Score range: 0-100. /run may only score using artifact-backed evidence.

---

## Invariant Suite (Hard Gates)

- `build`: {command}
- `test`: {command}
- `lint`: {command}
- `typecheck`: {command}
- `contracts`: {command or N/A}

If any invariant fails, /run rejects that iteration regardless of rubric score.

---

## Decisions

### Data Sources

**Stock data**: [DECIDED] Yahoo Finance API (free tier)
- Rationale: Free, reliable, has all required fields
- Constraint: 15min delay on free tier → UI shows "delayed" label

**Historical prices**: [DECIDED] Computed from daily closes
- Rationale: Sparkline needs 30 days, API provides this
- Format: Array of { date, close }

### Caching

**API responses**: [DECIDED] Server-side, 5min TTL
- Rationale: 15min delay means freshness isn't critical
- Invalidation: TTL only, no manual invalidation needed

**Client cache**: [DECIDED] None
- Rationale: Small payload, server cache sufficient

### Error Handling

**API unavailable**: [DECIDED] Show stale data + "may be stale" label
- Rationale: Better to show old data than error state
- Fallback: Last successful response per ticker

**Invalid ticker**: [DECIDED] Show "Ticker not found" immediately
- Rationale: Don't retry, user needs to correct input

### Auth

**Not applicable** — public data, no user accounts

---

## Judgment Boundaries

**Runner MAY decide** (within intent):
- Exact error message wording
- Cache TTL within 1-10min range
- Log format and verbosity
- Retry timing (1-3 attempts)

**Runner MUST ask** (before doing):
- Changing data source
- Adding user authentication
- Modifying data shapes from CONTRACTS.md
- Adding external dependencies
- Performance trade-offs affecting 2s timing

---

## Open Decisions

### Rate Limiting: [OPEN]
**Context**: Yahoo free tier has limits but docs unclear
**Options**:
A) Client-side throttle (1 req/sec) — safe but slow
B) Server-side queue — more complex but better UX
C) Wait until we hit limits — YAGNI

**Needs**: Usage data after MVP launch

---

## History
| Date | Change | Why |
|------|--------|-----|
| {date} | Created | Initial spec from /spec debate |
```

---

## Debate Examples

### Data Source Debate

```
DECISION AREA: Data Sources
───────────────────────────

CONTEXT:
CONTRACTS.md requires: { ticker, price, dcfValue, marginOfSafety, sparklineData[] }
Constraint: User said "free tier only, no paid APIs"

OPTIONS:
A) Yahoo Finance — Free, has all fields, 15min delay
B) Alpha Vantage — Free tier 5 calls/min, no DCF
C) IEX Cloud — Free tier 50k calls/mo, has everything

RECOMMENDATION: Yahoo Finance
- Has DCF data (others don't)
- No call limits on free tier
- 15min delay acceptable for this use case

DECISION: [DECIDED] Yahoo Finance
RATIONALE: Only free option with DCF data. Delay acceptable per intent.
```

### Caching Debate

```
DECISION AREA: Caching
──────────────────────

CONTEXT:
CONTRACTS.md requires: Refresh complete within 2 seconds
Constraint: Yahoo API response time is 500-2000ms

OPTIONS:
A) No caching — Always fresh, but might miss 2s target
B) Server cache, 5min TTL — Reliably fast, slightly stale
C) Client cache, revalidate — Complex, browser-dependent

RECOMMENDATION: Server cache, 5min TTL
- Guarantees 2s target (cache hit ~50ms)
- Data is already 15min delayed, 5min more is fine
- Simple to implement

DECISION: [DECIDED] Server cache, 5min TTL
RATIONALE: Serves intent ("should feel instant") better than always-fresh.
```

---

## Handling [OPEN] Decisions

When you can't decide during the debate:

```markdown
### Rate Limiting: [OPEN]

**Context**: {why this matters}
**Options**: {what's being considered}
**Blocked because**: {what information is missing}
**Needs**: {what would unblock this}
```

[OPEN] decisions are OK. They signal to /goals: "Don't create tasks that depend on this until resolved."

---

## Contract Conflicts

When CONTRACTS.md promises something infeasible:

```
CONFLICT DETECTED
─────────────────

CONTRACTS.md says: "Refresh complete within 2 seconds"
Reality: Yahoo API p99 latency is 2.5 seconds

OPTIONS:
A) Update contract — "complete within 3 seconds"
B) Add caching — guarantee 2s on cache hit
C) Add loading state — user perceives progress, actual time varies

RESOLUTION: {human decides}
ACTION: {update CONTRACTS.md | update SPECS.md | both}
```

**Contracts and specs must agree.** If they conflict, resolve during /spec debate.

---

## When to Use /spec

| Situation | Use /spec? |
|-----------|------------|
| Need to decide backend approach | Yes |
| Want autonomous work later | Yes |
| Complex system with many decisions | Yes |
| Just building UI with human | No — use /ui only |
| Ready to implement | No — use /goals then /run |

**Key insight**: /spec is for decisions, not planning. Once decisions are made, /goals creates the execution plan.

---

## Guardrails

```
/spec ONLY writes to:
✓ Repos/{project}/.memory/SPECS.md

/spec READS:
✓ Repos/{project}/.memory/ (all files)
✓ User constraints (budget, scale, platform)

/spec NEVER:
✗ Modifies project source files
✗ Creates GOALS.md (that's /goals)
✗ Decomposes work into tasks
✗ Implements anything
✗ Updates CONTRACTS.md directly (flags conflicts for human)
```

---

## Self-Validation

**Before starting:**
```
□ CONTRACTS.md exists?
□ User constraints gathered?
□ Decision areas identified?
```

**During debate:**
```
□ Each area has options + tradeoffs?
□ Recommendations have rationale?
□ Human confirms each [DECIDED]?
□ [OPEN] items have "needs" stated?
```

**Before completing:**
```
□ All required areas debated?
□ No contract conflicts unresolved?
□ Judgment boundaries explicit?
□ Intent captures the WHY?
```

**Exit message:**
```
SPECS.md ready at: Repos/{project}/.memory/SPECS.md

Summary:
  Decisions: {n} [DECIDED], {n} [OPEN]
  Judgment boundaries: defined
  Contract conflicts: {n resolved | none}

Next:
  /goals {project}  → Create execution prompts
  /spec {project} --open  → Review open decisions
```

---

## Quick Reference

**Flow**: `/ui` → CONTRACTS.md → `/spec` → SPECS.md → `/goals` → `/run`

/spec creates specifications with:
- **Intent** (WHY the system exists)
- **Decisions** ([DECIDED] or [OPEN] with rationale)
- **Judgment boundaries** (MAY vs MUST ASK)

One decision area at a time. Human steers. OpenCode surfaces tradeoffs.

> **Detailed templates**: See `_reference_spec.md`
