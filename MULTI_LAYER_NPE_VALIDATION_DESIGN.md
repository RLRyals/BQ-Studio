# Multi-Layer NPE Validation + Trope MCP Storage System

## Core Philosophy: "Big Rocks First"

Validation happens at **multiple appropriate levels** throughout the process:

1. **Series-Level NPE Validation** → Validates "big rocks" (structure, arcs, tropes)
2. **Scene-Level NPE Validation** → Validates "sand" (dialogue, POV, scene physics)

This catches structural issues early and detail issues during writing.

---

## Part 1: Trope Research & MCP Storage

### Recommended MCP Server: `series-planning-server`

**Why this server:**
- Tropes are researched during series planning phase
- Series Architect uses tropes during structure design
- Can track trope usage across multiple series for marketing analysis
- Logical grouping with series-level data

**Alternative:** Create new `market-research-server` or `trope-library-server`, but `series-planning-server` is most cohesive.

---

### Trope MCP Schema

#### Table: `tropes`
```sql
CREATE TABLE tropes (
  trope_id UUID PRIMARY KEY,
  trope_name TEXT NOT NULL,
  trope_category TEXT NOT NULL, -- 'Relationship', 'Plot', 'Character', 'Setting', 'Tone'
  description TEXT NOT NULL,

  -- Popularity tracking
  popularity_score DECIMAL(3,1), -- 0.0-10.0 based on market research
  trending_status TEXT, -- 'emerging', 'hot', 'stable', 'declining'
  last_researched_date TIMESTAMP,

  -- Genre associations
  common_genres JSONB, -- ["Urban Fantasy", "Romance", "Mystery"]

  -- Required scenes (the key part!)
  required_scenes JSONB NOT NULL,
  -- Structure:
  -- {
  --   "opening": {
  --     "name": "Antagonistic First Meeting",
  --     "description": "Characters meet with conflict/opposition",
  --     "timing": "Book 1, early chapters",
  --     "validation_criteria": "Must establish justified antagonism",
  --     "examples": ["...", "..."]
  --   },
  --   "middle": [ ... ],
  --   "closing": { ... }
  -- }

  -- Research metadata
  comp_titles JSONB, -- Examples of books using this trope well
  reader_expectations JSONB, -- What readers expect from this trope
  common_pitfalls JSONB, -- Common execution mistakes

  -- Interaction with other tropes
  complements_tropes JSONB, -- Trope IDs that work well together
  conflicts_with_tropes JSONB, -- Trope IDs that clash

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tropes_category ON tropes(trope_category);
CREATE INDEX idx_tropes_name ON tropes(trope_name);
CREATE INDEX idx_tropes_trending ON tropes(trending_status);
```

#### Table: `series_trope_usage`
```sql
CREATE TABLE series_trope_usage (
  usage_id UUID PRIMARY KEY,
  series_id UUID NOT NULL,
  trope_id UUID NOT NULL REFERENCES tropes(trope_id),

  -- Where was trope used
  planned_scenes JSONB NOT NULL,
  -- Structure:
  -- {
  --   "opening": {
  --     "book": 1,
  --     "chapter_range": "1-5",
  --     "scene_description": "Theodore and Vivienne meet at factory, argue about access"
  --   },
  --   "middle": { ... },
  --   "closing": { ... }
  -- }

  -- Execution details
  execution_approach TEXT, -- How this series plans to execute the trope uniquely
  twist_on_trope TEXT, -- What makes this execution fresh

  -- Validation status
  validated_by_series_npe BOOLEAN DEFAULT FALSE,
  validation_notes TEXT,

  -- Marketing data
  primary_trope BOOLEAN DEFAULT FALSE, -- Is this a main selling point?
  marketing_copy TEXT, -- "Enemies to Lovers in a steampunk gothic setting..."

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_series_trope_series ON series_trope_usage(series_id);
CREATE INDEX idx_series_trope_trope ON series_trope_usage(trope_id);
CREATE INDEX idx_primary_tropes ON series_trope_usage(primary_trope) WHERE primary_trope = TRUE;
```

