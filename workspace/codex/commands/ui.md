---
model: opus
---

Resource Hint: sonnet

# /ui - Direct UI Construction

> **Entry point for UI work.** Build production code with human iteration.
> **Inherits**: `problem-solving.md` (Two-Phase Model), `_task_lifecycle.md`

**Purpose**: Build UI directly with human in the loop. No throwaway prototypes — output is production code that the human iterates on until satisfied.

**Outputs**:
- Production component/page in the target codebase
- CONTRACTS.md (as flows settle) — data shapes, UI states, flows, decisions, backend requirements
- .memory/ updates (context, patterns, decisions)

**Principle**: UI/UX intent is implicit in human judgment. Keep human in loop throughout construction, not just at handoff points.

> **"Settled"** = human approved it ("this works", "yes", "good"). Don't capture during active iteration.

---

## Two-Phase Model (inherited from `_task_lifecycle.md`)

> **Phase 1**: ORIENT → EXPLORE. Read codebase, open app, see patterns, map context. **No code until you understand the codebase.**
> **Phase 2**: BUILD iteratively with human. BUILD → SHOW → FEEDBACK → ITERATE until "this is right." Emit CONTRACTS.md as flows settle.

---

## What /ui Outputs

| Artifact | Where | When |
|----------|-------|------|
| Production UI code | Project codebase | Continuously during iteration |
| CONTRACTS.md | `Repos/{project}/.memory/` | As flows settle (not after every change) |

