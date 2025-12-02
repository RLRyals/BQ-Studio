# MARKET-DRIVEN SERIES PRODUCTION SYSTEM
## Architecture Map & Updated Process Flow

**Last Updated:** 2024-11-30
**Version:** 2.2 (Premise Development + Combined Genre Phase)

---

## KEY UPDATES IN VERSION 2.1

1. **Phase 0: Premise Development** - "What if" brainstorming with broad trend analysis
2. **Combined Genre Phase** - Genre pack check and selection merged into Phase 1
3. **Deep Market Research** - Targeted research for specific concept (Phase 2)
4. **Phase 12: Book Production Loop** - Iterates through Books 2-5 with inter-book continuity
5. **Genre-Based Chapter Counts** - Chapter counts determined from genre pack research
6. **Chapter-by-Chapter Review Gates** - User reviews each chapter plan for Book 1
7. **Inter-Book Continuity Tracking** - MCP queries for character arcs, relationships, setups/payoffs
8. **Book-Level Approval Gates** - User approval required between each book in series

### Previous Updates (Version 2.0)
1. **Genre Pack Creation** - Market Research Agent creates genre packs for new genres
2. **Trope Research with Required Scenes** - Deep research stored in MCP
3. **Genre-Aware Series Architect** - Uses genre-specific patterns, relationship-flexible
4. **Multi-Layer NPE Validation** - Structure validated before writing, details during writing
5. **Corrected MCP Workflow** - Database commit only AFTER Writing Team review + user approval

---

## COMPLETE 12-PHASE PIPELINE

```
Phase 0: Premise Development & Trend Analysis (NEW)
    ↓
Phase 1: Genre Pack Management (Check/Create/Select)
    ↓
Phase 2: Deep Market Research + Trope Research
    ↓
Phase 3: Series Architect (Series Structure - genre-aware)
    ↓
Phase 4: SERIES-LEVEL NPE VALIDATION (Structure Gate)
    ↓
Phase 5: Commercial Validation
    ↓
Phase 6: Writing Team Review & Refinement
    ↓
Phase 7: User Review & Approval
    ↓
Phase 8: MCP Database Commit (ONLY AFTER APPROVAL)
    ↓
Phase 9: Writing Team Plans Chapters (Chapter Structure)
        [Book 1: Chapter-by-Chapter Review Gates]
    ↓
Phase 10: SCENE-LEVEL NPE VALIDATION (Scene Detail Validation)
    ↓
Phase 11: Writing Execution (Book 1)
    ↓
Phase 12: Book Production Loop (Books 2-5)
        [Repeats Phases 9-11 for each book]
        [Book-Level Approval Gates between books]
```

---

## PHASE-BY-PHASE DETAIL

### Phase 0: Premise Development & Trend Analysis (NEW)

**Agent:** Brainstorming Agent (with Market Research capabilities)
**Trigger:** Raw idea / "What if" question
**Inputs:** Perplexity API (Real-time trends), Kindle Trends (Data)
**Process:**
```
1. BROAD TREND ANALYSIS:
   - Identify currently hot genres/tropes using Perplexity/Kindle Trends
   - Analyze seasonal patterns

2. CONCEPT GENERATION:
   - Analyze raw concept (e.g., "Willy Wonka but serial killer")
   - Identify core hooks and potential conflicts

3. PITCH DEVELOPMENT:
   - Generate 3-5 pitches aligned with identified trends
   - Explore different genre lenses for the same concept

4. SELECTION:
   - User selects preferred direction
   - Define Target Genre
```

**Output:**
- Refined Concept
- Target Genre
- Initial Commercial Potential Assessment

**MCP:** No database interaction

---

### Phase 1: Genre Pack Management (Combined)

**Agent:** Market Research Agent
**Trigger:** Target Genre identified in Phase 0
**Process:**
```
1. Check: `.claude/genre-packs/{genre-slug}/`

2. IF genre pack EXISTS:
   → Load pack
   → Validate manifest with user (Review Gate)

3. IF genre pack MISSING:
   → Ask user: "Create genre pack for [Genre]?"
   → IF YES:
       a. Research genre conventions (WebSearch)
       b. Analyze 5-10 comp titles for patterns
       c. Generate genre pack files (manifest, beats, templates)
       d. Present to user for approval
       e. Store in `.claude/genre-packs/{genre-slug}/`
```

**Output:**
- ✅ Loaded & Validated Genre Pack
- ✅ Genre-specific escalation patterns available
- ✅ Character/setting templates ready

**MCP:** No database interaction (genre packs are files)

---

### Phase 2: Deep Market Research + Trope Research

