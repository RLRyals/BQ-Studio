---
name: market-driven-planning-skill
description: Market-driven series production system that transforms raw concepts into commercially viable 5-book series plans. Use when the user wants to take an idea through complete market-driven planning from trend research to validated series architecture. Triggers include phrases like "market-driven planning," "research and plan series," "commercial series development," or requests for complete concept-to-series workflows.
metadata:
  version: "1.0"
  phase: "pre-planning to validation"
  agents: ["market-research-agent", "series-architect-agent", "commercial-validator-agent"]
  genre: "genre-agnostic (uses genre packs)"
---

# Market-Driven Planning Skill

## Overview

A comprehensive workflow for transforming raw story ideas into commercially viable 5-book series plans optimized for current market trends. This skill orchestrates three specialized agents to perform market research, series architecture, and commercial validation in a structured pipeline.

**Purpose:** Ensure series concepts are positioned for maximum commercial success before significant writing resources are invested.

---

## System Architecture

### The 7-Phase Pipeline

```
Phase 1: Intake & Genre Identification (User + System)
    ↓
Phase 2: Market Research & Trend Analysis (Market Research Agent)
    ↓
Phase 3: Genre Pack Selection/Creation (System + User)
    ↓
Phase 4: Series Architecture (Series Architect Agent)
    ↓
Phase 5: Book-Level Planning (Series Architect Agent or Book Planning Skill)
    ↓
Phase 6: Commercial Quality Validation (Commercial Validator Agent)
    ↓
Phase 7: Handoff to Writing Team (Miranda Showrunner + AI Writing Team)
```

### Agent Coordination

**This skill orchestrates:**
1. **Market Research Agent** - Trend analysis, comp titles, viability scoring
2. **Series Architect Agent** - 5-book structure, character arcs, escalation patterns
3. **Commercial Validator Agent** - Final validation, risk assessment, go/no-go decision

---

## Phase-by-Phase Workflow

### PHASE 1: Intake & Genre Identification

**Objective:** Capture concept and confirm genre positioning

**User Provides:**
- Raw concept idea (1-3 sentences)
- Genre specification (if known)
- Any specific requirements or constraints

**System Activities:**
1. Analyze concept elements
2. Identify genre and subgenre
3. Confirm positioning with user
4. Set content levels (heat, violence, darkness)

**Output:**
- Confirmed genre classification
- Target audience definition
- Content level specifications
- Initial concept refinement

**Example:**
```
User Input: "What if a vampire detective has to solve her own murder
because she doesn't remember being turned?"

System: Analyzing concept...
- Primary Genre: Urban Fantasy
- Subgenre: Paranormal Mystery / Detective Fiction
- Vampire protagonist (supernatural detective)
- Murder mystery + memory loss hook
- Likely series potential (ongoing investigations)

Confirmed Genre: Urban Fantasy Police Procedural with Paranormal Romance potential

Proceeding to Phase 2: Market Research
```

---

### PHASE 2: Market Research & Trend Analysis

**Objective:** Conduct comprehensive market analysis to inform series planning

**Agent Invoked:** Market Research Agent

**Activities:**
1. Web search for genre trends (2024-2025)
2. Identify 5-7 comp titles with performance data
3. Research trending tropes (BookTok, Goodreads, Amazon)
4. Analyze reader expectations
5. Identify market gaps and opportunities
6. Score initial commercial viability (0-10)

**Deliverables:**
- Market Research Report with:
  - Genre classification
  - Comp title analysis
  - Trending tropes (ranked by heat)
  - Reader expectations
  - Market gap opportunities
  - Initial viability score
  - Recommendations for series structure

**Time Estimate:** 30-40 minutes (with web research)

**Agent Workflow:**
```
**[MARKET RESEARCH AGENT]:** Beginning market research for "[concept]"

[Conducts web searches]

**[MARKET RESEARCH AGENT]:** Market research complete.

**Commercial Viability: [X]/10**

Key Findings:
- [Trending elements identified]
- [Comp titles found]
- [Market gaps identified]
- [Recommendations]

**May I save market research report?**
[User approves]

**HANDOFF TO: PHASE 3 (Genre Pack Selection)**
```

