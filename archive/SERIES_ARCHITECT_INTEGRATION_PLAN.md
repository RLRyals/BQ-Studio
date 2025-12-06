# Series Architect 2 Integration Plan
**Integration with BQ-Studio Writing Team, Agent Skills, Genre Packs, NPE, and Custom MCPs**

**Date:** 2025-11-23
**Status:** Planning Phase
**Current SA2 Version:** 2.1 (Production Ready)
**Target:** Unified Planning → Execution Pipeline

---

## Executive Summary

This plan integrates **Series Architect 2** (SA2) into the BQ-Studio ecosystem, creating a seamless workflow from high-level series planning through execution with the AI Agent Writing Team.

**Integration Goals:**
1. ✅ SA2 planning data flows automatically into MCP servers
2. ✅ SA2 beat sheets become available as genre pack resources
3. ✅ NPE pre-validation during SA2 planning phase
4. ✅ Genre pack dynamic loading enables multi-genre support
5. ✅ Unified documentation and user experience

**Current State:**
- SA2: Standalone planning tool, markdown output to `series-architect-2/outputs/`
- Writing Team: 9 agents using 5 skills that read from 9 MCP servers
- Genre Packs: Architecture documented (2039 lines), only Urban Fantasy Police Procedural implemented
- NPE: 10 JSON rule files, integrated with agents, no comprehensive guide

**Target State:**
- SA2 → MCP automatic import with validation
- Multi-genre support via SA2 beat sheets as genre packs
- NPE pre-validation in SA2 planning
- Single unified workflow: **Plan (SA2) → Import (Bridge) → Execute (Writing Team)**

---

## Phase 1: Foundation (NPE Documentation)

**Objective:** Create comprehensive NPE documentation to support integration

**Why First:** Agents and skills reference NPE; need canonical documentation before integrating NPE into SA2

### Task 1.1: Create NPE Master Guide

**File:** `.claude/docs/NPE_GUIDE.md`

**Content Structure:**
```markdown
# Narrative Physics Engine (NPE) Guide

## What is NPE?
- Philosophy: Story quality as measurable physics
- Why it matters: Prevent common fiction failures
- How it's enforced: Agent validation, scorecards

## The 10 Physics Categories
1. Character Logic - Behavioral consistency
2. Pacing Rules - Scene/chapter/act rhythm
3. Dialogue Physics - No echolalia, subtext requirements
4. Scene Architecture - Intention → Obstacle → Pivot → Consequence
5. POV Physics - Subjective bias, limited knowledge
6. Information Economy - Revelations alter choices
7. Stakes & Pressure - Escalation patterns
8. Plot Mechanics - Causality, agency
9. Offstage Narrative - What happens off-page
10. Transitions - Scene/chapter flow

## How Agents Use NPE
- Bailey: Self-validation before presenting drafts
- Miranda: Compliance scorecard, 90%+ approval threshold
- Tessa: Flags violations during continuity review
- Edna: Pacing analysis

## How Users Interpret NPE Scores
- 90-100%: Excellent, approve immediately
- 80-89%: Good, minor revisions
- 70-79%: Needs work, identify specific violations
- <70%: Major issues, significant revision required

## NPE Scorecard Format
[Example scorecard with visual bars]

## Examples
- Violation: [example]
- Fix: [solution]
[Repeat for each physics category]

## Genre-Specific NPE Rules
- Urban Fantasy Police Procedural: [link to npe-physics/]
- Romance: [TBD]
- Romantasy: [TBD]
```

**Implementation Steps:**
1. Create `.claude/docs/NPE_GUIDE.md`
2. Extract examples from existing NPE JSON files
3. Document scorecard format from `miranda-showrunner.md`
4. Add links to genre-specific physics files
5. Update all agent files to reference NPE_GUIDE.md
6. Update all skill files to reference NPE_GUIDE.md

**Deliverables:**
- ✅ `.claude/docs/NPE_GUIDE.md` (comprehensive guide)
- ✅ Updated agent files with NPE guide links
- ✅ Updated skill files with NPE guide links

**Success Criteria:**
- Users can understand NPE scores
- Agents have single canonical NPE reference
- New genre pack creators know how to define NPE rules

---

## Phase 2: SA2 → MCP Bridge (Core Integration)

**Objective:** Automatically import SA2 planning data into MCP servers

**Why Critical:** Enables handoff from planning (SA2) to execution (Writing Team)

### Task 2.1: Create SA2 Import Skill

**File:** `.claude/skills/import-sa2-to-mcp-skill.md`

