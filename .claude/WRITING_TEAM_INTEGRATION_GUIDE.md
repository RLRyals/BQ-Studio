# AI Writing Team Integration Guide

**Version:** 1.0
**Date:** 2025-11-20
**Genre:** Urban Fantasy Police Procedural

---

## Overview

Your AI Writing Team is a three-layer architecture that helps you write cohesive novel series while maintaining character and worldbuilding consistency.

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1: Sub-Agents (WHO)                          │
│  Writing Team Members                               │
│  • Miranda (Showrunner)                             │
│  • Detective Logan (Procedural Expert)              │
│  • Bailey (First Drafter)                           │
│  • Dr. Viktor (Character Psychologist)              │
│  • Tessa (Continuity Editor)                        │
│  • Professor Mira (Worldbuilding Architect)         │
│  • Finn (Style Specialist)                          │
│  • Edna (Market-Savvy Editor)                       │
│  • Casey (Process Specialist)                       │
└─────────────────────────────────────────────────────┘
                          ↓ invokes
┌─────────────────────────────────────────────────────┐
│  LAYER 2: Agent Skills (HOW)                        │
│  Phase-Based Process Workflows                      │
│  • series-planning                                  │
│  • book-planning                                    │
│  • chapter-planning                                 │
│  • scene-writing                                    │
│  • review-qa                                        │
└─────────────────────────────────────────────────────┘
                          ↓ calls
┌─────────────────────────────────────────────────────┐
│  LAYER 3: MCP Servers (WHAT)                        │
│  Data Storage & Management                          │
│  • author-server                                    │
│  • series-planning-server                           │
│  • book-planning-server                             │
│  • chapter-planning-server                          │
│  • character-planning-server                        │
│  • scene-server                                     │
│  • core-continuity-server                           │
│  • review-server                                    │
│  • reporting-server                                 │
└─────────────────────────────────────────────────────┘
```

---

## Key Principles

### 1. You Work in Plain English

**You say:** "Let's plan Chapter 5 where Alex learns about iron's properties."

**What happens behind the scenes:**
- Claude invokes Miranda (Showrunner)
- Miranda invokes chapter-planning skill
- Skill queries MCPs to find Alex's character_id
- Skill queries MCPs to find Chapter 5's chapter_id
- Skill presents: "Planning Chapter 5 for Detective Alex Martinez"
- **You never see or use IDs directly**

### 2. Skills Handle All ID Management

**You never:**
- Look up entity IDs
- Track IDs manually
- Use IDs in conversation
- Maintain ID cheat sheets

**Skills automatically:**
- Discover existing entities
- Cache IDs in session memory
- Resolve names to IDs
- Pass IDs between operations

### 3. Permission-Based MCP Operations

**Before any MCP create/add/update operation, the team ALWAYS asks permission:**

```
BAILEY: I'd like to log this scene to the MCP. May I proceed with:
- create_scene(scene_id="scene_005", chapter_id="chap_004", content="...", pov="Alex")

