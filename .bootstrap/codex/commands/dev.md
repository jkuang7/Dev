# /dev - Real-time Development

Resource Hint: sonnet

> **Inherits**: `~/.codex/rules/problem-solving.md` (Two-Phase Model, Chess Engine Search)
> **Uses**: `~/.codex/rules/subagents.md` (observation tools)

**Purpose**: Implement NOW with human alignment. Unlike `/spec` (queues for runner), `/dev` does work immediately.

---

## Two-Phase Model (inherited from `_task_lifecycle.md`)

> **Phase 1**: ORIENT → EXPLORE. Open app, click through, map current state, find mutations. **No code until this completes.**
> **Phase 2**: IMPLEMENT iteratively. OBSERVE → HYPOTHESIS → ATOMIC STEP → VERIFY → PRUNE. Use throwaway code until solution works.

---

## MANDATORY: Phase 1 First

**STOP. Before writing ANY code:**

```
1. Open the app (MCP playwright or chrome-devtools)
2. Click through the relevant flow
3. WATCH what currently happens
4. Capture: problems, mutations, questions
5. Output: Problem list, mutation list, initial direction
```

**No optimistic coding.** No "I'll just write this and see."

**Open. Click. Watch. Map. THEN code.**

---

**The mindset** (from `problem-solving.md`):
- Isolation, isolation, isolation
- ORIENT → EXPLORE before any code
- Let observations guide search direction
- Throwaway code is the norm - delete failures, don't patch them
- Prune dead ends aggressively (chess engine model)
- .memory/ comes LAST - only after loop closes

```
ALIGN → ORIENT → EXPLORE → PLAN → IMPLEMENT (iterative) → VERIFY → CLEANUP → .memory/
```

---

## Usage

```
/dev [description]     # Start with intent
/dev                   # Intuit from conversation
```

---

## Phase 0: Startup + Alignment

