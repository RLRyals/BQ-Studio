---
name: chapter-planning
description: Plan individual chapters from ideation to complete planning documentation. Use when the user wants to develop a chapter's structure, scenes, character knowledge states, investigation steps, and information reveals. This is the PLANNING phase only - no prose writing. Triggers include phrases like "plan chapter X," "develop chapter structure," "map out scenes," or requests for chapter planning before writing begins.
metadata:
  version: "1.0"
  phase: "planning"
  mcps: ["chapter-planning-server", "book-planning-server", "character-planning-server"]
---

# Chapter Planning Skill

Progressive workflow for planning individual chapters from initial objectives through complete planning documentation. This skill focuses EXCLUSIVELY on the planning phase and does NOT include prose writing.

---

## Core Principles

### Planning vs. Writing Separation
**CRITICAL: This skill is for PLANNING ONLY, not writing prose.**

- **Planning Phase** (this skill): Chapter objectives, scene structure, character knowledge states, investigation tracking, information reveals
- **Writing Phase** (separate skill): Converting plans into narrative prose with dialogue, description, and pacing

**Never conflate planning with writing. Always complete planning and get approval before any prose generation.**

---

## MCP Server Architecture

This skill interacts with THREE MCP servers:

### 1. Chapter Planning Server (Primary)
**Endpoint:** `chapter-planning-server`
**Purpose:** Manage chapter-specific planning data

**Operations:**
- `get_chapter_list` - Retrieve all chapters for a book
- `get_chapter` - Get complete chapter planning data
- `create_chapter` - Create new chapter planning record
- `update_chapter` - Update chapter objectives, status, metadata
- `add_scene` - Add scene to chapter's scene sequence
- `update_scene` - Update scene details (location, characters, objectives)
- `delete_scene` - Remove scene from chapter
- `reorder_scenes` - Change scene sequence order
- `add_information_reveal` - Track what information is revealed to readers
- `get_investigation_steps` - Get investigation progression for chapter

**Data Structure:**
```json
{
  "chapter_id": "book-1-chapter-3",
  "chapter_number": 3,
  "chapter_title": "The First Lead",
  "objectives": {
    "plot": ["Detective discovers first clue", "Establish connection to victim"],
    "character": ["Show detective's investigative process", "Reveal backstory element"],
    "investigation": ["Introduce key witness", "Plant red herring"]
  },
  "scenes": [
    {
      "scene_id": "scene-3-1",
      "order": 1,
      "location": "victim's apartment",
      "characters": ["Detective Jane", "CSI Tech"],
      "time": "morning",
      "objectives": ["Process crime scene", "Discover hidden safe"],
      "pov_character": "Detective Jane"
    }
  ],
  "information_reveals": [
    {
      "reveal_id": "reveal-3-1",
      "information": "Victim had secret storage location",
      "scene_id": "scene-3-1",
      "reveal_method": "visual discovery",
      "reader_knows": true,
      "character_knows": ["Detective Jane", "CSI Tech"]
    }
  ],
  "status": "planning_in_progress"
}
```

### 2. Book Planning Server
**Endpoint:** `book-planning-server`
**Purpose:** Access book-level context and structure

**Operations:**
- `get_book` - Retrieve book metadata and structure
- `get_chapter_list` - Get all chapters in sequence
- `get_act_structure` - Understand where chapter fits in larger arc
- `get_plot_threads` - See active plot threads for this chapter
- `get_character_arcs` - Track character development across chapters

**Use When:**
- Need to understand chapter's role in overall book structure
- Validating chapter objectives align with act/book goals
- Checking continuity with previous/next chapters
- Ensuring plot thread consistency

### 3. Character Planning Server
**Endpoint:** `character-planning-server`
**Purpose:** Track character knowledge states and development

**Operations:**
- `get_character` - Get character profile and current state
- `get_character_knowledge` - What character knows at chapter start
- `update_character_knowledge` - Track what character learns in chapter
- `get_character_relationships` - Character dynamics at this point
- `track_character_arc` - Where character is in their development

