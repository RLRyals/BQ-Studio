---
name: book-planning-skill
description: Plan individual books within a series using structured beat sheets and MCP planning servers. Use when planning a new book in an existing series, developing case-of-the-week plots with series arc threads, or creating comprehensive book-level story structure. Triggers include phrases like "plan the next book," "create book structure," "develop case plots," or requests for detailed book planning with beat sheets.
metadata:
  version: "1.0"
  phase: "planning"
  mcps: ["book-planning-server", "series-planning-server", "character-planning-server"]
---

# Book Planning Skill

Structured workflow for planning individual books within a series, with emphasis on Urban Fantasy Police Procedural genre, case-of-the-week plots, and series arc advancement.

---

## MANDATORY GUARDRAILS

**CRITICAL: MCP Permission Protocol**

**ALWAYS ASK PERMISSION** before any MCP create/add/update operation.

### Required Permission Flow
1. **Analyze** - Review existing data from MCP servers (read-only operations allowed)
2. **Propose** - Present planned changes to user with clear explanation
3. **Wait** - Get explicit user approval (require "approved" or clear confirmation)
4. **Execute** - Only then perform MCP write operations
5. **Confirm** - Report successful completion

### MCP Operations Requiring Permission
- `book-planning-server`:
  - Creating new book entries (`create_book`)
  - Adding beat points (`add_beat_point`)
  - Updating book metadata (`update_book_metadata`)
  - Adding plot threads (`add_plot_thread`)
  - Updating character milestones (`update_character_milestone`)

- `series-planning-server`:
  - Updating series arc status (`update_series_arc`)
  - Adding series events (`add_series_event`)
  - Modifying timeline entries (`update_timeline`)

- `character-planning-server`:
  - Creating character profiles (`create_character`)
  - Updating character development (`update_character_arc`)
  - Adding relationship dynamics (`add_relationship`)

### Permission Request Format
```
I propose the following MCP operations:

1. [Server Name] - [Operation Name]
   - Purpose: [Why this operation]
   - Data: [What will be created/modified]
   - Impact: [Effect on planning structure]

2. [Next operation...]

May I proceed? (Please confirm with "approved" or provide modifications)
```

**NEVER bypass this protocol.** User trust depends on transparent control over persistent data.

---

## AUTOMATIC ID MANAGEMENT

### ID Discovery on Session Start

**Skills automatically handle ID resolution - users never interact with IDs directly.**

When a session starts, this skill:
1. **Queries MCP servers** to discover existing entities (series, books, characters, plot threads)
2. **Caches IDs in session memory** for the duration of the workflow
3. **Builds human-readable mappings** (name → ID) for transparent resolution

**Example Discovery Process:**
```
Session Start:
→ Query series-planning-server.get_series_overview()
→ Cache: series_id = "ser_67890"
→ Query book-planning-server.list_books()
→ Cache: "Book 1: Shadow Rising" → book_id = "book_001"
→ Query character-planning-server.list_characters()
→ Cache: "Detective Morgan" → char_id = "char_001", "Captain Hayes" → char_id = "char_002"
→ Query series-planning-server.get_plot_threads(series_id)
→ Cache: "The Artifact Mystery" → thread_id = "thread_001"
```

**Cached IDs for Book Planning:**
- `series_id` - Current series identifier
- `book_id` - Current book identifier
- `character_ids` - Map of character names to IDs
- `plot_thread_ids` - Map of plot thread titles to IDs

### Transparent ID Resolution

**Users interact with names, skills handle ID translation.**

When a user says: *"Add a case-of-the-week plot for Book 2"*

The skill:
1. **Accepts human input:** "Book 2", "case-of-the-week"
2. **Resolves book context:** Uses cached mapping to get `book_id = "book_002"`
3. **Creates plot thread:** Calls `add_plot_thread(book_002, {type: "case_primary", ...})`
4. **Caches new ID:** "Case: Missing Fae" → `thread_005`
5. **Responds to user:** "Case plot added to Book 2: Missing Fae investigation."

