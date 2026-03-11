---
description: Generate per-trajectory annotated reports for one AI, anchored to the golden solution PR
argument-hint: <ai-name> <traj-file> <golden-pr-url> [existing-pr-url] [output-md-or-dir] [reference-docx]
allowed-tools: [Read, Grep, Bash]
model: opus
---

Resource Hint: opus

# /traj - Annotated Trajectories (Single AI)

Purpose: generate an evidence-backed markdown report that matches
the style of `annotated-trajectory-helix-00021.md`.

This command is single-AI, single-traj per run, and writes one output
file per trajectory exploration by default.

## Inputs

- `$1`: AI name (required)
- `$2`: absolute path to `.traj` file (required)
- `$3`: golden solution PR URL (required)
- `$4`: existing solution PR URL (optional, recommended)
- `$5`: output markdown path or output directory (optional)
- `$6`: reference `.docx` style template for export (optional)

If `$5` is missing, write to:

`./annotated-trajectory-<repo>-<ai>-<traj>.md`

Naming convention:

- Prefer repo-based naming with per-run uniqueness.
- Example: `annotated-trajectory-helix-00021-gemini-3-pro-run1.md`
- Include AI slug and trajectory slug to avoid overwriting prior runs.
- If repo token cannot be derived safely, fallback to:
  `./annotated-trajectory-<repo>-<pr-number>-<ai>-<traj>.md`

Path handling for `$5`:

- If `$5` ends with `.md`, treat it as explicit file path.
- Otherwise treat `$5` as output directory and create
  `annotated-trajectory-<repo>-<ai>-<traj>.md` inside it.

Path handling for `$6`:

- If provided, `$6` must be a readable `.docx` file.
- Use it as `pandoc --reference-doc` when generating `.docx` outputs.

## Validation

1. Confirm `$2` exists and is readable.
2. Parse `$3` as:
   `https://github.com/<owner>/<repo>/pull/<num>`
3. If `$4` exists, parse it with the same PR URL pattern.
4. If invalid input, stop with a concise error.

## Ground Truth Collection (authoritative)

For golden PR (`$3`), run:

- `gh pr view <num> --repo <owner>/<repo> --json title,body,state,author,baseRefName,headRefName,createdAt,updatedAt,commits,files`
- `gh pr diff <num> --repo <owner>/<repo>`
- `gh pr view <num> --repo <owner>/<repo> --comments`

If existing PR (`$4`) is provided, run the same three commands for it.

Rules:

- Golden PR diff is the evaluation source of truth for trajectory scoring.
- Never claim a fix mechanism that does not appear in the referenced PR diff.
- If evidence is missing, write `UNKNOWN`.

## Phase Workflow (required)

Run in ordered phases.

### Phase 1: Understand PRs and their delta (HIL loop)

Goal: user fully understands both PRs and the existing-vs-golden delta
before any trajectory comparison.

Flow:

1. Summarize golden PR:
   - problem being solved
   - exact code-level fix mechanism
   - tests added/changed
2. If existing PR is provided, summarize existing PR with same structure.
3. Produce `Existing vs Golden` delta:
   - mechanism delta (exact conditional/fix logic)
   - test coverage delta
   - behavioral scope delta (same target, narrower, broader, UNKNOWN)
4. Enter back-and-forth with user until satisfied.

Gate rule:

- User must explicitly confirm with: `pr-understood`.
- Until `pr-understood`, trajectory analysis is blocked.

Capture rule:

- Use this conversation as source material for final markdown.
- Reuse user insights in:
  - `## Problem Statement`
  - `## What the Golden Patch Did Right (code)`
  - `## Existing vs Golden Delta` (if `$4` present)

### Phase 2: Trajectory comparison (against golden)

Goal: compare trajectory outcome to the golden solution PR.

Important:

- Trajectory comparison is against golden PR (`$3`) only.
- Existing PR (`$4`) is for context and delta understanding, not scoring.

Compute explicit deltas between:

1. Golden PR diff (`gh pr diff` for `$3`)
2. Trajectory final submission artifact (`submit` output / final payload)

Do not treat intermediate trajectory edits as final outcome.

For each major file or behavior:

- Presence delta: in golden PR yes/no vs in traj final yes/no
- Mechanism delta: exact match / partial match / mismatch
- Test delta: golden expected coverage vs traj final coverage