**CRITICAL USE CASE: Knowledge State Tracking**
```json
{
  "character_id": "detective-jane",
  "chapter_id": "book-1-chapter-3",
  "knowledge_at_chapter_start": {
    "knows_victim_identity": true,
    "knows_cause_of_death": true,
    "knows_about_secret_safe": false,
    "suspects_inside_job": false
  },
  "knowledge_gained_in_chapter": {
    "knows_about_secret_safe": {
      "revealed_in": "scene-3-1",
      "how_learned": "visual discovery during crime scene investigation"
    },
    "suspects_inside_job": {
      "revealed_in": "scene-3-2",
      "how_learned": "witness statement contradiction"
    }
  },
  "knowledge_at_chapter_end": {
    "knows_victim_identity": true,
    "knows_cause_of_death": true,
    "knows_about_secret_safe": true,
    "suspects_inside_job": true
  }
}
```

---

## MANDATORY GUARDRAILS

### Permission Protocol
**ALWAYS ASK PERMISSION before ANY MCP create/add/update operation.**

**Before EVERY write operation:**
1. Present what you plan to create/update
2. Show the complete data structure
3. Wait for explicit user approval
4. Only proceed after receiving "approved" or equivalent confirmation

**Example Permission Request:**
```
I'm ready to create the chapter planning record with the following data:

Chapter: 3 - "The First Lead"
Objectives:
  - Plot: Detective discovers first clue, Establish connection to victim
  - Character: Show detective's investigative process, Reveal backstory element

Scenes: 2 scenes planned
Information Reveals: 3 reveals tracked

May I proceed with creating this chapter record via chapter-planning-server?
```

**NEVER:**
- Create or update MCP data without explicit permission
- Batch multiple operations without per-operation approval
- Assume user wants data persisted
- Skip permission for "small" changes

**Read Operations (No Permission Required):**
- Getting chapter data
- Querying character knowledge
- Retrieving book structure
- Checking existing scenes

### Data Validation Before Write
Before requesting permission to write, validate:
- All required fields are present
- Scene order is sequential
- Character knowledge progression is logical
- Information reveals are mapped to specific scenes
- No duplicate IDs
- Timestamps are properly formatted

---

## AUTOMATIC ID MANAGEMENT

### ID Discovery on Session Start

**Skills automatically handle ID resolution - users never interact with IDs directly.**

When a session starts, this skill:
1. **Queries MCP servers** to discover existing entities (books, chapters, characters, scenes)
2. **Caches IDs in session memory** for the duration of the workflow
3. **Builds human-readable mappings** (name → ID) for transparent resolution

**Example Discovery Process:**
```
Session Start:
→ Query book-planning-server.get_book(book_id)
→ Cache: book_id = "book_001"
→ Query chapter-planning-server.get_chapter_list(book_id)
→ Cache: "Chapter 3" → chapter_id = "ch_003"
→ Query character-planning-server.list_characters()
→ Cache: "Detective Jane" → char_id = "char_001", "CSI Mike" → char_id = "char_005"
→ Query chapter-planning-server.get_scene(chapter_id)
→ Cache: "Scene 1: Crime Scene" → scene_id = "scene_003_001"
```

**Cached IDs for Chapter Planning:**
- `book_id` - Current book identifier
- `chapter_id` - Current chapter identifier
- `character_ids` - Map of character names to IDs
- `scene_ids` - Map of scene descriptions to IDs

### Transparent ID Resolution

**Users interact with names, skills handle ID translation.**

When a user says: *"Add a crime scene investigation scene for Detective Jane in Chapter 5"*

The skill:
1. **Accepts human input:** "Chapter 5", "Detective Jane", "crime scene investigation"
2. **Resolves chapter context:** Uses cached mapping to get `chapter_id = "ch_005"`
3. **Resolves character:** Uses cached mapping to get `char_id = "char_001"`
4. **Creates scene:** Calls `add_scene(ch_005, {location: "crime scene", characters: ["char_001"], ...})`
5. **Caches new ID:** "Scene 1: Crime Scene" → `scene_005_001`
6. **Responds to user:** "Scene added to Chapter 5: Detective Jane investigates crime scene."

**User never sees:** `ch_005`, `char_001`, `scene_005_001`, or any other ID value.

**Future references** to "the crime scene scene" are automatically resolved to `scene_005_001` by the skill.

### Session State Management

**What IDs are cached during workflow:**

