---
model: opus
---

Resource Hint: sonnet

# /refine — Risk-Driven Council (Fast, Opinionated, Actionable)

> **Inherits**: `problem-solving.md` (ORIENT → STEP → OBSERVE)

**Purpose**: Prevent ballooning mistakes by surfacing the *most likely* failures early, then producing a short list of concrete changes with clear ACCEPT/REJECT verdicts.

**The mindset**:
- ORIENT FIRST - understand the code before critiquing
- Think out loud - state what you expect to find before looking
- Atomic findings - one issue per finding, not compound criticisms
- Observation proves - cite specific code, not vibes

```bash
/refine                   # Auto-detect target + run 1 cycle
/refine 2                 # Run 2 cycles (only if cycle 1 finds real issues)
/refine 3                 # Rare: only if cycle 2 still finds new issues
/refine <files...>        # Constrain review to specific files
/refine debate <topic>    # Structured A vs B decision when uncertainty is real
/refine --fast            # Force 1 critic (Simplicity) unless triage flags correctness as high risk
```

---

## Non-Negotiables

1. **Original intent first**
   - Fix what the user asked. Anything else is an "excursion".

2. **Risk-driven, not checklist-driven**
   - Only surface issues that are likely and costly.

3. **Output is decisions, not discussion**
   - User sees: Findings → Verdicts → Changes → Not doing.

4. **No bloat**
   - Default: 1 cycle, 2 critics max.
   - Add critics only if a specific risk demands it.

---

## Core Terms

| Term | Definition |
|------|------------|
| **Finding** | A specific issue (not a vibe) |
| **Risk** | Probability × impact (see Risk Rubric) |
| **Verdict** | ACCEPT or REJECT (one-line reason) |
| **Action** | Minimal change to address an ACCEPTed finding |
| **Excursion** | Something noticed that is not required to satisfy the original ask |

### Risk Rubric (Concrete)

| Level | Criteria |
|-------|----------|
| **High** | Likely to break core flow, data loss, security issue, or makes gates unverifiable |
| **Medium** | Likely regression or confusing behavior in common path |
| **Low** | Polish, rare edge case, or readability only |

If you can't justify "high" or "medium" with a specific scenario, it's "low."

---

## What /refine Is (and Isn't)

> "/refine is multi-cycle discourse."

It is **NOT** "debate for its own sake."

It **IS** one pass to identify high-risk problems, optionally followed by a second pass to confirm nothing new emerges after fixes are applied.

---

## Pipeline (Default)

### Phase A — Triage (60–120 seconds)

Arbiter answers:

1. **What is the goal?** (1 sentence)
2. **What could go wrong next?** (top 3 likely failure modes)
3. **What is out of scope?** (explicitly list)

Output:

```markdown
## Triage
Goal: ...
Top risks:
1) ...
2) ...
3) ...
Out of scope:
- ...
```

**If triage finds no meaningful risk → stop early with "No changes recommended".**

---

### Phase B — Select Council (2 critics max by default)

**Default council:**

- **Simplicity Critic** (prevents overengineering)
- **Correctness Critic** (prevents broken logic / edge cases)

**Add a third critic only if needed:**

| Critic | When to add |
|--------|-------------|
| Gap Critic | Flows/specs have holes |
| Pain/Flow Critic | User-facing UX/tasks are involved |
| Hygiene Critic | Repo cleanliness / artifacts are at risk |

**Rule:** If you can't justify a critic with a concrete risk, don't spawn them.

---

### Phase C — Critics Produce Findings (Structured, No Essays)

Each critic outputs **1–5 findings max**, each in this format:

```markdown
### Finding {id}
Problem:
Impact:
Minimal fix:
Risk: {high|med|low} (probability × impact)
Scope: {where else it applies}
```

---

### Phase D — Arbiter Verdicts + Verdict Trace (Hard Filter)

For each finding:

```markdown
FINDING: ...
VERDICT: ACCEPT | REJECT
REASON: ...
ACTION (if ACCEPT): ...
```

**Acceptance bar:**

- **ACCEPT** only if: real + likely + minimal + intent-aligned
- **REJECT** if: theoretical, polish-only, adds complexity, or derails intent

### Verdict Trace (Required Output)

Captures the reasoning in 4 lines per finding—auditable, not a monologue.

```markdown
## Verdict Trace

1) Finding: {short title}
   Verdict: ACCEPT | REJECT
   Reason: {risk level} + {why it matters or doesn't}
   Action: {minimal change} | N/A

2) Finding: {short title}
   Verdict: ACCEPT | REJECT
   Reason: {risk level} + {why it matters or doesn't}
   Action: {minimal change} | N/A
```

**Example**:
```markdown
## Verdict Trace

1) Finding: Page indexing ambiguous
   Verdict: ACCEPT
   Reason: high-frequency + catastrophic + cheap to fix
   Action: Add Page Indexing Contract section to SPECS

2) Finding: Persist undo across reload
   Verdict: REJECT (v1)
   Reason: high complexity, low value, checkpoints cover recovery
   Action: N/A

3) Finding: Add JSON schema validation
   Verdict: REJECT
   Reason: over-engineering, not hitting scale where this matters
   Action: N/A (add to Excursions if needed later)
```

**Why Verdict Trace exists**: Makes /refine decisions reproducible. When reviewing later, you can see WHY something was accepted/rejected, not just THAT it was.

---