If final submission omits production code but intermediate edits existed,
classify as delivery/convergence failure.

### Phase 3: Synthesis and refinement (HIL loop)

1. Draft full report in one pass.
2. Present full draft for user review.
3. Run section nitpick loop until satisfied.
4. Finalize and write file.

Section nitpick order (default):

1. `Problem Statement`
2. `What the Golden Patch Did Right (code)`
3. `Existing vs Golden Delta` (if present)
4. `$1 Analysis` (including `### Root Cause` inside the model section)

Section approval rule:

- Each section must be explicitly approved before finalization.
- `finalize` is valid only after all sections are approved.

Hard rules:

- Never start next trajectory before current report is finalized.
- Command processes one AI and one trajectory at a time.
- Default output mode is file-per-traj. Do not overwrite prior trajectory
  reports unless user explicitly provides the same output file path.
- Old phase requirements remain in force for every run:
  - PR understanding gate (`pr-understood`) first
  - one traj at a time
  - full draft first, then surgical section edits

## Trajectory Scope

Analyze only the AI specified in `$1`.

- If traj includes multiple models, filter findings to `$1`.
- Do not create sections for other models.
- If model identity is uncertain, continue and mark uncertain claims
  as `UNKNOWN`.

Default report strategy:

- Create a standalone markdown file per trajectory exploration.
- Include one model analysis section per file (`## <AI Name> Analysis`).
- Do not merge multiple AIs into one file unless the user explicitly asks
  for a combined report.

## HIL Controls

Control keywords:

- `approve`: lock current section
- `revise: <edits>`: apply edits to current section
- `nitpick <section>: <edits>`: targeted edits to a named section
- `back <section>`: reopen a prior section
- `finalize`: write file only when all sections approved

Phase keywords:

- `pr-understood`: unlock transition from Phase 1 to Phase 2
- `next-traj`: start next trajectory after current report finalizes

Primary objective:

- Fill all sections quickly in an initial full draft.
- Let user quickly identify gaps and add insights.
- Refine surgically until the report matches user understanding.
- Remove stale wording during refinement; final text must not contain
  contradictory old/new root-cause claims.

## Required Output Structure

Write markdown using this structure:

`# Annotated Trajectories (<Task-or-Repo-ID>)`

`Existing solution PR: <url>` (include when `$4` is provided)

`Golden PR: <url>`

`## Problem Statement`

`## What the Golden Patch Did Right (code)`

`## Existing vs Golden Delta` (include only when `$4` is provided)

`pass@ run #<n> for <AI Name> Analysis` (optional line)

`## <AI Name> Analysis`

`### Error 1: <short title>`

`Snippet:`

```text
<quoted snippet>
```

`What went wrong:`

`### Error 2: <short title>`

`Snippet:`

```text
<quoted snippet>
```

`What went wrong:`

`### Error 3: <short title>`

`Snippet:`

```text
<quoted snippet>
```

`What went wrong:`

`### Root Cause`

Model-section ordering rule:

- In standalone file mode, include exactly one model section.
- In combined mode (only if requested), keep user-established order.

Notes:

- Use 2+ errors when evidence supports it.
- Use 3 as default target when evidence is sufficient.
- Keep style concise, technical, postmortem-focused.

Top-of-file context rule:

- Always include `Golden PR: <url>` directly under the title.
- If `$4` is provided, include `Existing solution PR: <url>` above
  the golden line.
- These links must appear before `## Problem Statement`.

## Content Guidance

Style target:

- Use Hemingway-style engineering prose: short sentences, direct verbs,
  concrete nouns.
- Prefer operational terms over abstract terms.
- Example: "The run failed in delivery, not diagnosis."
- Avoid vague phrasing like "convergence failure in the last mile"
  unless immediately defined in concrete artifact terms.

Code block rule:

- Use fenced code blocks for all multi-line examples/snippets.
- Use `ts` for behavior examples and `diff` for patch excerpts.
- Do not inline multi-line snippets as plain text.
- If a section contains code-like helper lists or API calls, wrap them in
  a fenced `text` block instead of plain bullets.
- Keep a blank line before and after every fenced block to preserve docx
  parsing quality.

Comparative wording rule:

