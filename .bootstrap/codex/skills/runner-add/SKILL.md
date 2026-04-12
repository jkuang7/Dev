---
name: runner-add
description: Queue extra work for an active or runner-managed project without interrupting the current cycle. Use when the user wants a slash-skill version of `/add`, asks to add or queue follow-up runner work, or wants to extend the current repo's runner backlog from the current conversation context.
---

# Runner Add

Use this skill to queue runner backlog from the current conversation scope.

## Workflow

1. Load [references/add.md](references/add.md) and follow it as the source-of-truth procedure.
2. Resolve the target repo/root from the current conversation before falling back to broader runner discovery.
3. Queue the task through `runctl --task add` without interrupting the active cycle unless the human explicitly asks to preempt.

## Guardrails

- Do not duplicate or paraphrase the queueing contract when the reference already covers it.
- Do not run runner setup from this skill.
- Keep the output short and operational.
