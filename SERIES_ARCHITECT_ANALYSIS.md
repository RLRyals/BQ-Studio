# Series Architect Agent - Critical Issues Analysis

## Problems Identified

### 1. ❌ ROMANCE BAKED IN (Genre-Agnostic Failure)

**Issue:** The Series Architect Agent assumes ALL series have romance as a core element.

**Evidence from `.claude/agents/series-architect-agent.md`:**
- Line 96: "Romance Series: Relationship obstacle escalation"
- Line 125: "Love interests with complementary arcs"
- Line 235: "Plan love interest / deuteragonist arc (parallel development)"
- Line 264: "Romance: [Relationship beat]"
- Line 343: "`**Romance:** [Relationship progression]`"
- **Line 363-364: Full `## ROMANCE PROGRESSION` section in output template**

**Why This is Wrong:**

Looking at actual genre packs:

**Steampunk Gothic Horror Romance:**
```json
"genre_characteristics": {
  "primary_genre": "Romance",
  "sub_genre": "Steampunk Gothic Horror Romance",
  ...
}
```
✅ Romance IS the primary genre here.

**Urban Fantasy Police Procedural:**
```json
"genre_characteristics": {
  "primary_genre": "Urban Fantasy",
  "sub_genre": "Police Procedural",
  ...
}
```
❌ Romance is NOT the primary genre. It's urban fantasy focused on investigations.

**The Problem:**
- Thriller series: NO romance required
- Military SF: NO romance required
- Police procedural: Romance OPTIONAL, not required
- Mystery: Romance OPTIONAL
- Horror: Romance OPTIONAL

The Series Architect is forcing a "Love Interest" character arc and "Romance Progression" section onto ALL genres.

**Correct Approach:**
The agent should:
1. Load the genre pack manifest
2. Check `genre_characteristics.primary_genre`
3. If primary_genre = "Romance": Include romance arc
4. If primary_genre != "Romance": Make romance OPTIONAL based on concept
5. Use genre-specific terminology (not "love interest" for procedural—use "partner" or "deuteragonist")

---

### 2. ❌ NO GENRE PACK INTEGRATION

**Issue:** The Series Architect Agent doesn't load or use genre packs at all.

**What Genre Packs Provide:**

From `manifest.json` structure, each genre pack includes:

#### `genre_characteristics`
```json
{
  "primary_genre": "Urban Fantasy",
  "sub_genre": "Police Procedural",
  "protagonist_archetype": "Detective/Investigator with magical abilities",
  "core_conflict": "Solving supernatural crimes...",
  "tone": ["Noir", "Gritty", "Procedural", "Supernatural"],
  "pacing": "Balanced between investigation beats and character development"
}
```

#### `beat_sheets`
Genre-specific structures:
- **Urban Fantasy Police Procedural:** "investigation-structure", "case-of-the-week", "series-arc-integration"
- **Gothic Romance Horror:** "gothic-romance-structure", "steampunk-mystery-romance"

#### `templates`
Genre-specific character and setting templates:
- **Urban Fantasy:** `detective-character-template.md`, `urban-fantasy-world-template.md`
- **Gothic Romance:** `steampunk-character-template.md`, `steampunk-setting-template.md`

#### `recommended_workflow.series_planning`
Genre pack tells you exactly how to plan a series for that genre:

**Urban Fantasy Police Procedural:**
```json
"series_planning": [
  "1. Use urban-fantasy-world-template.md to establish magic system",
  "2. Use detective-character-template.md for protagonist",
  "3. Use procedural-setting-template.md for investigation infrastructure",
  "4. Apply series-arc-integration.md patterns for multi-book planning",
  "5. Validate with magic-system-consistency.md"
]
```

**Gothic Romance Horror:**
```json
"series_planning": [
  "1. Use steampunk-setting-template.md to establish gothic industrial location",
  "2. Use steampunk-character-template.md for protagonist and love interest",
  "3. Define the dark secret/curse/threat that drives the horror",
  "4. Establish Victorian social constraints that complicate romance",
  "5. Plan mechanical/supernatural threat"
]
```