**Skill Architecture:**
```markdown
# Import SA2 to MCP Skill

## Purpose
Import Series Architect 2 planning outputs into BQ-Studio MCP servers

## MCPs Used
- author-server (author profile)
- series-planning-server (series data, world rules, arcs)
- book-planning-server (book structure, acts, beats)
- character-planning-server (character knowledge, beliefs, arcs)

## Input Requirements
User provides path to SA2 outputs directory:
- `series-architect-2/outputs/[project-name]/`

## Import Workflow

### Step 1: Validate SA2 Output Structure
Check for required files:
- ✅ intake_form.md
- ✅ series_framework.md
- ✅ book_*/book_*_dossier.md

### Step 2: Parse and Extract Data

**From intake_form.md:**
- Series title, genre, heat level, violence level
- Number of books, chapters per book
- Author decisions and metadata

**From series_framework.md:**
- Series premise and theme
- Overarching series arc
- Series-wide world-building rules
- Recurring characters

**From book_X_dossier.md (for each book):**
- Book title, premise, theme
- Character profiles (extract names, wounds, arcs, needs, wants)
- Beat outline (map to book structure)
- Act structure
- Subplot tracking

**From book_X_act_*.md (for each act):**
- Chapter outlines
- Scene beats
- Character development notes

### Step 3: Transform to MCP Format

**author-server:**
```json
{
  "authorId": "auth_[generated]",
  "name": "[from intake]",
  "preferences": {
    "genre": "[from intake]",
    "heatLevel": [from intake],
    "violenceLevel": [from intake]
  }
}
```

**series-planning-server:**
```json
{
  "seriesId": "series_[generated]",
  "title": "[from series_framework]",
  "premise": "[from series_framework]",
  "numberOfBooks": [from intake],
  "overarchingArc": "[from series_framework]",
  "worldRules": {
    "magicSystem": "[from series_framework or worldbuilding_guide]",
    "politicalStructures": "[from series_framework]",
    "species": "[from series_framework]"
  },
  "seriesThemes": ["[extracted from series_framework]"]
}
```

**book-planning-server (for each book):**
```json
{
  "bookId": "book_[generated]",
  "seriesId": "series_[linked]",
  "bookNumber": [X],
  "title": "[from book_dossier]",
  "premise": "[from book_dossier]",
  "acts": [
    {
      "actNumber": 1,
      "description": "[from book_dossier act structure]",
      "chapters": ["[from book_X_act_1.md]"]
    }
  ],
  "beatSheet": {
    "framework": "[detected from dossier]",
    "beats": ["[extracted from beat outline]"]
  }
}
```

**character-planning-server (for each character):**
```json
{
  "characterId": "char_[generated]",
  "name": "[from character profile]",
  "role": "protagonist" | "love_interest" | "supporting",
  "ghost": "[from profile: Ghost/Wound]",
  "misbelief": "[from profile: Misbelief/Lie]",
  "need": "[from profile: Need (Psychological)]",
  "want": "[from profile: Want (External)]",
  "arc": {
    "startingPoint": "[from Character Arc]",
    "transformation": "[from Character Arc]",
    "endingPoint": "[from Character Arc]"
  },
  "emotionalState": {
    "currentState": "[inferred from starting point]"
  },
  "knowledge": {
    "knows": ["[inferred from backstory]"]
  }
}
```

### Step 4: Permission Protocol

**Ask user permission before any CREATE operations:**

"I've parsed your Series Architect 2 planning data. Here's what I'll import:

**Series:**
- Title: [title]
- Books: [count]
- Genre: [genre]

**Characters:** [count] characters
[List character names with roles]

**Books:** [count] books
[List book titles with chapter counts]

Type 'approved' to import this data to your MCP servers, or let me know what needs adjustment."

**Wait for approval.**

### Step 5: Execute Import

1. Create author profile → author-server
2. Create series → series-planning-server
3. Create characters → character-planning-server
4. Create books with acts → book-planning-server
5. Link relationships (seriesId, characterIds, bookIds)

### Step 6: Validation

**Post-import validation:**
- ✅ All books created (count matches intake)
- ✅ All characters created (cross-reference character profiles)
- ✅ Series relationships linked correctly
- ✅ No orphaned data

### Step 7: Report to User

"Import complete! ✅

**Imported to MCP servers:**
- Series: [title] (series_[id])
- Books: [count] books
- Characters: [count] characters

**Next Steps:**
You can now use the Writing Team to begin chapter planning and scene writing.

Suggested workflow:
1. Review imported data: Use MCP tools to verify series/book/character data
2. Begin chapter planning: Invoke 'chapter-planning' skill for Book 1
3. Start scene writing: Invoke 'scene-writing' skill with Bailey

**MCP Server Status:**
- series-planning-server: ✅ Series [id] active
- book-planning-server: ✅ [count] books ready
- character-planning-server: ✅ [count] characters loaded
"

## Error Handling

**Missing required files:**
- Error: "Required SA2 file not found: [filename]"
- Solution: Provide path to complete SA2 output directory

**Malformed SA2 data:**
- Error: "Could not parse [filename]: [specific issue]"
- Solution: Validate SA2 output structure, re-run SA2 if needed

**MCP server connection failures:**
- Error: "Could not connect to [server-name]"
- Solution: Verify MCP servers running in Docker

**Duplicate data:**
- Ask: "Series '[title]' already exists in MCP. Overwrite or create new version?"
- Wait for user decision

## Session Management

**ID Caching:**
- Cache generated IDs (seriesId, bookIds, characterIds) for session
- Provide ID cheat sheet to user if requested
- Users interact with names, skill resolves to IDs

**Resume Capability:**
- If import fails mid-process, skill can resume
- Track import progress: "Step 5/7: Creating books..."
- Allow retry of failed steps

## Integration with Writing Team

**Post-Import Handoff:**
After successful import, user can:
1. Invoke Miranda (showrunner) to review series structure
2. Use chapter-planning skill to expand book outlines
3. Use scene-writing skill with Bailey to draft scenes

**SA2 Metadata Preservation:**
Store reference to SA2 source in series metadata:
```json
{
  "seriesId": "series_001",
  "metadata": {
    "source": "series-architect-2",
    "sa2OutputPath": "series-architect-2/outputs/arcane-protocol/",
    "importedAt": "2025-11-23T10:30:00Z"
  }
}
```
```

**Implementation Steps:**
1. Create `.claude/skills/import-sa2-to-mcp-skill.md` with above content
2. Implement SA2 file parsers:
   - `intake_form.md` parser (metadata extraction)
   - `series_framework.md` parser (world rules, arcs)
   - `book_*_dossier.md` parser (character profiles, beat sheets)
   - `book_*_act_*.md` parser (chapter outlines)
3. Create MCP transformation logic
4. Add permission protocol
5. Add validation checks
6. Test with existing SA2 outputs (`series-planning/arcane-protocol/`)

**Deliverables:**
- ✅ `.claude/skills/import-sa2-to-mcp-skill.md`
- ✅ Tested import with Arcane Protocol series
- ✅ Validation report confirming successful import

**Success Criteria:**
- SA2 planning data successfully imported to all 4 MCP servers
- Data relationships correctly linked (series ↔ books ↔ characters)
- User can immediately begin chapter planning after import

---

## Phase 3: Genre Pack Dynamic Loading (v2.0 Implementation)

**Objective:** Implement genre pack dynamic loading in all 5 skills

**Why Important:** Enables multi-genre support, extensibility for new genres

**Current State:**
- Architecture fully documented (`.claude/docs/GENRE_PACK_LOADING.md`, 2039 lines)
- Skills currently hardcoded: `genre: "Urban Fantasy Police Procedural"`
- Only one genre pack exists: `urban-fantasy-police-procedural/`

**Target State:**
- Skills auto-detect genre from MCP series data
- Skills load appropriate genre pack resources
- Fallback hierarchy: genre-specific → baseline → embedded defaults

### Task 3.1: Create Baseline Genre Pack

**Directory:** `.claude/genre-packs/baseline/`

**Purpose:** Universal fallback for any genre

**Structure:**
```
.claude/genre-packs/baseline/
├── manifest.json
├── beat-sheets/
│   └── three-act-structure.md (universal)
├── templates/
│   ├── character_profile_template.md
│   ├── worldbuilding_template.md
│   └── chapter_outline_template.md
├── style-guides/
│   └── universal_prose_principles.md
├── validation-rules/
│   └── universal_continuity_checks.json
└── npe-physics/
    ├── character-logic.json (baseline)
    ├── pacing-rules.json (baseline)
    ├── dialogue-physics.json (baseline)
    ├── scene-architecture.json (baseline)
    ├── pov-physics.json (baseline)
    ├── information-economy.json (baseline)
    ├── stakes-pressure.json (baseline)
    ├── plot-mechanics.json (baseline)
    ├── offstage-narrative.json (baseline)
    └── transitions.json (baseline)
```

