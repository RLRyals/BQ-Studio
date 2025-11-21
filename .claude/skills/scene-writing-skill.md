---
name: scene-writing-skill
description: Transform approved chapter outlines into polished prose scenes with Urban Fantasy sensibilities. Use when the user wants to write scene-level prose from chapter plans, convert beats to narrative, or draft actual story content. Requires approved chapter planning documents. Tracks character knowledge evolution and maintains voice consistency across scenes.
metadata:
  version: "1.0"
  phase: "execution"
  mcps: ["scene-server", "character-planning-server", "core-continuity-server"]
---

# Scene Writing Skill

Execute prose writing from approved chapter outlines with character knowledge tracking, voice consistency, and Urban Fantasy style protocols.

---

## MANDATORY GUARDRAILS

**🚨 CRITICAL: These guardrails are non-negotiable and must be enforced at all times.**

### Pre-Writing Requirements

1. **ONLY write after chapter planning is approved**
   - ✅ Verify `chapter_outline_approved: true` in session state
   - ✅ Confirm user has explicitly approved the chapter plan
   - ❌ NEVER begin prose writing without approved outline
   - ❌ NEVER write "speculatively" or "to show options"

2. **ALWAYS check character knowledge BEFORE writing**
   - ✅ Query `character-planning-server` for POV character's current knowledge state
   - ✅ Verify what character knows, believes, and remembers at scene start
   - ✅ Check relationship awareness and emotional context
   - ❌ NEVER assume character knowledge without checking MCP
   - ❌ NEVER write dialogue/thoughts that contradict knowledge state

3. **ALWAYS ASK PERMISSION before logging to MCP**
   - ✅ Present what will be logged (scene summary, knowledge gains)
   - ✅ Wait for explicit user confirmation: "approved" or "yes"
   - ✅ Respect user's right to edit or reject logs
   - ❌ NEVER log automatically "for convenience"
   - ❌ NEVER proceed without confirmation

### Scene Integrity Requirements

4. **Maintain continuity with approved plans**
   - ✅ Follow beat sequence from chapter outline
   - ✅ Honor character arcs and emotional trajectories
   - ❌ Do not introduce new plot elements without approval
   - ❌ Do not change scene outcomes from outline

5. **Track knowledge gains during writing**
   - ✅ Note each revelation, discovery, or realization
   - ✅ Distinguish between: learns, infers, suspects, misunderstands
   - ✅ Prepare knowledge log for post-scene MCP update

---

## AUTOMATIC ID MANAGEMENT

### ID Discovery on Session Start

**Skills automatically handle ID resolution - users never interact with IDs directly.**

When a session starts, this skill:
1. **Queries MCP servers** to discover existing entities (chapters, scenes, characters, locations)
2. **Caches IDs in session memory** for the duration of the workflow
3. **Builds human-readable mappings** (name → ID) for transparent resolution

**Example Discovery Process:**
```
Session Start:
→ Query scene-server.list_scenes(chapter_id)
→ Cache: chapter_id = "ch_003"
→ Query scene-server.get_scene(scene_id)
→ Cache: "Scene 2: Rooftop Confrontation" → scene_id = "scene_003_002"
→ Query character-planning-server.list_characters()
→ Cache: "Alex" → char_id = "char_001", "Marcus" → char_id = "char_002"
→ Query core-continuity-server.list_locations()
→ Cache: "OPD Headquarters" → location_id = "loc_001", "Fae District" → location_id = "loc_005"
```

**Cached IDs for Scene Writing:**
- `chapter_id` - Current chapter identifier
- `scene_id` - Current scene identifier
- `character_ids` - Map of character names to IDs
- `location_ids` - Map of location names to IDs

### Transparent ID Resolution

**Users interact with names, skills handle ID translation.**

When a user says: *"Write the scene where Alex confronts Marcus at OPD Headquarters"*

