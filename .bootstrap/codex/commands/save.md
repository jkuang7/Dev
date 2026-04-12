---
model: opus
---

Resource Hint: opus

# `/save` - Artifact Pipeline Checkpoint

## Purpose

Capture progress from conversation + artifacts + lessons, then reverse engineer the workflow into a reusable slash command that improves over time.

Use this as a "save game" command for command design.

---

## Usage

```bash
/save <command_path> <artifacts_folder_path>
/save --new <artifacts_folder_path>
/save --new <artifacts_folder_path> <command_path>
```

## Mode Semantics

- Update mode (default form):
  - `/save <command_path> <artifacts_folder_path>`
  - Treat `command_path` as existing command to patch.
- New mode:
  - `/save --new <artifacts_folder_path> [command_path]`
  - Create a new command from observed workflow.
  - If `command_path` is omitted, default to:
    - `~/.codex/commands/<artifacts_folder_name>.md`

---

## Input Validation (required)

1. Resolve paths relative to repo root.
2. `artifacts_folder_path` must exist and be a directory.
3. Update mode:
   - `command_path` must exist and be a file.
4. New mode:
   - target `command_path` must not already exist.
5. On validation failure:
   - stop immediately with a concrete error and exact fix.

Do not continue with partial validation.

---

## Mental Model

Treat work as progressive assembly, not up-front completion.

- `Artifact`: container (file or conceptual doc)
- `Section`: smallest meaningful unit of intent
- `Dependency`: edge that can block completion
- `Move`: one meaningful change observed in user behavior

### Section States

- `draft`: started, low confidence
- `blocked`: cannot complete yet (missing dependency)
- `inferred`: provisional fill from evidence
- `validated`: confirmed by user behavior or explicit instruction
- `frozen`: stable exemplar, avoid churn

### Dependency Types

- `HIL`: requires explicit human-in-the-loop confirmation
- `ARTIFACT:<artifact>#<section>`: cross-artifact dependency
- `DISCOVERY:<id>`: waiting on unknown to be uncovered later
- `EXTERNAL:<id>`: depends on external source/tool/result

If uncertain, keep section `blocked` and record exact blocker.

---

## Persistent State

Store state outside command files:

- `~/.codex/state/save/<pipeline_id>/state.json`
- `~/.codex/state/save/<pipeline_id>/moves.ndjson`
- `~/.codex/state/save/<pipeline_id>/graph.json`
- `~/.codex/state/save/<pipeline_id>/open_loops.json`
- `~/.codex/state/save/<pipeline_id>/lessons.md`

### `pipeline_id` rule

- Update mode: derive from `command_path` stem + artifacts folder name.
- New mode: derive from target command stem + artifacts folder name.
- Keep deterministic and stable across runs.

---

## Execution Phases

Run in order.

### Phase 1 - Observe

Collect evidence from:

1. Current conversation since last `/save` checkpoint (if available)
2. Artifact files in `artifacts_folder_path`
3. Existing lessons/pattern notes tied to this pipeline

Extract only observable facts. Do not infer yet.

### Phase 2 - Extract Moves

Derive discrete user/system moves:

- what changed
- why it changed (if evidenced)
- which artifact/section it touched
- whether it introduced/resolved a dependency

Append moves to `moves.ndjson`.

### Phase 3 - Build Graph

Update dependency graph at section level:

- create/update artifacts and sections
- attach dependencies
- update section state and confidence
- create or close open loops

Never force completion when dependency is unresolved.

### Phase 4 - Infer Workflow

Infer phases from observed moves (post-hoc):

- cluster recurring move patterns
- map prerequisite chains
- identify high-friction transitions
- identify stable success paths

This is reverse engineering from evidence, not speculative planning.

### Phase 5 - Synthesize Command Delta

If update mode:

- patch existing command minimally
- preserve existing style/voice unless it blocks correctness

If new mode:

- generate initial command with:
  - purpose
  - inputs
  - validation
  - phased workflow
  - dependency handling
  - checkpoint outputs

Every edit must map back to observed evidence.

### Phase 6 - Persist + Report

Write updated state files, then output:

1. mode used (`new` or `update`)
2. command path written
3. artifacts scanned
4. moves added
5. new/updated dependencies
6. blockers resolved
7. blockers still open
8. command changes applied
9. top next actions (max 3)

---

## Hard Rules

- Do not hallucinate missing artifacts or sections.
- Incomplete is acceptable; hidden uncertainty is not.
- Prefer explicit blockers over guessed content.
- Late-fill dependencies are first-class; keep links explicit.
- If evidence conflicts, newest explicit user intent wins.
- Keep command changes traceable to observed moves.
- Do not edit files outside:
  - target `command_path`
  - `~/.codex/state/save/<pipeline_id>/`

---

## Output Contract (every run)

Return concise checkpoint output with:

- `Mode`: new/update
- `Target`: command file path
- `Delta`: what changed since last run
- `Graph`: new nodes/edges and state transitions
- `Open Loops`: unresolved sections and blockers
- `Patch`: command sections added/updated/removed
- `Next`: 1-3 highest-impact actions

If no meaningful changes are detected, say so explicitly and do not churn the command file.

---

## Examples

```bash
# Update existing command
/save ~/.codex/commands/optimize.md Repos/myproj/.memory/artifacts

# Create new command at default path
/save --new Repos/myproj/.memory/artifacts

# Create new command at explicit path
/save --new Repos/myproj/.memory/artifacts ~/.codex/commands/artifact_pipeline.md
```