**Agent:** Market Research Agent
**Input:** Refined Concept + Genre Pack
**Process:**
```
1. COMP TITLE RESEARCH:
   - Find 5-7 specific comps for the *selected* premise
   - Analyze performance data

2. DEEP TROPE RESEARCH:
   For each trending trope relevant to this specific story:
   a. Search MCP: mcp__list_tropes(search_query: "trope name")
   b. IF EXISTS: Update with new research
   c. IF NEW: Create with required scenes
   d. Research required scenes (Opening, Middle, Closing)
   e. Document reader expectations
   f. Store/update in MCP: mcp__create_trope()

3. COMMERCIAL VALIDATION:
   - Score the specific concept against the deep data
   - Identify market gaps
```

**Output:**
- Deep Market Research Report
- Trope Catalog (stored in MCP)
- Commercial Viability Score

**MCP:** ✅ **Stores tropes with required scenes** in series-planning-server

---

### Phase 3: Series Architect (Series Structure - Genre-Aware)

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

### Phase 4: SERIES-LEVEL NPE VALIDATION (Structure Gate) ⭐ NEW

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

### Phase 9: Writing Team Plans Chapters (Chapter Structure)

**Lead:** Miranda + Bailey + Writing Team
**Input:** Approved series structure + data from MCP
**Process:**
```
1. Miranda coordinates chapter planning for current book

2. Determine chapter count from genre pack:
   - Load genre pack manifest.json
   - Extract structure.typical_chapter_count (min, max, target)
   - Use target as default, adjust based on book complexity
   - Example: Gothic Romance Horror = 20-35 chapters (target: 25)
   - Example: Urban Fantasy Police Procedural = 25-35 chapters (target: 30)

3. Bailey/team expand book-level structure to chapter-level:
   - Book 1 ([genre-based count] chapters) → Chapter 1: [what happens]
   - Chapter 2: [what happens], etc.

4. Use genre pack beat sheets for chapter structure

5. Query MCP for context:
   - Character knowledge states
   - Relationship trust levels
   - Trope required scenes to include
   - Setup/payoff elements

6. Plan scene-by-scene breakdown per chapter

7. FOR BOOK 1 ONLY: Chapter-by-Chapter Review Gate
   - After each chapter is planned, present to user for review
   - User approves or requests revisions
   - Only proceed to next chapter after approval
   - This ensures Book 1 foundation is solid before continuing
```

**Output:**
- Chapter-level outlines for Book 1
- Scene-by-scene plans
- Ready for writing execution

**MCP:** ✅ **Queries data** (character knowledge, relationships, tropes, setups)

---

### Phase 10: SCENE ARCHITECTURE VALIDATION (Structure Gate) ⭐ BEFORE WRITING

**Process:** Happens AFTER planning but BEFORE writing
**Tools:** NPE Config MCP (Structure Validations)
**Validation:**
```
Validates the BLUEPRINT of the scene (not the prose):

1. validate_scene_architecture:
   - Does scene have Goal, Conflict, Disaster/Resolution?
   - Is it a Scene or a Sequel?

2. validate_causality_chain:
   - Does this scene follow logically from the previous one?
   - Is the "Because of..." link clear?

3. validate_information_economy:
   - Is the revelation timed correctly?
   - Does it reveal too much or too little?

4. log_character_decision:
   - Is the character's choice consistent with their agency?
```

**Output:**
- Validated Scene Beat Sheet
- Green light to write prose

**MCP:** ✅ **Uses NPE Config MCP Server** (Structure rules only)

**This is PLANNING VALIDATION** - Ensures the skeleton is solid.

---

### Phase 11: Writing Execution

**Lead:** Bailey (First Drafter) + Full Writing Team
**Process:**
```
1. Bailey writes scenes based on VALIDATED scene architecture (from Phase 10)
2. PROSE PHYSICS VALIDATION (Real-time):
   - validate_dialogue_physics (Voice, subtext)
   - analyze_chapter_pacing (Sentence length, paragraph flow)
   - track_relationship_tension (Micro-beats)
   - validate_pov_physics (Deep POV consistency)

3. Tessa (Continuity) validates consistency
4. Edna (Editor) reviews pacing and quality
5. Miranda coordinates and approves

Writing Team queries MCP constantly:
- "What does Theodore know at Book 2, Ch 5?"
- "What's trust level between characters here?"
```

**Output:**
- Written chapters/scenes
- Publication-ready book

**MCP:** ✅ **Heavy query usage** (single source of truth for all validated data)

---

### Phase 12: Book Production Loop (Books 2-5)