Your approval? (yes/no)
```

**You just say:** "Yes" or "No"

### 4. Automatic Team Coordination

Claude automatically invokes the right team member based on your request:

- **"Plan my series"** → Miranda invokes series-planning skill
- **"Plan Book 2's case structure"** → Detective Logan invokes book-planning skill
- **"Write the opening scene"** → Bailey invokes scene-writing skill
- **"Check for continuity errors"** → Tessa invokes review-qa skill

---

## Your Writing Team Members

### Miranda - The Showrunner
**Role:** Coordinates team, tracks plot, makes final calls
**Tools:** Read, Write, Edit, Grep, Glob, Skill, Task
**Skills Used:** series-planning, book-planning, chapter-planning, review-qa

**When invoked:**
- Series planning coordination
- Multi-book plot thread management
- Chapter readiness determination
- Final quality validation

### Detective Logan - The Procedural Expert
**Role:** Investigation authenticity, police procedures
**Tools:** Read, Grep, Glob, WebFetch, WebSearch, Skill
**Skills Used:** book-planning, chapter-planning, review-qa

**When invoked:**
- Case structure planning
- Investigation scene validation
- Procedural authenticity checks
- Evidence chain verification

### Bailey - The First Drafter
**Role:** Converts outlines to prose
**Tools:** Read, Write, Edit, Grep, Glob, Skill
**Skills Used:** scene-writing

**When invoked:**
- Scene writing (ONLY after chapter planning approved)
- Prose drafting
- Character voice implementation
- Sensory detail enhancement

### Dr. Viktor - The Character Psychologist
**Role:** Character consistency, emotional arcs
**Tools:** Read, Grep, Glob, Skill
**Skills Used:** series-planning, book-planning, review-qa

**When invoked:**
- Character arc development
- Emotional authenticity validation
- Relationship dynamics analysis
- Character behavior consistency

### Tessa - The Continuity Editor
**Role:** Catches errors, validates consistency
**Tools:** Read, Grep, Glob, Skill
**Skills Used:** review-qa

**When invoked:**
- Character knowledge validation (her specialty)
- Timeline consistency checks
- Continuity error detection
- Pre-chapter finalization review

### Professor Mira - The Worldbuilding Architect
**Role:** World rules, magic systems
**Tools:** Read, Grep, Glob, Skill
**Skills Used:** series-planning, review-qa

**When invoked:**
- World rule definition
- Magic system consistency
- Technology-magic interaction validation
- Worldbuilding framework development

### Finn - The Style Specialist
**Role:** Prose quality, Urban Fantasy voice
**Tools:** Read, Write, Edit, Grep, Glob, Skill
**Skills Used:** scene-writing, review-qa

**When invoked:**
- Prose enhancement
- Voice consistency
- Sensory description polish
- Mundane/magical juxtaposition

### Edna - The Market-Savvy Editor
**Role:** Pacing, market appeal, genre expectations
**Tools:** Read, Write, Edit, Grep, Glob, Skill
**Skills Used:** review-qa, book-planning

**When invoked:**
- Pacing analysis
- Commercial viability assessment
- Genre expectations validation
- Cutting unnecessary material

### Casey - The Process Specialist
**Role:** Workflow optimization, ID tracking
**Tools:** Read, Grep, Glob, Write, Skill
**Skills Used:** ALL (for process analysis)

**When invoked:**
- Process optimization
- Auto-generating ID reference (optional)
- Workflow documentation
- Team efficiency analysis

---

## Phase-Based Workflow

### Phase 1: Series Planning

**What you do:**
```
"Let's plan my Urban Fantasy Police Procedural series.
5 books, female detective protagonist, slow-burn romance."
```

**What happens:**
1. Claude invokes **Miranda** (Showrunner)
2. Miranda invokes **series-planning skill**
3. Skill discovers/creates:
   - Author info
   - Series structure
   - World rules (magic system, tech-magic interaction)
   - Main character arcs
   - Relationship progressions
4. **Team collaboration:**
   - Professor Mira validates world consistency
   - Dr. Viktor plans character arcs
   - Detective Logan advises on procedural framework
5. **Skill asks permission** before creating MCP entries
6. **You approve** in plain English

**MCP Operations (automatic):**
- `create_series()` - after permission
- `create_character()` for main cast - after permission
- `define_world_rule()` for magic systems - after permission
- `create_series_arc()` for overarching plot - after permission

### Phase 2: Book Planning

**What you do:**
```
"Plan Book 1. Case involves a murdered fae informant.
Alex needs to learn about iron's magical properties."
```

**What happens:**
1. Claude invokes **Miranda** or **Detective Logan**
2. They invoke **book-planning skill**
3. Skill retrieves series context (automatic ID resolution)
4. **Team collaboration:**
   - Detective Logan structures the case (9-beat investigation)
   - Dr. Viktor plans character development milestones
   - Professor Mira validates fae lore consistency
   - Edna validates beat structure for market
5. **Skill asks permission** before creating book/case entries
6. **You approve** specifics

**MCP Operations (automatic):**
- `get_series_details()` - no permission needed
- `get_character_arcs()` - no permission needed
- `create_book()` - after permission
- `define_case()` - after permission
- `plan_character_growth()` - after permission

### Phase 3: Chapter Planning

**What you do:**
```
"Plan Chapter 5. Alex visits the crime scene lab and
discovers iron filings in the victim's wounds."
```

**What happens:**
1. Claude invokes **Miranda**
2. Miranda invokes **chapter-planning skill**
3. Skill retrieves book/character context (automatic)
4. **Team collaboration:**
   - Detective Logan validates forensic procedures
   - Dr. Viktor checks Alex's emotional state
   - Tessa verifies Alex doesn't know about iron yet
5. **Skill structures:**
   - Chapter objectives
   - Scene sequence
   - Information reveals
   - Character knowledge tracking
6. **Skill asks permission** before creating chapter plan
7. **You approve** the structure

**MCP Operations (automatic):**
- `get_book_structure()` - no permission needed
- `check_character_knowledge(character="Alex", knowledge="iron properties")` - no permission needed
- `create_chapter_plan()` - after permission
- `add_information_reveal()` - after permission

### Phase 4: Scene Writing

**What you do:**
```
"Bailey, write the lab scene where Alex examines the iron filings."
```

**What happens:**
1. Claude invokes **Bailey** (First Drafter)
2. Bailey invokes **scene-writing skill**
3. **CRITICAL: Skill checks character knowledge FIRST:**
   - `check_character_knowledge(character="Alex", knowledge="iron properties")`
   - Result: Alex doesn't know yet → Bailey writes discovery correctly
4. **Bailey writes the scene:**
   - Converts outline to prose
   - Maintains Alex's POV/voice
   - Tracks new knowledge learned
5. **Bailey presents draft** to you
6. **Bailey asks permission** to log scene to MCP
7. **You approve** logging

**MCP Operations (automatic):**
- `check_character_knowledge()` - BEFORE writing
- `get_scene_objectives()` - no permission needed
- `create_scene()` - after permission and your approval
- `add_character_knowledge(character="Alex", knowledge="iron harms fae")` - after permission

### Phase 5: Review & QA

**What you do:**
```
"Tessa, check Chapter 5 for continuity errors."
```

**What happens:**
1. Claude invokes **Tessa** (Continuity Editor)
2. Tessa invokes **review-qa skill**
3. **Skill validates:**
   - Character knowledge consistency (priority #1)
   - Timeline accuracy
   - World rule compliance
   - Investigation procedure realism
4. **Team collaboration:**
   - Dr. Viktor validates character behavior
   - Professor Mira validates world rules
   - Detective Logan validates procedures
   - Finn reviews prose quality
5. **Tessa presents findings:**
   - ✅ Passed checks
   - ⚠️ Issues found with solutions
6. **Tessa asks permission** to log review to MCP
7. **You decide** whether to fix issues

**MCP Operations (automatic):**
- `check_character_continuity()` - no permission needed
- `check_timeline_consistency()` - no permission needed
- `check_world_rule_violations()` - no permission needed
- `create_review()` - after permission
- `flag_issue()` - after permission

---

## Example Complete Workflow

### Scenario: Writing Chapter 5 Scene 2

**YOU:**
```
Let's write Chapter 5, Scene 2. Alex is at the crime lab examining
the evidence from the fae murder case. She discovers iron filings.
```

**MIRANDA:**
```
**[MIRANDA]:**

