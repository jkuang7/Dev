# Flow Lifecycle Model

> **Canonical reference for /ui, /spec, /goals, /run, /debug, /review**
>
> This document defines the single source of truth for how work moves through the system.
> Every command inherits from this document. If a command contradicts this, this document wins.
>
> **All commands inherit**: `problem-solving.md` (Two-Phase Model)

---

## The Five Files

These files ARE the project. Everything else is conversation that disappears. If OpenCode crashes, context resets, or you walk away for a month — these files are full recovery.

| File | Written By | Purpose |
|------|-----------|---------|
| CONTRACTS.md | /ui | What the UI promises (data shapes, actions, state machines) |
| SPECS.md | /spec | Intent + decisions + judgment boundaries for invisible work |
| GOALS.md | /goals | Human-ordered execution prompts for /run |
| STATE.md | /run | Progress, judgment calls, parking lot |
| .memory/ | All commands | Compound project memory (auto-curated) |

**All project files**: `$DEV/Repos/{project}/.memory/`

---

## .memory/ — Compound Project Memory

Per-project folder that grows smarter over time. Every command reads it at session start. OpenCode updates it naturally during work by distilling conversation signals into reusable understanding.

**Location**: `$DEV/Repos/{project}/.memory/` (in the project repo, gitignored)

| File | Purpose | Changes |
|------|---------|---------|
| context.md | Where we left off, current problem, next steps | Overwritten each session |
| lessons.md | Curated gotchas, pitfalls, root causes | Consolidated, never appended blindly |
| patterns.md | What works, user taste, stack, approaches | Refined as understanding deepens |
| principles.md | High-level rules that emerged over time | Rarely changes, highest signal |

### Compound Behavior

Session 1: .memory/ is empty. Cold start.
Session 5: context.md has continuity. lessons.md has first gotchas.
Session 15: patterns.md knows user taste. lessons.md is well-curated.
Session 30: principles.md has emerged. OpenCode starts warm every time.

### How Commands Use .memory/

1. **Read at session start** — know the project before doing anything
2. **Work normally** — the conversation is the raw signal
3. **Distill naturally** — when OpenCode notices a learning signal (correction, quick approval, repeated frustration, successful approach), update the relevant file
4. **Curate, don't accumulate** — three entries about the same thing become one clear rule. Old context gets overwritten. Patterns get refined, not repeated.
5. **Update context.md before exit** — where we left off, what's next

### Learning Signals (from conversation)

- User repeats an instruction → preference not yet captured
- User corrects OpenCode → wrong assumption, codify the right one
- User reverts a change → approach doesn't work here
- Quick approval → aligned with user taste
- Same bug debugged twice → lesson not captured or not clear enough
- Successful approach → pattern worth remembering
- User complains or shows frustration → high-leverage insight, capture it
- Debugging uncovers root cause → distill the mechanism, not just the fix
- New decision made (tech choice, architecture, tradeoff) → update patterns.md
- Previous decision reversed → update patterns.md, note what changed and why
- User insight about their domain → capture in principles.md

### Curation Rule

**Consolidate, don't append.** .memory/ should stay concise. When multiple entries cover the same topic, merge them into one clear rule. Delete entries that are no longer relevant. The goal is a sharp, focused project understanding — not a growing log.

### Project Init (Automatic)

When any command receives `{project}`:

1. Check if `$DEV/Repos/{project}/.memory/` exists → create with empty files if missing
2. Read `.memory/` → start warm

No manual setup. First `/ui newproject` creates everything.

### Session Lifecycle (Structural Updates)

.memory/ updates are tied to command phases, not aspirational reminders:

| Moment | File | What |
|--------|------|------|
| Command starts | ALL | Read .memory/ |
| Goal completed (/run) | context.md | Progress checkpoint |
| Phase transition | context.md | Current state |
| Root cause found (/debug) | lessons.md | Mechanism + fix |
| Decision made (/spec, /ui) | patterns.md | Choice + rationale |
| User corrects OpenCode | lessons.md | Right approach |
| Session ends | context.md | Where we left off, what's next |