**manifest.json:**
```json
{
  "name": "baseline",
  "display_name": "Universal Fiction (Baseline)",
  "version": "1.0",
  "description": "Genre-agnostic baseline templates and NPE rules",
  "genre": "universal",
  "subgenres": ["all"],
  "heat_levels": [0, 1, 2, 3, 4, 5],
  "violence_levels": [0, 1, 2, 3, 4, 5],
  "resources": {
    "beat_sheets": ["three-act-structure"],
    "templates": ["character_profile", "worldbuilding", "chapter_outline"],
    "style_guides": ["universal_prose_principles"],
    "validation_rules": ["universal_continuity_checks"],
    "npe_physics": [
      "character-logic", "pacing-rules", "dialogue-physics",
      "scene-architecture", "pov-physics", "information-economy",
      "stakes-pressure", "plot-mechanics", "offstage-narrative",
      "transitions"
    ]
  },
  "fallback_priority": 0
}
```

**NPE Physics Files:**
- Extract universal rules from existing Urban Fantasy Police Procedural NPE files
- Remove genre-specific rules (investigation pacing, detective logic)
- Keep core physics (character consistency, dialogue, scene structure, POV)

**Implementation Steps:**
1. Create `.claude/genre-packs/baseline/` directory
2. Create `manifest.json`
3. Copy universal beat sheet (three-act structure) from SA2 or create new
4. Create baseline templates (character, worldbuilding, chapter outline)
5. Create universal NPE physics files (strip genre-specific rules from UFPP)
6. Validate baseline pack structure

**Deliverables:**
- ✅ `.claude/genre-packs/baseline/` complete with all resources
- ✅ Validated baseline pack (passes integrity check)

### Task 3.2: Update Skills for Genre Pack Discovery

**Files to Update (all 5 skills):**
1. `.claude/skills/series-planning-skill.md`
2. `.claude/skills/book-planning-skill.md`
3. `.claude/skills/chapter-planning-skill.md`
4. `.claude/skills/scene-writing-skill.md`
5. `.claude/skills/review-qa-skill.md`

**Changes Required:**

**OLD (hardcoded):**
```markdown
## Genre Pack
genre: "Urban Fantasy Police Procedural"
```

**NEW (dynamic discovery):**
```markdown
## Genre Pack Discovery

### Step 1: Detect Genre from Series Data
1. Query series-planning-server for series metadata
2. Extract `genre` field
3. If genre not set, ask user: "What genre is this series?"

### Step 2: Load Genre Pack
1. Check for genre-specific pack: `.claude/genre-packs/[genre]/`
2. If exists, load pack manifest
3. If not exists, check for baseline pack: `.claude/genre-packs/baseline/`
4. If baseline not exists, use embedded defaults (current skill behavior)

### Step 3: Cache Genre Pack Resources
Load resources per manifest:
- Beat sheets from `beat-sheets/`
- Templates from `templates/`
- Style guides from `style-guides/`
- Validation rules from `validation-rules/`
- NPE physics from `npe-physics/`

### Step 4: Session Caching
Cache loaded genre pack for session:
```json
{
  "genrePack": "urban-fantasy-police-procedural",
  "resources": {
    "beatSheets": ["investigation_structure", "case_of_the_week"],
    "templates": ["detective_character", "case_template"],
    "npePhysics": ["character-logic.json", "pacing-rules.json", ...]
  }
}
```

### Fallback Hierarchy
1. Genre-specific pack (e.g., `urban-fantasy-police-procedural/`)
2. Baseline pack (`baseline/`)
3. Embedded defaults (current skill content)
```

**Implementation Steps:**
1. Update all 5 skill files with genre pack discovery protocol
2. Remove hardcoded genre references
3. Add genre detection from MCP series data
4. Add fallback logic
5. Test with Urban Fantasy Police Procedural pack
6. Test with baseline pack (simulate missing genre-specific pack)
7. Test with no genre packs (embedded defaults)

**Deliverables:**
- ✅ All 5 skills updated with dynamic genre pack loading
- ✅ Tested with existing Urban Fantasy Police Procedural pack
- ✅ Tested with baseline pack fallback
- ✅ Tested with embedded defaults fallback

**Success Criteria:**
- Skills auto-detect genre from series data
- Skills load correct genre pack resources
- Fallback hierarchy works correctly
- Session caching prevents redundant loading

---

## Phase 4: SA2 Beat Sheets → Genre Pack Format

**Objective:** Convert SA2's 10 beat sheet frameworks into BQ-Studio genre packs

**Why Important:** Makes SA2's romance/romantasy structures available to Writing Team

**SA2 Beat Sheets to Convert:**
1. Three-Act Structure (universal)
2. Romance Beat Sheet (contemporary romance)
3. Romantasy 20 Beats (paranormal romance)
4. Romantasy - The Beats (epic romantasy)
5. A: Mutual Trauma Bonding
6. B: Protector × Wounded
7. C: Toxic Coping → Healing
8. D: Post-Trauma Re-Entry
9. E: Dark Trauma Hybrid
10. Dark Romancing The Beats (villain/antihero romance)

### Task 4.1: Create Romance Genre Pack

**Directory:** `.claude/genre-packs/romance/`

**Beat Sheets:**
- `romance-beat-sheet.md` (from SA2)
- `dark-romance-beats.md` (from SA2)

**Templates:**
- Extract character templates from SA2 (`character_architecture_template.md`)
- Extract story dossier templates from SA2 (`story_dossier_worksheet_truby_style.md`)

**NPE Physics:**
- Create romance-specific NPE rules:
  - Character logic: Relationship dynamics, consent protocols
  - Pacing: Romance arc progression, tension beats
  - Dialogue: Flirtation patterns, emotional vulnerability
  - Information economy: Secret reveals, vulnerability timing

**manifest.json:**
```json
{
  "name": "romance",
  "display_name": "Contemporary Romance",
  "version": "1.0",
  "description": "Contemporary romance beat sheets and templates from Series Architect 2",
  "genre": "romance",
  "subgenres": ["contemporary", "small-town", "billionaire", "workplace"],
  "heat_levels": [1, 2, 3],
  "violence_levels": [0, 1],
  "resources": {
    "beat_sheets": ["romance-beat-sheet", "dark-romance-beats"],
    "templates": [
      "character_architecture_sa2",
      "story_dossier_truby_style",
      "couple_profile"
    ],
    "npe_physics": [
      "character-logic", "pacing-rules", "dialogue-physics",
      "relationship-dynamics", "consent-protocols"
    ]
  },
  "source": "series-architect-2 v2.1"
}
```