---

### PHASE 3: Genre Pack Selection/Creation

**Objective:** Select or create appropriate genre pack for series

**System Activities:**
1. Review existing genre packs in `.claude/genre-packs/`
2. Assess match with concept genre
3. If perfect match: Select existing genre pack
4. If partial match: Adapt existing genre pack
5. If no match: Create new genre pack from template

**Genre Pack Components:**
- Beat sheets (story structure frameworks)
- Style guides (atmosphere, prose, dialogue)
- Templates (character, setting, plot)
- Manifest (metadata and resource catalog)
- NPE rules (genre-specific validation)

**Decision Tree:**
```
Does perfect genre pack exist?
  YES → Select genre pack
  NO ↓
Does close genre pack exist?
  YES → Adapt existing genre pack
  NO ↓
Create new genre pack from template
```

**Output:**
- Selected or created genre pack
- Beat sheet identification for series
- Style guide references
- Template resources

**Example:**
```
Market Research identified: Steampunk Gothic Horror Romance

System: Checking for existing genre pack...
Found: `.claude/genre-packs/gothic-romance-horror/`

Genre Pack Contents:
- Beat Sheets: Gothic Romance Structure (15 beats), Steampunk Mystery Romance (12 beats)
- Style Guides: Three-Layer Atmosphere Technique
- Templates: Character, setting templates
- Manifest: steampunk-gothic-hr-v1

✅ Genre pack match found. Proceeding to Phase 4.
```

---

### PHASE 4: Series Architecture

**Objective:** Design complete 5-book series structure with proper escalation

**Agent Invoked:** Series Architect Agent

**Input from Previous Phases:**
- Market research report (trending elements, comp titles)
- Genre pack (beat sheets, structure frameworks)
- Concept refinement

**Activities:**
1. Design series premise and high concept
2. Plan character arcs across 5 books
3. Create 5-book escalation pattern (personal → apocalyptic)
4. Design cliffhangers and series hooks
5. Balance standalone vs. serial elements
6. Map trope execution across series
7. Score series architecture (0-10)

**Deliverables:**
- Series Architecture Document with:
  - Series premise and high concept
  - Complete 5-book structure
  - Character arcs (3 main characters) across all books
  - Escalation map
  - Romance/relationship progression
  - Series branding (titles, tagline)
  - Trope execution checklist
  - NPE pre-validation
  - Series architecture score

**Time Estimate:** 45-60 minutes

**Agent Workflow:**
```
**[SERIES ARCHITECT AGENT]:** Received market research. Beginning
series architecture for "[concept]."

Market insights inform structure:
- [Key trending elements to incorporate]
- [Comp title escalation patterns to study]
- [Reader expectations to meet]

Designing 5-book escalation pattern...

**[SERIES ARCHITECT AGENT]:** Series architecture complete.

"[Series Title]" - 5 Books
- Book 1: Personal stakes
- Book 2: Expanded stakes
- Book 3: Conspiracy stakes
- Book 4: City-wide stakes
- Book 5: Apocalyptic stakes

Character arcs span all 5 books.
**Series Architecture Score: [X]/10**

**May I save series architecture document?**
[User approves]

**HANDOFF TO: PHASE 5 (Book-Level Planning)**
```

---

### PHASE 5: Book-Level Planning

**Objective:** Create detailed plan for Book 1 (and optionally Books 2-5)

**Options:**
- **Option A:** Series Architect Agent creates Book 1 outline
- **Option B:** Invoke existing book-planning-skill for detailed chapter planning
- **Option C:** Proceed to validation without detailed book planning

**Recommended:** Option A (Book 1 outline) for validation purposes

**Activities (if Book 1 planned):**
1. Apply genre pack beat sheet to Book 1
2. Create 25-chapter outline
3. Plan character arcs for Book 1
4. Design key scenes and beats
5. Ensure Book 1 establishes series hook

**Deliverable (if Book 1 planned):**
- Book 1 Detailed Plan with:
  - Beat-by-beat structure
  - Chapter outline (25 chapters)
  - Word count target
  - POV structure
  - Character development for Book 1
  - Scene descriptions
  - Book 1 score