| Phase | IDs Cached | Refresh Trigger |
|-------|-----------|-----------------|
| Phase 1: Chapter Context | `book_id`, `chapter_id`, `act_id` | Chapter loaded |
| Phase 2: Scene Sequence | `scene_ids` (all scenes in order) | Scene added/reordered |
| Phase 3: Character Knowledge | `character_ids`, `knowledge_state_ids` | Knowledge updated |
| Phase 4: Information Reveals | `reveal_ids` | Reveal added |
| Phase 5: Investigation Tracking | `investigation_step_ids` | Step added |
| Phase 6: Planning Documentation | All above IDs validated | Planning complete |

**ID Refresh Strategy:**
- IDs are refreshed after any MCP write operation that creates new entities
- Scene order changes trigger re-caching of scene sequence
- Character knowledge updates refresh knowledge state mappings
- Session memory persists across phase transitions

**How IDs are passed between phases:**
```
Phase 2 creates "Scene 1: Apartment Search" → scene_id cached
Phase 3 tracks what Jane learns in Scene 1 → scene_id auto-resolved
Phase 4 logs reveal in Scene 1 → scene_id auto-resolved
User never manages IDs manually
```

### User Experience

**User says:** *"In Scene 2, Detective Jane discovers the hidden safe"*

**Skill translation (invisible to user):**
```
1. Resolve "Scene 2" → scene_id = "scene_003_002"
2. Resolve "Detective Jane" → character_id = "char_001"
3. MCP call: chapter-planning-server.add_information_reveal({
     scene_id: "scene_003_002",
     character_id: "char_001",
     reveal: "hidden safe discovery",
     ...
   })
4. MCP call: character-planning-server.update_character_knowledge({
     character_id: "char_001",
     learns: "safe exists behind painting",
     ...
   })
5. Response: "Reveal added: Jane discovers hidden safe in Scene 2."
```

**User never sees or types:**
- `scene_003_002`
- `char_001`
- Any other ID values

**Throughout the workflow:**
- User: "What does Jane know at the start of Scene 3?"
- Skill: Queries `character-planning-server.get_character_knowledge(char_001, scene_003_003_start)`
- User: "Move the safe discovery to Scene 1"
- Skill: Updates reveal with `scene_id = scene_003_001`

**IDs are completely abstracted from user interaction.**

### Auto-Generated ID Reference (Optional)

**For transparency, skills can optionally generate ID reference documents.**

**Example: `.claude/session/chapter_3_id_reference.md`**
```markdown
# Chapter 3 ID Reference - The First Lead

**Auto-generated reference (READ-ONLY)**
Last updated: 2025-11-20 15:10:00

## Chapter
- Chapter 3: The First Lead: ch_003

## Scenes
- Scene 1: Crime Scene Investigation: scene_003_001
- Scene 2: Witness Interview: scene_003_002

## Characters (in this chapter)
- Detective Jane: char_001
- CSI Tech Mike: char_005
- Neighbor Mrs. Chen: char_012

## Information Reveals
- Safe Discovery: reveal_003_001
- Encrypted Documents: reveal_003_002
- Neighbor Testimony: reveal_003_003

## Investigation Steps
- Crime Scene Processing: step_003_001
- Safe Discovery: step_003_002
- Witness Interview: step_003_003

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

## Chapter Planning Workflow

### Phase 1: Chapter Context & Objectives

**Step 1: Load Chapter Context**
```
MCP READ Operations:
1. book-planning-server: get_book(book_id)
   - Understand book structure and genre

2. book-planning-server: get_act_structure(book_id, act_number)
   - Understand where chapter fits in act

3. book-planning-server: get_chapter_list(book_id)
   - See adjacent chapters for continuity

4. book-planning-server: get_plot_threads(book_id)
   - Identify active plot threads for this chapter
```

**Step 2: Define Chapter Objectives**
Work with user to establish:
- **Plot Objectives**: What happens in the story
- **Character Objectives**: Character development moments
- **Investigation Objectives** (if applicable): Investigation progression
- **Thematic Objectives**: Theme exploration
- **Information Objectives**: What readers/characters learn

**Validation Questions:**
- Do objectives align with act goals?
- Do objectives advance active plot threads?
- Do objectives support character arcs?
- Are objectives achievable within one chapter?

**Output:** Clear objective list ready for MCP storage

### Phase 2: Scene Sequence Development

**Step 3: Design Scene Sequence**
For each scene, define:
- **Scene Order**: Sequential position in chapter
- **Location**: Where scene takes place
- **Characters Present**: POV + other characters
- **Time**: When scene occurs (time of day, duration)
- **Scene Objectives**: What this specific scene accomplishes
- **POV Character**: Whose perspective

**Scene Planning Template:**
```
Scene 1:
  Location: [specific location]
  Characters: [list all present]
  Time: [time of day]
  POV: [character name]
  Objectives:
    - [specific goal 1]
    - [specific goal 2]