**CONTRACTS.md captures observable promises the UI makes** — what the user sees and triggers. Not backend decisions (that's /spec).

---

## CONTRACTS.md: Five Sections

### 1. Data Shapes
The JSON structure — fields, types, nesting. Derived from actual/mock data.

### 2. UI States & Actions
What the UI shows and what it triggers. Format: Trigger → Request → States → Success/Error.

### 3. UI Flows
State machines and modal journeys. How the user moves through the app.

### 4. Decisions
Key choices made during iteration and their implications.

| Decision | Choice | Why | Implies |
|----------|--------|-----|---------|
| {what} | {choice} | {rationale} | {backend/future implications} |

**Capture when:** Human chooses between options, UX pattern established, trade-off made.

### 5. Backend Requirements
What the UI will need from backend, phased by priority. Accumulates as UI decisions imply backend needs.

> **Full examples**: See `_reference_ui.md` for detailed templates and examples.

---

## Usage

```bash
# Exploration mode (5 aesthetic directions)
/ui {project} --explore "feature"    # Generate 5 design concepts, pick one

# Start building (default: direct construction)
/ui {project} "feature description"
/ui {project}                        # Resume existing

# Iteration
/ui {project} --focus "component"    # Focus on specific part
/ui {project} --alt                  # Show alternatives (2-3 quick options)
/ui {project} --rollback             # Restore backup

# Spikes (backend exploration)
/ui {project} --spike "check API shape"

# Graduation (when autonomous work needed)
/ui {project} --spec-ready           # Transition to /spec for invisible decisions
```

---

## The Flow

```
MODE A: EXPLORATION (--explore)
────────────────────────────────
/ui {project} --explore "feature"
    ↓
PHASE 0: GENERATE 5 DIRECTIONS
1. CONTEXT: Understand purpose, audience, constraints
2. GENERATE: 5 distinct aesthetic directions (ui-ux-pro-max design-system principles)
3. PRESENT: Show lightweight demos with descriptions
4. CHOOSE: User picks one → "go with #3"
    ↓
→ Continues to PHASE 1 below with chosen aesthetic foundation


MODE B: DIRECT CONSTRUCTION (default)
──────────────────────────────────────
/ui {project} "feature"
    ↓
PHASE 1: ORIENT → EXPLORE
1. INIT: Create .memory/ if first use (see _task_lifecycle.md)
2. READ: .memory/ → context, lessons, patterns
3. ORIENT: Read codebase, patterns, existing components
4. EXPLORE: Open app, see current state, find similar patterns
5. OUTPUT: Context gathered, ready to build
    ↓
PHASE 2: BUILD (iterative)
6. BUILD: Production component/page (not prototype)
    ↓
7. SHOW: Human sees it running in browser
    ↓
8. ITERATE: Human critiques, OpenCode refines
    ↓
9. CAPTURE: As flows settle, append to CONTRACTS.md
    ↓
10. REPEAT: Until human says "this is right"
    ↓
11. DONE: Update .memory/context.md (where we left off) → production-ready


OPTIONAL: --spec-ready
──────────────────────
If human wants autonomous maintenance later:
/ui {project} --spec-ready
    ↓
Transitions to /spec for invisible decisions
(auth, caching, data sources, error strategies)
    ↓
/spec uses CONTRACTS.md as input
```

---

## Exploration Mode (--explore)

**Use when**: You need to see multiple aesthetic directions before committing (landing pages, hero sections, marketing sites, etc.)

```bash
# Auto-detect stack from project
/ui {project} --explore "landing page for AI startup"

# Specify stack explicitly
/ui {project} --explore "landing page" --stack "React, TypeScript, Tailwind, Framer Motion"

# New project (no existing codebase)
/ui --explore "portfolio site" --stack "HTML, CSS, vanilla JS"
```

**Workflow** (Human-In-Loop):

```
PHASE 0: EXPLORATION (Fast Prototypes)
───────────────────────────────────────
1. CONTEXT: Understand purpose, audience, constraints

2. GENERATE: Create 5 distinct aesthetic directions
   → Quick prototypes in HTML/CSS/JS (fast to generate)
   → Focus on aesthetic, not production tech

3. PRESENT: Show 5 directions with:
   - Aesthetic description & rationale
   - Live demo/screenshot
   - Prototype code (HTML/CSS/JS)

4. CHOOSE: User picks one
   → "go with #3"

PHASE 0.5: PRODUCTION STACK (Context-Based Recommendation)
───────────────────────────────────────────────────────────
5. ANALYZE CONTEXT: Based on project needs, recommend production stack
   → Examine: project type, existing deps, team patterns, performance needs
   → Explain reasoning for each recommendation

6. RECOMMEND STACK (HIL):

   "For production, based on your context:

   **Detected**: Next.js project, team uses TypeScript
   **This aesthetic needs**: Complex scroll animations, smooth transitions

   **Recommended Stack**:
   - ✅ Next.js + TypeScript (existing project base)
   - ✅ Tailwind (existing design system)
   - ✅ GSAP + ScrollTrigger
     - WHY: Maximalist aesthetic needs precise scroll-triggered animations
     - Bundle: ~45KB gzipped
     - Alternative: Framer Motion (simpler API, ~35KB, less scroll control)
   - ✅ Lucide Icons (matches aesthetic better than existing Font Awesome)
     - WHY: Cleaner, more modern icon set fits retro-futuristic theme

   Use this stack or adjust?"

7. USER APPROVES/ADJUSTS (HIL):
   → "use that"
   → "swap GSAP for Framer Motion"
   → "no animation library, CSS only"
   → Can ask: "why GSAP?", "bundle size impact?", "compare GSAP vs Framer?"

8. TRANSITION: Build production code with approved stack

PHASE 1-2: Standard /ui flow continues
──────────────────────────────────────
Build production code → iterate with human feedback
```

### Context-Based Stack Recommendations

**After user picks aesthetic**, analyze context to recommend production stack:

**Context signals analyzed**:

| Signal | What It Tells | Impact on Recommendation |
|--------|---------------|-------------------------|
| **Project type** | Marketing site vs app vs docs | Next.js (marketing) vs Vite (app) vs Astro (docs) |
| **Existing deps** | package.json | Match existing (TypeScript if TS project) |
| **Team patterns** | Existing code style | Follow conventions (Tailwind if already used) |
| **Performance needs** | Page type, audience | Static gen (Astro) vs SSR (Next.js) vs SPA (Vite) |
| **Aesthetic complexity** | Chosen direction | GSAP (complex) vs Framer (medium) vs CSS (simple) |
| **Bundle concerns** | Mobile-first? | Prefer lighter libs, CSS-only animations |
| **Team size** | Solo vs team | TypeScript + Zod (team), JS (solo rapid) |

**Example analysis**:

```markdown
## Context Analysis

**Detected**:
- Project type: Marketing landing page (static content, SEO-critical)
- Existing stack: Next.js 15, TypeScript, Tailwind
- Team pattern: Uses Zod for validation, TanStack Query for data
- Aesthetic: Maximalist Chaos (complex scroll animations, dense content)
- Target: Mobile-first (bundle size matters)

**Recommendations**:
- ✅ Keep Next.js (SSR for SEO, already in project)
- ✅ Keep TypeScript + Tailwind (team convention)
- ✅ Add GSAP + ScrollTrigger
  - WHY: Aesthetic needs precise scroll-triggered animations
  - TRADE-OFF: +45KB but critical for this aesthetic
  - ALTERNATIVE: Framer Motion (~35KB, less scroll control)
- ⚠️ Skip heavy UI library (aesthetic is custom, save bundle)
- ✅ Lucide Icons (~5KB) vs Font Awesome (~70KB)

**Ask user**: "Use GSAP (best for aesthetic, +45KB) or Framer Motion (good enough, lighter)?"
```

**What to specify**:

| Category | Examples |
|----------|----------|
| **Framework** | Next.js, Astro, React, Vue, Svelte, Solid, Remix, vanilla JS |
| **Language** | TypeScript, JavaScript |
| **Styling** | Tailwind, CSS Modules, styled-components, Emotion, vanilla CSS, Sass |
| **Animation** | Framer Motion, GSAP, CSS animations, Motion One, React Spring |
| **UI Library** | shadcn/ui, Radix, Headless UI, Material UI, Ant Design, Chakra, Mantine |
| **Validation** | Zod, Yup, Valibot |
| **State** | Zustand, Jotai, Redux, TanStack Query, SWR |
| **Icons** | Lucide, Heroicons, Phosphor, Font Awesome, Tabler Icons |

**Code snippets use your stack**: All 5 directions show code in your actual tech stack, not generic examples.

### The 5 Aesthetic Directions

**Requirements**:
- **Distinct**: Each should feel completely different (not variations on a theme)
- **Bold**: Commit to extreme aesthetic choices (per ui-ux-pro-max recommendations)
- **Contextual**: Match the purpose/audience, not generic
- **Production-viable**: Real code snippets, not just mockups
- **Memorable**: Each should have ONE unforgettable element

**Example directions for "AI startup landing page"**:

1. **Brutally Minimal**: Monochrome, massive typography, aggressive whitespace, stark geometric shapes
2. **Maximalist Chaos**: Dense information, overlapping layers, vibrant gradients, animated data visualizations everywhere
3. **Retro-Futuristic**: 80s sci-fi aesthetic, neon grids, CRT scan lines, terminal-style interfaces
4. **Organic/Natural**: Soft curves, nature-inspired palettes, fluid animations, handwritten fonts
5. **Industrial/Utilitarian**: Blueprint aesthetic, technical diagrams, monospace fonts, grid systems

**Presentation format**:

```markdown
## Direction #1: [Name]

**Aesthetic**: [One-line description]
**Tone**: [Emotional impact]
**Unforgettable Element**: [The one thing they'll remember]

**Base Stack**: Next.js + TypeScript + Tailwind (from project)

**Recommended Additions**:
- ✅ **Framer Motion** - Smooth reveal animations, staggered content entry
  - Why: Complex orchestrated animations need declarative API
  - Alternative: React Spring (more physics-based feel)
- ✅ **@fontsource/space-grotesk** - Display font with character
  - Why: Geometric aesthetic needs technical-feeling typeface
- ✅ **Lucide Icons** - Minimal, consistent icon set
  - Why: Matches clean aesthetic better than Font Awesome

**Key Techniques**:
- Typography: Space Grotesk (display) + Inter (body)
- Color: Monochrome with single accent (CSS variables)
- Motion: Entrance animations on scroll (Framer Motion + Intersection Observer)
- Layout: Asymmetric grid with generous whitespace

[Live demo URL or screenshot]

**Code Preview**:
```tsx
'use client'
import { motion } from 'framer-motion'
import { SparklesIcon } from 'lucide-react'

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center"
    >
      <h1 className="font-space-grotesk text-7xl">
        Minimal <span className="text-cyan-500">Impact</span>
      </h1>
    </motion.div>
  )
}
```

**Install**:
```bash
npm install framer-motion @fontsource/space-grotesk lucide-react
```
```

