---
model: opus
---

Resource Hint: opus

# /goals — Human Steers, AI Drafts

> **For execution planning.** SPECS.md + CONTRACTS.md define WHAT. /goals defines HOW to execute it.
> **Inherits**: `problem-solving.md` (Two-Phase Model), `_task_lifecycle.md`

**Purpose**: Interactive command where AI proposes unordered goal candidates, human steers ordering/sizing, AI generates lightweight goal contracts, human does final pass.

**Input**: SPECS.md + CONTRACTS.md + .memory/ + the codebase
**Output**: `GOALS.md` in `Repos/{project}/.memory/` with contract-style goals (outcome, boundaries, evidence), not rigid implementation recipes.

**Does NOT**: Implement code (that's `/run`), make invisible decisions (that's `/spec`), or create UI contracts (that's `/ui`).

---

## Why /goals Exists

AI is bad at:
- Inferring what tasks to generate
- Ordering tasks by risk
- Sizing tasks for verifiability

Humans are good at all three — but humans don't want to write formal task specs.

**/goals bridges this**: AI does mechanical drafting, human does judgment.

---

## Goal Contract Philosophy

Make goals strict on truth, loose on method.

**Strict (required):**
- Observable outcome
- Invariants and must-not-break constraints
- Evidence required for success claims
- Acceptance criteria and dependency boundaries

**Flexible (non-prescriptive):**
- Exact code strategy
- Internal step order
- Refactor shape inside scope

Avoid step-by-step "do A then B then C" unless safety-critical.

---

## The Interactive UX (4 Rounds)

```
ROUND 1: AI dumps, human scans
────────────────────────────────
OpenCode reads SPECS.md + CONTRACTS.md
Generates flat, UNORDERED list of candidate goal names
No numbering. No dependencies. No ordering. Just candidates.

OpenCode asks: "What's wrong? What's missing? What should I split or merge?"

ROUND 2: Human steers
────────────────────────────────
Human reorders by risk (highest risk first)
Splits oversized goals
Kills out-of-scope ones
Adds missing ones

Natural language: "Redis first because it's risky.
Split error handling into rate limits and timeouts.
Kill dark mode — that's M2."

ROUND 3: AI generates full goal prompts
────────────────────────────────
OpenCode takes human steering
Generates goal contracts:
  - Outcome + scope + input/output boundary
  - Constraints, verify, acceptance criteria
  - Evidence requirements, dependencies, PRD refs, risk gates

AI actively challenges sizing violations (see Five Checks)

ROUND 4: Human does final pass
────────────────────────────────
Human scans for:
  - Wrong constraints
  - Missing edge cases
  - Bad file scope
  - Incorrect dependencies

Natural language corrections.
"Ship it" when satisfied.
```

---

## UX Rules (Non-Negotiable)

| Rule | Why |
|------|-----|
| AI asks "what's wrong?" | Invites critical thinking (not "does this look good?") |
| Round 1 is always unordered | Ordering is human's highest-value contribution |
| Human speaks natural language | AI translates to structure |
| AI fills in mechanical work | Verification criteria, dependency wiring, PRD refs, formatting |

---

## Usage

```bash
# Start goals session (reads SPECS.md + CONTRACTS.md)
/goals {project}

# Resume existing
/goals {project} --resume

# Update after /spec changes
/goals {project} --update "add new auth flow"

# Show current state
/goals {project} --status
```

---

## Runner Handoff Gate (Before Infinite Runner)

Before starting `cl runner {project}`, GOALS.md should pass:

1. Every goal has: Task, File scope, Constraints, Verify, Acceptance criteria
2. Every goal has: Evidence required + Invariant gate + Rubric impact
3. Dependencies are explicit and acyclic
4. High-risk goals are explicitly labeled (`Risk level: high`)
5. At least one low-risk canary goal exists for first run verification
6. Open decisions in SPECS.md are either resolved or mapped to parking routes

Recommended sequence:

- `/run {project}` once in interactive mode (canary)
- If behavior matches intent and evidence quality is good, then start `cl runner {project}`

---

## The Flow

```
PHASE 1: ORIENT → READ INPUTS
─────────────────────────────
/goals {project}
    ↓
1. INIT: Create .memory/ if first use (see _task_lifecycle.md)
2. Read .memory/ + SPECS.md — project context + intent, decisions, boundaries
3. Read CONTRACTS.md — data shapes, actions, state machines
4. Scan codebase — existing files, structure
    ↓
Output: Context gathered, ready to generate candidates

ROUND 1: GENERATE CANDIDATES (unordered)
────────────────────────────────────────
4. Generate flat list of goal names
   - NO numbers, NO order, NO dependencies
   - Just candidate tasks

5. Ask: "What's wrong? What's missing? What should I split or merge?"

ROUND 2: HUMAN STEERS
─────────────────────
6. Human provides ordering (by risk)
7. Human splits, merges, kills, adds
8. Human speaks natural language

ROUND 3: GENERATE FULL PROMPTS
──────────────────────────────
9. For each goal (in human's order):
   - Generate full prompt (all sections)
   - Check sizing rules (flag violations)
   - Wire dependencies
   - Reference SPECS.md + CONTRACTS.md

10. Present goals with sizing flags

ROUND 4: FINAL PASS
───────────────────
11. Human reviews, corrects
12. "Ship it" → emit GOALS.md + update .memory/context.md (goals planned, ready for /run)

NEXT: /run {project} → Execute from queue
```

---

## The Sizing Rule (Five Checks)

A goal is correctly sized when ALL five pass:

| Check | Rule | If Violated |
|-------|------|-------------|
| **1. One sentence** | Can describe WHAT in one sentence | Split into smaller goals |
| **2. Tight scope** | Prefer 1-5 files; if more, justify why | Multiple concerns tangled → split or add risk note |
| **3. One observation** | One thing to verify | Two unrelated checks = two goals |
| **4. Short constraints** | Constraints fit in short list | 10+ constraints = scope too wide |
| **5. No "and"** | No "and" in task description | "X AND Y" = two goals |

**The test**: Can /run execute this in one iteration, verify with one observation, and mark done without ambiguity?

**AI flags violations.** Human decides whether to split.

If complexity forces a wider goal, keep it and add explicit risk notes.

---

## Constraint Inheritance Chain

```
SPECS.md        →  project-wide intent + judgment boundaries
        ↓
CONTRACTS.md    →  data shapes + observable behaviors
        ↓
GOALS.md        →  per-goal constraints (subset, made specific)
```

- Each goal's constraints are a SUBSET of project constraints
- /run reads goal prompt + PRD ref section (not all of SPECS.md)
- Human's job: ensure union of all goal constraints covers SPECS.md constraints

**AI helps by flagging gaps**: "SPECS.md says 'refresh under 2s' but no goal has performance constraint."

---

## Goal Prompt Format

Each goal is a self-contained execution contract. /run reads this block and has everything needed while retaining implementation flexibility.

```markdown
### G3 ⬜ — Parse and normalize Yahoo Finance response

**Task:** Transform raw Yahoo Finance JSON into internal StockData schema.
One function, pure input→output, no side effects.

**File scope:** `src/data/normalize.ts` (new file)

**Input:** Raw Yahoo JSON (shape in CONTRACTS.md → YahooResponse)
**Output:** StockData { ticker, price, dcfValue, marginOfSafety, sparklineData[] }

**Constraints:**
- Do NOT call API — receives already-fetched JSON
- Do NOT handle errors here — caller handles (G5, G6)
- Missing fields → throw typed error, not partial data
- sparklineData[] must be sorted chronologically

**Verify:** Unit test — raw fixture JSON in, normalized StockData out.
  - All fields present and correctly typed
  - sparklineData sorted ascending by date
  - Missing required field → throws NormalizeError

**Evidence required:**
- Test output snippet (`normalize` pass/fail)
- If UI touched: screenshot or MCP trace

**Invariant gate:**
- Must pass project invariant suite before claiming success

**Acceptance criteria:**
- `normalize(yahooFixture)` returns valid StockData
- `normalize(incompleteFixture)` throws NormalizeError
- No API calls, no side effects, no imports from fetch layer

**Rubric impact:** Correctness +6, Reliability +2

**Risk level:** {low|medium|high}

**Approach hints (optional, non-binding):**
- Reuse existing parser utilities if compatible
- Keep transformation pure and side-effect free

**Depends on:** G2 (need actual Yahoo response shape)
**PRD ref:** §Data Schema [DECIDED: StockData interface]
**Contract ref:** CONTRACTS.md → StockCard

**Risk gate:** If Yahoo's actual response differs from docs,
update CONTRACTS.md and revisit.
```

---

## What Each Section Does for /run

| Section | Purpose | Prevents |
|---------|---------|----------|
| **Task** | One sentence — what "done" means | Scope creep |
| **File scope** | WHERE to work | Wandering into other files |
| **Input/Output** | Function boundary from CONTRACTS.md | Guessing at data shapes |
| **Constraints** | The "don't" list | Optimistic implementation |
| **Verify** | The one observation, made concrete | Ambiguous "works" |
| **Evidence required** | Artifact requirements for success claims | Prose-only progress |
| **Invariant gate** | Hard checks before score/accept | False positives with broken build |
| **Verify cmd** | Concrete command or browser action /run MUST execute | Voluntary compliance |
| **Acceptance criteria** | Binary pass/fail checklist | "Seems right" |
| **Rubric impact** | Expected score movement by axis | Unbounded optimization drift |
| **Risk level** | Coverage depth needed at completion | Over/under-testing |
| **Approach hints** | Optional suggestions, not mandatory steps | Over-constraining the model |
| **Depends on** | Skip if dependencies not ✅ | Wrong execution order |
| **PRD ref** | Pointer to SPECS.md section | Reading whole spec |
| **Contract ref** | Pointer to CONTRACTS.md section | Guessing UI expectations |
| **Risk gate** | What to do if assumption is wrong | Silent foundation failure |

---

## Goal States

```
⬜ PENDING → 🔄 IN PROGRESS → ✅ DONE
                    ↓
                  🅿️ PARKED (with reason + routing)
```

| State | Meaning | Transition |
|-------|---------|------------|
| ⬜ PENDING | Not started, dependencies may not be met | → 🔄 when picked up |
| 🔄 IN PROGRESS | /run is actively working | → ✅ or 🅿️ |
| ✅ DONE | All acceptance criteria pass | → 🅿️ if regression |
| 🅿️ PARKED | Cannot proceed (reason documented) | → ⬜ when unblocked |

**Parked requires**: reason, routing suggestion (which mode), what info is needed.

---

## GOALS.md Structure

```markdown
# GOALS.md

## Overview
**Project**: {name}
**Milestone**: {M1 — name}
**Specs ref**: SPECS.md v{n}
**Contracts ref**: CONTRACTS.md v{m}

## Summary
Goals: {n} total | ⬜ {n} pending | 🔄 {n} in progress | ✅ {n} done | 🅿️ {n} parked

---

## Goals

### G1 ⬜ — {goal name}
{full goal prompt}

### G2 ⬜ — {goal name}
{full goal prompt}

...

---

## 🅿️ PARKING LOT

### G8 — {goal name}
**Blocked because:** {reason}
**Needs:** {what would unblock}
**Route to:** {/goals | /spec | /ui}

---

## Dependency Graph

G1 → G2 → G4
       ↘
G3 ─────→ G5 → G6

---

## History
| Date | Change | Why |
|------|--------|-----|
| {date} | Created | Initial goals from /goals session |
```

---

## Round 1 Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GOAL CANDIDATES — {project} M1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UNORDERED — you decide priority:

• Set up Redis cache layer
• Parse Yahoo Finance response
• Wire StockCard to fetch endpoint
• Handle API rate limiting
• Implement refresh button click
• Add error state fallback
• Add loading skeleton
• Create stock search input
• Wire search to add-to-watchlist
• Handle invalid ticker response

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What's wrong?
- What's missing?
- What should I split?
- What should I merge?
- What's out of scope for M1?
- What's the riskiest (should be first)?
```

---

## Round 3 Sizing Flags

When presenting full prompts, flag sizing violations:

```markdown
### G7 ⬜ — Add caching and wire to UI

⚠️ SIZING FLAG: "and" in task — suggests two goals
  - G7a: Add caching layer
  - G7b: Wire cached data to UI

**Task:** Add Redis caching for API responses AND wire cached data to StockCard.
...
```

Human decides: accept as-is or split.

---

## Guardrails

```
/goals ONLY writes to:
✓ Repos/{project}/.memory/GOALS.md

/goals READS:
✓ Repos/{project}/.memory/ (all files)
✓ Project codebase
✓ Project codebase (for file scope context)

/goals NEVER:
✗ Modifies project source files
✗ Creates SPECS.md (that's /spec)
✗ Creates CONTRACTS.md (that's /ui)
✗ Implements code (that's /run)
✗ Orders goals without human input (Round 1 is unordered)
```

---

## Self-Validation

**Before Round 1:**
```
□ SPECS.md exists and has [DECIDED] items?
□ CONTRACTS.md exists with data shapes?
□ Codebase structure understood?
```

**During Round 3:**
```
□ Each goal passes sizing checks (or flagged)?
□ All SPECS.md constraints covered by goal constraints?
□ Dependencies correctly wired?
□ Contract refs point to actual CONTRACTS.md sections?
□ PRD refs point to actual SPECS.md sections?
```

**Before emitting:**
```
□ Human approved ordering?
□ Human resolved sizing flags?
□ No orphan goals (unreachable due to dependencies)?
□ Risk gates defined for uncertain assumptions?
```

**Exit message:**
```
GOALS.md ready at: Repos/{project}/.memory/GOALS.md

Summary:
  Goals: {n} total, ordered by risk
  Dependencies: {n} goals have dependencies
  Sizing flags resolved: {n}
  Constraint coverage: {status}

Next:
  /run {project}  → Execute from queue
  /goals {project} --status  → Check goal states
```

---

## Compared to Other Commands

| Command | Question It Answers | Outputs |
|---------|---------------------|---------|
| **/ui** | What does the user experience? | Code + CONTRACTS.md |
| **/spec** | What invisible decisions support that? | SPECS.md |
| **/goals** | In what order, how big, what exactly does /run execute? | GOALS.md |
| **/run** | Does this one piece work? | Code + STATE.md |
| **/review** | What happened while I was away? | Routing decisions |

---

## Quick Reference

**Flow**: `/ui` → CONTRACTS.md → `/spec` → SPECS.md → `/goals` → GOALS.md → `/run`

/goals creates execution prompts with:
- **Human ordering** (by risk)
- **AI-generated prompts** (all sections filled)
- **Sizing enforcement** (five checks)
- **Constraint inheritance** (from SPECS.md + CONTRACTS.md)

Four rounds: AI dumps → Human steers → AI generates → Human approves.

> **Detailed templates**: See `_reference_goals.md`
