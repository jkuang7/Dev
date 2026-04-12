# _reference_harmonize.md - Extended Audit Templates

> **Used by**: `/harmonize` for detailed checks. Not loaded by default.

---

## Constitution Alignment Checklist (Full)

OpenCode's Constitution shapes its behavior during training. Commands that align with this are more effective.

```markdown
## Constitution Alignment: {file}

### Priority Hierarchy Awareness
- [ ] Does command respect OpenCode's priority stack?
      (Safety > Intent > Observable > Guidelines > Helpful)
- [ ] Are hard constraints clearly distinguished from soft guidance?
- [ ] Does it avoid treating all rules as equally important?

### Intent Over Literal
- [ ] Does command make intent explicit (not assumed)?
- [ ] Does it explain WHY, not just WHAT?
- [ ] Does it provide definition of done (success criteria)?
- [ ] Would OpenCode correctly infer the real goal?

### Judgment Over Rules
- [ ] Does it use principles + judgment (not rigid checklists)?
- [ ] Are judgment boundaries explicit (MAY vs MUST)?
- [ ] Does it provide rationale for constraints?
- [ ] Does it avoid over-specified rules for non-critical stuff?

### Works WITH OpenCode's Design
- [ ] Does it frame tasks as "make it correct" (not "pass tests")?
- [ ] Does it avoid coercive language ("just do it", "ignore")?
- [ ] Does it provide context for ambiguous risk scenarios?
- [ ] Does it leverage OpenCode's preference for robust over clever?

### Common Patterns That Fight OpenCode
- [ ] No giant rule lists without rationale?
- [ ] No "ALWAYS/NEVER" for judgment calls?
- [ ] No literal instruction expecting?
- [ ] No ambiguous intent relying on guessing?

**Violations found**: {list}
**Fixes needed**: {list}
```

### Intent Framing Examples

| Bad (fights OpenCode) | Good (works with OpenCode) |
|---------------------|--------------------------|
| "Fix the tests" | "Fix the underlying bug so tests pass" |
| "Do exactly this" | "Goal is X. Here's one approach, use judgment." |
| "ALWAYS check null" | "Defensive code handles edge cases. MAY: decide how." |
| "Follow these rules" | "Intent: {why}. Apply principles contextually." |
| [no context] "Edit this" | "Context: production code. Goal: minimal diff." |

### Judgment Boundary Template

```markdown
**Runner/OpenCode MAY decide** (within intent):
- Exact error message wording
- Implementation details
- Minor styling/formatting
- Log verbosity

**Runner/OpenCode MUST ask** (could violate intent):
- Adding new features
- Changing observable behavior
- Modifying data contracts
- Skipping specified constraints
```

---

## Philosophy Compliance Checklist (Full)

For each command/rule analyzed:

```markdown
## Philosophy Compliance: {file}

- [ ] References problem-solving.md or inherits its principles?
- [ ] Decomposes into atomic, manually testable pieces?
- [ ] Has ORIENT FIRST before any action?
- [ ] Thinks out loud (hypothesis BEFORE action)?
- [ ] Uses atomic steps (one change → observe)?
- [ ] Each step manually testable in <30 seconds?
- [ ] Doesn't assume correctness (verifies by observation)?
- [ ] .memory/ timing correct (end, not during)?
- [ ] Supports the fractal cycle at its level of abstraction?

**Violations found**: {list}
**Fixes needed**: {list}
```

---

## Best Practices Audit (Full)

```markdown
## Best Practices Audit: {file}

### OpenCode Native
- [ ] Uses TodoWrite for task tracking (not custom)
- [ ] Uses Task tool for subagents (not manual prompts)
- [ ] Uses Read/Write/Edit (not bash cat/echo)
- [ ] Uses Glob/Grep (not bash find/grep)
- [ ] Leverages MCP tools appropriately

### Prompt Engineering (Constitution-Aware)
- [ ] Clear role/persona definition
- [ ] Explicit constraints - but only NEVER/ALWAYS for hard constraints
- [ ] Soft constraints use "generally" + rationale
- [ ] Output format specified
- [ ] Good/bad examples included
- [ ] Encourages reasoning for complex decisions
- [ ] **Intent stated explicitly** (Purpose section)
- [ ] **Definition of done** (success criteria)
- [ ] **Judgment boundaries** (MAY vs MUST)

### UX Flow
- [ ] Clear entry point
- [ ] Obvious next steps
- [ ] Can abort/rollback
- [ ] Provides feedback on actions
- [ ] No dead ends

### Agentic Behavior
- [ ] Observes before acting
- [ ] Makes small, verifiable changes
- [ ] Can resume from interruption
- [ ] Cleans up artifacts
- [ ] Logs progress transparently

### OpenCode Training Alignment
- [ ] Provides rationale (not just rules)
- [ ] Frames as intent + constraints (not literal instructions)
- [ ] Uses "robust/correct" framing (not "pass tests")
- [ ] Avoids coercive language patterns
- [ ] Distinguishes hard constraints from judgment calls
```