The skill:
1. **Accepts human input:** "Alex", "Marcus", "OPD Headquarters"
2. **Resolves character IDs:** `char_001`, `char_002`
3. **Resolves location ID:** `loc_001`
4. **Queries character knowledge:** Calls `get_character_knowledge(char_001, timestamp)`
5. **Writes prose** using resolved context
6. **Logs knowledge gains:** Updates character knowledge states with resolved IDs
7. **Responds to user:** "Scene written: Alex confronts Marcus at headquarters."

**User never sees:** `char_001`, `char_002`, `loc_001`, or any other ID value.

**Throughout the scene writing process**, all ID resolution happens transparently in the background.

### Session State Management

**What IDs are cached during workflow:**

| Phase | IDs Cached | Refresh Trigger |
|-------|-----------|-----------------|
| Phase 1: Pre-Writing Setup | `chapter_id`, `scene_id`, `character_ids` | Scene loaded |
| Phase 2: Prose Drafting | `location_ids`, `knowledge_state_ids` | Scene progresses |
| Phase 3: Scene Review | `reveal_ids`, `event_ids` | Review complete |
| Phase 4: MCP Logging | All entity IDs updated | Knowledge logged |

**ID Refresh Strategy:**
- IDs are refreshed after any MCP write operation that creates new entities
- Character knowledge updates refresh knowledge state mappings
- New revelations trigger reveal ID caching
- Session memory persists across scene transitions

**How IDs are passed between phases:**
```
Phase 1 loads "Alex" → char_id cached
Phase 2 writes Alex's dialogue → char_id auto-resolved
Phase 3 reviews Alex's actions → char_id auto-resolved
Phase 4 logs what Alex learned → char_id auto-resolved
User never manages IDs manually
```

### User Experience

**User says:** *"Alex discovers the ritual site in the Fae District"*

**Skill translation (invisible to user):**
```
1. Resolve "Alex" → character_id = "char_001"
2. Resolve "Fae District" → location_id = "loc_005"
3. Query character knowledge: get_character_knowledge(char_001, current_timestamp)
   → Verify Alex doesn't already know about ritual site
4. Write prose with discovery moment
5. Track knowledge gain: "ritual site location"
6. Request permission to log:
   → log_knowledge_gain(char_001, "learns", "ritual site in Fae District")
   → log_world_establishment("locations", "ritual site at loc_005")
7. Response: "Scene written with Alex's discovery."
```

**User never sees or types:**
- `char_001`
- `loc_005`
- Any other ID values

**Throughout the workflow:**
- User: "What does Alex know now?"
- Skill: Queries `get_character_knowledge(char_001, current_scene_end)`
- User: "Write Marcus arriving at the ritual site"
- Skill: Resolves Marcus → `char_002`, ritual site → `loc_005` context

**IDs are completely abstracted from user interaction.**

### Auto-Generated ID Reference (Optional)

**For transparency, skills can optionally generate ID reference documents.**

