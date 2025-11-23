# Series-Architect-2 Integration Plan
**Project:** The Eternal Garden (Steampunk Gothic Horror Series)
**Date:** 2025-11-23
**Purpose:** Align existing work with series-architect-2 structure and integrate BQ-Studio ecosystem

---

## Current Situation

### What Was Created (Without Series-Architect-2)

All files created in `series-planning/steampunk-gothic-eternal-garden/`:

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `series-arc.md` | ~300 | 5-book overview, plot tracking | ✅ Content good, wrong format/location |
| `book-1-structure.md` | ~600 | Book 1 detailed 24-chapter outline | ✅ Content good, wrong format/location |
| `book-1-npe-analysis.md` | ~400 | NPE compliance analysis (83% rating) | ✅ Good addition, not in SA2 workflow |
| `book-2-structure.md` | ~500 | Book 2 detailed 25-chapter outline | ✅ Content good, wrong format/location |
| `book-3-structure.md` | ~600 | Book 3 detailed 28-chapter outline | ✅ Content good, wrong format/location |

**Supporting Infrastructure Created:**
- `.claude/genre-packs/steampunk-gothic/` - Complete genre pack with NPE physics
  - `npe-physics/stakes-pressure.json` (Gothic-specific rules)
  - `npe-physics/pacing-rules.json` (Gothic pacing)
  - `manifest.json` (fully customized)
  - `README.md` (comprehensive documentation)

### What Series-Architect-2 Expects

All files should be in `outputs/` with this structure:

```
outputs/
├── memory.json                          # Session state (MISSING)
├── intake_form.md                       # Workflow tracker (MISSING)
├── series_framework.md                  # Series bible (MISSING - have series-arc.md instead)
├── resource_manifest.json               # Available resources (MISSING)
├── names_registry.json                  # Character/place names (MISSING)
├── INDEX.md                             # Navigation index (MISSING)
├── book_1_The_Eternal_Garden/
│   ├── book_1_dossier.md               # Complete story guide (MISSING)
│   ├── book_1_act_1.md                 # Act 1 chapters (MISSING)
│   ├── book_1_act_2.md                 # Act 2 chapters (MISSING)
│   ├── book_1_act_3.md                 # Act 3 chapters (MISSING)
│   ├── book_1_act_4.md                 # Act 4 chapters (MISSING)
│   └── book_1_act_5.md                 # Act 5 chapters (MISSING)
├── book_2_The_Clockwork_Cure/
│   └── ... (same structure)
└── book_3_The_Mechanical_Heart/
    └── ... (same structure)
```

---

## Gap Analysis

### ✅ What We Have (Good Content, Wrong Format)

1. **Series Overview** - series-arc.md contains:
   - 5-book summaries with core questions
   - Plot thread tracking across books
   - Escalation patterns
   - Ending options
   - Pacing strategy
   - **Maps to:** series_framework.md

2. **Book Structures** - book-1-structure.md, book-2-structure.md, book-3-structure.md contain:
   - Chapter-by-chapter breakdowns
   - Three-act structure
   - Character arcs
   - Emotional beats
   - Scene details
   - **Maps to:** book_X_dossier.md + per-act files (book_X_act_1.md through book_X_act_5.md)

3. **Genre Infrastructure** - `.claude/genre-packs/steampunk-gothic/`
   - NPE physics rules adapted for Gothic horror
   - Manifest with genre specifications
   - Complete documentation
   - **Integration needed:** Series-architect-2 doesn't reference genre packs yet

### ❌ What We're Missing (Required by Series-Architect-2)

1. **Session Management Files:**
   - `outputs/memory.json` - Session state, stage tracking, decisions
   - `outputs/intake_form.md` - Workflow tracker with parameters
   - `outputs/resource_manifest.json` - Available templates/beat sheets
   - `outputs/names_registry.json` - Character/place names for evaluation
   - `outputs/INDEX.md` - Navigation index

2. **Proper File Structure:**
   - Book folders: `outputs/book_1_The_Eternal_Garden/` etc.
   - Per-act chapter breakdowns (5 files per book)
   - Dossier format (complete story guide)