**User never sees:** `book_002`, `thread_005`, or any other ID value.

**Future references** to "the Missing Fae case" are automatically resolved to `thread_005` by the skill.

### Session State Management

**What IDs are cached during workflow:**

| Phase | IDs Cached | Refresh Trigger |
|-------|-----------|-----------------|
| Phase 1: Book Foundation | `series_id`, `book_id` | Book created/loaded |
| Phase 2: Beat Sheet Selection | `beat_sheet_template_id` | Template selected |
| Phase 3: Act Structure | `beat_point_ids` | Beats added |
| Phase 4: Case-of-the-Week | `plot_thread_ids` (case-specific) | Case plot created |
| Phase 5: Series Arc Integration | `series_arc_ids`, `thread_ids` | Arc threads added |
| Phase 6: Character Milestones | `character_ids`, `milestone_ids` | Milestones created |
| Phase 7: Validation | All above IDs validated | Planning complete |

**ID Refresh Strategy:**
- IDs are refreshed after any MCP write operation that creates new entities
- Cross-phase ID dependencies are automatically maintained
- Session memory persists across phase transitions

**How IDs are passed between phases:**
```
Phase 4 creates plot thread "Ritual Murders" → thread_id cached
Phase 5 links thread to series arc → auto-resolved from cache
Phase 6 assigns character to thread → both IDs auto-resolved
User never manages IDs manually
```

### User Experience

**User says:** *"Assign Detective Morgan as the lead for the ritual murder case in Book 3"*

**Skill translation (invisible to user):**
```
1. Resolve "Book 3" → book_id = "book_003"
2. Resolve "Detective Morgan" → character_id = "char_001"
3. Resolve "ritual murder case" → plot_thread_id = "thread_007"
4. MCP call: book-planning-server.update_plot_thread({
     plot_thread_id: "thread_007",
     lead_character: "char_001",
     ...
   })
5. Response: "Detective Morgan assigned as lead investigator for ritual murders."
```

**User never sees or types:**
- `book_003`
- `char_001`
- `thread_007`

**Throughout the workflow:**
- User: "What's Morgan's character arc in this book?"
- Skill: Queries `character-planning-server.get_character_arc(char_001, book_003)`
- User: "Add a midpoint revelation to the murder case"
- Skill: Adds beat to `thread_007` at midpoint percentage

**IDs are completely abstracted from user interaction.**

### Auto-Generated ID Reference (Optional)

**For transparency, skills can optionally generate ID reference documents.**

**Example: `.claude/session/book_3_id_reference.md`**
```markdown
# Book 3 ID Reference - Blood Moon Rising

**Auto-generated reference (READ-ONLY)**
Last updated: 2025-11-20 14:45:00

## Book
- Book 3: Blood Moon Rising: book_003

## Characters (in this book)
- Detective Morgan: char_001
- Captain Hayes: char_002
- Fae Informant Lyra: char_008

## Plot Threads
- Case: Ritual Murders: thread_007
- Series Arc: Council Conspiracy: thread_002
- Romance: Morgan/Lyra Tension: thread_009

## Beat Points
- Inciting Incident (12%): beat_003_001
- Midpoint Revelation (50%): beat_003_008
- Dark Night (75%): beat_003_012

---
*This is a reference document only. Users do not need to consult this for normal workflow.*
*IDs are managed automatically by the skill.*
```

**These documents:**
- Are **optional** and generated only if user requests transparency
- Are **read-only** - users never edit them
- Are **informational** - users don't need them for workflows
- Can be **regenerated** at any time from session cache

**Normal user workflow never requires consulting ID references.**

---

## Workflow Overview

### Planning Phases
1. **Book Foundation** - Series context, book role, thematic goals
2. **Beat Sheet Selection** - Choose appropriate structure for genre/plot type
3. **Act Structure Development** - Define 3-act or 5-act framework with major turning points
4. **Case-of-the-Week Planning** - Monster/case plot with investigation beats
5. **Series Arc Integration** - Weave overarching series threads through book
6. **Character Development Milestones** - Track character growth across book
7. **Validation & Review** - Comprehensive planning completion checklist