Let me coordinate the chapter planning for Scene 2.

*[Invoking chapter-planning skill]*
*[Skill queries: get_chapter(chapter_number=5)]*
*[Skill caches: chapter_id = chap_005]*
*[Skill queries: get_character(name="Alex")]*
*[Skill caches: character_id = char_001]*

I see we're working on Chapter 5, Scene 2 for Detective Alex Martinez.

Before we plan this scene, let me bring in some specialists:
- Detective Logan for forensic authenticity
- Tessa to check Alex's current knowledge state

**PASS TO: DETECTIVE LOGAN**
```

**DETECTIVE LOGAN:**
```
**[DETECTIVE LOGAN]:**

*[Invoking chapter-planning skill for procedural validation]*
*[Skill queries: get_investigation_procedures()]*

Crime lab scene - good. Here's what needs to be realistic:

1. Alex would need to sign evidence log
2. Forensic tech would walk her through findings
3. Iron filings would be in labeled evidence bags
4. Chain of custody must be maintained
5. She can't touch evidence without gloves

For the Urban Fantasy element - if iron is significant to fae,
the forensic tech might not know that yet. Only Alex would
make the connection after learning fae lore.

**PASS TO: TESSA**
```

**TESSA:**
```
**[TESSA]:**

*[Invoking review-qa skill to check character knowledge]*
*[Skill queries: check_character_knowledge(character="Alex", knowledge="iron harms fae")]*

HOLD UP. Critical check:

✅ **Alex's Knowledge State - Chapter 5:**
- Knows: Basic fae exist, victim was fae, crime scene details
- Does NOT know: Iron's magical properties against fae

If we write this scene, Alex can:
- Notice the iron filings (observation)
- Find it curious (detective instinct)
- Not understand significance yet

She CANNOT reference iron harming fae unless we have her learn it first.

Recommend: Scene ends with her noting the iron, setting up learning
about it later (maybe from her mentor in Scene 3?).

**PASS TO: BAILEY**
```

**BAILEY:**
```
**[BAILEY]:**

Perfect! I love a good discovery scene where the protagonist doesn't
realize the significance yet. Classic procedural technique.