3. **Stage Progression:**
   - No record of completing Stages 1-5
   - No decision audit trail
   - No stage transition checklist compliance

### 🔧 What Needs Integration (New Capabilities)

1. **NPE Physics Integration:**
   - Series-architect-2 has no NPE validation built in
   - Need to add NPE analysis as Stage 5.5 or pre-Stage 6 check
   - Gothic-specific rules already created in genre pack

2. **Genre Pack System:**
   - Series-architect-2 doesn't reference genre packs
   - Need to integrate genre pack discovery/loading
   - Use genre pack NPE rules for validation

3. **BQ-Studio Agents:**
   - Professor Mira (worldbuilding consistency)
   - Dr. Viktor (character psychology)
   - Edna (commercial viability)
   - Miranda (series coordination)
   - Not referenced in series-architect-2 workflow

4. **MCP Servers:**
   - author-server, series-planning-server, character-planning-server
   - Mentioned in user's goals but not in series-architect-2 docs

---

## Mapping: Current Work → Series-Architect-2 Format

### Document Transformations

| Current Document | Series-Architect-2 Equivalent | Transformation Required |
|------------------|-------------------------------|-------------------------|
| `series-arc.md` | `outputs/series_framework.md` | **Reformat:** Add YAML frontmatter, restructure to match series framework template |
| `book-1-structure.md` | `outputs/book_1_The_Eternal_Garden/book_1_dossier.md` | **Split:** Extract dossier content |
| `book-1-structure.md` | `outputs/book_1_The_Eternal_Garden/book_1_act_1.md` (etc.) | **Split:** Extract per-act chapter breakdowns (5 files) |
| `book-2-structure.md` | `outputs/book_2_The_Clockwork_Cure/book_2_dossier.md` + act files | **Split:** Same as Book 1 |
| `book-3-structure.md` | `outputs/book_3_The_Mechanical_Heart/book_3_dossier.md` + act files | **Split:** Same as Book 1 |
| `book-1-npe-analysis.md` | `outputs/book_1_The_Eternal_Garden/book_1_npe_analysis.md` | **Move + Enhance:** Add to book folder, make this a standard check |

### New Documents Needed

| Document | Purpose | Source |
|----------|---------|--------|
| `outputs/memory.json` | Session state tracking | **Generate:** Backfill stages 1-5 as completed, document decisions |
| `outputs/intake_form.md` | Workflow tracker | **Generate:** Extract parameters from existing work |
| `outputs/resource_manifest.json` | Available templates/beat sheets | **Generate:** Run `python3 scripts/build_resource_manifest.py` |
| `outputs/names_registry.json` | Character/place name tracking | **Extract:** From existing worldbuilding-bible.md and character-psychology.md |
| `outputs/INDEX.md` | Navigation index | **Generate:** Run `python3 scripts/generate_index.py` |

---

## Integration Plan: Series-Architect-2 + BQ-Studio Ecosystem

### Phase 1: Retrofit Current Work (Immediate - Homework Compliance)

**Goal:** Transform existing work into series-architect-2 format to demonstrate skill usage

#### 1.1 Create Session Management Files
- [ ] Generate `outputs/memory.json` with backfilled stages
  - Mark Stages 1-5 as completed
  - Document key decisions made (genre, structure, beat sheets)
  - Add changelog entries for major milestones
- [ ] Generate `outputs/intake_form.md`
  - Extract: 5 books, ~24 chapters/book, Steampunk Gothic Horror
  - Heat: warm (2/5), Violence: high (4/5), Dark themes: yes
  - Target: 100k words/book
- [ ] Generate `outputs/resource_manifest.json`
  - Run: `python3 series-architect-2/scripts/build_resource_manifest.py`
- [ ] Generate `outputs/names_registry.json`
  - Extract from worldbuilding-bible.md and character-psychology.md
  - Characters: Celeste Hartwell, Margot, Augustus, Daniel, Viktor
  - Places: Hartwell Mechanical Gardens, 47 Cheyne Walk, Victorian London
  - Run evaluation: `python3 series-architect-2/scripts/evaluate_names.py`

