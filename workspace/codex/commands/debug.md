---
model: opus
---

Resource Hint: opus

# /debug - Ralph Mode Debugging

> **Inherits**: `workspace/codex/rules/problem-solving.md` (Two-Phase Model, Chess Engine Search)
> **Uses**: `workspace/codex/rules/subagents.md` (observation tools)
> **Integrates**: `CONTRACTS.md`, `SPECS.md`, `GOALS.md` (self-healing)
> **Detailed templates**: See `_reference_debug.md`

**Purpose**: Find ALL root causes before implementing ANY fix. Update contracts/specs/goals if they were wrong.

---

## Two-Phase Model (inherited from `_task_lifecycle.md`)

> **Phase 1**: ORIENT → EXPLORE. Open app, click through, find mutations, map problem space. **No hypotheses until this completes.**
> **Phase 2**: INVESTIGATE (chess engine search). OBSERVE → HYPOTHESIS → TEST (throwaway) → VERIFY → PRUNE. Let observations guide search.

---

## MANDATORY: Phase 0 First

**STOP. Before opening the app, before reading ANY code:**

### Phase 0: CONTEXT & RESEARCH

**Understand the bigger picture before diving in.**

```
1. REVIEW HISTORY
   - What's been tried already? (git log, conversation history)
   - How many attempts at this? (experiment branches, commits)
   - What approaches failed? (deleted branches, reverted commits)

2. IDENTIFY FRUSTRATIONS
   - What's the user actually frustrated about?
   - Is this the symptom or the real problem?
   - What outcome do they REALLY want?

3. WEB RESEARCH (if applicable)
   - Is there a better/simpler approach to this problem?
   - What do experts recommend for this use case?
   - Are we solving the right problem?

4. PIVOT DECISION
   - Continue with current approach? (if sound)
   - Suggest alternative? (if research reveals better way)
   - Reframe problem? (if user's real need is different)
```

**Phase 0 Output:**
- Summary of what's been tried
- User's core frustration/need
- Recommended approach (continue current OR pivot to X because Y)

**Only AFTER Phase 0 → proceed to Phase 1.**

---

## Phase 1: ORIENT → EXPLORE

**STOP. Before reading ANY code, before forming ANY hypothesis:**

```
1. Open the app (MCP playwright or chrome-devtools)
2. Navigate to the problem area
3. Click through the flow the user described
4. WATCH what happens - see the bug with your own eyes
5. Capture: what broke, what was slow, what was missing
```

**Only AFTER you've mapped the problem space** → proceed to investigation.

**No exceptions.** User describes problem → Phase 0 → OPEN THE APP → Phase 2.

---

**The mindset**: Context first. Then isolation. ORIENT FIRST. One small step. One observation. Learn. Repeat. Collect ALL mutations, ALL problems. Let observations guide search. Throwaway experiments. .memory/ comes LAST.

---

## Self-Healing Integration

When user reports "this is wrong", /debug compares to the file system:

```
User: "The refresh isn't working"
    ↓
/debug identifies goal: G4 (Wire refresh button)
    ↓
Compare to artifacts:
  CONTRACTS.md → What did UI promise? (StockCard refresh action)
  SPECS.md     → What backend behavior was decided?
  GOALS.md     → What were the constraints/acceptance criteria?
    ↓
Determine mismatch type:
  A) Contract correct, code wrong     → BUG in implementation
  B) Contract wrong                   → Update CONTRACTS.md, cascade
  C) Spec decision wrong              → Update SPECS.md, cascade
  D) Goal constraints wrong           → Update GOALS.md, re-execute
```

### Mismatch Types

| Artifact Says | Reality Shows | Type | Action |
|---------------|---------------|------|--------|
| Contract: refresh < 2s | Refresh takes 5s | **IMPLEMENTATION BUG** | Fix code |
| Contract: (nothing about timeout) | User expects timeout handling | **CONTRACT INCOMPLETE** | Update contract → cascade to goals |
| Spec: use Yahoo Finance | Yahoo lacks required data | **SPEC DECISION WRONG** | Update spec → cascade to contracts/goals |
| Goal: DO NOT handle errors | Error handling needed | **GOAL CONSTRAINT WRONG** | Update goal → re-execute |