Scene 2:
  [same structure]
```

**Validation Questions:**
- Is scene order logical?
- Do locations make sense for character movements?
- Is POV consistent (if single-POV book)?
- Do scene objectives ladder up to chapter objectives?
- Are all necessary characters present when needed?

### Phase 3: Character Knowledge Tracking

**Step 4: Map Knowledge States**
**CRITICAL FOR MYSTERIES/INVESTIGATIONS**

For EACH major character in the chapter:

```
MCP READ Operations:
1. character-planning-server: get_character(character_id)
   - Get character profile

2. character-planning-server: get_character_knowledge(character_id, chapter_id)
   - What they know at chapter START

3. Plan knowledge progression:
   - What they DON'T know at start
   - What they LEARN during chapter
   - HOW they learn it (which scene)
   - What they KNOW at chapter end
```

**Knowledge State Matrix Example:**
```
Detective Jane - Chapter 3:
  START OF CHAPTER:
    ✓ Knows victim's identity
    ✓ Knows cause of death
    ✗ Doesn't know about secret safe
    ✗ Doesn't suspect inside job

  SCENE 1:
    Learns: Secret safe exists (visual discovery)

  SCENE 2:
    Learns: Witness statements contradict (deduction)
    Suspects: Inside job possible

  END OF CHAPTER:
    ✓ Knows victim's identity
    ✓ Knows cause of death
    ✓ Knows about secret safe
    ✓ Suspects inside job
```

**Permission Request:**
```
I'm ready to update character knowledge states for 2 characters.
May I proceed with character-planning-server: update_character_knowledge() operations?
```

### Phase 4: Information Reveals

**Step 5: Track Reader Information**
Map what READERS learn vs. what CHARACTERS learn:

**Information Reveal Template:**
```json
{
  "reveal_id": "reveal-3-2",
  "information": "Safe contains evidence of embezzlement",
  "scene_id": "scene-3-2",
  "reveal_method": "character discovers and examines",
  "reader_knows": true,
  "detective_knows": true,
  "suspect_knows": true,
  "other_characters_know": false
}
```

**Types of Reveals:**
1. **Symmetric**: Reader and character learn together
2. **Reader Ahead**: Reader knows, character doesn't (dramatic irony)
3. **Character Ahead**: Character knows, reader doesn't (mystery)
4. **Delayed**: Revealed to character, explained to reader later

**Validation:**
- Is reveal method plausible?
- Is timing appropriate for pacing?
- Does reveal create intended dramatic effect?
- Are knowledge states consistent across characters?

### Phase 5: Investigation Tracking (Genre-Specific)

**Step 6: Map Investigation Progression**
For mystery/thriller genres:

```
MCP Operations:
1. chapter-planning-server: get_investigation_steps(chapter_id)
   - See existing investigation state

2. Plan investigation progression:
   - Clues discovered
   - Evidence gathered
   - Suspects identified/eliminated
   - Red herrings planted
   - Theories formed/revised
```

**Investigation Step Template:**
```
Investigation Step 1:
  Type: Clue Discovery
  What: Hidden safe behind painting
  Where: Scene 3-1, victim's apartment
  Significance: Suggests victim hiding something
  Leads To: Need to open safe (next chapter)

Investigation Step 2:
  Type: Red Herring
  What: Neighbor reports argument with victim
  Where: Scene 3-2, witness interview
  Significance: False lead (revealed in Chapter 5)
  Leads To: Investigate neighbor background