**Lead:** Miranda + Bailey + Writing Team
**Input:** Completed Book 1 + MCP series state
**Process:**
```
FOR each book in [Book 2, Book 3, Book 4, Book 5]:

  1. INTER-BOOK TRANSITION:
     - Review book-level structure from Phase 3 (Series Architect)
     - Query MCP for current series state:
       * Character arcs progression (where are they now?)
       * Relationship trust levels (current state)
       * Setup/payoff registry (what needs to pay off this book?)
       * Trope execution status (which required scenes are due?)
     - Identify cliffhanger from previous book
     - Plan opening that resolves/continues cliffhanger

  2. CHAPTER PLANNING (Phase 9 repeated):
     - Miranda coordinates chapter planning for current book
     - Determine chapter count from genre pack (same as Phase 9 step 2)
     - Bailey/team expand book-level structure to chapter-level
     - Query MCP for context (character knowledge, relationships, tropes, setups)
     - Plan scene-by-scene breakdown per chapter
     - NOTE: No chapter-by-chapter review gate for Books 2-5
       (only Book 1 has this gate)

  3. SCENE-LEVEL NPE VALIDATION (Phase 10 repeated):
     - Validate scene architecture during planning
     - Run NPE compliance checks
     - Ensure continuity with previous books

  4. WRITING EXECUTION (Phase 11 repeated):
     - Bailey writes scenes based on chapter plans
     - Writing Team collaborates with MCP queries
     - Scene-Level NPE validation runs continuously
     - Miranda coordinates and approves

  5. BOOK COMPLETION REVIEW GATE:
     - Present completed book to user for review
     - User approves or requests revisions
     - Only proceed to next book after approval

  6. MCP COMMIT FOR COMPLETED BOOK:
     - Update character arcs progression
     - Update relationship trust levels
     - Mark setup/payoff elements as complete
     - Update trope execution status
     - Store book-specific data

  LOOP continues until all 5 books are complete
```

**Output:**
- Books 2-5 written and validated
- Complete 5-book series with continuity tracking
- All character arcs, relationships, and tropes executed across series

**MCP:** ✅ **Heavy query and update usage**
- Queries: Series state, character progression, relationship states, setup/payoff registry
- Updates: Book completion data, character arc progression, relationship changes, trope execution status

**Key Differences from Book 1:**
- No chapter-by-chapter review gates (only book-level review)
- Heavier MCP querying for inter-book continuity
- Explicit inter-book transition planning
- Book-level approval gates between each book

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
        │ Plans SERIES STRUCTURE:       │        │
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
        │ Validates SERIES STRUCTURE:   │        │
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
        │ CHAPTER STRUCTURE:                     │
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
        │ Validates SCENE DETAILS (357 rules)    │
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

### 1. Hierarchical Planning

```
SERIES STRUCTURE (Book-Level):
- Worldbuilding rules
- Character arcs with motivations/fears/flaws
- Relationships (all types) with trust progression
- Trope execution with required scenes
- 5-book structure (book-level)
- Setup/payoff registry

        ↓ Validated by Series-Level NPE

CHAPTER STRUCTURE (Chapter-Level):
- Chapter-by-chapter plans
- Scene-by-scene breakdown

        ↓ Planned by Writing Team

SCENE DETAILS (Scene-Level):
- Dialogue exchanges
- POV discipline
- Sensory details
- Pacing beats

        ↓ Validated by Scene-Level NPE during writing
```

### 2. Multi-Layer NPE Validation

```
LAYER 1: Series-Level NPE (Phase 4)
- Validates Series Structure
- Book-level structure
- 7 categories, score 0-100
- Quality gate (≥80 to proceed)
- NO database storage of validation

LAYER 2: Scene-Level NPE (Phase 10)
- Validates Scene Details
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

### 3. Trope Guidance
- Required scenes guide Series Architect
- NPE validates trope execution meets reader expectations
- Marketing knows which tropes are used

### 4. Single Source of Truth
- MCP database prevents conflicting information
- Writing Team queries validated data
- No file searching, fast lookups

### 5. User Control
- Nothing stored without approval
- Writing Team reviews before commit
- User authorizes database storage

### 6. Multi-Layer Quality
- Big rocks validated before writing
- Sand validated during writing
- Both structural and detail quality ensured

---

## VERSION HISTORY

**Version 1.0 (Original):**
- Basic Market-Driven Planning Skill
- Hardcoded apocalyptic escalation
- Romance assumed in all genres
- Single NPE validator trying to do everything
- MCP storage automatic after validation

**Version 2.0:**
- ✅ Genre pack creation capability
- ✅ Deep trope research with required scenes
- ✅ Genre-aware Series Architect (relationship-flexible)
- ✅ Multi-layer NPE validation (big rocks + sand)
- ✅ MCP storage only after user approval
- ✅ 11-phase pipeline with proper gates

**Version 2.1 (Current):**
- ✅ Phase 12: Book Production Loop for Books 2-5
- ✅ Genre-based chapter count determination
- ✅ Chapter-by-chapter review gates for Book 1
- ✅ Inter-book continuity tracking via MCP
- ✅ Book-level approval gates between books
- ✅ 12-phase pipeline with series-wide production

---

**ARCHITECTURE MAP COMPLETE**

For implementation details, see:
- `MULTI_LAYER_NPE_VALIDATION_DESIGN.md`
- `SERIES_ARCHITECT_ANALYSIS.md`
- `.claude/agents/market-research-agent.md`
- `.claude/agents/series-architect-agent.md`
- `.claude/agents/npe-series-validator-agent.md`