### Cascade Updates

When updating an artifact, check downstream:

```
CONTRACTS.md updated
    ↓
Check: Does SPECS.md still make sense?
    ↓
Check: Do affected goals in GOALS.md need updating?
    ↓
Check: Should any ✅ goals be re-verified?
```

### Spec Update Template

```markdown
## {Section}

**Status**: [OPEN] ← Changed from [DECIDED]

**History**:
- {date}: Reopened per /debug - {reason}
- {original date}: [DECIDED] {original decision}
```

---

## Parking Lot Integration

When /debug finds a goal can't be fixed without restructuring:

```markdown
## 🅿️ PARKING LOT

### G{n} — {goal name}
**Blocked because:** {what /debug found}
**Root cause:** {the actual problem}
**Needs:** {what decision/change is required}
**Route to:** {/goals | /spec | /ui}
```

/debug parks the goal and routes to appropriate mode. Does NOT force a fix.

---

## The System

```
/review                     Human sees status, reports problem
    ↓
/debug                      You are here (phases below)
    ↓
Phase 0: Context & Research Review history, frustrations, alternatives
    ↓
Phase 1: Orient & Explore   Open app, interact, observe
    ↓
Phase 2-5: Debug            Investigate → Synthesize → Implement → Verify
    ↓
Compare to artifacts        CONTRACTS.md, SPECS.md, GOALS.md
    ↓
Update artifact OR fix code (whichever was wrong)
    ↓
problem-solving.md          Canonical philosophy
```

---

## Entry

```
/debug <problem description>
```

---

## Phase Overview

### Phase 0: CONTEXT & RESEARCH (Understand Bigger Picture)

**Before diving into the problem, understand the context.**

1. **Review history** - Git log, conversation, what's been tried
2. **Identify frustrations** - What does user really want?
3. **Web research** (if applicable) - Better approaches exist?
4. **Pivot decision** - Continue current approach or suggest alternative?

**Phase 0 complete when you can answer:**
- What's been tried and why it failed
- What the user is fundamentally frustrated about
- Whether current approach is sound or pivot needed

### Phase 1: ORIENT → EXPLORE (Map Problem Space)

**Before any hypothesis, INTERACT with the running system.**

1. **Query diagnostic cache** - Search .memory/ for prior matches
2. **Open the app** with MCP (headless preferred)
3. **Click through the flow** - Navigate, interact, observe
4. **Capture mutations** - Expected vs actual behavior
5. **Check console/network** for errors
6. **Output**: Problem list, mutation list, questions