**Example: `.claude/session/scene_writing_reference.md`**
```markdown
# Scene Writing ID Reference - Chapter 3

**Auto-generated reference (READ-ONLY)**
Last updated: 2025-11-20 15:30:00

## Active Scene
- Scene 2: Rooftop Confrontation: scene_003_002

## Characters (in active scenes)
- Alex Chen: char_001
- Marcus Blake: char_002
- Fae Informant: char_008

## Locations
- OPD Headquarters: loc_001
- Fae District: loc_005
- Ritual Site: loc_007

## Knowledge States
- Alex knowledge state at scene start: knowledge_state_001_scene_002_start
- Alex knowledge state at scene end: knowledge_state_001_scene_002_end

## Revelations
- Ritual site discovery: reveal_002_001
- Marcus's secret: reveal_002_002

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

### 1. Scene Server (`scene-server`)

**Purpose:** Manage scene lifecycle, status tracking, and prose storage.

#### Available Tools

**`list_scenes`**
- **When to use:** Session start, chapter transition, status overview
- **Parameters:** `book_id`, `chapter_id`, `status` (optional filter)
- **Returns:** List of scenes with metadata (status, word count, POV)
- **Usage pattern:**
  ```
  Query: List all scenes for Chapter 3
  Response: [scene_001: "outline", scene_002: "draft", scene_003: "outline"]
  ```

**`get_scene`**
- **When to use:** Before writing, reviewing existing prose
- **Parameters:** `scene_id`
- **Returns:** Full scene data (outline, prose, status, metadata)
- **Usage pattern:**
  ```
  Query: Get scene_003_rooftop_confrontation
  Response: {status: "outline", beats: [...], prose: null}
  ```

**`create_scene`**
- **When to use:** First time writing a new scene
- **Parameters:** `book_id`, `chapter_id`, `scene_data` (outline, POV, setting)
- **Returns:** `scene_id`
- **Usage pattern:**
  ```
  Query: Create scene for Chapter 2, Beat 3
  Action: Generates scene_002_003 with outline data
  ```

**`update_scene`**
- **When to use:** After writing prose, status changes
- **Parameters:** `scene_id`, `updates` (prose, status, word_count)
- **Returns:** Confirmation
- **Usage pattern:**
  ```
  Query: Update scene_003 with prose draft
  Action: Stores prose, sets status to "draft"
  ```

**`log_scene_event`**
- **When to use:** Significant milestones (draft complete, revision, approval)
- **Parameters:** `scene_id`, `event_type`, `details`
- **Returns:** Event logged
- **⚠️ PERMISSION REQUIRED:** Always ask before logging
- **Usage pattern:**
  ```
  Query: Log scene_003 completion
  Ask: "May I log this scene draft completion to the scene server?"
  On approval: Log event with timestamp and word count
  ```

#### Scene Status Lifecycle

```
outline → draft → revision → approved → final
```

- **outline:** Beats defined, no prose yet
- **draft:** First prose pass complete
- **revision:** Editing in progress
- **approved:** User has approved content
- **final:** No further changes expected

### 2. Character Planning Server (`character-planning-server`)

**Purpose:** Track character knowledge, beliefs, relationships, and emotional states over time.

#### Available Tools

**`get_character_knowledge`**
- **When to use:** BEFORE writing any scene (mandatory)
- **Parameters:** `character_id`, `timestamp` (scene start point in story)
- **Returns:** Complete knowledge state
  - `knows`: Confirmed facts character is aware of
  - `believes`: Character's interpretations (may be wrong)
  - `suspects`: Hunches and theories
  - `unaware_of`: Critical information character doesn't know
  - `relationships`: Awareness of other characters
  - `emotional_state`: Current feelings and context
- **Usage pattern:**
  ```
  Query: Get Alex's knowledge at Chapter 2, Scene 3 start
  Response: {
    knows: ["ritual site location", "victim identity"],
    believes: ["partner is trustworthy"],
    suspects: ["supernatural involvement"],
    unaware_of: ["partner's hidden agenda"],
    emotional_state: "frustrated but determined"
  }
  ```

**`log_knowledge_gain`**
- **When to use:** After scene writing, when character learns something
- **Parameters:** `character_id`, `timestamp`, `knowledge_type`, `content`, `source`
- **Returns:** Confirmation
- **⚠️ PERMISSION REQUIRED:** Always ask before logging
- **Knowledge types:**
  - `learns`: Direct, factual information
  - `infers`: Logical deduction
  - `suspects`: Intuition or partial info
  - `misunderstands`: Wrong conclusion
  - `forgets`: Information no longer accessible
  - `recontextualizes`: New understanding of old info
- **Usage pattern:**
  ```
  Ask: "May I log Alex's knowledge gain? She learned the victim's name and suspects fae involvement."
  On approval:
    Log 1: {type: "learns", content: "victim is Sarah Chen"}
    Log 2: {type: "suspects", content: "fae may be involved"}
  ```

**`get_relationship_awareness`**
- **When to use:** Before writing interpersonal scenes
- **Parameters:** `character_id`, `target_character_id`, `timestamp`
- **Returns:** What character knows/believes about relationship
- **Usage pattern:**
  ```
  Query: What does Alex know about her relationship with Marcus at this point?
  Response: {knows: "partners for 2 years", believes: "he's hiding something", unaware: "he's informant"}
  ```

**`update_emotional_state`**
- **When to use:** After significant emotional scenes
- **Parameters:** `character_id`, `timestamp`, `state`, `triggers`
- **Returns:** Confirmation
- **⚠️ PERMISSION REQUIRED:** Always ask before logging
- **Usage pattern:**
  ```
  Ask: "Scene shifted Alex's emotional state. May I log: 'betrayed and angry, triggered by discovering Marcus's lies'?"
  On approval: Log emotional state change
  ```

#### Character Knowledge Protocol

**Before Writing Scene:**
1. Identify POV character
2. Query `get_character_knowledge` for current state
3. Note what character CAN and CANNOT know
4. Write scene respecting these boundaries

**During Scene Writing:**
5. Track each knowledge gain as it happens
6. Note type (learns/infers/suspects/misunderstands)
7. Identify source of information

**After Scene Writing:**
8. Compile knowledge gain list
9. ASK PERMISSION: Present list to user
10. On approval: Log each gain to character-planning-server

### 3. Core Continuity Server (`core-continuity-server`)

**Purpose:** Maintain world rules, magic system, and setting consistency.

#### Available Tools

**`get_world_rules`**
- **When to use:** Before writing scenes with magic, world mechanics
- **Parameters:** `category` (magic_system, society, geography, etc.)
- **Returns:** Established world rules and constraints
- **Usage pattern:**
  ```
  Query: Get magic system rules for ritual scene
  Response: {
    fae_magic: {limitations: ["iron burns", "true names = power"], costs: ["energy drain"]},
    detection: {methods: ["residue traces", "aura sight"]}
  }
  ```

**`verify_continuity`**
- **When to use:** Before writing, when uncertain about established facts
- **Parameters:** `query` (natural language question)
- **Returns:** Confirmed canonical information
- **Usage pattern:**
  ```
  Query: "What's the established protocol for ritual crime scenes?"
  Response: "OPD requires Fae Liaison presence, evidence collected with iron-free tools"
  ```

**`log_world_establishment`**
- **When to use:** When scene introduces NEW world details
- **Parameters:** `category`, `detail`, `scene_reference`
- **Returns:** Confirmation
- **⚠️ PERMISSION REQUIRED:** Always ask before logging
- **Usage pattern:**
  ```
  Ask: "Scene establishes new detail: 'Fae can sense iron within 10 feet.' May I log to continuity?"
  On approval: Log world rule with scene reference
  ```

**`check_contradiction`**
- **When to use:** Before finalizing scene, if uncertain
- **Parameters:** `proposed_detail`
- **Returns:** Conflicts with existing continuity (if any)
- **Usage pattern:**
  ```
  Query: Check if "fae can lie directly" contradicts established rules
  Response: CONFLICT - established rule states "fae cannot speak direct lies, only misdirect"
  ```

#### Continuity Protocol

**Before Writing:**
1. Query relevant world rules for scene context
2. Verify any uncertain details
3. Note constraints that apply to scene

**During Writing:**
4. Track new world details introduced
5. Flag potential continuity questions

**After Writing:**
6. Compile list of new world establishments
7. ASK PERMISSION: Present additions to user
8. On approval: Log to core-continuity-server

---

## Scene Writing Workflow

### Phase 1: Pre-Writing Setup

**1. Verify Prerequisites**
- ✅ Chapter outline approved and loaded
- ✅ Scene beats defined
- ✅ POV character identified

**2. MCP Knowledge Check (Mandatory)**
```
Step A: Query character-planning-server
  → get_character_knowledge(character_id, timestamp)
  → Review: knows, believes, suspects, unaware_of