**Time Estimate:** 60-90 minutes (if detailed Book 1 planning)

**Typical Flow:**
```
**[SERIES ARCHITECT AGENT]:** Series architecture approved.

Should I create detailed Book 1 plan or proceed to validation?

User: [Create Book 1 plan / Skip to validation]

If Book 1 plan:
**[SERIES ARCHITECT AGENT]:** Applying Gothic Romance beat sheet
(15 beats) to Book 1 structure...

Book 1 planning complete. 25 chapters, 95K words, beat-by-beat.
**Book 1 Score: [X]/10**

**HANDOFF TO: PHASE 6 (Commercial Validation)**
```

---

### PHASE 6: Commercial Quality Validation

**Objective:** Final validation of commercial viability before writing begins

**Agent Invoked:** Commercial Validator Agent

**Input from Previous Phases:**
- Market research report
- Series architecture document
- Book 1 plan (if created)
- Genre pack specifications

**Activities:**
1. Score Market Fit (25% weight)
2. Score Trope Execution (20% weight)
3. Score Series Structure (25% weight)
4. Score Unique Angle (15% weight)
5. Score Reader Satisfaction (15% weight)
6. Calculate weighted overall viability
7. Assess risks (low/medium/critical)
8. Provide go/no-go recommendation
9. Estimate commercial performance

**Deliverables:**
- Commercial Validation Report with:
  - 5-category detailed scoring
  - Overall commercial viability (0-10)
  - Risk assessment
  - Revision recommendations (if needed)
  - Marketability assessment
  - Final verdict (Strongly Approve / Approve / Revise / Reject)
  - Expected performance estimates

**Time Estimate:** 30-40 minutes

**Agent Workflow:**
```
**[COMMERCIAL VALIDATOR AGENT]:** Beginning commercial validation
for "[Series Title]."

Reading all planning documents...

**[COMMERCIAL VALIDATOR AGENT]:** Validation complete.

**OVERALL COMMERCIAL VIABILITY: [X]/10** ⭐⭐⭐⭐⭐

**Category Breakdown:**
- Market Fit: [X]/10
- Trope Execution: [X]/10
- Series Structure: [X]/10
- Unique Angle: [X]/10
- Reader Satisfaction: [X]/10

**Risks:** [Summary]

**RECOMMENDATION:** ✅ [STRONGLY APPROVED / APPROVED / REVISE / REJECT]

[Detailed justification]

**May I save commercial validation report?**
[User approves]

**HANDOFF TO: PHASE 7 (Writing Team) or REVISION**
```

---

### PHASE 7: Handoff to Writing Team

**Objective:** Transfer validated series plan to writing execution team

**If Approved (Score 7.0+):**

**Handoff Package Includes:**
- Market research report
- Series architecture document
- Book 1 plan (if created)
- Commercial validation report
- Genre pack specifications
- Identified trending elements to incorporate
- Risks to monitor during writing

**Next Steps:**
1. Invoke Miranda (Showrunner) to coordinate writing team
2. Begin detailed chapter planning for Book 1 (if not done)
3. Invoke Bailey (First Drafter) for scene writing
4. Apply NPE validation at each writing stage
5. Use Tessa (Continuity) for consistency checking
6. Miranda makes final chapter approval decisions

**Handoff Message:**
```
**[COMMERCIAL VALIDATOR AGENT]:** Series validated and approved.

**Handoff Package Complete:**
✅ Market Research: 9.0/10 viability
✅ Series Architecture: 9.3/10 structure
✅ Book 1 Plan: 9.2/10 (if created)
✅ Commercial Validation: 9.3/10 overall

**APPROVED FOR WRITING EXECUTION**

**Ready for:**
- Chapter planning (if not done)
- Scene writing with Bailey
- NPE validation with Miranda
- Continuity checking with Tessa

**Positioning:** [Genre + comp statement]
**Target Audience:** [Specific audience]
**Key Differentiators:** [List]

**HANDOFF TO: MIRANDA (SHOWRUNNER) + AI WRITING TEAM**
```

**If Rejected or Revision Required (Score below 7.0):**