#### Table: `trope_research_log`
```sql
CREATE TABLE trope_research_log (
  log_id UUID PRIMARY KEY,
  trope_id UUID NOT NULL REFERENCES tropes(trope_id),
  research_date TIMESTAMP DEFAULT NOW(),

  -- Research source
  sources JSONB, -- URLs, comp titles analyzed, market data
  researcher TEXT, -- 'market-research-agent'

  -- Findings
  popularity_change TEXT, -- 'increased', 'stable', 'decreased'
  new_required_scenes JSONB, -- Any new patterns discovered
  market_insights TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Trope MCP Server Functions

#### For Market Research Agent:
```javascript
// Store newly researched trope
mcp__series_planning__store_trope({
  trope_name: "Enemies to Lovers",
  trope_category: "Relationship",
  description: "...",
  popularity_score: 9.2,
  trending_status: "hot",
  required_scenes: { opening: {...}, middle: {...}, closing: {...} },
  comp_titles: ["...", "..."],
  reader_expectations: ["...", "..."]
})

// Update existing trope with new research
mcp__series_planning__update_trope_research(trope_id, {
  popularity_score: 9.5,
  new_comp_titles: ["..."],
  market_insights: "Trope now trending on BookTok..."
})

// Get trending tropes for genre
mcp__series_planning__get_trending_tropes({
  genre: "Romance",
  trending_status: "hot",
  limit: 10
})
```

#### For Series Architect Agent:
```javascript
// Get trope definition with required scenes
mcp__series_planning__get_trope_details(trope_id)

// Get compatible tropes
mcp__series_planning__get_compatible_tropes(trope_id_list)

// Record trope usage in series
mcp__series_planning__record_trope_usage({
  series_id: "...",
  trope_id: "...",
  planned_scenes: {
    opening: { book: 1, chapter_range: "1-5", scene_description: "..." },
    middle: { book: 2, chapter_range: "8-12", scene_description: "..." },
    closing: { book: 3, chapter_range: "20-25", scene_description: "..." }
  },
  execution_approach: "Victorian propriety adds tension to enemies dynamic",
  twist_on_trope: "Beauty-as-beast role reversal",
  primary_trope: true
})
```

#### For Marketing Analysis:
```javascript
// Which series used "Enemies to Lovers"?
mcp__series_planning__query_trope_usage(trope_name)

// Most popular tropes in our catalog
mcp__series_planning__get_trope_analytics({
  series_count: true,
  primary_trope_only: true
})

// Get marketing copy for series tropes
mcp__series_planning__get_series_tropes(series_id)
```

---

## Part 2: Series-Level NPE Validator Agent

### Validation Categories (Big Rocks Only)

#### 1. Character Arc Logic (Series Level)

**Validates:**
- ✅ Each main character has complete transformation arc across 5 books?
- ✅ Motivations/fears/flaws established in Book 1?
- ✅ Arc stages progress logically book-to-book?
- ✅ Character decisions in each book align with arc stage?
- ✅ Transformation is earned through major events?
- ✅ Character knowledge: No acting on info they couldn't have at book level

**Does NOT validate (that's Scene-Level NPE):**
- ❌ Scene-by-scene behavioral palette consistency
- ❌ Dialogue voice consistency
- ❌ POV boundaries within scenes

**Scoring:**
- Each character arc: 0-100 points
- Deductions for: incomplete arcs, illogical jumps, unmotivated changes, knowledge violations

---

#### 2. Relationship Progression Logic (All Relationship Types)

**Validates:**
- ✅ Relationships (romantic, friendship, rivalry, mentor, family) progress logically?
- ✅ Trust level changes book-to-book are earned?
- ✅ Relationship milestones have bridge events?
  - Example: Enemies (Book 1) → Allies (Book 3) requires trust-building in Book 2
- ✅ Relationship changes align with character arcs?
- ✅ No illogical jumps (hate → love with no development)?

**Relationship Trust Levels:**
```
-10: Mortal enemies (want each other dead)
-8 to -6: Active enemies (working against each other)
-5 to -3: Antagonistic (dislike, argue)
-2 to 0: Neutral/strangers
+1 to +3: Acquaintances/colleagues
+4 to +6: Friends/allies
+7 to +9: Close friends/trusted allies
+10: Ultimate trust (would die for each other)

