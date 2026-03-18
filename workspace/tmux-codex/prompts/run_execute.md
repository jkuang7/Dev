Use this command to execute exactly one medium bounded infinite-runner work slice.

Runner context from `/prompts:run_execute` args:
- `DEV=$DEV`
- `PROJECT=$PROJECT`
- `RUNNER_ID=$RUNNER_ID`
- `PWD=$PWD`
- optional `PROJECT_ROOT=$PROJECT_ROOT`
- optional `PHASE=$PHASE` (`discover|implement|verify|closeout`)

## Scope First

Resolve target root in this order:
1. explicit `PWD`
2. explicit `PROJECT_ROOT`
3. explicit `PROJECT` via `$DEV/Repos/$PROJECT`
4. current working directory

`cd` to that root before doing anything else.

## Execution Contract

Read:
- `<target_root>/.memory/runner/runtime/RUNNER_STATE.json`
- `<target_root>/.memory/runner/RUNNER_EXEC_CONTEXT.json`
- `<target_root>/.memory/runner/RUNNER_ACTIVE_BACKLOG.json`

Resolve phase from:
1. explicit `PHASE=<phase>`
2. `RUNNER_EXEC_CONTEXT.json.phase`

Load only the compact `context_sources` and `context_delta` from `RUNNER_EXEC_CONTEXT.json` plus `RUNNER_ACTIVE_BACKLOG.json` before extra repo reads.
Treat `RUNNER_HANDOFF.md` as human/manual recovery context, not default per-cycle input.
Use the active task metadata in `RUNNER_EXEC_CONTEXT.json` as hard scope:

- `model_profile`
- `touch_paths`
- `validation_commands`
- `deprecation_phase`
- `spillover_paths`
- `profile_reason`
- `coupling_notes`

Work within:
- the current `phase_goal`
- one coherent implementation surface
- one bounded validation surface for that phase

Target shape for the slice:
- larger than a tiny "next smallest step"
- smaller than a sprawling open-ended migration
- typically a focused subsystem change, a small vertical slice, or a feature spanning a few files with tests

Rules:
- do not do setup/clear behavior here
- do not run `runctl --setup` or `runctl --prepare-cycle` here; the controller scripts deterministic refresh itself after this prompt
- do not expand into broad preflight unless closeout truly requires it
- do not widen beyond `touch_paths` unless you first prove the slice is blocked or must be split
- use `validation_commands` as the default verification surface for this slice before inventing wider checks
- if the repo already has unrelated dirty files outside `touch_paths`, leave them alone and keep them out of the slice
- do not treat read-only inspection or prompt restatement as completed work
- do not advance just because code changed, one test passed, or the result feels closer
- treat the current `TT-*` as the stable unit of ownership; medium slices are execution chunks, not reasons to advance to a different task
- keep the active task open until its acceptance criteria are actually satisfied
- stay on the same `TT-*` across cycles by default while acceptance remains unmet, even when the next slice attacks a narrower sub-problem on that same task
- if the current task is actually complete, update `TASKS.json` first so the task is marked done before handoff
- if you fully completed a task in this slice, include its canonical task id in the structured runner update
- if no concrete progress happened, update `TASKS.json` first to narrow the blocker before handoff
- if the same `phase / next_task_id / blocker state` would survive unchanged, rewrite it to the exact failing surface or mark it blocked
- if the active task still has a known blocker after validation, keep the same task active and rewrite the blocker more precisely
- if new in-scope acceptance criteria are discovered while working the task, strengthen the same task's acceptance or validation contract before handoff instead of leaving the requirement implicit
- only create or switch to a different `TT-*` when the remaining work is genuinely independent of the active task's acceptance target or when one umbrella task must be split into explicit bounded blockers
- do not move to a different task while the current task's acceptance is still unmet
- if the active task is marked `mini`, keep the slice dependency-contained and fail closed instead of silently turning it into a `high` task
- if a `mini` slice needs a second subsystem, a broader file family, or a seam decision to finish, stop and carry that forward as a blocker or `high` escalation instead of widening locally
- if the active task is marked `high`, keep the work bounded to that one task anyway; stronger reasoning is not permission to sprawl across the backlog
- treat `coupling_notes` as fail-closed warnings about where the slice is likely to spill; if one of those edges activates, stop and report it instead of improvising across the boundary
- if the slice turns out to depend on a partially migrated adjacent family, stop at that seam and report the coupling instead of normalizing both families in one pass
- for any task, passing tests alone is not enough when the stated acceptance still requires behavior, UX, completeness, or polish evidence
- if the active task acceptance mentions parity, baseline matching, or restoring prior behavior/styling, treat that as fail-closed: do not claim completion on approximate similarity
- for parity-style tasks, require an explicit comparison against the recorded baseline; if any known delta remains, keep the task open and name the exact remaining surface/blocker
- do not use `phase_done=yes` for a parity-style task unless the current slice actually cleared the recorded parity delta for the audited surface
- never mark a parity/regression-restoration task complete just because tests pass; tests are necessary but not sufficient when acceptance requires baseline matching
- for subjective polish or UX tasks, require direct evidence on the touched surface; if rough edges remain, keep going on the same task

## Handoff

Do not refresh runner state from this prompt.

When the bounded work slice is done:
- stop after one coherent work surface
- review your work by asking: `Any problems with the current implementation?`
- name every real remaining issue, regression, rough edge, or acceptance gap explicitly
- if the slice was forced to stop because the declared scope was too narrow, say so explicitly so `run_update` can split or escalate it cleanly
- set `needs_update=yes` only when semantic task metadata must change: new blocker family, scope creep, task split, mini->high escalation, or acceptance/validation rewrite
- default `needs_update=no` when deterministic refresh plus prepared-marker handoff is enough
- add `scope_status` so the runner can tell whether the current task shape is still valid:
  - `scope_status=ok` when the task shape still matches the real work surface
  - `scope_status=narrow` when the same `TT-*` should stay active but its blocker needs tighter wording
  - `scope_status=split` when the task bundles multiple file families or seams and should be split
  - `scope_status=reseed` when the active open backlog is broad enough that fresh `run_update` on the stronger model must reseed it in place before the loop should continue
- choose the least disruptive truthful value: prefer `narrow` over `split`, and `split` over `reseed`, unless the task boundary is genuinely wrong
- do not overuse `scope_status=reseed`; use it only when the task shape is wrong, not merely because the current work is hard or validation failed once
- if the active task bundles multiple real file families such as `useAppLayoutStore*` plus `useAppStore*`, do not keep pushing implementation and call that out with `scope_status=split` or `scope_status=reseed`
- if the current task cannot produce durable progress without widening across a seam or second subsystem, prefer `scope_status=reseed` over another approximate retry so the next fresh `run_update` can reseed the active backlog
- if implementation starts pulling in files named in `spillover_paths` or implied by `coupling_notes`, stop and report that boundary instead of absorbing the coupled work into the same slice
- report compact operational output
- terminate this Codex chat session immediately

The runner controller will script deterministic refresh itself after this prompt completes. It will invoke `/prompts:run_update` in a separate fresh session when your output explicitly says semantic task-state changes are needed or when scripted refresh cannot produce the prepared marker.

## Output

Keep output compact and operational.

End with:
- `phase_done=<yes|no>`
- `validation=<pass|fail>`
- `needs_update=<yes|no>`
- `scope_status=<ok|narrow|split|reseed>`
- if `needs_update=yes`, optionally add `update_profile=<mini|high>`; omit it unless the update truly needs `high`
- `exiting=<yes>`
