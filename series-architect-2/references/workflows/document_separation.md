# Document Separation Principle

**CRITICAL: Separate workflow tracking from creative content to minimize token overhead**

## Three Core Documents

### 1. Intake Form (`outputs/intake_form.md`) - **WORKFLOW TRACKER**

**Purpose:** Session management, progress tracking, decision audit trail

**Use template:** `templates/intake_form_template_lean.md`

**Contains ONLY:**
- Decision status checkboxes (what stages are complete)
- Basic parameters (numbers: books, chapters, word counts)
- Genre/heat/violence labels (just the numbers/categories)
- What was selected (which template, which beat sheet, which approach)
- When decisions were made (dates)
- Next actions and session plan
- File references

**Does NOT contain:** Creative details, rationale, character info, world-building

**Update frequency:** Before each stage transition

**Why it exists:** Quick scannable dashboard of workflow progress

---

### 2. Series Framework (`outputs/series_framework.md`) - **CREATIVE BLUEPRINT**

**Purpose:** All creative decisions and detailed planning

**Use template:** `templates/series_overview_template.md`

**Contains:**
- Series title, logline, premise, series question
- Supernatural species/world details
- Core tropes with implementation strategies
- Series structure with couple breakdowns
- Overarching conflict details
- Character architecture (series-level)
- World-building elements
- 6-book escalation pattern
- Universal fantasies mapping
- Market differentiation strategy
- All creative depth and rationale

**Does NOT contain:** Workflow progress tracking

**Update frequency:** Fill in as stages progress (Stage 3 adds most content)

**Why it exists:** Single source of truth for all creative decisions

---

### 3. Memory.json (`outputs/memory.json`) - **STATE & RESUME**

**Purpose:** Session state, resume instructions, lean changelog

**Contains:**
- Current stage and workflow position
- Stage status summaries (one-line status per stage)
- Key decisions (compact list, no detailed rationale)
- Files generated
- Resume instructions (where to pick up next session)
- User workflow style signals
- Changelog (key events only, not detailed play-by-play)

**Does NOT contain:** Detailed creative content (that's in series_framework.md)

**Update frequency:** After each major decision, before stage transitions

**Why it exists:** Session continuity and resume capability

---

## Why This Separation Matters

### Token Efficiency
**Problem:** Storing same information in multiple places
- Old approach: Creative details in intake form + memory.json + series framework
- Result: 2-3x token usage for same information

**Solution:** Each piece of information stored once
- Intake form: Workflow tracking ONLY
- Memory.json: State + resume ONLY
- Series framework: Creative details ONLY
- Result: ~60% token reduction

### Maintainability
**Problem:** Updating decisions requires changing multiple files
- Old approach: Change trope decision in 3 places
- Result: Easy to miss one, create inconsistency

**Solution:** Update in one place
- Creative decision → Update series_framework.md only
- Workflow progress → Update intake_form.md only
- Session state → Update memory.json only
- Result: Single source of truth per information type

### Clarity
**Problem:** Intake form bloated with creative details
- Old approach: 350-line intake form mixing workflow + creative
- Result: Hard to scan for workflow status

**Solution:** Focused purpose per file
- Intake form: ~125 lines, pure workflow
- Series framework: ~400 lines, pure creative
- Memory.json: ~70 lines, pure state
- Result: Each file optimized for its purpose

---

## Document Generation Timing

### Stage 1: Intake & Assessment
**Generate:**
- `outputs/intake_form.md` from `templates/intake_form_template_lean.md`
- `outputs/series_framework.md` stub from `templates/series_overview_template.md`
- `outputs/memory.json` with initial state

**Why:** Establish workflow tracking and creative repository from start

### Stage 2: Research
**Update:**
- `outputs/intake_form.md` - Mark research complete
- `outputs/memory.json` - Record research approach and completion

**Generate:**
- `outputs/[genre]_market_research.md` - Research findings

### Stage 3: Series Framework
**Update:**
- `outputs/series_framework.md` - Fill in all series-level creative decisions
- `outputs/intake_form.md` - Mark framework complete
- `outputs/memory.json` - Record framework completion

### Stage 4-6: Continue pattern
**Always update:**
- Intake form (workflow progress)
- Memory.json (state changes)

**Generate as needed:**
- Stage-specific outputs (dossiers, beat outlines, final files)

---

## Cross-Reference Strategy

**Intake form references:**
- "Output file: `series_framework.md`" (points to creative details)
- "Research output: `mm_supernatural_romance_market_research.md`"
- "Memory/state: `memory.json`"

**Memory.json references:**
- `"context_files"` array lists all relevant files
- Resume instructions reference which files to load

**Series framework stands alone:**
- Contains all creative content self-sufficiently
- No dependencies on other files
- Can be read independently for creative reference

---

## Token Overhead Comparison

### Old Approach (Redundant)
```
intake_form.md: 350 lines (workflow + creative details)
memory.json: 160 lines (state + creative details + verbose changelog)
series_framework.md: 407 lines (creative details)
Total: ~917 lines, significant redundancy
```

### New Approach (Separated)
```
intake_form.md: 125 lines (workflow only)
memory.json: 70 lines (state + resume only)
series_framework.md: 407 lines (creative only)
Total: ~602 lines, zero redundancy
```

**Savings:** ~35% reduction in total file size, ~60% reduction in redundant content
