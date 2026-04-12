---
model: opus
---

Resource Hint: opus

# `/optimize` — Slash Command Optimizer

## Usage

```
/optimize <paste the full slash command to optimize>
```

---

## Phases

Execute IN ORDER. Do not skip phases. Do not begin editing until Phase 3.

---

### Phase 1: ORIENT — Understand Before Touching

Build a mental model of the command. No suggestions yet.

**1a. Reason for existing.**
- Why was this created? What problem does it solve?
- What workflow does it serve? What would break without it?
- Who is the human using this, and what is their intent?

**1b. Map the architecture.**
- List every distinct phase, step, or section.
- For each: purpose, output, dependencies.
- Identify intentional redundancy vs. accidental redundancy. Intentional redundancy exists for accuracy — do not touch it.

**1c. Map the constraints.**
- Hard invariants (must never change or command breaks)
- Soft heuristics (guide behavior but have flexibility)
- Nuances in wording that would be destroyed by naive rewording

**1d. Search conversation history (WHY it was built).**
- Context on why this command was created
- Pain points, iterations, design decisions
- Lessons learned baked into current version

> **Note:** Phase 2d will analyze HOW it was actually used — different concern.

**Output Phase 1 as structured analysis.**

**Phase 1 Summary (REQUIRED):** End with a brief summary block:
```
---
📋 Phase 1 Summary:
- Command purpose: {one sentence}
- Key constraints: {2-3 hard invariants}
- Intentional redundancy found: {yes/no, where}
- Risk areas: {sections that need careful handling}

Ready for Phase 2 (Audit)?
```

---

### Phase 2: AUDIT — Find What's Actually Wrong

Analyze for real issues. Do not invent problems.

**2a. Efficiency audit.**
- Instructions that repeat without serving accuracy purpose?
- Verbose explanations that could be tightened without losing meaning?
- Sections that could merge because they serve same function?

**2b. Clarity audit.**
- Ambiguous instructions OpenCode might misinterpret?
- Implicit assumptions that should be explicit?
- Instructions that contradict each other?

**2c. Gap audit.**
- Edge cases not handled?
- Failure modes not accounted for?
- Missing guardrails that could cause hallucination or drift?

**2d. Usage pattern audit (mine conversation history).**

**If no usage history exists:** Skip to 2e. Do not hallucinate usage patterns.

If this command was used in current or recent conversations, **orient first — understand before judging.**

---

**PART A: UNDERSTAND (no judgments yet)**

**A1. Replay the conversation.** Think out loud, chronologically:
```
"Human invoked /ui with intent to..."
"First thing that happened was..."
"Then human said '...' — why did they say that?"
"OpenCode responded by... human reacted with..."
"At this point, human had to clarify/remind/redirect because..."
```

**A2. Identify the moments.** For each significant exchange:
- WHAT happened? (quote or paraphrase)
- WHY did it happen? (what caused this moment)
- Was this friction, flow, or emergence?

**A3. Map the command to the conversation.**
- Which parts of the command were exercised?
- Which parts were never triggered?
- What did human need that the command doesn't address?

**Output Part A as bullet points, not prose.** Max 5-7 moments. No improvements yet — just understanding.

---

**PART B: JUDGE (only after Part A)**

Now that you understand what happened and why, derive improvements:

```
MOMENT: Human said "everything that should be cached should be cached"
WHAT: Human had to remind OpenCode about persistence
WHY: Command doesn't prompt for persistence when state emerges
IMPROVEMENT: Add checkpoint when user-controlled state appears
```

| Pattern | Signal | Typical Fix |
|---------|--------|-------------|
| Reminder | "don't forget X" | Add prompt/checkpoint |
| Clarification | Back-and-forth | Make implicit → explicit |
| Friction | Multiple attempts | Clearer guidance |
| Smooth flow | Quick approval | Don't touch |
| Emergence | New request | Consider adding |

**2e. Risk assessment for every finding.**

| Risk | Meaning |
|------|---------|
| 🟢 Safe | No risk of regression or nuance loss |
| 🟡 Caution | Could affect behavior if done wrong |
| 🔴 Don't touch | Current wording exists for a reason |