### Human-In-Loop Questions

After presenting 5 directions, user can ask:

| Question | Example | Response |
|----------|---------|----------|
| **Why this library?** | "Why GSAP for #2?" | "Maximalist aesthetic needs complex scroll-triggered animations. GSAP's ScrollTrigger excels here. Framer Motion would require more custom code." |
| **Can I swap?** | "Use Framer Motion instead?" | "Yes! Trade-off: Simpler API but less scroll control. I'll adjust the code." |
| **What if I don't want X?** | "No animation libraries?" | "Understood. I'll use CSS animations only. Some effects will be simpler but page weight drops significantly." |
| **Compare libraries** | "GSAP vs Framer Motion?" | [Shows comparison table: learning curve, bundle size, use cases] |
| **Cost implications?** | "Bundle size impact?" | "Framer Motion: ~35KB gzipped. GSAP: ~45KB. CSS only: 0KB. Here's the trade-off..." |

### After User Picks

**User says**: "go with #3"

**Transition**:
1. Take the chosen direction's aesthetic foundation
2. Build full production implementation
3. Continue with standard /ui iteration (BUILD → SHOW → FEEDBACK)
4. Maintain aesthetic coherence through iterations
5. Capture to CONTRACTS.md as UI settles

**Design System Capture**: Add chosen direction's foundations to `.memory/patterns.md`:
```markdown
## Design System: [Project Name]

**Aesthetic Direction**: [Chosen direction name]
**Core Principles**: [Key aesthetic decisions]
**Typography**: [Font stack]
**Color System**: [CSS variables]
**Motion**: [Animation approach]
```