**What the Series Architect SHOULD Do:**
1. Accept `genre_pack_id` as input
2. Load `.claude/genre-packs/{genre_pack_id}/manifest.json`
3. Read `genre_characteristics` (what's core to this genre?)
4. Read `recommended_workflow.series_planning` (how to structure this genre?)
5. Use genre-specific `beat_sheets` for escalation patterns
6. Use genre-specific `templates` for character/setting creation
7. Output structure matching genre expectations

**What the Series Architect CURRENTLY Does:**
- Uses hardcoded escalation pattern (personal → apocalyptic)
- Assumes romance in all series
- Uses generic character arc template
- Ignores genre-specific requirements

---

### 3. ❌ LEVEL OF DETAIL MISMATCH (Series Architect vs NPE Validator)

**Issue:** The Series Architect creates high-level book summaries, but the NPE Validator needs scene-level detail to validate 357 rules.

#### What Series Architect Outputs:

**Book 1 Summary:**
```markdown
### 📘 BOOK 1: "Hearts of Brass and Shadow"
**Stakes:** Personal (investigating sister's death)
**Mystery:** Who killed Amelia and why?
**Romance:** Theodore and Vivienne meet, attraction despite suspicion
**Series Thread:** Clockwork heart technology introduced
**Cliffhanger:** Vivienne killed his sister
**Character Arc:** Theodore: Isolated scholar → Emotionally invested investigator
```

This is **book-level** planning. Very high-level.

#### What NPE Validator Needs to Check:

**Character Logic Rules (character-logic.json):**
- **CL-101:** "Character cannot act on information they haven't learned yet"
  - **Needs:** Character knowledge timeline (Book 2, Ch 3: Theodore learns X)
  - **Missing:** Series Architect doesn't specify WHEN in Book 2 Theodore learns what

- **CL-204:** "Character decisions must align with V1-V4 behavioral palette"
  - **Needs:** Specific decision points (Book 3, Ch 12: Theodore chooses to lie to police)
  - **Missing:** No chapter-level or scene-level decisions specified

**Information Economy Rules (information-economy.json):**
- **IE-301:** "Setup in Book 1-3 must have payoff by Book 5"
  - **Needs:** Specific setup locations (Book 1, Ch 5: Mention of sealed factory wing)
  - **Missing:** No chapter-level setup tracking

**Scene Architecture Rules (scene-architecture.json):**
- **SA-101:** "Every scene must have Intention → Obstacle → Consequence"
  - **Needs:** Scene-level planning
  - **Missing:** Series Architect only provides book-level summaries

**Dialogue Physics Rules (dialogue-physics.json):**
- **DP-201:** "Character voice must remain consistent across series"
  - **Needs:** Character voice definition and sample dialogue
  - **Missing:** No character voice specification

#### The Gap:

```
Series Architect Detail Level: BOOK-LEVEL
  Book 1: [Summary paragraph]
  Book 2: [Summary paragraph]
  Book 3: [Summary paragraph]
  Book 4: [Summary paragraph]
  Book 5: [Summary paragraph]

NPE Validator Needs: SCENE-LEVEL
  Book 1, Chapter 1, Scene 1: [Character knows X, doesn't know Y, decides Z]
  Book 1, Chapter 1, Scene 2: [Setup: Mention of locked door]
  Book 1, Chapter 2, Scene 1: [Character learns Y, voice pattern: formal]
  ...
  Book 5, Chapter 25, Scene 3: [Payoff: Locked door opened, reveals truth]
```

**There are 3-4 levels of planning missing:**
1. **Book-Level** ← Series Architect stops here
2. **Chapter-Level** (what happens in each chapter) ← MISSING
3. **Scene-Level** (what happens in each scene) ← MISSING
4. **Beat-Level** (intention, obstacle, consequence per scene) ← MISSING
5. **NPE Validation** ← NPE Validator needs level 3-4 to work

---

## Correct Workflow

The current workflow is missing critical planning phases:

### ❌ Current (Broken) Workflow:
```
Phase 1: Market Research
Phase 2: Genre Pack Selection
Phase 3: Series Architect (book-level summaries)
Phase 4: NPE Validation ← FAILS: Not enough detail to validate
Phase 5: Commercial Validation
```

### ✅ Corrected Workflow:

```
Phase 1: Market Research (Market Research Agent)
  └─► Output: Trending tropes, comp titles, commercial insights

Phase 2: Genre Pack Selection
  └─► Output: Load genre_characteristics, beat_sheets, templates, NPE rules

Phase 3: Series Architect (Series Architect Agent)
  ├─► Input: Market research + genre pack
  ├─► Uses: Genre-specific templates, escalation patterns, beat sheets
  ├─► Output: 5-book structure with character arcs (BOOK-LEVEL)
  └─► Genre-agnostic: Only includes romance if primary_genre = "Romance"

Phase 4: Book Planning (Book Planning Agent/Skill)
  ├─► Input: Book 1 structure from Series Architect
  ├─► Uses: Genre pack beat sheets (gothic-romance-structure.md, investigation-structure.md)
  ├─► Output: Chapter-level plan (CHAPTER-LEVEL)
  │     Book 1, Chapter 1: [What happens]
  │     Book 1, Chapter 2: [What happens]
  │     ...
  │     Book 1, Chapter 25: [What happens]
  └─► Detail: Character knowledge tracking begins, setup/payoff locations specified

Phase 5: Chapter Planning (Chapter Planning Skill)
  ├─► Input: Chapter outline from Book Planning
  ├─► Uses: Genre pack scene architecture rules
  ├─► Output: Scene-level plan (SCENE-LEVEL)
  │     Book 1, Chapter 1, Scene 1: [Intention, Obstacle, Consequence]
  │     Book 1, Chapter 1, Scene 2: [Intention, Obstacle, Consequence]
  │     ...
  └─► Detail: Specific character knowledge states, dialogue beats, setups with locations

Phase 6: NPE Validation (NPE Series Validator Agent)
  ├─► Input: Complete series structure (book + chapter + scene level detail)
  ├─► Validates: All 357 rules across 10 NPE categories
  ├─► Output: NPE compliance score (0-100), violation report with fixes
  └─► NOW HAS ENOUGH DETAIL TO VALIDATE PROPERLY

Phase 7: Commercial Validation (Commercial Validator Agent)
Phase 8: Writing Team Review & Refinement
Phase 9: User Review & Approval
Phase 10: MCP Database Commit
Phase 11: Writing Execution
```

---

## How Genre Packs Should Integrate

### Example: Urban Fantasy Police Procedural Series

**Phase 3: Series Architect loads genre pack:**
```python
# Load genre pack
manifest = load_json(".claude/genre-packs/urban-fantasy-police-procedural/manifest.json")

# Get genre characteristics
primary_genre = manifest["genre_characteristics"]["primary_genre"]  # "Urban Fantasy"
protagonist_archetype = manifest["genre_characteristics"]["protagonist_archetype"]
# "Detective/Investigator with magical abilities"
core_conflict = manifest["genre_characteristics"]["core_conflict"]
# "Solving supernatural crimes..."

# Load genre-specific beat sheet
series_arc_integration = load_file(
  ".claude/genre-packs/urban-fantasy-police-procedural/beat-sheets/series-arc-integration.md"
)

# Use genre-specific escalation pattern
escalation = extract_escalation_pattern(series_arc_integration)
# For UFPP: Case complexity escalation, not apocalyptic stakes

# Determine if romance is required
if primary_genre == "Romance":
  include_romance_arc = True
  romance_required = True
else:
  include_romance_arc = check_concept_for_romance(concept)  # Optional based on concept
  romance_required = False

# Use genre-specific character template
character_template = load_file(
  ".claude/genre-packs/urban-fantasy-police-procedural/templates/detective-character-template.md"
)
# NOT "love interest" but "partner" or "deuteragonist"
```

**Output Structure Changes Based on Genre:**

**Urban Fantasy Police Procedural Book 1:**
```markdown
### 📘 BOOK 1: "Shadow Precinct"
**Stakes:** Personal (first supernatural case)
**Case:** Who is killing magic users in the warehouse district?
**Partnership:** Detective partners with supernatural consultant
**World-Building:** Magic system introduction through investigation
**Series Thread:** Hints of larger conspiracy
**Cliffhanger:** Partner reveals hidden identity
```
❌ NO "Romance:" field forced
✅ Uses genre-appropriate structure (Case, Partnership, World-Building)

**Gothic Romance Horror Book 1:**
```markdown
### 📘 BOOK 1: "Hearts of Brass and Shadow"
**Stakes:** Personal (investigating sister's death)
**Mystery:** Who killed Amelia and why?
**Romance:** Theodore and Vivienne meet, attraction despite suspicion
**Horror:** Clockwork heart requires victim deaths
**Series Thread:** Factory secrets and transformation
**Cliffhanger:** Vivienne killed his sister
```
✅ "Romance:" field included because primary_genre = "Romance"

---

## Summary of Required Changes

### 1. **Series Architect Agent Rewrite**

**Must Add:**
- Load genre pack manifest at start
- Read `genre_characteristics` to understand genre requirements
- Check if `primary_genre == "Romance"` before including romance
- Use genre-specific beat sheets for escalation patterns
- Use genre-specific character templates
- Output structure adapts to genre (not one-size-fits-all)

**Must Remove:**
- Hardcoded "Romance:" field in output
- Hardcoded "## ROMANCE PROGRESSION" section
- Assumption of "love interest" in character arcs
- Generic "personal → apocalyptic" escalation (not appropriate for all genres)

### 2. **Add Missing Planning Phases**

**Phase 4: Book Planning**
- Expand Book 1 structure to 25 chapters
- Specify what happens in each chapter
- Begin character knowledge tracking

**Phase 5: Chapter Planning**
- Expand each chapter to scene-by-scene plan
- Specify Intention → Obstacle → Consequence for each scene
- Track specific setup/payoff locations
- Define character voice patterns

### 3. **Update NPE Series Validator**

**Change Input Requirements:**
- Current: Expects book-level summaries
- New: Requires scene-level detail to validate properly
- Add validation: "Insufficient detail provided" error if only book-level

### 4. **Update Market-Driven Planning Skill**

**Add Phases:**
- Phase 4: Book Planning (new)
- Phase 5: Chapter Planning (new)
- Renumber subsequent phases

---

## Critical Question for User

**How granular should the Series Architect be?**

**Option A: Series Architect stays high-level (book summaries only)**
- Pro: Fast, focuses on series-level coherence
- Con: Requires additional Book Planning and Chapter Planning phases before NPE validation
- Con: Larger workflow with more handoffs

**Option B: Series Architect expands to chapter-level detail**
- Pro: Fewer workflow phases
- Con: Much longer processing time (planning 5 books × 25 chapters = 125 chapters)
- Con: Single agent doing too much work

**Option C: Hybrid - Series Architect plans Books 1-2 in detail, Books 3-5 high-level**
- Pro: Can NPE-validate Books 1-2 early
- Pro: Books 3-5 adjusted based on Book 1 writing experience
- Con: Asymmetric detail level might cause issues

**Recommendation:** Option A with clear workflow phases. Each agent does one job well.

---

## Next Steps

1. **Decide:** How to structure the workflow (Option A, B, or C)?
2. **Rewrite:** Series Architect Agent to be genre-agnostic and genre-pack-integrated
3. **Build:** Book Planning Agent/Skill (chapter-level planning)
4. **Build:** Chapter Planning updates (scene-level planning)
5. **Update:** NPE Series Validator input requirements
6. **Test:** Complete workflow with non-romance genre (Thriller, Military SF, Mystery)