---

## Phase 1: Book Foundation

### Gather Context
**MCP Read Operations (no permission needed):**
- `series-planning-server.get_series_overview()` - Current series state
- `series-planning-server.get_series_arcs()` - Active story threads
- `book-planning-server.list_books()` - Previously planned books
- `character-planning-server.list_characters()` - Series character roster

### Information to Collect
1. **Book Position in Series**
   - Book number
   - Series arc phase (early/middle/late)
   - Previous book's ending status
   - Next book's anticipated starting point

2. **Book-Level Goals**
   - Primary character arc (who grows most?)
   - Thematic focus (justice, identity, belonging, power, etc.)
   - Series arc advancement (what major thread progresses?)
   - Standalone satisfaction vs. series hook balance

3. **Genre-Specific Elements** (Urban Fantasy Police Procedural)
   - Case/monster type (supernatural threat level)
   - Investigation structure (procedural beats)
   - World-building reveals (magic system, supernatural politics)
   - Precinct/team dynamics

### Output
- `book_foundation_summary.md` with context and goals

**Before proceeding:** Get user confirmation on book goals and position

---

## Phase 2: Beat Sheet Selection

### Urban Fantasy Police Procedural Beat Sheet Guidance

**Recommended Primary Structures:**

#### A. Three-Act Structure (Standard Procedural)
**Best for:**
- Straightforward case-of-the-week with clear investigation
- Books early in series establishing procedural format
- Lower stakes, character-focused stories

**Structure:**
- Act 1: Case introduction, initial investigation, first twist (25%)
- Act 2A: Deeper investigation, red herrings, personal stakes rise (25%)
- Act 2B: Investigation complications, dark night, breakthrough (25%)
- Act 3: Final confrontation, case resolution, character growth (25%)

#### B. Five-Act Structure (Complex Cases)
**Best for:**
- Multi-layered cases with major series arc integration
- Books with parallel investigation tracks
- High-stakes supernatural threats

**Structure:**
- Act 1: Inciting incident, case assignment (15-20%)
- Act 2: Investigation deepens, complications (20-25%)
- Act 3: Midpoint revelation, stakes escalate (20-25%)
- Act 4: Dark moment, sacrifice, new approach (20-25%)
- Act 5: Climax, resolution, aftermath (15-20%)

#### C. Hybrid Procedural + Romance (Romantasy Police)
**Best for:**
- Series with romantic subplot
- Character relationship development alongside case
- Urban fantasy with relationship tension

**Structure:**
- Integrates Romance Beat Sheet with procedural investigation
- Case beats and relationship beats interweave
- Resolution addresses both case and relationship status

### Beat Sheet Libraries Available
- Load `beat_sheet_library/` for full frameworks
- Urban Fantasy specific: Check for procedural variants
- Police Procedural beats: Investigation structure overlays

**Decision Point:** User selects beat sheet framework

**Before proceeding:** Get user approval on beat sheet choice

---

## Phase 3: Act Structure Development

### Define Major Story Beats

**MCP Read Operations:**
- `book-planning-server.get_book_template(beat_sheet_type)` - Load selected framework
- `series-planning-server.get_arc_status(book_number)` - Required series progressions

### Core Beats to Define

#### Opening (0-5%)
- Protagonist's normal world (precinct routine)
- Foreshadowing/series thread reminder
- Tone and voice establishment

#### Inciting Incident (10-15%)
- Case discovery (body found, supernatural event)
- Stakes establishment
- Personal hook for protagonist

#### First Plot Point / Break into Act 2 (~25%)
- Commitment to investigation
- First major clue or twist
- Point of no return

#### Midpoint (~50%)
- Major revelation (case complexity deepens)
- False victory or devastating setback
- Series arc significant development

#### Pinch Point 2 / Dark Night (~75%)
- Investigation seems hopeless
- Personal cost realized
- Character vulnerability moment

