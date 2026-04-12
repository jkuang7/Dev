# Runner Prompt Contract (Codex Infinite Runner)

Deterministic state management for `cl loop` runners.

## Non-Negotiables

- `/run` never starts loops by itself.
- Single runner id per project: `main`.
- Runtime truth is canonical JSON under `<target-root>/.memory/runner`.
- `run_gates` is mandatory for done state.
- Root lock files in `<target-root>/.memory` remain authoritative:
  - `RUNNER_DONE.lock`
  - `RUNNER_STOP.lock`
  - `RUNNER_ACTIVE.lock`

## Canonical Runtime Files

- `<target-root>/.memory/runner/RUNNER_STATE.json`
- `<target-root>/.memory/runner/TASKS.json`
- `<target-root>/.memory/runner/PRD.json`
- `<target-root>/.memory/runner/RUNNER_EXEC_CONTEXT.json`
- `<target-root>/.memory/runner/RUNNER_PARITY.json`
- `<target-root>/.memory/runner/RUNNER_LEDGER.ndjson`
- `<target-root>/.memory/runner/RUNNER_CYCLE_PREPARED.json` (ephemeral handoff marker)
- `<target-root>/.memory/gates.sh`
- `<target-root>/.memory/lessons.md`

## Legacy File Policy

Deprecated view files are removed on setup when present:

- `<target-root>/.memory/runner/RUNNER_NEXT.md`
- `<target-root>/.memory/runner/RUNNER_DOD.md`
- `<target-root>/.memory/runner/RUNNER_PLAN.md`
- `<target-root>/.memory/runner/PRD.md`
- `<target-root>/.memory/runner/TASKS.md`
- `<target-root>/.memory/GOALS.md`

Optional human notes like `.memory/REFRACTOR_STATUS.md` can remain, but they have zero runtime authority.

## Root Resolution

`runctl` resolves target root in this order:

1. `--project-root <abs-path>`
2. `$DEV/Repos/<project>/.memory/RUNNER_CONTEXT.json`
3. saved runner state (`git_worktree`, worktree-preferred)
4. `$DEV/Repos/<project>`

## Setup Contract

`--setup` does the following:

- when driven through `/prompts:run_setup` without `--approve-enable`, a two-phase `--clear` should run first
- when runner objective/task files are missing, generic, or stale, `/prompts:run_setup` should seed concrete `PRD.json` and `TASKS.json` from the latest explicit user request before setup
- for migrations, refactors, and parity-sensitive UI work, `/prompts:run_setup` should also seed `RUNNER_PARITY.json` with one explicit safe baseline commit plus the smallest truthful audited surface set
- seeded tasks should be narrow enough for one bounded runner slice; the first task should name the first executable blocker or surface, not a broad umbrella initiative
- refreshes `<target-root>/.memory/runner/`
- clears transient locks: `RUNNER_STOP.lock`, `RUNNER_ACTIVE.lock`
- keeps persistent done lock semantics tied to `TASKS.json` + gates outcome
- selects `next_task_id` deterministically from `TASKS.json`:
  - `status=open`
  - dependencies resolved
  - priority order
  - oldest `updated_at` tie-break
- writes `RUNNER_EXEC_CONTEXT.json`
- injects compact parity scope into `RUNNER_EXEC_CONTEXT.json` from `RUNNER_PARITY.json` plus the active task metadata
- emits enable token only when needed

## Task Reconciliation Contract

- `runctl --setup` does not infer completion from code shape; it only selects from `TASKS.json`.
- Before starting or continuing a loop, reconcile stale `open` tasks if repo evidence shows their acceptance is already satisfied.
- Update files in this order:
  1. `<target-root>/.memory/runner/TASKS.json`
  2. `<target-root>/.memory/runner/PRD.json`
  3. `<target-root>/.memory/runner/RUNNER_STATE.json`
  4. `<target-root>/.memory/runner/RUNNER_EXEC_CONTEXT.json`
- Prefer marking completed refactor/debt slices `done` and collapsing the remaining work into one explicit closeout task.
- Do not keep broad historical refactor tasks open once their high-leverage code changes have landed; stale `open` tasks can keep the loop alive indefinitely.
- Useful reconciliation evidence includes:
  - large god modules already split or reduced substantially
  - root lint/harness signals reduced to final-closeout issues
  - debt metadata that is stale relative to current file sizes
  - obsolete-code checks already passing on the refactored path

## Convergence Contract

- The loop must converge toward a finish line, not preserve historical backlog wording.
- Once verification isolates the remaining blocker set, rewrite the active runtime task around that blocker before the next loop iteration.
- Closeout tasks should name:
  - the exact failing gate or blocker family
  - the bounded work needed to clear it
  - the verification commands that prove it is cleared
- Do not keep vague tasks like "continue refactor", "pay down debt", or "cleanup remaining issues" open once the remaining blocker is narrower.
- If the same `next_task_id` persists for two iterations without shrinking the blocker set, either:
  1. narrow it to the exact blocker, or
  2. split it into at most 1-3 bounded tasks
- Prefer a single final-closeout task when only one blocker family remains.
- Keep optional future improvements, polish, and non-blocking cleanup out of active runtime tasks once the project is in finish-line mode.

## Finish-Line Mode

- Enter finish-line mode when most gates are already green and only a small number of blockers remain.
- In finish-line mode:
  - keep `TASKS.json` focused on blocker-clearing work only
  - use the narrowest failing gate as the primary driver of work
  - avoid reopening broad architecture or debt tasks unless new evidence proves they are still blocking done-state
  - rerun the smallest proving command first, then widen back out to `verify` and `run_gates`

## Clear Contract

`--clear` is two-phase:

1. `--clear` returns `confirm_token`
2. `--clear --confirm <token>` performs deletion

Never delete runner files manually.

## Done Contract

Create/keep `RUNNER_DONE.lock` only when both are true:

1. `run_gates` passes
2. `TASKS.json` has zero tasks in `open|in_progress|blocked`

If either condition fails, done lock must not exist. Reconcile stale `open` tasks before concluding the loop still has substantive work remaining.

## Prompt Modes

- `/prompts:run_setup`: clear-then-setup on initial runs; setup-only when approving enablement
- `/prompts:run_clear`: clear only
- `/prompts:run_execute`: one task step, validate, setup refresh, prepared marker, exit

## Examples

```bash
python3 /Users/jian/Dev/tmux-codex/bin/runctl --setup --project-root "$PWD" --runner-id main
python3 /Users/jian/Dev/tmux-codex/bin/runctl --setup --project-root "$PWD" --runner-id main --approve-enable <TOKEN>
python3 /Users/jian/Dev/tmux-codex/bin/runctl --clear --project-root "$PWD" --runner-id main
python3 /Users/jian/Dev/tmux-codex/bin/runctl --clear --project-root "$PWD" --runner-id main --confirm <TOKEN>
```