**Output Phase 2 as structured audit.**

**Phase 2 Summary (REQUIRED):** End with a brief summary block:
```
---
📋 Phase 2 Summary:
- Issues found: {count by category: efficiency/clarity/gaps/usage}
- Usage patterns mined: {yes/no, count of findings}
- 🟢 Safe changes: {count}
- 🟡 Caution changes: {count}
- 🔴 Don't touch: {count}
- Biggest opportunity: {one sentence}

Ready for Phase 3 (Plan)?
```

---

### Phase 3: PLAN — Think Out Loud Before Editing

For each proposed change, BEFORE making it:

**3a. State the change in plain English.**
- What exactly are you changing?
- Why is this an improvement?

**3b. Prove it won't regress.**
- What was original wording doing?
- Does new wording preserve that function completely?
- If compressing: does compressed version produce same OpenCode behavior? If uncertain, don't compress.

**3c. Classify the edit type.**

| Type | Meaning |
|------|---------|
| `[TIGHTEN]` | Same meaning, fewer tokens, no behavior change |
| `[CLARIFY]` | Resolves ambiguity, improves instruction-following |
| `[GAP-FIX]` | Adds missing coverage for edge case or failure mode |
| `[USAGE]` | Addresses pattern found in actual human usage (from 2d) |
| `[RESTRUCTURE]` | Reorders for better flow without changing content |
| `[REMOVE]` | Eliminates genuinely redundant content (not intentional) |

**Output full edit plan.**

**Phase 3 Summary (REQUIRED):** End with a brief summary block:
```
---
📋 Phase 3 Summary:
- Total edits planned: {count}
- By type: {TIGHTEN: n, CLARIFY: n, GAP-FIX: n, USAGE: n, RESTRUCTURE: n, REMOVE: n}
- Estimated token reduction: {rough %}
- Highest-risk edit: {which one and why}

Ready for Phase 4 (Execute)?
```

---

### Phase 4: EXECUTE — Apply Changes

Only now produce the optimized command.

**Rules during execution:**
1. Preserve all intentional redundancy. Phrases repeated across phases for accuracy enforcement — keep them.
2. Never reword in a way that flattens nuance. Specific words = specific reasons.
3. If compression requires OpenCode to "infer" what was previously explicit — don't compress.
4. Every edit must trace back to Phase 3 plan. No surprise changes.
5. Maintain same structure/phase ordering unless restructuring was explicitly planned and approved.

**Output full optimized command.**

**Phase 4 Summary (REQUIRED):** After outputting the optimized command, add:
```
---
📋 Phase 4 Summary:
- Edits applied: {count}
- Edits skipped: {count, if any, and why}
- Structure preserved: {yes/no}
- Ready for diff review in Phase 5
```

---

### Phase 5: DIFF — Show Your Work

After producing optimized version:

1. Side-by-side summary of what changed and why
2. What you intentionally did NOT change and why
3. Estimate token reduction (rough percentage)
4. Flag changes you're less confident about — let human decide

**Phase 5 Summary (REQUIRED):** End with final summary:
```
---
📋 Optimization Complete:
- Original: ~{n} lines
- Optimized: ~{n} lines ({n}% reduction)
- Behavior preserved: {yes/confident/uncertain}
- Human review needed: {specific items if any}

Apply changes? (yes/no/review specific section)
```

---

## Hard Rules (all phases)

- **No editing before Phase 3.** Understanding comes first.
- **Intentional redundancy is a feature.** Repeated instructions across phases ensure OpenCode follows them at each stage. Do not consolidate unless human confirms unnecessary.
- **Nuance > brevity.** Longer instruction that precisely captures intent beats shorter ambiguous one.
- **When in doubt, don't change it.** Human built this through iteration. Assume every choice deliberate until proven otherwise.
- **Compression that degrades output = failure.** Goal is efficiency without regression — not minimalism for its own sake.
- **Search conversation history first.** Context from past conversations essential for understanding intent.