```

**Validation:**
- Does investigation progress logically?
- Are clues fair to reader?
- Are red herrings convincing?
- Does progression maintain tension?

### Phase 6: Planning Documentation

**Step 7: Compile Complete Chapter Plan**

**Final Planning Document Includes:**
1. Chapter metadata (number, title, status)
2. Chapter objectives (all categories)
3. Complete scene sequence (all scenes detailed)
4. Character knowledge matrices (all major characters)
5. Information reveals (reader and character knowledge)
6. Investigation progression (if applicable)
7. Continuity notes (connection to adjacent chapters)
8. Writing notes (tone, pacing, emphasis)

**Validation Checklist (see Phase 7 below)**

### Phase 7: Validation & Approval

**Step 8: Run Completion Checklist**

**Chapter Planning Completion Checklist:**

**Objectives:**
- [ ] Plot objectives defined and aligned with act goals
- [ ] Character objectives support character arcs
- [ ] Investigation objectives (if applicable) are clear
- [ ] Objectives are achievable within chapter scope

**Scene Sequence:**
- [ ] All scenes have clear objectives
- [ ] Scene order is logical
- [ ] Locations are specified and make sense
- [ ] Character movements between scenes are plausible
- [ ] POV is consistent (if single-POV)
- [ ] Time progression is logical

**Character Knowledge:**
- [ ] Knowledge states mapped for all major characters
- [ ] Knowledge progression is logical
- [ ] Learning methods are plausible
- [ ] No knowledge continuity errors
- [ ] Character knowledge aligns with investigation state

**Information Reveals:**
- [ ] All major reveals are tracked
- [ ] Reveal methods are specified
- [ ] Reader vs. character knowledge is clear
- [ ] Reveals support intended dramatic effects
- [ ] No accidental information leaks

**Investigation (if applicable):**
- [ ] Investigation steps are clear
- [ ] Clues are fair and discoverable
- [ ] Red herrings are plausible
- [ ] Progression maintains mystery tension
- [ ] Evidence chain is logical

**Continuity:**
- [ ] Chapter builds on previous chapter state
- [ ] Chapter sets up next chapter appropriately
- [ ] Plot threads are continuous
- [ ] Character states are consistent
- [ ] World/setting details are consistent

**Documentation:**
- [ ] All planning sections are complete
- [ ] MCP data is ready for write operations
- [ ] Writing notes are included
- [ ] User has reviewed and approved plan

**Step 9: Final Permission for MCP Write**
```
Planning is complete and validated.

Ready to write chapter planning data to MCP servers:
- chapter-planning-server: create_chapter() with [X] scenes
- chapter-planning-server: add_information_reveal() [Y] reveals
- character-planning-server: update_character_knowledge() for [Z] characters

May I proceed with writing planning data to MCP servers?
```

**Only proceed after explicit approval.**

---

## MCP Operation Reference

### Complete Operation List by Server

#### Chapter Planning Server Operations

**Read Operations (No Permission Required):**
```
get_chapter_list(book_id) → List of all chapters
get_chapter(chapter_id) → Complete chapter data
get_scene(scene_id) → Scene details
get_information_reveals(chapter_id) → All reveals for chapter
get_investigation_steps(chapter_id) → Investigation progression
```

**Write Operations (ALWAYS ASK PERMISSION):**
```
create_chapter(chapter_data) → Creates new chapter record
update_chapter(chapter_id, updates) → Updates chapter metadata/objectives
add_scene(chapter_id, scene_data) → Adds scene to chapter
update_scene(scene_id, updates) → Updates scene details
delete_scene(scene_id) → Removes scene
reorder_scenes(chapter_id, new_order) → Changes scene sequence
add_information_reveal(chapter_id, reveal_data) → Tracks information reveal
update_information_reveal(reveal_id, updates) → Updates reveal details
add_investigation_step(chapter_id, step_data) → Tracks investigation progression
```

#### Book Planning Server Operations

**Read Operations (No Permission Required):**
```
get_book(book_id) → Book metadata and structure
get_chapter_list(book_id) → All chapters in order
get_act_structure(book_id, act_number) → Act-level information
get_plot_threads(book_id) → Active plot threads
get_character_arcs(book_id) → Character development arcs
get_chapter_context(chapter_id) → Adjacent chapters and context
```

**Write Operations (Usually Not Used in Chapter Planning):**
```
update_book_metadata(book_id, updates)
update_plot_thread(thread_id, updates)
```

#### Character Planning Server Operations

**Read Operations (No Permission Required):**
```
get_character(character_id) → Character profile
get_character_knowledge(character_id, chapter_id) → Knowledge state
get_character_relationships(character_id, chapter_id) → Relationship states
get_character_arc_position(character_id, chapter_id) → Arc progress
```

**Write Operations (ALWAYS ASK PERMISSION):**
```
update_character_knowledge(character_id, chapter_id, knowledge_data) → Track learning
update_character_arc(character_id, chapter_id, arc_data) → Track development
update_character_relationship(character_id, other_id, chapter_id, relationship_data)
```

---

## Integration with Writing Phase

### Planning-to-Writing Handoff

**After Chapter Planning is Complete:**
1. All MCP data is written and validated
2. User has approved the complete plan
3. Writing phase can begin (separate skill/session)

**What Writing Phase Receives:**
- Complete scene sequence with objectives
- Character knowledge states for consistency
- Information reveal timing
- Investigation progression details
- Tone and pacing notes

**Planning Phase Does NOT:**
- Write any narrative prose
- Create dialogue
- Write scene descriptions
- Generate chapter text
- Make stylistic writing decisions

**Clear Boundary:**
```
Planning: "Detective discovers safe in Scene 1, location: behind painting, characters present: Detective Jane and CSI Tech"