Step B: Query core-continuity-server
  → get_world_rules(relevant categories)
  → verify_continuity(specific questions)

Step C: Query scene-server
  → get_scene(scene_id) to load outline/beats
```

**3. Establish Scene Context**
- POV: Who's narrating?
- Setting: Physical location, time of day, atmosphere
- Emotional entry point: Character's state at scene start
- Beats to hit: Outline checkpoints

**4. Style Calibration**
- Load Urban Fantasy protocols (see Style Guide below)
- Identify mundane/magical balance for this scene
- Set voice tone: noir, procedural, personal, action

### Phase 2: Prose Drafting

**Beat-by-Beat Method**
1. Take first beat from outline
2. Expand into prose (sensory details, dialogue, interiority)
3. Check against character knowledge (does POV know this?)
4. Write next beat
5. Maintain flow between beats

**Voice Consistency Checklist**
- ✅ POV-appropriate observations (character would notice this)
- ✅ Vocabulary matches character background
- ✅ Interiority reflects current emotional state
- ✅ Sensory details grounded in character's focus

**Knowledge Tracking (During Writing)**
- 📝 Mark each time character learns something
- 📝 Note when character makes inference
- 📝 Flag when character suspects/misunderstands
- Keep running list for post-scene logging

**Continuity Checks**
- Does magic work as established?
- Are world rules respected?
- Do locations match previous descriptions?
- Query `check_contradiction` if uncertain

### Phase 3: Scene Review

**Self-Edit Pass**
1. **Beat Coverage:** All outline beats included?
2. **Pacing:** Does scene flow? Any drag points?
3. **Character Voice:** Consistent POV throughout?
4. **Sensory Grounding:** Enough concrete details?
5. **Emotional Arc:** Does scene achieve its emotional goal?

**Urban Fantasy Calibration**
6. **Mundane/Magical Balance:** Appropriate ratio?
7. **Procedural Authenticity:** Job details feel real?
8. **Juxtaposition:** Does magic enhance mundane (or vice versa)?

**Continuity Verification**
9. Query `check_contradiction` for any uncertain elements
10. Confirm character actions match knowledge state

### Phase 4: MCP Logging (Permission Required)

**🚨 ALWAYS ASK PERMISSION BEFORE THIS PHASE**

**Prepare Logging Summary:**
```
Scene: [scene_id] - [title]
Status: Draft complete
Word count: [count]

