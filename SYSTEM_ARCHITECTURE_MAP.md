# MARKET-DRIVEN SERIES PRODUCTION SYSTEM
## Architecture Map & Updated Process Flow

**Last Updated:** 2024-11-28
**Version:** 2.0 (Genre-Aware + Multi-Layer NPE Validation)

---

## KEY UPDATES IN VERSION 2.0

1. **Genre Pack Creation** - Market Research Agent creates genre packs for new genres
2. **Trope Research with Required Scenes** - Deep research stored in MCP
3. **Genre-Aware Series Architect** - Uses genre-specific patterns, relationship-flexible
4. **Multi-Layer NPE Validation** - "Big rocks" validated before writing, "sand" during writing
5. **Corrected MCP Workflow** - Database commit only AFTER Writing Team review + user approval

---

## COMPLETE 13-PHASE PIPELINE

```
Phase 0: Genre Pack Check & Creation (if needed)
    ↓
Phase 1: Market Research + Trope Research
    ↓
Phase 2: Genre Pack Selection
    ↓
Phase 3: Series Architect (BIG ROCKS - genre-aware)
    ↓
Phase 4: SERIES-LEVEL NPE VALIDATION (Big Rocks Gate)
    ↓
Phase 5: Commercial Validation
    ↓
Phase 6: Writing Team Review & Refinement
    ↓
Phase 7: User Review & Approval
    ↓
Phase 8: MCP Database Commit (ONLY AFTER APPROVAL)
    ↓
Phase 8.5: Book Iteration Orchestrator (NEW - Multi-Book Loop Start)
    ↓
┌───▼──────────────────────────────────────┐
│ FOR EACH BOOK (1-5):                     │
│                                          │
│  Phase 9: Chapter Planning (Dynamic)     │
│      ↓                                   │
│  Phase 10: Scene-Level NPE Validation    │
│      ↓                                   │
│  Phase 11: Writing Execution             │
│      ↓                                   │
│  Phase 11.5: Book Completion Check       │
│      ↓                                   │
│  IF more books: → Return to Phase 8.5    │
│  IF complete: → Exit loop                │
└──────────────────────────────────────────┘
    ↓
Phase 12: Series Finalization
```

---

## PHASE-BY-PHASE DETAIL

### Phase 0: Genre Pack Check & Creation (NEW)

**Agent:** Market Research Agent
**Trigger:** User provides concept in genre without existing genre pack
**Process:**
```
Market Research Agent checks: `.claude/genre-packs/{genre-slug}/`

IF genre pack EXISTS:
    → Load and proceed to Phase 1

IF genre pack MISSING:
    → Ask user: "Create genre pack for [Genre]?"
    → IF YES:
        1. Research genre conventions (WebSearch)
        2. Analyze 5-10 comp titles for patterns
        3. Generate genre pack files:
           - manifest.json (genre characteristics, escalation pattern)
           - beat-sheets/series-arc-integration.md
           - templates/protagonist-template.md
           - templates/setting-template.md
           - style-guides/genre-voice.md
           - npe-physics/ (copy from _TEMPLATE_, customize)
        4. Store in `.claude/genre-packs/{genre-slug}/`
        5. Proceed to Phase 1
```

**Output:**
- ✅ Genre pack loaded or created
- ✅ Genre-specific escalation patterns available
- ✅ Character/setting templates ready

**MCP:** No database interaction (genre packs are files)

---

### Phase 1: Market Research + Trope Research

**Agent:** Market Research Agent
**Input:** Concept + genre pack (from Phase 0)
**Process:**
```
1. Analyze concept and confirm genre
2. Research 5-7 comp titles with performance data
3. DEEP TROPE RESEARCH (NEW):
   For each trending trope:
   a. Search MCP: mcp__list_tropes(search_query: "trope name")
   b. IF EXISTS: Update with new research
   c. IF NEW: Create with required scenes
   d. Research required scenes:
      - Opening scene (timing, validation criteria, examples)
      - Middle scene(s) (timing, validation criteria, examples)
      - Closing scene (timing, validation criteria, examples)
   e. Document reader expectations and common pitfalls
   f. Store/update in MCP:
      mcp__create_trope() OR mcp__update_trope()

4. Identify market gaps and opportunities
5. Score commercial viability (0-10)
```

**Output:**
- Market research report
- 10-15 trending tropes with required scenes stored in MCP
- Commercial viability assessment