FOR ROMANCE:
+11 to +13: Romantic attraction acknowledged
+14 to +16: Relationship established
+17 to +19: Deep love, commitment
+20: Soulmate-level bond
```

**Validation:**
- Trust level can only change by ±3 points per book maximum
- Larger changes require major bridge events specified

---

#### 3. Trope Execution Validation (THE KEY NEW CATEGORY)

**Validates:**
- ✅ For each trope, are required scenes planned?
- ✅ Are required scenes placed in appropriate books?
- ✅ Do planned scenes meet validation criteria?
- ✅ Do multiple tropes complement or conflict?
- ✅ Is trope execution fresh (not generic)?

**Example Validation: "Enemies to Lovers"**

Required scenes (from MCP trope definition):
```json
{
  "opening": {
    "name": "Antagonistic First Meeting",
    "timing": "Book 1, early chapters",
    "validation_criteria": "Must establish justified antagonism"
  },
  "middle": {
    "name": "Forced Proximity / Working Together",
    "timing": "Book 1-2",
    "validation_criteria": "Must show grudging respect developing"
  },
  "closing": {
    "name": "Confession / Acceptance",
    "timing": "Book 2-3+",
    "validation_criteria": "Must feel earned through previous interactions"
  }
}
```

**Series Architect planned:**
```json
{
  "opening": {
    "book": 1,
    "chapter_range": "1-5",
    "scene_description": "Theodore and Vivienne meet at factory. He demands access to investigate sister's death. She refuses, calls him arrogant aristocrat. He accuses her of complicity."
  },
  "middle": {
    "book": 2,
    "chapter_range": "8-15",
    "scene_description": "Theodore must work with Vivienne to stop new murders. They grudgingly share information. Theodore sees Vivienne's engineering brilliance. Vivienne sees Theodore's dedication to victims."
  },
  "closing": {
    "book": 3,
    "chapter_range": "20-25",
    "scene_description": "After Theodore saves Vivienne from father, she confesses she killed his sister but shows Theodore why (sister was victim of worse fate). Theodore chooses to forgive."
  }
}
```

**Validation Result:**
- ✅ Opening scene: Present in Book 1, early chapters ✓
- ✅ Opening criteria met: Antagonism is justified (sister's death) ✓
- ✅ Middle scene: Present in Book 2, appropriate placement ✓
- ✅ Middle criteria met: Shows grudging respect through collaboration ✓
- ✅ Closing scene: Present in Book 3, appropriate timing ✓
- ✅ Closing criteria met: Earned through Books 1-2 development ✓

**Trope Execution Score: 95/100** (excellent)

---

#### 4. Plot Thread Coherence (Book Level)

**Validates:**
- ✅ Major plot threads introduced and resolved appropriately?
- ✅ Setup/payoff for major elements (book-level)?
  - Example: "Sealed factory wing" introduced Book 1 → Opened Book 4
  - NOT scene-level (that's Scene-Level NPE)
- ✅ Each book advances series arc while providing standalone satisfaction?
- ✅ Cliffhangers are organic, not manipulative?
- ✅ Mystery reveals are fair-play?

**Book-Level Setup/Payoff Registry:**
```json
[
  {
    "setup": {
      "element": "Sealed factory wing",
      "book": 1,
      "chapter_range": "5-8",
      "significance": "Victor forbids entry, says it's dangerous"
    },
    "payoff": {
      "book": 4,
      "chapter_range": "18-22",
      "revelation": "Contains failed experiments - people transformed into machines"
    },
    "validated": true
  },
  {
    "setup": {
      "element": "Vivienne's clockwork heart requires deaths",
      "book": 1,
      "chapter_range": "10-12"
    },
    "payoff": {
      "book": 5,
      "chapter_range": "23-25",
      "revelation": "Theodore destroys factory, freeing Vivienne even if it kills her"
    },
    "validated": true
  }
]
```

**Validation:**
- All setups in Books 1-3 must have payoff by Book 5
- Setups in Book 4 must pay off in Book 4-5
- No dangling threads

---

#### 5. Worldbuilding Consistency (Series Level)

**Validates:**
- ✅ World rules established clearly?
- ✅ Magic/tech system has limitations?
- ✅ Rules never violated across 5 books?
- ✅ World complexity appropriate for genre?

**Example World Rules:**
```json
{
  "magic_system": {
    "name": "Clockwork Heart Technology",
    "rules": [
      "Clockwork hearts require victim's life force to function",
      "Transformation is irreversible",
      "Recipients gain mechanical strength but lose emotional capacity",
      "Only Victor Ashford knows the full process"
    ],
    "limitations": [
      "Cannot create life, only sustain transformed life",
      "Requires ongoing 'feeding' - one death per month",
      "Recipients feel constant cold, cannot feel warmth"
    ]
  },
  "violations_check": [
    {
      "book": 3,
      "potential_violation": "Vivienne feels warmth when touching Theodore",
      "resolution": "Established as psychological (wanting to feel), not physical",
      "validated": true
    }
  ]
}
```

---

#### 6. Stakes Escalation Logic

**Validates:**
- ✅ Stakes escalate appropriately book-to-book?
- ✅ Escalation matches genre expectations (from genre pack)?
- ✅ Stakes remain personal and meaningful to characters?
- ✅ Escalation pattern is genre-appropriate?

**Genre-Specific Escalation:**

**Gothic Romance Horror:**
```
Book 1: Personal (sister's death, individual transformation)
Book 2: Interpersonal (relationship threatened, more victims)
Book 3: Community (London elite involved, conspiracy revealed)
Book 4: City-wide (factory threatens mass casualties)
Book 5: Existential (protagonist must sacrifice to save others)
```

**Urban Fantasy Police Procedural:**
```
Book 1: Single case (one victim, local investigation)
Book 2: Pattern emerges (serial killer, requires partner)
Book 3: Conspiracy (department corruption, larger forces)
Book 4: City-wide threat (magical catastrophe imminent)
Book 5: World-changing (reveals supernatural world to public)
```

**Military SF:**
```
Book 1: Squad-level (small unit survival)
Book 2: Battalion-level (larger tactical engagement)
Book 3: Strategic (planet-wide implications)
Book 4: Sector-wide (multiple systems at risk)
Book 5: Galactic (species survival at stake)
```

**Validation:**
- Check escalation against genre pack expectations
- Ensure stakes remain personal (not just abstract)
- Each book meaningfully raises threat level

---

#### 7. Information Economy (Series Level)

**Validates:**
- ✅ Secrets/mysteries distributed across books appropriately?
- ✅ Revelation timing creates optimal tension?
- ✅ Fair-play clues for readers?
- ✅ No revelations feel arbitrary?

**Information Cascade:**
```json
{
  "central_mystery": "Why does Vivienne's clockwork heart require deaths?",
  "revelation_cascade": [
    {
      "book": 1,
      "reveal": "Clockwork heart requires deaths (WHAT)",
      "fair_play_clues": ["Victims found near factory", "Vivienne's guilt"]
    },
    {
      "book": 2,
      "reveal": "Victor created the heart to save Vivienne (WHO)",
      "fair_play_clues": ["Victor's workshop access", "Vivienne's relationship with father"]
    },
    {
      "book": 3,
      "reveal": "Process requires sister's willing sacrifice (HOW)",
      "fair_play_clues": ["Amelia's journal entries", "Vivienne's grief"]
    },
    {
      "book": 4,
      "reveal": "Victor plans mass production for London elite (WHY LARGER)",
      "fair_play_clues": ["Elite society meetings", "Factory expansion"]
    },
    {
      "book": 5,
      "reveal": "Victor seeks mechanical immortality for himself (TRUE MOTIVE)",
      "fair_play_clues": ["Victor's illness", "Sealed wing experiments"]
    }
  ],
  "validated": true
}
```

---

### Series-Level NPE Scoring

**Overall Score: 0-100**

**Category Weights:**
- Character Arc Logic: 20%
- Relationship Progression: 15%
- Trope Execution: 20%
- Plot Thread Coherence: 15%
- Worldbuilding Consistency: 10%
- Stakes Escalation: 10%
- Information Economy: 10%

**Score Interpretation:**
- **90-100:** Exceptional series structure, ready for writing team
- **80-89:** Strong structure, minor refinements needed
- **70-79:** Good foundation, some structural issues to address
- **60-69:** Moderate issues, requires revision before proceeding
- **Below 60:** Significant structural problems, major revision required

**Minimum Threshold: 80** to proceed to Writing Team review

---

## Part 3: Scene-Level NPE Validator (Existing)

**When Used:** During writing execution (Phase 10), after Writing Team has planned chapters and scenes

**What It Validates:**
- Dialogue voice consistency
- POV boundaries and discipline
- Scene architecture (Intention → Obstacle → Consequence)
- Pacing at scene level
- Sensory detail and atmosphere
- Character behavioral palette adherence (V1-V4)
- Subtext and tension beats

**Uses:** The existing 357 NPE rules across 10 categories

**Scope:** Individual scenes and chapters, not series structure

---

## Part 4: Updated Workflow

### Complete Multi-Layer Validation Workflow

```
Phase 1: Market Research (Market Research Agent)
  ├─► Research trending tropes
  ├─► For each trope: Research required scenes, reader expectations, comp titles
  ├─► Store tropes in MCP: series-planning-server.store_trope()
  └─► Output: Market research report + trope catalog

Phase 2: Genre Pack Selection
  └─► Load genre-specific rules, beat sheets, templates, NPE rules

Phase 3: Series Architect (Series Architect Agent) - BIG ROCKS
  ├─► Load tropes from MCP: series-planning-server.get_trending_tropes()
  ├─► Plan worldbuilding (magic system, world rules)
  ├─► Plan character arcs (motivations, fears, flaws)
  ├─► Plan relationships (all types, with trust level progression)
  ├─► Plan 5-book plot threads (major setup/payoff)
  ├─► Plan trope execution (where required scenes will occur)
  ├─► Record trope usage: series-planning-server.record_trope_usage()
  └─► Output: Book-level structure (NOT chapter-level)

Phase 4: SERIES-LEVEL NPE VALIDATION (NEW)
  ├─► Validate character arc logic
  ├─► Validate relationship progression (trust levels)
  ├─► Validate trope execution (required scenes present?)
  ├─► Validate plot thread coherence (setup/payoff)
  ├─► Validate worldbuilding consistency
  ├─► Validate stakes escalation (genre-appropriate)
  ├─► Validate information economy (revelation timing)
  ├─► Score: 0-100, must be ≥80 to proceed
  ├─► Store validation: series-planning-server.store_npe_validation()
  └─► Output: Series-Level NPE Report with violations and fixes

Phase 5: Commercial Validation (Commercial Validator Agent)
  └─► Uses Series-Level NPE score as input

Phase 6: Writing Team Review & Refinement (Miranda + Agents)
  ├─► Review series structure
  ├─► Refine character arcs, plot threads, trope execution
  └─► Output: Refined series plan with Writing Team notes

Phase 7: User Review & Approval
  └─► User approves OR requests revisions

>>> MCP DATABASE COMMIT <<<

Phase 8: MCP Database Commit
  └─► Store approved series structure, character arcs, trope usage, NPE validation

>>> WRITING TEAM TAKES OVER <<<

Phase 9: Writing Team Plans Chapters (Miranda + Bailey + Agents)
  └─► Expand book structure to chapter-by-chapter plans (SMALL ROCKS)

Phase 10: SCENE-LEVEL NPE VALIDATION (Existing validator)
  ├─► Validates scene-by-scene during writing
  ├─► Uses 357 detailed NPE rules
  └─► Catches dialogue, POV, pacing, behavioral palette issues

Phase 11: Writing Execution
  └─► Bailey writes scenes, Tessa validates continuity, team refines
```

---

## Part 5: Agent Updates Required

### 1. Market Research Agent - ADD Trope Research

**New Responsibilities:**
- Research each trending trope deeply
- Identify required scenes (opening, middle, closing)
- Find comp title examples of trope execution
- Determine reader expectations for trope
- Store in MCP: `series-planning-server.store_trope()`

**New Output Section:**
```markdown
## TROPE CATALOG

### 1. Enemies to Lovers
**Popularity:** 9.2/10 (Hot)
**Category:** Relationship
**Description:** Characters begin as antagonists, develop into romantic partners

**Required Scenes:**
- Opening: Antagonistic first meeting (Book 1, early)
  - Must establish justified conflict
  - Examples: Pride & Prejudice (Darcy's insult), You've Got Mail (business rivals)

- Middle: Forced proximity / Working together (Book 1-2)
  - Circumstances force cooperation
  - Grudging respect develops
  - Examples: The Hating Game (sharing office), A Court of Thorns and Roses (Under the Mountain)

- Closing: Confession / Acceptance (Book 2-3+)
  - Characters acknowledge changed feelings
  - Must feel earned through prior development
  - Examples: Pride & Prejudice (second proposal), The Cruel Prince (crown scene)

**Reader Expectations:**
- Justified initial antagonism (not petty)
- On-page relationship development (no time skips)
- Banter/verbal sparring (witty, not mean)
- Gradual softening (no sudden personality changes)

**Common Pitfalls:**
- Antagonism feels forced or petty
- Characters fall in love too quickly
- Missing bridge development (hate → love with no middle)
- Confession happens off-page

**Comp Titles:** Pride & Prejudice, You've Got Mail, The Hating Game, A Court of Thorns and Roses

**Stored in MCP:** ✅ `trope_id: uuid-1234`
```

### 2. Series Architect Agent - MAJOR REWRITE

**Changes:**
- ❌ Remove hardcoded romance sections
- ✅ Load tropes from MCP based on market research
- ✅ Load genre pack for genre-specific patterns
- ✅ Plan trope required scenes and store usage in MCP
- ✅ Focus on book-level detail (NOT chapter-level)
- ✅ Plan character arcs with motivations/fears/flaws
- ✅ Plan relationship progressions (all types) with trust levels
- ✅ Plan worldbuilding with explicit rules and limitations

**New Output Structure:**
```markdown
# SERIES ARCHITECTURE

## WORLDBUILDING
- Magic/tech system rules
- World limitations
- Consistency requirements

## CHARACTER ARCS (5 Books)
- Protagonist: Motivation, Fear, Flaw, Transformation
- Deuteragonist: Same structure
- Antagonist: Same structure

## RELATIONSHIP PROGRESSIONS
- Relationship Type: (Romantic | Friendship | Rivalry | Mentor | Family)
- Trust Level Progression: Book 1 (-5) → Book 2 (-2) → Book 3 (+3) → Book 4 (+7) → Book 5 (+10)
- Bridge Events: What earns each trust level change

## TROPE EXECUTION
- Trope Name: Enemies to Lovers
- Required Scenes Planned:
  - Opening: Book 1, Ch 1-5 [description]
  - Middle: Book 2, Ch 8-12 [description]
  - Closing: Book 3, Ch 20-25 [description]

## 5-BOOK STRUCTURE
[Book-level summaries, NOT chapter breakdowns]

## BOOK-LEVEL SETUP/PAYOFF REGISTRY
[Major elements only]
```

### 3. NEW: Series-Level NPE Validator Agent

**Create:** `.claude/agents/npe-series-validator-agent.md`

**Responsibilities:**
- Validate 7 categories at series/book level
- Load trope required scenes from MCP
- Validate trope execution
- Score 0-100, minimum 80 to proceed
- Generate violation report with fixes

**Tools:**
- Read (genre pack NPE rules)
- MCP queries (trope definitions, series structure)
- Write (validation report)

**Autonomy:** 8/10 (high confidence in validation logic)

---

## Part 6: Benefits of Multi-Layer Validation

### Early Detection (Series-Level NPE)
✅ Catches structural issues before writing begins
✅ Prevents wasted effort on flawed foundation
✅ Validates "big rocks" are solid

### Quality Assurance (Scene-Level NPE)
✅ Catches detail issues during writing
✅ Ensures dialogue voice, POV, pacing consistency
✅ Validates "sand" is properly placed

### Marketing Intelligence (Trope MCP)
✅ Track which tropes were used in which series
✅ Analyze trope popularity trends over time
✅ Generate marketing copy from trope usage
✅ Query: "Show me all series using 'Enemies to Lovers'"

### Reusability
✅ Trope research benefits all future series
✅ Required scenes guide Series Architect
✅ Market Research Agent builds trope library over time

---

## Next Steps

1. **User Decision:** Approve this design?
2. **Build Series-Level NPE Validator Agent**
3. **Update Market Research Agent** for trope research
4. **Update Series Architect Agent** to be genre-agnostic
5. **Add MCP schema** to series-planning-server
6. **Test multi-layer validation** with complete workflow

---

## Summary

**Big Rocks First:**
- Series Architect plans structure (worldbuilding, arcs, relationships, tropes)
- Series-Level NPE validates structure is solid
- Writing Team adds detail (chapters, scenes)
- Scene-Level NPE validates detail quality

**Tropes as Guideposts:**
- Market Research identifies trending tropes + required scenes
- Series Architect plans where required scenes occur
- Series-Level NPE validates required scenes are present
- This ensures trope execution meets reader expectations

**Marketing Intelligence:**
- MCP tracks trope usage across series
- Can query: "Which series use 'Found Family'?"
- Can analyze: "Which tropes convert best?"
- Can market: "For fans of 'Enemies to Lovers', try Series X"

**Result:** Stronger stories validated at appropriate detail levels throughout the process.
