# Series Architect 2.1

**A comprehensive AI-assisted workflow for planning book series from ideation to detailed story dossiers.**

[![Version](https://img.shields.io/badge/version-2.1-blue.svg)](SKILL.md)
[![Validation](https://img.shields.io/badge/validation-passing-brightgreen.svg)](#validation)

---

## What is Series Architect?

Series Architect is a structured 6-stage workflow system designed to help authors plan multi-book series (or standalone novels) with comprehensive story structure, character development, and world-building. Perfect for romance, romantasy, fantasy, and other genre fiction.

**Key Features:**
- 📖 **6-Stage Linear Workflow** - From intake to final output
- 🎭 **10 Beat Sheet Frameworks** - Including trauma-informed dark romance structures
- 📝 **15 Production-Ready Templates** - Character, world-building, story dossiers
- 🔍 **140+ Cliché Name Detection** - Avoid overused character/place names
- 🎯 **40+ Universal Fantasy Taxonomy** - Identify emotional reader needs
- ✅ **Automated Validation** - Integrity checking and quality assurance

---

## Quick Start

### 📚 New User? Start Here

**Read this first:** [QUICKSTART.md](QUICKSTART.md) (5-minute overview)

**Then jump in:**
```
"I want to plan a 3-book paranormal romance series in Express mode"
```

### 🚀 Three Ways to Use

**1. Express Mode** (Fastest - 1-2 hours per book)
- Smart defaults and recommendations
- Stage-level approvals
- Optimized for speed

**2. Testing Mode** (Demo - 30 minutes)
- Pre-filled sample projects (A-E)
- Quick walkthrough of full workflow
- Perfect for exploring capabilities

**3. Comprehensive Mode** (Thorough - 3-5 hours per book)
- Detailed questions and exploration
- Micro-approvals at every step
- Deep collaboration

---

## What You'll Get

### Output Structure
```
outputs/
├── memory.json                  # Session state (resumable)
├── intake_form.md              # Project tracker
├── series_framework.md         # Series bible
├── resource_manifest.json      # Available resources
├── names_registry.json         # Name evaluation
├── INDEX.md                    # Navigation
└── book_1_[title]/
    ├── book_1_dossier.md      # Complete story guide
    ├── book_1_act_1.md        # Chapter outlines (Act 1)
    ├── book_1_act_2.md        # Chapter outlines (Act 2)
    ├── book_1_act_3.md        # Chapter outlines (Act 3)
    ├── book_1_act_4.md        # Chapter outlines (Act 4)
    └── book_1_act_5.md        # Chapter outlines (Act 5)
```

### What Gets Planned
- **Series Overview** - Overarching plot, themes, recurring elements
- **Book Structure** - Beat-by-beat narrative arc per book
- **Character Profiles** - Wounds, arcs, desires, relationships
- **World-Building** - Magic systems, politics, geography (if applicable)
- **Chapter Outlines** - Scene-level detail with major events
- **Name Registry** - Evaluated against 140+ cliché patterns
- **Universal Fantasies** - Emotional reader needs mapped to story

---

## Directory Structure

```
series-architect-2.1/
├── README.md                    # This file
├── SKILL.md                     # Complete skill documentation
├── QUICKSTART.md                # 5-minute getting started guide
│
├── beat_sheet_library/          # 10 story structure frameworks
│   ├── three_act_structure.md
│   ├── romance_beat_sheet.md
│   ├── romantasy_20_beats.md
│   ├── A_MutualTrauma_Bonding.md
│   ├── B_Protector_Wounded.md
│   ├── C_Toxic_Coping.md
│   ├── D_PostTrauma_Reentry.md
│   ├── E_Dark_TraumaHybrid.md
│   └── ...
│
├── templates/                   # 15 production-ready templates
│   ├── intake_form_template.md
│   ├── character_architecture_template.md
│   ├── worldbuilding_template.md
│   ├── book_dossier_template.md
│   ├── story_dossier_worksheet_truby_style.md
│   └── ...
│
├── references/                  # Guides and protocols
│   ├── beat_sheets.md          # Beat sheet selection guide
│   ├── universal_fantasies.md  # Emotional fantasy taxonomy
│   ├── names/
│   │   ├── protocol.md         # Naming protocol
│   │   └── cliche_morphemes.txt # 140+ overused patterns
│   └── workflows/              # Stage-specific workflows
│       ├── workflow_principles.md
│       ├── stage_1_intake.md
│       ├── stage_2_research.md
│       ├── stage_3_framework.md
│       ├── stage_4_dossier.md
│       ├── stage_5_development.md
│       ├── stage_6_output.md
│       └── ...
│
├── intake_samples/              # 5 curated demo projects (A-E)
│   ├── README.md               # Sample descriptions
│   └── intake_*.md             # Pre-filled intake forms
│
├── schemas/                     # JSON schemas
│   └── assistant-persona.template.json
│
├── scripts/                     # Utility scripts
│   ├── validate_skill_integrity.py    # Automated validation
│   ├── build_resource_manifest.py     # Resource discovery
│   ├── evaluate_names.py              # Name cliché detection
│   ├── generate_index.py              # Navigation generator
│   └── ...
│
└── outputs/                     # Generated files (gitignored)
    ├── resource_manifest.json  # Auto-generated resource list
    └── [your project files]    # Created during sessions
```

---

## The 6-Stage Workflow

### Stage 1: Intake & Assessment
Gather baseline information: genre, number of books, chapters per book, heat/violence levels, existing materials.

### Stage 2: Research Phase
Choose research approach: use your own materials, web research for market trends, or baseline templates.

### Stage 3: Series Framework
Develop series-wide elements: world-building, overarching plot, recurring characters (skipped for standalone novels).

### Stage 4: Story Dossier Selection
Choose or customize a story dossier template (Truby-style, genre-neutral, custom).

### Stage 5: Book-Level Development
The main event! For each book:
1. Select beat sheet framework
2. Develop character profiles
3. Build world-building (if needed)
4. Create beat-by-beat outline
5. Generate complete book dossier
6. Expand to chapter summaries

### Stage 6: Output Generation
Package everything: markdown files, optional docx export, navigation index, ZIP bundle.

---

## Available Resources

### 10 Beat Sheet Frameworks
- **Three-Act Structure** - Universal, all genres
- **Romance Beat Sheet** - Contemporary romance (heat 1-3)
- **Romantasy 20 Beats** - Fantasy romance (heat 2-4)
- **Romantasy - The Beats** - Epic romantasy (heat 3-5)
- **A-E Trauma-Informed** - Dark romance with consent protocols
  - A: Mutual Trauma Bonding
  - B: Protector × Wounded
  - C: Toxic Coping → Healing
  - D: Post-Trauma Re-Entry
  - E: Dark Trauma Hybrid
- **Dark Romancing The Beats** - Villain/antihero romance

[Full selection guide](references/beat_sheets.md)

### 15 Production Templates
- Intake forms (full & lean)
- Character architecture & profiles
- Worldbuilding guide
- Book dossiers (Truby-style, genre-neutral)
- Scene cards & chapter summaries
- Series bible & overview
- Subplot tracking
- Research output
- And more...

### 5 Sample Projects (Testing Mode)
Pre-filled intake forms for quick demos:
- **Sample A:** Mutual Trauma Bonding Romance
- **Sample B:** Protector × Wounded Romance
- **Sample C:** Toxic Coping → Healing Arc
- **Sample D:** Post-Trauma Re-Entry Romance
- **Sample E:** Dark Romance Trauma Hybrid

[See intake_samples/README.md](intake_samples/README.md)

---

## Validation

### Check Skill Integrity
```bash
python3 scripts/validate_skill_integrity.py
```

**Current Status:**
- ✅ 0 errors (fully functional)
- ⚠️ 35 warnings (expected/acceptable)
- ✅ 99+ successful checks

### Generate Resource Manifest
```bash
python3 scripts/build_resource_manifest.py
```

Creates `outputs/resource_manifest.json` with all available templates and beat sheets.

---

## Requirements

- Python 3.7+ (for utility scripts)
- AI assistant with file read/write capabilities
- Text editor for markdown files

**Optional:**
- Git (for version control)
- Pandoc (for docx conversion)

---

## Usage Examples

### Planning a 6-Book Paranormal Romance Series
```
"I want to plan a 6-book vampire romance series in Express mode.
- 20 chapters per book, ~75K words each
- Heat level 4, violence level 2
- I have detailed world-building notes I'll provide
Let's start."
```

### Quick Demo with Sample Project
```
"Start Testing mode. Show me sample B (Protector × Wounded)."
```

### Comprehensive Planning for Complex Fantasy
```
"I want to plan a 4-book epic fantasy romance series using Comprehensive mode.
I need deep world-building with magic systems and political intrigue.
Heat level 3, violence level 4."
```

---

## Key Features in Detail

### Trauma-Informed Beat Sheets
5 specialized frameworks (A-E) for dark romance with:
- Consent checkpoints at every beat
- Grounding techniques and safety protocols
- Trigger warning integration
- Aftercare and processing scenes
- Non-linear healing progression

### Cliché Name Detection
Automatically flag 140+ overused name patterns:
- Morphemes: -aeron, -lyn, -aria, raven-, shadow-
- Color terms: crimson, obsidian, noir
- Edgy terms: blade, skull, doom
- Modern trends: 2020s suffixes and patterns

### Universal Fantasy Taxonomy
Map 40+ emotional desires across 7 categories:
- Recognition & Validation
- Transformation & Growth
- Power & Agency
- Connection & Intimacy
- Adventure & Escape
- Justice & Vindication
- Safety & Security

---

## Session Management

### Resume Capability
Every session creates `outputs/memory.json` tracking:
- Current stage and progress
- All decisions made
- Files generated
- Next steps for resumption

**To resume:**
```
"I'm resuming my series planning. Here's my memory.json..."
[Provide the file]
```

### Three-Document System
- **intake_form.md** - Workflow tracking (THAT decisions were made, WHEN)
- **series_framework.md** - Creative content (WHAT was decided, WHY)
- **memory.json** - Session state (stage status, resume instructions)

---

## Advanced Features

### Market-Driven Shortcut
AI detects "write to market" signals and provides:
- Synthesized optimal packages vs. granular questions
- Research-backed recommendations
- Fast-track through decision points

### Cross-Document Consistency Validation
Automatic checks before Stage 5 completion:
- Beat alignment with character arcs
- World rules vs. plot obstacles
- Series continuity across books

### Names & Toponyms Protocol
Comprehensive naming system:
- Genre-agnostic naming palettes
- Pronunciation and readability checks
- Cultural sensitivity guidelines
- Distribution balance (varied initials, syllable patterns)

---

## Documentation

- **[SKILL.md](SKILL.md)** - Complete skill documentation (536 lines)
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute getting started guide
- **[references/beat_sheets.md](references/beat_sheets.md)** - Beat sheet selection guide
- **[references/universal_fantasies.md](references/universal_fantasies.md)** - Emotional fantasy taxonomy
- **[references/workflows/](references/workflows/)** - Stage-by-stage instructions
- **[intake_samples/README.md](intake_samples/README.md)** - Sample project descriptions

---

## Contributing

This is a skill/tool for AI assistants. If you'd like to:
- Report issues or bugs
- Suggest improvements
- Contribute templates or beat sheets
- Share feedback on the workflow

Please provide feedback through your preferred channels.

---

## Version History

### Version 2.1 (2025-11-10)
**Major Improvements:**
- Added QUICKSTART.md for easier onboarding
- Added beat_sheets.md with comprehensive framework guidance
- Enhanced cliche_morphemes.txt (32 → 140+ patterns)
- Added validate_skill_integrity.py for automated validation
- Fixed build_resource_manifest.py path issues
- Generated initial resource_manifest.json
- Improved documentation and cross-references

**Quality Metrics:**
- Fitness for Purpose: 4.5/5 (was 4/5)
- Fitness for Use: 4/5 (was 3/5)
- Complexity: 2.5/5 (was 2/5)

### Version 2.0
- Initial release with 6-stage workflow
- 15 templates, 10 beat sheets
- Express/Comprehensive/Testing modes
- Names & toponyms protocol
- Universal fantasies framework

---

## License

[Specify your license here]

---

## Support

For questions, issues, or guidance:
1. Read [QUICKSTART.md](QUICKSTART.md) for basics
2. Consult [SKILL.md](SKILL.md) for detailed documentation
3. Run validation: `python3 scripts/validate_skill_integrity.py`
4. Check that resource manifest exists: `python3 scripts/build_resource_manifest.py`

---

**Last Updated:** 2025-11-10
**Version:** 2.1
**Status:** ✅ Production Ready