### Integration with ui-ux-pro-max Skill

The `--explore` mode uses principles from the `ui-ux-pro-max` skill:

| Principle | How --explore Uses It |
|-----------|----------------------|
| **Design Thinking** | Forces aesthetic direction choice upfront |
| **Bold Commitment** | Each direction commits to an extreme, not safe middle |
| **Anti-Generic** | Avoids Inter/Roboto, purple gradients, cookie-cutter patterns |
| **Contextual** | Designs match purpose/audience, not generic templates |
| **Unforgettable** | Each direction has ONE memorable element |

**Key difference**: `ui-ux-pro-max` is design-system-first (pattern, style, colors, typography, UX checks). `--explore` generates 5 directions for side-by-side comparison, THEN commits to one production direction.

---

## Spikes

Sometimes during /ui you realize "I can't mock this — I need to know if the real API even returns this shape." That's a **spike**: a quick, throwaway backend exploration to answer a factual question.

```bash
/ui {project} --spike "check what Yahoo API returns"
```

**What a spike IS:**
- Quick exploration (curl, test request) — **max 15 minutes**
- Answers factual question about real system
- Updates mock/CONTRACTS.md with reality

**What a spike is NOT:**
- /spec (no decision to make yet)
- /run (no goal to execute)
- Implementation (throwaway exploration only)

**Spike protocol:**
1. State the question clearly
2. Make the request (curl, API call)
3. Capture actual response shape
4. Update CONTRACTS.md with reality
5. Return to /ui iteration

After spike: back to /ui iteration with real knowledge.

---

## Iteration Protocol

**Human stays in loop.** Respond to feedback immediately.

| Signal | Meaning | Action |
|--------|---------|--------|
| "hmm..." | Uncertain | Ask clarifying question |
| "make X blue" | Direct change | Do it now, show result |
| "try it differently" | Wants alternative | Show 2-3 options |
| "this is right" | Done | Mark complete, finalize contracts |
| "let's spec this" | Wants autonomous | Run --spec-ready |

**No batching.** Human gives feedback → OpenCode responds → iterate.