**MCP:** ✅ **Stores tropes with required scenes** in series-planning-server

---

### Phase 2: Genre Pack Selection

**Process:** Genre pack already loaded from Phase 0, confirmed in Phase 1

**Output:**
- Genre characteristics confirmed
- Escalation pattern loaded
- Templates accessible

---

### Phase 3: Series Architect (BIG ROCKS - Genre-Aware)

**Agent:** Series Architect Agent
**Input:** Market research + genre pack + tropes from MCP
**Process:**
```
1. Load genre pack manifest.json
2. Extract genre characteristics:
   - primary_genre (determines if romance required)
   - protagonist_archetype (from template)
   - core_conflict (from genre conventions)
   - escalation_pattern (genre-specific, NOT hardcoded)

3. Plan WORLDBUILDING ARCHITECTURE:
   - Define world rules with explicit limitations
   - Establish consistency requirements
   - Magic/tech system boundaries

4. Plan CHARACTER ARCS (5 books):
   - Protagonist: motivation, fear, flaw, transformation
   - Deuteragonist: parallel arc (NOT automatic love interest)
   - Antagonist: escalation or redemption
   - V1 behavioral palette (core identity)

5. Plan RELATIONSHIP PROGRESSIONS (ALL TYPES):
   - Romantic (ONLY if primary_genre = "Romance" OR concept specifies)
   - Friendships/partnerships
   - Rivalries
   - Mentorships
   - Family bonds
   - Trust level progression (-10 to +20 scale)
   - Bridge events earning each change

6. Plan TROPE EXECUTION:
   - Load tropes from MCP: mcp__get_trope(trope_id)
   - Get required scenes (opening/middle/closing)
   - Plan where each required scene occurs (book, chapter range)
   - Define execution approach (how to make it fresh)
   - Record usage: mcp__create_trope_instance()

7. Design 5-BOOK STRUCTURE:
   - Apply GENRE-SPECIFIC escalation pattern
   - Book-level conflicts (NOT chapter-level)
   - Character arc distribution
   - Cliffhangers between books

8. Build BOOK-LEVEL SETUP/PAYOFF REGISTRY:
   - Major setups from Books 1-3
   - Payoffs by Book 5
   - Track dangling threads
```

**Output:**
- Series architecture document (book-level detail)
- Worldbuilding rules
- Character arcs with motivations/fears/flaws
- Relationship progressions with trust tracking
- Trope execution plan with required scene placements
- 5-book structure (book-level, NOT chapter-level)
- Setup/payoff registry

**MCP:** ✅ **Records trope usage** in series-planning-server
**MCP:** ❌ **Does NOT store series structure yet** (waits for approval)

---

### Phase 4: SERIES-LEVEL NPE VALIDATION (Big Rocks Gate) ⭐ NEW

**Agent:** NPE Series Validator Agent
**Input:** Series architecture + genre pack + tropes from MCP
**Process:**
```
Validates 7 categories at SERIES/BOOK level (NOT scene-level):

1. CHARACTER ARC LOGIC (20% weight):
   - Motivation, fear, flaw defined and addressed?
   - Transformation earned through major events?
   - V1 behavioral palette consistent?
   - Character knowledge tracking (book-level)

2. RELATIONSHIP PROGRESSION LOGIC (15% weight):
   - Trust levels change realistically (±3 max per book)?
   - Bridge events earn each change?
   - Genre-appropriate relationships?
   - Progression aligns with character arcs?

3. TROPE EXECUTION VALIDATION (20% weight):
   - Required scenes present (opening/middle/closing)?
   - Validation criteria met from MCP?
   - Placement timing appropriate?
   - Tropes compatible?

4. PLOT THREAD COHERENCE (15% weight):
   - Setup/payoff registry complete?
   - Book-level conflicts resolve?
   - Standalone satisfaction + series arc?
   - Cliffhangers organic?

5. WORLDBUILDING CONSISTENCY (10% weight):
   - World rules defined with limitations?
   - No violations across 5 books?
   - Complexity appropriate for genre?

6. STAKES ESCALATION LOGIC (10% weight):
   - Genre-appropriate escalation from genre pack?
   - Stakes escalate book-to-book?
   - Stakes remain personal to characters?

7. INFORMATION ECONOMY (10% weight):
   - Revelation cascade across 5 books?
   - Fair-play clues for readers?
   - No deus ex machina information?

Calculate overall score (0-100):
  score = (cat1*0.20) + (cat2*0.15) + (cat3*0.20) + (cat4*0.15) +
          (cat5*0.10) + (cat6*0.10) + (cat7*0.10)

IF score ≥ 80: PASS → Proceed to Phase 5
IF score < 80: FAIL → Return to Phase 3 (Series Architect) for revision
```