#### 1.2 Transform Series-Arc to Series Framework
- [ ] Convert `series-arc.md` → `outputs/series_framework.md`
  - Add YAML frontmatter (stage: 3, type: framework)
  - Restructure to match series framework template
  - Keep: 5-book summaries, plot tracking, escalation patterns
  - Add: Series bible sections (world rules, magic system, vampire mechanics)

#### 1.3 Create Book Folder Structure
- [ ] Create book folders:
  - `outputs/book_1_The_Eternal_Garden/`
  - `outputs/book_2_The_Clockwork_Cure/`
  - `outputs/book_3_The_Mechanical_Heart/`
  - `outputs/book_4_[TBD]/` (placeholder)
  - `outputs/book_5_[TBD]/` (placeholder)

#### 1.4 Split Book Structures into Dossiers + Act Files

**For Book 1 (repeat for Books 2-3):**
- [ ] Extract dossier content from `book-1-structure.md` → `book_1_dossier.md`
  - Include: Premise, character arcs, emotional throughline, cure quest structure
  - Include: Universal fantasies, themes, series integration
  - Format: Complete story guide (canonical compilation)
- [ ] Split chapter breakdowns into act files:
  - `book_1_act_1.md` - Chapters 1-5 (setup, entrapment)
  - `book_1_act_2.md` - Chapters 6-10 (rising tension, first boundary crossings)
  - `book_1_act_3.md` - Chapters 11-15 (midpoint turn, cure attempt)
  - `book_1_act_4.md` - Chapters 16-20 (deepening complicity, crisis builds)
  - `book_1_act_5.md` - Chapters 21-24 (climax, resolution, hooks)
- [ ] Apply outline size defaults: normal (120-180 words/chapter, 6-10 major events)
- [ ] Add YAML frontmatter to all files (stage: 5, book: 1, act: X)

#### 1.5 Move NPE Analysis Files
- [ ] Move `book-1-npe-analysis.md` → `outputs/book_1_The_Eternal_Garden/book_1_npe_analysis.md`
- [ ] Create placeholder NPE analysis files for Books 2-3 (to be filled)

#### 1.6 Generate Navigation Index
- [ ] Run: `python3 series-architect-2/scripts/generate_index.py`
- [ ] Creates: `outputs/INDEX.md` with navigation links

#### 1.7 Validate Series-Architect-2 Compliance
- [ ] Run: `python3 series-architect-2/scripts/validate_skill_integrity.py`
- [ ] Check: All required files present, proper structure
- [ ] Run: `python3 series-architect-2/scripts/check_sequence_and_reconcile.py`
- [ ] Verify: Stage sequence valid, no conflicts

**Deliverable:** Homework-compliant series-architect-2 outputs demonstrating proper skill usage

---

### Phase 2: NPE Integration (Enhancement)

**Goal:** Add NPE validation as standard series-architect-2 capability

#### 2.1 Create NPE Integration Workflow
- [ ] New workflow file: `series-architect-2/references/workflows/npe_validation.md`
  - Load genre pack NPE rules (stakes-pressure.json, pacing-rules.json)
  - Run analysis on book structure
  - Generate compliance report
  - Surface issues before Stage 6 finalization

#### 2.2 Add NPE Check to Stage 5 Development
- [ ] Update `series-architect-2/references/workflows/stage_5_development.md`
  - Add Step 5.5: NPE Validation (after chapter breakdowns, before book approval)
  - Load genre pack NPE physics
  - Run automated checks (boundary crossing frequency, horror beat spacing, etc.)
  - Generate analysis report
  - Flag issues for user review

#### 2.3 Create NPE Analysis Template
- [ ] New template: `series-architect-2/templates/npe_analysis_template.md`
  - Tension axis evaluation
  - Stakes & pressure compliance
  - Pacing rule validation
  - Compliance scorecard
  - Recommendations for fixes

#### 2.4 Update Stage Transition Checklist
- [ ] Modify `series-architect-2/references/workflows/stage_transition_checklist.md`
  - Add Stage 5 requirement: NPE analysis completed and reviewed
  - Add check: NPE compliance ≥ 75% (or explicit waiver)

**Deliverable:** NPE validation integrated into series-architect-2 workflow

