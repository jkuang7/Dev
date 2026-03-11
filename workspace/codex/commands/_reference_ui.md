# _reference_ui.md - Detailed Templates & Examples

> **Used by**: `/ui` for templates and detailed procedures. Not loaded by default.

---

## Direct Construction Flow

```
1. ORIENT
   └── Explore codebase (patterns, conventions)
   └── Find similar components
   └── Verify data contracts (or mark for spike)
   └── Read design system

2. BUILD
   └── Output production code in project's stack
   └── Match existing patterns
   └── Handle all states

3. SHOW
   └── Human sees it in browser
   └── Dev server running

4. ITERATE
   └── Human gives feedback
   └── OpenCode applies immediately
   └── Backup on structural changes

5. CAPTURE
   └── As flows settle → append to CONTRACTS.md
   └── Data shapes, actions, state machines

6. REPEAT until "this is right"

7. DONE (or --spec-ready for /spec transition)
```

---

## Context Analysis Template

Before building ANYTHING:

```markdown
# Context Analysis: {project} - {feature}

## Codebase Patterns
- **Framework**: {React/Astro/Vue/etc}
- **Styling**: {Tailwind/CSS Modules/styled-components}
- **State**: {useState/Zustand/Redux/etc}
- **Components**: {path to similar components}

## Existing Similar Components
| Component | Location | Can Reuse? |
|-----------|----------|------------|
| {name} | {path} | {Yes/No - why} |

## Data Contracts
| Data | Source | Shape |
|------|--------|-------|
| {what} | {API/props/store} | {TypeScript interface or example} |

## Design Tokens
| Token | Value | Usage |
|-------|-------|-------|
| --primary | {color} | buttons, links |
| --spacing-md | {size} | gaps, padding |

## Project Conventions
- File naming: {pattern}
- Component structure: {pattern}
- Import style: {pattern}

## Spike Needed?
- [ ] API shape unknown → spike before mocking
- [ ] Data source unclear → spike to verify
```

---

## CONTRACTS.md Template

```markdown
# CONTRACTS.md

> Observable promises the UI makes. Data shapes, actions, state machines.
> Written by /ui as flows settle. Input for /spec.

**Project**: {project}
**Last updated**: {date}

---

## {ComponentName}

### Data Shape

```typescript
interface {ComponentName}Data {
  field1: string
  field2: number
  nested: {
    subfield: string[]
  }
}
```

Example response:
```json
{
  "field1": "value",
  "field2": 42,
  "nested": { "subfield": ["a", "b"] }
}
```

### Action: {ActionName}

**Trigger**: user {does what}
**Request**: {METHOD} {endpoint}
**States**: idle → loading → success | error

**Success**:
- {what happens on success}

**Error**:
- {what user sees on error}
- {retry mechanism if any}

**Timing**: {performance expectation}

### State Machine

```
{state1} → ({trigger}) → {state2} → ({trigger}) → {state3}
                                  → ({alt trigger}) → {altState}
```

### Empty State

"{Message shown when no data}"
{CTA if applicable}

---

## {AnotherComponent}

...
```

---

## Contract Entry Examples

### Data Shape: Stock Card

```markdown
### Data Shape

Response: { ticker, price, dcfValue, marginOfSafety, sparklineData[] }

```typescript
interface StockData {
  ticker: string           // "AAPL"
  price: number            // 178.50
  dcfValue: number         // 195.00
  marginOfSafety: number   // 0.085 (8.5%)
  sparklineData: {
    date: string           // ISO 8601
    close: number
  }[]
}
```

Example:
```json
{
  "ticker": "AAPL",
  "price": 178.50,
  "dcfValue": 195.00,
  "marginOfSafety": 0.085,
  "sparklineData": [
    { "date": "2024-01-15", "close": 175.20 },
    { "date": "2024-01-16", "close": 177.80 }
  ]
}
```
```

### Action: File Upload

```markdown
### Action: Upload File

**Trigger**: user drops file on dropzone or clicks upload button
**Request**: POST /api/files/upload (multipart/form-data)
**States**: idle → uploading → success | error

**Success**:
- File preview appears in list
- Toast: "File uploaded successfully"
- Dropzone returns to idle

**Error**:
- File too large (>10MB): "File exceeds 10MB limit"
- Invalid type: "Only PDF, PNG, JPG allowed"
- Network error: "Upload failed. Retry?" with retry button

**Timing**: Progress indicator for files >1MB
```

### State Machine: Comment Form

```markdown
### State Machine: Comment Form

```
idle → (focus input) → editing → (submit) → submitting → (success) → idle
                                                       → (failure) → editing (show error)
     → (blur empty) → idle