#### Climax (~90%)
- Final confrontation with antagonist/monster
- Investigation resolution
- Series arc pivotal moment

#### Resolution (95-100%)
- Case wrap-up
- Character growth demonstrated
- Series hook for next book

### MCP Write Operations (REQUIRES PERMISSION)
Propose creating beat points:
```
book-planning-server.create_book({
  book_number: N,
  title: "Book Title",
  beat_sheet_type: "selected_framework",
  target_word_count: XXXXX
})

book-planning-server.add_beat_point({
  book_id: book_id,
  beat_name: "Inciting Incident",
  percentage: 12,
  description: "Detective discovers supernatural murder",
  notes: "Ties to series arc: introduces artifact"
})
```

**Wait for user approval before executing**

---

## Phase 4: Case-of-the-Week Planning

### Monster/Case Structure

For Urban Fantasy Police Procedural, each book typically features:
1. **Primary Case** - The main supernatural threat/investigation
2. **Overarching Series Thread** - Woven throughout investigation
3. **Optional B-Plot Case** - Secondary investigation or procedural element

### Case Development Template

#### Case Overview
- **Threat Type:** What supernatural entity/crime?
- **Stakes:** Who's at risk? What happens if unsolved?
- **Personal Connection:** Why does this case matter to protagonist?
- **World-Building Opportunity:** What does this reveal about supernatural world?

#### Investigation Beats (Procedural Structure)

**Beat 1: Discovery** (Act 1, 10-15%)
- How is case discovered?
- Initial crime scene investigation
- First clues and questions raised

**Beat 2: First Lead** (Act 1, 20-25%)
- Witness interviews, evidence analysis
- Introduction of suspects/persons of interest
- Establishment of investigation approach

**Beat 3: Complication** (Act 2A, 30-35%)
- Red herrings and false leads
- Investigation hits obstacle
- Personal stakes increase

**Beat 4: Breakthrough** (Midpoint, 45-50%)
- Major clue discovered
- Understanding of threat deepens
- Investigation direction shifts

**Beat 5: Escalation** (Act 2B, 60-65%)
- Threat becomes more dangerous
- Time pressure increases
- Another victim or near-miss

**Beat 6: Dark Moment** (Act 3, 70-75%)
- Investigation seems to fail
- Protagonist makes mistake or faces consequence
- Threat appears insurmountable

**Beat 7: New Approach** (Act 3, 80-85%)
- Protagonist regroups with new insight
- Unconventional method or alliance
- Final pieces fall into place

**Beat 8: Confrontation** (Climax, 90-95%)
- Face-off with antagonist/monster
- Investigation resolution
- Action sequence and revelation

**Beat 9: Aftermath** (Resolution, 95-100%)
- Case officially closed
- Character reflects on cost/growth
- Loose end or series hook

### Case Planning Checklist
- [ ] Clear supernatural threat defined
- [ ] Investigation has logical progression
- [ ] At least 2-3 viable suspects/red herrings
- [ ] Personal stakes for protagonist established
- [ ] Clues planted fairly for reader
- [ ] Resolution feels earned, not contrived
- [ ] World-building integrated naturally
- [ ] Case connects to character arc

### MCP Write Operations (REQUIRES PERMISSION)
```
book-planning-server.add_plot_thread({
  book_id: book_id,
  thread_type: "case_primary",
  title: "The Artifact Murders",
  description: "Series of deaths linked to ancient magical artifacts",
  resolution: "Artifact collector attempting immortality ritual"
})

book-planning-server.add_beat_point({
  book_id: book_id,
  beat_name: "Case Discovery",
  percentage: 12,
  description: "Body found drained of magic, artifact fragment at scene",
  plot_thread: "case_primary"
})
```

**Wait for user approval before executing**

---

## Phase 5: Series Arc Integration

### Overarching Thread Development

Urban Fantasy Police Procedural series often have multi-book arcs:
- **Political/Institutional:** Corruption, supernatural law reform, precinct politics
- **Personal:** Protagonist's origin/powers, family secrets, mentor relationship
- **World-Building:** Supernatural faction conflict, magical territory disputes
- **Relationship:** Partnership evolution, romance slow-burn, found family

