---
name: series-planning-skill
description: Comprehensive series planning for Urban Fantasy Police Procedural novels. Use when the user wants to plan series structure, develop world rules, create character arcs, establish plot threads, or design relationship progressions. Triggers include phrases like "plan the series," "develop series framework," "create series bible," "plan character arcs across books," or requests for multi-book narrative planning.
metadata:
  version: "1.0"
  phase: "planning"
  mcps: ["author-server", "series-planning-server", "character-planning-server"]
  genre: "Urban Fantasy Police Procedural"
---

# Series Planning Skill

Progressive workflow for planning Urban Fantasy Police Procedural series from initial concept to comprehensive series bible. This skill focuses on the **planning phase** - establishing the foundation for series development through structured planning of world rules, character arcs, plot threads, and relationship progressions.

---

## MANDATORY GUARDRAILS

### MCP Operation Protocol

**CRITICAL: ALWAYS ASK PERMISSION before any MCP create/add/update operation**

Before executing ANY of these MCP operations, you MUST:
1. Present what you plan to create/add/update
2. Show the user the data structure or content
3. Wait for explicit "approved" or "yes" confirmation
4. Only then execute the MCP operation
5. Report the result to the user

**Prohibited Actions:**
- NEVER create/add/update via MCP without prior approval
- NEVER assume user wants data written to MCP servers
- NEVER batch-approve MCP operations without explicit consent
- NEVER proceed if user expresses uncertainty

**Allowed Actions (without approval):**
- Reading/querying MCP data (list, get operations)
- Analyzing and presenting recommendations
- Drafting content for user review
- Searching and retrieving existing data

---

## AUTOMATIC ID MANAGEMENT

### ID Discovery on Session Start

**Skills automatically handle ID resolution - users never interact with IDs directly.**

When a session starts, this skill:
1. **Queries MCP servers** to discover existing entities (authors, series, characters, world rules)
2. **Caches IDs in session memory** for the duration of the workflow
3. **Builds human-readable mappings** (name → ID) for transparent resolution

**Example Discovery Process:**
```
Session Start:
→ Query author-server.get_author_profile()
→ Cache: author_id = "auth_12345"
→ Query series-planning-server.list_series()
→ Cache: "Chronicles of the Veil" → series_id = "ser_67890"
→ Query character-planning-server.list_characters(series_id)
→ Cache: "Alex Chen" → char_id = "char_001", "Marcus Blake" → char_id = "char_002"
→ Query series-planning-server.get_world_rules(series_id)
→ Cache: "Fae Magic System" → rule_id = "rule_magic_001"
```

**Cached IDs for Series Planning:**
- `author_id` - Author profile identifier
- `series_id` - Current series identifier
- `character_ids` - Map of character names to IDs
- `world_rule_ids` - Map of rule categories to IDs

### Transparent ID Resolution

**Users interact with names, skills handle ID translation.**

When a user says: *"Add a character named Sarah to the series"*

The skill:
1. **Accepts human input:** "Sarah"
2. **Resolves series context:** Uses cached `series_id`
3. **Creates character:** Calls `create_character(series_id, {name: "Sarah", ...})`
4. **Caches new ID:** "Sarah" → `char_003`
5. **Responds to user:** "Character Sarah has been added to the series."

**User never sees:** `char_003` or any other ID value.

**Future references** to "Sarah" are automatically resolved to `char_003` by the skill.

### Session State Management

**What IDs are cached during workflow:**

| Phase | IDs Cached | Refresh Trigger |
|-------|-----------|-----------------|
| Phase 1: Series Foundation | `author_id`, `series_id` | New series created |
| Phase 2: World-Building | `world_rule_ids`, `magic_system_id` | Rules updated |
| Phase 3: Character Planning | `character_ids` (all characters) | New character created |
| Phase 4: Relationships | `relationship_ids` | New relationship added |
| Phase 5: Plot Threads | `plot_thread_ids`, `arc_ids` | New thread/arc created |
| Phase 6: Series Bible | All above IDs validated | Compilation complete |

**ID Refresh Strategy:**
- IDs are refreshed after any MCP write operation that creates new entities
- Cross-phase ID dependencies are automatically maintained
- Session memory persists across phase transitions

**How IDs are passed between phases:**
```
Phase 3 creates character "Alex" → char_id cached
Phase 4 needs "Alex" for relationship → auto-resolved from cache
Phase 5 needs "Alex" for plot thread → auto-resolved from cache
User never manages IDs manually
```

### User Experience

**User says:** *"Plan Chapter 5 for Alex"*

**Skill translation (invisible to user):**
```
1. Resolve "Chapter 5" → book_id = "book_001", chapter_number = 5
2. Resolve "Alex" → character_id = "char_001"
3. MCP call: chapter-planning-server.create_chapter({
     book_id: "book_001",
     chapter_number: 5,
     characters: ["char_001"],
     ...
   })
4. Cache: "Chapter 5" → chapter_id = "ch_005"
5. Response: "Chapter 5 planned with Alex as POV character."
```