*[Invoking scene-writing skill]*
*[Skill verified: Alex doesn't know iron significance - correct!]*

Let me draft this scene. I'll focus on:
- Forensic lab atmosphere (fluorescent lights, sterile environment)
- Alex's detective observations
- The iron filings as mysterious evidence
- Her noting it without understanding (sets up future revelation)

*[Writing 2,800 words...]*

Here's my first draft:

---

**SCENE 2: County Forensics Lab - Late Afternoon**

[Scene content here - 2,800 words of prose showing Alex examining
evidence, noting iron filings with curiosity but no recognition
of significance]

---

That's the scene! I tracked her observations carefully - she notes
the iron, questions it, but doesn't leap to conclusions.

May I log this scene to the MCP with the following:
- create_scene(chapter_id="chap_005", scene_number=2, content="[full text]", pov="Alex", word_count=2800)
- Note: Alex observed iron filings but does not yet know significance

Your approval? (yes/no)
```

**YOU:**
```
Yes, looks great!
```

**BAILEY:**
```
**[BAILEY]:**

*[Executing MCP operations with permission granted]*
*[Skill calls: create_scene()]*
*[Skill calls: track_character_presence(chapter="5", scene="2", character="Alex")]*

✅ Scene logged successfully!

The scene is now in the MCP. Ready for the next scene, or should we
have Tessa do a continuity check first?

**PASS TO: MIRANDA**
```

**MIRANDA:**
```
**[MIRANDA]:**

Excellent work, team!

Scene 2 is complete with proper character knowledge tracking.
Alex observed the evidence without premature understanding.

Next steps:
- Scene 3: Alex consults her mentor about fae lore (learns about iron)
- Then we can reference iron's properties in future scenes

**CHAPTER STATUS: Scene 2 Complete, Scene 3 Ready to Plan**
```

---

## Critical Success Factors

### ✅ DO:

1. **Speak in plain English** - "Plan Chapter 5" not "create_chapter(id=...)"
2. **Trust the team** - They handle IDs automatically
3. **Approve MCP operations** - When asked for permission, say yes/no
4. **Let skills coordinate** - They know which MCPs to query
5. **Collaborate with team** - Answer their questions about your vision

### ❌ DON'T:

1. **Look up IDs manually** - Skills handle this
2. **Track IDs in documents** - Auto-generated only
3. **Skip permission requests** - Important safeguard
4. **Bypass team coordination** - They catch errors you'd miss
5. **Work out of phase order** - Planning before writing prevents errors

---

## Troubleshooting

### "The team is asking for too many permissions"

**This is intentional.** Every MCP write operation requires permission to:
- Give you control over your data
- Prevent accidental overwrites
- Maintain transparency
- Catch errors before they're stored

You can batch approve: "Yes to all for this chapter"

### "I want to see the IDs for debugging"

Ask Casey: "Generate an ID reference document"

He'll create an auto-generated snapshot showing what the skills discovered.
This is read-only and optional.

### "A skill can't find my character"

The skills query by name. If you said "Alex" but created "Alexandra Martinez",
tell the team: "Her name is Alexandra, nickname Alex."

Skills will discover `character_id` for "Alexandra Martinez" automatically.

### "I want to skip planning and just write"

**Don't.** The planning phases exist because:
- Character knowledge tracking requires setup
- Continuity errors are easier to prevent than fix
- Bailey needs approved outlines to check knowledge states
- Tessa can't validate what wasn't planned

Planning saves massive revision time later.

---

## MCP Server Setup

Your Writing Team requires these MCP servers to be installed and configured:

**Planning Phase:**
- `author-server`
- `series-planning-server`
- `book-planning-server`
- `chapter-planning-server`
- `character-planning-server`

**Execution Phase:**
- `scene-server`

**Quality Assurance Phase:**
- `core-continuity-server`
- `review-server`
- `reporting-server`

See your MCP-Writing-Servers repository:
`https://github.com/RLRyals/MCP-Writing-Servers/tree/main/src/config-mcps`

---

## Getting Started

### First Session Checklist:

1. **Ensure MCPs are installed** - All 9 servers from your repo
2. **Start with series planning** - "Let's plan my series"
3. **Let Miranda coordinate** - She'll invoke series-planning skill
4. **Answer team questions** - About your vision for the series
5. **Approve MCP operations** - When asked for permission
6. **Trust the process** - Planning → Writing → Review

### Your First Request:

```
"I want to plan a 5-book Urban Fantasy Police Procedural series
featuring a female detective protagonist named Alex Martinez.
She's a rookie who discovers supernatural crimes are real.
Slow-burn romance with her mentor. Each book is a case-of-the-week
with an overarching series arc about a supernatural crime syndicate."
```

Miranda will take it from there, coordinating the team through the
series-planning skill, and asking for your approval at key decision points.

---

## Version History

**Version 1.0 (2025-11-20)**
- Initial implementation
- 9 Writing Team sub-agents
- 5 phase-based agent skills
- Automatic ID management
- Permission-based MCP operations
- Urban Fantasy Police Procedural specialization

---

## Support

**For questions about:**
- **Team coordination** → Ask Miranda
- **Process optimization** → Ask Casey
- **Specific workflows** → Read the relevant skill file in `.claude/skills/`

**File locations:**
- Sub-agents: `.claude/agents/*.md`
- Agent skills: `.claude/skills/*.md`
- This guide: `.claude/WRITING_TEAM_INTEGRATION_GUIDE.md`
- ID reference (optional): `.claude/ID_CHEAT_SHEET_TEMPLATE.md`

---

**Ready to write your series? Just say: "Let's plan my series."**
