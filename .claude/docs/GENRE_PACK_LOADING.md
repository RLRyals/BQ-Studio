# Genre Pack Loading & Integration Guide

**Version:** 1.0
**Date:** 2025-11-21
**Audience:** BQ-Studio users, developers, and collaborators

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Genre Pack Structure](#genre-pack-structure)
4. [Discovery & Loading](#discovery--loading)
5. [Skill Integration Points](#skill-integration-points)
6. [Code Patterns](#code-patterns)
7. [User Experience](#user-experience)
8. [Agent Coordination](#agent-coordination)
9. [Fallback Behavior](#fallback-behavior)
10. [Examples](#examples)

---

## Overview

### Purpose

**Genre packs** are modular knowledge modules that allow universal skills to adapt to specific fiction genres without hardcoding genre-specific logic into skill workflows. Skills remain genre-agnostic workflow controllers while genre packs provide:

- **Beat sheets** - Genre-specific story structures
- **Style guides** - Voice and tone patterns
- **Validation rules** - Genre conventions and requirements
- **Templates** - Character archetypes, world-building frameworks
- **Case structures** - Genre-specific plot patterns (for procedurals, mysteries, etc.)

### Key Principles

1. **Skills are universal** - Core workflow logic works across all genres
2. **Genre packs are modular** - Easy to add new genres without modifying skills
3. **Defaults are sensible** - Skills work without a genre pack (baseline/generic mode)
4. **Selection is flexible** - Users can specify genre at session start or mid-session
5. **Resources are lazy-loaded** - Genre pack resources loaded only when needed

### Current State vs. Target State

**Current (v1.0):**
```yaml
# series-planning-skill.md (line 8)
genre: "Urban Fantasy Police Procedural"
```
- Skills are hardcoded to specific genres
- Genre knowledge embedded in skill instructions
- No separation between workflow and genre knowledge

**Target (v2.0):**
```yaml
# series-planning-skill.md
metadata:
  genre_pack: "{{session.genre_pack || 'baseline'}}"
  genre_pack_path: "{{genre_packs_dir}}/{{session.genre_pack}}"
```
- Skills detect available genre packs
- Genre knowledge loaded from modular packs
- Workflow logic separated from genre specifics

---

## Architecture

### System Layers

```
┌─────────────────────────────────────────────────────┐
│  USER                                                │
│  "Plan a cozy mystery series"                       │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  LAYER 1: AGENTS (WHO)                              │
│  Miranda detects "cozy mystery" → sets genre pack   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  LAYER 2: SKILLS (HOW)                              │
│  series-planning-skill loads "cozy-mystery" pack    │
│  • Discovers pack at genre-packs/cozy-mystery/      │
│  • Loads beat sheets, templates, validation rules   │
│  • Uses genre-specific resources in workflow        │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  LAYER 3: MCP SERVERS (WHAT)                        │
│  Stores planning data with genre metadata           │
│  • series.genre = "cozy-mystery"                    │
│  • series.genre_pack_version = "1.2"                │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User specifies genre → Agent sets session.genre_pack
                              ↓
                    Skill initialization
                              ↓
                Check for genre pack directory
                              ↓
        ┌─────────────────────┴─────────────────────┐
        │                                           │
   Pack exists                              Pack not found
        │                                           │
   Load resources                          Use baseline defaults
        │                                           │
        └─────────────────────┬─────────────────────┘
                              ↓
                  Execute workflow with genre context
                              ↓
                  Pass genre metadata to MCP servers
```

---

## Genre Pack Structure

### Directory Layout

```
genre-packs/
├── baseline/                        # Generic/universal defaults
│   ├── pack.json                    # Pack metadata
│   ├── beat-sheets/
│   │   └── three-act-structure.md
│   ├── style-guides/
│   │   └── general-fiction.md
│   ├── templates/
│   │   ├── series-bible.md
│   │   ├── character-profile.md
│   │   └── world-building.md
│   └── validation/
│       └── story-logic.json
│
├── urban-fantasy-procedural/        # Urban Fantasy Police Procedural
│   ├── pack.json
│   ├── beat-sheets/
│   │   ├── procedural-case.md       # Case-of-the-week structure
│   │   ├── series-arc.md            # Overarching conspiracy/threat
│   │   └── romance-subplot.md       # Optional romance integration
│   ├── style-guides/
│   │   ├── voice.md                 # Gritty, fast-paced urban voice
│   │   ├── magic-exposition.md      # How to reveal magic systems
│   │   └── procedural-authenticity.md
│   ├── templates/
│   │   ├── magic-system.md          # Magic rules framework
│   │   ├── investigation-framework.md
│   │   ├── character-detective.md   # Detective archetype
│   │   ├── character-partner.md     # Partner/team archetypes
│   │   └── case-structure.md        # Investigation beats
│   ├── validation/
│   │   ├── magic-consistency.json   # Check magic rules
│   │   ├── procedural-beats.json    # Ensure case follows structure
│   │   └── world-rules.json         # Urban fantasy conventions
│   └── knowledge/
│       ├── police-procedures.md     # Reference material
│       ├── forensics-basics.md
│       └── magical-crime-types.md
│
├── cozy-mystery/                    # Cozy Mystery
│   ├── pack.json
│   ├── beat-sheets/
│   │   └── cozy-mystery-beats.md
│   ├── style-guides/
│   │   ├── voice.md                 # Light, witty, accessible
│   │   └── violence-limits.md       # No graphic content
│   ├── templates/
│   │   ├── character-amateur-sleuth.md
│   │   ├── small-town-setting.md
│   │   └── cozy-cast.md             # Quirky supporting characters
│   └── validation/
│       ├── cozy-requirements.json   # No graphic violence, profanity
│       └── red-herring-tracking.json
│
├── romantasy/                       # Romance + Fantasy
│   ├── pack.json
│   ├── beat-sheets/
│   │   ├── romance-beats.md
│   │   ├── fantasy-quest.md
│   │   └── romantasy-hybrid.md      # Integrated structure
│   ├── style-guides/
│   │   ├── voice.md                 # Emotional, immersive
│   │   ├── heat-levels.md           # Romance intensity guide
│   │   └── fantasy-worldbuilding.md
│   ├── templates/
│   │   ├── romance-arc.md
│   │   ├── magic-system.md
│   │   ├── character-love-interests.md
│   │   └── fated-mates.md           # Common trope templates
│   └── validation/
│       ├── romance-progression.json # HEA/HFN required
│       ├── heat-level-consistency.json
│       └── fantasy-rules.json
│
└── dark-romance/                    # Dark Romance
    ├── pack.json
    ├── beat-sheets/
    │   └── dark-romance-beats.md
    ├── style-guides/
    │   ├── voice.md                 # Intense, morally complex
    │   ├── trauma-handling.md       # Sensitivity guidelines
    │   └── consent-complexity.md
    ├── templates/
    │   ├── morally-gray-characters.md
    │   ├── power-dynamics.md
    │   └── redemption-arcs.md
    └── validation/
        ├── content-warnings.json    # Required warnings
        ├── romance-payoff.json      # Still needs HEA/HFN
        └── trauma-resolution.json
```

### Pack Metadata (`pack.json`)

```json
{
  "name": "urban-fantasy-procedural",
  "display_name": "Urban Fantasy Police Procedural",
  "version": "1.0.0",
  "description": "Beat sheets, templates, and validation for urban fantasy detective stories with procedural elements",
  "author": "BQ-Studio",
  "compatible_skills": [
    "series-planning-skill",
    "book-planning-skill",
    "chapter-planning-skill",
    "scene-writing-skill",
    "review-qa-skill"
  ],
  "parent_genres": ["urban-fantasy", "mystery"],
  "sub_genres": ["police-procedural", "detective", "magical-crimes"],
  "resources": {
    "beat_sheets": [
      "procedural-case.md",
      "series-arc.md",
      "romance-subplot.md"
    ],
    "style_guides": [
      "voice.md",
      "magic-exposition.md",
      "procedural-authenticity.md"
    ],
    "templates": [
      "magic-system.md",
      "investigation-framework.md",
      "character-detective.md",
      "character-partner.md",
      "case-structure.md"
    ],
    "validation_rules": [
      "magic-consistency.json",
      "procedural-beats.json",
      "world-rules.json"
    ],
    "knowledge_base": [
      "police-procedures.md",
      "forensics-basics.md",
      "magical-crime-types.md"
    ]
  },
  "default_settings": {
    "beat_sheet": "procedural-case.md",
    "style_guide": "voice.md",
    "heat_level": "moderate",
    "violence_level": "procedural",
    "magic_exposure": "public"
  }
}
```

---

## Discovery & Loading

### 1. How Skills Detect Available Genre Packs

**At Session Start:**

Skills query the `genre-packs/` directory to discover available packs:

```markdown
## Session Initialization (in skill)

### Step 1: Discover Available Genre Packs

**Query filesystem:**
- Check if `genre-packs/` directory exists
- List subdirectories (each is a potential genre pack)
- Read `pack.json` from each subdirectory
- Build registry of available packs

**Cache in session memory:**
```json
{
  "available_genre_packs": {
    "baseline": {
      "display_name": "Baseline (Generic)",
      "path": "genre-packs/baseline/"
    },
    "urban-fantasy-procedural": {
      "display_name": "Urban Fantasy Police Procedural",
      "path": "genre-packs/urban-fantasy-procedural/"
    },
    "cozy-mystery": {
      "display_name": "Cozy Mystery",
      "path": "genre-packs/cozy-mystery/"
    }
  }
}
```
```

**Implementation Pattern:**

```markdown
### Skill Initialization Block

When this skill is invoked, FIRST:

1. **Check for existing session genre pack:**
   ```
   If session.genre_pack is set:
     → Use that genre pack
   Else:
     → Proceed to discovery
   ```

2. **Discover available genre packs:**
   - Query: List directories in `/home/user/BQ-Studio/genre-packs/`
   - For each directory: Read `pack.json`
   - Build list: `available_packs[]`

3. **If user hasn't specified genre:**
   - Present available packs to user
   - Ask: "Which genre pack would you like to use? (or 'baseline' for generic)"
   - Set: `session.genre_pack = user_choice`

4. **Load genre pack resources:**
   - Read pack.json for metadata
   - Cache resource paths for lazy loading
   - Set: `session.genre_pack_path = "genre-packs/{pack_name}/"`
```

### 2. How Users Specify Genre Pack

**Option A: Explicit Request**

```
User: "Plan a cozy mystery series"
```

Agent (Miranda) detects "cozy mystery" keyword and sets:
```
session.genre_pack = "cozy-mystery"
```

**Option B: Session Start Prompt**

When series-planning-skill initializes without existing genre_pack:

```
SKILL: I found these available genre packs:
1. Baseline (Generic)
2. Urban Fantasy Police Procedural
3. Cozy Mystery
4. Romantasy
5. Dark Romance

Which genre pack would you like to use for this series?
(You can also type a genre name, and I'll match it)

USER: cozy mystery

SKILL: ✓ Loaded genre pack: Cozy Mystery (v1.0)
```

**Option C: MCP Query (Resuming Series)**

If user is resuming work on existing series:

```markdown
1. Query MCP: `author-server.get_series(series_id)`
2. Check: `series.metadata.genre_pack`
3. If exists: Load that genre pack automatically
4. If not exists: Prompt user to select (one-time selection)
5. Store selection: Update series metadata with genre_pack
```

### 3. What Happens If No Genre Pack Specified

**Fallback Hierarchy:**

```
1. Check session.genre_pack
   ↓ (not set)
2. Check series.metadata.genre_pack (from MCP)
   ↓ (not found)
3. Infer from keywords in user request
   ↓ (no match)
4. Prompt user to select from available packs
   ↓ (user skips/declines)
5. **DEFAULT: Use 'baseline' genre pack**
```

**Baseline Pack Characteristics:**
- Three-act structure (universal)
- General fiction style guide
- Generic validation rules (story logic, consistency)
- No genre-specific conventions enforced
- User can switch to specific pack at any time

### 4. Fallback Behavior for Missing Resources

**If a genre pack is missing expected resources:**

```markdown
## Resource Loading with Graceful Degradation

When skill needs a resource (e.g., beat sheet):

1. **Try genre pack first:**
   - Check: `{genre_pack_path}/beat-sheets/{requested_beat}.md`
   - If found: Load and use

2. **Fallback to baseline:**
   - Check: `baseline/beat-sheets/{requested_beat}.md`
   - If found: Load and use
   - Warn user: "Using baseline beat sheet (genre pack missing this resource)"

3. **Fallback to embedded default:**
   - Use skill's built-in generic structure
   - Warn user: "Using generic default (no beat sheet found in genre pack or baseline)"

4. **Log missing resource:**
   - Add to session log: `missing_resources[]`
   - At session end: Report what was missing
   - Suggest: "Consider contributing this resource to the genre pack"
```

**Example:**

```
SKILL: Loading beat sheet for Book 1 planning...
→ Checked: genre-packs/cozy-mystery/beat-sheets/procedural-case.md [NOT FOUND]
→ Checked: genre-packs/baseline/beat-sheets/procedural-case.md [NOT FOUND]
→ Using: Built-in three-act structure (generic)

Note: The 'cozy-mystery' genre pack doesn't include a procedural case beat sheet.
Would you like to use the standard cozy mystery beat sheet instead?
```

---

## Skill Integration Points

### series-planning-skill

**When to load genre pack resources:**

| Phase | Resource Type | Purpose |
|-------|---------------|---------|
| **Phase 1: Series Foundation** | `templates/series-bible.md` | Template structure for genre |
| | `validation/genre-requirements.json` | Genre conventions to establish |
| **Phase 2: World-Building** | `templates/magic-system.md` | Genre-specific worldbuilding framework |
| | `templates/investigation-framework.md` | Procedural structures (if applicable) |
| | `knowledge/genre-conventions.md` | Genre worldbuilding norms |
| **Phase 3: Character Planning** | `templates/character-*.md` | Character archetypes for genre |
| | `validation/character-requirements.json` | Genre character conventions |
| **Phase 4: Relationships** | `templates/romance-arc.md` | Romance progression (if genre includes) |
| | `validation/relationship-rules.json` | Genre relationship norms |
| **Phase 5: Plot Threads** | `beat-sheets/series-arc.md` | Multi-book structure for genre |
| | `templates/case-structure.md` | Episode/case patterns (if applicable) |
| **Phase 6: Series Bible** | `validation/*.json` | All validation rules for consistency check |

**Loading Pattern:**

```markdown
## Phase 2: World-Building & Rules

### Genre Pack Integration

**Load genre-specific templates:**

1. Check for magic system template:
   - Path: `{genre_pack_path}/templates/magic-system.md`
   - If found: Present template to user
   - If not found: Use baseline/templates/world-building.md

2. Check for genre conventions:
   - Path: `{genre_pack_path}/knowledge/genre-conventions.md`
   - If found: Reference during world-building phase
   - Use to guide user decisions

**Example:**
```
SKILL: I've loaded the Urban Fantasy Police Procedural pack.

For world-building, this genre typically includes:
- [From genre-conventions.md] Magic detection/forensics systems
- [From genre-conventions.md] Legal frameworks for magical crimes
- [From genre-conventions.md] Technology-magic interaction

Would you like to start with the magic system template, or develop
world rules from scratch?
```
```

### book-planning-skill

**When to load genre pack resources:**

| Phase | Resource Type | Purpose |
|-------|---------------|---------|
| **Phase 1: Book Foundation** | `pack.json` (default_settings) | Default heat/violence levels for genre |
| **Phase 2: Beat Sheet Selection** | `beat-sheets/*.md` | Genre-specific story structures |
| **Phase 3: Act Structure** | `beat-sheets/{selected}.md` | Detailed beat breakdowns |
| **Phase 4: Case-of-the-Week** | `templates/case-structure.md` | Episode pattern (if applicable) |
| **Phase 5: Series Arc Integration** | `beat-sheets/series-arc.md` | How book fits series pattern |
| **Phase 6: Character Milestones** | `templates/character-arc.md` | Character development patterns |
| **Phase 7: Validation** | `validation/*.json` | Genre-specific checks |

**Beat Sheet Selection Example:**

```markdown
## Phase 2: Beat Sheet Selection

### Genre Pack Beat Sheets

**Detected genre pack:** urban-fantasy-procedural

**Available beat sheets from pack:**
1. **procedural-case.md** - Case-of-the-week investigation structure
   - Discovery → Investigation → Red Herrings → Revelation → Confrontation
   - Best for: Standalone cases with series arc threads

2. **series-arc.md** - Overarching conspiracy/threat progression
   - Setup → Clues → Escalation → Crisis → Resolution (across 3-5 books)
   - Best for: Books advancing the main series mystery

3. **romance-subplot.md** - Romance beats integrated with procedural
   - Attraction → Conflict → Deepening → Crisis → Resolution
   - Best for: Books with significant romantic development

**User selection:**
```
Which beat sheet structure fits your Book 2 goals?

USER: I want Book 2 to focus on a new case but also advance the series conspiracy

SKILL: ✓ Loaded hybrid structure:
- Primary: procedural-case.md (80%)
- Secondary: series-arc.md (20% - key reveals at midpoint and climax)
```
```

### chapter-planning-skill

**When to load genre pack resources:**

| Phase | Resource Type | Purpose |
|-------|---------------|---------|
| **Phase 1: Chapter Foundation** | `beat-sheets/*.md` | Determine if chapter serves beat point |
| **Phase 2: Scene Planning** | `templates/scene-patterns.md` | Genre-typical scene types |
| **Phase 3: Knowledge Tracking** | `validation/knowledge-tracking.json` | What characters can know (mystery genres) |
| **Phase 4: Validation** | `validation/scene-requirements.json` | Genre scene conventions |

**Knowledge Tracking Example (Mystery Genres):**

```markdown
## Phase 3: Knowledge Tracking

### Genre Pack: Cozy Mystery - Knowledge Rules

**Loaded:** `validation/knowledge-tracking.json`

```json
{
  "protagonist_knowledge": {
    "rule": "amateur_sleuth_limitations",
    "description": "Protagonist lacks police access to evidence/databases",
    "restrictions": [
      "Cannot run fingerprints without police contact",
      "Cannot access crime scene after initial discovery",
      "Must rely on gossip, observation, and deduction"
    ]
  },
  "clue_revelation": {
    "rule": "fair_play",
    "description": "Reader must have access to all clues protagonist has",
    "requirements": [
      "Show clues in scene (don't reveal protagonist noticed off-page)",
      "No deus ex machina evidence",
      "Red herrings must be plausible"
    ]
  }
}
```

**In chapter planning:**
```
SKILL: In Chapter 8, you've planned for Sarah to discover the killer's identity.

Checking genre pack knowledge rules...
⚠️ Validation Issue: Sarah is an amateur sleuth. How does she access
the police report mentioned in the outline?

Suggestion: Either:
1. Give her a police contact who shares info (setup in earlier chapter)
2. Have her overhear information at the coffee shop (within genre conventions)
3. She deduces from public information (clues shown to reader earlier)

Which approach fits your story?
```
```

### scene-writing-skill

**When to load genre pack resources:**

| Phase | Resource Type | Purpose |
|-------|---------------|---------|
| **Phase 1: Scene Foundation** | `style-guides/voice.md` | Genre voice characteristics |
| **Phase 2: Prose Generation** | `style-guides/*.md` | Style/tone guidelines during writing |
| **Phase 3: Dialogue** | `style-guides/voice.md` | Genre dialogue conventions |
| **Phase 4: Sensory Details** | `knowledge/setting-details.md` | Genre-typical sensory elements |
| **Phase 5: Validation** | `validation/style-check.json` | Genre style requirements |

**Style Guide Loading:**

```markdown
## Phase 2: Prose Generation

### Genre Pack Style Application

**Loaded:** `urban-fantasy-procedural/style-guides/voice.md`

**Voice characteristics for this genre:**
- **Pacing:** Fast, punchy sentences during action/investigation
- **Tone:** Gritty, cynical but with moments of humor
- **Vocabulary:** Mix of police jargon and magical terminology
- **Sentence structure:** Shorter sentences (avg 12-15 words)
- **POV:** Typically first-person or close third
- **Exposition:** Show magic through action, not explanation dumps

**Applied to scene writing:**

When Bailey (First Drafter) generates prose, the style guide is passed as context:

```
Generate scene prose with these style guidelines:
- Fast-paced, punchy sentences
- Gritty urban voice with cynical edge
- Integrate magical elements naturally (no info-dumping)
- Use sensory details: city smells, sounds, textures
- Detective POV: notice details, make deductions
```
```

### review-qa-skill

**When to load genre pack resources:**

| Phase | Resource Type | Purpose |
|-------|---------------|---------|
| **Phase 1: Continuity Check** | `validation/world-rules.json` | Check magic/world consistency |
| **Phase 2: Character Consistency** | `validation/character-requirements.json` | Genre character conventions |
| **Phase 3: Plot Logic** | `validation/procedural-beats.json` | Genre plot structure requirements |
| **Phase 4: Style Check** | `validation/style-check.json` | Genre style conventions |
| **Phase 5: Genre Requirements** | `validation/*.json` | All genre-specific validations |

**Validation Example:**

```markdown
## Phase 5: Genre Requirements Validation

### Genre Pack: Urban Fantasy Procedural

**Running validation checks from genre pack...**

**1. Magic Consistency (`magic-consistency.json`):**
- ✓ Magic rules established in Chapter 1 followed in Chapter 8
- ✓ No new magical abilities introduced without foreshadowing
- ⚠️ Issue: Iron vulnerability mentioned in Ch 3 but fae uses iron doorknob in Ch 9

**2. Procedural Beats (`procedural-beats.json`):**
- ✓ Case discovery (Ch 1)
- ✓ Investigation & clues (Ch 2-5)
- ⚠️ Issue: Red herring suspect introduced Ch 4 but never revisited
- ✓ Revelation (Ch 7)
- ✓ Confrontation (Ch 8)
- ✓ Resolution (Ch 9)

**3. World Rules (`world-rules.json`):**
- ✓ Technology-magic interaction consistent
- ✓ Legal framework for magical crimes followed
- ✓ Magical forensics methods align with established rules

**Issues to address:** 2
```

---

## Code Patterns

### Pattern 1: Genre Pack Detection at Skill Initialization

```markdown
---
name: series-planning-skill
description: Comprehensive series planning. Adapts to genre via genre packs.
metadata:
  version: "2.0"
  phase: "planning"
  genre_pack: "{{session.genre_pack || 'baseline'}}"
---

# Series Planning Skill

## Session Initialization

### STEP 1: Genre Pack Discovery & Loading

**Before starting any planning workflow:**

1. **Check for existing genre pack in session:**
   ```
   If session.genre_pack exists:
     → Genre pack: {session.genre_pack}
     → Path: genre-packs/{session.genre_pack}/
     → Skip discovery, proceed to loading
   ```

2. **Discover available genre packs:**
   ```
   List directories: genre-packs/*
   For each directory:
     - Read pack.json
     - Cache: pack name, display name, description
   Build: available_packs[]
   ```

3. **Determine which pack to use:**
   ```
   Option A: User explicitly requested genre
     → Match keywords to pack names
     → Example: "cozy mystery" → "cozy-mystery"

   Option B: Resuming existing series
     → Query MCP: get_series(series_id).metadata.genre_pack
     → If found: Load that pack

   Option C: No genre specified
     → Present available packs to user
     → Prompt: "Which genre pack would you like to use?"
     → User selects from list or types genre name

   Option D: User declines to select
     → Default: "baseline"
     → Warn: "Using baseline (generic) genre pack. You can switch later."
   ```

4. **Load genre pack:**
   ```
   Set session.genre_pack = {selected_pack_name}
   Set session.genre_pack_path = "genre-packs/{selected_pack_name}/"
   Read: {genre_pack_path}/pack.json
   Cache: Resource paths, default settings
   Report to user: "✓ Loaded genre pack: {display_name} (v{version})"
   ```

### STEP 2: Proceed to Workflow

With genre pack loaded, begin Phase 1 of series planning workflow.
All resource loading will reference session.genre_pack_path.
```

### Pattern 2: Lazy Resource Loading

```markdown
## Phase 2: World-Building & Rules

### Load Magic System Template

**Resource needed:** Magic system template for worldbuilding

**Loading priority:**
1. Genre pack specific template
2. Baseline template
3. Embedded default

**Implementation:**

```
1. Try genre pack:
   Path: {session.genre_pack_path}/templates/magic-system.md
   If file exists:
     → Read file content
     → Present to user: "Here's the {genre_pack} magic system template..."
     → Use this template

2. Fallback to baseline:
   Path: genre-packs/baseline/templates/magic-system.md
   If file exists:
     → Read file content
     → Warn user: "{genre_pack} doesn't include magic template, using baseline"
     → Use baseline template

3. Final fallback (embedded):
   Use skill's built-in generic magic system questions:
     - What is the source of magic?
     - What are the limitations/costs?
     - How is magic detected/measured?
   → Warn user: "No template found, using generic worldbuilding questions"
```

**Log missing resources:**
```
If fallback occurred:
  Add to session.missing_resources[]:
    {
      "resource": "templates/magic-system.md",
      "genre_pack": "{session.genre_pack}",
      "phase": "World-Building",
      "fallback_used": "baseline" or "embedded"
    }
```
```

### Pattern 3: Passing Genre Context to Invoked Agents

```markdown
## Invoking Agents with Genre Context

When a skill invokes an agent (e.g., Bailey for scene writing), pass genre pack information:

### In Skill (chapter-planning-skill)

```
Phase 3: Ready for Scene Writing

User approved chapter plan. Ready to invoke Bailey (First Drafter).

**Prepare context for Bailey:**
```json
{
  "task": "Write scene 1 of Chapter 5",
  "genre_pack": "{session.genre_pack}",
  "genre_pack_path": "{session.genre_pack_path}",
  "style_guide": "{genre_pack_path}/style-guides/voice.md",
  "scene_context": {
    "chapter": 5,
    "scene": 1,
    "pov_character": "Alex Chen",
    "purpose": "Discovery of magical crime scene",
    "beat": "Inciting Incident"
  }
}
```

**Invoke Bailey:**
```
@bailey-first-drafter

Task: Write Scene 1 of Chapter 5 (magical crime scene discovery)

Context:
- Genre: {session.genre_pack}
- Style guide: {genre_pack_path}/style-guides/voice.md
- POV: Alex Chen (detective)
- Purpose: Inciting incident - first encounter with magical crime

Please read the style guide and apply the voice characteristics when drafting the scene.
```

### In Agent (bailey-first-drafter.md)

```markdown
## Receiving Genre Pack Context

When invoked by a skill, check for genre pack information:

1. **Check invocation parameters:**
   - genre_pack: Name of active genre pack
   - genre_pack_path: Path to genre pack resources
   - style_guide: Specific style guide file to use

2. **Load style guide:**
   ```
   If style_guide parameter provided:
     → Read file: {style_guide}
     → Extract voice characteristics
     → Apply to prose generation
   Else:
     → Use default style (general fiction voice)
   ```

3. **Apply genre-specific writing:**
   - Use style guide voice characteristics
   - Apply pacing recommendations
   - Follow genre conventions for scene types
   - Integrate genre-specific vocabulary naturally
```
```

### Pattern 4: Genre Pack Validation

```markdown
## Genre Pack Validation Checks

When performing review/QA, load genre-specific validation rules:

### In Skill (review-qa-skill)

```
Phase 5: Genre Requirements Validation

**Load validation rules from genre pack:**

1. List all validation files:
   Path: {genre_pack_path}/validation/*.json
   Files found: [
     "magic-consistency.json",
     "procedural-beats.json",
     "world-rules.json",
     "style-check.json"
   ]

2. For each validation file:
   - Read JSON structure
   - Extract validation rules
   - Run checks against manuscript/planning data
   - Collect issues found

3. Report results:
   ```
   Genre Requirements Check ({genre_pack}):

   ✓ Magic Consistency: Passed (12/12 rules)
   ⚠️ Procedural Beats: 1 issue found
   ✓ World Rules: Passed (8/8 rules)
   ⚠️ Style Check: 3 suggestions

   Issues to review: [details below]
   ```
```

**Validation rule format:**

```json
{
  "rule_id": "magic_consistency_001",
  "rule_name": "Established Magic Rules Followed",
  "description": "Magic system rules defined in world-building must be followed consistently",
  "check_type": "consistency",
  "severity": "error",
  "check": {
    "query_mcp": "get_world_rules(series_id)",
    "extract": "magic_system.rules[]",
    "validate_against": "scenes[].magical_elements[]",
    "condition": "all magical elements must comply with established rules"
  },
  "failure_message": "Magic rule violation: {element} contradicts established rule {rule}",
  "suggestion": "Review world-building magic system rules and ensure consistency"
}
```
```

### Pattern 5: Switching Genre Packs Mid-Session

```markdown
## Switching Genre Packs (Advanced)

**User request:** "Actually, I want to switch from urban fantasy to cozy mystery"

**Skill response:**

```
Switching genre packs mid-session requires caution:

**Current genre pack:** urban-fantasy-procedural
**Requested genre pack:** cozy-mystery

⚠️ Warning: Switching genre packs will affect:
1. Beat sheet structures (procedural → cozy mystery beats)
2. Style guidelines (gritty urban → light cozy voice)
3. Validation rules (magic system → cozy conventions)
4. Character archetypes (detective → amateur sleuth)

**Recommendation:**
- Complete current phase before switching
- Review already-planned elements for genre fit
- May need to revise earlier decisions

**Options:**
1. Switch now (I'll help you adjust existing plans)
2. Complete current book with urban fantasy, start next book with cozy mystery
3. Create new series with cozy mystery pack

What would you like to do?
```

**If user confirms switch:**

```
1. Save current state:
   session.previous_genre_pack = session.genre_pack

2. Unload current genre pack:
   Clear cached resources

3. Load new genre pack:
   session.genre_pack = "cozy-mystery"
   Load pack.json, resources

4. Update MCP metadata:
   update_series(series_id, {
     metadata: {
       genre_pack: "cozy-mystery",
       previous_genre_pack: "urban-fantasy-procedural",
       genre_switch_date: "2025-11-21"
     }
   })

5. Review affected elements:
   - Present list of planned elements that may need revision
   - Offer to help adjust to new genre conventions
```
```

---

## User Experience

### How to List Available Genre Packs

**User Command:**

```
User: "What genre packs are available?"
```

**System Response:**

```
Available Genre Packs:

1. **Baseline (Generic)** [v1.0]
   - Universal story structure
   - Three-act framework
   - Use when: No specific genre, or genre not yet supported

2. **Urban Fantasy Police Procedural** [v1.0]
   - Detective/police procedural with magic
   - Case-of-the-week + series arc structure
   - Includes: Magic system templates, investigation framework

3. **Cozy Mystery** [v1.0]
   - Amateur sleuth, small-town setting
   - Light tone, no graphic violence
   - Includes: Cozy conventions, red herring tracking

4. **Romantasy** [v1.2]
   - Romance + Fantasy hybrid
   - Integrated romance/quest beats
   - Includes: Romance arcs, fated mates, heat level guides

5. **Dark Romance** [v1.1]
   - Morally complex, intense romance
   - Trauma-informed, content warnings
   - Includes: Power dynamics, redemption arcs

Type the name or number to select a genre pack.
```

### How to Select a Genre Pack at Session Start

**Scenario 1: New Series Planning**

```
User: "I want to plan a new series"

SKILL (series-planning): Starting series planning workflow.

Which genre pack would you like to use?
1. Baseline
2. Urban Fantasy Police Procedural
3. Cozy Mystery
4. Romantasy
5. Dark Romance

(Type number, name, or describe your genre)

User: romantasy

SKILL: ✓ Loaded genre pack: Romantasy (v1.2)

This pack includes:
- Romance + fantasy beat sheets
- Heat level guidelines (configurable)
- Fated mates templates
- Fantasy worldbuilding frameworks

Let's begin series planning...
```

**Scenario 2: User Describes Genre**

```
User: "Plan a series about magical detectives in Chicago"

AGENT (Miranda): I detected keywords: "magical detectives" → Urban Fantasy Procedural

Setting genre pack to: urban-fantasy-procedural

Invoking series-planning skill with genre context...

SKILL (series-planning): ✓ Loaded genre pack: Urban Fantasy Police Procedural (v1.0)

Perfect for a series about magical detectives! This pack includes:
- Procedural case structure
- Magic system templates
- Investigation framework
- Character archetypes (detective, partner, informant)

Let's plan your Chicago magical detective series...
```

### How to Switch Genre Packs Mid-Session

**If Supported:**

```
User: "Actually, I want to change this to a cozy mystery instead"

SKILL: You're currently using: Urban Fantasy Police Procedural

Switching to: Cozy Mystery

⚠️ This will change:
- Beat structures (procedural → cozy mystery)
- Tone (gritty → light)
- Magic system (overt → possibly no magic, or very cozy magic)

You've already planned:
- Phase 1: Series Foundation (urban fantasy detective) ✓
- Phase 2: World-Building (magic system, investigation framework) ✓

Options:
1. Switch genre pack, revise completed phases
2. Complete this series as urban fantasy, plan next series as cozy
3. Create a hybrid (cozy mystery WITH magic - I can help blend genre packs)

What would you like to do?

User: Option 3 - cozy mystery with magic

SKILL: Great! I'll create a hybrid approach:
- Primary pack: cozy-mystery (tone, amateur sleuth, small-town)
- Supplemental: urban-fantasy-procedural (magic system only)

Adjusting series plan to blend both genres...
```

### What Feedback Users Get About Genre Pack Usage

**Throughout Workflow:**

```
✓ Loaded genre pack: Cozy Mystery (v1.0)

[Phase 2: World-Building]
→ Loading template: cozy-mystery/templates/small-town-setting.md
→ Using validation rules: cozy-mystery/validation/cozy-requirements.json

[Phase 3: Character Planning]
→ Loading template: cozy-mystery/templates/character-amateur-sleuth.md
→ Applying archetype: Amateur sleuth with quirky hobby

[Resource not found]
⚠️ cozy-mystery pack missing: templates/magic-system.md
→ Fallback: Using baseline/templates/world-building.md

[Phase 6: Validation]
✓ Genre Requirements Check (Cozy Mystery):
  - No graphic violence: PASSED
  - Amateur sleuth limitations: PASSED
  - Light tone maintained: PASSED
  - Fair-play clues: 1 WARNING (see details)

[Session End]
Session Summary:
- Genre pack: Cozy Mystery (v1.0)
- Resources used: 12
- Fallbacks: 1 (magic-system template)
- Validation issues: 1 warning (addressed)

Missing resources that could improve this genre pack:
- templates/magic-system.md (you used baseline instead)

Would you like to contribute these missing resources to improve
the cozy-mystery genre pack?
```

---

## Agent Coordination

### How Genre Pack Info Flows to Agents

**Flow Diagram:**

```
User: "Plan Chapter 5"
         ↓
Agent: Miranda (Showrunner)
  - Check session.genre_pack
  - Pass to skill invocation
         ↓
Skill: chapter-planning-skill
  - Load genre pack resources
  - Complete chapter planning
  - Invoke Bailey for scene writing
         ↓
Agent: Bailey (First Drafter)
  - Receive genre_pack context
  - Load style guide
  - Write scene with genre voice
         ↓
MCP: scene-server
  - Store scene with genre metadata
```

### When Skill Invokes Agent: How Does Agent Know Genre Context?

**In Skill (chapter-planning-skill):**

```markdown
## Phase 4: Ready for Scene Writing

User has approved chapter plan. Chapter is ready for Bailey to draft scenes.

**Prepare invocation context:**

```json
{
  "agent": "bailey-first-drafter",
  "task": "write_scene",
  "genre_pack": "{{session.genre_pack}}",
  "genre_pack_path": "{{session.genre_pack_path}}",
  "resources": {
    "style_guide": "{{genre_pack_path}}/style-guides/voice.md",
    "scene_patterns": "{{genre_pack_path}}/templates/scene-patterns.md"
  },
  "scene_details": {
    "chapter": 5,
    "scene": 1,
    "pov": "Detective Alex Chen",
    "purpose": "Crime scene discovery",
    "beat": "Inciting Incident"
  }
}
```

**Invoke agent:**

```
@bailey-first-drafter

**Task:** Write Scene 1, Chapter 5

**Genre Pack:** {{session.genre_pack}}

**Style Guide:** Please read and apply: {{genre_pack_path}}/style-guides/voice.md

**Scene Context:**
- Chapter: 5, Scene: 1
- POV: Detective Alex Chen
- Purpose: Discovery of magical crime scene (inciting incident)
- Tone: {{style_guide.tone}}
- Pacing: {{style_guide.pacing}}

Apply the voice characteristics from the style guide when drafting this scene.
```
```

**In Agent (bailey-first-drafter.md):**

```markdown
## Receiving Genre Pack Context from Skills

When invoked by a skill, I receive genre pack information:

### Step 1: Parse Invocation

Extract parameters:
- `genre_pack`: Name of active genre pack
- `genre_pack_path`: Path to genre pack directory
- `resources.style_guide`: Path to specific style guide file
- `scene_details`: Scene-specific information

### Step 2: Load Style Guide

```
Read file: {{resources.style_guide}}

Extract style characteristics:
- Voice: [gritty, fast-paced, cynical]
- Tone: [serious with occasional dark humor]
- Pacing: [short sentences, punchy dialogue]
- POV preferences: [close third or first person]
- Sensory focus: [urban sounds, smells, textures]
- Vocabulary: [police jargon + magical terminology]
```

### Step 3: Apply to Scene Writing

Generate prose using style guide:
- Match sentence length patterns
- Use genre-appropriate vocabulary
- Apply tone and voice
- Follow pacing guidelines

### Step 4: Self-Check

Before presenting scene:
- Verify voice matches style guide
- Check tone consistency
- Confirm pacing aligns with genre
```

### How Agents Access Genre Pack Resources

**Option A: Pre-loaded by Skill (Recommended)**

Skill loads resources and passes content to agent:

```markdown
## In Skill

1. Load style guide:
   Read: {{genre_pack_path}}/style-guides/voice.md
   Content: [file contents]

2. Pass to agent:
   @bailey "Write scene using these style guidelines: [content]"
```

**Pros:**
- Skill controls resource loading
- Agent receives exactly what it needs
- No file system access required for agent

**Option B: Path Passed, Agent Loads (Alternative)**

Skill passes path, agent reads file:

```markdown
## In Skill

Invoke agent with resource path:
@bailey "Style guide: {{genre_pack_path}}/style-guides/voice.md"

## In Agent

1. Receive path: {{genre_pack_path}}/style-guides/voice.md
2. Read file using Read tool
3. Extract style characteristics
4. Apply to writing
```

**Pros:**
- Agent has flexibility to read multiple resources
- Skill doesn't need to pre-process content

**Cons:**
- Agent needs file system access
- More complexity in agent logic

**Recommendation:** Use Option A (pre-loaded) for most cases. Use Option B when agent needs to explore multiple resources dynamically.

### Should Agents Receive Paths or Pre-loaded Content?

**Best Practice: Hybrid Approach**

```markdown
## Genre Pack Resource Passing

**For specific, required resources:**
→ Pre-load content and pass to agent
→ Example: style_guide content (agent MUST use this)

**For optional, exploratory resources:**
→ Pass path, let agent decide if/when to load
→ Example: knowledge base references (agent MAY consult if needed)

## Example Invocation

```
@bailey-first-drafter

**Task:** Write Scene 1, Chapter 5

**REQUIRED - Style Guide (pre-loaded):**
```
{{style_guide_content}}
```
Apply these voice characteristics when drafting.

**OPTIONAL - Reference Materials (paths if you need them):**
- Police procedures: {{genre_pack_path}}/knowledge/police-procedures.md
- Forensics: {{genre_pack_path}}/knowledge/forensics-basics.md

Draft the crime scene discovery scene for Detective Alex Chen.
```
```

**Rationale:**
- **Pre-loaded = must use**: Guarantees agent applies critical genre elements
- **Paths = may consult**: Gives agent flexibility for depth/accuracy
- **Hybrid = best of both**: Required conformance + optional enhancement

---

## Fallback Behavior

### Comprehensive Fallback Strategy

```
Resource Request
      ↓
┌─────────────────────────────────────────┐
│ 1. Try Genre Pack Resource              │
│    Path: {genre_pack}/resource.md       │
└─────────────────────────────────────────┘
      ↓ (not found)
┌─────────────────────────────────────────┐
│ 2. Try Baseline Resource                │
│    Path: baseline/resource.md           │
└─────────────────────────────────────────┘
      ↓ (not found)
┌─────────────────────────────────────────┐
│ 3. Try Skill Embedded Default           │
│    Built-in generic version             │
└─────────────────────────────────────────┘
      ↓ (not available)
┌─────────────────────────────────────────┐
│ 4. Prompt User                          │
│    Ask user to provide or skip          │
└─────────────────────────────────────────┘
```

### Fallback Logging

**Track all fallbacks in session log:**

```json
{
  "session_id": "session_12345",
  "genre_pack": "cozy-mystery",
  "fallbacks": [
    {
      "timestamp": "2025-11-21T14:32:00Z",
      "resource_type": "template",
      "resource_name": "magic-system.md",
      "requested_path": "genre-packs/cozy-mystery/templates/magic-system.md",
      "fallback_used": "baseline/templates/world-building.md",
      "impact": "Using generic worldbuilding instead of genre-specific magic template",
      "user_notified": true
    },
    {
      "timestamp": "2025-11-21T15:45:00Z",
      "resource_type": "validation",
      "resource_name": "magic-consistency.json",
      "requested_path": "genre-packs/cozy-mystery/validation/magic-consistency.json",
      "fallback_used": "none",
      "impact": "Skipped magic consistency validation (not applicable to cozy mystery)",
      "user_notified": false
    }
  ]
}
```

### End-of-Session Fallback Report

```markdown
## Session Summary

**Genre Pack:** Cozy Mystery (v1.0)

**Resources Used Successfully:** 18
- ✓ Beat sheet: cozy-mystery-beats.md
- ✓ Style guide: voice.md
- ✓ Character template: amateur-sleuth.md
- ✓ Setting template: small-town-setting.md
- [14 more...]

**Fallbacks (3):**

1. **Magic System Template**
   - Requested: cozy-mystery/templates/magic-system.md
   - Used: baseline/templates/world-building.md
   - Impact: Generic worldbuilding questions instead of cozy-specific magic
   - Recommendation: Cozy mysteries rarely have magic systems. Consider adding a "cozy magic" template if this is a cozy magical realism hybrid.

2. **Investigation Framework**
   - Requested: cozy-mystery/templates/investigation-framework.md
   - Used: Skill embedded default
   - Impact: Generic amateur sleuth investigation questions
   - Recommendation: This would be a valuable addition to the cozy-mystery pack.

3. **Magical Crime Types Reference**
   - Requested: cozy-mystery/knowledge/magical-crime-types.md
   - Used: None (skipped - not applicable)
   - Impact: None (user not writing magical crimes in cozy mystery)

**Recommendation:**

Would you like to contribute to the cozy-mystery genre pack?

Missing resources that would improve future sessions:
- templates/investigation-framework.md (amateur sleuth procedures)
- knowledge/small-town-dynamics.md (relationship webs, gossip networks)

I can help you create these based on your series planning.
```

---

## Examples

### Example 1: Urban Fantasy Police Procedural Series

**User Request:**

```
User: "I want to plan a 5-book series about a detective who discovers magic is real while investigating a murder in Seattle."
```

**System Flow:**

```
1. Agent (Miranda) detects:
   - Keywords: "detective", "investigating", "murder" → procedural
   - Keywords: "magic is real" → urban fantasy
   - Match: urban-fantasy-procedural

2. Set session:
   session.genre_pack = "urban-fantasy-procedural"

3. Invoke skill:
   @series-planning-skill with genre_pack="urban-fantasy-procedural"

4. Skill initializes:
   → Load pack.json from genre-packs/urban-fantasy-procedural/
   → Cache resource paths
   → Report: "✓ Loaded genre pack: Urban Fantasy Police Procedural (v1.0)"

5. Skill proceeds through phases:

   Phase 2 (World-Building):
   → Load: urban-fantasy-procedural/templates/magic-system.md
   → Load: urban-fantasy-procedural/templates/investigation-framework.md
   → Present templates to user for customization

   Phase 3 (Character Planning):
   → Load: urban-fantasy-procedural/templates/character-detective.md
   → Load: urban-fantasy-procedural/templates/character-partner.md
   → User creates: Detective Maya Rodriguez (magic-sensitive)

   Phase 5 (Plot Threads):
   → Load: urban-fantasy-procedural/beat-sheets/series-arc.md
   → Plan 5-book conspiracy: Fae Court manipulating Seattle politics

6. Series Bible Generation:
   → Validate with: urban-fantasy-procedural/validation/*.json
   → Check: magic-consistency, procedural-beats, world-rules
   → Generate: series-bible.md with genre pack metadata
```

### Example 2: Cozy Mystery Series

**User Request:**

```
User: "Plan a cozy mystery series set in a small coastal town. The protagonist is a bookshop owner who solves murders."
```

**System Flow:**

```
1. Agent (Miranda) detects:
   - Keywords: "cozy mystery" → exact match
   - Keywords: "bookshop owner", "solves murders" → amateur sleuth
   - Match: cozy-mystery

2. Set session:
   session.genre_pack = "cozy-mystery"

3. Invoke skill:
   @series-planning-skill with genre_pack="cozy-mystery"

4. Skill initializes:
   → Load pack.json from genre-packs/cozy-mystery/
   → Report: "✓ Loaded genre pack: Cozy Mystery (v1.0)"

5. Skill proceeds:

   Phase 2 (World-Building):
   → Load: cozy-mystery/templates/small-town-setting.md
   → Request: cozy-mystery/templates/magic-system.md [NOT FOUND]
   → Fallback: Skip (not needed for cozy mystery)
   → Present small-town template: gossip networks, town dynamics

   Phase 3 (Character Planning):
   → Load: cozy-mystery/templates/character-amateur-sleuth.md
   → Load: cozy-mystery/templates/cozy-cast.md (quirky supporting characters)
   → User creates: Emma Clarke (bookshop owner, puzzle enthusiast)

   Phase 5 (Plot Threads):
   → Load: cozy-mystery/beat-sheets/cozy-mystery-beats.md
   → Plan cases with fair-play clues and red herrings

6. Validation:
   → Check: cozy-mystery/validation/cozy-requirements.json
   → Validate: No graphic violence ✓
   → Validate: Amateur sleuth limitations ✓
   → Validate: Light tone maintained ✓
```

### Example 3: Romantasy Series (Romance + Fantasy Hybrid)

**User Request:**

```
User: "I want to write a romantasy series about a fae prince and a human huntress who are fated mates."
```

**System Flow:**

```
1. Agent (Miranda) detects:
   - Keywords: "romantasy" → exact match
   - Keywords: "fae", "fated mates" → romantasy tropes
   - Match: romantasy

2. Set session:
   session.genre_pack = "romantasy"

3. Invoke skill:
   @series-planning-skill with genre_pack="romantasy"

4. Skill initializes:
   → Load pack.json from genre-packs/romantasy/
   → Report: "✓ Loaded genre pack: Romantasy (v1.2)"

5. Skill proceeds:

   Phase 2 (World-Building):
   → Load: romantasy/templates/magic-system.md (fantasy magic)
   → Load: romantasy/templates/fated-mates.md (fated mates trope structure)
   → User customizes: Fae magic tied to emotions, fated bond mechanic

   Phase 3 (Character Planning):
   → Load: romantasy/templates/character-love-interests.md
   → Create: Prince Kael (fae, duty-bound) + Rowan (huntress, independent)

   Phase 4 (Relationship Progression):
   → Load: romantasy/beat-sheets/romantasy-hybrid.md
   → Plan romance beats INTEGRATED with fantasy quest
   → Book 1: Enemies to lovers
   → Book 2: Deepening bond + political intrigue
   → Book 3: HEA + save kingdom

   Phase 5 (Plot Threads):
   → Load: romantasy/beat-sheets/fantasy-quest.md
   → Interweave: Romance progression + defeating ancient evil

6. Validation:
   → Check: romantasy/validation/romance-progression.json
   → Validate: HEA required ✓
   → Validate: Heat level consistency ✓
   → Check: romantasy/validation/fantasy-rules.json
   → Validate: Magic system coherence ✓
```

### Example 4: No Genre Pack Specified (Baseline Fallback)

**User Request:**

```
User: "Help me plan a 3-book series."
```

**System Flow:**

```
1. Agent (Miranda) detects:
   - No genre keywords
   - No specific genre mentioned
   - Action: Prompt user

2. Miranda response:
   "I can help you plan your series! Which genre are you writing?

   Available genre packs:
   1. Baseline (Generic)
   2. Urban Fantasy Police Procedural
   3. Cozy Mystery
   4. Romantasy
   5. Dark Romance

   Or describe your genre, and I'll match it."

3. User declines to specify:
   User: "Just help me plan the structure, I'll decide genre later."

4. Set session:
   session.genre_pack = "baseline"

5. Invoke skill:
   @series-planning-skill with genre_pack="baseline"

6. Skill initializes:
   → Load pack.json from genre-packs/baseline/
   → Report: "✓ Using baseline (generic) genre pack. You can specify a genre later."

7. Skill proceeds:

   Phase 2 (World-Building):
   → Load: baseline/templates/world-building.md (generic questions)
   → No genre-specific frameworks

   Phase 3 (Character Planning):
   → Load: baseline/templates/character-profile.md (universal profile)
   → No archetypes, just general character development

   Phase 5 (Plot Threads):
   → Load: baseline/beat-sheets/three-act-structure.md
   → Generic three-act, no genre-specific beats

8. At any phase, user can switch:
   User: "Actually, this is a thriller. Can we switch to thriller beats?"

   Skill: "I don't have a 'thriller' genre pack yet, but I can use baseline
   three-act structure with thriller pacing. Or you can switch to a different
   available pack if your thriller has elements of urban fantasy, mystery, etc."
```

### Example 5: Agent Invokes Skill, Skill Invokes Agent (Genre Context Flow)

**User Request:**

```
User: "Write the opening scene of Chapter 1"
```

**System Flow:**

```
1. Agent (Miranda) receives request

2. Check context:
   - Current series: "Chronicles of the Veil" (Urban Fantasy Procedural)
   - Current book: Book 1
   - Chapter planning: Chapter 1 approved ✓
   - Genre pack: urban-fantasy-procedural

3. Miranda invokes chapter-planning-skill:
   @chapter-planning-skill "Check if Chapter 1 is ready for scene writing"

4. chapter-planning-skill responds:
   "Chapter 1 is fully planned and approved. Ready for scene writing.

   Scene 1 details:
   - POV: Detective Alex Chen
   - Purpose: Introduce Alex, establish normal world
   - Setting: Seattle PD precinct, morning
   - Beat: Opening Image"

5. Miranda invokes Bailey:
   @bailey-first-drafter

   "Write Scene 1, Chapter 1 for 'Chronicles of the Veil'

   Genre Pack: urban-fantasy-procedural
   Style Guide: [loads and passes content from urban-fantasy-procedural/style-guides/voice.md]

   Style characteristics:
   - Voice: Gritty, fast-paced, cynical detective
   - Tone: Serious with dark humor
   - Pacing: Punchy sentences, quick exchanges
   - Sensory: Urban sounds, coffee shop smells, rain
   - POV: Close third person (Alex's perspective)

   Scene details:
   - POV: Detective Alex Chen
   - Setting: Seattle PD precinct, morning
   - Purpose: Establish normal world before magic intrudes
   - Mood: Routine police work, Alex is bored/restless

   Please write the opening scene applying the genre voice."

6. Bailey (agent) writes:

   "The coffee was shit, but Alex Chen drank it anyway..."

   [Scene continues with gritty urban voice, detective POV, sensory details]

7. Bailey presents scene to user:
   "Here's Scene 1, written in the Urban Fantasy Procedural voice.
   I applied the style guide: fast pacing, cynical detective tone, urban sensory details."

8. User reviews and approves:
   User: "Perfect! That's exactly the voice I wanted."

9. Bailey (after approval) logs to MCP:
   @scene-server.create_scene({
     scene_id: "scene_001",
     chapter_id: "chap_001",
     content: "The coffee was shit...",
     genre_pack: "urban-fantasy-procedural",
     style_guide_used: "voice.md",
     pov_character: "Alex Chen"
   })
```

---

## Migration Guide: Current (v1.0) to Genre Pack (v2.0)

### For Existing Skills

**Current State (series-planning-skill.md):**

```yaml
---
name: series-planning-skill
description: Comprehensive series planning for Urban Fantasy Police Procedural novels.
metadata:
  version: "1.0"
  genre: "Urban Fantasy Police Procedural"
---
```

**Target State (v2.0):**

```yaml
---
name: series-planning-skill
description: Comprehensive series planning. Adapts to genre via genre packs.
metadata:
  version: "2.0"
  genre_pack: "{{session.genre_pack || 'baseline'}}"
---

# Series Planning Skill

## Session Initialization

### Genre Pack Loading
[See "Pattern 1: Genre Pack Detection" above]
```

### For Existing Series Data

**If user has existing series planned with v1.0 (hardcoded genre):**

```markdown
## Migrating Existing Series to Genre Pack Model

When resuming work on a series created with v1.0:

1. Detect v1.0 series (no genre_pack in metadata)

2. Infer genre pack:
   - Read series.metadata.genre (if exists)
   - Match to available genre packs
   - Example: "Urban Fantasy Police Procedural" → "urban-fantasy-procedural"

3. Update series metadata:
   ```
   update_series(series_id, {
     metadata: {
       genre_pack: "urban-fantasy-procedural",
       genre_pack_version: "1.0",
       migrated_from: "v1.0_hardcoded",
       migration_date: "2025-11-21"
     }
   })
   ```

4. Load genre pack as normal

5. Notify user:
   ```
   ✓ Migrated series to genre pack model
   - Series: Chronicles of the Veil
   - Genre pack: Urban Fantasy Police Procedural (v1.0)
   - All existing planning data preserved
   ```
```

---

## Future Enhancements

### v2.1: Genre Pack Blending

**Allow users to blend multiple genre packs:**

```
User: "I want a cozy mystery with magical elements"

System: "I can blend genre packs for you:
- Primary: cozy-mystery (tone, amateur sleuth, structure)
- Secondary: urban-fantasy-procedural (magic system templates)

This creates a cozy magical mystery hybrid."

session.genre_pack = "cozy-mystery"
session.genre_pack_blend = ["urban-fantasy-procedural"]
```

### v2.2: User-Created Genre Packs

**Allow users to create custom genre packs:**

```
User: "Create a new genre pack for supernatural romance"

System: "I'll help you create a custom genre pack.

Genre Pack Builder:
1. Name: supernatural-romance
2. Parent genres: [romance, paranormal]
3. Resources to include:
   - Beat sheets (which frameworks?)
   - Style guides (describe voice)
   - Templates (character types?)
   - Validation rules (genre requirements?)

Let's start with beat sheets..."
```

### v2.3: Community Genre Pack Repository

**GitHub repository for community-contributed genre packs:**

```
BQ-Studio-Genre-Packs/
├── official/
│   ├── urban-fantasy-procedural/
│   ├── cozy-mystery/
│   └── romantasy/
├── community/
│   ├── steampunk-adventure/
│   ├── dystopian-ya/
│   └── historical-romance/
└── README.md (submission guidelines)
```

---

## Appendix: Quick Reference

### Genre Pack Checklist

**Minimum Viable Genre Pack:**

- [ ] `pack.json` (metadata)
- [ ] `beat-sheets/` directory with at least one beat sheet
- [ ] `style-guides/voice.md` (genre voice characteristics)
- [ ] `templates/character-profile.md` (genre-appropriate character template)
- [ ] `validation/` directory with at least one validation rule

**Complete Genre Pack:**

- [ ] All minimum viable requirements
- [ ] Multiple beat sheet options
- [ ] Style guides for voice, dialogue, exposition
- [ ] Character archetype templates
- [ ] World-building templates (if applicable)
- [ ] Comprehensive validation rules
- [ ] Knowledge base references
- [ ] Example scenes/excerpts

### File Naming Conventions

**Genre Pack Directory Names:**
- Lowercase with hyphens: `urban-fantasy-procedural`
- Not: `Urban_Fantasy_Procedural`, `urbanFantasyProcedural`

**Resource Files:**
- Lowercase with hyphens: `magic-system.md`, `cozy-mystery-beats.md`
- Not: `Magic_System.md`, `cozyMysteryBeats.md`

**pack.json Fields:**
- `name`: Directory name (lowercase-hyphenated)
- `display_name`: Human-readable (Title Case)
- `version`: Semantic versioning (1.0.0)

---

## Support & Contributing

### Questions?

- Check existing genre packs in `genre-packs/` for examples
- Review baseline pack for minimum structure
- Read skill integration points for how resources are used

### Want to Contribute a Genre Pack?

1. Fork the BQ-Studio repository
2. Create new directory: `genre-packs/your-genre-name/`
3. Follow structure in baseline or existing packs
4. Include `pack.json` with metadata
5. Test with all 5 skills (series, book, chapter, scene, review)
6. Submit pull request

### Reporting Issues

- Missing resource fallbacks not working? Report in issues.
- Genre pack not loading? Check `pack.json` format.
- Validation rules not running? Check JSON syntax.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-21
**Maintained By:** BQ-Studio Team
**License:** MIT
