# _reference_spec.md - Detailed Templates & Debate Examples

> **Used by**: `/spec` for templates and detailed procedures. Not loaded by default.

---

## The Core Model

**CONTRACTS.md** = What the user sees (from /ui)
**SPECS.md** = How you make that happen invisibly (from /spec)

```
/ui builds → CONTRACTS.md (data shapes, actions, state machines)
                    ↓
/spec reads → debates decisions → SPECS.md (intent, decisions, boundaries)
                    ↓
/goals reads → creates execution prompts → GOALS.md
                    ↓
/run executes → working code
```

---

## Full Debate Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECISION AREA: {Area Name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXT
───────
CONTRACTS.md requires:
  - {Data shape or action that needs backend support}
  - {Timing constraint if any}
  - {State machine if relevant}

Your constraints:
  - {Budget: free tier / paid / no preference}
  - {Scale: users, requests/sec, data volume}
  - {Platform: specific requirements}

Existing decisions:
  - {Reference to earlier [DECIDED] items that affect this}

───────────────────────────────────────────────────────────────────────────────

OPTIONS
───────

A) {Option name}
   How: {Brief implementation approach}
   Pros: {What's good}
   Cons: {What's bad}
   Fits intent: {How well does this serve the WHY}

B) {Option name}
   How: {Brief implementation approach}
   Pros: {What's good}
   Cons: {What's bad}
   Fits intent: {How well does this serve the WHY}

C) {Option name}
   How: {Brief implementation approach}
   Pros: {What's good}
   Cons: {What's bad}
   Fits intent: {How well does this serve the WHY}

───────────────────────────────────────────────────────────────────────────────

RECOMMENDATION
──────────────
{Option X} because:
- {Primary reason tied to intent}
- {Secondary reason}
- {Risk consideration}

Tradeoffs accepted:
- {What we're giving up and why that's OK}

───────────────────────────────────────────────────────────────────────────────

DECISION: [DECIDED] {choice}
          | [OPEN] {what's blocking decision}

RATIONALE: {One sentence: why this serves intent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Decision Area Deep Dives

### Data Sources

**What to decide:**
- Where does each data shape in CONTRACTS.md come from?
- APIs, databases, computed values, user input?
- What's the source of truth?
- What transformations are needed?

**Questions to ask:**
- Does the source have all required fields?
- What's the latency? Does it meet timing constraints?
- What are the rate limits?
- What happens when the source is unavailable?
- Is the data format what we need or does it need transformation?

**Example debate:**

```
DECISION AREA: Data Sources — Stock Prices
──────────────────────────────────────────

CONTEXT
CONTRACTS.md requires:
  - { ticker, price, dcfValue, marginOfSafety, sparklineData[] }
  - Refresh within 2 seconds
  - sparklineData: 30 days of { date, close }

Your constraints:
  - Free tier only
  - < 1000 requests/day expected

OPTIONS

A) Yahoo Finance API
   How: GET quote endpoint + chart endpoint for history
   Pros: Free, no auth, has DCF estimates
   Cons: 15min delay on free tier, unofficial API
   Fits intent: Good — delay acceptable for "value investing" use case

B) Alpha Vantage
   How: Official REST API with free tier
   Pros: Official, documented, reliable
   Cons: 5 calls/min limit, no DCF data
   Fits intent: Poor — missing core data field

C) IEX Cloud
   How: REST API, free tier available
   Pros: Official, has all fields, good docs
   Cons: 50k calls/month limit, DCF requires paid tier
   Fits intent: Moderate — would need paid for full feature set

RECOMMENDATION
Yahoo Finance because:
- Only free option with DCF data (core to the feature)
- 15min delay is acceptable for value investing context
- Rate limits won't affect our volume

Tradeoffs accepted:
- Unofficial API (may change without notice)
- 15min delay (will show "delayed" label in UI)

DECISION: [DECIDED] Yahoo Finance API
RATIONALE: Only free option that fulfills contract for DCF data.
```

---

### Caching Strategy

**What to decide:**
- What to cache? (API responses, computed values, assets)
- Where to cache? (Client, server, CDN, database)
- TTL and invalidation strategy
- Cache keys and namespacing

**Questions to ask:**
- What are the freshness requirements?
- What's the cost of a cache miss vs stale data?
- How does caching affect the timing constraints in CONTRACTS.md?
- What happens on cache invalidation?

**Example debate:**

```
DECISION AREA: Caching — API Responses
──────────────────────────────────────

CONTEXT
CONTRACTS.md requires:
  - Refresh within 2 seconds
  - "stale" state when showing cached data after failure

Data source decision:
  - [DECIDED] Yahoo Finance — 500-2000ms response time
  - Data already 15min delayed

OPTIONS

A) No caching
   How: Always fetch from Yahoo on request
   Pros: Always "fresh" (within 15min delay)
   Cons: Risk missing 2s target, wasted API calls
   Fits intent: Poor — may feel slow

B) Server-side cache, 5min TTL
   How: Redis/memory cache keyed by ticker
   Pros: Guarantees 2s (cache hit ~10ms), reduces API load
   Cons: Data up to 5min staler than source
   Fits intent: Good — "instant feel" > marginal freshness

C) Client-side cache + revalidate
   How: HTTP cache headers, stale-while-revalidate
   Pros: Fastest for returning users, browser handles it
   Cons: Complex cache control, browser-dependent
   Fits intent: Moderate — adds complexity for marginal benefit

D) CDN caching
   How: Cache at edge, short TTL
   Pros: Global performance, scales automatically
   Cons: Overkill for < 1000 users, adds infrastructure
   Fits intent: Poor — over-engineered for scale

RECOMMENDATION
Server-side cache, 5min TTL because:
- Guarantees 2s timing constraint (primary)
- Data is already 15min delayed, 5min more doesn't matter
- Simple to implement and reason about
- Can show "stale" state if fetch fails (fallback to cache)

Tradeoffs accepted:
- Up to 5min additional staleness (acceptable given source delay)

DECISION: [DECIDED] Server-side, 5min TTL, keyed by ticker
RATIONALE: Guarantees timing while simplicity aligns with scale.
```

---

### Auth Model

**What to decide:**
- Authentication method (session, JWT, API key, OAuth)
- Token storage and refresh
- Scopes and permissions
- Session duration

**Questions to ask:**
- Does CONTRACTS.md have any user-specific actions?
- What's the security sensitivity of the data?
- How long should sessions last?
- What happens when auth fails?

**Example debate:**

```
DECISION AREA: Auth — User Sessions
───────────────────────────────────

CONTEXT
CONTRACTS.md requires:
  - "Save to watchlist" action (user-specific)
  - Persistent state across sessions

Your constraints:
  - No OAuth integration budget
  - Single-tenant (personal use)

OPTIONS

A) No auth (public)
   How: Single global state, no users
   Pros: Simplest possible
   Cons: Can't have personal watchlists
   Fits intent: Poor — loses personalization

B) Simple password
   How: Single password, session cookie
   Pros: Very simple, no user management
   Cons: Weak security, shared access
   Fits intent: Moderate — works for personal use

C) Magic link
   How: Email link, JWT session
   Pros: No password to remember, secure
   Cons: Requires email service, friction to login
   Fits intent: Moderate — adds complexity

D) Local-only auth
   How: Browser localStorage, device-bound
   Pros: Zero backend auth, instant
   Cons: Lost if browser data cleared, device-specific
   Fits intent: Good for personal single-device use

RECOMMENDATION
Local-only auth because:
- Personal use case, single device
- No backend auth complexity
- Instant "login" experience
- Can migrate to real auth later if needed

Tradeoffs accepted:
- Data lost on browser clear (acceptable for personal use)
- Not shareable across devices (out of scope)

DECISION: [DECIDED] Local-only with localStorage
RATIONALE: Simplest solution that meets personal use case.
```

---

### Error Handling

**What to decide:**
- Retry strategy (how many, backoff, jitter)
- Fallback behavior (show stale, show error, degrade gracefully)
- User-facing vs silent errors
- Logging and alerting

**Questions to ask:**
- What does CONTRACTS.md say about error states?
- What's the user experience when things fail?
- Should we retry automatically or require user action?
- What's acceptable degradation?

**Example debate:**

```
DECISION AREA: Error Handling — API Failures
────────────────────────────────────────────

CONTEXT
CONTRACTS.md requires:
  - Error state: "Unable to fetch. Retry?" with retry button
  - Stale state: show cached data + "may be stale" label

Caching decision:
  - [DECIDED] Server-side 5min TTL

OPTIONS

A) Fail fast, show error
   How: No retry, immediate error state
   Pros: Honest, simple
   Cons: Poor UX for transient failures
   Fits intent: Poor — feels broken easily

B) Retry 3x with backoff, then error
   How: 1s, 2s, 4s delays, then show error
   Pros: Handles transient issues
   Cons: Up to 7s delay before error shown
   Fits intent: Moderate — may violate 2s feel

C) Show stale immediately, retry in background
   How: Return cached data, async refresh
   Pros: Always fast response, eventually fresh
   Cons: More complex, may confuse user
   Fits intent: Good — never feels broken

D) Hybrid: cache hit → return, cache miss → retry once
   How: One retry on cache miss only
   Pros: Fast when cached, one chance when not
   Cons: Slightly more complex
   Fits intent: Good — balanced approach

RECOMMENDATION
Hybrid approach because:
- Cache hit: instant response (most common case)
- Cache miss: one retry (3s total max)
- Graceful degradation to error state
- Matches CONTRACTS.md state machine

Fallback chain:
1. Cache hit → return immediately
2. Cache miss → try API → success → return + cache
3. API fail → retry once (2s timeout)
4. Retry fail → error state

DECISION: [DECIDED] Hybrid with 1 retry on cache miss
RATIONALE: Balances resilience with timing constraints.
```

---

### Performance

**What to decide:**
- Latency budgets (p50, p95, p99)
- Throughput requirements
- What's worth optimizing vs acceptable
- Monitoring and SLOs

**Questions to ask:**
- What timing constraints does CONTRACTS.md specify?
- Where does latency come from?
- What's the critical path?
- What can be lazy-loaded or deferred?

---

### Rate Limiting

**What to decide:**
- Client-side throttling
- Server-side limits
- Per-user vs global limits
- What happens when limits hit

---

### Deployment

**What to decide:**
- Platform (Vercel, AWS, self-hosted)
- Environment configs
- Secrets management
- CI/CD approach

---

### Observability

**What to decide:**
- Logging level and format
- Metrics to track
- Alerting thresholds
- Error tracking service

---

## SPECS.md Full Template

```markdown
# SPECS.md

## Overview
**Project**: {project-name}
**Version**: {n}
**Contracts ref**: CONTRACTS.md v{m}
**Last updated**: {date}

---

## Intent

{2-3 sentences explaining WHY this system exists and what experience it provides.
This is the north star when decisions conflict. Write this AFTER all debates complete,
synthesizing the decisions into a coherent purpose.}

Example:
"This system lets a value investor track stocks with margin of safety calculations.
The experience should feel instant and reliable — data delays are acceptable but
the app should never feel broken or slow. Simplicity over features."

---

## Decisions

### Data Sources

**{Data type 1}**: [DECIDED] {choice}
- Rationale: {why this serves intent}
- Source: {API endpoint / database / computed}
- Format: {data shape}
- Constraints: {rate limits, delays, etc.}

**{Data type 2}**: [DECIDED] {choice}
- Rationale: {why}
- ...

### Caching

**{What's cached}**: [DECIDED] {strategy}
- Location: {client / server / CDN}
- TTL: {duration}
- Invalidation: {strategy}
- Rationale: {why}

### Auth

**{Auth model}**: [DECIDED] {approach}
- Method: {session / JWT / API key / none}
- Storage: {where tokens/sessions stored}
- Duration: {session length}
- Rationale: {why}

### Error Handling

**{Error type 1}**: [DECIDED] {strategy}
- Behavior: {what user sees}
- Retry: {yes/no, how many}
- Fallback: {degraded behavior}
- Rationale: {why}

**{Error type 2}**: [DECIDED] {strategy}
- ...

### Performance

**Latency budget**: [DECIDED] {targets}
- p50: {target}
- p95: {target}
- Critical path: {what must be fast}
- Rationale: {why these targets}

### Rate Limiting

**{Limit type}**: [DECIDED] {approach}
- Limit: {rate}
- Scope: {per-user / global}
- On exceed: {behavior}
- Rationale: {why}

### Deployment

**Platform**: [DECIDED] {choice}
- Environment: {prod / staging / dev}
- Secrets: {how managed}
- Rationale: {why}

### Observability

**Logging**: [DECIDED] {approach}
**Metrics**: [DECIDED] {what to track}
**Alerts**: [DECIDED] {thresholds}

---

## Judgment Boundaries

**Runner MAY decide** (within intent):
- {Decision category}: {scope of freedom}
- {Decision category}: {scope of freedom}
- ...

**Runner MUST ask** (before doing):
- {Decision category}: {why this needs human input}
- {Decision category}: {why this needs human input}
- ...

**Default**: If not listed above, MUST ask.

---

## Open Decisions

### {Decision name}: [OPEN]

**Context**: {why this decision matters}
**Options being considered**:
A) {option} — {brief tradeoff}
B) {option} — {brief tradeoff}

**Blocked because**: {what information is missing}
**Needs**: {what would unblock this decision}
**Impact if delayed**: {what can/can't proceed without this}

---

## Contract Dependencies

Maps CONTRACTS.md items to decisions that support them:

| Contract Item | Depends On |
|---------------|------------|
| StockCard data shape | Data Sources: Yahoo Finance |
| Refresh < 2s | Caching: 5min TTL, Performance: latency budget |
| Error state | Error Handling: retry strategy |
| Stale state | Caching: fallback behavior |

---

## History

| Date | Change | Why |
|------|--------|-----|
| {date} | Created | Initial spec from /spec debate |
| {date} | Updated caching TTL | /debug found 1min too aggressive |
| {date} | Added rate limiting | Hitting Yahoo limits in testing |
```

---

## Handling Contract Conflicts

When CONTRACTS.md promises something that's infeasible:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRACT CONFLICT DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTRACTS.md says:
  "Refresh complete within 2 seconds"

Reality discovered during spec:
  Yahoo Finance API p99 latency: 2.5 seconds
  Network variance can add 500ms

This contract cannot be reliably fulfilled without caching.

───────────────────────────────────────────────────────────────────────────────

RESOLUTION OPTIONS

A) Update contract
   Change: "Refresh complete within 2 seconds" → "within 3 seconds"
   Impact: UI expectations change, feels slightly slower
   Requires: Update CONTRACTS.md, communicate to /ui

B) Add caching (change spec, keep contract)
   Change: Server-side cache guarantees 2s on cache hit
   Impact: Data may be slightly staler
   Requires: Caching decision in SPECS.md

C) Change user perception
   Change: Show loading skeleton immediately, complete in background
   Impact: "Complete" means different thing (UI present vs data fresh)
   Requires: Update CONTRACTS.md state machine

───────────────────────────────────────────────────────────────────────────────

RECOMMENDED: Option B
- Keeps the 2s contract (most common case: cache hit)
- Caching already needed for other reasons
- Acceptable staleness given data source delay

HUMAN DECISION NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Judgment Boundary Examples

### Generous MAY (high autonomy)

```markdown
**Runner MAY decide** (within intent):
- Error message exact wording (as long as clear and actionable)
- Animation timing between 100-300ms
- Log format and verbosity level
- Retry count between 1-3 attempts
- Cache TTL between 1-10 minutes
- Internal function naming
- Code organization within a file
```

### Restrictive MUST ASK (low autonomy)

```markdown
**Runner MUST ask** (before doing):
- ANY change to data shapes in CONTRACTS.md
- Adding external dependencies
- Changing auth model
- Modifying user-visible text/terminology
- Performance trade-offs that affect timing constraints
- Adding new API endpoints
- Changing error behavior (silent vs visible)
```

### Calibrating Boundaries

| If you want... | Set boundaries like... |
|----------------|------------------------|
| Fast autonomous progress | Generous MAY, few MUST ASK |
| Tight control over UX | Restrictive on user-visible, generous on internals |
| Safety-first | Restrictive on data/auth, generous on cosmetic |

---

## Debate Anti-Patterns

### Too Vague

```
BAD:
DECISION: [DECIDED] Use caching
RATIONALE: It's faster

GOOD:
DECISION: [DECIDED] Server-side Redis cache, 5min TTL, keyed by ticker
RATIONALE: Guarantees 2s timing constraint; staleness acceptable given 15min source delay.
```

### No Options Considered

```
BAD:
DECISION: [DECIDED] Yahoo Finance
(No alternatives discussed)

GOOD:
OPTIONS:
A) Yahoo Finance — free, has DCF, 15min delay
B) Alpha Vantage — free tier limited, no DCF
C) IEX Cloud — paid for full features

DECISION: [DECIDED] Yahoo Finance
RATIONALE: Only free option with DCF data.
```

### [OPEN] Without Path Forward

```
BAD:
### Rate Limiting: [OPEN]
We're not sure yet.

GOOD:
### Rate Limiting: [OPEN]
**Context**: Yahoo free tier has undocumented limits
**Options**: A) Client throttle, B) Server queue, C) Wait and see
**Blocked because**: Don't know actual limits without production data
**Needs**: Usage data from 1 week of MVP
**Impact if delayed**: Can proceed with implementation, add later
```

---

## Spec Session Flow

```
1. READ CONTRACTS.md
   - What data shapes are promised?
   - What actions are defined?
   - What timing constraints exist?
   - What states are in the state machines?

2. GATHER CONSTRAINTS
   - Budget (free tier? paid OK?)
   - Scale (users, requests, data volume)
   - Platform (specific requirements?)
   - Timeline (MVP vs production-ready?)

3. IDENTIFY DECISION AREAS
   - Which areas are relevant to this project?
   - Skip areas that don't apply
   - Note dependencies between areas

4. DEBATE EACH AREA
   - Present options with tradeoffs
   - Make recommendation with rationale
   - Human decides
   - Mark [DECIDED] or [OPEN]

5. CHECK FOR CONFLICTS
   - Can all contracts be fulfilled?
   - Do decisions conflict with each other?
   - Resolve before proceeding

6. DEFINE BOUNDARIES
   - What can runner decide alone?
   - What needs human input?
   - Default to MUST ASK if unclear

7. WRITE INTENT
   - Synthesize decisions into coherent purpose
   - This is the north star for /goals and /run

8. EMIT SPECS.md
   - All decisions documented
   - Open items have clear "needs"
   - History initialized
```

---

## When Spec Is Complete

```
□ All relevant decision areas debated
□ All [DECIDED] items have rationale
□ All [OPEN] items have "needs" and "impact if delayed"
□ No unresolved contract conflicts
□ Judgment boundaries explicit
□ Intent synthesized from decisions
□ Contract dependencies mapped
□ History initialized
```

**Exit to /goals when:**
- Enough [DECIDED] to start work
- [OPEN] items don't block initial goals
- Human approves spec
