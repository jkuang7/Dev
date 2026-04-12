---
name: kanban
description: Read and work GitHub Issues from the shared GitHub Project kanban board. Use when the user wants Codex to pick the next project-linked issue, read the full issue thread, synthesize a stronger execution plan, then start working while leaving concise human ticket updates at important moments. Prefer the current repo when it is clear, but support multi-repo workspaces and treat "issue created and added to the project" as sufficient for discovery. Use the bundled helper script for project item lookup and status changes.
---

# Kanban

Use this skill for the GitHub Project based kanban workflow.

## Defaults

- Owner: `jkuang7`
- Project: `Solo Engineering`
- Project number: `5`
- Status flow: `Inbox` -> `Ready` -> `In Progress` -> `Review` -> `Done`

Override these only when the user explicitly says to.

## Workflow

1. Ground in the current repo:
   - Read the local `AGENTS.md` and the repo remote.
   - Derive the current GitHub repo from `origin`.
   - If the current directory is a workspace root that also contains child repos such as `Repos/*/.git`, treat it as a multi-repo workspace instead of assuming the root repo is the only candidate.
2. Before starting anything new, check for an active issue:
   - Prefer an item in `In Progress` for the current repo if one already exists.
   - In a multi-repo workspace, if the current repo has no active item, check project items for the local repos under `Repos/` before concluding there is no active work.
   - Do not start a second issue unless the current one is in `Review`, `Done`, or explicitly blocked.
3. If there is no active issue, pick the next task:
   - Use `scripts/github_project_issue_flow.py next --repo <owner/name>`.
   - If you are at a workspace root, also pass `--repos-root <path-to-Repos>` so the helper can fall back to local child repos.
   - Treat "issue exists and is linked to the GitHub project" as enough to surface it. Do not require a matching custom `Project` field or a pre-set `Ready` status.
   - Prefer `Status=Ready`, then `Inbox`, then unset status. Use `Priority` (`P0`, `P1`, `P2`) and issue number as tie-breakers.
   - Treat a matching custom `Project` field as a preference only when it is present; never make it a hard requirement for discovery.
   - If no candidate exists for the current repo or local workspace, report that clearly instead of guessing outside the project.
4. Read the full issue thread before acting:
   - Always inspect the issue body and the latest comments before starting work, replying, or moving status.
   - Treat issue comments as the source of truth for the latest direction, clarifications, screenshots, and review feedback.
   - If comments conflict with the original issue body, follow the newest explicit instruction and mention the change in your status comment.
5. Convert the ticket into an execution plan before starting implementation:
   - After reading the issue and comments, restate the actual problem in concrete terms.
   - Produce an enhanced plan that is more specific than the ticket text: likely root cause or work areas, the intended code slices, validation steps, and any meaningful risk or dependency.
   - Keep the plan in working context or user-facing handoff as appropriate; do not dump a long checklist into the issue thread unless the user explicitly wants that.
   - Do not move the ticket to `In Progress` until this plan exists and you are ready to execute it.
6. Communicate on the ticket like a teammate, not a status bot:
   - Keep comments human, concise, and useful when someone reads the thread later.
   - Do not leave frequent progress comments by default.
   - Default cadence:
     - Start work: one short ownership comment when moving to `In Progress`.
     - Handoff: one completion comment when moving to `Review` or `Done`.
     - Exception-only comments: blocked, major scope change, or correction after review feedback.
   - The comment should focus on what changed, what was verified, and any important risk or follow-up.
7. Use short human-style comments for status changes:
   - Start:
     - `Picking this up now. Plan is <one line>. I will update this thread when it is ready for review or if I hit a blocker.`
   - Review:
     - `Ready for review. I changed <one line>. Verified <one line>. Important note: <risk/follow-up or none>.`
   - Done:
     - `Done. I changed <one line>. Verified <one line>. Important note: <risk/follow-up or none>.`
   - Wrong direction / backtrack:
     - `Adjusting course based on feedback. I am moving this back to In Progress. Next I am going to <one line>.`
   - Blocked:
     - `Blocked on <one line>. I need <one line> before I can continue.`
8. Move status only after the matching comment is posted:
   - Start work: comment, then move to `In Progress`.
   - Handoff: comment, then move to `Review`.
   - Done: comment, then move to `Done`.
   - Wrong direction: comment, then move from `Review` back to `In Progress`.
9. Treat screenshots and attached images in the issue body or comments as task context.
10. Keep comments short and structured. Do not narrate every command or paste a changelog into the thread.
11. When design or frontend review needs a live local preview:
   - Prefer reusing an already-running local app or preview server before starting a new one.
   - If you need to serve a standalone artifact such as `index.html`, start a simple local server bound to `0.0.0.0`, not `127.0.0.1`, so other devices can reach it.
   - If Tailscale is available, prefer the machine's Tailscale DNS name over the raw `100.x.x.x` IP when handing the review link to the user.
   - Keep the preview URL stable across iterations when possible and tell the user they can refresh the same URL after changes land.
12. For frontend or design tasks, default to a phone-reviewable handoff:
   - When the feature is ready for user review, make a reasonable effort to expose a live preview URL the user can open from their phone.
   - Prefer a Tailscale URL when available, because it avoids localhost-only dead ends and is easier to share than a raw IP.
   - Include the live preview URL in the user handoff, alongside any normal review status update, unless there is no safe or practical way to run the feature locally.
   - If the preview is a temporary standalone artifact, say that clearly so the user understands it is not yet integrated into the app.

## Tools

- Use `scripts/github_project_issue_flow.py` for project item lookup and status changes.
- Use the GitHub MCP tools or `gh issue comment` for issue reads and comments.
- Use `gh issue view --comments` or the GitHub MCP tools to inspect the issue body, comments, and attached images.
- Use local preview servers plus Tailscale DNS when the user wants to review local work from another device.

## Common Calls

Find the next task for the current repo:

```bash
python3 ~/.codex/skills/kanban/scripts/github_project_issue_flow.py next --repo jkuang7/Banksy
```

Find the next task from a workspace root with child repos:

```bash
python3 ~/.codex/skills/kanban/scripts/github_project_issue_flow.py next --repo jkuang7/Blog --repos-root /Users/jian/Dev/Repos
```

Read the full issue thread before acting:

```bash
gh issue view 123 --repo jkuang7/Banksy --comments
```

Find the project item for a specific issue:

```bash
python3 ~/.codex/skills/kanban/scripts/github_project_issue_flow.py issue-item --issue-url https://github.com/jkuang7/Banksy/issues/123
```

Move an issue after commenting:

```bash
python3 ~/.codex/skills/kanban/scripts/github_project_issue_flow.py set-status --issue-url https://github.com/jkuang7/Banksy/issues/123 --status "In Progress"
```

List active work:

```bash
python3 ~/.codex/skills/kanban/scripts/github_project_issue_flow.py list --status "In Progress"
```