Return to appropriate phase:
- **Major concept issues:** Return to Phase 1 (Intake)
- **Market positioning issues:** Return to Phase 2 (Market Research)
- **Structure issues:** Return to Phase 4 (Series Architecture)
- **Minor execution issues:** Proceed with noted revisions

---

## Workflow Modes

### Mode 1: Complete Market-Driven Planning (Recommended)

**All phases executed:**
Intake → Market Research → Genre Pack → Series Architecture → Book 1 Plan → Validation → Handoff

**Time:** 3-4 hours total
**Output:** Fully validated 5-book series plan ready for writing

**Best for:**
- New series concepts
- High-investment projects (5-book series)
- Authors seeking commercial optimization
- Projects requiring market validation

### Mode 2: Express Planning (Faster)

**Phases:** Intake → Market Research → Series Architecture → Validation

**Skips:**
- Detailed Book 1 planning (done later)

**Time:** 2-3 hours
**Output:** Validated series structure, Book 1 planned during writing

**Best for:**
- Experienced authors who prefer to plan while writing
- Concepts with strong existing market knowledge
- Authors comfortable with less upfront structure

### Mode 3: Architecture Only (No Validation)

**Phases:** Intake → Market Research → Series Architecture

**Skips:**
- Commercial validation
- Book-level planning

**Time:** 1.5-2 hours
**Output:** Series structure based on market research (not validated)

**Best for:**
- Authors who prefer subjective evaluation over data
- Experimental projects
- Authors testing multiple concepts quickly

---

## Session Start Protocol

**When skill is invoked:**

1. **Greet and Explain:**
   ```
   **[MARKET-DRIVEN PLANNING SKILL]:** Welcome to the Market-Driven
   Series Production System.

   This workflow will transform your concept into a commercially viable
   5-book series plan through:
   - Market research and trend analysis
   - Series architecture design
   - Commercial validation

   **Time Estimate:** 3-4 hours (Complete mode)

   **What's your concept?** (1-3 sentences describing your idea)
   ```

2. **Capture Concept:**
   - User provides raw concept
   - System confirms understanding
   - Genre identification begins

3. **Select Mode:**
   ```
   **[SYSTEM]:** Which planning mode do you prefer?

   1. **Complete** (Recommended): All phases, full validation (3-4 hours)
   2. **Express**: Skip detailed Book 1 planning (2-3 hours)
   3. **Architecture Only**: No validation (1.5-2 hours)

   [User selects mode]
   ```

4. **Begin Phase 1:**
   - Proceed with genre identification
   - Confirm with user
   - Invoke Market Research Agent for Phase 2

---

## Agent Coordination Protocol

### Sequential Handoffs

**Each phase hands off to the next:**

```
Phase 1 (System) → Phase 2 (Market Research Agent)
    [Provides: Concept + genre]

Phase 2 (Market Research Agent) → Phase 3 (System)
    [Provides: Market research report, viability score, recommendations]

Phase 3 (System) → Phase 4 (Series Architect Agent)
    [Provides: Genre pack, beat sheets, market research]

Phase 4 (Series Architect Agent) → Phase 5 (Series Architect or Book Skill)
    [Provides: Series architecture, character arcs, 5-book structure]

Phase 5 (Planning) → Phase 6 (Commercial Validator Agent)
    [Provides: All planning documents]

Phase 6 (Commercial Validator Agent) → Phase 7 (System → User → Writing Team)
    [Provides: Validation report, recommendation, handoff package]
```

### Data Flow Between Agents

**Market Research Agent provides to Series Architect:**
- Trending elements to incorporate
- Comp title escalation patterns to study
- Reader expectations to meet
- Recommended series length
- Positioning strategies

**Series Architect provides to Commercial Validator:**
- Complete series structure for validation
- Character arc distribution for assessment
- Escalation pattern for evaluation
- Trope execution for scoring
- Cliffhanger effectiveness for analysis

**Commercial Validator provides to Writing Team:**
- Final viability score and confidence level
- Identified risks to monitor
- Market positioning strategy
- Comp statement for branding
- Revision notes (if any)

---

## Output Files Generated

**By end of complete workflow:**

1. **`MARKET_RESEARCH_[concept_name].md`**
   - Market research report
   - Comp titles and trends
   - Initial viability score

