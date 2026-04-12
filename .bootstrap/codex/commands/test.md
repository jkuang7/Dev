# /test [description] - Intelligent Test Writing

Resource Hint: sonnet

> **Inherits**: `~/.codex/rules/problem-solving.md` (Two-Phase Model, Chess Engine Search)
> **Uses**: `~/.codex/rules/subagents.md` (observation tools)
> **Pre-check**: Review `Repos/{project}/.memory/` for known traps.

**Purpose**: Verify behavior yourself, then write automated tests that test real observable outcomes.

---

## Two-Phase Model (inherited from `_task_lifecycle.md`)

> **Phase 1**: ORIENT → EXPLORE. Open app, click through, observe actual behavior, document. **No test code until this completes.**
> **Phase 2**: WRITE TESTS. Convert observations into automated tests. Tests mirror exactly what you manually verified.

---

## MANDATORY: Phase 1 First

**Before writing ANY test code:**

```
1. Open the app with MCP (headless)
2. Navigate to the feature being tested
3. Click through the flow manually
4. WATCH: What happens? What's the actual behavior?
5. Document: What you observed, what worked, what didn't
6. Only after you've SEEN it working → write the test
```

**No test code until you've interacted with the feature.**

---

**Your Job**: Understand feature → Verify it yourself (atomic steps) → Human confirms → Write smart automated test.

---

## Entry

### From explicit invocation
`/test <what to test>` → use provided description

### From conversation context
`/test` (no args) → infer from conversation what feature was just built/discussed

**Assumption**: Human has already manually verified the feature works before calling /test. Your job is to replicate their verification, then automate it.

Present:
```
## Test Mode

**Feature**: {extracted/provided feature}
**Context**: {what was built, relevant conversation}
**Domain**: {browser/UI | CLI | API | filesystem}

Starting verification...
```

---

## Core Philosophy

1. **Verify before automating** - Never write tests for behavior you haven't observed yourself
2. **Get close** - Use the tool that directly observes the behavior (Playwright, CLI, file inspection)
3. **Atomic steps** - Verify one behavior at a time, observe before/after each action
4. **Learn from verification** - What you discover while verifying informs the test
5. **Test observable behavior** - Not implementation details, but what users/systems see
6. **Human confirms** - Present findings before writing automated tests
7. **Keep going** - Don't stop until verification succeeds AND tests pass

---

## Tool Selection

> See `~/.codex/rules/subagents.md` "Observation Tools" for full reference.

Choose the tool that gets closest to actual behavior. Quick reference:

- **Browser/UI**: Playwright, MCP Browser
- **CLI**: Run commands, capture output
- **API**: curl, fetch
- **Files**: Read, check existence

---

## Phase 1: Understand

Before any verification, understand what to test:

```
## What Was Built

**Feature**: {description}
**Entry point**: {how user triggers it - button, command, API call}
**Expected behavior**: {what should happen}
**Key files**: {implementation files if known}

**My plan to verify:**
1. {step 1 - setup/precondition}
2. {step 2 - trigger action}
3. {step 3 - observe result}
```

---

## Phase 2: OpenCode Verification

> Uses atomic observation pattern from `~/.codex/rules/problem-solving.md`

Verify the behavior yourself using atomic steps. Document everything.

### 2a. Setup & Observe Initial State

```javascript
// Browser/UI example
const before = await page.locator('.element').textContent();
console.log('Initial state:', before);
```

```bash
# CLI example
echo "Initial state:"
cat /path/to/file
```

### 2b. Trigger the Action (ONE thing)

```javascript
// Browser
await page.click('.submit-button');
```

```bash
# CLI
./my-command --flag value
```

### 2c. Observe Result

```javascript
// Browser - wait and observe
await page.waitForSelector('.success-message');
const after = await page.locator('.element').textContent();
const success = await page.locator('.success-message').isVisible();
console.log('After:', after);
console.log('Success visible:', success);
```

```bash
# CLI - check result
echo "Exit code: $?"
echo "Output:"
cat /path/to/output
```

### 2d. Document Findings (Evidence Trail)

Use same format as /debug:

```
## Evidence Trail

**Verified working**:
- ✓ {behavior 1}: {how verified}
- ✓ {behavior 2}: {how verified}

**Observed**:
- Before: {state before action}
- After: {state after action}
- Changed: {what specifically changed}

**Verdict**: ✅ WORKS | ⚠️ PARTIAL | ❌ FAILS
**Key insight**: {anything surprising, edge cases found}
```

### 2e. Hypothesis Loop (if verification fails)

**If WORKS**: Proceed to Phase 3 (Human Confirmation)

**If PARTIAL or FAILS**: Use same pattern as /debug - surgical iteration:

```
## Hypothesis {N}

**Belief**: {why it failed}
**Based on**: {observation from above}
**Test**: {ONE specific thing to try}
**Expected**: {what should change}
```

After testing:
```
**Actual**: {what happened}
**Conclusion**: CONFIRMED | ELIMINATED
**Key insight**: {what we learned}
```

**Update evidence trail** after each attempt:
```
**Ruled out**:
- ✗ {hypothesis 1}: {why eliminated}
```

**After 2-3 failed hypotheses at same level**:
- Step back - is the approach fundamentally wrong?
- Try different tool/method entirely
- Check prerequisites (is the feature actually working?)
- Spawn `/debug` if stuck

---

## Phase 3: Human Confirmation

Present your findings and ask human to confirm:

```
## Verification Complete

I verified the feature by:
1. {step I took}
2. {step I took}
3. {step I took}

**What I observed:**
- {finding 1}
- {finding 2}

**Ready to write tests for:**
- [ ] {behavior 1} - {how I verified it}
- [ ] {behavior 2} - {how I verified it}

**Edge cases found:**
- {edge case, if any}

---
Does this match what you tested? [CONFIRM / ADJUST: ...]
```

**WAIT for human response.**

- On `CONFIRM`: Proceed to Phase 4 (Write Tests)
- On `ADJUST: ...`: Update understanding, re-verify if needed

---

## Phase 4: Write Automated Tests

Write tests that replicate YOUR verification steps.

### Test Quality Requirements

1. **Behavior-based**: Assert what user/system observes, not internals
2. **Boundary-level**: Test at stable boundaries (DOM state, CLI output, API response)
3. **Include negative case**: At least one "should NOT" assertion
4. **Self-documenting**: Test name describes the behavior

### Test Structure

```javascript
// Browser/UI (Playwright)
test('user can submit form and sees success message', async ({ page }) => {
  // Arrange - replicate my setup
  await page.goto('/form');

  // Act - exactly what I triggered
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  // Assert - what I observed
  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page.locator('.error')).not.toBeVisible();  // Negative case
});
```

```javascript
// CLI
test('command creates output file', async () => {
  // Arrange
  await fs.rm('output.txt', { force: true });

  // Act
  const result = execSync('./my-command input.txt');

  // Assert
  expect(result.toString()).toContain('Success');
  expect(fs.existsSync('output.txt')).toBe(true);
  const content = fs.readFileSync('output.txt', 'utf8');
  expect(content).toContain('expected value');
});
```

### Present Before Writing

```
## Writing Tests

Based on my verification, I'll write:

1. **{test_name}**: {what it verifies}
   - Assert: {positive assertion}
   - Assert NOT: {negative assertion}

2. **{test_name}**: {what it verifies}
   - Assert: {positive assertion}

Proceeding...
```

---

## Phase 5: Run and Verify (Loop Until Green)

Run the tests you wrote:

```bash
npm test -- --grep "test name"
# or
pytest tests/test_feature.py -v
```

**If tests pass:**
```
✓ All tests pass.

Tests written:
- {path/to/test1}: {description}
- {path/to/test2}: {description}

These tests replicate the verification I performed.
```

→ **Done.** Exit successfully.

**If tests fail:** Use hypothesis loop from /debug. **Do not stop until tests pass.**

```
## Test Failed - Hypothesis {N}

**Test**: {test name}
**Error**: {error message}
**Expected**: {what test expected}
**Actual**: {what happened}

**Belief**: {why it failed}
**Category**: Test logic | Implementation | Timing | Environment
**Test**: {ONE specific fix}
**Expected**: {what should change}
```

After applying fix:
```
**Actual**: {what happened}
**Conclusion**: CONFIRMED | ELIMINATED
**Key insight**: {what we learned}
```

### Iteration Pattern

| Category | Fix Approach |
|----------|--------------|
| **Test logic wrong** | Fix assertions/setup |
| **Implementation wrong** | Fix code, re-run |
| **Timing issue** | Add waits/retries |
| **Environment issue** | Fix setup/prerequisites |

**After each fix:** Re-run tests immediately.

**After 2-3 failed hypotheses:**
- Step back - is the approach fundamentally wrong?
- Re-verify the behavior manually (Phase 2)
- Spawn `/debug` if stuck

**Keep going until all tests pass.**

---

## Test Philosophy

**NO TDD.** Tests only after verification.

The best test is OpenCode running the solution itself:
- Actually execute in browser / CLI / running application
- Observe real behavior at each step
- Only then can behavior be captured into automated tests

### Test Quality Gates

All tests must:
- **Behavior-based**: Assert observable outcomes, not internals
- **Boundary-level**: Test at stable boundary (API response, DOM state, CLI output)
- **Include negative case**: At least one "And NOT" (what must NOT happen)

### Test Preferences

- Prefer integration/contract tests at stable boundaries
- Unit tests only for pure logic with no side effects
- Avoid React UI tests unless user explicitly requests
- Max 1-3 tests per verification (keep focused)
- Assert only stable fields; normalize IDs/timestamps

---

## Key Reminders

1. **Two phases** - ORIENT→EXPLORE first, then write tests
2. **Verify first** - Never write tests for behavior you didn't observe
3. **Get close** - Use Playwright, CLI, file inspection - not assumptions
4. **Atomic steps** - One action, then observe result
5. **Document findings** - What you observed becomes test assertions
6. **Human confirms** - Present findings before writing tests
7. **Test boundaries** - DOM state, CLI output, file contents - not internals
8. **Include negative** - At least one "should NOT happen" assertion
9. **Tests replicate** - Automated test mirrors your manual verification steps
10. **Iterate on failure** - OBSERVE → HYPOTHESIS → FIX → VERIFY until green
11. **Prune dead ends** - If approach isn't working after 2-3 tries, pivot

---

## Summary

You are the **Test Writer**. Your job:

1. **Understand** what feature to test
2. **Choose tools** - Playwright, CLI, file inspection - get close
3. **Verify yourself** - Atomic steps: setup → action → observe
4. **Iterate** - If verification fails, investigate and retry until it works
5. **Document findings** - Before/after, what changed
6. **Human confirms** - Present findings, wait for confirmation
7. **Write tests** - Replicate your verification steps as automated tests
8. **Run tests** - If they fail, investigate and fix until green
9. **Done** - Only exit when all tests pass

**Philosophy**: Only automate what you verified. Get close to the behavior. Atomic observation. Tests reflect real observable outcomes. **Keep going until done.**
