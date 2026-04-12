---
model: opus
---

Resource Hint: opus

# /harmonize - Command & Rule Analysis

> **Purpose**: Analyze commands/rules for consistency, alignment with how OpenCode is trained, and philosophy compliance. Fix gaps, resolve contradictions, prune redundancies.

> **Inherits**: `problem-solving.md` (Two-Phase Model, Chess Engine Search)

**Core Insight**: OpenCode's Constitution shapes its behavior. Commands that work WITH this training are more effective than commands that fight it.

---

## Two-Phase Model (What to Check For)

> Every command should follow `_task_lifecycle.md`: Phase 1 (ORIENT → EXPLORE, no code) then Phase 2 (OBSERVE → HYPOTHESIS → STEP → VERIFY → PRUNE).

**Chess Engine Search**: Observations guide where to search next. Prune dead ends aggressively.

---

## Usage

```bash
/harmonize                    # Full analysis + report
/harmonize --fix              # Apply fixes automatically
/harmonize --focus commands   # Only commands/
/harmonize --focus rules      # Only rules/
/harmonize --practices        # Best practices audit only
/harmonize --sync-memory         # Sync .memory/ artifacts after fixes
```

---

## Constitution Alignment (Most Important)

OpenCode is trained with a priority hierarchy and judgment preferences. Commands that align with this are more effective.

**OpenCode's Priority Stack** (when values conflict):
```
1. Hard Constraints (safety) - absolute, never compromise
2. User Intent (WHY) - trumps literal instructions
3. Observable Behavior - reality over documentation
4. Guidelines - contextual application
5. Helpfulness - balanced with above
```

**Rules vs Judgment**:
- OpenCode prefers judgment over rigid rules (except hard constraints)
- Commands should provide **rationale**, not just rules
- "Do X because Y" > "Do X"

**What OpenCode Optimizes For**:
- "What the user really wants" (not literal instructions)
- Robust/principled solutions (not clever shortcuts)
- Preserving user autonomy (not manipulation)