**Why OpenCode remembers after /compact**: Commands are loaded from files, not from memory. Invoking `/run` re-reads `run.md` fresh — .memory/ instructions are always present. AGENTS.md template (system prompt) survives compaction as a second layer. context.md is the crash recovery mechanism — updated at structural moments, not just session end.

### Size Guidance

Keep .memory/ sharp. Bloated memory dilutes steering — every low-value line competes with high-value lines for OpenCode's attention.

| File | Target | When it grows |
|------|--------|---------------|
| context.md | ~20 lines | Overwrite each session (not append) |
| lessons.md | <100 lines | Consolidate related entries, prune resolved issues |
| patterns.md | <80 lines | Merge similar patterns, remove outdated ones |
| principles.md | <30 lines | Naturally short — only high-level rules |

**If a file exceeds its target**: consolidate before adding. Three entries about the same thing become one clear rule. Old context gets replaced, not accumulated.

### context.md Template

```markdown
## Last Session
**Date**: {date}
**Working on**: {project area / feature}
**Status**: {what was accomplished}
**Next**: {what to do next}
**Blocked**: {anything stuck, or "none"}
```

Overwritten each session. This is the crash recovery mechanism — even if the conversation is lost, the next session reads this and starts warm.

### .memory/ is gitignored

.memory/ is machine-local and not tracked in git. It's ephemeral learning data that grows from conversations. If the repo is cloned fresh, .memory/ starts empty — cold start. This is by design. The learning compounds per-machine, per-session.

---

## The Two-Phase Model (Applies to ALL Commands)

Every command follows this pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: ORIENT → EXPLORE                                      │
│  ─────────────────────────────────────────────────────────────  │
│  Open app → Click through → Find mutations → Map problem space  │
│  ⚠️  NO CODE until this completes                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: IMPLEMENT (iterative hypothesis testing)              │
│  ─────────────────────────────────────────────────────────────  │
│  OBSERVE → HYPOTHESIS → ATOMIC STEP → VERIFY → PRUNE/NEXT       │
│  Use THROWAWAY CODE until solution works, then integrate        │
└─────────────────────────────────────────────────────────────────┘
```

**Search is observation-guided** (like a chess engine):
- Let what you find tell you where to look next
- Prune dead ends aggressively (FALSE = abandon subtree)
- Throwaway code for experiments, delete failures, integrate what works

---

## The Routing Model

There is no fixed pipeline. Human enters whatever mode the current situation demands. Files are the continuity. Commands are the modes.

```
         ┌─────────────────────────────────────────────┐
         │              HUMAN (router)                  │
         │                                              │
         │  Reads: STATE.md, GOALS.md, PARKING LOT      │
         │  Decides: which mode to enter next            │
         └──────┬──────┬──────┬──────┬──────┬───────────┘
                │      │      │      │      │
         ┌──────▼─┐ ┌──▼───┐ ┌▼─────┐ ┌──▼──┐ ┌───▼───┐
         │  /ui   │ │/spec │ │/goals│ │/run │ │/debug │
         └───┬────┘ └──┬───┘ └──┬───┘ └──┬──┘ └───┬───┘
             │         │        │        │         │
             ▼         ▼        ▼        ▼         ▼
         CONTRACTS  SPECS.md  GOALS.md  STATE.md  .memory/
            .md                         + code
```

**Happy path**: /ui → /spec → /goals → /run → /review → done.

**Real path**: /ui → /spec → /goals → /run → parking lot fires → /ui (explore edge case) → update CONTRACTS.md → /goals (rewrite affected goals) → /run → /review → /goals (next milestone) → /run → done.

---

## What Each Command Does

| Command | Question It Answers | Input | Output |
|---------|---------------------|-------|--------|
| /ui | What does the user experience? | Vague idea in your head | Production code + CONTRACTS.md |
| /spec | What invisible decisions support that experience? | CONTRACTS.md + your constraints | SPECS.md (intent + decisions + boundaries) |
| /goals | In what order, how big, and what exactly does /run execute? | SPECS.md + CONTRACTS.md + codebase | GOALS.md (human-ordered execution prompts) |
| /run | Does this one piece work? | GOALS.md (queue) + SPECS.md + CONTRACTS.md | Working code + STATE.md + parking lot |
| /review | What happened while I was away? | STATE.md + GOALS.md + parking lot | Routing decisions |
| /debug | Why is this broken? | Symptom + running app | Root causes + .memory/ |

---

## Two Modes of Work

**Default for 80% of work:**
```
MODE 1: Direct Construction (DEFAULT)
──────────────────────────────────────
/dev or /ui "feature"      →  Explore → build → iterate with human
      ↓ done
