# _reference_debug.md - Detailed Templates & Procedures

> **Used by**: `/debug` for detailed phase templates. Not loaded by default.

---

## Phase 0: CONTEXT & RESEARCH (Detailed)

**Purpose**: Understand the bigger picture BEFORE diving into debugging. Orient yourself to what's been tried, why the user is frustrated, and whether there's a fundamentally better approach.

### Step 1: Review History

**What's been attempted already?**

```bash
# Check recent commits
git log --oneline -20

# Look for experiment branches (deleted or current)
git reflog | grep -i experiment

# Check conversation history for prior attempts
# (if available in context)
```

**Questions to answer:**
- How many attempts at fixing this?
- What approaches were tried?
- Why did they fail? (look for reverted commits, deleted branches)
- Is this a recurring issue? (check .memory/ for similar problems)

### Step 2: Identify User Frustrations

**Read between the lines:**

| User Says | Likely Frustration | Real Need |
|-----------|-------------------|-----------|
| "Still not working" | Feels stuck, no progress | Solution that actually works |
| "Takes too long" | Impatient, workflow blocked | Faster feedback loop |
| "Too complicated" | Cognitive overload | Simpler mental model |
| "Keeps breaking" | Lack of confidence | Stable, predictable behavior |

**Ask yourself:**
- What outcome does the user REALLY want?
- Is the current approach aligned with that outcome?
- Are we solving a symptom or the root problem?

### Step 3: Web Research (When Applicable)

**When to research:**
- Novel problem domain (new tech stack, unfamiliar API)
- Repeated failures suggest approach is flawed
- User describes common use case (likely solved problem)

**What to search for:**
```
"{technology} best practices {use case}"
"{technology} common pitfalls {symptom}"
"{framework} recommended approach for {goal}"
"alternatives to {current approach} for {use case}"
```

**Evaluation criteria:**
- Is there a simpler approach we're missing?
- Are we fighting against the framework's design?
- Do experts recommend a different pattern?

### Step 4: Pivot Decision

**Three possible outcomes:**

1. **CONTINUE** - Current approach is sound
   ```markdown
   ## Phase 0 Decision: CONTINUE

   **History reviewed**: {X attempts, approaches tried}
   **User frustration**: {core need identified}
   **Research**: Current approach aligns with best practices
   **Decision**: Proceed with debugging current implementation
   ```

2. **PIVOT** - Better approach exists
   ```markdown
   ## Phase 0 Decision: PIVOT

   **History reviewed**: {X failed attempts using approach Y}
   **User frustration**: {what they really need}
   **Research**: Found better approach: {Z}
   **Recommendation**: Abandon current approach, use {Z} because {reasoning}

   Pausing for user confirmation before proceeding.
   ```

3. **REFRAME** - Solving wrong problem
   ```markdown
   ## Phase 0 Decision: REFRAME

   **User stated problem**: {what they said}
   **Actual need**: {what they really want}
   **Research**: {alternative framing}
   **Recommendation**: Address {real need} instead of {stated problem}

   Pausing for user confirmation before proceeding.
   ```

### Phase 0 Template

```markdown
## Phase 0: CONTEXT & RESEARCH

### History Review
**Commits/attempts**: {what I found in git log/reflog}
**Prior approaches**:
- Attempt 1: {what} → {why it failed}
- Attempt 2: {what} → {why it failed}

**Diagnostic cache**: {checked .memory/, found/didn't find similar}

### User Frustration Analysis
**User says**: "{exact quote}"
**Likely frustration**: {underlying feeling}
**Real need**: {what outcome they want}

### Research (if applicable)
**Searched for**: "{query}"
**Key findings**:
- {expert recommendation 1}
- {expert recommendation 2}

**Alternative approaches**:
- Option A: {description} - {pros/cons}
- Option B: {description} - {pros/cons}

### Decision
**Recommendation**: CONTINUE | PIVOT | REFRAME
**Reasoning**: {why this decision}

{If PIVOT or REFRAME: pause for user confirmation}
{If CONTINUE: proceed to Phase 1}
```

---

## Phase 1: EXPLORE FIRST (Detailed)

### Query Diagnostic Cache First

**Before creating sub-tests, check if this symptom was seen before:**

```bash
# Search project .memory/
grep -i "{symptom keywords}" $DEV/Repos/{project}/.memory/
```

**If match found**: Reference prior finding. Skip sub-tests already ruled out. Start with known causes.