**Output:**
- Validation report (markdown)
- Overall score (0-100)
- Violation list with severity and fixes
- Pass/Fail decision

**MCP:** ❌ **No database storage** (validation metadata not stored)

**This is a QUALITY GATE** - Series cannot proceed without passing.

---

### Phase 5: Commercial Validation

**Agent:** Commercial Validator Agent
**Input:** Series architecture + market research + NPE score
**Process:**
```
1. Score 5 categories:
   - Market Fit (25%)
   - Trope Execution (20%)
   - Series Structure (25%)
   - Unique Angle (15%)
   - Reader Satisfaction (15%)

2. Use NPE score as input to Series Structure category
3. Risk assessment (Low/Medium/Critical)
4. Go/no-go recommendation
```

**Output:**
- Commercial viability score (0-10)
- Risk assessment
- Recommendation (APPROVE / REVISE / REJECT)

**MCP:** No database interaction

---

### Phase 6: Writing Team Review & Refinement ⭐ NEW

**Lead:** Miranda (Showrunner)
**Team:** Genre Specialist Agents (Detective Logan, Dr. Viktor, Professor Mira, etc.)
**Input:** Validated series structure + NPE report + commercial assessment
**Process:**
```
1. Miranda coordinates review of validated plan
2. Genre Specialist Agents review for accuracy:
   - Detective Logan (police procedural accuracy)
   - Dr. Viktor (psychological authenticity)
   - Professor Mira (worldbuilding consistency)
   - [Other genre-specific agents as needed]

3. Writing Team refines:
   - Character arcs (are they writable?)
   - Plot threads (do they work narratively?)
   - Scene possibilities (can this be executed?)
   - Trope execution (is it fresh enough?)

4. Team provides refinement notes
```

**Output:**
- Refined series plan
- Writing Team notes and recommendations
- Status: READY FOR USER REVIEW

**MCP:** ❌ **No database storage yet** (awaits user approval)

---

### Phase 7: User Review & Approval ⭐ CRITICAL GATE

**Process:**
```
1. User reviews all planning documents:
   - Market research report
   - Series architecture
   - NPE validation report (score, violations)
   - Commercial viability assessment
   - Writing Team refinement notes

2. User decides:
   - APPROVE → Proceed to Phase 8 (MCP Database Commit)
   - REQUEST REVISIONS → Return to appropriate phase
   - REJECT → End process

3. User authorizes MCP database storage
```

**Output:**
- User approval decision
- Authorization for database commit

**This is USER CONTROL** - Nothing stored in database without explicit approval.

---

### Phase 8: MCP Database Commit ⭐ ONLY AFTER APPROVAL

**Trigger:** User has approved in Phase 7
**Process:**
```
Store VALIDATED DATA (not validation metadata) in MCP:

mcp__character_planning__store_character_arcs({
  character_id, series_id,
  motivation, fear, flaw,
  book_progression: [...]
})

mcp__character_planning__store_character_knowledge_timeline({
  character_id, book, chapter_range,
  knows: [...],
  doesnt_know: [...]
})

mcp__series_planning__store_series_relationships({
  series_id, character_a, character_b, relationship_type,
  trust_progression: {
    book_1: -5, book_2: -2, book_3: +3, book_4: +7, book_5: +10
  },
  bridge_events: [...]
})

mcp__series_planning__store_worldbuilding_rules({
  series_id, rule_category, rule_text, limitations
})

mcp__core_continuity__store_setup_payoff_registry({
  series_id, element, setup_book, payoff_book, description
})

mcp__series_planning__update_trope_instance({
  trope_instance_id,
  validated: true,
  npe_score: 87
})
```

**What Gets Stored:**
- ✅ Character arcs and knowledge timelines
- ✅ Relationship progressions with trust levels
- ✅ Worldbuilding rules
- ✅ Setup/payoff registry
- ✅ Trope usage (updated with validation status)

**What Does NOT Get Stored:**
- ❌ NPE validation scores
- ❌ Violation reports
- ❌ Commercial viability metadata
- ❌ Validation history