### Integration Strategy

#### Subplot Weaving
For each series arc active in this book:
1. **Entry Point:** Where in case investigation does thread appear?
2. **Development Beats:** 2-4 moments advancing the arc
3. **Book Resolution:** What changes by book's end?
4. **Hook Forward:** What question/tension carries to next book?

#### Balance Ratios (Guideline)
- **Primary Case Plot:** 60-70% of narrative focus
- **Series Arc Development:** 20-30% of narrative focus
- **Character Development:** 10-20% (overlaps with above)

### MCP Read Operations
```
series-planning-server.get_arc_requirements({
  book_number: N
})
// Returns: Which arcs must advance, required plot points, character beats
```

### MCP Write Operations (REQUIRES PERMISSION)
```
book-planning-server.add_plot_thread({
  book_id: book_id,
  thread_type: "series_arc",
  series_arc_id: arc_id,
  title: "Council Politics - Escalation",
  description: "Protagonist learns of conspiracy within Supernatural Council",
  resolution: "Discovers ally is compromised, but cannot prove it yet"
})

series-planning-server.update_series_arc({
  arc_id: arc_id,
  book_number: N,
  status: "advanced",
  notes: "Major revelation about conspiracy, protagonist now aware but isolated"
})
```

**Wait for user approval before executing**

---

## Phase 6: Character Development Milestones

### Character Arc Planning

For each major character in this book:

#### Protagonist Arc
- **Starting State:** Where are they emotionally/psychologically at book start?
- **Internal Conflict:** What belief/fear must they confront?
- **External Pressure:** How does case force growth?
- **Transformation Moment:** When do they change?
- **Ending State:** Who are they by book's end?

#### Supporting Character Development
- **Allies:** How do relationships deepen?
- **Antagonists:** What complexity is revealed?
- **Recurring Characters:** What role do they play this book?

### Character Milestone Template

**Character: [Name]**

**Book Entry Point:**
- Emotional state: [description]
- Relationship status: [with other characters]
- Skills/abilities: [relevant to this case]

**Development Beats:**
1. **Early Book (Act 1):** [Character beat, ~15-25%]
2. **Rising Action (Act 2A):** [Character beat, ~35-45%]
3. **Midpoint Shift:** [Character beat, ~50%]
4. **Dark Moment (Act 2B):** [Character beat, ~70-75%]
5. **Climax Contribution:** [Character beat, ~90%]

**Book Exit Point:**
- Growth demonstrated: [specific change]
- New relationship status: [evolution]
- Setup for next book: [hook]

### MCP Write Operations (REQUIRES PERMISSION)
```
character-planning-server.update_character_arc({
  character_id: character_id,
  book_number: N,
  arc_type: "internal_conflict",
  starting_state: "Distrusts authority due to past betrayal",
  transformation: "Learns to trust partner through case crisis",
  ending_state: "Able to rely on team, but still cautious with Council"
})

book-planning-server.update_character_milestone({
  book_id: book_id,
  character_id: character_id,
  milestone_name: "Trust Breakthrough",
  chapter_estimate: 18,
  description: "Protagonist must rely on partner to survive ambush",
  character_growth: "Realizes isolation is more dangerous than vulnerability"
})
```

**Wait for user approval before executing**

---

## Phase 7: Validation & Review

### Book Planning Completion Checklist

#### Structure Validation
- [ ] **Beat sheet selected** and aligned with genre/book goals
- [ ] **All major beats defined** with percentage markers
- [ ] **Act breaks clear** with turning points identified
- [ ] **Pacing markers** show escalation and tension variation
- [ ] **Word count targets** allocated per act/sequence

#### Case Plot Validation
- [ ] **Primary case defined** with clear threat and stakes
- [ ] **Investigation structure** has logical progression
- [ ] **Clues and red herrings** mapped to discovery points
- [ ] **Antagonist motivation** established and credible
- [ ] **Resolution satisfying** and earned through protagonist action
- [ ] **Fair play mystery** - reader has clues to solve alongside protagonist