**If no match**: Proceed with fresh decomposition.

### For UI/Browser Issues

```
1. Open the app with MCP (headless preferred)
2. Take snapshot - see actual DOM structure
3. Navigate to the problem area
4. Click, fill forms, submit - interact with it
5. Take another snapshot - what changed?
6. Check console for JS errors
7. Check network for failed/slow requests
```

**Prefer headless + snapshots.** Use `browser_snapshot` for DOM structure. Faster than screenshots.

### Exploration Template

```markdown
## Exploration: {problem}

**App/URL**: {what I opened}
**Flow tested**: {narrow path I clicked through}

### Interaction log:
1. Clicked [X] → saw [Y]
2. Filled [form] → response was [Z]
3. Waited for [element] → {appeared/didn't appear}

### Problems observed:
- {what broke when I interacted}

### Mutations captured:
- Expected: {what code assumes}
- Actual: {what I saw in the app}
```

### For CLI/API Issues

```
1. Run the actual command
2. Watch stdout - what does it say?
3. Check side effects (files created, state changed)
4. Try edge cases - what breaks?
```

### Why Hands-On First?

**Code tells you what SHOULD happen. The app shows what DOES happen.**

You might read code that says:
- "Click this button" → but button doesn't exist in DOM
- "Wait 2 seconds" → but content needs 5 seconds
- "Find element by class" → but class changed

**Only by clicking through the app do you discover the actual behavior.**

---

## Phase 1: DISCOVER ALL (Detailed)

### Decomposition Example

```
/debug "PDF values appearing doubled"
  ↓
Sub-tests needed:
  ├── Sub-test 1: /Contents field behavior
  ├── Sub-test 2: /AP stream cache behavior
  ├── Sub-test 3: Reader-specific rendering
  └── Sub-test 4: Field interaction effects
  ↓
Each: ORIENT → hypothesis → test → OBSERVE → note finding
  ↓
ALL causes noted → THEN implement → loop closes → THEN .memory/
```

**Do not implement after finding one cause.**

### Sub-Test Definition Template

Every sub-test must have:

```markdown
### Sub-test {N}: {name}

**Variable**: {ONE thing being tested}
**Isolation**: {how this is isolated from other variables}

**TRUE after** (expected if this is the cause):
- {observable assertion}

**FALSE after** (expected if this is NOT the cause):
- {observable assertion}

**Test method**: {exact command or observation}
**Branch**: `experiment/{task}-st{N}` (throwaway)
```

### Decomposition Criteria

**How to identify ALL sub-tests:**