2. **`SERIES_ARCHITECTURE_[concept_name].md`**
   - 5-book series structure
   - Character arcs across books
   - Series architecture score

3. **`BOOK1_PLAN_[concept_name].md`** (if created)
   - Detailed Book 1 outline
   - Chapter structure
   - Book 1 score

4. **`COMMERCIAL_VALIDATION_[concept_name].md`**
   - Final validation report
   - 5-category scoring
   - Go/no-go recommendation

5. **`PLANNING_SUMMARY_[concept_name].md`** (optional)
   - Executive summary of all phases
   - Quick reference for writing team

**Total documentation:** 4-5 comprehensive documents (~1,500-2,500 lines)

---

## Success Criteria

**The workflow is successful when:**

✅ Market research identifies clear commercial positioning
✅ Series architecture has proper escalation (personal → apocalyptic)
✅ Character arcs are distributed across all 5 books
✅ Overall commercial viability score is 7.0+ (preferably 9.0+)
✅ No critical risks identified (or all critical risks resolved)
✅ User receives clear go/no-go recommendation
✅ If approved: Complete handoff package ready for writing team

---

## Example Complete Workflow

### User Invokes Skill

```
User: "I want to use market-driven planning for: A clockwork assassin
who falls for her target and must choose between her programming and
her heart."
```

### Phase 1: Intake

```
**[SYSTEM]:** Analyzing concept...

Genre: Steampunk Romance / Science Fiction Romance
- Clockwork protagonist (artificial being, identity themes)
- Assassin trope (action, moral conflict)
- Forbidden love (assassin + target)
- Choice theme (programming vs. free will)

Confirmed Genre: Steampunk Science Fiction Romance
Target Audience: Adult (18+)

Proceeding to Phase 2: Market Research
```

### Phase 2: Market Research (30 minutes)

```
**[MARKET RESEARCH AGENT]:** Beginning web research for steampunk
sci-fi romance with clockwork protagonist...

[Conducts web searches]

Market Research Complete:
- Commercial Viability: 8.5/10
- Trending: AI/robot romance up 37% in 2024
- Comp Titles: "The Mechanical Messiah," "The Silvered Serpents"
- Market Gap: Clockwork + romance underserved in steampunk

**HANDOFF TO: PHASE 3**
```

### Phase 3: Genre Pack Selection

```
**[SYSTEM]:** Checking for genre pack...

Found partial match: steampunk-romance (requires adaptation)
Creating adapted genre pack: steampunk-scifi-romance-v1

Beat sheets: Romance structure + Action thriller hybrid
Templates: Artificial being character template added

✅ Genre pack ready

**PROCEEDING TO: PHASE 4**
```

### Phase 4: Series Architecture (60 minutes)

```
**[SERIES ARCHITECT AGENT]:** Designing 5-book series for
"The Clockwork Directive" (working title)

Series Structure:
- Book 1: Personal (target becomes her world)
- Book 2: Expanded (others like her exist)
- Book 3: Conspiracy (who created them? why?)
- Book 4: Rebellion (clockwork uprising)
- Book 5: Revolution (redefine what it means to be alive)

Character arcs designed across 5 books.
Series Architecture Score: 9.0/10

**HANDOFF TO: PHASE 5**
```

### Phase 5: Book 1 Planning (90 minutes)

```
**[SERIES ARCHITECT AGENT]:** Creating detailed Book 1 plan...

"The Clockwork Directive: Book 1"
- 25 chapters, 95,000 words
- Beat sheet: Romance Structure (meets in Ch 2, falls by Ch 18)
- POV: Dual (Clockwork + Target)
- Book 1 Score: 8.8/10

**HANDOFF TO: PHASE 6**
```

### Phase 6: Commercial Validation (40 minutes)

```
**[COMMERCIAL VALIDATOR AGENT]:** Validating commercial viability...

**OVERALL SCORE: 8.8/10** ⭐⭐⭐⭐

Breakdown:
- Market Fit: 8.5/10
- Trope Execution: 9.0/10
- Series Structure: 9.5/10
- Unique Angle: 8.5/10
- Reader Satisfaction: 8.5/10

Risks: Medium (AI/robot romance saturation concern, mitigated by
clockwork steampunk aesthetic differentiation)

**RECOMMENDATION:** ✅ APPROVED FOR EXECUTION

**HANDOFF TO: PHASE 7 (WRITING TEAM)**
```