### Phase E — Output (What user sees)

Always produce:

1. Council Summary Table
2. Verdict Trace (why each decision)
3. Final Recommendations (ordered)
4. Not Doing (and why)
5. Excursions (deferred)

**Template:**

```markdown
## Council Summary
| Finding | Critic | Risk | Verdict | One-line reason |
|---------|--------|------|---------|-----------------|

## Verdict Trace
1) Finding: ...
   Verdict: ACCEPT | REJECT
   Reason: ...
   Action: ...

## Final Recommendations (Do Now)
1) ...
2) ...

## Not Doing (and why)
- ... : ...

## Excursions (after goal is satisfied)
- ... : ...
```

---

## Multi-Cycle Rules (Strict)

### When cycle 2 is allowed

Only if cycle 1 ACCEPTed at least 2 findings OR changed >20% of the "contract" surface (APIs/specs/gates).

### What cycle 2 does

- Re-run triage with updated context
- Only one critic (Correctness OR Gap), not two
- Goal: catch regressions introduced by fixes

### When to stop

Stop if:
- No new ACCEPTs, or
- Only low-risk polish remains

---

## Customer Pain Lens (Required only in these cases)

Run Pain + Flow critique **only when**:

- Creating or refining UI/UX specs
- Generating tasks (`/spec` output)
- Deciding feature additions

**Pain Critic output must include:**

1. Who feels this pain?
2. How often?
3. What happens if unfixed?

**Reject anything that is "nice to have" while core pain exists.**

---

## Debate Mode (Only for Real Decisions)

Use **only when**:

- Two viable approaches exist
- Wrong choice is costly
- Evidence is ambiguous

**Debate must end with:**

- Winner
- Concrete recommendation
- What is NOT being done

**No "it depends" endings.**

### Debate Structure

```
ROUND 1 (Opening)
├── Position A: Initial argument
└── Position B: Initial counter-argument

ROUND 2 (Rebuttal)
├── Position A: Responds to B's points, strengthens or concedes
└── Position B: Responds to A's points, strengthens or concedes

FINAL (Synthesis)
└── Integrator: Opinionated verdict based on debate
```

### Debate Rules

1. **Even rounds only** - Each position gets equal turns
2. **Must respond** - Can't ignore opponent's points
3. **Concede valid points** - Acknowledge when opponent is right
4. **Break things** - Try to find failure modes, edge cases
5. **No strawmen** - Steel-man opponent's position before attacking

---

## Hard Caps (Anti-Overanalysis)

| Limit | Value |
|-------|-------|
| Critics | 2 (default), 3 (rare), 4 (never) |
| Findings per critic | 5 max |
| ACCEPTs per cycle | Aim ≤3 |
| Cycles | 1 (default), 2 (sometimes), 3 (rare) |

---

## Output Quality Gates (for /refine itself)

A /refine run is "good" only if:

- [ ] Goal is stated in 1 sentence
- [ ] Out-of-scope is explicit
- [ ] Findings are concrete (not vibes)
- [ ] Each finding has a verdict
- [ ] Verdict Trace exists (4 lines per finding)
- [ ] Recommendations are minimal and ordered
- [ ] "Not Doing" list exists
- [ ] No long transcripts are dumped

---

## What /refine Does and Doesn't Do

### Does

- Prevents "committee sprawl"
- Forces risk justification for every critic
- Produces decisions, not chatter
- Adds cycle 2 only when it's earned

### Does NOT

- Turn /refine into a second /run
- Replace gate verification
- Guarantee perfect design

### When Refining /spec Output

**Special rule**: If refining `/spec` output (tasks, SPECS.md, contracts), /refine can only ACCEPT changes that:

1. Reduce ambiguity in contract/gates, OR
2. Reduce task count

This prevents /refine from re-bloating docs that /spec just trimmed.

---

## Example

```markdown
User: I built a task status command. Can you refine it?

## Triage
Goal: Catch bugs in status command before deployment
Top risks:
1) Malformed YAML crashes the command
2) Dead code obscuring maintenance
3) Missing error feedback to user
Out of scope:
- CLI vs GUI decision (user already chose CLI)
- Concurrent access (not hitting that yet)

## Council Summary
| Finding | Critic | Risk | Verdict | One-line reason |
|---------|--------|------|---------|-----------------|
| Malformed YAML crashes | Correctness | high | ACCEPT | Users WILL hit this |
| Dead function `oldParser` | Simplicity | low | ACCEPT | Free cleanup |
| Add JSON output option | Simplicity | low | REJECT | Not requested, adds complexity |

## Verdict Trace
1) Finding: Malformed YAML crashes
   Verdict: ACCEPT
   Reason: high-frequency (any bad task file) + catastrophic (silent failure)
   Action: Add try/catch + skip bad files + warn user

2) Finding: Dead function `oldParser`
   Verdict: ACCEPT
   Reason: low risk but zero cost to fix, reduces maintenance burden
   Action: Delete function

3) Finding: Add JSON output option
   Verdict: REJECT
   Reason: not requested, adds complexity, current format works
   Action: N/A

## Final Recommendations (Do Now)
1) Add YAML error handling (skip bad files + warn)
2) Remove `oldParser` function

## Not Doing (and why)
- JSON output: over-engineering for current use case
- Schema validation: overkill for current scale

## Excursions (after goal is satisfied)
- Concurrent access handling: flag if multi-device becomes real
```