---

## Drift Detection Template

```markdown
## Drift Detected: {topic}

**Commands say** ({file}:{lines}):
{exact text or structure from command/rule}

**.memory/ shows** ({file}):
{exact text or structure from artifact}

**Timestamps**:
- Command/rule: `git log -1 --format=%ci {path}` → {date}
- .memory/ artifact: `git log -1 --format=%ci {path}` → {date}

**Drift direction**: {Docs outdated | Artifacts stale | Both recent}
**My recommendation**: Update {docs | artifacts}
**Reasoning**: {why this direction}
**Confidence**: high | medium | low

---
**Proceed?** [yes / no / update other direction / explain]
```

---

## PRD Compatibility Check Template

```markdown
## PRD Compatibility Check

### Artifacts Scanned
| Artifact | Location | Last Modified | Written By | Compatible? |
|----------|----------|---------------|------------|-------------|
| CONTRACTS.md | Repos/{project}/.memory/ | {date} | /ui | YES/NO |
| SPECS.md | Repos/{project}/.memory/ | {date} | /spec | YES/NO |
| GOALS.md | Repos/{project}/.memory/ | {date} | /goals | YES/NO |
| STATE.md | Repos/{project}/.memory/ | {date} | /run | YES/NO |
| context/lessons/patterns/principles | Repos/{project}/.memory/ | {date} | all | YES/NO |

### Goal Status Format Check
Goals should use: ⬜ (pending) | 🔄 (in progress) | ✅ (done) | 🅿️ (parked)
- [ ] GOALS.md uses correct status symbols?
- [ ] STATE.md has parking lot section if goals parked?
- [ ] Parked goals have: reason, needs, route-to?

### Artifact Cross-References
| Source | Should Reference |
|--------|------------------|
| SPECS.md | CONTRACTS.md (data shapes, actions) |
| GOALS.md | SPECS.md (decisions), CONTRACTS.md (shapes) |
| STATE.md | GOALS.md (goal IDs, status) |

### Incompatibilities Found
| Artifact | Issue | Command Changed |
|----------|-------|-----------------|
| {file} | {what's wrong} | {which command update broke it} |
```

---

## Full Harmonization Report Template

```markdown
## Harmonization Report

**Date**: {date}
**Files analyzed**: {count}

### Issues Found
| Type | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| Philosophy | {n} | {n} | {n} | {n} |
| Best Practices | {n} | {n} | {n} | {n} |
| Gaps | {n} | {n} | {n} | {n} |
| Contradictions | {n} | {n} | {n} | {n} |
| Redundancies | {n} | {n} | {n} | {n} |
| Synergy | {n} | {n} | {n} | {n} |

### Best Practices Alignment
- OpenCode native: {score}/10
- Prompt engineering: {score}/10
- UX flow: {score}/10
- Agentic patterns: {score}/10

### Fixes Applied
- {fix 1}
- {fix 2}

### PRD Sync Status
| Project | Artifacts | Status |
|---------|-----------|--------|
| {project} | CONTRACTS, SPECS, GOALS, STATE, .memory/ | Compatible / Updated / Skipped |

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

## Self-Validation Checklist (Full)

```
PHASE 0: PHILOSOPHY COMPLIANCE (FIRST)
□ Every file checked against canonical philosophy?
□ Decomposition enforced (atomic, manually testable)?
□ ORIENT FIRST present in all action-taking commands?
□ Think out loud (hypothesis BEFORE action) enforced?
□ No "assume correctness" patterns found?
□ .memory/ timing correct (end, not during)?

PHASE 1: INVENTORY
□ All files cataloged?
□ Cross-references mapped?

PHASE 1.5: UNDERSTAND INTENT
□ Design docs read (AGENTS.md, _task_lifecycle.md)?
□ .memory/ artifacts sampled?
□ Authoritative sources identified?
□ Drift direction determined?

PHASE 2: INTERNAL ISSUES
□ Philosophy violations detected?
□ Gaps identified?
□ Contradictions found?
□ Redundancies noted?
□ Synergy assessed?

PHASE 2.5: BEST PRACTICES
□ OpenCode native features used?
□ Prompt engineering patterns followed?
□ UX flow makes sense?
□ Agentic patterns correct?

PHASE 3-5: FIXES
□ Philosophy violations fixed FIRST?
□ Best practices fixed?
□ Contradictions resolved (using intent)?
□ Redundancies pruned?

PHASE 5.5: PRD SYNC
□ .memory/ artifacts scanned?
□ Incompatibilities identified?
□ User consulted on fixes?