**MCP:** ✅ **Stores VALIDATED DATA** in multiple servers:
- character-planning-server
- series-planning-server
- core-continuity-server

---

### Phase 8.5: Book Iteration Orchestrator ⭐ NEW

**Purpose:** Manage sequential book production workflow
**Trigger:** After MCP database commit (Phase 8)
**Process:**
```
FOR EACH book in series (Books 1-5):

1. Select next book from series plan
2. Load book-level data from MCP:
   - Character arcs for this book
   - Relationship trust levels at this point
   - Plot threads active in this book
   - Trope required scenes for this book
   - Setup/payoff elements for this book

3. Load genre pack manifest

4. Calculate dynamic chapter count:
   chapter_count = calculate_chapter_count(
     genre_pack_target = manifest.typical_chapter_count.target,
     book_number = current_book,
     book_complexity = analyze_plot_threads(current_book)
   )

   Example Logic:
   - Book 1 (setup): target + 20% (e.g., 20 → 24 chapters)
   - Books 2-4 (middle): target count (e.g., 20 chapters)
   - Book 5 (conclusion): target + 10% (e.g., 20 → 22 chapters)

   Always respect genre pack min/max limits.

5. Set book context for Phases 9-11:
   - current_book_number
   - current_book_title
   - chapter_count (calculated above)
   - book_specific_data (from MCP)

6. Proceed to Phase 9 (Chapter Planning) for current book
```

**Output:**
- Current book selected
- Dynamic chapter count calculated from genre pack
- Book context loaded
- Ready for chapter planning

**MCP:** ✅ **Queries book-specific data** filtered by book_number

**This phase solves:**
- ❌ Hard-coded chapter counts → ✅ Genre-aware dynamic calculation
- ❌ Only Book 1 processed → ✅ All 5 books processed sequentially
- ❌ No iteration mechanism → ✅ Clear book-by-book workflow

---

### Phase 9: Chapter Planning (SMALL ROCKS) - Per Book

**Lead:** Miranda + Bailey + Writing Team
**Input:**
- Current book from Phase 8.5
- Dynamic chapter count (genre pack + book position)
- Book-specific data from MCP

**Process:**
```
1. Miranda coordinates chapter planning for CURRENT BOOK
   (e.g., "Book 3: Shadow's Edge")

2. Use calculated chapter count from Phase 8.5:
   - NOT hard-coded 25 chapters
   - Dynamically calculated based on genre pack
   - Example: Romance Book 1 might be 24 chapters
   - Example: Thriller Book 3 might be 40 chapters
   - Example: Fantasy Book 5 might be 42 chapters

3. Bailey/team expand book-level structure to chapter-level:
   - Book [N] ([calculated_chapter_count] chapters)
     → Chapter 1: [what happens]
     → Chapter 2: [what happens]
     → ... etc.

4. Use genre pack beat sheets for chapter structure

5. Query MCP for context SPECIFIC TO THIS BOOK:
   - Character knowledge states at Book [N]
   - Relationship trust levels at Book [N]
   - Trope required scenes for Book [N]
   - Setup/payoff elements for Book [N]

6. Plan scene-by-scene breakdown per chapter
```

**Output:**
- Chapter-level outlines for CURRENT BOOK
- Scene-by-scene plans
- Ready for writing execution (Phase 11)

**MCP:** ✅ **Queries data** filtered by current_book_number

**Genre Pack Integration:**
- Loads typical_chapter_count from manifest.json
- Applies book position modifiers (setup/conclusion bonuses)
- Respects min/max limits
- Adapts to genre conventions automatically

---

### Phase 10: SCENE-LEVEL NPE VALIDATION (Sand Validation) ⭐ DURING WRITING

**Process:** Happens during writing execution (Phase 11)
**Tools:** Existing NPE MCP tools
**Validation:**
```
Uses 357 detailed NPE rules across 10 categories:

- validate_scene_architecture
- validate_dialogue_physics
- log_character_decision
- validate_causality_chain
- analyze_chapter_pacing
- validate_information_economy
- track_stakes_escalation
- track_relationship_tension
- calculate_npe_compliance
- get_npe_violations

These validate WRITTEN SCENES (not planned structure).
```

**Output:**
- Scene-level compliance scores
- Dialogue/POV/pacing issues
- Character behavioral palette violations

**MCP:** ✅ **Uses existing NPE Config MCP Server** (4 specialized servers)