Commit                     →  No SPECS, no GOALS, no STATE needed
                              .memory/ captures learnings naturally
```

**For overnight/multi-day/handoff work only:**
```
MODE 2: Spec-Driven (opt-in for complex systems)
─────────────────────────────────────────────────
/spec                      →  Intent + Decisions + Judgment Boundaries
      ↓
/goals                     →  Human-ordered execution prompts
      ↓
/run                       →  Execute within boundaries
      ↓ (if stuck)
/debug                     →  Find all causes → .memory/
```

**Core Insight**: Most work is Mode 1. Only use Mode 2 when behaviors are explicit enough for autonomous execution.

---

## When to Use Each Mode

| Situation | Mode | Why |
|-----------|------|-----|
| UI/UX work | Direct Construction | Intent is implicit in human judgment |
| Quick fixes | /dev | Human present, no spec needed |
| Complex multi-flow system | Spec-Driven | Need autonomous overnight work |
| Backend/process pipeline | Spec-Driven | Behaviors are explicit |
| Multiple maintainers | Spec-Driven | Need documented intent |

---

## Priority Hierarchy (Conflict Resolution)

When information sources conflict:

```
1. HARD CONSTRAINTS (safety, security)
   Never compromise. No exceptions.

2. USER'S STATED INTENT (the WHY)
   What user fundamentally wants.
   Intent trumps literal behaviors.

3. OBSERVABLE BEHAVIOR (what app does)
   Reality beats documentation.

4. SPEC BEHAVIORS (documented outcomes)
   Update if they conflict with intent.

5. .memory/ (historical learnings)
   Past mistakes, patterns, and principles.

6. SOFT GUIDANCE (patterns, conventions)
   Lowest priority in conflicts.