Writing: "Jane ran her gloved fingers along the ornate frame. Something wasn't right. 'Hold on,' she murmured, and pressed the corner. The painting swung forward with a soft click, revealing the brushed steel face of a wall safe."
```

---

## Best Practices

### Character Knowledge Consistency
- Always check knowledge states before planning character actions
- Characters can only act on information they actually know
- Track when and how characters learn each piece of information
- Validate knowledge states don't contradict previous chapters

### Investigation Fair Play
- Clues should be discoverable by attentive readers
- Red herrings should be plausible at the time
- Investigation progression should feel earned
- Don't withhold information unfairly from readers

### Scene Efficiency
- Each scene should accomplish multiple objectives when possible
- Avoid scenes that only serve a single minor purpose
- Balance plot advancement with character development
- Consider pacing across the chapter

### Information Reveal Timing
- Front-load enough information to engage readers
- Space reveals to maintain momentum
- Save significant reveals for high-impact moments
- Balance what readers know vs. characters know

### Continuity Vigilance
- Always check previous chapter state before planning
- Validate character locations and knowledge
- Track time progression across chapters
- Maintain consistency in world details

---

## Communication Protocol

### Decision Points
At each phase, present options clearly:
- Option A: [Approach 1]
- Option B: [Approach 2]
- Option C: [Approach 3]

Wait for explicit user choice.

### Progress Updates
After each completed phase:
```
✓ Phase [X] Complete: [Phase Name]
  - [Key accomplishment 1]
  - [Key accomplishment 2]

Next: Phase [Y] - [Phase Name]
```

### Permission Requests
Before ANY write operation:
```
Ready to [operation] via [server]:
[Show complete data structure]

May I proceed? (yes/no)
```

### Validation Failures
If validation fails:
```
⚠ Validation Issue Found:
  Issue: [Specific problem]
  Location: [Where in planning]
  Impact: [Why this matters]

Suggested Fix: [Recommendation]

Would you like to:
  A) Accept suggested fix
  B) Provide alternative approach
  C) Skip this validation
```

---

## Error Handling

### MCP Connection Errors
If MCP server unavailable:
1. Inform user of connection issue
2. Continue planning in local documentation
3. Mark data as "pending MCP sync"
4. Retry write operations when connection restored

### Data Conflicts
If MCP data conflicts with plan:
1. Retrieve current MCP state
2. Show differences to user
3. Ask which version to keep
4. Reconcile and update

### Validation Failures
If planning doesn't pass validation:
1. Don't proceed to next phase
2. Present issues clearly
3. Offer solutions
4. Re-validate after fixes

---

## Example Chapter Planning Session

### User Request:
"Plan Chapter 3 where the detective discovers the victim's secret safe"

### Agent Response:

**Phase 1: Loading Context**
```
Reading book structure from book-planning-server...
✓ Book: "The Vanishing Act" (Mystery/Thriller)
✓ Chapter 3 in Act 1 (Setup)
✓ Previous chapter ended: Detective arrived at crime scene
✓ Active plot threads: Murder investigation, Hidden past

Loading investigation state...
✓ Current state: Victim identified, cause of death known
✓ Next milestone: Discover victim's secret
```

**Phase 2: Chapter Objectives**
```
Proposed objectives for Chapter 3:

Plot:
- Detective discovers hidden safe
- Safe contains encrypted documents
- Link established to victim's past

Character:
- Show detective's thoroughness
- Reveal detective's technical skills

