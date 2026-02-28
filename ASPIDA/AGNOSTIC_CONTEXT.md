# Agnostic Context (Reusable Across Interviews)

Last updated: 2026-02-11

Purpose: durable source context from coaching sessions and prep docs.
Use this for consistency. Do not memorize it verbatim.

Interview objective: reduce hiring-side risk by proving ownership,
execution reliability, technical depth, and durable team fit.

## Candidate Operating Profile

- Works best in high-trust, low-bureaucracy teams.
- Prefers end-to-end ownership with clear accountability.
- Optimizes for fast delivery by de-risking early.
- Strong at converting ambiguity into an execution plan.
- Uses stakeholder alignment to accelerate delivery.

## Current Target (Tailoring Context Only)

- Company: Aspida.
- Role shape: Lead Engineer, integration-heavy, hands-on technical lead.
- Domain: insurance and annuity workflows.
- Stack signals: Node.js, React, AWS, DynamoDB.

## Canonical Story Bank (Interview-safe)

### STORY-01: Stalled Xactware migration turnaround
- Signal: ownership under ambiguity, delivery rescue.
- Situation: project stalled with deadline pressure and SLA risk.
- Actions: re-scoped work, aligned stakeholders, wrote execution plan,
  parallelized delivery with junior engineer, owned cutover readiness.
- Results: timeline reduced from about 6 months to about 3 months,
  production release completed, $200K+ SLA exposure avoided.

### STORY-02: NBUS migration architecture
- Signal: technical leadership and team parallelization.
- Situation: IBM BPM monolith blocked parallel development.
- Actions: designed Step Functions state pattern,
  built architecture skeleton, created living runbook,
  aligned leads before wider rollout.
- Results: 5 engineers worked in parallel,
  delivery finished about 6 months early,
  supports roughly 10K daily transactions.

### STORY-03: Blue/green deployment adoption
- Signal: influence without authority, reliability improvement.
- Situation: rolling deploys created risk and operational strain.
- Actions: implemented POC, demonstrated results,
  gained sponsorship, enabled broader adoption.
- Results: cutover latency improved from p99 4.77s to 150ms,
  deployment safety and speed improved across projects.

### STORY-04: ETL memory root-cause fix
- Signal: debugging depth, first-principles execution.
- Situation: analytics pipeline crashed on very large files.
- Actions: isolated ingestion code locally,
  found full-file memory load bug,
  moved to batching/streaming approach.
- Results: 98% memory reduction,
  large-file processing stabilized,
  eliminated need for oversized memory allocations.

### STORY-05: Mentorship and onboarding acceleration
- Signal: player-coach leadership.
- Situation: onboarding and on-call ramp were slow/inconsistent.
- Actions: built practical SOPs and structured ramp flow,
  combined guidance with active code review support.
- Results: ramp time improved from about 10 weeks to about 6 weeks.

## Evidence Ledger (Do Not Over-claim)

- 40M+ yearly requests across cloud migration work.
- 99.9% uptime claim should be framed as post-stabilization period.
- $200K+ SLA risk avoided on Xactware migration.
- p99 cutover 4.77s to 150ms from blue/green rollout.
- 98% memory reduction on ETL pipeline fix.
- 6 months early delivery on NBUS migration.

## Interview-safe Framing Rules

- Frame misses as planning/ownership gaps, not people blame.
- Lead with business impact, then architecture detail.
- Clarify exact "I" ownership before discussing team output.
- Name tradeoffs explicitly (speed vs controls, scope vs completeness).
- Keep responses concise first; add nuance only on follow-up.

## Reusable Language Patterns

- "I move quickly by de-risking critical paths early."
- "I optimize for speed with accountability, not speed without controls."
- "If debugging is expensive, I first make the problem testable."
- "I align business and engineering on one execution plan before scale-out."

## Source-of-truth Inputs

- `/Users/jian/Dev/Career/Job Posting.md`
- `/Users/jian/Dev/Career/Interview_Profile.md`
- `/Users/jian/Dev/Career/Aspida_Notes.md`
- `/Users/jian/Dev/.claude/career/narrative.md`

## Working Files for This Target

- `ASPIDA/STUDY_PLAN.md`
- `ASPIDA/BEHAVIORAL_PRACTICE.md`
- `ASPIDA/AGNOSTIC_CONTEXT.md`
