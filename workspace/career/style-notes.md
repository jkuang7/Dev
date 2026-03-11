# Blog Voice Style Guide

Use this when generating blog posts. Posts should sound like Jian, not generic AI.

---

## Voice Bullets

1. **Lead with outcome, explain how after** — "Cut project estimate from 1 year to 4 months" not "I worked on improving the timeline"
2. **Concrete numbers over vague wins** — "98% memory reduction" not "significantly improved performance"
3. **First-person ownership** — Say "I" for your work. Clarify team contributions separately.
4. **Short declarative sentences** — "Pipeline kept crashing. Memory would spike and never come down."
5. **Casual but technical** — Contractions OK. Jargon OK if it's precise. No fluff words.
6. **Show the tradeoff** — "Skipped tests, focused on E2E flow working" — every decision has a cost, name it.

---

## Anti-Patterns (What NOT to Do)

1. **No corporate hedging** — Never write "I helped with" or "I was involved in" — say what you did
2. **No filler adjectives** — Cut "various", "multiple", "significantly", "really"
3. **No passive voice** — "I fixed the bug" not "The bug was fixed by me"
4. **No humble-bragging disclaimers** — Skip "I was lucky to..." or "I had the opportunity to..."
5. **No trash talk** — "Project needed restructuring" not "Previous engineer couldn't figure it out"

---

## Startup Signals (Phrases That Attract Right Companies)

1. **"First-principles thinking"** — Signals: I'll figure it out without a playbook
2. **"Hacky solution that scales"** — Signals: Pragmatism over purity, ship fast
3. **"Influenced without authority"** — Signals: Can move things without being the boss
4. **"Measure twice, cut once"** — Signals: Strategic but not paralyzed
5. **"Made it testable"** — Signals: If I can't debug it, I'll change the environment

---

## Example Transformation

### Before (Generic AI)
> I had the opportunity to work on a challenging data pipeline optimization project. The system was experiencing some performance issues with larger files, and after careful analysis and collaboration with the team, we were able to implement improvements that significantly enhanced the overall memory efficiency of the solution.

### After (Jian's Voice)
> Enterprise clients were sending 20GB Excel files. Pipeline kept crashing — memory would spike and never come down. Hard to debug: 15-minute deploy cycles, couldn't replicate S3 locally. I isolated the code, ran it with an actual file, found the bug: loading the entire file into memory instead of streaming. Fixed it with batch streaming. 98% memory reduction. Lesson: if something isn't testable, make it testable.

---

## Quick Checklist Before Publishing

- [ ] Does the first sentence hook with a specific problem or outcome?
- [ ] Are there at least 2 concrete numbers?
- [ ] Did I name the tradeoff I made?
- [ ] Would this filter out companies that want process over results?
- [ ] 2-3 minute read max?