Knowledge gains for [POV character]:
1. LEARNS: [factual information]
2. INFERS: [logical deduction]
3. SUSPECTS: [hunch/theory]
4. MISUNDERSTANDS: [wrong conclusion, if any]

World establishments (if any):
- [new world rule/detail with scene reference]

Request: "May I log these updates to the MCP servers?"
```

**On Approval, Execute:**
1. `update_scene` (scene-server): Store prose, update status to "draft"
2. `log_knowledge_gain` (character-planning-server): Each knowledge item
3. `log_world_establishment` (core-continuity-server): New world details
4. `log_scene_event` (scene-server): "draft_complete" event

**On Rejection/Edits:**
- Accept user's revisions to logging data
- Re-ask permission with updated list
- Only log what user approves

---

## Urban Fantasy Style Guide

### Core Principles

**1. Mundane vs. Magical Juxtaposition**
- Magic should exist alongside ordinary life, not replace it
- Best moments: When supernatural intrudes on everyday routine
- Ground magical scenes with mundane details (phone rings during spell, coffee gets cold during interrogation)
- Characters have ordinary concerns even in extraordinary situations

**Examples:**
- ✅ "The fae blood glowed under the blacklight. Alex's phone buzzed—dispatch, again. She silenced it and bent closer to the ritual circle chalked on the parking garage floor."
- ❌ "The mystical energies swirled as the enchanted detective used her arcane powers to solve the magical crime."

**2. Procedural Authenticity**
- Detective work should feel real: interviews, evidence, paperwork
- Magic is another tool in the investigation toolkit
- Chain of custody, warrants, interdepartmental politics matter
- Characters follow (or break) institutional procedures

**Examples:**
- ✅ "She bagged the iron nail with nitrile gloves—cold iron evidence meant the Fae Liaison had to sign off before lab processing. More bureaucracy."
- ❌ "She magically solved the case with a wave of her hand."

**3. Character Grounding**
- POV character processes magic through their personal lens
- Job details: cop thinks like cop, PI thinks like PI
- Personal life bleeds into work (and vice versa)
- Emotional reactions are human even when events aren't

### Voice & Tone Spectrum

**Noir Mode** (high tension, personal stakes)
- Terse sentences, cynical observations
- Sensory details focused on atmosphere
- Internal monologue: jaded but feeling

**Procedural Mode** (investigation, world-building)
- Clear, direct prose
- Technical details without over-explaining
- Dialogue drives information gathering

**Action Mode** (confrontation, danger)
- Short paragraphs, rapid pacing
- Visceral sensory details
- Minimal interiority—character reacts in real-time

**Personal Mode** (relationship, reflection)
- Longer rhythms, emotional depth
- Character vulnerability
- Subtext in dialogue

### Sensory Detail Protocol

**Always Ground With:**
1. **Physical sensation:** What does POV character feel? (temperature, texture, pain, comfort)
2. **Immediate environment:** 2-3 concrete details per scene establishing
3. **Character-specific observations:** What would THIS character notice?

**Avoid:**
- Generic descriptions (a dark alley)
- Over-explaining (the ancient and mystical ritual from centuries past)
- Authorial intrusion (readers should note that...)

**Examples:**
- ✅ "The basement smelled like wet concrete and ozone. Alex's breath misted in the sudden cold—always happened near active fae magic."
- ❌ "The basement was mysterious and magical, filled with supernatural energy that indicated paranormal activity."

### Magical Worldbuilding Integration

**Show, Don't Info-Dump:**
- Reveal world rules through character action/observation
- Use dialogue for character-known information only
- Technical details earned through context

**Magic as Normal (to characters):**
- Characters don't marvel at everyday magic
- Treat supernatural like mundane (when routine)
- Save wonder for genuinely unusual magical events

**Examples:**
- ✅ "Alex tossed an iron filing at the threshold. It sparked blue—warded. She'd need a warrant or a battering ram blessed by a priest. The warrant was easier."
- ❌ "The magical barrier was an ancient ward that protected against intruders using mystical energies woven in the old ways of power."

---

## Scene Completion Validation

### Pre-Submission Checklist

**Content Requirements:**
- [ ] All outline beats covered
- [ ] Scene achieves intended story purpose
- [ ] POV character voice consistent
- [ ] Dialogue sounds distinct per character
- [ ] Sensory details ground each location

**Continuity Requirements:**
- [ ] Character actions match knowledge state (verified via MCP)
- [ ] World rules respected (verified via core-continuity-server)
- [ ] No contradictions with previous scenes
- [ ] Timeline/logistics make sense

**Style Requirements:**
- [ ] Urban Fantasy tone achieved (mundane/magical balance)
- [ ] Appropriate voice mode(s) used
- [ ] No info-dumps or over-explanation
- [ ] Pacing appropriate to scene type

**Technical Requirements:**
- [ ] POV maintained throughout (no head-hopping)
- [ ] Verb tense consistent
- [ ] No anachronisms (unless intentional worldbuilding)
- [ ] Clean prose (minimal typos/errors)

**MCP Logging:**
- [ ] Knowledge gains tracked
- [ ] World establishments noted
- [ ] Permission requested for logging
- [ ] Updates logged to all relevant servers (on approval)

### Post-Writing MCP State

**Scene Server:**
- Scene status: "draft" (or higher)
- Prose stored
- Word count recorded
- Event logged

**Character Planning Server:**
- All knowledge gains logged
- Emotional state updated (if significant)
- Relationship awareness updated (if relevant)

**Core Continuity Server:**
- New world details logged (if any)
- Continuity verified

---

## Knowledge Tracking Protocols

### What Constitutes a "Knowledge Gain"?

**LEARNS (Factual):**
- Direct observation: "She saw the ritual circle."
- Told information: "Marcus said the victim was fae."
- Document/evidence: "The file listed three prior cases."

**INFERS (Logical):**
- Deduction from evidence: "The pattern suggested a serial ritualist."
- Reading between lines: "His hesitation meant he was hiding something."
- Professional expertise: "The wound angle indicated left-handed attacker."

**SUSPECTS (Intuition):**
- Gut feeling: "Something felt off about his alibi."
- Pattern recognition: "This reminded her of the Northside cases."
- Incomplete info: "Maybe the Fae Court was involved."

**MISUNDERSTANDS (Wrong):**
- Incorrect conclusion: "She assumed he was guilty." (but he isn't)
- False information: "Marcus told her it was suicide." (but lied)
- Misleading evidence: "The scene looked like a break-in." (but was staged)

### Tracking During Writing

**Create Knowledge Log:**
```
Scene: [scene_id]
POV: [character_name]
Timestamp: [story position]