- Distinguish "required to solve core bug" vs "present in golden artifact".
- If a behavior/file is only required for golden parity, say:
  "gap vs golden artifact" instead of "required for correctness".
- Keep claims scoped: core correctness, golden parity, or both.

### Problem Statement

- State behavior-level bug clearly.
- Include one concrete expected example.

### What the Golden Patch Did Right (code)

- Explain exact mechanism from golden PR diff.
- Mention key changed file paths.
- Include minimal diff snippet(s) when useful.
- This section must always describe the golden PR (`$3`), not the
  existing solution.

### Existing vs Golden Delta (optional)

- Compare mechanism/test-scope differences only.
- Do not call one wrong unless behavior/tests prove failure.
- If not provable from evidence, mark `UNKNOWN`.

### <AI Name> Analysis

- Focus on `$1` trajectory failures.
- Use evidence snippets.
- Mention partial wins briefly before Error 1 when relevant.
- Evaluate alignment against golden PR outcome.
- State outcomes in artifact terms (what files were or were not submitted).
- Explicitly report test evidence for that model:
  - tests attempted
  - tests that actually ran
  - test evidence present in final submission artifact
- If tooling failed, anchor it to the trajectory runtime explicitly
  (e.g., "In the <AI> traj environment...").

### Root Cause (inside each model section)

- Synthesize why run did or did not converge to golden-equivalent output.
- Connect process failures to final delivery gaps.
- Use causal chain order:
  1. signal observed
  2. expected pivot
  3. actual deviation
  4. termination outcome
- Prefer concrete wording like:
  - "Model validated the bug via repro, then returned to setup checks."
  - "Loop ended in autosubmit; final artifact was not the fix patch."
- End with one plain-language verdict line, e.g.:
  - "Correct mechanism, wrong artifact."
  - "Delivery failed; diagnosis was partial/strong."

Root-cause evidence checklist:

- If claiming a successful repro, cite the actual result observation.
- If claiming drift/reset, cite repeated loop evidence after that result.
- If claiming context exhaustion, cite `Exit due to context window` and
  `Exited (autosubmitted)`.
- If claiming delivery failure, cite `info.submission` final diff payload.

## Truth and Quality Rules

- Every major claim must trace to PR or traj evidence.
- No invented implementation details.
- If prior notes conflict with PR diff, PR diff wins.
- Tone remains analytical, not accusatory.
- Compare against trajectory final submission artifact, not intermediate edits.
- Avoid over-claiming benchmark requirements; separate core bug fix from
  benchmark-specific test scaffolding.

## Output Variants

- Default: standalone markdown file per AI/trajectory.
- If user asks for separate deliverables, generate one file per LLM.
- If user asks for `.docx`, convert each markdown file with `pandoc` and
  keep filename parity (`.md` -> `.docx`).

Per-LLM deliverable rule:

- For multi-model requests (Gemini + OpenCode, etc.), produce separate
  files per model by default:
  - `annotated-trajectory-<repo>-gemini.md`
  - `annotated-trajectory-<repo>-opencode.md`
  - matching `.docx` files when requested.
- Do not merge model sections unless the user explicitly requests a
  combined report.

Docx export quality rules:

- Prefer: `pandoc --from=markdown+fenced_code_blocks --to=docx`.
- Use `--reference-doc "$6"` when a template is provided.
- If no template is provided, use default pandoc docx export.
- Preserve fenced code blocks in markdown before export.
- For expected behavior and patch snippets, ensure fenced blocks are
  present (`ts`, `diff`, or `text`) before conversion.

Google Docs compatibility rules:

- Use `--from=markdown-auto_identifiers+fenced_code_blocks` to avoid
  heading bookmarks that can surface as unwanted icons in Google Docs.
- Prefer `--syntax-highlighting=none` for stable import rendering.
- Use a clean reference template with an explicit `SourceCode` paragraph
  style (monospace + light gray background) for block readability.
- Avoid reference templates copied from Smart Canvas code-block documents
  that contain private-use glyph markers (e.g., ``, ``).
- After export, sanity-check that code samples remain block-formatted
  (not collapsed into inline paragraphs) before handing off.

## Final Console Output

After writing the file, print:

1. Output path
2. Four bullets:
   - target problem
   - best model action
   - primary failure
   - top prevention recommendation
