---
model: opus
---

Resource Hint: opus

# /sieve — Inversion Stress, Occam Trim

> **Purpose**: Find where a workflow can fail (confounding variables, contamination, hallucination), add only high-leverage guardrails, then simplify back to a lean protocol.
> **Inherits**: `problem-solving.md` (ORIENT → OBSERVE → VERIFY)

---

## Usage

```bash
/sieve <target>
/sieve <target> --fix
/sieve <target> --scope prompt|runner|spec|goals|pipeline
```

Examples:

```bash
/sieve commands/run.md
/sieve Repos/habit/.memory/SPECS.md --fix
/sieve "spec->goals->run pipeline" --scope pipeline
```

---

## Execution Order (Hard Gate)

Run phases strictly in this sequence:

`0 -> 1 -> 2 -> 2.5 -> 2.6 -> 3 -> 4 -> 4.5 -> 4.6 -> 4.7 -> 5`

Rules:

- Do not enter a later phase if required output from prior phase is missing.
- Do not run lift/tuning phases (4.6, 4.7) before anti-optimism baseline (Phase 3 Pass A) is in place.
- If a phase fails validation, stop and return `UNKNOWN` with the failing phase.

---

## Non-Negotiables

1. Execute phases in order. Do not skip.
2. No guardrail without a concrete failure mode.
3. No complexity increase without measurable risk reduction.
4. No evidence = `UNKNOWN` (never success).
5. Prefer fewer, stronger controls over many weak controls.
6. Optimize for calibrated reliability, not zero-risk theater.
7. Calibration order is fixed: reduce false accepts first, then reduce false rejects.

---

## Phase 0 — ORIENT (Scope and Truth Sources)

Define before analysis:

- Target under analysis
- Intended outcome (one sentence)
- Hard invariants (must never break)
- Trusted evidence sources (logs/tests/traces/artifacts)
- Existing stop rules

If these are unclear, stop and resolve them first.

---

## Phase 1 — Confounding Variable Scan

Find variables that can distort conclusions or inflate false confidence.

Scan at least these classes:

- Ambiguous parsing (broad regex, implicit state detection)
- Stale evidence reuse (old artifacts counted as current)
- Metric gaming (score improves while behavior regresses)
- Hidden state leaks (prior run state affects current verdict)
- Tool nondeterminism (flaky tests, unstable MCP interactions)
- Spec/goal drift (contracts and execution disagree)
- Selection bias (only happy paths validated)
- Silent failure channels (non-zero exits ignored)

Output format:

```markdown
## Confounders
1) {name}
   Trigger: {what causes it}
   Distortion: {how it lies to us}
   Symptom: {observable sign}
```

---

## Phase 2 — Inversion Failure Map

Use inversion explicitly:

"If I wanted this system to look successful while actually failing, how would I do it?"

For each failure mode, produce:

- Attack path
- Earliest detection point
- Blast radius
- Likelihood (`low|med|high`)
- Impact (`low|med|high`)

Rank by `likelihood x impact`.

---

## Phase 2.5 — Extremes Calibration (Required)

Do not optimize only one failure mode.

For each top risk, classify both sides:

- **Over-optimism error** (false accept): system says "good" when broken
- **Over-punitive error** (false reject): system blocks progress when acceptable

Output format:

```markdown
## Calibration
Risk: {name}
False accept risk: {low|med|high}
False reject risk: {low|med|high}
Balance target: {what good-enough looks like}
```

Guardrails must reduce false accepts **without** creating disproportionate false rejects.

Order of operations:

1. **Anti-optimism pass first**: close false-accept paths.
2. **Anti-punitive pass second**: trim false-reject side effects introduced by step 1.

Do not skip step 1. Do not run step 2 in isolation.

---

## Phase 2.6 — Dual-Error Budget (Required)

Set explicit tolerance for both error types:

- `FA` (false accept): optimistic pass when broken
- `FR` (false reject): punitive block when acceptable

Define per critical path:

```markdown
## Error Budget
Path: {name}
FA tolerance: {low|med|high}
FR tolerance: {low|med|high}
Rationale: {business/user impact}
```

Rule:

- Safety-critical paths: minimize `FA`, accept some `FR`
- Iteration-heavy paths: minimize `FR`, monitor `FA` with audits

---

## Phase 3 — Minimal Guardrails

For top-ranked failures, add one minimal guardrail each:

- `prevent`: blocks bad state
- `detect`: catches quickly
- `fail-safe`: safe stop behavior
- `audit`: leaves an explainable trail

Pass A (required): anti-optimism baseline controls:

- provenance/freshness checks
- invariant gate integrity
- non-zero exit to explicit fail-safe
- strict parser over fuzzy extraction

Only after Pass A, run Pass B to reduce punitive behavior.

Guardrail requirements:

- Must be executable or observable
- Must map to a specific failure mode
- Must define pass/fail signal

For each guardrail also record:

- `cost`: low|med|high (runtime + complexity)
- `punitive_risk`: low|med|high (chance of blocking valid progress)

Default preference:

- Choose `detect` before `prevent` unless risk is high-impact/high-likelihood
- Prefer scoped checks (changed surface, critical flows) over global sweeps
- New punitive controls start in `observe-only` mode before hard enforcement

---

## Phase 4 — Occam Trim (Mandatory)

After adding guardrails, simplify.

For every guardrail ask:

1. If removed, does real risk materially increase?
2. Is this already covered by an existing invariant?
3. Can two controls merge into one clearer control?
4. Is this control punishing uncertainty more than improving truth?

Drop anything that is duplicate, weak, or theoretical.