**User never sees or types:**
- `book_001`
- `char_001`
- `ch_005`

**Throughout the workflow:**
- User: "Add Sarah to Alex's investigation team"
- Skill: Resolves Alex → `char_001`, creates Sarah → `char_006`, links them
- User: "What does Sarah know about the ritual?"
- Skill: Queries `character-planning-server.get_character_knowledge(char_006, ...)`

**IDs are completely abstracted from user interaction.**

### Auto-Generated ID Reference (Optional)

**For transparency, skills can optionally generate ID reference documents.**

**Example: `.claude/session/series_id_reference.md`**
```markdown
# Series ID Reference - Chronicles of the Veil

**Auto-generated reference (READ-ONLY)**
Last updated: 2025-11-20 14:32:00

## Series
- Chronicles of the Veil: ser_67890

## Characters
- Alex Chen: char_001
- Marcus Blake: char_002
- Sarah Kim: char_006

## World Rules
- Fae Magic System: rule_magic_001
- Iron Vulnerability: rule_magic_002

## Plot Threads
- The Missing Artifacts: thread_001
- Council Conspiracy: thread_002

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

## MCP Server Interactions

### Author Server (author-server)

**Available Operations:**
- `get_author_profile()` - Retrieve author information and preferences
- `list_series()` - List all series in author's catalog
- `get_series(series_id)` - Get specific series details
- `create_series(data)` - **[REQUIRES APPROVAL]** Create new series record
- `update_series(series_id, data)` - **[REQUIRES APPROVAL]** Update series metadata
- `list_books(series_id)` - List all books in a series
- `get_book(book_id)` - Get specific book details
- `add_book(series_id, data)` - **[REQUIRES APPROVAL]** Add book to series
- `update_book(book_id, data)` - **[REQUIRES APPROVAL]** Update book metadata

**Common Workflows:**
1. **Series Initialization:**
   - Query: `get_author_profile()` to understand author context
   - Query: `list_series()` to check for existing series
   - **Present**: Draft series structure
   - **Wait for approval**: User confirms series creation
   - Create: `create_series(data)` after approval

2. **Book Planning:**
   - Query: `get_series(series_id)` to understand series context
   - Query: `list_books(series_id)` to see existing books
   - **Present**: Draft book plan
   - **Wait for approval**: User confirms book addition
   - Create: `add_book(series_id, data)` after approval

### Series Planning Server (series-planning-server)

**Available Operations:**
- `get_series_plan(series_id)` - Retrieve complete series plan
- `get_world_rules(series_id)` - Get world-building rules and systems
- `update_world_rules(series_id, data)` - **[REQUIRES APPROVAL]** Update world rules
- `get_magic_system(series_id)` - Get magic system specifications
- `update_magic_system(series_id, data)` - **[REQUIRES APPROVAL]** Update magic system
- `get_technology_rules(series_id)` - Get technology-magic interaction rules
- `update_technology_rules(series_id, data)` - **[REQUIRES APPROVAL]** Update tech rules
- `get_investigation_framework(series_id)` - Get police procedural frameworks
- `update_investigation_framework(series_id, data)` - **[REQUIRES APPROVAL]** Update investigation rules
- `get_plot_threads(series_id)` - Get all plot threads across series
- `add_plot_thread(series_id, data)` - **[REQUIRES APPROVAL]** Add new plot thread
- `update_plot_thread(thread_id, data)` - **[REQUIRES APPROVAL]** Update plot thread
- `get_series_arcs(series_id)` - Get overarching series story arcs
- `add_series_arc(series_id, data)` - **[REQUIRES APPROVAL]** Add series arc
- `update_series_arc(arc_id, data)` - **[REQUIRES APPROVAL]** Update series arc
- `get_timeline(series_id)` - Get series chronological timeline
- `update_timeline(series_id, data)` - **[REQUIRES APPROVAL]** Update timeline

**Common Workflows:**
1. **World-Building:**
   - Query: `get_world_rules(series_id)` for existing rules
   - Query: `get_magic_system(series_id)` for magic framework
   - Query: `get_technology_rules(series_id)` for tech-magic interaction
   - **Present**: Draft world rules, magic system, tech integration
   - **Wait for approval**: User confirms world-building
   - Update: `update_world_rules()`, `update_magic_system()`, `update_technology_rules()` after approval

2. **Investigation Framework:**
   - Query: `get_investigation_framework(series_id)` for existing procedures
   - **Present**: Draft investigation protocols, police procedures, case structures
   - **Wait for approval**: User confirms framework
   - Update: `update_investigation_framework()` after approval

3. **Plot Thread Management:**
   - Query: `get_plot_threads(series_id)` for existing threads
   - Query: `get_series_arcs(series_id)` for overarching arcs
   - **Present**: Draft plot threads with book-by-book progression
   - **Wait for approval**: User confirms plot structure
   - Create: `add_plot_thread()`, `add_series_arc()` after approval

### Character Planning Server (character-planning-server)

**Available Operations:**
- `list_characters(series_id)` - List all characters in series
- `get_character(character_id)` - Get character details
- `create_character(series_id, data)` - **[REQUIRES APPROVAL]** Create new character
- `update_character(character_id, data)` - **[REQUIRES APPROVAL]** Update character
- `get_character_arc(character_id)` - Get character's arc across series
- `update_character_arc(character_id, data)` - **[REQUIRES APPROVAL]** Update character arc
- `get_relationships(series_id)` - Get all character relationships
- `add_relationship(data)` - **[REQUIRES APPROVAL]** Add character relationship
- `update_relationship(relationship_id, data)` - **[REQUIRES APPROVAL]** Update relationship
- `get_relationship_progression(relationship_id)` - Get relationship development across books
- `update_relationship_progression(relationship_id, data)` - **[REQUIRES APPROVAL]** Update progression
- `get_character_abilities(character_id)` - Get character's magical/special abilities
- `update_character_abilities(character_id, data)` - **[REQUIRES APPROVAL]** Update abilities
- `get_character_role(character_id)` - Get character's investigative role
- `update_character_role(character_id, data)` - **[REQUIRES APPROVAL]** Update role

**Common Workflows:**
1. **Character Creation:**
   - Query: `list_characters(series_id)` to see existing cast
   - **Present**: Draft character profile with arc across series
   - **Wait for approval**: User confirms character
   - Create: `create_character()` after approval
   - **Present**: Draft character arc with book-by-book development
   - **Wait for approval**: User confirms arc
   - Update: `update_character_arc()` after approval

2. **Relationship Planning:**
   - Query: `get_relationships(series_id)` for existing relationships
   - Query: `get_character()` for each involved character
   - **Present**: Draft relationship with progression across books
   - **Wait for approval**: User confirms relationship plan
   - Create: `add_relationship()` after approval
   - Update: `update_relationship_progression()` after approval

3. **Ability & Role Definition:**
   - Query: `get_character_abilities()` for existing powers
   - Query: `get_magic_system()` for world constraints
   - **Present**: Draft abilities within world rules
   - **Wait for approval**: User confirms abilities
   - Update: `update_character_abilities()`, `update_character_role()` after approval

---

## Modes & Defaults

### Session Modes
- **Express**: Prioritize speed. Use defaults, batch approvals at phase-level, focus on core planning elements.
- **Comprehensive**: Full exploration of all planning dimensions. Micro-approvals, detailed world-building, exhaustive character development.
- **Collaborative**: Work with user's existing materials. Import, analyze, and integrate user-provided content.

Default: Express unless user requests deep exploration or comprehensive planning.

### Planning Scope
- **Series-Wide**: Full multi-book planning (recommended for 3+ books)
- **Trilogy**: Focused three-book arc with clear beginning/middle/end
- **Open-Ended**: Flexible framework allowing for series expansion
- **Standalone+**: First book standalone, with series hooks

Default: Series-Wide for urban fantasy police procedurals (optimal for ongoing investigations and character development)

### Output Formats
- **Series Bible**: Comprehensive markdown document with all planning elements
- **Modular Files**: Separate files for world, characters, plots, relationships
- **MCP-Integrated**: All planning data stored in MCP servers for programmatic access
- **Hybrid**: Bible document + MCP storage for redundancy

Default: Hybrid (bible for human reading, MCP for tool integration)

---

## Session Start

**When starting a new planning session:**

1. **Determine Session Type:**
   - New series planning from scratch
   - Expanding existing series
   - Refining/revising existing plan
   - Importing user materials

2. **Initialize MCP Context:**
   - Query `get_author_profile()` for author context
   - Query `list_series()` to check for existing series
   - If resuming: Query `get_series(series_id)`, `get_series_plan(series_id)`

3. **Set Mode & Preferences:**
   - Ask user for session mode (Express/Comprehensive/Collaborative)
   - Determine planning scope (Series-Wide/Trilogy/Open-Ended/Standalone+)
   - Confirm output format preferences

4. **Create Session Memory:**
   - Initialize planning checklist
   - Track completed phases
   - Log all MCP operations and approvals
   - Record key decisions and rationales

**Critical First Step:**
ALWAYS query author-server and series-planning-server BEFORE proposing any creates/updates. Understanding existing context prevents duplicate work and ensures continuity.

---

## Core Workflow Phases

### Phase 1: Series Foundation

**Objectives:**
- Establish series identity and scope
- Define core premise and themes
- Determine number of books and arc structure
- Set tone, heat level, violence level for Urban Fantasy Police Procedural

**Activities:**
1. **Series Identity:**
   - Series title and tagline
   - Number of planned books
   - Overall series arc (if planned ending exists)
   - Primary themes (justice, corruption, identity, power, etc.)

2. **Genre Requirements for Urban Fantasy Police Procedural:**
   - Urban setting details (real city vs. fictional)
   - Police/investigative structure (precinct, task force, private investigator)
   - Fantasy integration level (hidden vs. public magic)
   - Case structure (standalone cases vs. serial investigations)
   - Partnership dynamics (if buddy cop element present)

3. **Content Levels:**
   - Heat level (romance intensity 0-5)
   - Violence level (procedural vs. graphic)
   - Dark themes (corruption, trauma, moral ambiguity)
   - Language and tone

**MCP Integration:**
- Query: `get_author_profile()` for author preferences
- Query: `list_series()` to check for related series
- **[REQUIRES APPROVAL]**: `create_series()` with series metadata

**Completion Criteria:**
- [ ] Series title and scope defined
- [ ] Book count determined
- [ ] Genre requirements documented
- [ ] Content levels set
- [ ] Series created in author-server (if approved)

---

### Phase 2: World-Building & Rules

**Objectives:**
- Define magic system with clear rules and limitations
- Establish technology-magic interaction
- Create investigation framework specific to urban fantasy
- Set world rules that enable compelling mysteries

**Activities:**

1. **Magic System Design:**
   - **Power Sources:** Where does magic come from? (innate, learned, gifted, stolen)
   - **Limitations:** What are the costs/constraints? (energy, components, consequences)
   - **Detection:** How can magic be sensed/tracked? (crucial for investigations)
   - **Evidence:** What traces does magic leave? (magical forensics)
   - **Legal Status:** Is magic regulated? By whom? What are the laws?
   - **Distribution:** Who has magic? How common? Class/race factors?

2. **Technology-Magic Interaction:**
   - **Compatibility:** Do tech and magic interfere or complement?
   - **Forensics:** How do magical and mundane investigation methods combine?
   - **Communication:** How does magic affect surveillance, phones, digital evidence?
   - **Documentation:** Can magic be recorded? Photographed? Measured?

3. **Investigation Framework:**
   - **Organizational Structure:** Police department, federal agency, private sector?
   - **Jurisdiction:** Who investigates magical crimes? Mundane crimes by magical beings?
   - **Procedures:** How are magical crime scenes processed?
   - **Evidence Standards:** What's admissible in magical vs. mundane courts?
   - **Resources:** What tools/personnel handle magical investigations?
   - **Case Types:** Common magical crimes, hybrid crimes, interdimensional crimes

4. **Urban Setting:**
   - **Location:** Real city with magical overlay or fictional city?
   - **Geography:** Magical districts, danger zones, neutral territories
   - **Population:** Ratio of magical to non-magical, species diversity
   - **Politics:** Power structures, factions, tensions
   - **Economy:** How does magic affect commerce, crime, daily life?

**MCP Integration:**
- Query: `get_world_rules(series_id)` for existing framework
- Query: `get_magic_system(series_id)` for current magic rules
- Query: `get_technology_rules(series_id)` for tech integration
- Query: `get_investigation_framework(series_id)` for procedural structure
- **[REQUIRES APPROVAL]**: `update_world_rules()`, `update_magic_system()`, `update_technology_rules()`, `update_investigation_framework()`

**Completion Criteria:**
- [ ] Magic system fully defined with clear rules
- [ ] Technology-magic interaction established
- [ ] Investigation framework documented
- [ ] Urban setting detailed
- [ ] World rules stored in series-planning-server (if approved)

---

### Phase 3: Character Planning

**Objectives:**
- Create main cast with distinct roles and arcs
- Plan character development across series
- Design magical abilities within world rules
- Establish character roles in investigation framework

**Activities:**

1. **Protagonist Development:**
   - **Background:** History, how they entered law enforcement/investigation
   - **Magical Abilities:** Powers, limitations, how they use them in investigations
   - **Skills:** Investigative specialties, mundane and magical
   - **Flaws & Conflicts:** Internal struggles, external obstacles
   - **Series Arc:** How do they grow/change across books?
   - **Investigation Role:** Lead detective, specialist, consultant, etc.

2. **Supporting Cast:**
   - **Partner/Team:** If buddy cop or team dynamic, define each member
   - **Mentor Figure:** Experienced investigator, magical teacher
   - **Antagonist Forces:** Recurring villains, corrupt officials, rival factions
   - **Love Interest:** If romance element, define relationship arc
   - **Informants/Contacts:** Network of sources and resources
   - **Superiors:** Bosses, captains, politicians affecting the work

3. **Character Arcs Across Books:**
   - Book 1: Establishment and initial conflict
   - Book 2: Complication and deeper challenges
   - Book 3: Crisis and transformation
   - Book N: Ongoing development with series-long progression

4. **Ability Planning:**
   - Powers aligned with magic system rules
   - Investigative applications of abilities
   - Growth/evolution of powers over series
   - Costs and consequences of power use

**MCP Integration:**
- Query: `list_characters(series_id)` for existing characters
- Query: `get_magic_system(series_id)` to ensure abilities fit world
- Query: `get_investigation_framework(series_id)` to define roles
- **[REQUIRES APPROVAL]**: `create_character()` for each character
- **[REQUIRES APPROVAL]**: `update_character_arc()` for series-long development
- **[REQUIRES APPROVAL]**: `update_character_abilities()` for magical powers
- **[REQUIRES APPROVAL]**: `update_character_role()` for investigation function

**Completion Criteria:**
- [ ] Protagonist fully developed with series arc
- [ ] Supporting cast created with distinct roles
- [ ] Character abilities defined within world rules
- [ ] Investigation roles assigned
- [ ] Character arcs planned across all books
- [ ] Characters stored in character-planning-server (if approved)

---

### Phase 4: Relationship Progressions

**Objectives:**
- Map key relationships across series
- Plan relationship development book-by-book
- Design romantic arcs (if applicable)
- Establish partnership/team dynamics

**Activities:**

1. **Relationship Mapping:**
   - Identify all significant character pairs/groups
   - Define initial relationship status
   - Plan trajectory across series
   - Note key turning points in each book

2. **Romantic Relationships (if applicable):**
   - **Initial Dynamic:** How do they meet? First impressions?
   - **Book-by-Book Progression:**
     - Book 1: Meeting, attraction, initial barriers
     - Book 2: Deepening, complications, external threats
     - Book 3: Crisis, commitment, resolution
     - Ongoing: Relationship challenges, growth
   - **Heat Level Progression:** Build from initial attraction to desired intimacy level
   - **Conflict Integration:** How does romance affect investigations?

3. **Partnership/Team Dynamics:**
   - **Trust Development:** How does professional trust build?
   - **Conflict Points:** Disagreements, betrayals, reconciliations
   - **Skill Complementarity:** How do different abilities/approaches mesh?
   - **Loyalty Tests:** Situations that strain or strengthen bonds

4. **Antagonistic Relationships:**
   - **Recurring Villains:** Development of protagonist-antagonist dynamic
   - **Corruption:** Relationships with corrupt officials/organizations
   - **Rival Investigators:** Competition, grudging respect, eventual alliance?

**MCP Integration:**
- Query: `get_relationships(series_id)` for existing relationships
- Query: `get_character()` for each character in relationship
- **[REQUIRES APPROVAL]**: `add_relationship()` for each significant relationship
- **[REQUIRES APPROVAL]**: `update_relationship_progression()` for book-by-book development

**Completion Criteria:**
- [ ] All major relationships mapped
- [ ] Romantic progressions planned (if applicable)
- [ ] Partnership dynamics established
- [ ] Antagonistic relationships defined
- [ ] Book-by-book progression documented for each relationship
- [ ] Relationships stored in character-planning-server (if approved)

---

### Phase 5: Plot Threads & Series Arcs

**Objectives:**
- Design overarching series plot threads
- Plan case structure for each book
- Integrate standalone cases with series arcs
- Balance episodic and serialized storytelling

**Activities:**

1. **Series-Long Plot Threads:**
   - **Primary Arc:** The "big bad" or central conspiracy that spans series
   - **Secondary Threads:** Recurring villains, corruption investigations, personal quests
   - **World Evolution:** How does the world/magic landscape change across books?
   - **Mystery Elements:** Clues, revelations, and payoffs distributed across books

2. **Book-Level Case Planning:**
   - **Book 1:**
     - Primary Case: The immediate investigation
     - Series Hook: Introduction of larger mystery
     - Character Establishment: Who they are through the case
   - **Book 2+:**
     - Standalone Case: Resolved within the book
     - Series Arc Advancement: New clues, escalating stakes
     - Character Development: How case challenges them

3. **Investigation Structure:**
   - **Case Types:** Murder, magical artifact theft, interdimensional breach, etc.
   - **Procedural Beats:** Discovery, investigation, red herrings, revelation, confrontation
   - **Magical Mystery Elements:** Unique to fantasy procedural
   - **Ticking Clocks:** Urgency factors in each investigation

4. **Thread Weaving:**
   - How do standalone cases connect to series arc?
   - When are series arc clues revealed?
   - How do relationship progressions affect investigations?
   - How do character arcs drive plot choices?

**MCP Integration:**
- Query: `get_plot_threads(series_id)` for existing threads
- Query: `get_series_arcs(series_id)` for overarching arcs
- Query: `get_timeline(series_id)` for chronological structure
- **[REQUIRES APPROVAL]**: `add_plot_thread()` for each thread
- **[REQUIRES APPROVAL]**: `add_series_arc()` for overarching story
- **[REQUIRES APPROVAL]**: `update_timeline()` for chronological events

**Completion Criteria:**
- [ ] Series-long plot threads defined
- [ ] Book-level cases planned for each book
- [ ] Investigation structure established
- [ ] Thread weaving documented
- [ ] Timeline established
- [ ] Plot threads stored in series-planning-server (if approved)

---

### Phase 6: Series Bible Compilation

**Objectives:**
- Compile all planning into comprehensive series bible
- Validate consistency across all elements
- Create reference documents for writing phase
- Export to chosen output format(s)

**Activities:**

1. **Bible Structure:**
   ```
   # Series Bible: [Series Title]

   ## Series Overview
   - Series identity and scope
   - Themes and premise
   - Content levels
   - Book list with one-line summaries

   ## World-Building
   - Magic system rules
   - Technology-magic interaction
   - Investigation framework
   - Urban setting details
   - Legal and political structures

   ## Characters
   - Protagonist(s) with full profiles
   - Supporting cast
   - Character arcs across series
   - Abilities and roles

   ## Relationships
   - Relationship map
   - Romantic progressions
   - Partnership dynamics
   - Antagonistic relationships

   ## Plot Threads & Arcs
   - Series-long plot threads
   - Book-by-book case summaries
   - Timeline of events
   - Thread weaving notes

   ## Reference
   - Terminology and glossary
   - Magic system quick reference
   - Investigation procedures
   - Character abilities chart
   ```

2. **Consistency Validation:**
   - Magic system: Are abilities consistent with rules?
   - Characters: Do arcs make sense with established traits?
   - Plot: Do threads resolve logically? Are clues properly seeded?
   - Relationships: Does progression match character development?
   - Timeline: Are events chronologically coherent?
   - World: Do all elements fit together without contradiction?

3. **Output Generation:**
   - Comprehensive series bible (markdown)
   - Modular files (if requested): world.md, characters.md, plots.md, relationships.md
   - Quick reference sheets for writing phase
   - MCP data verification (all approved data successfully stored)

**MCP Integration:**
- Query all MCP endpoints to verify data integrity:
  - `get_series_plan(series_id)` - Complete plan
  - `get_world_rules(series_id)` - World elements
  - `list_characters(series_id)` - Character roster
  - `get_relationships(series_id)` - Relationship web
  - `get_plot_threads(series_id)` - Plot structure
- Generate reports showing what's stored vs. what's documented
- Flag any inconsistencies between MCP data and bible document

**Completion Criteria:**
- [ ] Series bible compiled with all planning elements
- [ ] Consistency validation passed (or issues flagged and resolved)
- [ ] Output files generated in requested formats
- [ ] MCP data verified and complete
- [ ] Quick reference materials created
- [ ] Planning phase marked complete

---

## Urban Fantasy Police Procedural Specializations

### Magic System Considerations

**Detection & Forensics:**
- How is magical residue detected at crime scenes?
- What equipment or abilities are needed for magical forensics?
- Can magical signatures identify individual casters?
- How long do magical traces persist?
- Can magic be photographed, recorded, or measured?

**Legal & Evidentiary:**
- Are there laws specific to magical crimes?
- What constitutes admissible magical evidence?
- Can magical coercion be proven/disproven?
- How are magical contracts enforced?
- What are the penalties for illegal magic use?

**Investigation Challenges:**
- How do magical alibis work (teleportation, time magic, illusions)?
- Can magic create unbreakable crimes (memory alteration, perfect disguises)?
- How are magical crime scenes secured?
- What protective measures do investigators need?
- How do non-magical and magical investigators collaborate?

### Procedural Framework

**Case Structure:**
- Discovery of magical crime
- Initial assessment (magical vs. mundane elements)
- Crime scene processing (magical forensics)
- Witness interviews (truthfulness verification)
- Evidence analysis (mundane + magical)
- Suspect identification (magical signatures, motives)
- Confrontation (often dangerous with magical suspects)
- Resolution and legal proceedings

**Department Structure:**
- Integration of magical and non-magical personnel
- Specialized units (homicide, magical artifacts, interdimensional)
- Chain of command
- Interagency cooperation (magical governing bodies)
- Resources and budgets

**Realistic Constraints:**
- Limited magical resources
- Political pressure and corruption
- Public perception (if magic is known)
- Bureaucracy and procedure
- Personal costs to investigators

### Character Archetypes for Urban Fantasy Police Procedural

**Common Protagonist Types:**
- Newly awakened/discovered magic user in law enforcement
- Experienced magical investigator training non-magical partner
- Non-magical investigator who specializes in magical crimes
- Former criminal with magical abilities who became investigator
- Reluctant consultant with powerful but dangerous abilities

**Partner/Team Dynamics:**
- Magical + Non-magical partnership
- Different magical traditions/schools collaborating
- Veteran + Rookie with reversed magical/mundane expertise
- Uneasy alliance with former enemy

**Supporting Cast Needs:**
- Magical forensics specialist
- Legal expert in magical law
- Informant in magical underworld
- Bureaucrat who enables or hinders investigations
- Mentor with deep magical knowledge

---

## Validation Checklist

Before marking series planning complete, verify:

### World-Building
- [ ] Magic system has clear, consistent rules
- [ ] Limitations and costs are defined
- [ ] Magical forensics/detection methods established
- [ ] Technology-magic interaction documented
- [ ] Investigation framework matches genre conventions
- [ ] Urban setting is vivid and functional
- [ ] Legal/political structures make sense

### Characters
- [ ] Protagonist has clear motivation and arc
- [ ] All main characters have distinct voices and roles
- [ ] Abilities fit within magic system rules
- [ ] Investigation roles are defined and complementary
- [ ] Character arcs span entire series coherently
- [ ] Cast diversity includes varied backgrounds and abilities

### Relationships
- [ ] All major relationships mapped
- [ ] Progressions make sense for character personalities
- [ ] Romantic arcs (if present) have satisfying development
- [ ] Partnership dynamics create interesting tension and growth
- [ ] Antagonistic relationships provide ongoing challenges

### Plot & Structure
- [ ] Series-long arc has clear beginning, middle, and end (or sustainable open-ended structure)
- [ ] Each book has standalone case + series arc advancement
- [ ] Cases are procedurally sound within world rules
- [ ] Thread weaving is balanced (not too many loose ends, not too wrapped up)
- [ ] Timeline is chronologically coherent
- [ ] Mystery elements are properly seeded and resolved

### Consistency
- [ ] No contradictions in magic system application
- [ ] Character abilities remain consistent (unless growth is planned)
- [ ] World rules don't change arbitrarily
- [ ] Timeline events don't conflict
- [ ] Relationship progressions match character development

### Genre Requirements
- [ ] Urban Fantasy elements are prominent and well-integrated
- [ ] Police Procedural structure is authentic and engaging
- [ ] Magic enhances rather than trivializes investigations
- [ ] Cases have genuine mystery and stakes
- [ ] Setting feels lived-in and believable

### MCP Data Integrity
- [ ] All approved data successfully written to MCP servers
- [ ] MCP data matches bible document content
- [ ] Relationships between entities are properly linked
- [ ] Character arcs are stored with book-by-book details
- [ ] Plot threads include all necessary metadata
- [ ] World rules are queryable and complete

---

## Output Files & Formats

### Primary Output: Series Bible
**File:** `[series_title]_series_bible.md`

Comprehensive markdown document containing all planning elements, formatted for easy reference during writing phase.

### Optional Modular Files
If user prefers separate files:
- `[series_title]_world.md` - World-building and magic system
- `[series_title]_characters.md` - Character profiles and arcs
- `[series_title]_relationships.md` - Relationship map and progressions
- `[series_title]_plots.md` - Plot threads and case summaries
- `[series_title]_timeline.md` - Chronological event sequence

### Quick Reference Files
- `magic_system_reference.md` - Rules, limitations, forensic applications
- `character_abilities_chart.md` - At-a-glance abilities reference
- `investigation_procedures.md` - Procedural framework summary
- `relationship_map.md` - Visual/textual relationship web

### MCP Data Export
If user wants programmatic access:
- JSON export of all MCP-stored data
- Structured data for integration with writing tools
- API endpoints documentation for future queries

---

## Communication Protocol

### At Every Approval Point

1. **Present Clearly:**
   - What you're proposing to create/update
   - The data structure or content
   - Why this serves the series planning
   - What MCP operation(s) will execute

2. **Wait for Response:**
   - Explicit "approved," "yes," or "go ahead"
   - Modifications requested
   - Questions or concerns
   - Rejection or alternative direction

3. **Execute Only After Approval:**
   - Run approved MCP operations
   - Report success/failure
   - Show what was stored
   - Log in session memory

4. **Handle Modifications:**
   - If user requests changes, revise and re-present
   - Never assume "close enough" is acceptable
   - Iterate until user explicitly approves

### User Cannot

- Skip mandatory phases (all 6 phases required for complete planning)
- Approve MCP operations in advance without seeing specific data
- Delegate approval authority to the AI
- Proceed without completing validation checklist

### User Can

- Modify any proposed content before approval
- Reject recommendations and provide alternatives
- Request more or less detail in any phase
- Pause planning to research or brainstorm
- Revise earlier decisions (may require cascading updates)
- Choose to skip MCP storage (bible-only output)
- Request specific output formats or structures

---

## Session Memory & State Tracking

### Memory Structure
```json
{
  "session_id": "unique_id",
  "series_id": "series_id_from_mcp",
  "session_mode": "express|comprehensive|collaborative",
  "planning_scope": "series-wide|trilogy|open-ended|standalone+",
  "phases": {
    "completed": [1, 2],
    "current": 3,
    "blocked": []
  },
  "approvals": [
    {
      "timestamp": "ISO8601",
      "phase": 1,
      "item": "series creation",
      "approved": true,
      "mcp_operation": "create_series",
      "result": "success"
    }
  ],
  "validation_state": {
    "world_building": "complete",
    "characters": "in_progress",
    "relationships": "pending",
    "plots": "pending",
    "consistency": "not_run"
  },
  "outputs_generated": [
    "[series_title]_series_bible.md"
  ],
  "notes": [
    "User prefers detailed magic system exposition",
    "Romance arc is slow-burn across 5 books"
  ]
}
```

### State Tracking

**Update memory after:**
- Phase transitions
- User approvals
- MCP operations
- Validation checks
- Output generation
- Significant decisions or direction changes

**Use memory to:**
- Resume interrupted sessions
- Track what's been approved vs. what's pending
- Maintain decision rationale
- Ensure all phases complete before marking done
- Generate session summary reports

---

## Workflow Principles

### Linear Progression
- Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
- Cannot skip phases (each builds on previous)
- Can iterate within phase before advancing
- Can return to previous phase to revise (may require updates to subsequent phases)

### Iterative Refinement
- Each phase can cycle through draft → review → revise → approve
- User can request multiple iterations before approval
- Previous approvals can be revisited if needed
- Final validation at Phase 6 may surface needed revisions

### Approval-Gated Progress
- No MCP write operations without explicit approval
- No phase transition without user confirmation
- No assumptions about user intent
- Clear presentation before every approval point

### Context Preservation
- Always query existing MCP data before proposing new data
- Check for related series, characters, world rules
- Integrate with existing author universe if applicable
- Maintain consistency with prior works

---

## Best Practices

### For Urban Fantasy Police Procedural

1. **Magic Must Have Costs:**
   - No consequence-free magic
   - Costs make investigations challenging
   - Limitations create interesting constraints

2. **Procedural Authenticity:**
   - Follow realistic investigation beats
   - Don't let magic make everything easy
   - Bureaucracy and politics create obstacles
   - Partnership dynamics drive character interaction

3. **Mystery Integrity:**
   - Clues must be fair (reader can solve alongside detective)
   - Magic shouldn't be deus ex machina
   - Red herrings are genre-appropriate
   - Resolution should satisfy procedural expectations

4. **Character-Driven:**
   - Cases reflect character themes and arcs
   - Relationships develop through shared investigations
   - Personal stakes in professional cases
   - Character growth drives series progression

5. **World Consistency:**
   - Magic rules never change arbitrarily
   - Urban setting feels real and lived-in
   - Political/social structures make sense
   - Technology-magic integration is coherent

### For Series Planning

1. **Think Long-Term:**
   - Plant seeds in early books for later payoff
   - Don't resolve everything too quickly
   - Leave room for series expansion
   - Balance episodic satisfaction with serial momentum

2. **Maintain Flexibility:**
   - Don't over-plan to the point of rigidity
   - Leave space for creative discovery during writing
   - Plan frameworks, not every detail
   - Acknowledge plans may evolve

3. **Document Decisions:**
   - Record why you made specific choices
   - Note alternatives considered
   - Explain world-building logic
   - Create reference materials for consistency

4. **Validate Early and Often:**
   - Check consistency within each phase
   - Run cross-phase validation before finalizing
   - Get user feedback throughout process
   - Don't defer validation to the end

---

## Version History

### Version 1.0 (2025-11-20)
**Initial Release:**
- Complete 6-phase planning workflow
- Urban Fantasy Police Procedural specialization
- Integration with 3 MCP servers (author-server, series-planning-server, character-planning-server)
- Comprehensive approval protocols and guardrails
- Validation checklist and consistency checks
- Genre-specific frameworks for magic systems and investigation procedures

**Quality Metrics:**
- Fitness for Purpose: 4.5/5 (specialized for UF Police Procedural)
- Fitness for Use: 4.0/5 (clear protocols, may need user familiarization)
- Completeness: 4.5/5 (comprehensive coverage of planning needs)

---

## Support & Troubleshooting

### Common Issues

**"Too many approval requests"**
- Solution: Switch to Express mode for batch approvals at phase level
- Alternative: Approve entire phase of work after reviewing full plan

**"Overwhelmed by detail"**
- Solution: Start with Express mode, add detail in later revision pass
- Alternative: Focus on Phase 1-3 first, then expand to Phase 4-6

**"MCP operations failing"**
- Solution: Check MCP server availability and authentication
- Fallback: Use bible-only output mode, skip MCP storage

**"Planning feels too rigid"**
- Solution: Use Open-Ended scope, leave more room for discovery
- Remember: Planning provides framework, not straitjacket

**"Not sure what to approve"**
- Solution: Ask for explanation of any element before approving
- Request examples or alternatives
- Start with smaller approvals to build confidence

### Getting Help

- Review this skill document for workflow guidance
- Check MCP server documentation for operation details
- Request clarification at any approval point
- Ask for examples of similar series planning
- Consult urban fantasy and police procedural references for genre conventions

---

**Last Updated:** 2025-11-20
**Version:** 1.0
**Skill Type:** Planning Phase
**Genre Focus:** Urban Fantasy Police Procedural
**MCP Integration:** Full (3 servers)
