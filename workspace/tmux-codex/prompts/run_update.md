Use this command to refresh infinite-runner state after one execute slice finishes.

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

## Command

Refresh runner memory once:

```bash
python3 /Users/jian/Dev/workspace/tmux-codex/bin/runctl --setup --quiet --project-root <target_root> --runner-id main
```

Strictness rules during refresh:

- preserve or strengthen the active task acceptance/validation contract; never relax it
- preserve the active `TT-*` by default until its acceptance is fully cleared; medium slices do not justify task churn on their own
- keep the current task active when its acceptance criteria are still unmet; do not advance on partial progress
- if the execute slice narrowed the blocker but did not clear it, carry forward the same task with the narrower blocker
- if execution discovered new in-scope acceptance criteria or validation needs, merge them into the same active task so the contract gets stronger instead of silently drifting
- preserve `model_profile`, `touch_paths`, `validation_commands`, `deprecation_phase`, and `fanout_risk`; only escalate `mini` to `high` when the slice proved unsafe for cheap execution
- preserve or tighten `coupling_notes` so the next cycle inherits the exact adjacent seam or file-family risk instead of rediscovering it
- if repo-state evidence shows the active worktree is actually centered on a different family than the current task assumed, rewrite the task around that real family instead of carrying forward stale slice boundaries
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

Write prepared marker:

```bash
python3 /Users/jian/Dev/workspace/tmux-codex/bin/runctl --prepare-cycle --quiet --project-root <target_root> --runner-id main
```

## Output

Keep output compact:
- `state_refreshed=<yes|no>`
- `prepared_marker=<yes|no>`
- `exiting=<yes>`

Before terminating this chat, emit this directive on its own line so the current runner thread is archived before the supervisor relaunches a fresh session:
- `::archive{reason="Runner cycle complete; restarting fresh"}`

Terminate this Codex chat session immediately after the update commands finish.
