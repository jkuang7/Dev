---
model: opus
---

Resource Hint: opus

# /helix — Golden Solution PR Workflow

**Usage:**

* `/helix <PR_URL>` — Start new task (clone, setup, begin)
* `/helix <path>` — Resume from project directory (reads 01-STATE.md)
* `/helix` — Resume if already in a helix-work repo

**Example:** `/helix https://github.com/handshake-project-helix/helix-00016/pull/1`

**All repos:** https://github.com/handshake-project-helix

---

## Why This Workflow Exists

Handshake builds a benchmark that measures AI coding ability. A human takes a real open-source PR, understands it independently, writes a clean solution + tests + a prompt describing the task. Handshake feeds that prompt + tests to their AI models and measures: **can the AI produce working code that passes the human's tests?**

**The human's independent reasoning is the product.** If AI leaks into the human's understanding — even subtly — the benchmark measures AI against AI. Contaminated. The $100/hr human premium is only justified when the reasoning is authentically human-derived. The code is a byproduct. Your thinking is what Handshake can't generate synthetically.

**What they're NOT building:** a product, a feature, faster code. They're building an  **evaluation pipeline** . The output is benchmark data.

**What Lovable is:** Just the task management UI. Browse tasks, claim them. Actual work happens on GitHub, evaluation inside Handshake's pipeline.

### Core Principle: Process vs Deliverable

* **PROCESS** (exploring, debugging, iterating) → AI can help you work faster
* **DELIVERABLE** (03-DRAFT.md, 04-FINAL.md, the prompt) → Every word must be authentically yours

---

## The Task-Tests Model (Canonical Reference)

### What the pipeline does

1. Give the AI the codebase at `main` + a prompt + the F2P tests (some fail on main, proving feature needed)
2. AI makes changes
3. **F2P passes?** → AI implemented the feature ✅
4. **P2P still passes?** → AI didn't break anything ✅

F2P is the **scorecard**. P2P is the **guardrail**.

**Both P2P and F2P are training data** — the model learns what "good tests" look like. Polish them: clear names, logical groupings, efficient coverage.

### Test Scopes