### Task 4.2: Create Romantasy Genre Pack

**Directory:** `.claude/genre-packs/romantasy/`

**Beat Sheets:**
- `romantasy-20-beats.md` (from SA2)
- `romantasy-the-beats.md` (from SA2, epic variant)

**Templates:**
- Character templates with supernatural elements
- Worldbuilding templates for fantasy romance settings

**NPE Physics:**
- Romantasy-specific NPE rules:
  - Character logic: Magic usage consistency, species behavior
  - World rules: Magic system constraints, political dynamics
  - Romance pacing: Paranormal mate bonds, forbidden love escalation

**manifest.json:**
```json
{
  "name": "romantasy",
  "display_name": "Romantic Fantasy (Romantasy)",
  "version": "1.0",
  "description": "Romantasy beat sheets and templates from Series Architect 2",
  "genre": "romantasy",
  "subgenres": ["paranormal", "fantasy-romance", "fae", "vampire", "shifter"],
  "heat_levels": [2, 3, 4, 5],
  "violence_levels": [1, 2, 3, 4],
  "resources": {
    "beat_sheets": ["romantasy-20-beats", "romantasy-the-beats"],
    "templates": [
      "character_architecture_sa2",
      "worldbuilding_romantasy",
      "species_profile"
    ],
    "npe_physics": [
      "character-logic", "pacing-rules", "magic-system-consistency",
      "relationship-dynamics", "paranormal-bonds"
    ]
  },
  "source": "series-architect-2 v2.1"
}
```

### Task 4.3: Create Dark Romance Genre Pack

**Directory:** `.claude/genre-packs/dark-romance/`

**Beat Sheets:**
- `a-mutual-trauma-bonding.md` (from SA2)
- `b-protector-wounded.md` (from SA2)
- `c-toxic-coping-healing.md` (from SA2)
- `d-post-trauma-reentry.md` (from SA2)
- `e-dark-trauma-hybrid.md` (from SA2)
- `dark-romancing-the-beats.md` (from SA2)

**Templates:**
- Trauma-informed character templates
- Consent protocol templates
- Trigger warning integration templates

**NPE Physics:**
- Dark romance-specific NPE rules:
  - Consent protocols at every beat
  - Grounding techniques in scenes
  - Trigger warning placement
  - Non-linear healing progression
  - Aftercare and processing scenes

**manifest.json:**
```json
{
  "name": "dark-romance",
  "display_name": "Dark Romance (Trauma-Informed)",
  "version": "1.0",
  "description": "Trauma-informed dark romance beat sheets from Series Architect 2",
  "genre": "dark-romance",
  "subgenres": ["mafia", "bully", "captive", "enemies-to-lovers-dark", "villain-romance"],
  "heat_levels": [4, 5],
  "violence_levels": [3, 4, 5],
  "content_warnings": [
    "Contains trauma-informed frameworks with consent protocols",
    "Requires trigger warning integration",
    "Includes aftercare and grounding techniques"
  ],
  "resources": {
    "beat_sheets": [
      "a-mutual-trauma-bonding",
      "b-protector-wounded",
      "c-toxic-coping-healing",
      "d-post-trauma-reentry",
      "e-dark-trauma-hybrid",
      "dark-romancing-the-beats"
    ],
    "templates": [
      "trauma_informed_character",
      "consent_protocol_checklist",
      "trigger_warning_template",
      "aftercare_scene_template"
    ],
    "npe_physics": [
      "character-logic", "consent-protocols", "trauma-healing-progression",
      "trigger-warning-placement", "aftercare-requirements"
    ]
  },
  "source": "series-architect-2 v2.1"
}
```

### Task 4.4: Copy SA2 Beat Sheets to Genre Packs

**Implementation Steps:**

**For each genre pack:**
1. Create genre pack directory
2. Copy relevant beat sheets from `series-architect-2/beat_sheet_library/` to `beat-sheets/`
3. Copy relevant templates from `series-architect-2/templates/` to `templates/`
4. Create genre-specific NPE physics files (adapt from baseline + genre requirements)
5. Create `manifest.json`
6. Validate pack structure

**Beat Sheet Mapping:**
- **Romance:**
  - `romance_beat_sheet.md` → `romance/beat-sheets/romance-beat-sheet.md`
  - `Dark_Romancing_The_Beats.md` → `romance/beat-sheets/dark-romance-beats.md`

- **Romantasy:**
  - `romantasy_20_beats.md` → `romantasy/beat-sheets/romantasy-20-beats.md`
  - `romantasy_-_The_Beats.md` → `romantasy/beat-sheets/romantasy-the-beats.md`

- **Dark Romance:**
  - `A_MutualTrauma_Bonding.md` → `dark-romance/beat-sheets/a-mutual-trauma-bonding.md`
  - `B_Protector_Wounded.md` → `dark-romance/beat-sheets/b-protector-wounded.md`
  - `C_Toxic_Coping.md` → `dark-romance/beat-sheets/c-toxic-coping-healing.md`
  - `D_PostTrauma_Reentry.md` → `dark-romance/beat-sheets/d-post-trauma-reentry.md`
  - `E_Dark_TraumaHybrid.md` → `dark-romance/beat-sheets/e-dark-trauma-hybrid.md`

**Template Mapping:**
- Copy all SA2 templates to each genre pack's `templates/` directory
- Customize as needed for genre (e.g., add "species" field to romantasy character templates)

**Deliverables:**
- ✅ `.claude/genre-packs/romance/` (complete pack)
- ✅ `.claude/genre-packs/romantasy/` (complete pack)
- ✅ `.claude/genre-packs/dark-romance/` (complete pack)
- ✅ All SA2 beat sheets copied and adapted

**Success Criteria:**
- Writing Team skills can load romance/romantasy/dark-romance genre packs
- Beat sheets from SA2 available to book-planning skill
- Templates from SA2 available to series-planning skill

---

## Phase 5: NPE Pre-Validation in SA2

**Objective:** Add NPE rule checking during SA2 planning phase

**Why Important:** Catch potential NPE violations before writing begins

**Integration Point:** SA2 Stage 5, Step 4 (Beat Outlines)

### Task 5.1: Create NPE Pre-Validation Module for SA2

**File:** `series-architect-2/scripts/validate_npe_planning.py`