---

### Phase 3: Genre Pack Integration (Enhancement)

**Goal:** Make genre packs first-class citizens in series-architect-2

#### 3.1 Create Genre Pack Discovery Protocol
- [ ] New protocol: `series-architect-2/references/workflows/genre_pack_discovery.md`
  - Scan `.claude/genre-packs/` directory
  - Match genre to available packs
  - Load pack manifest and resources
  - Present pack selection to user (Stage 1 or 2)

#### 3.2 Add Genre Pack to Resource Manifest
- [ ] Update `series-architect-2/scripts/build_resource_manifest.py`
  - Scan `.claude/genre-packs/` directory
  - Extract genre pack manifests
  - Add to resource_manifest.json:
    ```json
    "genre_packs": [
      {
        "name": "Steampunk Gothic Horror",
        "path": ".claude/genre-packs/steampunk-gothic",
        "npe_physics": ["stakes-pressure.json", "pacing-rules.json"],
        "templates": [...],
        "beat_sheets": [...]
      }
    ]
    ```

#### 3.3 Link Genre Packs to NPE Validation
- [ ] Update NPE validation workflow to check:
  - Is there a genre pack for this genre?
  - Load NPE rules from genre pack (if available)
  - Fall back to baseline rules (if no genre pack)

#### 3.4 Add Genre Pack Selection to Stage 2
- [ ] Update `series-architect-2/references/workflows/stage_2_research.md`
  - Decision Point 2B: Genre pack selection
  - Present available genre packs matching user's genre
  - Load selected pack's resources (templates, beat sheets, NPE rules)
  - Record selection in memory.json

**Deliverable:** Genre packs integrated into series-architect-2 resource discovery

---

### Phase 4: BQ-Studio Agent Integration (Advanced)

**Goal:** Integrate specialist agents (Professor Mira, Dr. Viktor, Edna, Miranda) as optional Stage 5 reviewers

#### 4.1 Create Agent Review Protocol
- [ ] New protocol: `series-architect-2/references/workflows/agent_review_protocol.md`
  - When to invoke agents (optional Stage 5 review)
  - Which agent for which aspect:
    - **Professor Mira**: Worldbuilding consistency, magic system logic
    - **Dr. Viktor**: Character psychology, emotional arc authenticity
    - **Edna**: Commercial viability, genre expectations, pacing
    - **Miranda**: Series arc coordination, plot thread tracking
  - How to incorporate agent feedback

#### 4.2 Add Agent Review to Stage 5
- [ ] Update `series-architect-2/references/workflows/stage_5_development.md`
  - Add optional Step 5.6: Agent Review (after NPE validation, before book approval)
  - Present agent review options to user:
    - Skip (faster, DIY review)
    - Worldbuilding review (Professor Mira)
    - Character review (Dr. Viktor)
    - Commercial review (Edna)
    - Series coordination review (Miranda)
    - Full team review (all agents)
  - User selects which reviews to run
  - Agents provide feedback reports
  - User approves/adjusts book structure

#### 4.3 Create Agent Task Templates
- [ ] New templates for agent invocation:
  - `series-architect-2/references/agent_tasks/worldbuilding_review.md`
  - `series-architect-2/references/agent_tasks/character_review.md`
  - `series-architect-2/references/agent_tasks/commercial_review.md`
  - `series-architect-2/references/agent_tasks/series_coordination_review.md`

**Deliverable:** BQ-Studio agents available as optional Stage 5 reviewers

---

### Phase 5: MCP Server Integration (Future)

**Goal:** Use MCP servers for persistent data management

#### 5.1 Identify MCP Integration Points
- [ ] **author-server**: Store author preferences, voice samples, style guides
- [ ] **series-planning-server**: Store series arcs, plot threads, world rules
- [ ] **character-planning-server**: Store character profiles, arcs, relationships

#### 5.2 Update Session Management to Use MCP
- [ ] Modify memory.json to reference MCP resources
- [ ] Store series framework in series-planning-server
- [ ] Store character data in character-planning-server
- [ ] Query MCP servers during Stage 3 (framework) and Stage 5 (development)