Investigation:
- First major clue discovered
- Red herring planted (suspicious neighbor)

Do these objectives align with your vision? (yes/no/modify)
```

[User: yes]

**Phase 3: Scene Sequence**
```
Proposed scene sequence:

Scene 1: Crime Scene Investigation
  Location: Victim's apartment, study
  Characters: Detective Jane, CSI Tech Mike
  Time: Morning, 9 AM
  POV: Detective Jane
  Objectives: Process scene, discover safe

Scene 2: Witness Interview
  Location: Apartment hallway
  Characters: Detective Jane, Neighbor Mrs. Chen
  Time: Morning, 10 AM
  POV: Detective Jane
  Objectives: Gather background, plant red herring

Does this scene structure work? (yes/no/modify)
```

[User: yes]

**Phase 4: Character Knowledge**
```
Knowledge state tracking:

Detective Jane:
  At chapter start:
    ✓ Knows victim identity
    ✓ Knows cause of death
    ✗ Doesn't know about safe

  Scene 1 - Learns:
    • Safe exists (visual discovery)
    • Documents are encrypted (observation)

  Scene 2 - Learns:
    • Neighbor heard argument (testimony)
    • Victim was secretive (character detail)

  At chapter end:
    ✓ All above + safe discovery + suspect list start

Shall I track this knowledge progression? (yes/no)
```

[User: yes]

**Phase 5: Information Reveals**
```
Planned reveals:

Reveal 1: Safe Discovery
  Scene: Scene 1
  Method: Detective finds hidden safe
  Reader knows: YES (witnessed discovery)
  Detective knows: YES
  Impact: First major clue

Reveal 2: Encrypted Documents
  Scene: Scene 1
  Method: Safe opened, contents examined
  Reader knows: YES
  Detective knows: YES
  Impact: Mystery deepens

Reveal 3: Neighbor Suspicion (Red Herring)
  Scene: Scene 2
  Method: Witness testimony
  Reader knows: YES
  Detective knows: YES
  Impact: False lead (revealed Chapter 5)

Are these reveals timed appropriately? (yes/no)
```

[User: yes]

**Phase 6: Validation**
```
Running completion checklist...

✓ Objectives defined and aligned
✓ Scene sequence is logical
✓ Character knowledge tracked
✓ Information reveals mapped
✓ Investigation progression planned
✓ Continuity validated

All checks passed. Chapter planning complete.
```

**Phase 7: Final Permission**
```
Ready to write chapter planning data to MCP:

chapter-planning-server operations:
  - create_chapter(chapter_3_data) [2 scenes]
  - add_information_reveal() [3 reveals]

character-planning-server operations:
  - update_character_knowledge(detective_jane, chapter_3)

May I proceed with writing this data to MCP servers? (yes/no)
```

[User: yes]

```
✓ Chapter planning data written to MCP
✓ Character knowledge updated
✓ Planning documentation complete

Chapter 3 planning is complete. Ready to hand off to writing phase.
```

---

## Metadata & Version History

### Version 1.0 (2025-11-20)
**Initial Release**
- Complete chapter planning workflow (7 phases)
- MCP integration with 3 servers documented
- Mandatory permission protocol for all write operations
- Character knowledge state tracking
- Information reveal management
- Investigation progression tracking
- Planning/writing phase separation enforced
- Comprehensive validation checklist

---

## Quick Reference

### Planning Phase Order
1. Load context (book, act, previous chapters)
2. Define chapter objectives
3. Design scene sequence
4. Map character knowledge states
5. Track information reveals
6. Map investigation progression
7. Validate and get approval

### Permission Required For
- create_chapter()
- add_scene()
- update_scene()
- add_information_reveal()
- update_character_knowledge()
- Any write operation to any MCP server

### No Permission Required For
- get_book()
- get_chapter()
- get_character()
- get_character_knowledge()
- Any read operation from any MCP server

### Critical Guardrails
1. ALWAYS ask permission before write operations
2. NEVER write prose during planning phase
3. ALWAYS validate knowledge state consistency
4. ALWAYS check continuity with adjacent chapters
5. ALWAYS complete validation checklist before marking done

---

**Last Updated:** 2025-11-20
**Version:** 1.0
**Phase:** Planning
**MCP Servers:** chapter-planning-server, book-planning-server, character-planning-server