**This is SCENE VALIDATION** - Different from Phase 4 (series structure validation).

---

### Phase 11: Writing Execution - Per Book

**Lead:** Bailey (First Drafter) + Full Writing Team
**Input:** Chapter plans for current book from Phase 9
**Process:**
```
1. Bailey writes scenes based on chapter plans for CURRENT BOOK
2. Tessa (Continuity) validates consistency
3. Edna (Editor) reviews pacing and quality
4. Genre specialists provide expertise
5. Scene-Level NPE validation runs continuously
6. Miranda coordinates and approves

Writing Team queries MCP constantly with book context:
- "What does Theodore know at Book [N], Ch 5?"
- "What's trust level between characters at Book [N]?"
- "What trope scene needs to be in Book [N], chapter X?"
- "What setup from Book 1 needs to pay off in Book [N]?"
```

**Output:**
- Written chapters/scenes for CURRENT BOOK
- Publication-ready book [N]

**MCP:** ✅ **Heavy query usage** (single source of truth, filtered by book_number)

---

### Phase 11.5: Book Completion Check ⭐ NEW

**Trigger:** After current book writing completes (Phase 11)
**Process:**
```
1. Validate book completion:
   - All chapters written
   - All scenes validated
   - NPE compliance verified
   - Continuity checked

2. User review of completed book:
   - Present finished book for approval
   - Gather feedback
   - Make final revisions if needed

3. Mark book status in tracking:
   - book_status = "complete"
   - Record completion date
   - Archive deliverable

4. Check series progress:
   IF more books remain (current_book < 5):
      → Return to Phase 8.5 (next book)
   ELSE:
      → Proceed to Phase 12 (Series Finalization)
```

**Output:**
- Completed book approved
- Series progress updated
- Next book triggered OR series complete

**This phase ensures:**
- Each book is fully completed before starting next
- User approval at book level (in addition to series level)
- Clear progress tracking
- All 5 books get written

---

### Phase 12: Series Finalization

**Trigger:** All 5 books completed (Phase 11.5 exits loop)
**Process:**
```
1. Compile series-level artifacts:
   - Complete series Bible
   - Cross-book continuity report
   - Character arc summaries (all 5 books)
   - Relationship progression charts
   - Worldbuilding reference

2. Generate marketing materials:
   - Series description
   - Book blurbs (all 5 books)
   - Trope lists per book
   - Comp title analysis

3. Final quality checks:
   - Series-level continuity validation
   - Setup/payoff registry verification
   - Character arc completion
   - Plot thread resolution

4. Export deliverables:
   - 5 publication-ready books
   - Series Bible
   - Marketing package
   - Continuity documentation
```

**Output:**
- Complete 5-book series ✅
- Series Bible
- Marketing materials
- Production complete

---

## ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER                                  │
│                            │                                    │
│              Provides concept in new genre                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │ PHASE 0: Genre Pack Check              │
        │ Market Research Agent                  │
        │                                        │
        │ IF missing: Create genre pack          │
        │ - Research conventions (WebSearch)     │
        │ - Generate manifest.json               │
        │ - Create beat sheets, templates        │
        │ - Store in .claude/genre-packs/        │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │ PHASE 1: Market Research               │
        │ Market Research Agent                  │
        │                                        │
        │ - Comp title analysis                  │
        │ - DEEP TROPE RESEARCH:                 │
        │   • Search MCP for existing tropes     │
        │   • Research required scenes           │
        │   • Store in MCP ──────────────┐       │
        │ - Commercial viability         │       │
        └────────────────┬──────────────│────────┘
                         │              │
                         ▼              │
        ┌────────────────────────────│──│────────┐
        │ PHASE 2: Genre Pack Selection │        │
        │ (Already loaded from Phase 0)  │        │
        └────────────────┬──────────────│────────┘
                         │              │
                         ▼              │
        ┌───────────────────────────────│────────┐
        │ PHASE 3: Series Architect      │        │
        │ Series Architect Agent         │        │
        │                                │        │
        │ GENRE-AWARE (NEW):            │        │
        │ - Loads genre pack manifest   │        │
        │ - Uses genre escalation pattern│        │
        │ - Romance if genre requires   │        │
        │                                │        │
        │ Plans BIG ROCKS:              │        │
        │ - Worldbuilding rules          │        │
        │ - Character arcs (motivations/│        │
        │   fears/flaws)                 │        │
        │ - Relationships (all types)    │        │
        │ - Trope execution ←────────────┘        │
        │ - Book-level structure                  │
        │ - Setup/payoff registry                 │
        │                                         │
        │ Records trope usage in MCP ────┐        │
        └────────────────┬───────────────│────────┘
                         │               │
                         ▼               │
        ┌───────────────────────────────│────────┐
        │ PHASE 4: SERIES-LEVEL NPE     │        │
        │ NPE Series Validator Agent    │        │
        │                                │        │
        │ Validates "BIG ROCKS":        │        │
        │ 1. Character arc logic (20%)  │        │
        │ 2. Relationship progression (15%)      │
        │ 3. Trope execution (20%)      │        │
        │    - Loads required scenes ───┘        │
        │      from MCP                          │
        │ 4. Plot coherence (15%)                │
        │ 5. Worldbuilding (10%)                 │
        │ 6. Stakes escalation (10%)             │
        │ 7. Information economy (10%)           │
        │                                        │
        │ Score: 0-100 (≥80 = PASS)              │
        │ ❌ NO MCP STORAGE                       │
        │    (validation metadata)               │
        └────────────────┬───────────────────────┘
                         │
                         ├─► IF FAIL (<80)
                         │   └─► Return to Phase 3
                         │
                         ├─► IF PASS (≥80)
                         ▼
        ┌────────────────────────────────────────┐
        │ PHASE 5: Commercial Validation         │
        │ Commercial Validator Agent             │
        │                                        │
        │ - Uses NPE score as input              │
        │ - 5-category assessment                │
        │ - Go/no-go recommendation              │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │ PHASE 6: Writing Team Review           │
        │ Miranda + Genre Specialists            │
        │                                        │
        │ - Miranda coordinates review           │
        │ - Genre specialists validate           │
        │ - Team refines structure               │
        │ - Provides refinement notes            │
        │                                        │
        │ ❌ NO MCP STORAGE YET                   │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │ PHASE 7: User Review & Approval        │
        │ ⭐ CRITICAL GATE ⭐                      │
        │                                        │
        │ User reviews:                          │
        │ - Series architecture                  │
        │ - NPE validation (score: 87/100)       │
        │ - Commercial viability                 │
        │ - Writing Team notes                   │
        │                                        │
        │ User AUTHORIZES MCP database storage   │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │ PHASE 8: MCP DATABASE COMMIT           │
        │ ⭐ ONLY AFTER USER APPROVAL ⭐          │
        │                                        │
        │ Stores VALIDATED DATA:                 │
        │ ✅ Character arcs ──────────┐           │
        │ ✅ Character knowledge ─────┤           │
        │ ✅ Relationships ────────────┼─────────►│
        │ ✅ Worldbuilding rules ──────┤   MCP    │
        │ ✅ Setup/payoff registry ────┤ Database │
        │ ✅ Trope usage (updated) ────┘           │
        │                                        │
        │ ❌ Does NOT store:                      │
        │    NPE scores, violation reports       │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │ PHASE 9: Writing Team Plans Chapters   │
        │ Miranda + Bailey + Team                │
        │                                        │
        │ SMALL ROCKS:                           │
        │ - Chapter-level planning               │
        │ - Scene-by-scene breakdown             │
        │                                        │
        │ Queries MCP constantly:       ┌───────►│
        │ - Character knowledge ────────┤   MCP  │
        │ - Relationship trust levels ──┤ Database
        │ - Trope required scenes ──────┤        │
        │ - Setup/payoff elements ──────┘        │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │ PHASE 10: Scene-Level NPE Validation   │
        │ (During writing - Phase 11)            │
        │                                        │
        │ Uses EXISTING NPE Config MCP:          │
        │ - validate_scene_architecture          │
        │ - validate_dialogue_physics            │
        │ - log_character_decision               │
        │ - validate_causality_chain             │
        │ - analyze_chapter_pacing               │
        │                                        │
        │ Validates "SAND" (357 detailed rules)  │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │ PHASE 11: Writing Execution            │
        │ Bailey + Full Writing Team             │
        │                                        │
        │ - Bailey writes scenes                 │
        │ - Tessa validates continuity           │
        │ - Edna reviews pacing                  │
        │ - Genre specialists consult            │
        │ - Miranda approves                     │
        │                                        │
        │ Constant MCP queries ──────────►MCP DB │
        └────────────────────────────────────────┘