#### 5.3 Create MCP Integration Protocol
- [ ] New protocol: `series-architect-2/references/workflows/mcp_integration.md`
  - When to use MCP servers vs. local files
  - How to sync outputs to MCP
  - How to query MCP for existing data
  - Conflict resolution (MCP vs. local files)

**Deliverable:** MCP servers integrated for persistent data storage (future enhancement)

---

## Immediate Action Plan (Homework Compliance)

### Priority 1: Demonstrate Series-Architect-2 Skill Usage

**What to do NOW (for homework submission):**

1. **Create outputs/ structure** (30 min)
   - Run resource manifest generation
   - Create book folders
   - Generate session management files

2. **Transform existing content** (2 hours)
   - Convert series-arc.md → series_framework.md
   - Split book structures → dossiers + act files
   - Move NPE analysis files to book folders
   - Add YAML frontmatter to all outputs

3. **Generate index and validate** (15 min)
   - Run index generation script
   - Run validation script
   - Fix any structural issues

4. **Document the process** (30 min)
   - Update memory.json with backfilled stages
   - Add changelog entries explaining retrofit
   - Note that NPE/genre pack/agent integration are Phase 2+ enhancements

5. **Commit and push** (5 min)
   - Commit all outputs/ files
   - Push to branch
   - Verify homework compliance

**Total Time:** ~3.5 hours

**Result:** Homework demonstrates proper series-architect-2 usage with outputs/ structure and session management

---

### Priority 2: Integration Roadmap Documentation

**Create enhancement proposals** (for instructor feedback):

1. **Document NPE Integration** (Phase 2)
   - How NPE validation adds value
   - Where it fits in workflow (Stage 5.5)
   - Sample NPE analysis output

2. **Document Genre Pack Integration** (Phase 3)
   - How genre packs enhance series-architect-2
   - Resource discovery improvements
   - Sample genre pack manifest

3. **Document Agent Integration** (Phase 4)
   - How BQ-Studio agents provide specialist review
   - Optional enhancement points in workflow
   - Sample agent feedback format

4. **Document MCP Vision** (Phase 5)
   - How MCP servers enable persistent storage
   - Multi-project data reuse
   - Long-term maintenance improvements

**Result:** Instructor sees both compliance AND innovation roadmap

---

## Success Criteria

### Homework Compliance ✅
- [ ] All work in `outputs/` directory with proper structure
- [ ] Session management files present (memory.json, intake_form.md, INDEX.md)
- [ ] Book folders with dossiers + per-act files
- [ ] YAML frontmatter on all outputs
- [ ] Validation scripts pass
- [ ] Demonstrates series-architect-2 skill usage

### Content Quality ✅
- [ ] No content loss from original work
- [ ] All 3 book structures preserved
- [ ] NPE analysis retained and enhanced
- [ ] Genre pack infrastructure documented

### Integration Vision ✅
- [ ] Clear roadmap for NPE integration (Phase 2)
- [ ] Clear roadmap for genre pack integration (Phase 3)
- [ ] Clear roadmap for agent integration (Phase 4)
- [ ] Clear roadmap for MCP integration (Phase 5)

---

## Notes

**Why This Approach:**
- **Phase 1 (Immediate)**: Retrofits existing work to satisfy homework requirement
- **Phases 2-5 (Future)**: Documents enhancement roadmap showing how to combine series-architect-2 + BQ-Studio ecosystem

**What Gets Preserved:**
- All existing content (series-arc, book structures, NPE analysis)
- Custom genre pack with Gothic-specific NPE rules
- Foundation documents (market-research, worldbuilding-bible, character-psychology)

**What Gets Enhanced:**
- Proper series-architect-2 structure and session management
- Integration of BQ-Studio innovations (NPE, genre packs, agents, MCP)
- Automated validation and quality checks

**Instructor Value:**
- Demonstrates series-architect-2 skill usage (homework requirement)
- Shows understanding of workflow stages and protocols
- Proposes thoughtful enhancements combining multiple systems
- Documents clear integration roadmap for future work

---

**Next Steps:** Execute Priority 1 (Create outputs/ structure and transform content) to achieve homework compliance.