Knowledge Gains:
1. Type: LEARNS | Source: observation | Content: "ritual circle uses fae glyphs"
2. Type: INFERS | Source: deduction | Content: "killer has fae magic knowledge"
3. Type: SUSPECTS | Source: intuition | Content: "Marcus is hiding something"
4. Type: MISUNDERSTANDS | Source: false assumption | Content: "victim was attacked here" (actually killed elsewhere)
```

### Permission Request Format

**Present to User:**
```
Scene draft complete!

I tracked these knowledge gains for [Character]:
• LEARNS: [factual info 1]
• LEARNS: [factual info 2]
• INFERS: [logical deduction]
• SUSPECTS: [hunch]

May I log these to the character-planning-server?
```

**Wait for:** "approved" / "yes" / edits

**On Approval:** Execute MCP logs

---

## Error Recovery & Edge Cases

### Scenario: Wrote Without Checking Knowledge

**If you realize mid-scene:**
1. STOP writing
2. Query `get_character_knowledge` immediately
3. Review drafted prose for violations
4. Revise before continuing

**If user catches it:**
1. Acknowledge error
2. Query correct knowledge state
3. Offer to revise problematic sections
4. Implement user-approved fixes

### Scenario: Continuity Conflict Discovered

**If `check_contradiction` returns conflict:**
1. Present conflict to user clearly
2. Options:
   - A: Revise scene to match continuity
   - B: Retcon previous continuity (if user approves)
   - C: Find creative solution that honors both
3. Document resolution in continuity log

### Scenario: User Denies Logging Permission

**Respect the decision:**
- Scene prose is still saved (user's local state)
- MCP servers not updated
- No knowledge tracking in system
- User takes responsibility for manual continuity

**Optional Offer:**
- "Would you like me to save the knowledge log locally for your reference?"

### Scenario: Outline Beat Doesn't Work in Prose

**Surface the issue:**
- "Beat 3 (confrontation on rooftop) creates a logic problem: Alex doesn't know about the rooftop location yet."

**Propose solutions:**
- A: Add a knowledge gain earlier (someone tells her)
- B: Change location to somewhere she would go
- C: Revise outline beat

**Wait for user decision before proceeding**

---

## Session Management

### Starting a Scene Writing Session

**1. Verify Prerequisites**
```
User request: "Write Chapter 3, Scene 2"

