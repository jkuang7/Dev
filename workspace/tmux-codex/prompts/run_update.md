Use this command to refresh infinite-runner state after one execute slice finishes.

This is the infinite runner's autonomous recovery prompt. It keeps the loop moving without wiping runner memory or rebuilding from scratch.

Runner context from `/prompts:run_update` args:
- `DEV=$DEV`
- `PROJECT=$PROJECT`
- `RUNNER_ID=$RUNNER_ID`
- `PWD=$PWD`
- optional `PROJECT_ROOT=$PROJECT_ROOT`

## Scope First

Resolve target root in this order:
1. explicit `PWD`
2. explicit `PROJECT_ROOT`
3. explicit `PROJECT` via `$DEV/Repos/$PROJECT`
4. current working directory

`cd` to that root before doing anything else.

## Backlog Repair

Repair runner memory once in place. This prompt owns semantic backlog repair only. The controller will run deterministic `runctl --setup` and `runctl --prepare-cycle` after this prompt exits.

Strictness rules during repair:

- preserve the objective, completed tasks, runner identity/runtime enablement, and overall project direction
- preserve or strengthen the active task acceptance/validation contract; never relax it
- preserve the active `TT-*` by default until its acceptance is fully cleared; medium slices do not justify task churn on their own
- keep the current task active when its acceptance criteria are still unmet; do not advance on partial progress
- if the execute slice narrowed the blocker but did not clear it, carry forward the same task with the narrower blocker
- if execution discovered new in-scope acceptance criteria or validation needs, merge them into the same active task so the contract gets stronger instead of silently drifting
- preserve `model_profile`, `touch_paths`, `validation_commands`, `deprecation_phase`, and `fanout_risk`; only escalate `mini` to `high` when the slice proved unsafe for cheap execution
- preserve or tighten `coupling_notes` so the next cycle inherits the exact adjacent seam or file-family risk instead of rediscovering it
- if repo-state evidence shows the active worktree is actually centered on a different family than the current task assumed, rewrite the task around that real family instead of carrying forward stale slice boundaries
- keep this prompt model-efficient: use `mini` by default, but if the active backlog really needs broader repair, use `high` and reseed it in place without clearing the whole runner state
- if execute reported `scope_status=split` or `scope_status=reseed`, do not keep the same umbrella task alive unchanged
- if execute reported `scope_status=narrow`, tighten the blocker on the same `TT-*` and preserve the existing task metadata
- prefer `scope_status=narrow` when the family boundary is still right and only the remaining blocker got clearer
- if execute reported `scope_status=split`, split the active task into narrower child tasks when the next lower-coupling tasks are obvious from the current repo and task surface
- if execute reported `scope_status=reseed`, reseed the active open backlog in place around the same objective; preserve done/completed history and rewrite only the active open/blocked task graph
- do not turn ordinary hard debugging into `scope_status=reseed`; keep the same task active when the family is still correct and only the blocker needs tighter wording
- do not merge a second coupled family into the active task during refresh; preserve the original family boundary and record the coupled surface explicitly so the reseeded backlog keeps that family separate
- do not wipe all memory files, do not rebuild from scratch as if setup were new, and do not discard completed history
- do not spin off a new task for newly discovered acceptance criteria unless the work is truly independent of the current task's acceptance target
- preserve explicit, self-contained problem descriptions in the objective, task title, acceptance, validation, and `next_task`; never rewrite them into shorthand that depends on prior chat context
- if the remaining blocker changed, rewrite it as the exact remaining problem on the exact surface instead of using implicit phrases like `continue`, `fix remaining issue`, `fonts`, `polish`, or `same bug`
- never assume screenshots or earlier turns will be available to the next runner; refreshed wording must stand on its own
- do not let refresh rewrite a fail-closed task into approximate wording like `closer`, `looks better`, or `mostly done`
- for subjective polish, UX, or completeness work, keep direct-evidence requirements in place
- if the active objective/task is parity, regression-restoration, or baseline-matching work, the refreshed state must remain fail-closed
- do not refresh vague wording such as `looks right` or `matches old styling`; keep explicit baseline-comparison and no-known-delta criteria in place
- if the execute slice did not fully clear the parity delta, keep the task open and carry forward the exact remaining blocker
- if the same `TT-*` survives multiple cycles, keep tightening the blocker or split it into a few explicit dependent tasks; do not leave the task as a vague XL umbrella
- if refresh reveals scope creep or dependency spillover, split the task by file family instead of keeping one mixed slice alive
- if coupling turned out to be higher than setup predicted, write that down explicitly in the task metadata before the next cycle
- if stale done-task history is bloating `TASKS.json`, compact the file to the active backlog and keep the historical proof in ledger/handoff instead
- if the last cycle ended with no durable progress, this prompt is responsible for repairing the active backlog enough that the next execute cycle can continue; do not leave the same broad stalled title unchanged
- treat `TASKS.json` as the primary backlog source of truth for this prompt; the controller regenerates `RUNNER_STATE.json`, `RUNNER_EXEC_CONTEXT.json`, `RUNNER_ACTIVE_BACKLOG.json`, `RUNNER_HANDOFF.md`, and `RUNNER_CYCLE_PREPARED.json` after this prompt exits
- do not directly edit `RUNNER_STATE.json`, `RUNNER_EXEC_CONTEXT.json`, `RUNNER_HANDOFF.md`, or `RUNNER_CYCLE_PREPARED.json` from this prompt
- keep reseeding dependency-safe:
  - only one actionable next task should remain `open` when a single next slice is obvious
  - downstream tasks with unmet `depends_on` must be `blocked`, not left `open` for visibility
  - if repair splits one task into children, make the first actionable child the only open next slice unless two truly independent parallel starts are already part of the plan

## Output

Keep output compact:
- `state_repaired=<yes|no>`
- `scope_status=<ok|narrow|split|reseed>`
- `exiting=<yes>`

The tmux-codex supervisor now handles runner-thread archiving itself between cycles. Do not emit any archive directive from this prompt.

Terminate this Codex chat session immediately after backlog repair finishes.
