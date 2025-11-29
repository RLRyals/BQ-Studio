# Market-Driven Series Production System (MDSPS)
**Automated Genre Research → Series Planning → Execution Pipeline**

**Version:** 1.0
**Created:** 2025-11-23
**Status:** Design Phase

---

## System Overview

The Market-Driven Series Production System (MDSPS) is an end-to-end pipeline that transforms a raw story idea into a commercially viable 5-book series, fully planned and ready for execution by the AI Writing Team.

**Input:** Story idea (concept, character, world, or trope)
**Output:** Complete 5-book series plan optimized for market success

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: INTAKE & GENRE IDENTIFICATION                             │
│  ─────────────────────────────────────────────────────────────────  │
│  User Input: Story Idea                                             │
│         ↓                                                            │
│  Genre Identification Agent                                         │
│  • Analyzes idea for genre signals                                  │
│  • Identifies primary genre + subgenre                              │
│  • Checks for existing genre pack                                   │
│         ↓                                                            │
│  Output: Genre classification, genre pack selection                 │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 2: MARKET RESEARCH & TREND ANALYSIS                          │
│  ─────────────────────────────────────────────────────────────────  │
│  Market Research Agent                                              │
│  • Web search: current trends in genre (2024-2025)                  │
│  • Identify top-selling books in genre                              │
│  • Extract common tropes, beats, reader expectations                │
│  • Analyze comp titles (what's working now)                         │
│  • Identify market gaps (opportunities)                             │
│         ↓                                                            │
│  Commercial Viability Validator                                     │
│  • Check if idea fits market demand                                 │
│  • Suggest modifications for commercial appeal                      │
│  • Identify USP (Unique Selling Proposition)                        │
│         ↓                                                            │
│  Output: Market research report → stored in MCP                     │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3: GENRE PACK SELECTION/CREATION                             │
│  ─────────────────────────────────────────────────────────────────  │
│  Genre Pack Manager                                                 │
│  • Check if genre pack exists for identified genre                  │
│  • If exists: Load beat sheets, templates, NPE rules                │
│  • If not exists: Create minimal genre pack from market research    │
│         ↓                                                            │
│  Beat Sheet Selector                                                │
│  • Choose beat sheet from genre pack based on market research       │
│  • Or: Synthesize custom beat sheet from comp title patterns        │
│         ↓                                                            │
│  Output: Genre pack loaded, beat sheet selected                     │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 4: SERIES ARCHITECTURE (5-BOOK STRUCTURE)                    │
│  ─────────────────────────────────────────────────────────────────  │
│  Series Architect Agent (NEW)                                       │
│  • Applies commercial series principles:                            │
│    - Series escalation pattern (stakes rise book 1 → 5)             │
│    - Reader hooks (cliffhangers, unresolved threads)                │
│    - Standalone satisfaction + serial momentum                      │
│    - Character arc distribution across 5 books                      │
│  • Creates series bible:                                            │
│    - Overarching plot (series-level conflict)                       │
│    - World-building (rules, magic, setting)                         │
│    - Recurring characters (who appears when)                        │
│    - Romance progression (if applicable)                            │
│         ↓                                                            │
│  5-Book Outline Generator                                           │
│  • Book 1: Hook readers, establish world, introduce series conflict │
│  • Book 2: Deepen relationships, expand world, escalate stakes      │
│  • Book 3: Midpoint crisis, major revelations, test characters      │
│  • Book 4: Darkest hour, highest stakes, prepare for finale         │
│  • Book 5: Resolution, payoff, series climax, satisfying ending     │
│         ↓                                                            │
│  Market Alignment Checker                                           │
│  • Validate series structure against market research                │
│  • Ensure tropes appear in correct distribution                     │
│  • Check pacing matches genre expectations                          │
│         ↓                                                            │
│  Output: 5-book series structure → series-planning-server           │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 5: BOOK-LEVEL PLANNING (FOR EACH OF 5 BOOKS)                 │
│  ─────────────────────────────────────────────────────────────────  │
│  For Book 1 through Book 5:                                         │
│         ↓                                                            │
│  Book Planning Agent (Enhanced with Market Focus)                   │
│  • Apply selected beat sheet to this specific book                  │
│  • Character arcs for this book (based on series-wide arcs)         │
│  • Subplot weaving (series threads + book-specific)                 │
│  • Trope execution checklist (ensure market expectations met)       │
│  • Romance beats (if applicable)                                    │
│  • Cliffhanger/hook for next book (except Book 5)                   │
│         ↓                                                            │
│  NPE Pre-Validation                                                 │
│  • Check beat structure against NPE rules                           │
│  • Predict potential issues before writing                          │
│  • Validate character logic, pacing, stakes escalation              │
│         ↓                                                            │
│  Chapter Outline Generator                                          │
│  • Break beats into chapter-level outlines (20-30 chapters)         │
│  • Scene-level goals and conflicts                                  │
│  • Character knowledge tracking initialized                         │
│         ↓                                                            │
│  Output: Book plan with chapter outlines → book-planning-server     │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 6: COMMERCIAL QUALITY VALIDATION                             │
│  ─────────────────────────────────────────────────────────────────  │
│  Commercial Validator Agent (NEW)                                   │
│  • Market fit score (does this match what's selling?)               │
│  • Trope execution score (are expected tropes present and done well)│
│  • Series structure score (proper escalation, hooks, pacing)        │
│  • Unique angle score (does it stand out enough?)                   │
│  • Reader satisfaction prediction (will this satisfy genre readers?) │
│         ↓                                                            │
│  NPE + Commercial NPE Validation                                    │
│  • Standard NPE: character logic, pacing, dialogue, etc.            │
│  • Commercial NPE: market expectations, genre requirements          │
│         ↓                                                            │
│  Revision Recommendations                                           │
│  • If scores low: specific suggestions to improve commercial appeal │
│  • If scores high: approve for execution phase                      │
│         ↓                                                            │
│  Output: Validation report → review-server                          │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 7: HANDOFF TO WRITING TEAM (EXECUTION)                       │
│  ─────────────────────────────────────────────────────────────────  │
│  User Decision Point: Approve series plan?                          │
│         ↓ (if approved)                                             │
│  Writing Team Execution (Existing System)                           │
│  • Chapter planning skill (expand chapter outlines)                 │
│  • Scene writing skill + Bailey (write prose)                       │
│  • Review QA skill + Tessa (validate continuity)                    │
│  • Edna (pacing analysis, market appeal)                            │
│  • Miranda (NPE compliance, final approval)                         │
│         ↓                                                            │
│  Output: Completed 5-book series, ready for publication             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## New Components Required

### 1. Market Research Agent

**File:** `.claude/agents/market-researcher.md`

**Purpose:** Analyze current market trends for a genre and extract commercially viable patterns

**Tools:**
- WebSearch (for trend analysis)
- WebFetch (for comp title analysis)
- Read, Write, Edit (for report generation)
- Grep, Glob (for genre pack searching)

**Capabilities:**
- Search Amazon bestseller lists by genre
- Analyze Goodreads reviews for reader expectations
- Identify trending tropes (e.g., "fated mates" spiking in romantasy)
- Extract beat patterns from successful comp titles
- Identify market gaps (underserved niches)

**Autonomy:** 7/10 (can research independently, asks for direction on ambiguous genres)

**Output:**
- Market Research Report (stored in series-planning-server)
- List of comp titles with analysis
- Trending tropes ranked by frequency
- Reader expectation checklist
- Commercial viability score for original idea

---

### 2. Series Architect Agent

**File:** `.claude/agents/series-architect.md`

**Purpose:** Design commercially viable 5-book series structures with proper escalation, hooks, and market alignment

**Tools:**
- Read, Write, Edit (for series bible creation)
- Skill (invoke series-planning skill)
- Task (coordinate with other agents)
- Grep, Glob (access genre packs and beat sheets)

**Capabilities:**
- Apply series escalation principles (book 1 → 5)
- Create overarching series plot that sustains 5 books
- Distribute character arcs across series
- Design cliffhangers and reader hooks
- Balance standalone satisfaction with serial momentum
- Integrate market research into series structure

**Autonomy:** 6/10 (proposes structure, requires user approval for major decisions)

**Output:**
- Series Bible (overarching plot, world, characters)
- 5-book structure outline
- Series escalation map (stakes, revelations, character growth by book)
- Reader hook placement guide
- Trope distribution across 5 books

---

### 3. Commercial Validator Agent

**File:** `.claude/agents/commercial-validator.md`

**Purpose:** Validate series plans against market expectations and commercial viability standards

**Tools:**
- Read (access series plans, market research)
- Skill (invoke review-qa skill for validation)
- Task (coordinate validation checks)

**Capabilities:**
- Score market fit (1-10 scale)
- Validate trope execution against reader expectations
- Check series structure (proper escalation, pacing, hooks)
- Identify commercial weaknesses
- Suggest improvements for market appeal

**Autonomy:** 8/10 (can run validations independently, reports results)

**Output:**
- Commercial Viability Scorecard
- Market Fit Analysis
- Trope Execution Report
- Revision Recommendations
- Competitive Positioning Assessment

---

### 4. Market-Driven Planning Skill

**File:** `.claude/skills/market-driven-planning-skill.md`

**Purpose:** Orchestrate the complete pipeline from idea → market research → 5-book series plan

**MCPs Used:**
- author-server (author preferences, brand)
- series-planning-server (series structure, market research)
- book-planning-server (individual book plans)
- character-planning-server (character arcs)

**Workflow:**
1. **Intake:** Gather user's story idea and genre hint
2. **Genre Identification:** Classify genre, select genre pack
3. **Market Research:** Invoke Market Research Agent
4. **Series Architecture:** Invoke Series Architect Agent
5. **Book Planning:** For each of 5 books, create detailed plan
6. **Commercial Validation:** Invoke Commercial Validator Agent
7. **User Approval:** Present plan, get sign-off
8. **Handoff:** Prepare for Writing Team execution

**Session Management:**
- Auto-save progress at each phase
- Resume capability if process interrupted
- ID caching for all created entities

---

### 5. Commercial NPE Physics Rules

**Files:**
- `.claude/genre-packs/[genre]/npe-physics/commercial-viability.json`
- `.claude/genre-packs/baseline/npe-physics/commercial-viability.json`

**Purpose:** Validate series plans against commercial standards, not just narrative quality

**Rules:**

**Market Alignment:**
- Trope presence: Expected tropes for genre appear and are executed well
- Pacing: Matches genre norms (romance = 25% book, thriller = 10% book, etc.)
- Heat/violence: Matches genre expectations
- Word count: Within commercial range for genre

**Series Structure:**
- Book 1 hooks readers effectively (first 3 chapters establish premise)
- Escalation: Each book raises stakes meaningfully
- Reader hooks: Cliffhangers/unresolved threads keep readers buying
- Standalone satisfaction: Each book has arc completion despite series threads
- Payoff timing: Major reveals distributed to maintain interest

**Character Arc Economics:**
- Protagonist has meaningful growth each book
- Romance progression (if applicable) spans series appropriately
- Supporting cast appears across multiple books (reader attachment)
- Character deaths/departures timed for maximum impact

**Commercial Positioning:**
- Unique angle: Something fresh within familiar framework
- Comp title alignment: Similar enough to find audience, different enough to stand out
- Series title pattern: Consistent branding across 5 books
- Cover concept viability: Premise translates to marketable covers

---

## System Workflow (User Perspective)

### Step 1: Provide Story Idea

**User Input:**
```
"I want to write a series about a detective who can see ghosts and uses them to solve murders. Set in Victorian London."
```

**System Processing:**
- Genre Identification: Urban Fantasy Mystery (historical)
- Check genre packs: Urban Fantasy Police Procedural exists, adapt for historical

---

### Step 2: Market Research (Automated)

**Market Research Agent Output:**
```
MARKET RESEARCH REPORT
Genre: Urban Fantasy Mystery (Historical)
Research Date: 2025-11-23

TOP COMP TITLES (2024-2025):
1. "The Invisible Library" series - Genevieve Cogman
2. "A Dead Djinn in Cairo" - P. Djèlí Clark
3. "The Daughter of Doctor Moreau" - Silvia Moreno-Garcia

TRENDING TROPES:
1. Historical setting + magic system ⭐⭐⭐⭐⭐ (Very Hot)
2. Detective/investigator protagonist ⭐⭐⭐⭐⭐
3. Necromancy/death magic ⭐⭐⭐⭐
4. Forbidden romance (living/dead) ⭐⭐⭐
5. Class commentary via supernatural ⭐⭐⭐⭐

READER EXPECTATIONS:
✅ Atmospheric Victorian setting (fog, gas light, class divide)
✅ Mystery-of-the-book structure (case per book)
✅ Overarching series mystery (deeper conspiracy)
✅ Slow-burn romance subplot
✅ Morally gray protagonist
✅ 80-100K words per book

MARKET GAPS/OPPORTUNITIES:
💡 Few series feature ghost detectives specifically (most are mediums)
💡 Victorian ghost stories trending but undersupplied
💡 Readers want darker historical fantasy (not just cozy)

COMMERCIAL VIABILITY: 8.5/10
- High demand for historical UF
- Detective angle well-established (readers know what to expect)
- Ghost twist differentiates from other detective series
- Victorian setting is commercial gold right now

RECOMMENDATIONS:
1. Emphasize atmospheric Victorian setting
2. Include romance subplot (expected in this market)
3. Create a compelling overarching series mystery
4. Balance case-of-the-week with character development
5. Consider diversity angle (underrepresented in Victorian UF)
```

---

### Step 3: Series Architecture (Automated)

**Series Architect Agent Output:**
```
5-BOOK SERIES STRUCTURE
Series Title: "The Spectral Detective Chronicles"

SERIES PREMISE:
Detective Silas Grey can see and speak to ghosts—a gift (curse?) he's hidden from Scotland Yard. When a series of murders leaves victims whose ghosts don't know they're dead, Silas must navigate both the living and dead worlds to find a killer who's stealing souls.

OVERARCHING SERIES ARC:
Silas discovers the murders are connected to a centuries-old conspiracy involving a secret society that harvests souls for immortality. As he investigates, he uncovers his own family's involvement and must choose: stop the society and lose his connection to the dead (including his murdered sister), or join them and become the monster he's hunting.

BOOK-BY-BOOK STRUCTURE:

📘 BOOK 1: "Shades of Scotland Yard"
- Stakes: Solve a single murder case
- Character Arc: Silas accepts his gift, stops hiding
- Romance: Meet Eliza (medical examiner), antagonistic chemistry
- Series Thread: First hint of soul-stealing pattern
- Cliffhanger: Victim's ghost mentions "The Pale Brotherhood"
- Commercial Hook: Establishes detective + ghost mechanic, Victorian atmosphere

📘 BOOK 2: "The Pale Brotherhood"
- Stakes: Stop serial killer stealing souls
- Character Arc: Silas learns limitations of his power (some ghosts lie)
- Romance: Silas and Eliza forced partnership, growing trust
- Series Thread: Brotherhood is larger conspiracy, centuries old
- Cliffhanger: Silas's mentor is revealed as Brotherhood member
- Commercial Hook: Expands world, raises stakes, deepens mystery

📘 BOOK 3: "Betrayal and Bone"
- Stakes: Infiltrate Brotherhood, save Eliza from being next victim
- Character Arc: Silas confronts his sister's ghost (she's been lying to him)
- Romance: Silas and Eliza confess feelings, first kiss (then Eliza captured)
- Series Thread: Silas's grandfather founded the Brotherhood
- Cliffhanger: To save Eliza, Silas must join Brotherhood
- Commercial Hook: Midpoint crisis, darkest hour, major revelations

📘 BOOK 4: "Among the Dead"
- Stakes: Destroy Brotherhood from within without losing his soul
- Character Arc: Silas becomes what he hunts (morally gray choices)
- Romance: Eliza doesn't trust Silas, must rebuild relationship
- Series Thread: Brotherhood leader is Silas's "dead" grandfather (immortal)
- Cliffhanger: Silas steals soul to save Eliza (crosses line), grandfather offers him immortality
- Commercial Hook: Moral complexity, high action, relationship angst

📘 BOOK 5: "The Final Reckoning"
- Stakes: Stop grandfather's ascension ritual, save all stolen souls
- Character Arc: Silas chooses mortality and losing his sister over immortality
- Romance: Eliza and Silas together, she accepts what he is
- Series Thread: Resolve all threads, destroy Brotherhood
- Ending: Silas loses ability to see ghosts (except one: his sister appears one last time to say goodbye)
- Commercial Hook: Satisfying conclusion, bittersweet sacrifice, earned victory

SERIES ESCALATION MAP:
Book 1: Personal (one murder) → Book 2: Serial (multiple murders) → Book 3: Conspiracy (organization) → Book 4: Infiltration (betrayal, moral gray) → Book 5: Apocalyptic (all souls at stake)

ROMANCE PROGRESSION:
Book 1: Meet, antagonistic → Book 2: Forced partnership, respect → Book 3: Feelings confessed, first kiss → Book 4: Trust broken, angst → Book 5: Together, acceptance

COMMERCIAL ALIGNMENT:
✅ Historical Victorian setting (atmospheric, trending)
✅ Detective + supernatural (market-proven combination)
✅ Mystery per book + series arc (standalone + serial)
✅ Slow-burn romance (expected in this genre)
✅ Escalating stakes (proper series structure)
✅ Bittersweet ending (literary, satisfying)
✅ Morally gray protagonist (reader favorite)
```

---

### Step 4: Book-Level Planning (Automated, for each book)

**Book Planning Agent Output (Example: Book 1):**
```
BOOK 1: "Shades of Scotland Yard"
Word Count Target: 90,000 words
Chapters: 25
POV: First-person (Silas)
Timeline: 3 weeks (investigation + resolution)

BEAT SHEET APPLICATION (Investigation Structure from Urban Fantasy Genre Pack):

Beat 1: Discovery (Ch 1-3)
- Silas called to murder scene at Whitechapel warehouse
- Victim: Lord Ashford, throat slit, expensive pocket watch missing
- Silas sees victim's ghost, but ghost doesn't know he's dead (unusual)
- Partner Inspector Davies dismissive, thinks it's robbery gone wrong

Beat 2: First Lead (Ch 4-7)
- Silas interviews ghost (secretly), learns victim met someone at docks
- Meet Eliza Pemberton, medical examiner (rare female professional)
- Eliza's autopsy reveals victim died of exsanguination before throat cut (backward)
- Clash with Eliza (she's scientific, he relies on "intuition" = ghosts)
- First clue: Victim's blood drained completely, pocket watch had strange symbol

[... continues through all 9 investigation beats ...]

CHAPTER OUTLINES (Scene-Level):

Chapter 1: "The Body in Whitechapel"
- Scene 1: Silas woken at 3 AM, called to murder scene
  - Atmospheric opening: fog, gas lamps, Victorian London
  - Introduce Silas's ability (sees ghosts in the street, ignores them)
  - Arrive at warehouse, meet Inspector Davies
  - Body discovered: Lord Ashford, throat slit, positioned ritualistically
- Scene 2: Silas examines body while police secure scene
  - Ghost of Lord Ashford appears, confused
  - Silas must hide conversation (looks like he's talking to himself)
  - Ghost: "I was meeting someone... about the watch... why can't I remember?"
  - Silas realizes: ghost has memory gaps (never happened before)
- Scene 3: Return to Scotland Yard, report to Captain
  - Davies dismisses case as robbery (victim was wealthy, watch stolen)
  - Silas argues it's more (can't explain why without revealing ability)
  - Assigned to case despite Davies's skepticism
  - End with Silas visiting morgue to examine body again

Chapter 2: "The Medical Examiner"
[... continues for all 25 chapters ...]

TROPE EXECUTION CHECKLIST:
✅ Atmospheric Victorian setting (Ch 1, ongoing)
✅ Detective protagonist introduced (Ch 1)
✅ Ghost ability revealed to reader (Ch 1)
✅ Mystery established (Ch 1)
✅ Meet love interest (Ch 2)
✅ Antagonistic chemistry (Ch 2-5)
✅ Class commentary (Ch 3, Ch 7, Ch 12)
✅ Morally gray choices (Ch 15, Ch 20)
✅ Case resolution (Ch 23-24)
✅ Series hook (Ch 25: "The Pale Brotherhood" mention)

NPE PRE-VALIDATION:
Character Logic: 95% (Silas's behavior consistent with established wounds/abilities)
Pacing: 90% (Good mystery pacing, investigation beats well-distributed)
Information Economy: 88% (Clues revealed appropriately, fair-play mystery)
Stakes/Pressure: 85% (Stakes escalate from personal → citywide)

COMMERCIAL VIABILITY: 9/10
- Strong hook (Ch 1 establishes premise clearly)
- Market expectations met (Victorian, detective, ghost, romance subplot)
- Standalone resolution (murder solved) + series hook (Brotherhood teased)
- Character arc complete for this book (Silas accepts his gift)
```

---

### Step 5: Commercial Validation (Automated)

**Commercial Validator Agent Output:**
```
COMMERCIAL VIABILITY SCORECARD
Series: The Spectral Detective Chronicles (5 books)
Genre: Urban Fantasy Mystery (Historical)

MARKET FIT SCORE: 9.2/10 ⭐⭐⭐⭐⭐
✅ Genre: Historical Urban Fantasy (HIGH DEMAND in 2024-2025)
✅ Setting: Victorian London (COMMERCIAL GOLD, proven to sell)
✅ Protagonist: Detective + Supernatural ability (MARKET-PROVEN)
✅ Structure: Mystery-per-book + Series arc (EXPECTED, DELIVERS)
✅ Romance: Slow-burn subplot (EXPECTED, PRESENT)
✅ Unique Angle: Ghost detective (DIFFERENTIATED but familiar)

TROPE EXECUTION SCORE: 8.8/10 ⭐⭐⭐⭐
✅ Atmospheric Victorian setting (Excellent execution)
✅ Detective mystery structure (Proper investigation beats)
✅ Supernatural ability (Clear rules, limitations)
✅ Forbidden romance (Living/Dead themes present)
✅ Class commentary (Victorian society well-portrayed)
⚠️ Diversity angle: Could strengthen (consider Eliza's background)
✅ Morally gray protagonist (Well-developed)

SERIES STRUCTURE SCORE: 9.5/10 ⭐⭐⭐⭐⭐
✅ Escalation Pattern: Personal → Serial → Conspiracy → Infiltration → Apocalyptic (EXCELLENT)
✅ Reader Hooks: Each book has strong cliffhanger (Pale Brotherhood → Mentor betrayal → Join Brotherhood → Stolen soul)
✅ Standalone Satisfaction: Each book resolves case + character arc
✅ Series Arc Cohesion: Overarching plot (Brotherhood) spans all 5 books logically
✅ Character Growth: Silas transforms meaningfully across series
✅ Romance Progression: Slow-burn pacing appropriate for 5 books

UNIQUE ANGLE SCORE: 8.0/10 ⭐⭐⭐⭐
✅ Ghost detective (not just medium): FRESH
✅ Ghosts as witnesses with flawed memories: UNIQUE MECHANIC
✅ Soul-stealing villain: EMOTIONALLY RESONANT
⚠️ Victorian detective: FAMILIAR (but executed well)
✅ Sacrifice of ability for victory: LITERARY, SATISFYING
💡 Suggestion: Emphasize unique ghost mechanics in marketing

READER SATISFACTION PREDICTION: 9.0/10 ⭐⭐⭐⭐⭐
✅ Mystery fans: Cases are fair-play, logical, satisfying
✅ Romance fans: Slow-burn delivers, emotional payoff
✅ Urban Fantasy fans: Magic system consistent, interesting
✅ Historical fiction fans: Victorian setting authentic, atmospheric
✅ Series readers: Proper escalation, cliffhangers, payoff
✅ Ending: Bittersweet but earned (Silas loses ability, saves world)

COMPETITIVE POSITIONING:
SIMILAR TO (Comps):
- Rivers of London (detective + supernatural, London)
- The Invisible Library (Victorian-ish, mystery, romance)
- A Dead Djinn in Cairo (historical detective + supernatural)

DIFFERENT FROM (USP):
- Focus on ghosts specifically (not general magic)
- Ghost witnesses with flawed memories (unique mechanic)
- Soul-stealing antagonist (emotional stakes)
- Victorian London (specific to this era)

REVISION RECOMMENDATIONS:

🟢 STRENGTHS (Maintain These):
1. Victorian atmosphere is excellent—lean into this
2. Series escalation pattern is perfect
3. Character arcs are well-distributed
4. Mystery structure is solid

🟡 MINOR IMPROVEMENTS:
1. **Diversity:** Consider making Eliza from non-English background (Irish, Scottish, or immigrant background) to add dimension and increase representation
2. **Ghost Mechanics:** Add one more unique rule/limitation to ghost ability to further differentiate (e.g., ghosts fade after 7 days, creating time pressure)
3. **Series Title:** "The Spectral Detective Chronicles" is functional but generic. Consider: "The Grey Files" (Silas Grey + moral gray areas) or "The Deathspeaker Chronicles"

🔴 CRITICAL ISSUES: NONE

OVERALL COMMERCIAL VIABILITY: 9.0/10
RECOMMENDATION: ✅ APPROVE FOR EXECUTION

This series is highly commercial and should perform well in current market. Strong genre alignment, proper structure, unique enough to stand out. Recommend proceeding to writing phase.
```

---

### Step 6: User Approval

**System Presents:**
- Market Research Report
- 5-Book Series Structure
- Book 1 Detailed Plan (with sample chapters)
- Commercial Validation Scorecard

**User Reviews and Approves** (or requests revisions)

---

### Step 7: Writing Team Execution

Once approved, existing Writing Team takes over:
1. **Chapter Planning:** Expand each chapter outline into scene beats
2. **Scene Writing:** Bailey writes prose following genre pack style guides
3. **Continuity Review:** Tessa validates character knowledge, world consistency
4. **Pacing Analysis:** Edna ensures commercial pacing
5. **NPE Validation:** Miranda checks NPE compliance (90%+ threshold)
6. **Iteration:** Revise based on agent feedback until quality meets standards

**Result:** 5 completed books, ready for publication

---

## MCP Data Flow

```
User Idea
    ↓
[market-driven-planning-skill invoked]
    ↓
Market Research Report → series-planning-server
    ↓
Genre Pack Selection → (loaded from .claude/genre-packs/)
    ↓
Series Bible → series-planning-server
    ↓
Book 1 Plan → book-planning-server
Book 2 Plan → book-planning-server
Book 3 Plan → book-planning-server
Book 4 Plan → book-planning-server
Book 5 Plan → book-planning-server
    ↓
Character Arcs (Silas, Eliza, etc.) → character-planning-server
    ↓
Commercial Validation Report → review-server
    ↓
[User Approves]
    ↓
Chapter Outlines (Book 1, Ch 1-25) → chapter-planning-server
    ↓
Scenes (Book 1, Ch 1, Scene 1...) → scene-server
    ↓
Continuity Validation → core-continuity-server
    ↓
Quality Reports → review-server
Quality Metrics → reporting-server
```

---

## NPE Integration

### Standard NPE Rules (from genre packs)
- Character Logic
- Dialogue Physics
- Pacing Rules
- Scene Architecture
- POV Physics
- Information Economy
- Stakes & Pressure
- Plot Mechanics
- Offstage Narrative
- Transitions

### NEW: Commercial NPE Rules
- Market Alignment (tropes present, executed well)
- Series Structure (escalation, hooks, pacing)
- Character Arc Economics (growth distribution)
- Reader Satisfaction Metrics (payoff timing)
- Competitive Positioning (unique + familiar balance)

---

## Success Metrics

**System Success = Commercial Viability of Output**

**Measured By:**
1. **Market Fit Score:** Does series align with current trends? (Target: 8+/10)
2. **Trope Execution Score:** Are genre expectations met? (Target: 8+/10)
3. **Series Structure Score:** Proper escalation and hooks? (Target: 9+/10)
4. **Unique Angle Score:** Fresh enough to stand out? (Target: 7+/10)
5. **Reader Satisfaction Prediction:** Will genre readers love this? (Target: 8.5+/10)

**Overall Commercial Viability Target: 8.5+/10**

---

## Technical Implementation Plan

### Phase 1: Agent Creation
1. Create Market Research Agent (`market-researcher.md`)
2. Create Series Architect Agent (`series-architect.md`)
3. Create Commercial Validator Agent (`commercial-validator.md`)

### Phase 2: Skill Creation
1. Create Market-Driven Planning Skill (`market-driven-planning-skill.md`)
2. Integrate with existing series-planning-skill
3. Add market focus to book-planning-skill

### Phase 3: NPE Enhancement
1. Create Commercial NPE rules (`commercial-viability.json`)
2. Add to baseline genre pack
3. Create genre-specific commercial rules for existing packs

### Phase 4: Integration Testing
1. Test with example idea (ghost detective)
2. Validate MCP data flow
3. Test agent coordination
4. Verify NPE validation pipeline

### Phase 5: Documentation
1. Update architecture.md with MDSPS
2. Create user guide for market-driven workflow
3. Document agent responsibilities and coordination

---

## Usage Examples

### Example 1: High-Concept Idea
**Input:** "Librarians who fight reality-warping books in a multiverse library"

**System Output:**
- Genre: Urban Fantasy (Library Adventure subgenre)
- Market Research: "The Invisible Library" comp, trending multiverse concepts
- Series: 5-book arc about cataloging dangerous books, preventing reality collapse
- Commercial Score: 8.7/10

### Example 2: Character-Driven Idea
**Input:** "Disgraced chef opens restaurant for vampires in New Orleans"

**System Output:**
- Genre: Paranormal Romance (Culinary Romance subgenre)
- Market Research: "A Discovery of Witches" comp, food + romance trending
- Series: 5-book arc about supernatural community politics through food/hospitality
- Commercial Score: 9.1/10

### Example 3: World-Driven Idea
**Input:** "Steampunk city where social class is determined by quality of your clockwork heart"

**System Output:**
- Genre: Steampunk Dystopian Romance
- Market Research: "Red Queen" comp, class divide narratives trending
- Series: 5-book arc about revolution, heart transplants as metaphor for class mobility
- Commercial Score: 8.3/10

---

## Future Enhancements

**Version 2.0 Possibilities:**
- AI-generated cover concepts based on series plan
- Automatic blurb generation for each book
- Comp title deep analysis (extract exact beat patterns)
- Trend prediction (anticipate what will be hot in 12-18 months)
- Multi-genre hybrid optimization (find sweet spot between 2-3 genres)
- Author brand analysis (align series with author's existing work)

---

## Conclusion

The Market-Driven Series Production System transforms raw ideas into commercially viable 5-book series plans by:

1. ✅ **Research-Backed:** Uses real market data, not guesses
2. ✅ **Genre-Specific:** Applies appropriate beat sheets and expectations
3. ✅ **Commercially Optimized:** Validates against market standards
4. ✅ **Execution-Ready:** Produces detailed plans Writing Team can immediately use
5. ✅ **Quality-Assured:** NPE validation ensures narrative quality alongside commercial viability

**Result:** Series that satisfy genre readers, meet market expectations, and have the best chance of commercial success.

---

**Document Version:** 1.0
**Status:** Design Complete - Ready for Implementation
**Next Step:** Build agents and skills per technical implementation plan