| Scope                | Location                  | Source                                              | Purpose              |
| -------------------- | ------------------------- | --------------------------------------------------- | -------------------- |
| **Full Suite** | `src/__tests__/` (or repo's test dir) | PR's final state, untouched               | General verification |
| **P2P**        | `tests/pass-to-pass/`     | Regression tests from main (polished)               | Regression guardrail |
| **F2P**        | `tests/fail-to-pass/`     | Tests the PR added (polished)                       | Feature scorecard    |

### The Core Model

**P2P = 2-5 regression tests from main relevant to the problem/implementation `[sol]` addresses.**
Tests that:
- Existed on main before the PR touched anything
- Are relevant to the bug fix, feature, or implementation at hand
- Pass on main → still pass on solution (guards against breaking changes)
- If main has NO relevant tests → human writes regression tests during Phase 1 Refine

NOT all tests. Your job is to curate tests relevant to `[sol]`.

**F2P = Tests the PR added.** Includes both "accept" tests (FAIL→PASS) and "reject" tests (PASS→PASS).
- **F2P folder:** Standalone extracted tests in `tests/fail-to-pass/`
- **F2P commit:** F2P folder + author's original test file changes (isolated from sol commit)

**The bucketing rule (origin-based, not pass/fail):**
- If it **existed on main** → P2P candidate (curate and refactor)
- If the **PR added it** → F2P (regardless of whether it passes on main)
- Never create P2P tests that didn't exist on main
- If the PR author added something irrelevant → ignore

P2P + F2P together: P2P proves "I didn't break anything." F2P proves "I implemented the new feature."

### F2P verification against main

| Test Type      | What it checks              | On Main | On Solution |
| -------------- | --------------------------- | ------- | ----------- |
| "Accept" tests | New behavior works          | FAIL    | PASS        |
| "Reject" tests | Existing behavior unchanged | PASS    | PASS        |

Both are valid F2P if they're NEW assertions from the PR diff. Mix of FAIL and PASS on main = normal. All PASS on main = problem (nothing tests new behavior).

### Task-tests are constructed LATE

Built in **Phase 3 (Finalize)**, not during Setup. Human may add/change tests during Refine. The final state after Refine is what matters. `git diff main...HEAD` is the source of truth. See Phase 3 Step 2 for construction details.

### Commit Structure

The PR must have exactly **3 commits** (plus optional dep commit):

| Order | Prefix | Contains | NOT in this commit |
|-------|--------|----------|-------------------|
| 0 (optional) | `[dep]` | Dependency/environment changes | Feature code, tests |
| 1 | `[sol]` | Golden solution code | Any tests |
| 2 | `[p2p]` | `tests/pass-to-pass/` (2-5 relevant tests) | Feature code |
| 3 | `[f2p]` | `tests/fail-to-pass/` | Feature code |

**Example messages:**
- `[dep] Add pytest-asyncio for async test support`
- `[dep] Add .helix to .gitignore`
- `[sol] Fix date parsing for ISO 8601 formats`
- `[p2p] Add regression tests for date parsing`
- `[f2p] Add tests for new ISO 8601 format support`

**What goes in [dep]:**
- Dependency changes (package.json, requirements.txt, etc.)
- Environment setup (.gitignore for `.helix/`, config files)
- NOT feature code, NOT tests

**Pre-commit hook contamination:**
Some repos have hooks that auto-generate files (e.g., deno mirrors, build outputs). These can contaminate commits.

**The rule:** `[sol]` must have ZERO test files. PR test changes (including auto-generated mirrors) belong in `[f2p]`.

**Common mirrors to watch for:**
- `deno/lib/__tests__/` (mirrors `src/__tests__/`)
- Any `__tests__` or `test` directory that's auto-synced

**How to prevent contamination:**
1. Use `git commit --no-verify` for ALL commits to skip hooks
2. Manually stage only the files that belong in each commit
3. After committing, verify with `git show --stat <hash>` — no test files in `[sol]`

**If you see test files in `[sol]` after committing:**
→ Reset and redo with `--no-verify`

---

## The Three-Zone Model

### Zone 1: UNRESTRICTED (Process Scaffolding)

| AI Can Do            | Examples                                      |
| -------------------- | --------------------------------------------- |
| Run commands         | git, tests, builds                            |
| Mechanical debugging | Missing imports, syntax errors, config issues |
| Public knowledge     | "What is RAG?" / "What does @dataclass do?"   |
| Tooling help         | "How do I run the tests?"                     |

### Zone 2: GUIDED (Learning with AI)

**Surface Intent (AI CAN explain):**

| AI Can Do                  | Examples                                   |
| -------------------------- | ------------------------------------------ |
| Explain what code does     | What it does, how it works, inputs/outputs |
| Explain how files connect  | Structural architecture                    |
| Explain what changed       | Diff walkthrough                           |
| Explain patterns/libraries | Public knowledge                           |
| Diagnose failures          | Root cause diagnosis                       |

**Deep Intent (Human steers — AI refines):**

| Human Asks                        | AI Response                                     |
| --------------------------------- | ----------------------------------------------- |
| "Why did they build it this way?" | "What do YOU think?" (let human form inference first) |
| "I think X causes Y, correct?"    | Confirm or correct — human already steered      |
| "Is my understanding correct?"    | Confirm or correct — human already steered      |
| Unprompted                        | Never volunteer new inferences                  |

**THE CRITICAL RULE:** Human steers → AI can confirm/correct. AI volunteers → contamination.

AI can refine human's thinking when human is steering. AI just shouldn't add NEW inferences the human didn't make.

### Zone 3: GUIDED CAPTURE (Deliverable Production)

**Principle:** Human steers. AI validates direction when asked. AI never takes the wheel.

| AI Can Do                                                                         | AI Cannot Do                                    |
| --------------------------------------------------------------------------------- | ----------------------------------------------- |
| Confirm/deny causal chains human proposes ("I think X causes Y" → correct/wrong) | Volunteer causal chains or reasoning unprompted |
| Clean up grammar/clarity, organize sections                                       | Fill gaps the human didn't identify             |
| Correct factual errors (wrong function name, etc.)                                | Introduce insights the human didn't derive      |

**The test:** Did human steer toward this conclusion, or did AI? Human asked + AI confirmed = fine. AI offered it = contamination.

---

## Zone Boundaries by Phase

| Phase                   | Zone | AI Can                                                           | AI Cannot                                            |
| ----------------------- | ---- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| **0: Setup**      | 1    | Clone, install, verify tests                                     | Interpret code                                       |
| **1: Understand ↔ Refine** | 1+2 | Explain code, diagnose, implement changes, log facts           | Generate insights, validate reasoning, suggest       |
| **2: Draft**      | 3    | Clean up, organize, clarify — faithful to intent                | Add reasoning, change meaning, validate, suggest     |
| **3: Finalize**   | 1+3  | Construct task-tests, split commits, format DRAFT→FINAL, submit | Add claims, change meaning                           |

---

## General Rules

1. **Minimal responses.** State what you did or what you need. No coaching, encouragement, or filler.
2. **Human-initiated transitions.** Never auto-advance phases. Wait for "next" (or "done" in Phase 3).
3. **Track current zone.** Always know which zone you're in and enforce its boundaries.
4. **NEVER commit without permission.** Exception: WIP commits during Phase 1 Refine (see WIP Commit Protocol below).
5. **NEVER push without permission.**
6. **Discovery log discipline.** During Phase 1 Refine, after significant events, log WHAT factually and prompt human for WHY.
7. **Status on demand.** When human types "status", render the Status Command block (see below).
8. **Conflict resolution.** When rules conflict, the more restrictive interpretation applies.

---

## Transition Keywords (Quick Reference)

| Keyword       | When Used              | Effect                         |
| ------------- | ---------------------- | ------------------------------ |
| `done`      | Phase 1→2, 2→3       | Advance to next phase          |
| `approve`   | Phase 2 (Draft) sections | Write current section to DRAFT |
| `submit`    | Phase 3 Step 7         | Create PR                      |
| `handshake` | Phase 3 Step 8         | Generate platform submission   |
| `archive`   | Post-submission        | Move repo to .archive/         |
| `status`    | Any time               | Show current state             |

---

## Edge Cases & Error Recovery

| Situation                                | How to Handle                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| **Tests can't be made standalone** | Document why, exclude from task-tests, note in HANDSHAKE Q6                  |
| **Repo has no test framework**     | Skip P2P/F2P construction, note in HANDSHAKE. Human may need to add tests.   |
| **PR only changes documentation**  | No F2P needed. P2P = existing tests (if any). Note in HANDSHAKE.             |
| **PR has no tests at all**         | Human must add tests in Phase 1 Refine, or flag as incomplete                |
| **No relevant P2P tests on main**  | OpenCode suggests 2-5 regression tests to write, gets human approval, then human writes them during Phase 1 Refine. Note in HANDSHAKE. |
| **Context running low**            | Summarize progress to STATE.md, checkpoint, offer to continue in new session |
| **Tests fail after import fixes**  | Find root cause (grep for patterns), never use @ts-nocheck                   |
| **Human accepts AI recommendations** | Move directly to Phase 2 (Draft) — Refine Decisions section stays empty   |

---

## ⚠️ Critical Safety Rules (Protect Others' Work)

### Branch Safety

1. **ALWAYS use `golden-solution-<your-username>`** — never just `golden-solution`
2. **Before ANY push** , verify the remote branch either doesn't exist OR you created it
3. **If a branch exists that's not yours** → STOP. Create a different branch name.

### PR Safety

1. **NEVER edit a PR you didn't create** — verify with `gh pr view <N> --json author --jq '.author.login'`
2. **NEVER force-push to a branch with an open PR by someone else**

### Before Push Checklist

```bash
git branch --show-current                                    # golden-solution-<YOUR-username>?
git ls-remote --heads origin $(git branch --show-current)    # remote exists?
gh pr list --head $(git branch --show-current) --json number,author --jq '.[0]'  # your PR?
```

### Recovery (If You Accidentally Pushed to Someone Else's Branch)

```bash
# Find their original commit from GitHub activity
gh api repos/<org>/<repo>/activity --jq '.[] | select(.ref == "refs/heads/<branch>") | select(.activity_type == "branch_creation") | .after'

# Restore it
git push origin <their-original-commit>:<branch> --force
```

Then create a new branch with a different name for your work.

### Commit/Push Protocol

Always show what will happen and wait for confirmation before committing or pushing.

### WIP Commit Protocol (Phase 1 Refine Only)

Auto-saved after tests pass following substantive changes. No confirmation needed.

```bash
git add -A && git commit -m "WIP: [brief description]"
```

Rules: auto-save only (no prompt), only after tests pass, not after every command, squashed in Phase 3. Update 01-STATE.md after each.

---

## Phase Overview

```
PHASE 0: Setup      → Clone, install, verify tests                         [Zone 1]
PHASE 1: Understand ↔ Refine loop (ping pong until satisfied)              [Zone 1+2]
PHASE 2: Draft      → Formalize understanding                              [Zone 3]
PHASE 3: Finalize   → Task-tests, commits, DRAFT→FINAL                    [Zone 1+3]
```

**The pattern:** AI prework → Human understands → May refine → Understands more → Loop → Draft

**Why DRAFT comes after Refine:** Understanding crystallizes during implementation. Hitting walls, finding bugs, seeing what breaks — that's where reasoning happens. 02-NOTES.md provides the raw material.

---

## File Setup

After Phase 0, create these gitignored files in `.helix/`. Numbered prefixes enforce order of operations:

| #  | File                             | Phases | Purpose                                                             |
| -- | -------------------------------- | ------ | ------------------------------------------------------------------- |
| 01 | **.helix/01-STATE.md**     | All    | Session state for resuming. Auto-updated by OpenCode.                 |
| 02 | **.helix/02-NOTES.md**     | 0-2    | Analysis + recommendations. AI prefills, human reviews.             |
| 03 | **.helix/03-DRAFT.md**     | 3      | Human's genuine reasoning. AI helps structure, human owns thinking. |
| 04 | **.helix/04-FINAL.md**     | 3      | PR body (7 sections). Generated from DRAFT + NOTES.                 |
| 05 | **.helix/05-HANDSHAKE.md** | 3      | Handshake platform submission fields.                               |
|    | **.helix/screenshots/**    | 3      | Auto-generated test result screenshots (01-p2p.png, 02-f2p.png).      |

### Content Lifecycle

| Phase             | What Gets Filled                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Phase 0** | 01-STATE (template) • 02-NOTES Quick Reference • 03-DRAFT (template) • screenshots/ dir          |
| **Phase 1** | 02-NOTES: Files in PR • Reference (P2P/F2P candidates) • Understanding • Refine Decisions (if any) |
| **Phase 2** | 03-DRAFT sections 1, 2, 3                                                                          |
| **Phase 3** | P2P/F2P commands → 02-NOTES • screenshots • 04-FINAL • 05-HANDSHAKE • Golden Solution PR URL   |

### .gitignore entries

```
.helix/
```

---

### 01-STATE.md Template

```markdown
# Helix Session State
<!-- Auto-updated by OpenCode. Don't edit manually. -->

## Current Phase
Phase: 0
Status: Setup complete

## Progress
- [x] Phase 0: Setup
- [ ] Phase 1: Understand ↔ Refine (Zone 1+2)
- [ ] Phase 2: Draft (Zone 3)
- [ ] Phase 3: Finalize (Zone 1+3)

## PR Health Check
Status: PROCEED | BLOCKED
Tests: [X/Y passing] — failing: [list if any]
Implementation: [Y files changed]
Tests in PR: [yes/no]
Notes: [anything worth knowing]

## Context for Resume
Repo: <repo-name>
Original PR: #<number> | <url>
Golden Solution PR: [after Step 7]
Branch: <unique-branch>
Clone path: /Volumes/Kingston/Dev/helix-work/<repo>/
Full suite command: <detected>
Build command: <detected or "none">

## PR Test Summary
<!-- What the PR changed in tests — populated Phase 0 -->
PR test changes:
- [file: change type]

## Key Artifacts
02-NOTES.md: [status]
03-DRAFT.md written: no
04-FINAL.md written: no
05-HANDSHAKE.md written: no
Screenshots: [none]

## Test Commands
Full suite: <detected>
P2P cmd: [after Phase 3 Step 3]
F2P cmd: [after Phase 3 Step 3]

## Test Results
Full suite: [not run]
P2P: [not run] | New changes: [none]
F2P: [not run] | New changes: [none]
Last WIP commit: [none]

## Session Log
- [date] Phase 0 complete
```

### State Updates

Update 01-STATE.md: after completing each phase, after significant progress, before ending any session.

Session Log: phase transitions + key decisions only.

```
GOOD: "Phase 1 complete — accepted AI recommendations"
GOOD: "Phase 1 complete — added reject test for edge case"
BAD:  "Cloned repo, installed dependencies"
```

### Resume Protocol

On resume, MUST read before taking any action:

1. **01-STATE.md** — current phase, test results, key decisions
2. **02-NOTES.md** — analysis + human's understanding

Then report back:

```
Resuming [repo] at Phase [N].
Your understanding (from NOTES): [1-2 sentence summary]
Key decisions: [from Session Log]
Ready to continue?
```

If STATE missing: list `.helix/` files, ask human which phase.

---

### 02-NOTES.md Template

**Document flow:** Quick Reference → Upstream Context → Files in PR → Understanding → Reference

**File ordering:** Core implementation → Supporting files → Tests

```markdown
# NOTES — [REPO NAME]

---
## Quick Reference
---

**Full suite:** [command]
**Original PR:** [url]
**Upstream PR:** [url if different]
**Upstream Issue:** [url if exists]
**Golden Solution PR:** [available after Phase 3 Step 7]
**Branch:** [name]

---
## Upstream Context
---
<!-- START HERE: Understand the problem before looking at code -->

### Issue: "[title]"
**Problem:** [one-line summary]
**Maintainer:** [key response]

### PR: "[title]"
**Solution:** [one-line summary]

---
## Files in PR
---
<!-- Order: core implementation → supporting files → tests -->
<!-- AI populates Changed + Mechanics. Human fills Notes. -->

### 1. [file.ts] (core) — +N lines
**Changed:** [what changed]
**Mechanics:** [what it does, what consumes it]
**Notes:** [human fills]

### 2. [config.ts] (supporting) — +N lines
**Changed:** [what changed]
**Mechanics:** [what it does]
**Notes:** [human fills]

### 3. [file.test.ts] (tests) — +N lines
**Changed:** [N] new test blocks
**Mechanics:** [test pattern — accept/reject/snapshot]
**Notes:** [human fills]

<!-- Simple files (README, docs) — one line description, no Notes needed -->

---
## Understanding
---
<!-- Human's insights — AI helps capture and structure, doesn't generate -->

### Problem
[Human's understanding — AI refines wording, captures verbatim]

### How it works
[Human's mental model — AI organizes, doesn't add]
<!-- Optional: Add diagrams/flows that help you understand the system -->
<!-- Example: "Schema building: z.map() → .min(2) → checks: [{min_size: 2}] → .parse() validates" -->

### [Other sections as needed]
[Human adds based on what they learned]

---
## Reference
---
<!-- Consult as needed -->

### Glossary
- **[Term]**: [One-line definition]

### Implementation Summary
**Methods/changes:** [what [sol] adds]
**How:** [mechanism — what calls what]
**Could break:** [existing behaviors at risk]

### Implementation Additional
[none] or [issue + test impact]

### P2P Candidates
<!-- Key: "Guards against" = what regression would this catch if [sol] broke something -->
| Test | Guards against | Include? |
|------|----------------|----------|
| `"test name"` | [specific regression risk] | YES/no — [brief why] |

**Selected:** [list — should cover: baseline functionality, type checking, chaining, edge cases]

### P2P Additional
[none] or [gap]

### F2P Candidates
| Test | Type | Tests which [sol] behavior | Include? |
|------|------|---------------------------|----------|
| `"test name"` | Accept/Reject/Snapshot | [behavior] | YES/no |

**Selected:** [list]

### F2P Additional
[none] or [gap]

### Refine Decisions
<!-- Human's decisions during understand ↔ refine loop. Skip if accepting AI recommendations. -->

#### Implementation Changes
[none] or:
- **Change:** [what]
- **Why:** [human's reasoning]
- **Verified:** [test result]

#### Test Additions
[none] or:
- **Test:** [name]
- **Type:** P2P | F2P
- **Why:** [human's reasoning / gap noticed]
- **Verified:** [result]
```

**NOTES Rules:**
- AI populates factual sections (Files, Reference) — human reviews
- Human fills Understanding section — AI helps capture, doesn't generate
- When human shares insight → AI refines wording, adds to NOTES
- AI does NOT volunteer "you should also note..." or generate insights

---

### 03-DRAFT.md Template

```markdown
# DRAFT PR — [REPO NAME]
<!-- ZONE 3: GUIDED CAPTURE. AI structures human's words. Cannot add reasoning. -->

## 1. Solution Approach
<!-- Problem + solution decomposition. VOICE: Senior engineer to junior. Focus on PROBLEM, not code. -->
<!-- For humans. Include explicit usage examples if helpful for clarity. -->
<!-- Include "End-to-end (what a human would do)" here — concrete steps a human takes to verify the solution. -->

## 2. Testing Approach
<!-- What to test and why. Focus on behaviors and edge cases, not implementation. -->
<!-- If you added tests during Refine (beyond what PR had), call it out here. P2P is curated later in Phase 3. -->

## 3. Optimal LLM Prompt
<!-- < 200 words. Don't over-specify (no "add 18 tests"). Think: ticket for a colleague. -->
<!-- For LLM. Include explicit examples — LLM doesn't see Section 1. -->
<!-- Include "File to modify:" — core file(s) only. AI can figure out supporting files. -->
<!-- Acceptance criteria must be specific (e.g., "error uses 'map' origin") not vague ("clear errors"). -->
```

**DRAFT has 3 sections.** FINAL expands to 7 sections — adds 4 AI-generated sections (3-6). **Each section MUST have a header** for readability:

| DRAFT Section         | → | FINAL Section (use `## Header`)                    |
| --------------------- | -- | -------------------------------------------------- |
| 1. Solution Approach  | → | ## 1. Solution Approach                              |
| 2. Testing Approach   | → | ## 2. Testing Approach                               |
| —                    | → | ## 3. Test Execution Steps (human setup guide)       |
| —                    | → | ## 4. Test Execution + Results (native cmds+screenshots) |
| —                    | → | ## 5. Pass-to-Pass Tests (run commands)               |
| —                    | → | ## 6. Fail-to-Pass Tests (run commands)               |
| 3. Optimal LLM Prompt | → | ## 7. Optimal LLM Prompt (< 200 words)               |

---

### 04-FINAL.md

Created by OpenCode during Phase 3 Step 6. **Must use markdown headers for each section (7 total). Starts directly with `## 1. Solution Approach` — no title header.** Sections 1-2 and 7 from DRAFT (1:1). Section 3: setup only (install, env fixes — no test commands). Section 4: single fenced code block with native P2P/F2P test commands (labeled with `#` comments) + screenshot placeholders (01-p2p.png on main, 02-f2p.png on branch). Sections 5-6: standalone task-test run commands in bash blocks (no file paths). Section 7 must be < 200 words. See `_reference_helix.md` for full template with examples.

---

## Phase Execution

---

### Phase 0: Setup [Zone 1]

**PHASE RULES (must survive compaction):**
- Mechanical setup only — clone, install, verify
- NO code interpretation or explanation
- NO opinions on the PR's approach
- Just get environment working

**BOUNDARY:** Zone 1 only. No code interpretation. Mechanical setup.

**Clone path:** `/Volumes/Kingston/Dev/helix-work/<repo>/`

### PR Health Check

Run after clone + install, before proceeding:

**Red flags:**
- Can't install deps / build fails
  - Try quick fix (missing package, config typo) → if fixed, continue
  - If complex (version conflicts, deep build issues) → BLOCKED, surface to human
- No implementation changes (empty PR)
- PR marked WIP/Draft with incomplete code

**Everything else → note and continue:**
- Tests failing → note which ones (if unrelated to PR, ignore)
- No tests in PR → human adds in Refine
- No linked issue → figure it out during Explore

**Output:**

```
PR HEALTH CHECK: PROCEED | BLOCKED

Tests: [X/Y passing] — failing: [list if any, note if unrelated to PR]
Implementation: [Y files changed]
Tests in PR: [yes/no]

Notes: [anything worth knowing]

If BLOCKED: [reason + recommendation to flag to Handshake]
```

---

**You do:**

1. Parse URL → clone repo to `/Volumes/Kingston/Dev/helix-work/<repo>/` (or fetch if exists)
2. Checkout PR branch: `gh pr checkout <number>`
3. Create unique branch from PR HEAD:

   ```bash
   git checkout -b golden-solution-$(gh api user --jq '.login')
   ```

   **⚠️** Never reuse someone else's branch. If it exists and isn't yours, stop and investigate.
4. Install dependencies, detect test command, **run tests once**
5. **Run PR Health Check** — if BLOCKED, stop and surface to human
   **Document environment setup for Section 3:** While installing/building/testing, record any workarounds needed to get tests running from `main`:
   - Missing dependencies, compilation fixes, config changes
   - Broken tests unrelated to the PR
   - Special build steps required before tests run
   Record in STATE under "Environment Setup Notes". This is stable (repo-level, not PR-level) and won't change during human refinement.
   **Capture "before PR" screenshot:** While on `main`, run the native test command relevant to the PR and save screenshot to `.helix/screenshots/01-p2p.png`. This captures the baseline (tests passing before any changes). The "after PR" screenshot (02-f2p.png) is captured in Phase 3 Step 4 after the solution is implemented.
6. **Detect build/generate steps** — read the PR to understand what's needed:
   - If PR includes generated files (e.g., Deno copies, compiled output), find what produces them
   - Check project config (package.json scripts, Makefile, etc.) for the build command
   - Record in STATE; **surface in LLM Prompt (Section 7)** so evaluated AI knows to run it
7. Analyze PR's test changes (new files vs new blocks vs assertions in existing blocks) → record in 01-STATE.md
8. **Fetch upstream context** — Parse PR description for linked issues/PRs (e.g., "Fixes org/repo#123"):
   - Fetch issue body + comments via `gh issue view <num> --repo <org/repo> --json title,body,comments`
   - Fetch original PR body + comments if referenced
   - Add to 02-NOTES.md "Upstream Context" section:
     - **Problem as stated** — verbatim quotes from issue
     - **Discussion** — key comments (author responses, maintainer feedback)
     - **Test-to-problem mapping** — which tests correspond to which discussed behaviors (observable facts only)
9. Create `tests/{pass-to-pass,fail-to-pass}/` with `.gitkeep` files
10. Create `.helix/` folder structure with `screenshots/` dir
11. Extract PR file list → populate `.helix/02-NOTES.md` Part 2
12. Generate `.helix/02-NOTES.md` Part 1 (Glossary) — scan repo for tools, libraries, patterns
13. Create workflow files from templates in `.helix/` (01 through 04; 05 generated in Phase 3)
14. Add `.helix/` to `.gitignore`

**Report:**

```
PR HEALTH CHECK: PROCEED | BLOCKED

Tests: [X/Y passing] — failing: [list if any]
Implementation: [Y files changed]
Tests in PR: [yes/no]

Notes: [anything worth knowing]
───────────────────────────────────────────────────────────
Phase 0: Setup Complete                                    [Zone 1]
Repo: <org>/<repo>  |  PR: #<number>  |  Branch: <unique-branch>
Full suite: [command] → [X/Y passing] ✓
Build: [command or "none required"]
PR test changes: [summary per file]
Files in PR: [feature count] feature, [test count] test
Task-tests: empty (constructed in Phase 3)
Type "next" when ready to explore.
```

Update 01-STATE.md: `Phase: 0 | Status: Setup complete`.

---

### Phase 1: Understand ↔ Refine [Zone 1+2]

**PHASE RULES (must survive compaction):**
- AI does prework (factual analysis)
- Human understands → may refine → understands more → may refine more
- Ping pong until human is satisfied
- NOTES captures everything along the way

**BOUNDARY:** AI provides facts + implements changes. Human provides insights. AI cannot generate insights.

#### Phase 1 Entry (AI prework)

On entering Phase 1, AI immediately populates NOTES:

1. **PR Overview** — Files changed, mechanics, test changes
2. **Implementation Summary** — What [sol] does, what could break
3. **Test Analysis** — P2P/F2P candidates with reasoning

```
git show main:<test-file>     # see what existed
git diff main -- <test-file>  # see what PR added
```

**You say:**

```
Phase 1: Understand ↔ Refine                               [Zone 1+2]

NOTES populated with prework. Review 02-NOTES.md.

Loop: Understand → Maybe refine → Understand more → Maybe refine more
Exit: "done" when satisfied

I CAN: explain facts, implement changes, capture your insights
I CANNOT: generate insights, validate reasoning
```

#### The Understand ↔ Refine Loop

```
Human reviews NOTES
    ↓
Human asks questions → AI explains (factual)
Human shares insight → AI captures to NOTES
Human requests change → AI implements → verify tests → back to understanding
    ↓
Repeat until satisfied
    ↓
Human: "done"
```

**Helping human understand faster (without biasing):**

| AI CAN | AI CANNOT |
|--------|-----------|
| Present facts clearly (prework) | Generate insights |
| Reflect back: "I heard [X]. Correct?" | Validate: "Good insight" |
| Clarify: "Do you mean A or B?" | Suggest: "You should consider..." |
| Implement changes human requests | Suggest changes |
| Prompt: "Can you say more about X?" | Steer toward conclusions |

**Capturing human's insights:**
```
Human shares thought → AI reflects back → Human confirms → AI adds to NOTES
```

**If changes made:** Add to "Changes Made" section in NOTES.

**Gate:** Tests must pass before "done".

**When human says "done":** Verify tests pass. Update 01-STATE.md. Transition to Phase 2.

---

### Phase 2: Draft [Zone 3]

**PHASE RULES (must survive compaction):**
- NOTES has human's understanding from Phase 1
- Human formalizes understanding into DRAFT
- AI structures faithfully — cannot add reasoning
- CANNOT: introduce "because", "therefore", "ensures" — no new causality
- Human Filter: describe PROBLEM not CODE
- Human says "approve" → write section, move to next
- Human says "done" → transition to Phase 3

**BOUNDARY:** AI structures faithfully. Cannot change meaning or add reasoning.

#### Phase 2 Entry

On entering Phase 2, AI:

1. Reads 02-NOTES.md (includes Changes Made if any)
2. Starts guided section-by-section capture

**The synthesis model:** Human reviews NOTES → articulates understanding. NOTES is reference material, not copy-paste source.

**You say:**

```
Phase 2: Draft                                             [Zone 3]

Your understanding is in 02-NOTES.md. Now formalize into DRAFT.

3 sections: 1. Solution Approach  2. Testing Approach  3. Optimal LLM Prompt

I CAN: structure, clean grammar, organize
I CANNOT: add reasoning, suggest content

SECTION 1: Solution Approach — What's the problem? What's the solution?
```

#### Section-by-Section Capture Loop

For each section, AI shows the section prompt.

**Section 2 prompt (Testing Approach):**
```
VOICE: Senior engineer explaining what to test and why.

What would you personally test to verify this works?
  - What behaviors need to be checked?
  - What edge cases matter?

If you added tests during Phase 1, call it out: what and why.
P2P is curated in Phase 3.

Focus on WHAT to test and WHY, not the test implementation details.

Junior-engineer test: if it's hard to parse, rewrite it.
  - "Valid X are accepted" not "parsed output matches input"
  - "Invalid X are rejected with error Y" not "data passes through unchanged"
```

**Section 3 prompt (Optimal LLM Prompt):**
```
VOICE: Senior engineer writing a ticket for a junior (or an LLM).

Hit what applies (≤ 200 words):
  1. Problem statement       5. Build steps (if needed)
  2. File to modify          6. Documentation (if needed)
  3. Task description        7. Testing requirements
  4. Constraints             8. Acceptance criteria

DON'T over-specify:
  - BAD: "add 18 tests covering X, Y, Z..."
  - GOOD: "add tests for the new behavior"

Don't copy the test matrix from Section 2. Sharp and precise, but humanlike.
Verify examples against actual test output before finalizing.
```

**Language clarity (junior-engineer test):**
If a senior struggles to parse it, a junior won't understand it. Avoid implicit language.

- **Explicit > implicit** — say what happens, not what "should" happen
- **Concrete > abstract** — "rejected with error X" not "validation fails"
- **Examples > descriptions** — show actual input/output, not prose about behavior
- Don't mention implementation files (e.g., "en.ts") — allude: "follow the library's pattern"

BAD: "Parsed output matches input (data passes through unchanged)"
GOOD: "Valid Maps are accepted. Invalid Maps are rejected with error: 'Too small: expected map to have >=2 entries'"

**After human talks:** Show structured version in a divider block. "approve" to write and move to next section.

**When human says "approve":** Write section to 03-DRAFT.md, show next section prompt.

**After all sections approved:** Report DRAFT complete. "Say 'done' to proceed to Phase 3, or revisit any section."

#### The Human Filter (Self-Check While Talking)

As you talk through your understanding, ask yourself:
> "Am I describing the PROBLEM or the CODE?"

| What You Say | Keep or Rephrase? |
|--------------|-------------------|
| "The issue is X needs to handle Y" | ✓ Keep — problem framing |
| "The function uses a ternary to check Z" | ✗ Rephrase — code description |

**Your slightly-off inference about WHY is more valuable than a perfect explanation of WHAT.** Human specs have gaps. That's the signal.

#### Guardrails

Zone 3 rules apply (see Three-Zone Model). The test: Human asked + AI confirmed = fine. AI offered it = contamination.

#### Revisiting Sections

Human says "revisit section N" before "done" → show current content, accept changes, "approve" to update.

**When human says "done":** Update 01-STATE.md: `03-DRAFT.md written: yes`. Say "Got it. Starting Phase 3." Transition immediately.

---

### Phase 3: Finalize [Zone 1+3]

**PHASE RULES (must survive compaction):**
- Zone 1: task-tests, commits, verification — mechanical
- Zone 3: DRAFT→FINAL — format only, NO content changes
- Sections 1, 2, 7: copy from DRAFT 1:1, only clean grammar
- FORBIDDEN in FINAL: new "because", "ensures", "all", "fully" — no new claims
- NEVER add test cases beyond PR + human-requested
- NEVER use @ts-nocheck — fix root cause
- Human must verify 3 commits before PR creation
- Human uploads screenshots to GitHub after PR creation

**BOUNDARY:** Zone 1 for mechanical tasks (task-tests, commits, verification). Zone 3 for DRAFT→FINAL formatting only.

**You say:**

```
Phase 3: Finalize                                          [Zone 1+3]

Steps: 1.Diff  2.Task-tests  3.Verify vs main  4.Screenshots
       → HIL: User tests commands  5.Split commits
       6.DRAFT→FINAL  7.Submit PR  8.Handshake

Ready? (y/n)
```

#### Step 1: Show diff from original PR [Zone 1]

Show factual summary of human's changes vs original PR (implementation + tests). Then: "Say 'update' to revise DRAFT sections 1-2, or 'continue' to proceed."

#### Step 2: Construct task-tests [Zone 1]

**Adapt for your stack:** Examples below assume Jest/TypeScript. For pytest, vitest, Go, etc. — adjust commands and config patterns accordingly.

**Remove .gitkeep files first:**

```bash
rm -f tests/pass-to-pass/.gitkeep tests/fail-to-pass/.gitkeep
```

### Testing Hygiene (P2P and F2P)

Both P2P and F2P are training data — the model learns what "good tests" look like.

**Structure:**
- **Clear test names** — improve vague names (e.g., `"dirty"` → `"validates keys with refinements"`)
- **Logical groupings** — use `describe()` blocks to organize by behavior
- **No meta-comments** — never add `// P2P: ...`, `// These tests pass on main...`
- **No suppressions** — if you need `// @ts-ignore`, fix the underlying issue
- **Inline clarifications** — OK if non-obvious (`// date only`)

**Defensive testing** — if main tests the same behavior in multiple contexts, keep them. Don't assume redundancy.

**State validity** — chaining/fluent API tests should verify the object remains usable after operations.

**What to document vs just do:**
- Formatting (describe blocks, better names, reordering) → **just do it, don't ask** — these are easy wins
- New tests/assertions → document in Section 2 what you added and why

---

**P2P construction (2-5 relevant tests from main):**

P2P and F2P must be **standalone runnable** with their own config.

a. **Select relevant tests from main, then refactor.** NOT all tests — curate tests that:
   - Exercise code paths touched by your `[sol]` commit
   - Would catch regressions if someone broke the feature
   - Are stable and deterministic

b. **Refactor for quality.** See Testing Hygiene above.
   - Improve test names for clarity
   - Fill gaps if assertions are missing
   - Remove redundancy if assertions are duplicative
   - Minimum tests needed — defensive and lean

   **Goal: clean, readable tests.** Improvements are fine with good reasoning — don't just copy verbatim.

**If no relevant tests exist on main:**
1. OpenCode analyzes `[sol]` code paths and suggests 2-5 regression tests to write
2. OpenCode explains what each test would cover and why
3. Wait for human approval before proceeding
4. Human writes the tests during Phase 1 (Refine)

```bash
# Example: identify relevant test files, then copy selectively
git checkout main -- src/__tests__/relevant-feature.test.ts
cp src/__tests__/relevant-feature.test.ts tests/pass-to-pass/
git checkout HEAD -- src/__tests__/
```

c. **Fix ALL broken paths.** Moving tests breaks references. Common issues by stack:

| Stack | What Breaks | How to Find |
|-------|-------------|-------------|
| **TypeScript/JS** | `import` paths, `require()` | `grep "from ['\"]\.\."` |
| **Python** | `import`, `patch()` targets, fixtures | `grep -E "^from|^import|patch\("` |
| **Go** | package imports | `grep "import"` |

**The principle:** When tests move from `src/__tests__/` to `tests/pass-to-pass/`, relative paths change depth. Fix them.

d. **If tests fail after path fixes:** Find root cause. Never use suppressions — fix the real issue.

e. Create `tests/jest.config.json` (or equivalent for your stack):

```json
{
  "rootDir": "..",
  "transform": { "^.+\\.tsx?$": "ts-jest" },
  "testRegex": "tests/.*\\.test\\.ts$",
  "modulePathIgnorePatterns": ["language-server", "__vitest__"],
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"]
}
```

f. **Verify standalone:** `npx jest --config tests/jest.config.json tests/pass-to-pass/`

**F2P construction (new feature tests):**

**F2P folder** (`tests/fail-to-pass/`): Standalone extracted tests that verify new behavior.

**F2P commit** contains BOTH:
1. Extracted tests in `tests/fail-to-pass/`
2. Original PR author's test file changes (`src/__tests__/`, mirrors) — isolated to this commit, NOT in sol

**Case A: PR added new test files or new test blocks**
→ Extract those files/blocks directly to `tests/fail-to-pass/`.

**Case B: PR added assertions inside existing test blocks** (the tricky case)
→ Surgical extraction: pull out the NEW assertions into standalone test blocks.
→ Add only the minimal setup/teardown needed to run independently.
→ See Testing Hygiene above for structure guidelines.

**Case C: Human added tests during Refine**
→ Include any new tests the human wrote in F2P.

**Exclusion rule:** If the PR author added tests that aren't relevant to the PR's feature (cleanup, unrelated fixes), exclude them from F2P.

After extraction:
* Fix all broken paths (imports, mocks, patches, fixtures)
* Include original PR's test file changes in the F2P commit (including mirror directories like `deno/lib/__tests__/` if they exist)
* Verify standalone runnable
* **Verify F2P FAILS on main** (Step 3)

**GUARDRAILS (AI Bias Prevention):**
- **Source of truth:** `git diff main` — F2P contains ONLY what's in the diff + what human explicitly added during Refine
- **Never invent tests.** If a behavior isn't tested in the PR, don't add a test for it
- **Never "improve" coverage.** AI suggesting "we should also test X" = contamination
- Don't modify assertions beyond standalone needs
- Never use `@ts-nocheck`
- Don't change test behavior

**Verification:** Before finalizing F2P, ask: "Can I trace every test back to the PR diff or human's explicit request?" If no → remove it.

**Redundancy verification:**

| Check                | P2P | F2P                |
| -------------------- | --- | ------------------ |
| Contains PR changes? | NO  | YES (only)         |
| Passes on main?      | YES | NO (most/all fail) |
| Passes on solution?  | YES | YES                |

**New assertions check:**

Before finalizing, compare:
- **F2P vs PR diff** — every assertion should trace to what PR added
- **P2P vs main** — every assertion should exist on main

Formatting (describe blocks, better names, removed redundancy) = ignore.
New assertions/tests or implementation changes = HIL checkpoint below.

**HIL (Human-in-Loop) checkpoint — substantive differences from original PR?**
- Section 1: Implementation changes?
- Section 2: New tests or assertions?

If yes, surface and ask: "Update Section N? (y/n)"

**Show results for approval:**

```
Task-tests: Full Suite [N] | P2P [N tests] | F2P [N tests]

P2P: [files] — regression tests covering [sol] code paths — on solution: [X/Y] ✓
F2P: [files] — PR additions — on solution: [X/Y] ✓
Commands: P2P: [cmd]  F2P: [cmd]
Boundary: P2P has PR changes? [NO✓] | F2P only PR additions? [YES✓]

Look correct? (y/n)
```

#### Step 3: Verify task-tests against main [Zone 1]

```bash
git worktree add /tmp/helix-main-check main
cp -r tests/pass-to-pass/ /tmp/helix-main-check/tests/pass-to-pass/
cp -r tests/fail-to-pass/ /tmp/helix-main-check/tests/fail-to-pass/
cp tests/*.config.* /tmp/helix-main-check/tests/ 2>/dev/null || true
cd /tmp/helix-main-check
cp -r /Volumes/Kingston/Dev/helix-work/<repo>/node_modules . 2>/dev/null || npm install
[build command from STATE, or skip if none]
[P2P command]   # should ALL PASS
[F2P command]   # expect SOME to FAIL
cd - && git worktree remove /tmp/helix-main-check --force
```

Some fail → normal ✅. All fail → clean ✅. All pass → flag ❌ (nothing tests new behavior — investigate: assertions may be too loose or testing existing functionality, not new behavior).

**Update 01-STATE.md Test Commands** with P2P and F2P commands. Show commands for human to verify.

**Finalize Section 3 and 4 content:** Environment setup was recorded in Phase 0 (STATE "Environment Setup Notes"). Confirm Phase 0 setup notes are still accurate — that becomes Section 3 (setup only, no commands). Record the native P2P and F2P test commands in STATE under "Test Execution Notes" — Step 6 uses these for FINAL Section 4's code block.

#### Step 4: Generate Test Screenshots [Zone 1]

**Prerequisites:** Task-tests passing (Steps 2-3).

Two screenshots needed for Section 4:
- **01-p2p.png** — tests running on `main` (before PR). Already captured in Phase 0 Step 5.
- **02-f2p.png** — tests running on PR branch (after PR). Capture now.

```bash
mkdir -p .helix/screenshots
# 02-f2p.png: run native test on PR branch (after solution applied)
[NATIVE_TEST_CMD] 2>&1 | tee /tmp/output.txt
LINES=$(wc -l < /tmp/output.txt | tr -d ' ') && MIDDLE=$((LINES - 8 - 3))
{ echo "$ [NATIVE_TEST_CMD]"; head -3 /tmp/output.txt; echo "  ... ($MIDDLE more lines)"; tail -8 /tmp/output.txt; } | sed '/^$/d' > /tmp/final.txt
termshot -s --no-shadow --raw-read /tmp/final.txt -f .helix/screenshots/02-f2p.png
```

**termshot flags:** `-s` clips canvas to content (no margin), `--no-shadow` removes window shadow.

If termshot not installed: `brew install homeport/tap/termshot`

**Verify both exist:** `ls .helix/screenshots/01-p2p.png .helix/screenshots/02-f2p.png`

#### HIL Checkpoint: User Verifies Commands

**Before splitting commits:** Present P2P and F2P commands to user. User runs them manually to verify:
- P2P passes on solution branch
- F2P passes on solution branch
- Commands work as expected

**You say:** (use absolute path from STATE clone path)
```
Task-tests constructed. Please verify:

Commands are in: [clone path]/.helix/01-STATE.md (Test Commands section)

Run P2P and F2P yourself. Type "approve" when ready to split commits.
```

**Wait for "approve"** before proceeding to Step 5.

#### Step 5: Split into 3 commits (+ optional dep) [Zone 1]

**Prerequisites:** Task-tests verified against main (Step 3), user approved commands (HIL checkpoint).

Clean up irrelevant files first (lock files, IDE files, build artifacts).

```bash
git branch backup-before-split
git reset main

# Use --no-verify to prevent pre-commit hooks from contaminating commits
# Optional: dependency changes (if any)
git add [dependency files only]              && git commit --no-verify -m "[dep] [description]"

# Required: 3 commits in this order
git add [implementation + docs, NOT tests]   && git commit --no-verify -m "[sol] [description]"
git add tests/pass-to-pass/ tests/*.config.* && git commit --no-verify -m "[p2p] Add regression tests for [feature]"
git add tests/fail-to-pass/ [original PR test changes + mirrors] && git commit --no-verify -m "[f2p] Add feature tests for [feature]"
```

**Commit isolation:**
- **[dep] (optional):** Dependency/environment changes only. No feature code, no tests.
- **[sol]:** Implementation (`src/*.ts`), docs (`README.md`), config (`.gitignore`). NO test files.
- **[p2p]:** `tests/pass-to-pass/` + config. 2-5 regression tests from main relevant to `[sol]`.
- **[f2p]:** `tests/fail-to-pass/` + author's test changes (`src/__tests__/`, mirrors). New feature tests isolated here.

**Mirror/artifact reminder:** If repo has auto-sync (deno/, build outputs), those go in `[f2p]` not `[sol]`. See "Pre-commit hook contamination" in Task-Tests Model.

**Verify commits before proceeding:**
```bash
git show --stat [dep-hash]  # Should only have .gitignore (or deps)
git show --stat [sol-hash]  # NO test files (__tests__, .test.ts, etc.)
git show --stat [p2p-hash]  # Only tests/pass-to-pass/
git show --stat [f2p-hash]  # tests/fail-to-pass/ + src/__tests__/ + mirrors
```

Show commits for human verification. **Wait for confirmation.** Recovery: `git reset --hard backup-before-split`

#### Step 6: Format DRAFT → FINAL [Zone 3]

**Prerequisites:** 03-DRAFT.md complete (Phase 2), 01-STATE.md has P2P/F2P commands (Step 3), screenshots generated (Step 4).

| Section                 | Source                           |
| ----------------------- | -------------------------------- |
| 1. Solution Approach    | 03-DRAFT.md (1:1, human's words) |
| 2. Testing Approach     | 03-DRAFT.md (1:1, human's words) |
| 3. Test Execution Steps | 🤖 AI+Human — env/setup guide (no cmds) |
| 4. Test Execution + Results | 🤖 AI+Human — native cmds + screenshots |
| 5. Pass-to-Pass Tests   | 🤖 AI — run commands for pipeline        |
| 6. Fail-to-Pass Tests   | 🤖 AI — run commands for pipeline        |
| 7. Optimal LLM Prompt   | 03-DRAFT.md (1:1, human's words, < 200 words) |

**Sections 1, 2, 7 (Zone 3):** Read DRAFT only to format. No comments, evaluation, or content changes. **Forbidden:** new causality ("because", "therefore"), new absolutes ("ensures"), new scope ("all", "fully"), any claim not in DRAFT. Self-check every sentence against DRAFT; mark additions `[ADDED — not in your draft, remove?]`.

**Section 3 (Zone 1):** For humans only — environment/setup guide. What a human needs to fix or know before tests can run from `main`. **No test commands here** — those go in Section 4. Complexity varies:
- **Simple repos:** Just `npm install` or `pnpm install`
- **Complex repos:** Numbered steps with **Why / Impact** for each (missing deps, compilation fixes, broken tests)

See `_reference_helix.md` Section 3 Deep Dive for examples.

**Section 4 (Zone 1):** Native repo test commands (P2P then F2P) + screenshots. Single fenced code block with both commands, labeled with `#` comments:
```markdown
```bash
# Run regression tests (p2p)
[native P2P test command]

# Run new tests (f2p)
[native F2P test command]
```

**P2P (pass-to-pass regression):**
<!-- Drag and drop 01-p2p.png here -->


**F2P (fail-to-pass feature):**
<!-- Drag and drop 02-f2p.png here -->

```

**Sections 5-6 (Zone 1):** Standalone task-test run commands in bash blocks. No file paths — just the commands:
```markdown
## 5. Pass-to-Pass Tests

```bash
[standalone P2P test command]
```

## 6. Fail-to-Pass Tests

```bash
[standalone F2P test command]
```
```

#### Step 7: Submit [Zone 1]

Pre-flight: FINAL exists, unique branch, 3 commits verified, full suite + task-tests passing, F2P verified against main.

On "y":

```bash
BRANCH=$(git branch --show-current)
[[ ! "$BRANCH" =~ "golden-solution-" ]] && echo "ERROR: Bad branch" && exit 1
REMOTE=$(git ls-remote --heads origin "$BRANCH")
if [[ -n "$REMOTE" ]]; then
  AUTHOR=$(gh pr list --head "$BRANCH" --json author --jq '.[0].author.login')
  ME=$(gh api user --jq '.login')
  [[ "$AUTHOR" != "$ME" && -n "$AUTHOR" ]] && echo "ERROR: Not your PR!" && exit 1
fi
git push -u origin "$BRANCH"
gh pr create --base main --head "$BRANCH" \
  --title "[GOLDEN SOLUTION] <title>" --body-file .helix/04-FINAL.md
```

Update 01-STATE.md with PR URL. Tell user: "PR link is in: [clone path]/.helix/01-STATE.md. Upload screenshots to Section 4 on GitHub, then type 'handshake'."

**Post-upload FINAL update:** When human types "handshake" (after uploading screenshots to GitHub PR), fetch the PR body (which now has `<img>` URLs) and write it back to FINAL.md for archival before generating HANDSHAKE:
```bash
gh pr view <PR#> --json body --jq '.body' > .helix/04-FINAL.md
```

**Updating PR body after creation:** Always fetch first to preserve screenshots:
```bash
# Fetch current body (preserves uploaded screenshot URLs)
gh pr view <PR#> --json body --jq '.body' > /tmp/pr-body.md

# Edit /tmp/pr-body.md with changes

# Push back
gh pr edit <PR#> --body-file /tmp/pr-body.md
```

#### Step 8: Handshake Platform Submission [Zone 1]

**Prerequisites:** PR submitted (Step 7), 04-FINAL.md exists.

Generate 05-HANDSHAKE.md:

```markdown
# HANDSHAKE SUBMISSION — [repo-name]

**Q1: Did you modify the solution?**
[No: "No modifications." / Yes: what + why]

**Q2: F2P file paths (comma-separated):**
[paths in tests/fail-to-pass/]

**Q3: P2P file paths (comma-separated):**
[paths in tests/pass-to-pass/]

**Q4: Test case changes?**
Aesthetic only (improved test names). Curated from main (P2P) and PR (F2P).
<!-- Or if substantive: "Added X test for Y behavior" -->

**Q5: LLM Prompt (markdown):**
[Section 7 from FINAL]

**Q6: Challenges?**
[Brief]

**Q7: Time (minutes):**
[total] ([Xh Ym])
```

Update 01-STATE.md: `Phase: 4 | Status: Complete — awaiting user submission`. Report: copy answers to Handshake platform. Type "archive" when done.

---

## Status Command

When human types "status":

```
HELIX STATUS — [repo-name]
PHASE: [N] — [Name]                                  [Zone X]
  [✓] Phase 0  [✓] Phase 1  [→] Phase 2  [ ] Phase 3
NOTES: [status] | DRAFT: [written?] | TESTS: [result]
BRANCH: [name]
```

---

## Transition Gates

| From | To | Gate                                                        |
| ---- | -- | ----------------------------------------------------------- |
| 0    | 1  | Setup complete, tests verified passing                      |
| 1    | 2  | Human says "done", tests pass, NOTES has understanding      |
| 2    | 3  | Human says "done", DRAFT written                            |

---

## Nuances (Operational Learnings)

**Language clarity:**
- "returned unchanged" / "passes through" → confusing. Use "accepted" / "rejected"
- Error examples must match actual library output (e.g., `"Too small: expected map to have >=2 entries"`)
- Don't mention implementation files (en.ts, locales/) — allude: "follow the library's pattern"
- Junior-engineer test: if a senior struggles to parse it, rewrite it

**PR body management:**
- `gh pr edit --body-file` overwrites everything including uploaded screenshots
- After screenshots exist: fetch body first → edit → push back (see Step 7)
- Screenshot placeholders need P2P/F2P labels so human knows which goes where

**Test polish:**
- Name improvements (e.g., `"dirty"` → `"validates keys with refinements"`) — just do it, don't ask
- Method chaining tests should note "leaves schema in valid state" (not corrupted)
- Aesthetic changes (describe blocks, better names) don't need documentation — substantive changes do

**HANDSHAKE defaults:**
- Q4: "Aesthetic only" when no substantive test changes
- Q7: Format as `[minutes] ([Xh Ym])` for clarity

**Patterns:**
- "End-to-end (what a human would do)" — break abstract requirements into concrete steps when helpful. More grounded than spec lists.

---

## Archive Commands

```bash
# "archive" — move to archive
mv /Volumes/Kingston/Dev/helix-work/<repo> /Volumes/Kingston/Dev/helix-work/.archive/<repo>
# "unarchive <repo>" / "archived" — restore or list
```

---

## Completion Checklist

* [ ] Codebase understood + refined (Phase 1)
* [ ] DRAFT written (Phase 2)
* [ ] .helix/03-DRAFT.md captures genuine human reasoning (Phase 3)
* [ ] Full test suite passes
* [ ] Task-tests constructed: P2P (2-5 tests) + F2P (Phase 3)
* [ ] F2P checked against main (at least some should fail)
* [ ] Screenshots generated (.helix/screenshots/01-p2p.png, 02-f2p.png)
* [ ] 3 commits: `[sol]` + `[p2p]` + `[f2p]` (+ optional `[dep]`) — human verified
* [ ] .helix/04-FINAL.md formatted (7 sections with headers)
* [ ] Section 3 has human-followable test execution guide (from main)
* [ ] Sections 5-6 have standalone P2P/F2P run commands in bash blocks
* [ ] Section 7 (LLM Prompt) is < 200 words
* [ ] PR submitted with `[GOLDEN SOLUTION]` prefix
* [ ] Screenshots drag-and-dropped to PR Section 4 on GitHub (manual)
* [ ] FINAL.md updated with `<img>` URLs from PR (post-upload archival)
* [ ] .helix/05-HANDSHAKE.md generated
* [ ] Handshake platform fields filled
* [ ] Hubstaff stopped

**Estimated time: ~5 hours per task**