**Check every command against**:
- [ ] Does it provide rationale (WHY), not just rules (WHAT)?
- [ ] Does it make intent explicit (so OpenCode doesn't guess)?
- [ ] Does it use judgment boundaries (MAY vs MUST)?
- [ ] Does it avoid fighting OpenCode's design?

---

## Philosophy Check (Non-Negotiable)

Every command/rule MUST align with `problem-solving.md`. Quick check:

**Two-Phase Model:**
- [ ] Phase 1 (ORIENT → EXPLORE) before any code?
- [ ] Phase 2 (OBSERVE → STEP → VERIFY → ITERATE) for implementation?
- [ ] NO CODE until exploration completes?

**Chess Engine Search:**
- [ ] Observations guide search direction?
- [ ] Prunes dead ends (FALSE = abandon subtree)?
- [ ] Throwaway code pattern (experiment branches, delete failures)?

**Core Philosophy:**
- [ ] References or inherits problem-solving.md?
- [ ] Atomic steps (one change → one behavior)?
- [ ] Verifies by observation (TRUE/FALSE), not assumption?
- [ ] .memory/ at end, not during?

**If a command violates → fix it during harmonization.**

---

## Phases

### Phase 1: Inventory

Catalog all files in `commands/` and `rules/`:

| File | Purpose | Dependencies |
|------|---------|--------------|
| {file} | {purpose} | {what it uses} |

Use Task agent for large codebases:
```
Task(subagent_type="Explore", prompt="Catalog all commands and rules in ~/.codex/")
```

### Phase 2: Detect Issues

| Issue Type | What to Look For |
|------------|------------------|
| **Missing Two-Phase** | Command jumps to code without ORIENT→EXPLORE |
| **No throwaway code** | Command patches failures instead of delete+retry |
| **No pruning** | Command doesn't abandon dead ends on FALSE |
| **Gap** | Command references undefined concept |
| **Contradiction** | Rule A says X, Rule B says not-X |
| **Redundancy** | Same content in multiple files |
| **Weak synergy** | Commands could connect but don't |
| **Anti-pattern** | Fights OpenCode's design (see below) |

### Phase 2.5: Token Efficiency Check

**Command files should be ~300 lines max.** Check for oversized files:

| Threshold | Action |
|-----------|--------|
| < 300 lines | OK |
| 300-500 lines | Consider splitting |
| > 500 lines | Must split to reference file |

**Reference file pattern:**
```
commands/
├── spec.md              # Router (~300 lines)
├── _reference_spec.md    # Templates, examples
├── ui.md                # Router (~300 lines)
├── _reference_ui.md      # Templates, examples
```

**Keep in main file:**
- Purpose, usage, modes
- Phase overview (brief)
- Key tables
- Guardrails
- Quick reference

**Move to reference file:**
- Detailed templates
- Full examples
- Extended checklists
- Edge case handling

**Why this matters:**
- Long files = instructions ignored (context dilution)
- Reference files only loaded when needed
- Higher adherence to core instructions

### Phase 3: Best Practices Audit

**OpenCode Native Features** - use these, don't reinvent:

| Feature | Use For |
|---------|---------|
| `TodoWrite` | Task tracking |
| `Task` with `subagent_type` | Subagent spawning |
| `Read/Write/Edit` | File operations |
| `Glob/Grep` | Search operations |
| MCP tools | Browser, IDE |

**Anti-Patterns to Flag**:

| Anti-Pattern | Fix |
|--------------|-----|
| `bash cat/echo` for files | Use Read/Write |
| `bash find/grep` | Use Glob/Grep |
| Custom task tracking | Use TodoWrite |
| Giant single prompts | Split into phases |
| Silent operations | Add progress feedback |
| No escape hatches | Add abort/rollback |
| Command file > 500 lines | Split to _reference_{cmd}.md |

**Anti-Patterns That Fight OpenCode's Training**:

| Anti-Pattern | Why It Fails | Fix |
|--------------|--------------|-----|
| Rigid checklists without rationale | OpenCode prefers judgment | Add WHY for each rule |
| "Just do X" / "Ignore safety" | Triggers resistance | Provide legitimate context |
| Ambiguous intent | OpenCode guesses, often wrong | Make intent explicit |
| Giant rule lists | OpenCode skims, misses key points | Principles + judgment boundaries |
| Literal instruction expecting | OpenCode interprets intent | State what you really want |
| "Pass the tests" framing | OpenCode avoids test hacks | Frame as "make it correct" |

**Prompt Engineering Checks**:
- Clear constraints (NEVER/ALWAYS) - but only for hard constraints
- Output format specified
- Good/bad examples included
- Role definition clear
- **Intent stated explicitly** (not assumed)
- **Definition of done** (success criteria)
- **Judgment boundaries** (MAY decide vs MUST ask)

### Phase 4: Check Drift (Docs vs Reality)

Compare command docs against actual `.memory/` artifacts:

| Artifact | Check Against | Written By |
|----------|---------------|------------|
| CONTRACTS.md | ui.md format | /ui |
| SPECS.md | spec.md format | /spec |
| GOALS.md | goals.md format | /goals |
| STATE.md | run.md STATE template (includes parking lot) | /run |
| .memory/ | problem-solving.md template | /debug |

**If docs ≠ artifacts**:
1. Check timestamps (`git log -1 --format=%ci {file}`)
2. Newer = correct (usually)
3. If unclear → ask user

```markdown
## Drift Detected: {topic}

**Docs say**: {X}
**.memory/ shows**: {Y}
**Timestamps**: docs={date}, artifact={date}
**Recommendation**: Update {docs|artifacts}

Proceed? [yes / no / explain]
```

### Phase 5: Fix (In Order)

| Order | Fix Type | Why First |
|-------|----------|-----------|
| 1 | Constitution alignment | Work WITH OpenCode's training |
| 2 | Two-Phase Model | ORIENT→EXPLORE then OBSERVE→STEP→VERIFY |
| 3 | Chess Engine Search | Observation-guided, prune dead ends |
| 4 | Best practices | Use native tools |
| 5 | Contradictions | Resolve conflicts |
| 6 | Gaps | Fill holes |
| 7 | Redundancies | Prune after above |
| 8 | Refinements | Polish last |

**Redundancy Rule**: Remove UNLESS command needs to be self-contained.

### Phase 6: PRD Sync (If Needed)

After fixing commands/rules, check if `.memory/` artifacts broke:

```markdown
## PRD Compatibility

| Project | Artifact | Compatible? |
|---------|----------|-------------|
| {proj} | CONTRACTS.md | YES/NO |
| {proj} | SPECS.md | YES/NO |
| {proj} | GOALS.md | YES/NO |
| {proj} | STATE.md | YES/NO |
| {proj} | .memory/ | YES/NO |

### Goal Status Check
Goals should use: ⬜ (pending) | 🔄 (in progress) | ✅ (done) | 🅿️ (parked)
STATE.md should include parking lot section if any goals parked.

### Fix Options
1. Update artifact to new format
2. Leave as-is (legacy)
3. Archive project
```

### Phase 7: Report

```markdown
## Harmonization Report

**Date**: {date}
**Files analyzed**: {count}

### Issues Found
| Type | Count | Fixed |
|------|-------|-------|
| Two-Phase Model | {n} | {n} |
| Chess Engine Search | {n} | {n} |
| Constitution | {n} | {n} |
| Best Practices | {n} | {n} |
| Contradictions | {n} | {n} |
| Redundancies | {n} | {n} |

### Fixes Applied
- {fix 1}
- {fix 2}

### Two-Phase Model Coverage
| Command | Phase 1 (ORIENT→EXPLORE) | Phase 2 (ITERATE) | Throwaway Code |
|---------|--------------------------|-------------------|----------------|
| /ui | ✓ | ✓ | ✓ |
| /spec | ✓ | ✓ | — |
| /goals | ✓ | ✓ | — |
| /run | ✓ | ✓ | ✓ |
| /debug | ✓ | ✓ | ✓ |
| /review | ✓ | — | — |

### Artifact Coverage
| Artifact | Written By | Checked By |
|----------|-----------|------------|
| CONTRACTS.md | /ui | /spec, /goals, /debug |
| SPECS.md | /spec | /goals, /run, /debug |
| GOALS.md | /goals | /run, /review |
| STATE.md | /run | /review |
| .memory/ | /debug | /review |

### System Health
Before: {score}/10
After: {score}/10
```

---

## Quick Fixes

**Add philosophy inheritance**:
```markdown
> **Inherits**: `problem-solving.md` (Two-Phase Model, Chess Engine Search)
```

**Add Two-Phase Model diagram** (if missing):
```markdown
## The Two-Phase Model

┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: ORIENT → EXPLORE                                      │
│  ⚠️  NO CODE until this completes                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: IMPLEMENT (iterative)                                 │
│  OBSERVE → HYPOTHESIS → ATOMIC STEP → VERIFY → PRUNE/NEXT       │
└─────────────────────────────────────────────────────────────────┘
```

**Fix violation patterns**:

| Violation | Fix |
|-----------|-----|
| Jumps to code without exploration | Add "MANDATORY: Phase 1 First" section |
| "Do X then Y then Z" | "OBSERVE → Do X → VERIFY → ..." |
| "This should work" | "Verify: TRUE or FALSE (not maybe)" |
| Patches failed code | "Delete experiment branch, try different" |
| No escape hatch | Add abort option |
| No throwaway code pattern | Add experiment branch instructions |

**Fix Constitution alignment**:

| Pattern Fighting OpenCode | Fix |
|------------------------|-----|
| "ALWAYS do X" (for non-critical) | "Generally do X because {rationale}" |
| "Follow these 20 rules" | "Core principle: {principle}. Apply judgment." |
| No stated intent | Add "**Purpose**: {WHY}" section |
| No definition of done | Add "**Output**: {success criteria}" |
| No judgment boundaries | Add "**MAY decide** / **MUST ask**" |
| Literal instruction style | Reframe as intent + constraints |

**Example fix** (before → after):
```markdown
# Before (fights OpenCode)
ALWAYS check for null. ALWAYS add error handling. NEVER skip validation.

# After (works with OpenCode)
**Intent**: Defensive code that handles edge cases gracefully.
**MAY decide**: specific error messages, validation order
**MUST ask**: skipping validation entirely, changing error behavior
```

---

## Escape Hatches

| Situation | Action |
|-----------|--------|
| Too many issues | `--focus commands` or `--focus rules` |
| Uncertain about fix | Ask user first |
| Breaking change | Commit current state first |
| Context overflow | Split into sessions |

---

## When to Run

| Trigger | Command |
|---------|---------|
| New command added | `/harmonize --focus commands` |
| Rule updated | `/harmonize --focus rules` |
| Quarterly maintenance | `/harmonize --fix` |
| After OpenCode update | `/harmonize --practices` |
| Commands updated | `/harmonize --sync-memory` |

---

## Self-Validation

Before completing:

```
□ Constitution alignment checked (rationale, intent, judgment)?
□ Two-Phase Model present in all commands?
  □ Phase 1: ORIENT → EXPLORE before code?
  □ Phase 2: OBSERVE → STEP → VERIFY → ITERATE?
□ Chess Engine Search pattern present?
  □ Observation-guided search?
  □ Prune on FALSE?
  □ Throwaway code pattern?
□ Best practices audit done?
□ Contradictions resolved (using intent)?
□ Redundancies pruned (kept where needed)?
□ PRD sync status known?
□ Report generated?
```

> **Detailed checklists**: See `_reference_harmonize.md` for extended audit templates.