**Read .memory/** (init project if first use — see `_task_lifecycle.md`):
- context.md → where we left off
- lessons.md → known gotchas
- patterns.md → what works here

Then align on what "done" looks like.

```
## Alignment

Goal: [what they want]

Gates:
1. [ ] [Observable behavior]
2. [ ] [Observable behavior]
3. [ ] [Observable behavior]

Constraints:
- Must not break: [existing functionality]

Aligned? [yes / adjust: ...]
```

**Gate quality:**
- Good: "Button visible on /login" ✓
- Bad: "Feature works correctly" ✗

**DO NOT proceed until human confirms.**

---

## Phase 1: Explore (Iterative Discovery)

> Inherited from `/debug` - understand BEFORE changing

**No implementation until you've mapped all pathways.**

### Start by Interacting with the Running App

**Before reading ANY code, OPEN the app and CLICK through the flow:**

```
1. Open the app with MCP (headless preferred)
2. Take snapshot - see actual DOM structure
3. Navigate to the problem area
4. Click, fill forms, submit - USE the app
5. Take another snapshot - what changed?
6. Check console for JS errors
7. Check network for failed requests
```

**Prefer headless + snapshots.** Use `browser_snapshot` for DOM. Faster than screenshots.

```markdown
## Exploration: {feature/problem}

**App/URL**: {what I opened}
**Flow tested**: {narrow path I clicked through}

### Interaction log:
1. Clicked [X] → saw [Y]
2. Filled [form] → response was [Z]
3. Waited for [element] → {result}

### Problems observed:
- {what broke when I interacted}

### Mutations captured:
- Expected: {what I thought would happen}
- Actual: {what the app showed}
```

**Why hands-on first?** Code tells you what SHOULD happen. The app shows what DOES happen. Only by clicking through do you discover actual behavior, timing issues, missing elements, etc.

### Then Iterate with Code

Exploration is a loop:

```
ORIENT: Where am I? What's the current state?
    ↓
STEP: One small change
    ↓
OBSERVE: What happened?
    ↓
    ├── Expected → next step (ORIENT first)
    ├── Unexpected → failure is data, learn, ORIENT again
    └── Unclear → need more observation
```

> See `problem-solving.md` "Epistemology" for the full proof mechanism.

### The Loop

**One atomic experiment → One observation → One learning.**

Never batch. If you change two things and something breaks, you don't know which one caused it.

```
## Exploration

### Experiment 1: [single atomic thing I tried]
**Expected**: [what I thought would happen]
**Observed**: [what actually happened]
**Learned**: [insight gained]

### Experiment 2: [single atomic thing I tried]
**Expected**: [what I thought would happen]
**Observed**: [what actually happened]
**Learned**: [insight gained]

### Experiment 3: ...
```

### Why Atomic?

> See `problem-solving.md` "OVAT - The Core Truth" for the canonical explanation.

**TL;DR**: Change A+B+C → if it breaks, which one? *Unknown.* Change A alone → *clear signal.*

**Small experiment with clear observation > big change with ambiguous result.**

**Failures are data.** Each failure reveals a pathway you didn't know about. Document it.

### What to Explore

- **Current behavior**: What does it do now? (run it, don't assume)
- **Edge cases**: What happens at boundaries?
- **Dependencies**: What else touches this code?
- **Side effects**: What gets affected when this changes?

### Stopping Condition

Exploration is complete when:

```
## Pathways Mapped

1. [Pathway A]: [how it works]
2. [Pathway B]: [how it works]
3. [Edge case C]: [what happens]

Side effects identified:
- [Thing that will be affected]

Ready to plan implementation.
```

**If you can't list the pathways, you're not done exploring.**

### Note Findings (Don't Write Yet)

During exploration, mentally note findings that reveal:
- Non-obvious behavior
- Gotchas for future work
- Things that broke unexpectedly

**Don't write to .memory/ yet.** You don't know what you've truly learned until the loop closes. Wait until solution is verified, then summarize, then capture.

### When to Skip Exploration

- Trivial changes (typos, comments)
- User explicitly says "just do it"
- You've verified the pathway in this session

---

## Phase 2: Plan

**Only after exploration is complete.**

Synthesize learnings into implementation approach:

```
## Plan

Pathways to handle:
1. [Pathway] → [how we'll handle it]
2. [Pathway] → [how we'll handle it]
3. [Edge case] → [how we'll handle it]

Side effects to verify:
- [Thing to check after implementation]

Steps:
1. [Change] in [file]
2. [Change] in [file]
3. [Change] in [file]

Proceed? [y/n]
```

**The plan comes FROM the exploration.** If you didn't explore it, you can't plan for it.

**Wait for human confirmation before implementing.**

---

## Phase 3: Implementation (Iterative)

**OBSERVE → HYPOTHESIS → ATOMIC STEP → VERIFY → ITERATE**

```
OBSERVE: What's the current state?
    ↓
HYPOTHESIS: "I think changing X will cause Y"
    ↓
ATOMIC STEP: One change, one file, one behavior (on throwaway branch)
    ↓
VERIFY: TRUE or FALSE? (not "maybe")
    ├── TRUE  → This works. Continue or integrate.
    ├── FALSE → Delete experiment, try different approach.
    └── UNKNOWN → Need more observation.
    ↓
ITERATE: Repeat until solution found
```

### Throwaway Code Pattern

```bash
# Create experiment branch
git checkout -b experiment/{feature}-1

# Try approach - make changes, test
# Doesn't work?

# DELETE and start fresh
git checkout main
git branch -D experiment/{feature}-1

# Try different approach
git checkout -b experiment/{feature}-2
```

**Never patch failed experiments.** Delete and restart.

### Progress Tracking

```
[1/5] Adding function...
      HYPOTHESIS: Add helper function
      VERIFY: TRUE ✓
[2/5] Wiring to handler...
      HYPOTHESIS: Connect to event
      VERIFY: FALSE ❌ → different approach
[2/5] Wiring to handler (attempt 2)...
      HYPOTHESIS: Use callback instead
      VERIFY: TRUE ✓
```

### Modifying ~/.codex Files

```
⚠ About to modify: ~/.codex/commands/foo.md
   Change: [brief description]
   Proceed? [y/n]
```

Wait for explicit "y".

---

## Phase 4: Verify Gates

> Uses BEFORE/STEP/AFTER pattern (see `~/.codex/rules/problem-solving.md` "Verification Format")

**You MUST actually test each gate.** Reading code is not verification.

1. Run/click/execute the thing
2. Observe what ACTUALLY happens
3. Compare to expected
4. If wrong → fix → re-verify (expect multiple rounds)

Track test artifacts at creation:

```
## Test Scaffolding
- [file] /tmp/test-xxx/mock.py
- [branch] test/feature in Blog
Artifacts tracked: 2
```

Verify each gate (expect re-tries):

```
[G1] Button visible on /login
     BEFORE: /login has no OAuth button
     STEP: Add GoogleAuthButton component
     AFTER: Button renders with Google icon
     RESULT: ✓

[G2] Click opens popup (Round 1)
     BEFORE: Button visible
     STEP: Click button
     AFTER: Nothing happens ❌

[G2] Click opens popup (Round 2)
     BEFORE: Added onClick, checked console
     STEP: Click button
     AFTER: Console error "config undefined" ❌

[G2] Click opens popup (Round 3)
     BEFORE: Fixed config import
     STEP: Click button
     AFTER: Popup opens to accounts.google.com ✓
     RESULT: ✓ (after 3 rounds)
```

### On Failure

Adaptive debugging (same as `/run`):

```
Can I fix this myself?
├─ YES → observe → hypothesize → fix → re-observe → repeat
│        (3-5 attempts for simple, more for complex)
└─ NO (external blocker) → Stop, ask human
```

```
Gate 2 failed (3 attempts).

Tried: event binding, z-index, click handler
Stuck: popup blocked by browser policy

Options:
1. Show relevant code
2. Try different approach
3. Skip for now
> [human input]
```

---

## Phase 5: Walk-through

After individual gates pass, run full flow:

```
## Walk-through

1. Navigate to /login → page loads ✓
2. Click Google button → popup opens ✓
3. Complete auth → redirects to dashboard ✓

Full flow verified.
```

---

## Phase 6: Cleanup (if artifacts created)

> See `~/.codex/rules/problem-solving.md` "Cleanup" for requirements.

**Skip if no test artifacts were created.** Otherwise, MUST clean and verify.

```
## Cleanup

Artifacts tracked: 3
Removing:
- [file] /tmp/test-xxx/... ✓
- [branch] test/feature (deletes commits) ✓
- [session] test-oauth-flow ✓

Verification:
- ls /tmp/test-* → "No such file" ✓
- git branch | grep test/ → empty ✓
- tmux ls | grep test- → empty ✓

Artifacts remaining: 0
```

**Task incomplete if artifacts remain.** Cleanup verification is a gate.

---

## Phase 7: Summary

```
## Summary

Explored:
- [What I learned from exploration]

Implemented:
- [Feature/fix]

Files: [paths]

Verified: X/Y gates, walk-through passed, cleanup verified
```

---

## Quick Reference

```
Phase 0: Startup    → Read .memory/ + align on "done"
Phase 1: Explore    → ORIENT → hands-on → map problem space
Phase 2: Plan       → Learnings → approach (from exploration)
Phase 3: Implement  → OBSERVE → HYPOTHESIS → STEP → VERIFY → ITERATE
Phase 4: Verify     → Test each gate (expect retries)
Phase 5: Walk       → Full flow end-to-end
Phase 6: Cleanup    → Remove experiment branches, test artifacts
Phase 7: Summary    → What was done + update .memory/context.md
```

**Core principles**:
- **Two phases**: ORIENT→EXPLORE first, then OBSERVE→STEP→VERIFY→ITERATE
- **Observations guide search**: Let what you find tell you where to look
- **Throwaway code**: Experiment freely, delete failures, integrate what works
- **Prune aggressively**: FALSE = abandon path, try different direction
- **.memory/ last**: Only after loop closes and solution verified

---

## /dev vs /run

| Scenario | Use |
|----------|-----|
| Quick fix, tinkering, one-off | `/dev` |
| Need human-in-loop NOW | `/dev` |
| Exploratory work, no spec needed | `/dev` |
| Feature for project (planned work) | `/ui` → `/spec` → `/goals` → `/run` |
| Overnight autonomous work | `/run --autonomous` |
| Goals already in GOALS.md | `/run` |

**Decision tree**:
1. Is this a one-off fix or exploration? → `/dev`
2. Is there a GOALS.md with pending goals? → `/run`
3. Does it need overnight autonomous work? → `/run --autonomous`
4. Does it need UI prototyping first? → `/ui` → full flow