```

---

## KEY ARCHITECTURAL PRINCIPLES

### 1. Big Rocks First

```
BIG ROCKS (Series-Level):
- Worldbuilding rules
- Character arcs with motivations/fears/flaws
- Relationships (all types) with trust progression
- Trope execution with required scenes
- 5-book structure (book-level)
- Setup/payoff registry

        ↓ Validated by Series-Level NPE

SMALL ROCKS (Chapter-Level):
- Chapter-by-chapter plans
- Scene-by-scene breakdown

        ↓ Planned by Writing Team

PEBBLES & SAND (Scene-Level):
- Dialogue exchanges
- POV discipline
- Sensory details
- Pacing beats

        ↓ Validated by Scene-Level NPE during writing
```

### 2. Multi-Layer NPE Validation

```
LAYER 1: Series-Level NPE (Phase 4)
- Validates BIG ROCKS
- Book-level structure
- 7 categories, score 0-100
- Quality gate (≥80 to proceed)
- NO database storage of validation

LAYER 2: Scene-Level NPE (Phase 10)
- Validates SAND
- Scene-level details
- 357 detailed rules across 10 categories
- During writing execution
- Uses existing NPE MCP tools
```

### 3. Genre-Aware Architecture

```
Genre Pack Integration:
1. Market Research creates if missing
2. Series Architect loads and applies:
   - Genre-specific escalation patterns
   - Protagonist archetypes from templates
   - Romance ONLY if primary_genre = "Romance"
   - Genre-appropriate terminology
3. NPE Validator uses genre expectations
```

### 4. MCP Database Timing

```
❌ OLD WORKFLOW:
Series Architect → NPE Validation → MCP Storage (automatic)

✅ NEW WORKFLOW:
Series Architect → NPE Validation → Commercial Validation
→ Writing Team Review → User Approval → MCP Storage (authorized)
```

**Critical:** No data stored without user approval.

### 5. Trope Research & Validation

```
PHASE 1: Market Research
- Searches MCP for existing tropes
- Researches required scenes (opening/middle/closing)
- Stores in MCP: mcp__create_trope() or mcp__update_trope()

PHASE 3: Series Architect
- Loads tropes from MCP: mcp__get_trope()
- Plans where required scenes occur
- Records usage: mcp__create_trope_instance()

PHASE 4: Series-Level NPE Validator
- Validates required scenes are planned
- Checks timing and validation criteria
- Ensures trope execution will meet reader expectations