**Phase 1 complete when you can list:**
- All problems observed (what's broken)
- All mutations found (expected vs actual)
- Initial search direction (where to look first)

**When to skip**: Pure logic bugs with clear stack trace, user explicitly confirmed issue.

### Phase 2: INVESTIGATE (Chess Engine Search)

**Let observations guide where you search next.**

```
OBSERVE: What do I see right now?
    ↓
EVALUATE: What does this tell me about where to search?
    ↓
HYPOTHESIS: "I think X is the cause because {observation}"
    ↓
TEST: On throwaway branch, one variable
    ↓
VERIFY: TRUE (cause found) | FALSE (prune this path) | UNKNOWN (need more data)
    ↓
PRUNE or CONTINUE: Based on result, narrow search
```

**Sub-test requirements**:
- ONE variable being tested
- Clear TRUE/FALSE assertion (not "maybe")
- On throwaway branch: `experiment/{task}-st{N}`
- Testable in <30 seconds
- DELETE branch after (regardless of outcome)

**Pruning triggers**:
- FALSE → Don't try variations, prune subtree
- 2-3 failures same direction → Pivot to different area
- Observation contradicts hypothesis → Re-evaluate

### Phase 3: SYNTHESIZE

**Only after search converges on root cause(s).**

1. **List all causes** found with severity
2. **Identify which artifact is wrong** (code, contract, spec, or goal)
3. **Create action plan**:
   - If code wrong → fix implementation
   - If contract wrong → update CONTRACTS.md, cascade
   - If spec wrong → update SPECS.md, cascade
   - If goal wrong → update GOALS.md or park for /goals

### Phase 4: IMPLEMENT (Iterative)

**OBSERVE → ATOMIC STEP → VERIFY → ITERATE**

1. OBSERVE current state
2. Make ONE change (one file, one behavior)
3. VERIFY: TRUE or FALSE?
4. If FALSE → revert, try different approach
5. If TRUE → next step
6. Repeat until fix complete

### Phase 5: VERIFY & CLOSE

**The fix itself can introduce mutations. NEVER assume "solved it".**

**Rigorous verification required:**

1. **Reproduce user's exact environment**
   - Same browser/OS/conditions they experienced
   - Same data state (if data-dependent)
   - Same timing (if timing-dependent)
   - If you can't reproduce the bug in their environment, the fix is UNKNOWN

2. **Test the broken path** → should work now
   - Not just once - test multiple times
   - Test edge cases that could still break
   - Verify with same conditions user experienced

3. **Test regression** → paths that weren't broken
   - Happy path still works?
   - Related features unaffected?
   - No new mutations introduced?

4. **Edge case matrix**
   - What if data is empty?
   - What if timing is different?
   - What if user does X then Y?
   - Test variants beyond the reported case

5. **Enumerate conditions** (robustness testing)
   - UI: Test various widths, heights, zoom levels
   - Data: Test various sizes, states, types
   - Timing: Test various speeds, network conditions
   - **WARNING**: Testing only ONE condition → WRONG CONCLUSION
   - Single-condition test = false confidence

6. **If ANY new mutation** → return to Phase 2
7. **Only after all verification** → Clean up experiment branches
8. **.memory/** (only after loop closes AND all verification passes)

---

## Escalation Triggers

| Trigger | Action |
|---------|--------|
| 2+ variants found | Test ALL variants after each fix |
| Variants conflict | Step back, re-run Discovery |
| 3+ recurrences | Full re-discovery required |
| Complexity growing | Reset Protocol |

### Reset Protocol

When not converging after 3-4 iterations:

```markdown
## Reset: {problem}

**Why**: {not converging}
**Wrong assumption**: {what we thought}
**Reality**: {what's actually true}
**New approach**: {simpler alternative}
```

---

## Throwaway Testing (MANDATORY)

Each sub-test gets its own experiment branch:

```bash
git checkout -b experiment/{task}-st{N}
# ... test, observe, learn ...
git checkout main
git branch -D experiment/{task}-st{N}  # DELETE regardless of outcome
```

**Rules**:
- NEVER patch failed experiments - delete and start fresh
- NEVER merge experiment branches
- ONE experiment branch per sub-test

---

## .memory/ Capture (AT THE END)

**When**: AFTER loop closes - solution verified, no new mutations.

**Not during**: Don't write during exploration. You don't know what you've learned until the loop closes.

---

## Key Points

1. **CONTEXT first** - Review history, identify frustrations, research alternatives
2. **Pivot decision** - Continue current approach OR suggest better alternative
3. **ORIENT → EXPLORE** - Map problem space before any hypothesis
4. **Let observations guide search** - Don't decide where to look before looking
5. **Prune aggressively** - FALSE = abandon that subtree, don't try variations
6. **All causes before any fix** - Don't implement after finding one cause
7. **Compare to artifacts** - CONTRACTS.md, SPECS.md, GOALS.md
8. **Self-heal the right thing** - Fix code OR update artifact (whichever is wrong)
9. **Throwaway branches** - `experiment/{task}-st{N}`, deleted after EVERY test
10. **One variable per test** - If compound, split it
11. **TRUE/FALSE only** - Not "maybe" - if unclear, need more observation
12. **HIL per sub-test** (interactive) - Human confirms before next
13. **Iterative implementation** - OBSERVE → STEP → VERIFY → ITERATE
14. **NEVER assume "solved it"** - Reproduce user's exact environment, test edge cases
15. **Rigorous verification** - Test multiple times, same conditions, edge case matrix
16. **.memory/ last** - Only after loop closes AND all verification passes
17. **Reset on complexity** - If not converging, wrong abstraction level

> **For detailed templates**: See `_reference_debug.md`