**Purpose:** Analyze SA2 beat outlines for potential NPE violations

**NPE Rules Applicable to Planning Phase:**

**1. Character Logic (Predictive)**
- Check: Character arcs align with ghost/wound → misbelief → need progression
- Violation: Character makes decision inconsistent with established misbelief
- Example: Character with trust issues immediately trusts stranger

**2. Pacing Rules (Structural)**
- Check: Beat spacing follows genre conventions
- Violation: Too many high-tension beats clustered together
- Example: 5 consecutive action scenes without character processing time

**3. Scene Architecture (Pre-Validation)**
- Check: Each beat has intention → obstacle → consequence
- Violation: Beat lacks clear obstacle or consequence
- Example: "Characters go to dinner" (no conflict, no stakes)

**4. Information Economy (Planning)**
- Check: Information reveals happen when they alter character choices
- Violation: Critical reveal happens too early or too late
- Example: Character learns secret in Act 1 but doesn't act on it until Act 3

**5. Stakes & Pressure (Escalation Pattern)**
- Check: Stakes escalate from Act 1 → Act 5
- Violation: Act 3 stakes lower than Act 2 stakes
- Example: Act 2 villain threatens city, Act 3 villain threatens single person

**Script Functionality:**

```python
# series-architect-2/scripts/validate_npe_planning.py

import json
from pathlib import Path

def load_npe_rules(genre_pack_path):
    """Load NPE physics rules from genre pack"""
    npe_dir = genre_pack_path / "npe-physics"
    rules = {}
    for file in ["character-logic.json", "pacing-rules.json",
                 "scene-architecture.json", "information-economy.json",
                 "stakes-pressure.json"]:
        with open(npe_dir / file) as f:
            rules[file.replace(".json", "")] = json.load(f)
    return rules

def analyze_beat_outline(beat_outline_path, npe_rules):
    """Analyze SA2 beat outline for NPE compliance"""
    # Parse beat outline markdown
    # Extract beats, character arcs, pacing structure
    # Check against NPE rules
    # Return violations and score

    violations = []
    scores = {}

    # Character Logic Check
    # [implementation]

    # Pacing Rules Check
    # [implementation]

    # Scene Architecture Check
    # [implementation]

    # Information Economy Check
    # [implementation]

    # Stakes & Pressure Check
    # [implementation]

    return {
        "scores": scores,
        "violations": violations,
        "overall_score": calculate_overall_score(scores)
    }

def generate_npe_report(analysis):
    """Generate NPE pre-validation report"""
    report = f"""
# NPE Pre-Validation Report

## Overall Score: {analysis['overall_score']}%

## Category Scores:
- Character Logic: {analysis['scores']['character-logic']}%
- Pacing Rules: {analysis['scores']['pacing-rules']}%
- Scene Architecture: {analysis['scores']['scene-architecture']}%
- Information Economy: {analysis['scores']['information-economy']}%
- Stakes & Pressure: {analysis['scores']['stakes-pressure']}%

## Violations Detected:

{format_violations(analysis['violations'])}

## Recommendations:

{generate_recommendations(analysis['violations'])}
"""
    return report
```

**Integration Steps:**
1. Create `validate_npe_planning.py` script
2. Update SA2 `SKILL.md` to call NPE validation after Step 4 (Beat Outlines)
3. Add NPE validation as optional step (user can skip if desired)
4. Generate NPE pre-validation report in SA2 output folder

**Updated SA2 Workflow (Stage 5, Step 4):**

```markdown
### Step 4: Beat Outlines / Structural Development

[Existing content...]

Once approved, proceed to **NPE Pre-Validation** (optional).

---

### Step 4.5: NPE Pre-Validation (Optional)

**CRITICAL: This step is optional but recommended for BQ-Studio integration.**

**Execute NPE Pre-Validation:**

1. Detect genre pack:
   - If BQ-Studio genre pack exists for this genre, load NPE rules
   - Otherwise, use baseline NPE rules

2. Run NPE validation script:
   ```bash
   python3 scripts/validate_npe_planning.py \
     --beat-outline outputs/book_1_beat_outline.md \
     --genre-pack ../genre-packs/[genre]/ \
     --output outputs/book_1_npe_pre_validation.md
   ```

3. Review NPE report:
   - **90-100%:** Excellent, proceed to Step 5
   - **80-89%:** Good, minor issues noted
   - **70-79%:** Review violations, consider revisions
   - **<70%:** Significant issues, revise beat outline

4. Ask user:
   "NPE Pre-Validation Score: [score]%

   [List key violations if any]

   Type 'approved' to proceed to dossier creation, or 'revise' to adjust beat outline."

**Wait for user response.**

If revisions needed, return to Step 4 (beat outline development).

Once approved, proceed to Step 5.
```

**Deliverables:**
- ✅ `series-architect-2/scripts/validate_npe_planning.py`
- ✅ Updated SA2 `SKILL.md` with NPE pre-validation step
- ✅ Tested NPE pre-validation with existing beat outlines

**Success Criteria:**
- NPE pre-validation detects common violations in beat outlines
- Report provides actionable recommendations
- SA2 users can fix NPE issues before detailed planning

---

## Phase 6: Unified Workflow Documentation

**Objective:** Create comprehensive documentation for the integrated system

### Task 6.1: Create Unified Workflow Guide

**File:** `.claude/docs/UNIFIED_PLANNING_WORKFLOW.md`

