---
name: series-architect
description: Plan and develop book series from ideation to fully fleshed-out story dossiers. Use when the user wants to create a multi-book series, plan individual novels with comprehensive story structure, or develop detailed narrative frameworks. Triggers include phrases like "plan a new series," "develop a book series," "create story dossiers," or requests for structured narrative planning.
metadata:
  version: "2.1"
---

# Series Architect

Progressive workflow for developing book series from initial intake to final story dossier. The workflow proceeds linearly through all stages with decision points determining HOW each stage is executed.

**📖 New User? Start with [QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes with clear examples and walkthrough.

---

## Modes & Defaults

### Session Modes
- Express: Prioritize speed and token efficiency. Use defaults, batch approvals at stage-level, defer deep dives. Skip optional diagnostics unless requested.
- Comprehensive: Full questions, micro-approvals, and exhaustive diagnostics. No shortcuts.
- Testing: Demo-focused flow using sample intake forms. Skips long questionnaires, defaults to Express behaviors and light research budgets. Offers curated sample intakes (A–E) to showcase the system without user prep.

Default: Express unless user explicitly asks for deep exploration or the project requires higher certainty (research uncertainty > threshold).

### Output Defaults
- Canonical book output: Single compiled dossier per book ("complete_story_guide").
- Optional split: `split_by_acts: true` generates per-act outline files.
- Packaging: Stage 6 offers multi-file markdown and optional ZIP bundle; Docx is optional on request.

### Outline Size Defaults
- Chapter outline length caps (per chapter, per act file):
  - brief: 80–120 words; 5–8 major events
  - normal (default): 120–180 words; 6–10 major events
  - detailed: 200–260 words; 8–12 major events
- Apply to Act files: Acts 1–5 each generated as separate documents.

### Communication Verbosity
- brief | normal | detailed. Default: normal. Apply to explanations and summaries.

---

## Session Start

**When starting a new session or resuming previous work:**

1. **Load** `schemas/assistant-persona.template.json` - Persona and interaction style
2. **Load** `references/workflows/workflow_principles.md` - Core workflow logic
3. **Load** `references/workflows/document_separation.md` - Three-document system
4. **Load** `references/workflows/session_management.md` - Memory.json usage
5. **Initialize memory**: If `outputs/memory.json` does not exist, create it with session metadata and stage state (see Memory Initialization below).
6. **Load resource manifest**: Check for `outputs/resource_manifest.json` for available templates and beat sheets. If absent, scan directories or generate using `scripts/build_resource_manifest.py`.

**If resuming from previous session:**
- User will provide `outputs/memory.json` and/or `outputs/intake_form.md`
- Follow resume instructions in session_management.md

### Memory Initialization (Required)
- On first interaction (session start), generate `outputs/memory.json` with at least:
  - `session_mode`: "express" | "comprehensive" | "testing"
  - `flags`: `{ testing: <bool> }`
  - `stages`: `{ completed: [], current: 1 }`
  - `parameters`: `{ books, chapters_per_book, words_per_chapter, genre, heat, violence }` (fill as known)
  - `changelog`: `[ { ts, event: "session_start", details } ]`
- Update `memory.json` on every decision approval, stage transition, and significant file generation.
- Persist a `session_end` entry on completion.

**If Testing Mode is requested (demo):**
1. Offer curated intake samples from `intake_samples/` directory mapped to beat sheets A–E:
   - A: Mutual Trauma Bonding (beat_sheet_library/A_MutualTrauma_Bonding.md)
   - B: Protector × Wounded (beat_sheet_library/B_Protector_Wounded.md)
   - C: Toxic Coping → Healing (beat_sheet_library/C_Toxic_Coping.md)
   - D: Post‑Trauma Re‑Entry (beat_sheet_library/D_PostTrauma_Reentry.md)
   - E: Dark Romance Trauma Hybrid (beat_sheet_library/E_Dark_TraumaHybrid.md)
2. On selection, copy the chosen sample to `outputs/intake_form.md` and set `testing: true` in memory.
3. Proceed with Express defaults and light research (time-boxed). Use stage-level approvals.
4. Run the Stage Transition Checklist normally; the pre-filled intake counts as Stage 1 completion.

---

## Core Workflow Protocols

**Before executing workflow, load these protocols:**

### Essential Protocols
- **Workflow Principles** (`references/workflows/workflow_principles.md`)
  - Linear progression (Stage 1 → 6)
  - Resume logic
  - Stage Transition Protocol

- **Document Separation** (`references/workflows/document_separation.md`)
  - Intake form = workflow tracking only
  - Series framework = creative content only
  - Memory.json = session state only

- **Recommendation Approval Protocol** (`references/workflows/recommendation_protocol.md`)
  - Single-word "approved" confirmations
  - User response handling
  - Decision audit trail
  - Stage-level approvals: Allow "Approve recommended path for this stage" to minimize micro-confirmations. Micro-approvals resume if any item is flagged or user requests granular review.

- **Session Management** (`references/workflows/session_management.md`)
  - Memory.json structure and updates
  - Changelog format
  - Compaction guidelines
  - Initialization rules: create `outputs/memory.json` at session start; update throughout the session (decisions, transitions, outputs).

- **Names & Toponyms** (`references/names/protocol.md`)
  - Genre-agnostic naming brief and palettes
  - Cliché morpheme guardrails (140+ overused patterns in `references/names/cliche_morphemes.txt`)
  - Distribution checks and evaluation scoring
  - Registry + evaluation before Stage 3 and Stage 5 approvals

- **Stage Transition Checklist** (`references/workflows/stage_transition_checklist.md`)
  - Concrete per-stage completion checks (files present, sections filled, consistency assertions)
  - Blocks forward progress until all checks pass or are explicitly waived by user

### Optimization Protocols
- **Resource Discovery** (`references/workflows/resource_discovery.md`)
  - Always check existing resources first
  - Template/beat sheet/schema discovery
  - When to propose new resources
  - Caching: Build and reuse `outputs/resource_manifest.json` with discovered templates and beat sheets to avoid repeated scans.
  - Generate manifest using: `python3 scripts/build_resource_manifest.py`

- **Market-Driven Shortcut** (`references/workflows/market_driven_shortcut.md`)
  - Detect user signals (write to market vs creative exploration)
  - Synthesize optimal packages for market-driven users
  - Skip granular questions when appropriate

- **Consistency Validation** (`references/workflows/consistency_validation.md`)
  - Cross-document assertions (beats vs arcs vs world rules)
  - Auto-run before closing Stage 5; attach discrepancies to the stage review

---

## Workflow Stages

### Stage 1: Intake & Assessment
**Load:** `references/workflows/stage_1_intake.md`

**Summary:**
- Generate intake form, series framework stub, memory.json
- Gather baseline parameters (books, chapters, genre, heat/violence)
- Identify existing materials
- Execute Stage Transition Protocol before advancing

---

### Stage 2: Research Phase
**Load:** `references/workflows/stage_2_research.md`

**Summary:**
- Decision Point 2A: Choose research source (user/web/baseline/hybrid)
- Execute selected research approach
- Present findings for approval (Recommendation Approval Protocol)
- Execute Stage Transition Protocol before advancing

**Time-boxing & Early Exit:**
- Default time budgets (light/medium/deep). In Express mode, use light by default.
- Early exit when confidence ≥ threshold; escalate to user if confidence < threshold after budget is spent.

**Testing Mode Note:** Default to baseline or hybrid research with a minimal (light) budget unless the user asks otherwise.

---

### Stage 3: Series Framework
**Load:** `references/workflows/stage_3_framework.md`

**Summary:**
- **SKIP for standalone novels**
- **Check for market-driven signals** (load market_driven_shortcut.md if detected)
- Decision Point 3A: Planning approach (full/minimal/hybrid)
- Develop series bible or minimal scaffolding
- Present framework for approval (Recommendation Approval Protocol)
- Execute Stage Transition Protocol before advancing

**Sequence Guardrail:**
- If character/world docs were created before framework, run Reconcile Step:
  - Extract deltas from characters/world docs
  - Update or annotate the framework with impacted elements
  - Log reconciliation in memory.json and attach a reconcile report to outputs

**Names & Toponyms Check:**
- Initialize/update `outputs/names_registry.json` and run evaluation per `references/names/protocol.md`.
- Use `references/names/cliche_morphemes.txt` (140+ overused patterns) to flag problematic names
- Attach the evaluation report to the review; adjust names failing thresholds before approval.

---

### Stage 4: Story Dossier Selection
**Load:** `references/workflows/stage_4_dossier.md`

**Summary:**
- Decision Point 4A: Dossier source (user/library/custom)
- Execute Resource Discovery Protocol (check templates/ directory)
- Select or build dossier template
- Present structure for approval (Recommendation Approval Protocol)
- Execute Stage Transition Protocol before advancing

**Caching:**
- Use `outputs/resource_manifest.json` for available templates/beat sheets; refresh only when sources change.
- Available templates listed in manifest: 15 production-ready templates

---

### Stage 5: Book-Level Development
**Load:** `references/workflows/stage_5_development.md`

**Summary:**
- Decision Point 5A: Development approach (sequential/parallel/single)
- For each book:
  - Step 1: Beat sheet selection (Resource Discovery Protocol + `references/beat_sheets.md` guidance)
  - Step 2: Apply dossier template
  - Step 3: Develop story components
  - Step 4: Generate book dossier
  - Step 5: Generate chapter breakdowns for each act as separate documents (Acts 1–5)
    - Enforce Outline Size Defaults (cap per chapter outline; cap major events count)
  - Decision Point 5B: Book review checkpoint
- Execute Stage Transition Protocol before advancing

**Beat Sheet Selection:**
- Load `references/beat_sheets.md` for comprehensive framework guidance
- 10 available frameworks: Three-Act, Romance, Romantasy, Dark Romance variants (A-E), etc.
- Decision tree helps match genre/heat level/themes to appropriate structure

**Output Policy:**
- Generate canonical compiled dossier (`complete_story_guide`); generate per-act splits only if `split_by_acts: true`.
  - When per‑act splits are generated, apply Outline Size Defaults to each chapter's outline to avoid overlong planning.

**Cross-Doc Consistency:**
- Validate conflicts across beats, arcs, and world rules (see consistency_validation.md). Surface discrepancies with suggested fixes for user approval.

**Reuse Across Books:**
- For Book N>1, auto-derive a starter dossier from series framework + prior-book deltas; user can accept or adjust before development.

**Names & Toponyms Check:**
- Add new character/place names to `outputs/names_registry.json` and re-run evaluation.
- Use `references/names/cliche_morphemes.txt` to flag overused patterns
- Resolve flagged clichés/root duplication/initial imbalance before approval.

---

### Stage 6: Output Generation
**Load:** `references/workflows/stage_6_output.md`

**Summary:**
- Decision Point 6A: Output format (markdown/multi-file/JSON/docx)
- Decision Point 6B: Series package (master document?)
- Generate all outputs
- Present completion summary
- Execute final Stage Transition Protocol

**Packaging & Indexing:**
- Build a navigation index in `outputs/INDEX.md` (auto-generated using `scripts/generate_index.py`).
- Offer ZIP packaging for delivery on request.
- Include a single entrypoint file for each book and a series master doc.

**Testing Mode Outcomes:**
- Generate one book's compiled dossier (default) to demonstrate end-to-end output.
- Optionally skip per‑act splits unless requested.

---

## Communication Protocol

**At every decision point:**
1. Present options clearly (A/B/C format when applicable)
2. Use Recommendation Approval Protocol for recommendations
3. Wait for explicit user response
4. Do not assume or proceed without confirmation
5. Keep explanations concise (token efficiency)

**Handling user input:**
- **Revise earlier decisions**: Update element and continue from current stage
- **Mix approaches**: Different options for different books allowed
- **Provide materials mid-workflow**: Incorporate immediately and continue
- **Uncertainty**: Provide brief recommendation, then let user decide

**Auto-Loaded Protocols:**
- Load all Essential Protocols at session start (batched) to minimize overhead and ensure consistency.

**Testing Mode Prompting:**
- Offer the A–E sample list up front with one‑line descriptors. After selection, confirm and proceed without additional intake questions.

**User cannot:**
- Skip mandatory stages (except Stage 3 for standalone)
- Jump ahead without completing current stage
- Defer decisions that block workflow progression

---

## Flexible Elements

### Truby Integration (Optional)
Retain Truby essence without rigidity:
- Premise development (desire, opponent, plan, battle, self-revelation)
- Character web (protagonist, opponent, ally, fake-ally, subplot character)
- Flexible beat structure (not locked to 22-step)
- Moral argument and theme
- Character arc transformation

**When to apply:** If user requests Truby approach or story includes complex moral/character dimensions.

### Universal Fantasies
AI suggests 2-4 universal fantasies per book based on:
- Genre conventions, character goals, emotional throughlines, series themes
- Load `references/universal_fantasies.md` for complete taxonomy (40+ fantasies across 7 categories)
- User can accept, modify, or override suggestions

**Fantasy categories:**
- Recognition & Validation (Being Seen, Mattering, Belonging)
- Transformation & Growth (Becoming More, Redemption, Healing)
- Power & Agency (Autonomy, Competence, Victory)
- Connection & Intimacy (Unconditional Love, Passionate Desire, Safe Intimacy)
- Adventure & Escape (Excitement, Danger+Safety, Luxury)
- Justice & Vindication (Revenge, Moral Clarity, Speaking Truth)
- Safety & Security (Protection, Stability, Financial Security)

### Beat Sheet Frameworks
Support multiple frameworks with comprehensive guidance:
- Load `references/beat_sheets.md` for complete selection guide with decision trees
- Available frameworks (10 total):
  - **Three-Act Structure** - Universal, all genres
  - **Romance Beat Sheet** - Contemporary romance, heat 1-3
  - **Romantasy 20 Beats** - Fantasy romance, heat 2-4
  - **Romantasy - The Beats** - Epic romantasy, heat 3-5
  - **A-E Trauma-Informed** - Dark romance with consent protocols
    - A: Mutual Trauma Bonding
    - B: Protector × Wounded
    - C: Toxic Coping → Healing
    - D: Post-Trauma Re-Entry
    - E: Dark Trauma Hybrid
  - **Dark Romancing The Beats** - Villain/antihero romance
- Check `beat_sheet_library/` directory (Resource Discovery Protocol)
- If creating custom, load `references/create_new_beat_frameworks.md`

---

## Maintenance & Validation

### Skill Integrity Validation
**Run validation before deploying or after modifications:**

```bash
python3 scripts/validate_skill_integrity.py
```

**Checks performed:**
- Required files present and non-empty
- File references in documentation are valid
- Template and beat sheet library integrity
- JSON schema validity
- Python script syntax validation

**Exit codes:**
- 0: All checks passed
- 1: Errors found (skill may not function correctly)

**Output:** Detailed report with errors, warnings, and info messages

### Resource Manifest Generation
**Generate/refresh resource manifest after adding templates or beat sheets:**

```bash
python3 scripts/build_resource_manifest.py
```

**Produces:** `outputs/resource_manifest.json` with:
- List of all templates (15 total)
- List of all beat sheets (10 total)
- Root directory paths for discovery

**When to regenerate:**
- After adding new templates to `templates/`
- After adding new beat sheets to `beat_sheet_library/`
- When starting fresh project (creates outputs/ directory)

### Other Utility Scripts
- `scripts/evaluate_names.py` - Evaluate character/place names against cliché list
- `scripts/evaluate_outline_sizes.py` - Check chapter outline length compliance
- `scripts/evaluate_planning_ratio.py` - Analyze planning vs. drafting ratio
- `scripts/generate_index.py` - Generate navigation index for outputs
- `scripts/add_frontmatter.py` - Add YAML frontmatter to markdown files
- `scripts/check_sequence_and_reconcile.py` - Validate stage sequence
- `scripts/testing_quickstart.py` - Quick setup for Testing mode

---

## Quick Reference

### Getting Started
- **New Users:** Read [QUICKSTART.md](QUICKSTART.md) first (5-minute overview)
- **Experienced Users:** Jump to Stage 1 with session mode specified
- **Testing/Demo:** Use Testing mode with samples A-E

### Core Workflow Files
- `references/workflows/workflow_principles.md` - How workflow progresses
- `references/workflows/stage_1_intake.md` through `stage_6_output.md` - Stage-specific instructions

### Reference Guides
- `references/beat_sheets.md` - Beat sheet framework selection guide
- `references/universal_fantasies.md` - Emotional fantasy taxonomy
- `references/names/protocol.md` - Naming protocol and evaluation

### Protocol Files
- `references/workflows/recommendation_protocol.md` - Approval workflow
- `references/workflows/resource_discovery.md` - Finding existing resources
- `references/workflows/session_management.md` - Memory.json management
- `references/workflows/document_separation.md` - Three-document system
- `references/workflows/stage_transition_checklist.md` - Stage completion checks
- `references/workflows/consistency_validation.md` - Cross-doc assertions
- `references/workflows/market_driven_shortcut.md` - Optimization for market-driven users

### Resource Libraries
- `templates/` - 15 production-ready templates
- `beat_sheet_library/` - 10 story structure frameworks
- `intake_samples/` - 5 curated sample projects (A-E)
- `schemas/` - JSON schemas for structured data
- `scripts/` - 9 utility scripts for automation and validation

---

## Metadata & Sorting Standards

### YAML Frontmatter (recommended for outputs)
```yaml
---
title: <Document Title>
project: <Series/Book Name>
type: <research|framework|beats|world|character|book_dossier|chapter_outlines|index|session>
stage: <1|2|3|4|5|6>
book: <book_number or null>
created: <ISO8601>
updated: <ISO8601>
version: 2.1
---
```

### Deterministic Sorting
- Prefer numeric prefixes for ordered files (e.g., `01_series_framework.md`, `02_series_romance_beats.md`).
- Within a book folder, use consistent naming: dossier, complete_story_guide, and optional per-act files.

---

## Testing Mode Quickstart

### Using Testing Quickstart Script
```bash
python3 scripts/testing_quickstart.py --sample A|B|C|D|E
```
- Copies the chosen sample from `intake_samples/` to `outputs/intake_form.md`
- Creates/updates `outputs/memory.json` with `{ "testing": true, "session_mode": "testing", "stages": {"completed": [1], "current": 2 } }`
- Regenerates `outputs/INDEX.md`

### Agent Prompting (no script)
- Present the A–E list with descriptions
- On approval, copy the sample intake and proceed from Stage 2 with Express defaults
- Use light research budget and stage-level approvals

### Sample Projects
- **A: Mutual Trauma Bonding** - Both MCs survivors, co-regulation
- **B: Protector × Wounded** - Caretaker dynamic with rebalancing
- **C: Toxic Coping → Healing** - Redemption arc with accountability
- **D: Post-Trauma Re-Entry** - PTSD/reintegration themes
- **E: Dark Trauma Hybrid** - High-intensity dark romance with safety protocols

---

## Output Files Structure

### Typical Session Output
```
outputs/
├── memory.json                          # Session state
├── intake_form.md                       # Workflow tracker
├── series_framework.md                  # Series bible
├── resource_manifest.json               # Available resources
├── names_registry.json                  # Character/place names
├── INDEX.md                             # Navigation index
├── [project]_research.md                # Market research (if Stage 2)
├── book_1_[title]/
│   ├── book_1_dossier.md               # Complete story guide
│   ├── book_1_act_1.md                 # Act 1 chapters
│   ├── book_1_act_2.md                 # Act 2 chapters
│   ├── book_1_act_3.md                 # Act 3 chapters
│   ├── book_1_act_4.md                 # Act 4 chapters
│   └── book_1_act_5.md                 # Act 5 chapters
├── book_2_[title]/
│   └── ...                              # Same structure
└── book_N_[title]/
    └── ...                              # Same structure
```

---

## Version History

### Version 2.1 (2025-11-10)
**Major Improvements:**
- Added QUICKSTART.md for easier onboarding
- Added references/beat_sheets.md with comprehensive framework guidance
- Enhanced references/names/cliche_morphemes.txt (32 → 140+ patterns)
- Added scripts/validate_skill_integrity.py for automated validation
- Fixed scripts/build_resource_manifest.py path issues
- Generated initial outputs/resource_manifest.json
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

## Support & Documentation

**For new users:** Start with [QUICKSTART.md](QUICKSTART.md)

**For detailed guidance:** Review `references/` directory documentation

**For validation:** Run `python3 scripts/validate_skill_integrity.py`

**For issues:** Check that all required files are present and resource manifest is generated

---

**Last Updated:** 2025-11-10
**Version:** 2.1