```

**Validation**:
- Empty: "Comment cannot be empty"
- Too long (>500 chars): "Comment too long ({n}/500)"

**Optimistic update**: Comment appears immediately, removed on failure
```

---

## Component Templates

### React/TypeScript

```typescript
import { useState } from 'react'

interface ${Name}Props {
  // Props from data contracts
}

type ${Name}State = 'default' | 'loading' | 'error' | 'empty'

export function ${Name}({ ...props }: ${Name}Props) {
  const [state, setState] = useState<${Name}State>('default')
  const [error, setError] = useState<string | null>(null)

  // Loading state
  if (state === 'loading') {
    return <div className="...">Loading...</div>
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="...">
        <p>Error: {error}</p>
        <button onClick={() => setState('default')}>Retry</button>
      </div>
    )
  }

  // Empty state
  if (state === 'empty') {
    return (
      <div className="...">
        <p>No data yet</p>
        {/* CTA to add first item */}
      </div>
    )
  }

  // Default state (happy path)
  return (
    <div className="...">
      {/* Main content */}
    </div>
  )
}
```

### Astro

```astro
---
interface Props {
  // Props from data contracts
}

const { ...props } = Astro.props

// Server-side data fetching if needed
---

<div class="component-wrapper">
  <!-- Default state -->
  <section data-state="default">
    <!-- Main content -->
  </section>

  <!-- Empty state -->
  <section data-state="empty" class="hidden">
    <p>No data yet</p>
  </section>

  <!-- Error state -->
  <section data-state="error" class="hidden">
    <p class="error-message"></p>
    <button data-retry>Retry</button>
  </section>

  <!-- Loading state -->
  <section data-state="loading" class="hidden">
    <div class="spinner"></div>
  </section>
</div>

<script>
  // Client-side interactivity
</script>

<style>
  /* Scoped styles */
</style>
```

---

## State Handling Checklist

Before marking complete:

```
□ DEFAULT STATE
  - [ ] Happy path renders correctly
  - [ ] All data displays as expected
  - [ ] Actions are clickable/functional

□ EMPTY STATE
  - [ ] Shows when no data
  - [ ] Helpful message (not just "empty")
  - [ ] CTA to create first item (if applicable)

□ LOADING STATE
  - [ ] Shows during async operations
  - [ ] Prevents double-submission
  - [ ] Accessible loading indicator

□ ERROR STATE
  - [ ] Shows on failure
  - [ ] Error message is user-friendly
  - [ ] Retry action available
  - [ ] Doesn't lose user's input
```

---

## Spike Protocol

When you hit "I can't mock this":

```markdown
## Spike: {what you need to know}

**Question**: {specific factual question}

**Method**:
- [ ] curl {endpoint}
- [ ] Check API docs
- [ ] Test with real credentials

**Result**:
{actual response shape}

**Update**:
- [ ] Mock data updated
- [ ] CONTRACTS.md updated with real shape
- [ ] Back to /ui iteration
```

### Spike vs Full Investigation

| Need | Use |
|------|-----|
| "What shape does this API return?" | Spike (quick curl) |
| "Why is this endpoint failing?" | /debug |
| "Which caching strategy should we use?" | /spec decision |
| "How should this component behave?" | /ui iteration |

---

## Iteration Protocol Details

### Feedback Response Matrix

| Feedback Type | OpenCode Action | Backup? | Contract Update? |
|---------------|---------------|---------|------------------|
| "hmm..." | Ask what's wrong | No | No |
| "make X blue" | Change immediately | No | No |
| "move X to Y" | Change immediately | No | No |
| "add a button for Z" | Add feature | No | No |
| "reorganize the layout" | Show options first | Yes | No |
| "change how X works" | Confirm understanding | Yes | Maybe |
| "I don't like this approach" | Show alternatives | Yes | No |
| "this flow is right" | Confirm done | No | Yes |
| "this is right" | Mark complete | No | Yes (finalize) |

### Backup Triggers

Always backup before:
- Changing layout structure
- Modifying data flow
- Removing existing features
- Refactoring component structure

### Showing Alternatives

When user says "try it differently":

```markdown
## Alternatives for {feature}

### Option A: {approach}
- Pros: {benefits}
- Cons: {drawbacks}
[Show code snippet or screenshot]

### Option B: {approach}
- Pros: {benefits}
- Cons: {drawbacks}
[Show code snippet or screenshot]

### Option C: {approach}
- Pros: {benefits}
- Cons: {drawbacks}
[Show code snippet or screenshot]

Which direction do you prefer?
```