### Phase 7: Handoff Complete

```
**[SYSTEM]:** Market-Driven Planning Complete!

**Series Validated:** "The Clockwork Directive" (5 books)
**Commercial Viability:** 8.8/10 ⭐⭐⭐⭐
**Status:** ✅ APPROVED FOR WRITING

**Files Generated:**
1. MARKET_RESEARCH_clockwork_directive.md
2. SERIES_ARCHITECTURE_clockwork_directive.md
3. BOOK1_PLAN_clockwork_directive.md
4. COMMERCIAL_VALIDATION_clockwork_directive.md

**Next Steps:**
Invoke Miranda (Showrunner) to begin writing execution with AI Writing Team.

**Would you like to:**
1. Begin writing now (invoke Miranda)
2. Review planning documents first
3. Make revisions before writing
```

---

## Troubleshooting

### Common Issues

**Issue:** Market research finds low viability (below 5.0)

**Solution:**
- Review concept with user
- Identify specific concerns (market saturation, genre mismatch, etc.)
- Suggest alternative angles or genres
- Option to revise concept and re-run Phase 2

**Issue:** Series architecture lacks proper escalation

**Solution:**
- Series Architect Agent revises escalation pattern
- Reference comp title escalation structures
- Re-score after revision
- May need to adjust book count (3-book vs. 5-book)

**Issue:** Commercial Validator identifies critical risks

**Solution:**
- Do not proceed to writing
- Address critical risks through concept revision
- Return to Phase 4 (if structure issue) or Phase 1 (if concept issue)
- Re-validate after revision

**Issue:** Genre pack doesn't exist for concept's genre

**Solution:**
- Create new genre pack from template
- Adapt closest existing genre pack
- User may need to provide genre-specific expertise
- System will generate beat sheets and templates

---

## Best Practices

### For Users

1. **Start with Clear Concepts:**
   - One sentence is enough, but clarity helps
   - Include key unique elements
   - Specify genre if known

2. **Trust the Data:**
   - Market research uses real 2024-2025 trends
   - Comp title performance is factual
   - Scores are evidence-based, not subjective

3. **Be Open to Revision:**
   - If validation suggests changes, consider them
   - Better to revise plan than rewrite books
   - Market insights can strengthen concepts

4. **Use Complete Mode for High-Investment Projects:**
   - 5-book series warrant full validation
   - 3-4 hour investment saves months of writing
   - Confidence in commercial viability before writing

### For System

1. **Maintain Data Currency:**
   - Focus on 2024-2025 market data
   - Update comp title performance regularly
   - Track emerging trends

2. **Be Honest in Validation:**
   - Don't inflate scores to please user
   - Flag real concerns clearly
   - Provide constructive revision guidance

3. **Coordinate Agents Smoothly:**
   - Each agent receives context from previous phases
   - Handoffs include all relevant data
   - No duplicated work between agents

4. **Document Everything:**
   - All planning documents saved
   - Decisions and rationales recorded
   - Easy reference during writing phase

---

## Version History

### Version 1.0 (2025-11-23)
**Initial Release:**
- Complete 7-phase market-driven planning workflow
- Integration of 3 specialized agents
- Market research with real web data
- Series architecture for 5-book series
- Commercial validation with 5-category scoring
- Multiple workflow modes (Complete / Express / Architecture Only)
- Genre-agnostic (uses genre pack system)

---

## Support

**For questions about:**
- **Market research process:** Consult Market Research Agent documentation
- **Series architecture:** Consult Series Architect Agent documentation
- **Commercial validation:** Consult Commercial Validator Agent documentation
- **Genre packs:** See `.claude/genre-packs/` directory
- **Writing team handoff:** Consult Miranda (Showrunner) documentation

---

**[MARKET-DRIVEN PLANNING SKILL]:** Ready to transform your concept into a commercially viable 5-book series plan. What's your story idea?