**Conflicting feedback:** If new feedback contradicts earlier approval, ask: "Earlier you approved X. Should I revert that, or keep it and also do Y?"

---

## CONTRACTS.md Checkpoint (MANDATORY)

**After every 3-5 iterations, STOP and check:**

```
⚠️  CONTRACTS.md CHECKPOINT
─────────────────────────────
1. Has any data shape been finalized? → Update Data Shapes
2. Has any UI behavior been agreed? → Update UI States
3. Has any interaction pattern settled? → Update UI Flows
4. Have we established color/status meanings? → Update Color Coding
5. Did human choose between options? → Update Decisions (with implications)
6. Does this UI choice imply backend needs? → Update Backend Requirements

If ANY answer is YES → Update CONTRACTS.md NOW before continuing
```

**Capture signals:**
| Signal | Action |
|--------|--------|
| Mock data finalized | Add Data Shape |
| Fetch call working | Add Action to UI States |
| State transitions stable | Add to UI Flows |
| User said "this flow is right" | Capture that flow |
| Human chose X over Y | Add to Decisions (with implications) |
| UI choice implies API need | Add to Backend Requirements |

**Don't capture** during active iteration, before human approves, or for throwaway experiments.

> **Note:** "No batching" (above) means respond to each feedback immediately. This checkpoint is a periodic review — different concerns.

---

## Backup System

Before structural changes: copy to `{file}.backup.{ext}`. On rollback: restore and show previous state. Keep one backup level only.

---

## --spec-ready Mode

When human wants autonomous maintenance:

```bash
/ui {project} --spec-ready
```

This transitions to `/spec`:
1. CONTRACTS.md already exists (from /ui iteration)
2. /spec walks through invisible decisions (data sources, caching, auth, error handling)
3. /spec outputs SPECS.md with intent + decisions + judgment boundaries
4. /run can then maintain the code autonomously

**Suggest --spec-ready proactively when:**
- >10 iterations and complexity growing
- Backend complexity emerging (auth, caching, multiple data sources)
- Human asks "can this run overnight?" or "can you maintain this?"

**Key distinction:**
- CONTRACTS.md = what the user sees (from /ui)
- SPECS.md = invisible decisions that support it (from /spec)

---

## Guardrails

```
/ui MUST:
✓ Read codebase before building
✓ Output production code (not prototypes)
✓ Match project's stack/conventions
✓ Keep human in loop throughout
✓ Backup before structural changes
✓ Emit CONTRACTS.md as flows settle

/ui NEVER:
✗ Create throwaway HTML files
✗ Guess data shapes (use spikes if needed)
✗ Skip context gathering
✗ Batch feedback (respond immediately)
✗ Create SPECS.md directly (that's /spec's job)
```

---

## Self-Validation

**Before building:**
```
□ Codebase explored?
□ Similar components found?
□ Data contracts verified (or spike needed)?
□ Design system understood?
```

**During iteration:**
```
□ Human sees each change?
□ Feedback addressed immediately?
□ Backups made for structural changes?
□ CONTRACTS.md updated as flows settle?
```

**Before completing:**
```
□ All states handled (default/empty/error/loading)?
□ Human said "this is right"?
□ Code matches project conventions?
□ CONTRACTS.md captures all observable promises?
```

**If --spec-ready:**
```
□ CONTRACTS.md complete?
□ Ready to transition to /spec?
□ Human understands /spec will capture invisible decisions?
```

---

## Compared to Other Commands

| Command | Purpose | Human Involvement | Outputs |
|---------|---------|-------------------|---------|
| **/ui** | Build UI with human iteration | Throughout | Code + CONTRACTS.md |
| **/spec** | Decide invisible behaviors | Structured debate | SPECS.md |
| **/goals** | Order work by risk | Steering + approval | GOALS.md |
| **/run** | Execute defined specs | Autonomous (checkpoints) | Code + STATE.md |
| **/dev** | Real-time development (any type) | Throughout | Code |

Use `/ui` when building UI features. Transition to `/spec` when autonomous work is needed.

> **Reference templates**: See `_reference_ui.md`