PHASE 11: Writing Execution
- Writing Team implements planned trope scenes
- Ensures execution is fresh and compelling
```

---

## MCP DATABASE SERVERS & USAGE

### Servers:
1. **author-server**
2. **series-planning-server** ← Tropes stored here
3. **book-planning-server**
4. **chapter-planning-server**
5. **character-planning-server** ← Character knowledge, arcs stored here
6. **scene-server**
7. **core-continuity-server** ← Setup/payoff, relationships stored here
8. **review-server**
9. **reporting-server**

### When Data is Stored:

**Phase 1 (Market Research):**
- ✅ Tropes with required scenes → series-planning-server

**Phase 3 (Series Architect):**
- ✅ Trope usage instances → series-planning-server

**Phase 8 (MCP Database Commit - AFTER USER APPROVAL):**
- ✅ Character arcs → character-planning-server
- ✅ Character knowledge timelines → character-planning-server
- ✅ Relationships → series-planning-server
- ✅ Worldbuilding rules → series-planning-server
- ✅ Setup/payoff registry → core-continuity-server

**Phase 10-11 (Writing Execution):**
- ✅ Scene validations → scene-server
- ✅ Character decisions → character-planning-server (via NPE tools)
- ✅ Causality chains → core-continuity-server (via NPE tools)

### What is NOT Stored:

- ❌ NPE validation scores
- ❌ Violation reports
- ❌ Commercial viability assessments
- ❌ Validation history

Only VALIDATED DATA is stored, not validation metadata.

---

## AGENT SUMMARY

### Planning Phase Agents:
1. **Market Research Agent** - Genre pack creation, trope research, market analysis
2. **Series Architect Agent** - Genre-aware series structure, big rocks planning
3. **NPE Series Validator Agent** - Series-level validation gate
4. **Commercial Validator Agent** - Commercial viability assessment

### Writing Phase Agents:
5. **Miranda (Showrunner)** - Coordinates Writing Team
6. **Bailey (First Drafter)** - Writes scenes
7. **Tessa (Continuity)** - Validates consistency
8. **Edna (Editor)** - Reviews pacing and quality
9. **Finn (Style Specialist)** - Polishes prose

### Genre Specialist Agents:
10. **Detective Logan** - Police procedural accuracy
11. **Dr. Viktor** - Psychological authenticity
12. **Professor Mira** - Worldbuilding consistency

---

## BENEFITS OF THIS ARCHITECTURE

### 1. Early Issue Detection
- Series-Level NPE catches structural issues in planning (cheap to fix)
- Don't write 50,000 words with a flawed foundation

### 2. Genre Flexibility
- Supports any genre via genre pack creation
- Genre-aware escalation patterns
- No forced romance in non-romance genres
- **NEW:** Dynamic chapter counts match genre conventions

### 3. Trope Guidance
- Required scenes guide Series Architect
- NPE validates trope execution meets reader expectations
- Marketing knows which tropes are used

### 4. Single Source of Truth
- MCP database prevents conflicting information
- Writing Team queries validated data
- No file searching, fast lookups
- **NEW:** Book-specific context filtering

### 5. User Control
- Nothing stored without approval
- Writing Team reviews before commit
- User authorizes database storage
- **NEW:** Book-by-book approval gates

### 6. Multi-Layer Quality
- Big rocks validated before writing
- Sand validated during writing
- Both structural and detail quality ensured

### 7. Complete Series Production ⭐ NEW
- **ALL 5 books** planned and written (not just Book 1)
- Book iteration orchestrator manages workflow
- Each book uses appropriate chapter count
- Series finalization compiles deliverables
- True commercial fiction production capability

### 8. Genre-Aware Chapter Planning ⭐ NEW
- No hard-coded chapter counts
- Dynamic calculation from genre pack:
  - Romance: 20-30 chapters (genre standard)
  - Thriller: 30-50 shorter chapters (fast pacing)
  - Fantasy: 25-45 chapters (worldbuilding space)
- Book position modifiers:
  - Book 1: +20% (setup needs space)
  - Book 5: +10% (payoff needs space)
- Respects genre pack min/max limits

---

## VERSION HISTORY

**Version 1.0 (Original):**
- Basic Market-Driven Planning Skill
- Hardcoded apocalyptic escalation
- Romance assumed in all genres
- Single NPE validator trying to do everything
- MCP storage automatic after validation
- Single book production only

**Version 2.0 (November 2024):**
- ✅ Genre pack creation capability
- ✅ Deep trope research with required scenes
- ✅ Genre-aware Series Architect (relationship-flexible)
- ✅ Multi-layer NPE validation (big rocks + sand)
- ✅ MCP storage only after user approval
- ✅ 11-phase pipeline with proper gates
- ❌ Only Book 1 planned/written
- ❌ Hard-coded 25 chapters

**Version 2.1 (November 30, 2024) - Current:**
- ✅ ALL FEATURES FROM VERSION 2.0
- ✅ Phase 8.5: Book Iteration Orchestrator (NEW)
- ✅ Phase 11.5: Book Completion Check (NEW)
- ✅ Phase 12: Series Finalization (NEW)
- ✅ Dynamic chapter count calculation from genre packs
- ✅ Multi-book production workflow (ALL 5 books)
- ✅ Book-specific MCP context filtering
- ✅ 13-phase pipeline with book iteration
- ✅ Genre-aware chapter counts (no hard-coding)
- ✅ Complete 5-book series production capability

**Key Changes in Version 2.1:**
1. **Removed hard-coded chapter counts** - Now dynamically calculated from genre pack
2. **Added book iteration loop** - Phases 9-11 now process all 5 books sequentially
3. **Added book orchestrator** - Phase 8.5 manages book-by-book workflow
4. **Added completion gates** - Phase 11.5 validates each book before next
5. **Added series finalization** - Phase 12 compiles complete series artifacts

---

**ARCHITECTURE MAP COMPLETE**

For implementation details, see:
- `MULTI_BOOK_DYNAMIC_CHAPTERS_SOLUTION.md` (NEW - Version 2.1 design)
- `MULTI_LAYER_NPE_VALIDATION_DESIGN.md`
- `SERIES_ARCHITECT_ANALYSIS.md`
- `.claude/agents/market-research-agent.md`
- `.claude/agents/series-architect-agent.md`
- `.claude/agents/npe-series-validator-agent.md`