#### Series Arc Validation
- [ ] **Required series progressions** identified from series-planning-server
- [ ] **Arc advancement beats** integrated into case plot
- [ ] **Series timeline consistency** maintained
- [ ] **Forward hooks** established for next book
- [ ] **Character continuity** from previous book acknowledged
- [ ] **World-building consistency** with established series rules

#### Character Development Validation
- [ ] **Protagonist arc** defined with clear transformation
- [ ] **Character milestones** mapped to story beats
- [ ] **Supporting character roles** clarified
- [ ] **Relationship dynamics** show evolution
- [ ] **Character agency** demonstrated in case resolution
- [ ] **Growth organic** to case events, not contrived

#### Genre-Specific Validation (Urban Fantasy Police Procedural)
- [ ] **Procedural elements** present (investigation, team dynamics, precinct)
- [ ] **Supernatural integration** balanced with realistic police work
- [ ] **Magic system consistency** with established series rules
- [ ] **World-building reveals** appropriate for book position in series
- [ ] **Tone consistency** (dark, gritty, hopeful, etc.)
- [ ] **Urban setting** utilized effectively

#### Technical Validation
- [ ] **Scene list** or chapter breakdown started
- [ ] **POV plan** established (single, multiple, etc.)
- [ ] **Narrative voice** consistent with series
- [ ] **Timeline** of case events logical and trackable
- [ ] **Research needs** identified (police procedure, supernatural elements)

### MCP Validation Queries
```
// Check all required data present
book-planning-server.validate_book_completeness({
  book_id: book_id
})

// Verify series consistency
series-planning-server.check_timeline_conflicts({
  book_number: N
})

// Character arc consistency
character-planning-server.validate_character_continuity({
  book_number: N
})
```

### Review Output Generation

**Create comprehensive planning document:**
`book_N_planning_complete.md` containing:
1. Book overview and goals
2. Selected beat sheet with all beats defined
3. Case plot structure with investigation beats
4. Series arc integration points
5. Character development milestones
6. Validation checklist results
7. Next steps (scene breakdown, chapter outlining)

### Final Permission Check

**Before finalizing planning in MCP servers:**

Present complete summary:
```
Book Planning Summary for Book [N]: [Title]

Beat Sheet: [Framework]
Primary Case: [Case description]
Series Arcs Advanced: [List]
Character Arcs: [List]

Ready to finalize this planning in MCP servers:
- book-planning-server: [X] beats, [Y] plot threads, [Z] milestones
- series-planning-server: [N] arc updates
- character-planning-server: [M] character progressions

May I proceed with finalizing? (Confirm with "approved")
```

**Only after approval:** Execute final MCP write operations

---

## MCP Server Integration Reference

### book-planning-server

**Read Operations (no permission needed):**
- `list_books()` - All planned books
- `get_book(book_id)` - Specific book details
- `get_book_beats(book_id)` - Beat structure
- `get_plot_threads(book_id)` - All plot threads
- `get_book_template(beat_sheet_type)` - Beat sheet framework

**Write Operations (REQUIRE PERMISSION):**
- `create_book(data)` - Create new book entry
- `update_book_metadata(book_id, data)` - Modify book info
- `add_beat_point(book_id, beat_data)` - Add story beat
- `update_beat_point(beat_id, data)` - Modify beat
- `add_plot_thread(book_id, thread_data)` - Add plot thread
- `update_plot_thread(thread_id, data)` - Modify thread
- `add_character_milestone(book_id, character_id, milestone_data)` - Add character beat
- `update_character_milestone(milestone_id, data)` - Modify milestone
- `validate_book_completeness(book_id)` - Check planning readiness

### series-planning-server

**Read Operations (no permission needed):**
- `get_series_overview()` - Series summary
- `get_series_arcs()` - All active story arcs
- `get_arc_status(book_number)` - Required progressions for book
- `get_timeline()` - Series chronology
- `check_timeline_conflicts(book_number)` - Validate consistency

