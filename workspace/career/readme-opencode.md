# `/career` Quick Reference (Agnostic + Targeted)

Purpose: Build a reusable interview narrative foundation, then tailor it per company/job posting.

Primary source folder: `/Users/jian/Dev/Career`

---

## Core workflow

1. Build foundation once.
2. Generate one target pack per company.
3. Run focused study plan by expected interview tests.

---

## Commands

- `/career`
  - Full run: foundation + optional target generation.
- `/career foundation`
  - Rebuild reusable narrative assets only.
- `/career target <company>`
  - Build company pack from job posting + foundation.
- `/career lean <company>`
  - Build only 3 files: study plan, behavioral practice, agnostic context.
- `/career rounds <company>`
  - Interview round map and test expectations.
- `/career behavior <company>`
  - Curated behavioral Qs + fillable cheat sheet.
- `/career plan <company>`
  - Study plan weighted by what is likely tested.
- `/career resume`
  - Continue from previous checkpoint.

---

## Output layout

Foundation:
- `workspace/career/foundation/00_narrative_core.md`
- `workspace/career/foundation/01_story_bank.md`
- `workspace/career/foundation/02_behavioral_cheatsheet_template.md`
- `workspace/career/foundation/03_question_bank_agnostic.md`

Target pack:
- `workspace/career/targets/{company_slug}/00_job_posting_analysis.md`
- `workspace/career/targets/{company_slug}/01_interview_round_map.md`
- `workspace/career/targets/{company_slug}/02_behavioral_questions_curated.md`
- `workspace/career/targets/{company_slug}/03_company_language_signal_bank.md`
- `workspace/career/targets/{company_slug}/04_study_plan.md`
- `workspace/career/targets/{company_slug}/05_execution_checklist.md`

Session tracking:
- `workspace/career/session.md`

Lean output (practical mode):
- `{company_folder}/STUDY_PLAN.md`
- `{company_folder}/BEHAVIORAL_PRACTICE.md`
- `{company_folder}/AGNOSTIC_CONTEXT.md`

---

## Practical usage example

- `/career foundation`
- `/career target aspida`
- `/career lean aspida`
- `/career behavior aspida`
- `/career plan aspida`