**Content:**
```markdown
# Unified Planning → Execution Workflow

## Overview

BQ-Studio integrates **Series Architect 2** (planning) with the **AI Agent Writing Team** (execution) for a seamless book series production pipeline.

## Workflow Stages

### Stage 1: High-Level Planning (Series Architect 2)

**Tool:** Series Architect 2 skill
**Output:** Series framework, book dossiers, chapter outlines
**Duration:** 1-5 hours per book (depending on mode)

**Invoke:**
"I want to plan a [N]-book [genre] series using Series Architect 2 in [Express/Comprehensive] mode."

**SA2 Stages:**
1. Intake & Assessment
2. Research Phase
3. Series Framework
4. Story Dossier Selection
5. Book-Level Development (with NPE pre-validation)
6. Output Generation

**Output Location:** `series-architect-2/outputs/[project-name]/`

---

### Stage 2: Import to MCP Servers (Bridge)

**Tool:** import-sa2-to-mcp skill
**Output:** Planning data in MCP servers
**Duration:** 5-10 minutes

**Invoke:**
"Import my Series Architect 2 planning from [path] to MCP servers."

**What Gets Imported:**
- Series metadata → series-planning-server
- Book structure & beats → book-planning-server
- Character profiles & arcs → character-planning-server
- World rules → series-planning-server

**Validation:**
After import, verify:
- All books imported (count matches SA2)
- All characters imported
- Series relationships linked correctly

---

### Stage 3: Chapter Planning (Writing Team)

**Tool:** chapter-planning skill
**Agents:** Miranda (coordinator), relevant specialists
**Output:** Detailed scene-by-scene chapter outlines
**Duration:** 30-60 minutes per chapter

**Invoke:**
"Begin chapter planning for Book 1, Chapter 1."

**Process:**
1. Skill loads chapter outline from MCP (imported from SA2)
2. Expands beats into detailed scenes
3. Tracks character knowledge at each scene
4. Validates continuity against world rules
5. Stores chapter plan in chapter-planning-server

---

### Stage 4: Scene Writing (Writing Team)

**Tool:** scene-writing skill
**Agents:** Bailey (first drafter), Finn (style), Tessa (continuity)
**Output:** Prose scenes with NPE validation
**Duration:** 1-3 hours per scene

**Invoke:**
"Write Scene 1 of Chapter 1, Book 1."

**Process:**
1. Bailey loads scene outline from chapter-planning-server
2. Bailey drafts prose following genre pack style guides
3. Bailey self-validates against NPE rules
4. Tessa checks continuity (character knowledge, world rules)
5. Finn polishes prose for genre voice
6. Miranda validates NPE compliance (90%+ threshold)
7. Scene stored in scene-server

---

### Stage 5: Review & QA (Writing Team)

**Tool:** review-qa skill
**Agents:** Tessa (continuity lead), Edna (pacing), Miranda (final approval)
**Output:** Quality reports, revision recommendations
**Duration:** 30-60 minutes per chapter

**Invoke:**
"Review Chapter 1 for continuity and quality."

**Process:**
1. Tessa validates continuity (character knowledge is #1 priority)
2. Edna analyzes pacing against NPE rules
3. Validate against genre pack validation rules
4. Generate quality report with NPE scorecard
5. Miranda gives final approval or requests revisions

---

## Complete Series Workflow Example

**Example: 3-Book Paranormal Romance Series**

**Phase 1: Planning (Series Architect 2)**
- Invoke SA2 in Express mode
- Define series (3 books, 20 chapters each, heat level 4)
- Research phase (use SA2 romantasy templates)
- Series framework (vampire world-building, overarching arc)
- Develop Book 1 with Romantasy 20 Beats
- Generate chapter outlines for Book 1
- Output: `series-architect-2/outputs/vampire-series/`

**Phase 2: Import to MCP**
- Invoke import-sa2-to-mcp skill
- Provide path: `series-architect-2/outputs/vampire-series/`
- Review import summary
- Approve import
- Verify: Series, 3 books, characters all in MCP

**Phase 3: Chapter Planning**
- Invoke chapter-planning skill for Book 1, Chapter 1
- Writing Team expands SA2 chapter outline into detailed scenes
- Character knowledge tracked at each scene
- Chapter plan stored in MCP

**Phase 4: Scene Writing**
- Invoke scene-writing skill for each scene
- Bailey drafts prose
- Tessa validates continuity
- Finn polishes style
- Miranda checks NPE compliance
- Scenes stored in MCP

**Phase 5: Review & QA**
- Invoke review-qa skill after each chapter
- Tessa checks continuity (especially character knowledge)
- Edna analyzes pacing
- Generate quality report
- Miranda approves or requests revisions

**Repeat for all 20 chapters, then Books 2 and 3**

---

## Genre Pack Integration

**Genre Detection:**
- SA2 records genre in `intake_form.md`
- Import skill stores genre in series-planning-server
- Writing Team skills auto-load appropriate genre pack

**Available Genre Packs:**
- Baseline (universal fallback)
- Urban Fantasy Police Procedural
- Romance
- Romantasy
- Dark Romance

**Custom Genre Packs:**
- Create using template in `.claude/genre-packs/_TEMPLATE_/`
- Place in `.claude/genre-packs/[your-genre]/`
- Skills will auto-detect and load

---

## NPE Validation Workflow

**Pre-Validation (SA2 Planning):**
- NPE pre-validation runs after beat outline creation
- Detects potential violations before writing
- Generates recommendations

**During-Writing Validation (Bailey):**
- Bailey self-validates prose against NPE rules
- Adjusts draft to meet NPE standards before presenting

**Post-Writing Validation (Miranda):**
- Miranda runs full NPE compliance scorecard
- 90%+ = approve
- 80-89% = minor revisions
- <80% = major revisions or block
- Scorecard displayed to user

---

## MCP Server Data Flow

```
Series Architect 2 (planning)
    ↓ [export markdown files]
series-architect-2/outputs/
    ↓ [import-sa2-to-mcp skill]
MCP Servers:
  - series-planning-server (series, world rules)
  - book-planning-server (books, acts, beats)
  - character-planning-server (characters, arcs)
    ↓ [chapter-planning skill]
  - chapter-planning-server (chapter outlines, scenes)
    ↓ [scene-writing skill]
  - scene-server (prose, status)
  - core-continuity-server (world rules, validation)
    ↓ [review-qa skill]
  - review-server (issues, violations)
  - reporting-server (quality metrics)
```

---

## Tips for Best Results

**Planning Phase:**
✅ Use SA2 Express mode for speed, Comprehensive for depth
✅ Enable NPE pre-validation in SA2 (catch issues early)
✅ Choose appropriate beat sheet for your genre
✅ Provide detailed character profiles (ghost, misbelief, need, want, arc)

**Import Phase:**
✅ Verify SA2 output structure before importing
✅ Review import summary carefully
✅ Check that all books and characters imported

**Execution Phase:**
✅ Let agents coordinate (invoke Miranda to manage team)
✅ Trust NPE validation (90%+ threshold is well-calibrated)
✅ Use genre pack style guides for consistent voice
✅ Review character knowledge tracking (Tessa's #1 priority)

**Quality Assurance:**
✅ Run review-qa skill after each chapter
✅ Address continuity issues immediately (don't compound)
✅ Pay attention to NPE scorecard categories
✅ Use Edna for pacing analysis

---

## Troubleshooting

**SA2 planning data doesn't import:**
- Check SA2 output structure (intake_form.md, series_framework.md present?)
- Verify MCP servers running (Docker container active?)
- Review error message for specific missing file

**Genre pack not loading:**
- Check genre matches series metadata in MCP
- Verify genre pack exists: `.claude/genre-packs/[genre]/`
- Fallback to baseline pack if genre-specific pack missing

**NPE score unexpectedly low:**
- Review specific violations in scorecard
- Check which category is lowest
- Consult `.claude/docs/NPE_GUIDE.md` for violation examples
- Ask agent to explain specific violation

**Character knowledge errors:**
- Use Tessa (continuity specialist) to validate
- Review character knowledge tracking in chapter-planning-server
- Check what character knows at specific scene
- Update character knowledge if revelation occurred

---

## Next Steps After This Guide

1. **Plan your first series:** Invoke Series Architect 2
2. **Import planning data:** Use import-sa2-to-mcp skill
3. **Begin chapter planning:** Invoke chapter-planning skill
4. **Start writing:** Invoke scene-writing skill with Bailey
5. **Review and iterate:** Use review-qa skill for quality assurance

**Questions?**
- Consult `.claude/docs/architecture.md` for system overview
- Read `.claude/docs/NPE_GUIDE.md` for NPE details
- Review `.claude/docs/GENRE_PACK_LOADING.md` for genre pack architecture
- Check `.claude/WRITING_TEAM_INTEGRATION_GUIDE.md` for agent coordination

Happy writing!
```