---

## --spec-ready Transition

When human runs `/ui {project} --spec-ready`:

```markdown
## Transition to /spec

CONTRACTS.md is ready:
- [ ] All data shapes captured
- [ ] All actions documented
- [ ] All state machines defined
- [ ] Empty/error states specified

Transitioning to /spec for invisible decisions:
- Data sources (where does the data come from?)
- Caching strategy (how long to cache?)
- Auth model (who can access?)
- Error handling (retry logic, fallbacks)
- Performance (timeouts, rate limits)

/spec will read CONTRACTS.md and walk through each decision area.
```

---

## Entry Mode Details

### New Feature
```bash
/ui blog "comments section"
```
- Explore existing blog codebase
- Find similar components (e.g., existing forms, lists)
- Build comment component matching existing patterns
- Iterate with human
- Capture contracts as flows settle

### Resume
```bash
/ui blog
```
- Read CONTRACTS.md for current state
- Show current component status
- Continue where left off

### Focus
```bash
/ui blog --focus "comment form"
```
- Isolate just that part of the component
- Changes scoped to focused area
- Merge back when done

### Spike
```bash
/ui blog --spike "check comment API response"
```
- Quick backend exploration
- Answer factual question
- Update contracts with reality
- Return to iteration

### Alternative
```bash
/ui blog --alt
```
- Keep current implementation
- Show 2-3 alternative approaches
- Human picks direction

### Rollback
```bash
/ui blog --rollback
```
- Restore from backup
- Show diff of what was lost
- Confirm before proceeding

---

## Full Self-Validation

**Before building:**
```
□ Codebase explored with Task agent?
□ Similar components identified?
□ Data contracts from actual API/props (or spike needed)?
□ Design tokens documented?
□ Project conventions understood?
```

**During iteration:**
```
□ Human can see changes in browser?
□ Feedback addressed immediately (no batching)?
□ Backups created for structural changes?
□ All four states handled (default/empty/error/loading)?
□ CONTRACTS.md updated as flows settle?
```

**Before marking complete:**
```
□ Human explicitly said "this is right"?
□ Component matches project conventions?
□ Code is production-quality (not prototype)?
□ No console.logs or debug code?
□ CONTRACTS.md captures all observable promises?
```

**If --spec-ready:**
```
□ All data shapes in CONTRACTS.md?
□ All actions documented?
□ All state machines defined?
□ Ready for /spec to capture invisible decisions?
```

---

## Common Patterns

### Form with Validation
```typescript
const [errors, setErrors] = useState<Record<string, string>>({})
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  setErrors({})

  const validation = validate(formData)
  if (!validation.ok) {
    setErrors(validation.errors)
    setIsSubmitting(false)
    return
  }

  try {
    await submitData(formData)
    // Success handling
  } catch (err) {
    setErrors({ form: err.message })
  } finally {
    setIsSubmitting(false)
  }
}
```

### List with Empty/Loading States
```typescript
if (isLoading) return <Skeleton count={5} />
if (items.length === 0) return <EmptyState cta="Add first item" />
return (
  <ul>
    {items.map(item => <Item key={item.id} {...item} />)}
  </ul>
)
```

### Modal Pattern
```typescript
const [isOpen, setIsOpen] = useState(false)

// Trap focus, ESC to close
useEffect(() => {
  if (!isOpen) return
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false)
  }
  document.addEventListener('keydown', handleEsc)
  return () => document.removeEventListener('keydown', handleEsc)
}, [isOpen])
```

---

## Complexity Reduction

**Before adding ANY element, ask: "Does the user need this?"**

| SHOW | HIDE |
|------|------|
| Status through visual state (colors, icons) | Internal booleans |
| Error messages when relevant | Debug information |
| Actions user can take | Implementation details |
| Final outputs | Intermediate states |

**Rules:**
1. Success = visual state change (not toast)
2. Failure = inline error (not console)
3. Status = component appearance (not dashboard)
4. Progress = loading indicator (not percentage unless meaningful)

---

## Contract Capture Timing

```
Iteration phase:     Don't capture (things are changing)
                            ↓
Flow stabilizes:     "This data shape is right" → capture Data Shape
                            ↓
Action confirmed:    "This is how refresh works" → capture Action
                            ↓
States approved:     "Empty/error look good" → capture State Machine
                            ↓
Human: "this is right"      → finalize all contracts
                            ↓
--spec-ready:        CONTRACTS.md complete, transition to /spec
```

**Key insight**: Contracts are extracted from working code, not designed upfront. The mock data you build during iteration IS the data shape. The fetch calls you wire up ARE the actions.