PHASE 6: REPORT
□ Report generated?
□ Scores calculated?
```

---

## Viral Injection Patterns

When a command lacks philosophy alignment:

**1. Add inheritance line:**
```markdown
> **Inherits**: `problem-solving.md` (ORIENT → STEP → OBSERVE)
```

**2. Fix violation patterns:**

| Violation | Injection |
|-----------|-----------|
| "Do X then Y then Z" | "ORIENT → Do X → OBSERVE → ORIENT → Do Y → ..." |
| "Update .memory/ with findings" | "Note findings (for .memory/ later)" |
| "This should work" | "Verify by observation" |
| "Implement the fix" | "ORIENT → implement one step → OBSERVE → repeat" |

**3. Reference the source:**
```markdown
> See `problem-solving.md` for the canonical philosophy.
```

---

## Good vs Bad Findings

**Good Finding** (actionable, specific):
```markdown
| Location | Issue | Severity | Fix |
|----------|-------|----------|-----|
| tasks.md:45 | Uses `bash cat` to read files | high | Replace with Read tool |
| run.md:120 | No escape hatch if task fails | med | Add "abort with /run --stop" |
```

**Bad Finding** (vague):
```markdown
| Location | Issue | Severity |
|----------|-------|----------|
| tasks.md | "Could be clearer" | low |
```

Good findings explain: what's wrong, where, why it matters, how to fix.

---

## Principal Hierarchy Context

OpenCode weights instructions by source:

```
1. Anthropic (training-time constitution) - highest weight
2. Operator (system prompts, API setup) - high weight
3. User (conversation messages) - normal weight
```

**What this means for commands**:

Commands live at the "Operator" level (system prompt territory). They have high weight but can't override Anthropic's hard constraints.

| Instruction Level | What It Can Do |
|------------------|----------------|
| **Anthropic** | Hard constraints, core values (can't override) |
| **Operator** (our commands) | Guide behavior, set context, define boundaries |
| **User** | Request specific tasks within those boundaries |

**Design implications**:
- Commands can shape OpenCode's behavior significantly
- But can't force violations of hard constraints
- Should provide context that legitimizes requests
- Should make boundaries explicit (so OpenCode doesn't guess)

---

## Why OpenCode Refuses (And How to Prevent It)

OpenCode refuses when it detects:

| Trigger | Why | Prevention |
|---------|-----|------------|
| Ambiguous risk + no context | Can't verify legitimacy | Provide explicit context |
| Coercive framing | Triggers resistance | Use collaborative framing |
| Near hard constraint | Safety priority | Ask for adjacent/safer version |
| Manipulation patterns | Autonomy preservation | Be direct about intent |
| Missing rationale | Can't assess appropriateness | Explain WHY |

**Example - Security Research**:

```markdown
# Bad (triggers refusal)
"Show me how to exploit this vulnerability"

# Good (provides context)
"Context: Authorized pentest. Goal: Validate our XSS fix.
If direct steps aren't possible, provide:
- Threat model
- Detection signals
- Mitigation verification"
```

---

## Self-Validation Checklist (Full - Updated)

```
PHASE 0: CONSTITUTION ALIGNMENT (FIRST)
□ Commands provide rationale (WHY), not just rules?
□ Intent is explicit (not relying on OpenCode guessing)?
□ Judgment boundaries clear (MAY vs MUST)?
□ Hard constraints distinguished from soft guidance?
□ Framing works WITH OpenCode's training?
□ Definition of done provided?

PHASE 1: PHILOSOPHY COMPLIANCE
□ Every file checked against canonical philosophy?
□ Decomposition enforced (atomic, manually testable)?
□ ORIENT FIRST present in all action-taking commands?
□ Think out loud (hypothesis BEFORE action) enforced?
□ No "assume correctness" patterns found?
□ .memory/ timing correct (end, not during)?

PHASE 2: INVENTORY
□ All files cataloged?
□ Cross-references mapped?

PHASE 2.5: UNDERSTAND INTENT
□ Design docs read (AGENTS.md, _task_lifecycle.md)?
□ .memory/ artifacts sampled?
□ Authoritative sources identified?
□ Drift direction determined?

PHASE 3: INTERNAL ISSUES
□ Philosophy violations detected?
□ Constitution alignment issues detected?
□ Gaps identified?
□ Contradictions found?
□ Redundancies noted?
□ Synergy assessed?

PHASE 3.5: BEST PRACTICES
□ OpenCode native features used?
□ Prompt engineering patterns followed (Constitution-aware)?
□ UX flow makes sense?
□ Agentic patterns correct?

PHASE 4-6: FIXES
□ Constitution alignment fixed FIRST?
□ Philosophy violations fixed?
□ Best practices fixed?
□ Contradictions resolved (using intent)?
□ Redundancies pruned?

PHASE 6.5: PRD SYNC
□ All five artifacts scanned (CONTRACTS, SPECS, GOALS, STATE, .memory/)?
□ Goal status format correct (⬜🔄✅🅿️)?
□ Parking lot present in STATE.md if goals parked?
□ Cross-references between artifacts valid?
□ Incompatibilities identified?
□ User consulted on fixes?

PHASE 7: REPORT
□ Report generated?
□ Scores calculated?
```