**Deliverables:**
- ✅ `.claude/docs/UNIFIED_PLANNING_WORKFLOW.md`
- ✅ Updated README.md with link to unified workflow
- ✅ Updated architecture.md with integration diagram

**Success Criteria:**
- Users understand complete planning → execution workflow
- Clear handoff points between systems
- Troubleshooting guidance for common issues

---

## Phase 7: Testing & Validation

**Objective:** Test complete integration with real series planning

### Task 7.1: End-to-End Integration Test

**Test Case:** Create a new 3-book romance series using complete integrated workflow

**Steps:**
1. **Plan with SA2:**
   - Invoke Series Architect 2 in Express mode
   - Plan 3-book contemporary romance series
   - 15 chapters per book, heat level 3
   - Use Romance Beat Sheet
   - Generate complete output (series framework, book dossiers, chapter outlines)

2. **Import to MCP:**
   - Invoke import-sa2-to-mcp skill
   - Provide path to SA2 output
   - Verify import summary
   - Approve import
   - Validate: 3 books, characters, series data all in MCP

3. **Chapter Planning:**
   - Invoke chapter-planning skill for Book 1, Chapter 1
   - Verify genre pack loaded (romance pack with SA2 beat sheet)
   - Verify chapter outline expanded from SA2 data
   - Verify character knowledge tracking initialized

4. **Scene Writing:**
   - Invoke scene-writing skill for Chapter 1, Scene 1
   - Verify Bailey uses romance genre pack style guide
   - Verify NPE self-validation occurs
   - Verify Tessa checks continuity
   - Verify prose stored in scene-server

5. **Review & QA:**
   - Invoke review-qa skill for Chapter 1
   - Verify NPE scorecard generated
   - Verify continuity validation (character knowledge)
   - Verify pacing analysis
   - Verify Miranda approval/rejection

**Success Criteria:**
- ✅ Complete workflow executes without errors
- ✅ Data flows correctly: SA2 → MCP → Writing Team
- ✅ Genre pack (romance) loaded and used
- ✅ NPE validation works at all stages
- ✅ Character knowledge tracked correctly
- ✅ Final prose meets quality standards (NPE 90%+)

**Deliverables:**
- ✅ Test series created and validated
- ✅ Test report documenting results
- ✅ Any bugs identified and fixed

---

## Implementation Timeline

### Week 1: Foundation
- **Day 1-2:** Phase 1 - Create NPE documentation
- **Day 3-4:** Phase 2 Task 2.1 - Create import-sa2-to-mcp skill
- **Day 5:** Phase 3 Task 3.1 - Create baseline genre pack

### Week 2: Genre Pack Implementation
- **Day 1-2:** Phase 3 Task 3.2 - Update skills for genre pack discovery
- **Day 3:** Phase 4 Task 4.1 - Create romance genre pack
- **Day 4:** Phase 4 Task 4.2 - Create romantasy genre pack
- **Day 5:** Phase 4 Task 4.3 - Create dark romance genre pack

### Week 3: NPE Integration & Documentation
- **Day 1-2:** Phase 5 Task 5.1 - NPE pre-validation in SA2
- **Day 3:** Phase 6 Task 6.1 - Unified workflow documentation
- **Day 4-5:** Phase 7 Task 7.1 - End-to-end testing

### Total Estimated Time: 15 days (3 weeks)

---

## Success Metrics

### Functional Success
- ✅ SA2 planning data imports to MCP with 100% accuracy
- ✅ Genre pack dynamic loading works for all 5 skills
- ✅ NPE pre-validation in SA2 catches violations before writing
- ✅ Complete workflow executes from planning → execution → QA

### Quality Success
- ✅ NPE scores improve 10-15% with pre-validation (catch issues early)
- ✅ Character knowledge errors reduced by 50% (better planning data)
- ✅ Time savings: 30-40% reduction in revision cycles

### Extensibility Success
- ✅ New genre packs can be created using template
- ✅ SA2 beat sheets seamlessly integrate as genre pack resources
- ✅ System supports any genre with baseline fallback

---

## Deliverables Summary

### Documentation (6 files)
1. `.claude/docs/NPE_GUIDE.md` - NPE comprehensive guide
2. `.claude/docs/UNIFIED_PLANNING_WORKFLOW.md` - Integrated workflow guide
3. Updated `.claude/docs/architecture.md` - Integration diagram
4. Updated `README.md` - Links to new documentation
5. Updated agent files (9) - NPE guide references
6. Updated skill files (5) - NPE guide references

### Skills (1 new skill)
7. `.claude/skills/import-sa2-to-mcp-skill.md` - SA2 import bridge

### Genre Packs (4 new packs)
8. `.claude/genre-packs/baseline/` - Universal fallback pack
9. `.claude/genre-packs/romance/` - Romance pack (SA2 beat sheets)
10. `.claude/genre-packs/romantasy/` - Romantasy pack (SA2 beat sheets)
11. `.claude/genre-packs/dark-romance/` - Dark romance pack (SA2 beat sheets)

### Scripts (1 new script)
12. `series-architect-2/scripts/validate_npe_planning.py` - NPE pre-validation

