---
model: opus
---

Resource Hint: sonnet

# /review - Review + Feedback

> **Inherits**: `problem-solving.md` (Two-Phase Model)
> **Terminology**: See `_task_lifecycle.md`

**Purpose**: See goal status, parking lot, judgment calls. Route to appropriate mode.

---

## Two-Phase Model (inherited from `_task_lifecycle.md`)

> **Phase 1**: ORIENT → EXPLORE. Read files, open app, click through, observe actual state. **No status report until you've seen the app.**

---

## MANDATORY: Explore Before Reporting Status

**Before showing status or giving feedback:**

```
1. ORIENT: Read GOALS.md, STATE.md, CONTRACTS.md, SPECS.md
2. EXPLORE:
   - Start the dev server
   - Open the app with MCP (headless)
   - Click through completed goals - verify they work
   - Take snapshots of current state
3. THEN report status based on what you observed
```

**Don't report "✅" without seeing it work.**

---

## Usage

```
/review                    # Show all projects
/review {project}          # Single project
```

---

## Output Format

```
REVIEW — {project}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Milestone: {milestone name}
Goals: {done}/{total} ✅  |  {parked} 🅿️  |  {pending} ⬜

✅ G1-G3 complete and verified
🔄 G4 — {name}: in progress
🅿️ G5 — {name}: "{parking reason}"
⬜ G6-G8 pending (G6 blocked by G5)

PARKING LOT:
  G5: {What's blocked and why}
      Needs: {what information/decision is required}
      Route to: {/goals | /spec | /ui | /debug}

JUDGMENT CALLS (flagged for review):
  G3: {decision made} — {rationale}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RUN: cd $DEV/Repos/{project} && npm run dev
```

---

## ORIENT First

**Always read before showing status:**

| File | Purpose |
|------|---------|
| GOALS.md | Goal queue, dependencies, acceptance criteria |
| STATE.md | Current progress, parking lot, judgment calls |
| CONTRACTS.md | UI promises (data shapes, actions, state machines) |
| SPECS.md | Backend decisions, intent, judgment boundaries |
| .memory/ | Recent learnings |

---

## Starting the App

**MANDATORY**: Start the dev server so user can verify.

### Detection Order

1. Check `STATE.md` for `## Environment` section
2. Check for common patterns:
   - `package.json` → `npm run dev`
   - `requirements.txt` → Flask/FastAPI
   - `Cargo.toml` → `cargo run`

### Action

1. Use Bash with `run_in_background: true` to start server
2. Tell user the URL to open

---

## Goal Status Reference

| Status | Symbol | Meaning |
|--------|--------|---------|
| PENDING | ⬜ | Not started, dependencies may not be met |
| IN PROGRESS | 🔄 | /run is actively working on it |
| DONE | ✅ | All acceptance criteria pass |
| PARKED | 🅿️ | Cannot proceed (reason + routing in parking lot) |

---

## Parking Lot

When goals are parked, show:

```
PARKING LOT:
  G{n}: {brief description of what's blocked}
      Needs: {what decision/info is required}
      Route to: {appropriate mode}
```

### Routing Suggestions

| Situation | Route To |
|-----------|----------|
| Contract needs updating (UI behavior wrong) | /ui |
| Backend decision needed | /spec |
| Goal needs restructuring | /goals |
| Bug needs investigation | /debug |
| Missing dependency goal | /goals |

---

## Feedback (Conversational)

After reviewing, just tell me what you see:

```
"G1-G3 look good"            → confirms ✅ status
"G4 has a bug"               → /debug investigates
"approve the timeout call"   → judgment call approved
"all good"                   → all reviewed goals confirmed
```

### What Happens on Problems

**Investigation BEFORE implementation.**

When you report a problem:

```
"G4 has a bug"
      ↓
/review identifies goal: G4
      ↓
/debug compares to:
  - CONTRACTS.md: Does UI behavior match?
  - SPECS.md: Does backend behavior match intent?
  - GOALS.md: Were constraints followed?
      ↓
Investigation → root cause → .memory/
      ↓
Fix → verify → mark ✅
```

---

## Explicit Commands

```
/review pass G1 G2 G3        # Confirm goals as ✅
/review park G4 "reason"     # Park goal with reason
/review unpark G4            # Resume parked goal
```

---

## Investigation Flow

```
/review                     User sees parking lot / reports problem
    ↓
Route decision              Which mode handles this?
    ↓
/debug                      If bug → isolate, find root cause
/goals                      If restructure → reorder/split goals
/spec                       If decision needed → debate, decide
/ui                         If contract wrong → update UI + contracts
    ↓
.memory/                  Capture learning (after loop closes)
    ↓
Resume /run                 Continue execution
```

> See `/debug` for investigation protocol.

---

## Post-Review Verification

After implementing a fix, **OBSERVE the result**.

```
Implementation complete
    ↓
OBSERVE: Does it actually work?
    ↓
  YES → Mark ✅, clean up
  NO  → New symptom discovered → /debug again
```

**Never mark done without observation.**

---

## Key Principle

Morning routine:
1. `/review` — see goal status, parking lot, judgment calls
2. Try the flows in the browser
3. Approve judgment calls or override
4. Route parked goals to appropriate mode
5. Problems become investigations via /debug

---

## Files Read

| File | Location |
|------|----------|
| All project files | `$DEV/Repos/{project}/.memory/` |