Check:
- [ ] Chapter 3 outline exists and is approved
- [ ] Scene 2 beats are defined
- [ ] POV character identified
```

**2. Load Context**
```
Query scene-server: get_scene(scene_002)
Query character-planning-server: get_character_knowledge(POV_char, timestamp)
Query core-continuity-server: get_world_rules(relevant)
```

**3. Confirm Ready State**
"I've loaded Scene 2's outline and [Character]'s knowledge state. Ready to write. Should I proceed with the draft?"

### During Scene Writing

**Progress Updates (Optional):**
- After each major beat: "Beat 1 (arrival at scene) complete, moving to Beat 2 (evidence discovery)."
- Keep user informed without over-reporting

**Real-Time Questions:**
- If continuity uncertainty arises: ASK immediately
- If character would need knowledge they don't have: STOP and ask
- If outline beat seems problematic: FLAG before writing

### Completing a Scene

**1. Present Draft**
- Share complete prose
- Note word count
- Identify any uncertainties/questions

**2. Request Feedback**
- "Scene draft complete. Would you like revisions, or should I proceed to logging?"

**3. Permission Phase**
- Present knowledge gains and world establishments
- Request MCP logging permission
- Execute on approval

**4. Status Update**
- "Scene 2 draft logged. Scene status: draft. Ready for Scene 3 or would you like to revise Scene 2?"

---

## Multi-Scene Workflow

### Writing Multiple Scenes in Sequence

**After Scene N completes:**
1. Log knowledge gains (with permission)
2. Brief recap: "Scene N covered [beats]. [Character] now knows [key info]."
3. Transition: "Ready for Scene N+1?"

**Maintain Continuity:**
- Each scene starts with updated character knowledge
- Emotional states carry forward (unless time jump)
- World establishments from previous scenes are canon

### Batch Writing (Advanced)

**If user requests multiple scenes:**
1. Plan approach: "Should I draft all 3 scenes then request logging, or log after each?"
2. Track cumulative knowledge gains
3. Flag any cross-scene continuity needs

---

## Collaboration with Other Skills

### Integration with Series Architect

**Series Architect produces:**
- Chapter outlines with beats
- Character knowledge baselines
- World rules documentation

**Scene Writing consumes:**
- Approved outlines
- Character dossiers
- World bible entries

**Handoff point:**
- After Stage 5 (Book-Level Development) completes
- Chapter plans approved and finalized

### Integration with Character Planning MCP

**Character Planning Server owns:**
- Knowledge state truth
- Relationship awareness
- Emotional trajectory

**Scene Writing:**
- Queries (read-only) before writing
- Proposes additions after writing (with permission)
- Never contradicts established knowledge state

### Integration with Core Continuity MCP

**Core Continuity owns:**
- World rules
- Magic system mechanics
- Setting/geography

**Scene Writing:**
- Queries rules before writing
- Proposes additions after writing (with permission)
- Flags potential contradictions for user resolution

---

## Quick Reference

### Pre-Scene Checklist
1. ✅ Chapter outline approved
2. ✅ Query character knowledge (mandatory)
3. ✅ Query world rules (if relevant)
4. ✅ Load scene beats
5. ✅ Identify POV and voice mode

### During Scene Checklist
1. ✅ Write beat-by-beat
2. ✅ Track knowledge gains
3. ✅ Maintain voice consistency
4. ✅ Ground with sensory details
5. ✅ Respect continuity

### Post-Scene Checklist
1. ✅ Self-edit pass
2. ✅ Compile knowledge log
3. ✅ ASK PERMISSION for logging
4. ✅ Update MCP servers (on approval)
5. ✅ Confirm scene status

### MCP Query Quick Reference

**Before Writing:**
- `get_character_knowledge(char, timestamp)` - character-planning-server
- `get_world_rules(category)` - core-continuity-server
- `get_scene(scene_id)` - scene-server

**During Writing:**
- `verify_continuity(query)` - core-continuity-server
- `check_contradiction(detail)` - core-continuity-server

**After Writing (with permission):**
- `log_knowledge_gain(char, type, content)` - character-planning-server
- `log_world_establishment(category, detail)` - core-continuity-server
- `update_scene(scene_id, prose)` - scene-server
- `log_scene_event(scene_id, event)` - scene-server

---

## Version History

### Version 1.0 (2025-11-20)
**Initial Release:**
- Scene writing workflow from outline to prose
- MCP integration with 3 servers (scene, character-planning, core-continuity)
- Mandatory guardrails (approval requirements, permission protocols)
- Character knowledge tracking protocols
- Urban Fantasy style guidance
- Scene completion validation checklist
- Error recovery procedures

---

## Support & Documentation

**For MCP server documentation:**
- Check individual MCP server documentation for detailed API specs
- Verify available tools with each server's capability list

**For writing guidance:**
- Refer to Urban Fantasy Style Guide section
- Review voice consistency protocols
- Check sensory detail requirements

**For continuity questions:**
- Query core-continuity-server before making assumptions
- Use `verify_continuity` for uncertain details
- Always present conflicts to user for resolution

---

**Last Updated:** 2025-11-20
**Version:** 1.0
**Phase:** Execution (prose writing)
**MCP Dependencies:** scene-server, character-planning-server, core-continuity-server