### Updated Files (6 existing files)
13. `.claude/skills/series-planning-skill.md` - Genre pack dynamic loading
14. `.claude/skills/book-planning-skill.md` - Genre pack dynamic loading
15. `.claude/skills/chapter-planning-skill.md` - Genre pack dynamic loading
16. `.claude/skills/scene-writing-skill.md` - Genre pack dynamic loading
17. `.claude/skills/review-qa-skill.md` - Genre pack dynamic loading
18. `series-architect-2/SKILL.md` - NPE pre-validation step added

### Test Artifacts (3 items)
19. Test series (3-book romance series)
20. Test report (end-to-end integration validation)
21. Bug fixes (any issues identified during testing)

### Total: 21 deliverables

---

## Risk Assessment & Mitigation

### Risk 1: SA2 Output Format Changes
**Probability:** Low
**Impact:** High (import skill breaks)
**Mitigation:**
- Version pin SA2 output format
- Add format validation in import skill
- Create migration scripts for format updates

### Risk 2: MCP Server API Changes
**Probability:** Medium
**Impact:** High (all skills break)
**Mitigation:**
- Document MCP API version used
- Add API version checking in skills
- Create MCP API abstraction layer

### Risk 3: Genre Pack Complexity
**Probability:** Medium
**Impact:** Medium (user confusion)
**Mitigation:**
- Comprehensive documentation (GENRE_PACK_LOADING.md already exists)
- Template with examples
- Validation scripts to check pack structure

### Risk 4: NPE Pre-Validation False Positives
**Probability:** Medium
**Impact:** Low (user can skip)
**Mitigation:**
- Make NPE pre-validation optional
- Tune validation thresholds based on testing
- Provide clear explanations for violations

### Risk 5: Performance (Large Series)
**Probability:** Low
**Impact:** Medium (slow import/loading)
**Mitigation:**
- Implement progress tracking for import
- Add caching for genre pack resources
- Optimize MCP queries (batch operations)

---

## Dependencies

### External Systems
- ✅ Series Architect 2 (v2.1) - Already present
- ✅ MCP Servers (9 servers) - Already running in Docker
- ✅ Genre Pack Architecture - Already documented

### Required Skills/Knowledge
- Python 3.7+ (for NPE validation script)
- JSON manipulation (for MCP data transformation)
- Markdown parsing (for SA2 file parsing)
- MCP API understanding (query/create/update operations)

### File Dependencies
- SA2 output files (intake_form.md, series_framework.md, book dossiers, act files)
- MCP server endpoints and schemas
- Genre pack manifest format
- NPE physics JSON schema

---

## Next Steps After Plan Approval

1. **Review this plan:** User approves or requests modifications
2. **Begin Phase 1:** Create NPE documentation
3. **Iterate through phases:** Complete each phase with user validation
4. **Test integration:** End-to-end testing with real series
5. **Deploy and document:** Finalize documentation and announce integration

---

## Appendix A: File Structure After Integration

```
BQ-Studio/
├── .claude/
│   ├── agents/                          # 9 agents (updated with NPE guide refs)
│   ├── skills/                          # 6 skills (5 updated + 1 new)
│   │   ├── series-planning-skill.md     # Updated: Genre pack discovery
│   │   ├── book-planning-skill.md       # Updated: Genre pack discovery
│   │   ├── chapter-planning-skill.md    # Updated: Genre pack discovery
│   │   ├── scene-writing-skill.md       # Updated: Genre pack discovery
│   │   ├── review-qa-skill.md           # Updated: Genre pack discovery
│   │   └── import-sa2-to-mcp-skill.md   # NEW: SA2 import bridge
│   ├── genre-packs/
│   │   ├── baseline/                    # NEW: Universal fallback
│   │   ├── romance/                     # NEW: SA2 romance beat sheets
│   │   ├── romantasy/                   # NEW: SA2 romantasy beat sheets
│   │   ├── dark-romance/                # NEW: SA2 dark romance beat sheets
│   │   └── urban-fantasy-police-procedural/  # Existing
│   ├── docs/
│   │   ├── architecture.md              # Updated: Integration diagram
│   │   ├── NPE_GUIDE.md                 # NEW: NPE documentation
│   │   ├── UNIFIED_PLANNING_WORKFLOW.md # NEW: Workflow guide
│   │   └── GENRE_PACK_LOADING.md        # Existing (2039 lines)
│   └── mcp.json                         # Existing (9 MCP servers)
├── series-architect-2/
│   ├── SKILL.md                         # Updated: NPE pre-validation step
│   └── scripts/
│       └── validate_npe_planning.py     # NEW: NPE pre-validation
└── README.md                            # Updated: Links to new docs
```

---

## Appendix B: Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  PLANNING PHASE (Series Architect 2)                        │
│  ────────────────────────────────────────────               │
│  1. Intake & Assessment                                     │
│  2. Research Phase                                          │
│  3. Series Framework                                        │
│  4. Story Dossier Selection                                 │
│  5. Book-Level Development                                  │
│     ↓ NPE Pre-Validation (new)                              │
│  6. Output Generation                                       │
│     ↓ Outputs: series_framework.md, book_dossiers, etc.     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  IMPORT PHASE (import-sa2-to-mcp skill)                     │
│  ────────────────────────────────────────────               │
│  1. Parse SA2 markdown files                                │
│  2. Transform to MCP format                                 │
│  3. Ask permission (CREATE operations)                      │
│  4. Import to MCP servers:                                  │
│     • series-planning-server                                │
│     • book-planning-server                                  │
│     • character-planning-server                             │
│  5. Validate import                                         │
│  6. Report success                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  EXECUTION PHASE (Writing Team)                             │
│  ────────────────────────────────────────────               │
│  Chapter Planning (chapter-planning skill)                  │
│     ↓ Genre pack loaded (romance/romantasy/etc.)            │
│  Scene Writing (scene-writing skill + Bailey)               │
│     ↓ NPE self-validation                                   │
│  Continuity Check (Tessa)                                   │
│     ↓ Character knowledge validation                        │
│  Style Polish (Finn)                                        │
│     ↓ Genre pack style guide                                │
│  Final Approval (Miranda)                                   │
│     ↓ NPE compliance scorecard (90%+ threshold)             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  REVIEW PHASE (review-qa skill)                             │
│  ────────────────────────────────────────────               │
│  1. Continuity validation (Tessa)                           │
│  2. Pacing analysis (Edna)                                  │
│  3. Genre pack validation rules                             │
│  4. NPE compliance report                                   │
│  5. Quality metrics (reporting-server)                      │
│  6. Revision recommendations or approval                    │
└─────────────────────────────────────────────────────────────┘
```

---

**End of Integration Plan**

**Status:** Ready for approval
**Next Action:** User reviews and approves plan
**Estimated Completion:** 3 weeks (15 working days)