1. **List all possible causes** (brainstorm, don't filter yet)
2. **For each possible cause, ask:**
   - Can I test this in isolation?
   - What would I observe if this IS the cause?
   - What would I observe if this is NOT the cause?
3. **Split if compound** - If sub-test involves 2+ variables, split it
4. **Check coverage:**
   - [ ] Data flow path covered?
   - [ ] State mutation path covered?
   - [ ] External dependency path covered?
   - [ ] Edge cases covered?

**Atomic = ONE variable**. If you can't state "testing whether X causes Y" in one sentence, split.

### Discovery Template

```markdown
## Problem Space: {symptom}

**Domain**: {PDF/API/UI/DB/etc}
**Symptom reproduction**: {exact command to see the bug}

### Sub-Tests (Isolated)
| # | Variable | TRUE after | FALSE after | Status | Outcome |
|---|----------|------------|-------------|--------|---------|
| 1 | {variable A} | {if cause} | {if not cause} | TODO | |
| 2 | {variable B} | {if cause} | {if not cause} | TODO | |
| 3 | {variable C} | {if cause} | {if not cause} | TODO | |

### Sub-Test Results

#### Sub-test 1: {variable A}
- **Branch**: `experiment/{task}-st1`
- **Isolation**: {how isolated}
- **Test method**: {command}
- **Expected if cause**: {TRUE after}
- **Expected if NOT cause**: {FALSE after}
- **Actual observation**: {what happened}
- **Outcome**: CAUSE FOUND | RULED OUT | INCONCLUSIVE
- **Finding noted**: {what was learned - for .memory/ later}
- **Branch deleted**: yes/no

#### Sub-test 2: {variable B}
...

### All Causes Found
| Cause | Variable | Mechanism | Noted |
|-------|----------|-----------|-------|
| A | {var} | {why it causes symptom} | yes |
| B | {var} | {why it causes symptom} | yes |

### Phase 1 Exit Checklist
- [ ] ALL sub-tests complete (no TODO status remaining)
- [ ] ALL experiment branches deleted
- [ ] ALL findings noted (for .memory/ later)
- [ ] NO INCONCLUSIVE sub-tests remaining (split or resolved)
- [ ] HIL confirmed understanding (interactive) OR STATE.md logged (autonomous)
- [ ] NO implementation yet
- [ ] NO .memory/ written yet (comes after loop closes)
```

### Observation Loop (Per Sub-Test)

```markdown
## Hypothesis {N}

**Belief**: {what I expect}
**Based on**: {observation}
**Test**: {ONE thing to try}
**Expected**: {result}

---
**Actual**: {what happened}
**Conclusion**: CONFIRMED | ELIMINATED
**Key insight**: {learning}
```

### HIL Checkpoint Template (Interactive Mode)

After each sub-test completes:

```markdown
=== HIL CHECKPOINT: Sub-test {N} ===

**Finding**: {what I found}
**Evidence**: {command output / observation}
**My interpretation**: {what I think this means}

Is this correct?
- YES → note finding + move to next sub-test
- NO → {provide correction}
- UNCLEAR → {ask specific question}
```

**Rules**:
- Cannot proceed to next sub-test without human confirmation
- If human says NO: refine understanding, re-test
- If human says UNCLEAR: gather more evidence

**Autonomous Mode** (overnight):
- No HIL available
- Instead: extra rigorous self-verification
- Log each finding to STATE.md with explicit TRUE/FALSE assertions
- If uncertain: mark sub-test INCONCLUSIVE, note in STATE.md

### Sub-Test Completion Checklist

A sub-test is COMPLETE when ALL of these are true:

```markdown
## Sub-test {N} Completion Checklist

- [ ] ORIENT first (know current state before testing)
- [ ] Variable isolated (no confounding factors)
- [ ] TRUE after / FALSE after assertions defined
- [ ] Test executed on experiment branch
- [ ] Observation recorded (actual vs expected)
- [ ] Conclusion: CAUSE FOUND | CAUSE RULED OUT | INCONCLUSIVE
- [ ] If CAUSE FOUND: finding noted (for .memory/ later)
- [ ] If INCONCLUSIVE: noted in STATE.md with what's missing
- [ ] Experiment branch deleted
- [ ] HIL confirmed (interactive) OR STATE.md logged (autonomous)
```

**If any checkbox fails, sub-test is not complete.**

### Sub-Test Outcomes

| Outcome | Meaning | Next Step |
|---------|---------|-----------|
| **CAUSE FOUND** | This variable causes the symptom | Note finding, continue to next sub-test |
| **CAUSE RULED OUT** | This variable does NOT cause the symptom | Delete branch, continue to next sub-test |
| **INCONCLUSIVE** | Can't determine | Note in STATE.md, may need to split or redesign |

**Multiple causes possible.** Finding one cause doesn't mean others don't exist. Complete ALL sub-tests.

---

## Phase 2: SYNTHESIZE (Detailed)

**Only enter after ALL testing complete.**

```markdown
## Synthesis: {problem}

### Causes Found
| Cause | Severity | Interaction? |
|-------|----------|--------------|
| A | high | with C |
| B | medium | none |

### Approach
{chosen approach that addresses ALL causes}

### Implementation Plan
| Step | Change | Verify | Addresses |
|------|--------|--------|-----------|
| 1 | {change} | {how} | Cause A |
| 2 | {change} | {how} | Cause B |
```

**The plan comes FROM the learnings, not before them.**

---

## Phase 3: IMPLEMENT (Detailed)

**One change → verify state → proceed or stop.**

```markdown
### Change 1
- What: {exact change}
- File: {path:line}
- Before: {observed}
- After: {observed}
- Result: CORRECT | MUTATION
```

If MUTATION → stop, investigate this change before proceeding.

---

## Phase 4: VERIFY (Detailed)

**The fix itself can introduce mutations. NEVER assume "solved it".**

### Step 1: Reproduce User's Exact Environment

**Before claiming the fix works, MUST reproduce in their exact conditions:**

```markdown
## Environment Simulation

**User's reported environment:**
- Browser: {what they used}
- OS: {what they used}
- Data state: {empty/populated/specific scenario}
- Timing: {slow network/fast/offline}
- Other conditions: {specific state they mentioned}

**Reproduction steps:**
1. Set up identical environment
2. Follow exact steps user described
3. OBSERVE: Can I reproduce the bug?
   - YES → Good, now test the fix
   - NO → UNKNOWN - fix validity uncertain, investigate why

**Manual observation required:**
- Don't trust code - LOOK at what happens
- Don't trust logs - WATCH the behavior
- Don't assume - VERIFY by observing
```

### Step 2: Test Broken Path (Rigorous)

**Not just once - multiple times with variations:**

```markdown
## Path Testing Matrix

| Test | Environment | Iterations | Observed | Status |
|------|-------------|------------|----------|--------|
| User's exact case | {conditions} | 3x | {what I saw} | PASS/FAIL |
| Edge case 1 | {variation} | 2x | {what I saw} | PASS/FAIL |
| Edge case 2 | {variation} | 2x | {what I saw} | PASS/FAIL |

**Edge cases to test:**
- [ ] Empty data
- [ ] Large data
- [ ] Slow network
- [ ] User does action quickly
- [ ] User does action in different order
- [ ] Related feature interaction

### Condition Enumeration (Robustness Testing)

**For UI/Browser issues, test across dimensions:**

```markdown
## Viewport Matrix (If UI-related)

| Width | Height | Test Case | Observed | Status |
|-------|--------|-----------|----------|--------|
| 320px | 568px | Mobile portrait | {what I saw} | PASS/FAIL |
| 768px | 1024px | Tablet | {what I saw} | PASS/FAIL |
| 1920px | 1080px | Desktop | {what I saw} | PASS/FAIL |
| {user's exact} | {user's exact} | User's viewport | {what I saw} | PASS/FAIL |

**Other conditions to enumerate:**
- [ ] Browser zoom levels (100%, 125%, 150%)
- [ ] Dark mode / Light mode
- [ ] Different browsers (Chrome, Safari, Firefox)
- [ ] With/without dev tools open
- [ ] Fast vs slow machine
```

**For data-dependent issues:**

```markdown
## Data Condition Matrix

| Data Size | Data Type | State | Observed | Status |
|-----------|-----------|-------|----------|--------|
| Empty | - | Initial | {saw} | PASS/FAIL |
| 1 item | Valid | Normal | {saw} | PASS/FAIL |
| 100 items | Valid | Large | {saw} | PASS/FAIL |
| 1 item | Invalid | Error | {saw} | PASS/FAIL |
| Mixed | Valid+Invalid | Partial | {saw} | PASS/FAIL |
```

**General principle: Enumerate conditions that could affect the behavior**

- If it's responsive → test various widths/heights
- If it's data-dependent → test various data states
- If it's timing-dependent → test various speeds
- If it's state-dependent → test various user flows

**DON'T assume robustness. TEST robustness.**

### Why Condition Enumeration Matters

**Single-condition testing → WRONG CONCLUSIONS**

```
BAD Example:
1. Test at 1920px width → works ✓
2. Conclude: "Fixed!" ✗
3. User tests at 768px width → still broken
4. Wrong conclusion reached

GOOD Example:
1. Test at user's exact width (768px) → works ✓
2. Test at 320px → works ✓
3. Test at 1920px → works ✓
4. Test at 1440px → works ✓
5. Conclude: "Fixed across conditions" ✓
```

**The trap**: "It works on my machine" = tested in ONE condition only.

**The solution**: Enumerate conditions that matter for this bug:
- If responsive bug → various viewports
- If data bug → various data states
- If timing bug → various speeds

**How many conditions?** Enough to cover the variance:
- Minimum: User's exact condition + 2 other variants
- Ideal: User's condition + edge cases (small, large, edge)
- The goal: Confidence the fix is robust, not just lucky
```

### Step 3: Regression Testing

**Paths that WEREN'T broken must still work:**

```markdown
## Regression Verification

**Happy path:**
- [ ] Tested in same environment
- [ ] Multiple iterations
- [ ] No mutations observed

**Related features:**
- [ ] Feature A (uses same code)
- [ ] Feature B (uses same data)
- [ ] Feature C (uses same flow)

**Manual observation for each:**
- Open the app
- Click through the flow
- WATCH what happens
- Note any mutations
```

### Step 4: Verification Complete Checklist

```markdown
## Verification Complete

- [ ] Reproduced bug in user's exact environment BEFORE fix
- [ ] Applied fix
- [ ] Tested user's exact case 3+ times - all PASS
- [ ] Tested 3+ edge cases - all PASS
- [ ] Tested happy path - no regression
- [ ] Tested related features - no regression
- [ ] ALL observations MANUAL (not assumed from code/logs)
- [ ] No new mutations introduced
- [ ] If ANY failure above → return to Phase 2

**Only after ALL checkboxes** → proceed to cleanup
```

### Implementation Verification Template

```markdown
## Implementation Verification

### Environment Setup
**Simulating user's conditions:**
- Browser: {exact version}
- OS: {exact version}
- Data: {exact state}
- Network: {conditions}

### Bug Reproduction (Pre-Fix)
**OBSERVED**: {I saw the bug happen in these exact conditions}
**Evidence**: {screenshot/log/behavior description}

### Fix Testing (Post-Fix)

| Test | Conditions | Iterations | Manual Observation | Status |
|------|-----------|------------|-------------------|--------|
| User's case | {exact} | 3x | {what I SAW} | PASS/FAIL |
| Edge 1 | {variation} | 2x | {what I SAW} | PASS/FAIL |
| Edge 2 | {variation} | 2x | {what I SAW} | PASS/FAIL |
| Happy path | {normal} | 2x | {what I SAW} | PASS/FAIL |

### New Mutations?
- [ ] Tested paths that WEREN'T broken
- [ ] All observations MANUAL (opened app, watched behavior)
- [ ] No new mutations
- [ ] If ANY new mutation: STOP, return to Phase 2
```

---

## Variant Handling

If hunt finds 2+ variants:

1. Fix highest-priority first
2. Test ALL variants after each fix
3. Don't batch fixes
4. If fixes conflict → shared root cause, re-run Discovery

---

## Cleanup

Track and remove all debug artifacts before marking complete:

```markdown
## Artifacts Created
- [file] src/lib/foo.ts (added console.logs)
- [file] /tmp/debug-output.txt
- [branch] experiment/feature-1
- [session] test-flow

## Cleanup Complete
- git diff src/lib/foo.ts → clean ✓
- ls /tmp/debug-* → "No such file" ✓
- git branch | grep experiment/ → empty ✓
```

---

## Evidence Trail Template

```markdown
## Evidence Trail

**Verified true**:
- ✓ {finding}: {how verified}

**Ruled out**:
- ✗ {hypothesis}: {why eliminated}

**Root cause**: {final answer}
```

---

## External Dependencies

Only exit without solving when fix requires something outside the codebase:

```markdown
## External Dependency

**Problem**: {description}
**Cannot fix**: Requires {external access}

Marking as external dependency.
```

---

## Self-Healing Spec Integration (Detailed)

### Step 1: Identify Affected Flow

```markdown
## Flow Identification

User reported: "{description}"

Searching SPECS.md for matching flow...

**Match found**: Flow `{FLOW_ID}` ({flow_name})

**Current spec says**:
- AC-1: {criterion}
- AC-2: {criterion}
- EC-1: {edge case}

**User expectation**: {what user described}
```

### Step 2: Determine Mismatch Type

```markdown
## Mismatch Analysis

| Spec Says | User Wants | Type |
|-----------|------------|------|
| AC-2: Progress shown | Progress not showing | **IMPLEMENTATION BUG** |
| (nothing about progress) | Progress should show | **SPEC INCOMPLETE** |
| AC-2: No progress (fast op) | Progress should show | **SPEC WRONG** |
```

### Step 3: Take Action

**If IMPLEMENTATION BUG** (spec correct, code wrong):
```markdown
1. Mark flow status: BUG in SPECS.md
2. Create debug task to fix implementation
3. /run will re-implement against correct spec
```

**If SPEC INCOMPLETE** (spec missing something):
```markdown
1. Update SPECS.md flow:
   - Add missing acceptance criterion
   - Add missing edge case
   - Add missing example
2. Append to flow History: "{date}: Added AC-{N} per /debug"
3. Mark flow status: BUG (needs re-implementation)
4. /run will implement against updated spec
```

**If SPEC WRONG** (spec says something different):
```markdown
1. HIL confirm: "Spec says X, you want Y. Update spec?"
2. If yes:
   - Update SPECS.md acceptance criteria
   - Append to flow History: "{date}: Changed AC-{N} per /debug"
   - Mark flow status: BUG
3. /run will re-implement against corrected spec
```
