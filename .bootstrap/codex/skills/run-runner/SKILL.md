---
name: run-runner
description: Coordinate Codex runner prompts and `cl` loop runners with a strict task-id control plane under single-runner policy (`main`).
---

# Run Runner

Run deterministic runner state operations via `/prompts:run_setup`, `/prompts:run_clear`, and coordinate `cl` loop execution.

## Workflow

0. Fast-exit override (highest priority):
   - If the user explicitly asks to terminate/end this Codex chat session so the wrapper can respawn, do **not** run setup/cleanup steps.
   - Do **not** run `/prompts:run_setup` first.
   - End immediately so watchdog/wrapper can rotate to a fresh session.
   - Keep output to a minimal final line only.

1. Resolve setup scope before running setup:
   - If user wants to continue the current worktree conversation, prefer `PROJECT_ROOT=<abs-current-cwd>`.
   - Otherwise scope by project name (`PROJECT=<project>`).
2. Set up state for the target project and runner:
   - Preferred: `/prompts:run_setup PROJECT_ROOT=<abs-path> RUNNER_ID=main`
   - Alternate: `/prompts:run_setup PROJECT=<project> RUNNER_ID=main`
   - On normal setup runs, `run_setup` performs `run_clear` first and then recreates state.
   - If runner PRD/tasks are missing, generic, or stale, `run_setup` should seed fresh concrete `PRD.json` and `TASKS.json` from the latest explicit user request before invoking setup.
   - Seed `TT-001` as the narrowest first executable slice, not as a broad umbrella task.
3. If setup returns an enable token, approve it:
   - `/prompts:run_setup PROJECT_ROOT=<abs-path> RUNNER_ID=main --approve-enable <token>`
   - Or: `/prompts:run_setup PROJECT=<project> RUNNER_ID=main --approve-enable <token>`
4. Verify setup wrote `.memory/runner/RUNNER_STATE.json` and contains non-empty `next_task_id` + `next_task`.
5. Reconcile stale open tasks before continuing a loop:
   - If open refactor/debt/cleanup tasks are already satisfied by landed code, update runner metadata before executing another step.
   - Update `.memory/runner/TASKS.json` first, then keep `.memory/runner/PRD.json`, `.memory/runner/RUNNER_STATE.json`, and `.memory/runner/RUNNER_EXEC_CONTEXT.json` aligned.
   - Prefer marking satisfied tasks `done` and collapsing the backlog to one explicit final-closeout task rather than keeping broad historical refactor tasks open.
   - Use concrete repo evidence before changing status: current file sizes, green lint/harness signals, stale debt metadata, or obvious module splits already merged.
6. Keep setup lightweight and deterministic:
   - do not run repo-wide cleanup/refactor scans during routine setup,
   - only perform obsolete-file cleanup when the user explicitly asks for cleanup/deprecation work,
   - preserve future-feature scaffolding that is planned for later implementation.
7. Force convergence when the loop reaches closeout:
   - If one failing gate or one blocker class dominates (for example only typecheck failures, only fixture drift, only one e2e failure family), rewrite the remaining open task so it names that blocker directly.
   - Do not keep vague tasks like "continue refactor" or "pay down debt" open once verification has identified the concrete remaining blocker.
   - If the same `next_task_id` survives two iterations without reducing the blocker set, narrow it to the exact failing surface or split it into at most 1-3 bounded tasks.
   - Keep optional future cleanup out of active runtime tasks once the project is in finish-line mode; leave only blocker-clearing and done-state verification work in `TASKS.json`.
8. Never mark completion while `.memory/runner/TASKS.json` has open work:
   - do not create/keep `.memory/RUNNER_DONE.lock` unless `run_gates` passes and TASKS has zero `open|in_progress|blocked`.
9. Stop after setup unless the user explicitly asks to start/continue a runner.
10. Start or continue the infinite runner only on explicit request:
   - `cl loop <project>`
   - `cl` then `r=runner`
   - loop iterations must run through `/prompts:run_execute`
11. Single-runner policy: one runner per project (canonical runner id `main`).
12. For teardown, use two-phase clear:
   - `/prompts:run_clear PROJECT=<project> RUNNER_ID=main`
   - `/prompts:run_clear PROJECT=<project> RUNNER_ID=main --confirm <token>`

## Guardrails

- Termination requests are not setup requests: never expand them into `/prompts:run_setup` or repo analysis.
- Keep prompt roles split:
  - `/prompts:run_setup` => clear-then-setup on initial runs, setup-only on `--approve-enable`
  - `/prompts:run_clear` => clear only
  - `/prompts:run_execute` => execute one step, validate, refresh state, write prepared marker, exit
- Never fabricate approval tokens; always use the token returned by `runctl`.
- Never delete runner files directly; use `/prompts:run_clear` only.
- Do not create alternate runner IDs for the same project; keep `main`.
- Keep setup scoping explicit. Prefer `PROJECT_ROOT=<abs-path>` for current worktree conversation continuity.
- Treat `/prompts:run_setup` as reset + file/state refresh; do not auto-launch loops.
- Never let `cl loop` spin on stale `open` tasks whose acceptance is already satisfied by landed code; reconcile runner metadata first.
- Never let finish-line work remain described as broad refactor debt once verification has isolated a smaller blocker.
- If closeout is blocked by a single failing gate, optimize the loop around clearing that gate before rerunning wider verification.
- Expect loop updates through deterministic payload markers: `RUNNER_UPDATE_START`/`RUNNER_UPDATE_END` with required JSON fields.
- Verify setup produced `.memory/runner/RUNNER_STATE.json` and that it has a non-empty actionable `next_task` from `TASKS.json`.
- During setup, avoid broad repo scans; focus on runner-state alignment only.
- Do not delete files that are part of planned future features (for example deferred DB paths) unless the user explicitly marks them obsolete.
- If prompt execution is unavailable, use the equivalent `python3 /Users/jian/Dev/tmux-codex/bin/runctl ...` command.

## Reference

- Load [references/run.md](references/run.md) for full state-file contract, lock behavior, and command examples.