Complexity budget (default):

- Max 7 active guardrails per critical path
- Max 3 stop reasons for normal operation
- Max 1 lightweight audit stream

Trim rule:

- If a control has `punitive_risk=high` and does not materially reduce false accepts, remove it.

Trim sequencing:

1. Keep controls that prevent false accepts in critical paths.
2. Then relax punitive controls on non-critical paths (warn/shadow/retry-once).

---

## Phase 4.5 — Good-Enough Gate Design

Define a calibrated completion gate:

Required to pass:

1. Hard invariants pass
2. Critical flow smoke checks pass
3. Contamination checks clear

Not required by default:

- Full edge-case matrix
- Exhaustive non-critical path testing

Escalate depth only when risk evidence justifies it (regression, incident, repeated failure).

Anti-punitive defaults:

- Optional checks use `warn` first, not immediate block
- Non-hard failures can retry once if known flaky
- Hard-stop requires either hard-invariant failure or repeated calibrated failure

---

## Phase 4.6 — Conservatism Lift (Required After Stabilization)

Once anti-optimism controls are stable, deliberately reduce excess conservatism.

Stability precondition (all true):

1. No false-accept incidents in recent window
2. Hard invariants remain green
3. Critical flow smoke remains green

Entry gate:

- Phase 3 Pass A controls are active
- Phase 4.5 completion gate is defined
- At least one full window `W` of observations exists

Default trigger window:

- `W = 20` recent iterations (or closest equivalent batch)

Lift trigger (all true in `W`):

1. `hard_invariant_failures = 0`
2. `critical_flow_failures = 0`
3. `unknown_or_blocked_rate >= 0.35`
4. `manual_override_to_accept_rate >= 0.20` (when available)

If (4) is unavailable, use repeated operator feedback that gates are too strict.

Lift actions (in order):

1. `block -> warn` for non-critical checks
2. `warn -> shadow` for low-signal checks
3. Narrow scope from global to changed-surface where safe

Never lift controls that protect hard invariants or critical flow integrity.

Hysteresis (anti-thrash):

- After a lift, do not tighten the same control immediately.
- Re-tighten only on fresh hard evidence (hard-invariant failure, critical-flow failure, or contamination hit).

Change-rate guard:

- `guardrail_change_rate = level_changes / W`
- If `guardrail_change_rate > 0.15`, freeze further lifts for one full window and run root-cause review.
- If observed samples in window `< 0.8 * W`, mark status `watch` and defer additional ladder changes.

---

## Phase 4.7 — Anti-Thrash Policy (Required)

Keep control tuning stable and reversible.

Defaults:

- `C = 10` iteration cooldown after any ladder move on a control
- max `1` ladder move per control per window `W`
- max `2` control demotions per window `W`
- no multi-control demotion when `W` sample size is incomplete

Rollback rule:

- If a lift is followed within `C` iterations by hard-invariant failure,
  critical-flow failure, or contamination failure, revert that control
  one level tighter and mark the lift as failed.

Escalation rule:

- If two consecutive lift attempts fail on the same control,
  lock that control at current level and require human review.

---

## Enforcement Ladder

Use one ladder for both tightening and lifting:

- `shadow` (observe-only)
- `warn` (visible but non-blocking)
- `block` (hard stop)

Direction:

- When optimism risk rises: move up ladder (`shadow -> warn -> block`)
- When conservatism risk dominates: move down ladder (`block -> warn -> shadow`)

Every ladder move must cite evidence.

---

## Phase 5 — Hallucination/Contamination Checks

Before final recommendation, verify:

- Provenance check: every claim maps to a concrete artifact
- Freshness check: artifacts belong to current run/iteration
- Isolation check: conclusions are not using unrelated state
- Parser check: state extraction is explicit, not fuzzy
- Failure check: non-zero exit paths become explicit stops

Calibration checks:

- A failed optional check should not block completion unless tied to a hard invariant or critical flow.
- Unknowns must be scoped (what is unknown, why, impact), not global paralysis.
- Retry-once policy allowed for known flaky checks before punitive stop.
- New guardrails should run in shadow mode first (`observe-only`) before blocking.

Conservatism checks:

- If `UNKNOWN` or blocked outcomes dominate without hard failures, trigger lift review.
- If guardrails repeatedly block but later manual review says "acceptable", demote control level.
- Prefer targeted checks over global gates when risk localization is possible.
- Use the default lift trigger window before demoting multiple controls at once.

Any failed check downgrades result to `UNKNOWN`.

---

## Output (Lean)

Return exactly:

1. Top 5 failure modes (ranked)
2. Keep/Drop guardrail list with one-line reasons
3. Final lean protocol (ordered steps)
4. Residual risks (accepted intentionally)
5. If `--fix`: minimal patch plan and files touched
6. Calibration verdict: `too optimistic` | `too punitive` | `balanced`
7. Error-budget policy used: `{FA}/{FR}` + enforcement mode
8. Ordering check: `anti-optimism first` -> `anti-punitive second` (pass/fail)
9. Conservatism lift plan: controls to demote (`block|warn|shadow`) and why
10. Lift trigger status: `met|not met` with window stats (`W`, blocked rate, hard-fail count)
11. Thrash status: `stable|watch|thrashing` + `guardrail_change_rate`

No essays. No speculative redesign.

---

## Decision Rule

- If risk drops and complexity stays flat/down: **ACCEPT**
- If risk drops but complexity jumps: **TRIM and re-check**
- If no measurable risk reduction: **REJECT change**

Goal: controlled, scalable, low-confusion systems.