**Write Operations (REQUIRE PERMISSION):**
- `update_series_arc(arc_id, book_number, data)` - Advance arc
- `add_series_event(event_data)` - Add timeline event
- `update_timeline(book_number, data)` - Modify chronology

### character-planning-server

**Read Operations (no permission needed):**
- `list_characters()` - All series characters
- `get_character(character_id)` - Character details
- `get_character_arc(character_id, book_number)` - Character's book arc
- `validate_character_continuity(book_number)` - Check consistency

**Write Operations (REQUIRE PERMISSION):**
- `create_character(data)` - New character profile
- `update_character(character_id, data)` - Modify character
- `update_character_arc(character_id, book_number, arc_data)` - Set book arc
- `add_relationship(character_id_1, character_id_2, relationship_data)` - Define dynamic
- `update_relationship(relationship_id, data)` - Modify relationship

---

## Best Practices

### Planning Depth
- **Early Books (1-3):** More world-building, character establishment
- **Middle Books (4-7):** Deepen series arcs, complicate relationships
- **Late Books (8+):** Payoff series threads, escalate stakes

### Case Complexity Scaling
- Increase supernatural threat complexity as series progresses
- Tie cases more directly to series arcs in later books
- Allow protagonist's growing skills to face greater challenges

### Avoid Common Pitfalls
- **Case irrelevance:** Every case should matter to character or series
- **Arc stalling:** Don't tread water on series arcs
- **Character regression:** Growth should stick (trauma response ≠ regression)
- **World-building dumps:** Integrate through case investigation
- **Procedural tedium:** Focus on dramatic beats, not bureaucratic realism

### Integration Over Addition
- Weave series arc INTO case, don't run parallel
- Character growth THROUGH case resolution
- World-building REVEALED BY investigation

---

## Quick Reference

### Workflow Sequence
1. Foundation → 2. Beat Sheet → 3. Act Structure → 4. Case Planning → 5. Series Integration → 6. Character Milestones → 7. Validation

### Permission Checkpoints
- Before creating book entry in MCP
- Before adding beats to book structure
- Before updating series arcs
- Before finalizing character milestones
- Before marking planning complete

### Key Outputs
- `book_foundation_summary.md`
- `book_N_beats_structure.md`
- `book_N_case_outline.md`
- `book_N_planning_complete.md`

### MCP Servers Used
- `book-planning-server` - Primary book structure
- `series-planning-server` - Series arc coordination
- `character-planning-server` - Character development tracking

---

## Urban Fantasy Police Procedural Specialization

### Genre-Specific Beat Overlays

**Investigation Structure Beats (overlay on chosen framework):**
- Discovery/Case Assignment
- Initial Crime Scene Investigation
- Witness Interviews / Information Gathering
- First Lead / Breakthrough Clue
- Red Herring / False Lead
- Complication / Obstacle
- Midpoint Revelation
- Investigation Escalation
- Dark Night / Apparent Failure
- Final Clue / New Approach
- Confrontation / Arrest
- Case Resolution / Aftermath

**Supernatural Integration Points:**
- Magic system mechanics revealed through investigation
- Supernatural politics/factions encountered
- Precinct dynamics with non-human colleagues
- Protagonist's powers tested or evolved
- World-building through case-specific details

### Police Procedural Elements
- **Team Dynamics:** Partner relationships, precinct hierarchy
- **Procedure Realism:** Warrants, evidence chains, jurisdictional issues (adapted for supernatural)
- **Professional Conflict:** Internal affairs, politics, ethical dilemmas
- **Work-Life Balance:** Personal cost of job, relationships strained

### Urban Fantasy Tropes to Consider
- Hidden magical world / masquerade
- Supernatural species hierarchy
- Magic vs. technology integration
- Ancient powers in modern settings
- Chosen one vs. skilled professional balance

---

**Version:** 1.0
**Last Updated:** 2025-11-20
**Phase:** Planning
**MCP Dependencies:** book-planning-server, series-planning-server, character-planning-server