```

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

## Flow States (Legacy — still used in SPECS.md)

| State | Meaning |
|-------|---------|
| PENDING | Not started |
| COMPLETE | All behaviors verified |
| BLOCKED | Cannot proceed (reason given) |

---

## Terminology (Canonical)

| Term | Definition | Used In |
|------|------------|---------|
| **Contract** | Observable promise the UI makes (data shape, action, state machine) | /ui, /spec, /goals |
| **Intent** | WHY something exists, what experience it provides | /spec, /run |
| **Decision** | Backend choice marked [DECIDED] or [OPEN] with rationale | /spec |
| **Goal** | Self-contained execution prompt for /run | /goals, /run |
| **Goal prompt** | The full markdown block with task, constraints, verify, etc. | /goals, /run |
| **Judgment boundary** | What /run MAY decide vs MUST ASK | /spec, /run |
| **Behavior** | Observable outcome (When X, then Y) | /spec, /run |
| **Parking lot** | Blocked goals with reason and routing suggestion | /run, /review |
| **Risk gate** | What to do if a goal's assumption is wrong | /goals, /run |
| **Spike** | Quick throwaway exploration to answer a factual question | /ui |
| **Phase 1: ORIENT → EXPLORE** | Map problem space before any code | All commands |
| **Phase 2: IMPLEMENT** | OBSERVE → HYPOTHESIS → STEP → VERIFY → ITERATE | All commands |
| **Atomic step** | Smallest observable behavior, testable in <30 seconds | All commands |
| **Throwaway code** | Experiment on branches, delete failures, integrate what works | All commands |
| **Prune** | Abandon subtree when hypothesis is FALSE | All commands |
| **HIL** | Human-in-loop verification | /review |

---

## Command Responsibilities

### /ui - Build What You Can See
- Builds production code with human iteration
- Emits CONTRACTS.md as flows settle (data shapes, actions, state machines)
- Supports spikes for quick backend exploration
- Does NOT create throwaway prototypes
- Does NOT hand off without human saying "this is right"

### /spec - Decide What You Can't See
- Reads CONTRACTS.md as input
- Walks through decision areas via structured debate
- Outputs SPECS.md with intent + decisions + judgment boundaries
- Does NOT implement code
- Does NOT decompose into tasks (that's /goals)

### /goals - Order the Work By Risk
- Reads SPECS.md + CONTRACTS.md + codebase
- Interactive: AI proposes unordered candidates, human steers
- Generates full goal prompts with constraints and verification
- Enforces sizing rules (flags violations, suggests splits)
- Outputs GOALS.md
- Does NOT implement code

### /run - Execute One Prompt at a Time
- Consumes GOALS.md as execution queue
- Each goal is a self-contained prompt
- Parks goals that can't be completed (with reason and routing)
- Documents judgment calls for review
- Outputs working code + STATE.md + parking lot
- Does NOT make decisions outside judgment boundaries

### /debug - Find Why It's Broken
- Investigates problems using isolation and observation
- Finds ALL causes before ANY fix
- Compares reality to spec (self-healing)
- Distills root causes into .memory/lessons.md (after loop closes)
- Does NOT fix optimistically

### /review - Human Returns
- Shows goal status + parking lot + flagged judgment calls
- Human routes to appropriate mode
- Does NOT implement fixes directly

---

## File Locations

| File | Path | Purpose |
|------|------|---------|
| All .memory/ files | `$DEV/Repos/{project}/.memory/` | PRD artifacts + compound learning (gitignored) |
| Project code | `$DEV/Repos/{project}/` | Implementation |

---

## Self-Healing (via /debug)

When reality doesn't match spec:

```
User: "Upload doesn't feel instant"
    ↓
/debug identifies flow in SPECS.md
    ↓
Compare to reality:
  A) Intent correct, code wrong → fix code
  B) Intent correct, spec wrong → update spec behavior
  C) Intent unclear → clarify with human
  D) Contract wrong → update CONTRACTS.md, cascade to goals
```

System self-heals by updating whichever artifact is wrong.

---

## Clean System Invariants

System is CLEAN when:

```
□ All ✅ goals have acceptance criteria that pass
□ No 🅿️ goal without routing suggestion
□ CONTRACTS.md matches actual UI behavior
□ SPECS.md has no [OPEN] decisions that block goals
□ GOALS.md constraint union covers SPECS.md constraints
□ STATE.md reflects current reality
□ .memory/ captures recent learnings (curated, not bloated)
□ Flagged judgment calls reviewed
□ No debug artifacts in codebase
□ No experiment branches
```

---

## Key Principles

1. **Files are continuity, commands are modes** — Human switches modes based on what's needed. Files persist across sessions.
2. **Two phases** — ORIENT→EXPLORE first, then OBSERVE→STEP→VERIFY→ITERATE.
3. **Contracts bridge visible and invisible** — Data shapes, actions, and state machines. Where "what the user sees" meets "what the backend must do."
4. **Intent is north star** — Behaviors serve intent, not vice versa.
5. **Judgment boundaries explicit** — MAY decide vs MUST ask. If not listed, default to MUST ask.
6. **Goals are execution prompts** — Self-contained. /run reads the goal prompt and has everything it needs.
7. **Human steers, AI drafts** — AI is good at enumeration and mechanical work. Human is good at risk assessment, sizing, and spotting gaps.
8. **Parking lot catches everything** — When reality disagrees with the plan, park with reason and routing. Nothing gets lost.
9. **Observation-guided search** — Let what you find tell you where to look (chess engine model).
10. **Throwaway code** — Experiment on branches, delete failures, integrate what works.
11. **Compound learning** — .memory/ grows through use. Conversations are the raw signal. OpenCode distills, curates, and prunes — keeping what's high-leverage, consolidating duplicates, adapting as decisions change. Understanding compounds even across fresh sessions.
