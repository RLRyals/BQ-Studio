# MARKET-DRIVEN SERIES PRODUCTION SYSTEM
## Architecture Map & Process Flow

---

## ARCHITECTURE OVERVIEW

### Two Orchestration Patterns

```
PATTERN 1: Skill Calling Agents (Market-Driven Planning)
┌─────────────────────────────────────────────────┐
│ USER invokes SKILL                               │
│ ↓                                                │
│ SKILL orchestrates AGENTS sequentially          │
│ ↓                                                │
│ AGENTS perform specialized work                 │
│ ↓                                                │
│ SKILL hands off to Writing Team                 │
└─────────────────────────────────────────────────┘

PATTERN 2: Agents Using Skills (Writing Team)
┌─────────────────────────────────────────────────┐
│ USER invokes AGENT                               │
│ ↓                                                │
│ AGENT uses SKILLS as needed                     │
│ ↓                                                │
│ SKILLS provide workflow guidance                │
│ ↓                                                │
│ AGENT delivers final work                       │
└─────────────────────────────────────────────────┘
```

---

## COMPLETE SYSTEM MAP (With NPE + MCP Integration)

```
┌────────────────────────────────────────────────────────────────────┐
│                           USER                                      │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 │ Invokes one of:
                 ├──────────────────────┬─────────────────────────────┐
                 │                      │                             │
                 ▼                      ▼                             ▼
     ┌───────────────────┐  ┌──────────────────┐         ┌──────────────────┐
     │ MARKET-DRIVEN     │  │ MIRANDA          │         │ OTHER AGENTS     │
     │ PLANNING SKILL    │  │ (Showrunner)     │         │ Bailey, Tessa,   │
     │                   │  │                  │         │ Edna, etc.       │
     │ [Orchestrator]    │  │ [Writing Leader] │         │                  │
     └─────┬─────────────┘  └──────┬───────────┘         └──────┬───────────┘
           │                       │                             │
           │ Calls in sequence:    │ Uses skills:               │ Query MCP
           │                       │                             │
           │  ┌───────────────────────────────┐                 │
           ├─►│ Market Research Agent         │                 │
           │  │ - Web research                │                 │
           │  │ - Comp titles                 │                 │
           │  │ - Trend analysis              │                 │
           │  │ - Initial viability score     │                 │
           │  └───────────────────────────────┘                 │
           │                       │                             │
           │  ┌───────────────────────────────┐    ┌─────────────────┐
           ├─►│ Series Architect Agent        │    │ /series-planning│
           │  │ - 5-book structure            │◄───┤ /book-planning  │
           │  │ - Character arcs              │    │ /chapter-planning│
           │  │ - Escalation patterns         │    └─────────────────┘
           │  │ - Series mythology            │                 │
           │  └───────────────────────────────┘                 │
           │                       │                             │
           │  ┌───────────────────────────────────────────┐     │
           ├─►│ NPE Series Validator Agent (NEW)          │     │
           │  │ - Validates against 357 NPE rules         │     │
           │  │ - Character knowledge tracking            │     │
           │  │ - Setup/payoff registry                   │     │
           │  │ - Relationship progression validation     │     │
           │  │ - Stakes escalation logic                 │     │
           │  │ - Stores validated data in MCP database───┼─────┤
           │  └───────────────────────────────────────────┘     │
           │                       │                             │
           │  ┌───────────────────────────────┐    ┌─────────────────┐
           └─►│ Commercial Validator Agent    │    │ /review-qa      │
              │ - 5-category scoring          │◄───┤                 │
              │ - Risk assessment             │    └─────────────────┘
              │ - Go/no-go recommendation     │                 │
              └──────────┬────────────────────┘                 │
                         │                                       │
                         │ If APPROVED                          │
                         ▼                                       │
              ┌──────────────────────────┐                      │
              │  HANDOFF TO WRITING TEAM │                      │
              │                          │                      │
              │  Miranda (Showrunner)────┼──────────────────────┤
              │    ↓                     │  Queries MCP for:    │
              │  Bailey (First Drafter)──┼──────────────────────┤
              │    ↓                     │  - Character knowledge│
              │  Tessa (Continuity)──────┼──────────────────────┤
              │    ↓                     │  - Relationship status│
              │  Edna (Editor)           │  - Setup/payoff reg  │
              │    ↓                     │  - Plot threads      │
              │  Finn (Style)            │                      │
              └──────────────────────────┘                      │
                                                                │
                         ┌────────────────────────────────────┐ │
                         │   MCP DATABASE (PostgreSQL)        │◄┘
                         │                                    │
                         │  9 MCP Servers:                    │
                         │  - author-server                   │
                         │  - series-planning-server          │
                         │  - book-planning-server            │
                         │  - chapter-planning-server         │
                         │  - character-planning-server       │
                         │  - scene-server                    │
                         │  - core-continuity-server          │
                         │  - review-server                   │
                         │  - reporting-server                │
                         │                                    │
                         │  Stores:                           │
                         │  - Character knowledge timelines   │
                         │  - Relationship progressions       │
                         │  - Setup/payoff registry           │
                         │  - Plot threads & arcs             │
                         │  - NPE validation results          │
                         │  - Scene drafts & revisions        │
                         └────────────────────────────────────┘
```

---

## DETAILED WORKFLOW: MARKET-DRIVEN PLANNING

### Phase-by-Phase Agent Invocation

```
USER INVOKES: /market-driven-planning
    │
    └─► MARKET-DRIVEN PLANNING SKILL (Orchestrator)
            │
            ├─► PHASE 1: Intake & Genre ID (SKILL handles)
            │       Input: User concept
            │       Output: Genre classification
            │
            ├─► PHASE 2: Market Research
            │       │
            │       └─► Invokes: MARKET RESEARCH AGENT
            │               Tools: WebSearch, WebFetch, Write
            │               Output: Market research report (MARKET_RESEARCH_*.md)
            │               Score: Initial viability 0-10
            │
            ├─► PHASE 3: Genre Pack Selection (SKILL handles)
            │       Input: Genre from Phase 1
            │       Output: Selected/created genre pack
            │
            ├─► PHASE 4: Series Architecture
            │       │
            │       └─► Invokes: SERIES ARCHITECT AGENT
            │               Input: Market research + genre pack
            │               Tools: Read, Write, Edit
            │               Output: Series architecture doc (SERIES_ARCHITECTURE_*.md)
            │               Score: Series structure 0-10
            │
            ├─► PHASE 5: Book Planning (Optional)
            │       │
            │       └─► Invokes: SERIES ARCHITECT AGENT (or book-planning-skill)
            │               Input: Series architecture
            │               Output: Book 1 plan (BOOK1_PLAN_*.md)
            │               Score: Book 1 readiness 0-10
            │
            ├─► PHASE 6: Commercial Validation
            │       │
            │       └─► Invokes: COMMERCIAL VALIDATOR AGENT
            │               Input: All previous documents
            │               Tools: Read, Write
            │               Output: Validation report (COMMERCIAL_VALIDATION_*.md)
            │               Score: Overall viability 0-10
            │               Decision: APPROVE / REVISE / REJECT
            │
            └─► PHASE 7: Handoff to Writing Team
                    │
                    If APPROVED:
                    └─► USER invokes: MIRANDA (Showrunner)
                            Miranda then coordinates Writing Team
```

---

## WRITING TEAM WORKFLOW (For Comparison)

### How Existing Agents Use Skills

```
USER INVOKES: Miranda (Showrunner)
    │
    └─► MIRANDA AGENT
            │ Miranda uses skills as needed:
            │
            ├─► Miranda invokes: /series-planning
            │       SERIES-PLANNING SKILL provides workflow
            │       Miranda follows workflow, makes decisions
            │       Output: Series plan
            │
            ├─► Miranda invokes: /book-planning
            │       BOOK-PLANNING SKILL provides workflow
            │       Miranda follows workflow, makes decisions
            │       Output: Book outline
            │
            ├─► Miranda invokes: /chapter-planning
            │       CHAPTER-PLANNING SKILL provides workflow
            │       Miranda follows workflow, makes decisions
            │       Output: Chapter outline
            │
            ├─► Miranda invokes: Bailey (First Drafter)
            │       Bailey writes scenes
            │       Output: Draft prose
            │
            ├─► Miranda invokes: /review-qa
            │       REVIEW-QA SKILL provides checklist
            │       Miranda validates quality
            │       Output: Approval or revision requests
            │
            └─► Miranda makes FINAL DECISION
                    Chapter approved or sent back for revision
```

---

## KEY DIFFERENCES

### Pattern 1: Skill Calling Agents (Market-Driven Planning)

```
CONTROL FLOW:
User → Skill (orchestrator) → Agent A → Agent B → Agent C → Output

CHARACTERISTICS:
- Skill is in charge of workflow
- Agents are workers/specialists
- Sequential pipeline (one agent finishes, next starts)
- Skill handles handoffs between agents
- Agents don't know about each other

EXAMPLE:
market-driven-planning-skill calls:
  1. market-research-agent
  2. series-architect-agent
  3. commercial-validator-agent
```

### Pattern 2: Agents Using Skills (Writing Team)

```
CONTROL FLOW:
User → Agent → Skill (as tool/guide) → Agent continues → Output

CHARACTERISTICS:
- Agent is in charge of workflow
- Skills are tools/guides for agent
- Agent makes decisions, skills provide structure
- Agent can use multiple skills
- Agent coordinates final output

EXAMPLE:
Miranda (agent) uses:
  - /series-planning (skill)
  - /book-planning (skill)
  - /chapter-planning (skill)
  - /review-qa (skill)
```

---

## DATA FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                    MARKET-DRIVEN PLANNING                        │
└──────────────────────────────────────────────────────────────────┘

Input: Raw concept (1 sentence)
   │
   ├─► Market Research Agent
   │       │ Web searches
   │       │ Comp title analysis
   │       └─► Output: MARKET_RESEARCH_*.md
   │               Data: Viability 8.5/10, trending tropes, comps
   │
   ├─► Series Architect Agent
   │       │ Reads: MARKET_RESEARCH_*.md
   │       │ Designs: 5-book structure
   │       └─► Output: SERIES_ARCHITECTURE_*.md
   │               Data: Series structure 9.3/10, character arcs
   │
   ├─► (Optional) Book Planning
   │       │ Reads: SERIES_ARCHITECTURE_*.md
   │       │ Expands: Book 1 details
   │       └─► Output: BOOK1_PLAN_*.md
   │               Data: Book 1 plan 9.2/10, 25 chapters
   │
   └─► Commercial Validator Agent
           │ Reads: ALL previous documents
           │ Scores: 5 categories
           └─► Output: COMMERCIAL_VALIDATION_*.md
                   Data: Overall 9.3/10, APPROVED/REJECT
                   │
                   └─► Handoff Package:
                         - All 4 documents
                         - Positioning strategy
                         - Risk mitigation
                         - Ready for Miranda + Writing Team

┌──────────────────────────────────────────────────────────────────┐
│                      WRITING TEAM                                │
└──────────────────────────────────────────────────────────────────┘

Input: Approved series plan
   │
   └─► Miranda (Showrunner)
           │ Uses /series-planning skill
           │ Uses /book-planning skill
           │ Uses /chapter-planning skill
           │ Coordinates Bailey, Tessa, Edna, etc.
           │
           └─► Output: Written chapters
                   Miranda validates with /review-qa skill
                   Final approval based on NPE compliance
```

---

## WHEN TO USE WHICH PATTERN?

### Use "Skill Calling Agents" When:
- **Structured pipeline** - Linear workflow with clear stages
- **Sequential processing** - Each agent needs previous agent's output
- **Specialized workers** - Each agent does one thing very well
- **Automation focus** - Minimal user intervention needed
- **Example:** Market-Driven Planning (research → architect → validate)

### Use "Agents Using Skills" When:
- **Complex decision-making** - Agent needs to decide which skills to use
- **Iterative workflow** - Agent may loop back to previous skills
- **Coordination required** - Agent manages multiple specialists
- **Judgment calls** - Agent makes final approval decisions
- **Example:** Miranda coordinating writing team, deciding when to involve Bailey vs Tessa

---

## INTEGRATION POINT

```
WHERE THE TWO PATTERNS MEET:

Market-Driven Planning (Skill calling Agents)
    │
    │ Produces: Validated series plan
    │ Score: 9.3/10 viability
    │ Status: APPROVED
    │
    └─► HANDOFF TO ──────────────────┐
                                     │
                                     ▼
                    Writing Team (Agents using Skills)
                         │
                         └─► Miranda uses /chapter-planning
                                 Bailey writes scenes
                                 Tessa checks continuity
                                 Miranda uses /review-qa
                                 Chapter complete!
```

---

## SUMMARY

**Market-Driven Planning System:**
- **Structure:** Skill (orchestrator) → 3 Agents (workers)
- **User invokes:** `/market-driven-planning` skill
- **Skill calls:** market-research-agent → series-architect-agent → commercial-validator-agent
- **Output:** 4 planning documents, go/no-go decision
- **Purpose:** Pre-writing validation and commercial optimization

**Writing Team System:**
- **Structure:** Agent (coordinator) → Multiple Skills (tools)
- **User invokes:** `Miranda` agent
- **Agent uses:** /series-planning, /book-planning, /chapter-planning, /review-qa
- **Output:** Written chapters, validated by NPE
- **Purpose:** Actual writing execution with quality control

**Both patterns coexist:**
- Market-Driven Planning produces validated plan
- Writing Team executes validated plan
- Handoff happens at Phase 7 (after commercial validation approval)

---

## VISUAL CHEAT SHEET

```
MARKET-DRIVEN PLANNING (Skill → Agents):
User → [Skill]
         ├─► Agent 1 (research)
         ├─► Agent 2 (architect)
         └─► Agent 3 (validate)
              └─► Output

WRITING TEAM (Agent → Skills):
User → [Agent]
         ├─► Skill A (planning)
         ├─► Skill B (review)
         ├─► Other Agents (Bailey, Tessa)
         └─► Output
```

---

**Does this clarify the architecture?**

The key insight is:
- **NEW system (Market-Driven):** Skill orchestrates Agents
- **EXISTING system (Writing Team):** Agents use Skills
- **They integrate:** Market-Driven output feeds into Writing Team input

---

## UPDATED PIPELINE WITH NPE + MCP

### Complete 8-Phase Pipeline (With NPE Validation)

```
Phase 1: Intake & Genre Identification
    ↓
Phase 2: Market Research & Trend Analysis (Market Research Agent)
    ↓  Output: MARKET_RESEARCH_*.md, viability score
    ↓
Phase 3: Genre Pack Selection/Creation
    ↓
Phase 4: Series Architecture (Series Architect Agent)
    ↓  Output: SERIES_ARCHITECTURE_*.md, 5-book structure
    ↓
Phase 5: Book-Level Planning (Optional)
    ↓  Output: BOOK1_PLAN_*.md, detailed chapter outline
    ↓
Phase 5.5: NPE SERIES VALIDATION (NPE Series Validator Agent)
    ↓
    ├─► Loads 10 NPE JSON rule files (357 rules total)
    ├─► Validates character knowledge across 5 books
    ├─► Validates setup/payoff registry (Chekhov's gun)
    ├─► Validates relationship progressions
    ├─► Validates stakes escalation logic
    ├─► Scores NPE compliance (0-100)
    ├─► Output: NPE_VALIDATION_*.md
    ├─► Score: 0-100 (must be 80+ to proceed)
    └─► Decision: PASS / NEEDS_REVISION / BLOCKED
    ↓
Phase 6: Commercial Quality Validation (Commercial Validator Agent)
    ↓  Output: COMMERCIAL_VALIDATION_*.md
    ↓  Decision: APPROVE / REVISE / REJECT
    ↓
Phase 7: Writing Team Review & Refinement (Miranda + Agents + Genre Specialists)
    ↓
    ├─► Miranda coordinates review of validated plan
    ├─► Genre Specialist Agents review for accuracy:
    │     - Detective Logan (police procedural accuracy)
    │     - Dr. Viktor (psychological authenticity)
    │     - Professor Mira (worldbuilding consistency)
    │     - Detective-specific agents per genre
    ├─► Writing Team refines:
    │     - Character arcs (are they writable?)
    │     - Plot threads (do they work narratively?)
    │     - Scene structure (can this be executed?)
    ├─► Output: Refined series plan with Writing Team notes
    └─► Status: READY FOR USER REVIEW
    ↓
Phase 8: USER REVIEW & APPROVAL
    ↓
    ├─► User reviews all planning documents
    ├─► User reviews Writing Team refinements
    ├─► User approves OR requests revisions
    └─► User authorizes MCP database storage
    ↓
Phase 9: MCP DATABASE COMMIT (Only after user approval)
    ↓
    └─► STORES validated & approved data in MCP DATABASE:
          - character-planning-server: Character knowledge timelines
          - core-continuity-server: Setup/payoff registry
          - core-continuity-server: Relationship progressions
          - series-planning-server: Approved series structure
          - series-planning-server: NPE validation results
    ↓
Phase 10: WRITING EXECUTION (With MCP Queries)
    │
    ├─► Miranda coordinates team
    ├─► Bailey writes scenes
    │     └─► Queries MCP: "What does Theodore know at Book 2, Ch 3?"
    │           Response: Character knowledge from database
    │           Bailey writes scene using correct knowledge
    │
    ├─► Tessa checks continuity
    │     └─► Queries MCP: "What's Theodore/Vivienne relationship status at Book 3, Ch 12?"
    │           Response: Trust level 6.5, recent betrayal in Ch 5
    │           Tessa flags contradictions in draft
    │
    ├─► Edna validates pacing
    │     └─► Queries MCP: "What setups need payoff by Book 5?"
    │           Response: Setup/payoff registry
    │           Edna ensures all Chekhov's guns fire
    │
    └─► Miranda final approval (uses NPE + MCP data for validation)
```

---

## NPE + MCP INTEGRATION BENEFITS

### Problem: Multiple Files with Conflicting Information

**Without MCP Database:**
```
File 1: Series_Architecture.md says "Theodore knows X in Book 2"
File 2: Book2_Plan.md says "Theodore learns X in Book 2, Chapter 8"
File 3: Chapter_8_Draft.md says "Theodore already knew X from Book 1"

Result: CONTINUITY ERROR - No single source of truth
```

**With MCP Database:**
```
Database stores: Theodore learns X at {book: 2, chapter: 8}

All agents query database:
- Bailey queries before writing Ch 3: "Theodore doesn't know X yet"
- Bailey queries before writing Ch 8: "Theodore learns X here"
- Tessa queries during review: "Is knowledge consistent?" ✅ YES

Result: SINGLE SOURCE OF TRUTH - No conflicts possible
```

---

### NPE Validation Catches Logic Breaks

**Example: Character Knowledge Violation**

```
Without NPE Validation:
  Book 2, Chapter 3: Theodore acts on conspiracy knowledge
  Book 2, Chapter 8: Conspiracy revealed to Theodore
  
  Problem: Character knows info before learning it
  Caught: During revision (maybe, if editor notices)
  Cost: Rewrite chapters, fix continuity

With NPE Validation:
  NPE Validator checks: "Does Theodore know about conspiracy at Ch 3?"
  Database query: Theodore knowledge timeline
  Result: ❌ VIOLATION - CL-101 (Knowledge-Based Decisions)
  
  Flagged: BEFORE writing begins
  Fix: Move decision to Ch 9 OR plant hint in Book 1
  Cost: Simple architecture revision, zero rewriting
```

---

### MCP Query Examples During Writing

#### Bailey Writing Book 2, Chapter 3

```
Bailey: "I need to write scene where Theodore makes decision. 
What does he know at this point?"

Query MCP:
→ character-planning-server.get_character_knowledge(
    character_id: "theodore_grey",
    book: 2,
    chapter: 3
  )

Response:
{
  "knows": [
    "Vivienne killed his sister",
    "Clockwork heart requires deaths",
    "Factory is prison",
    "Cornelius provides victims"
  ],
  "doesnt_know": [
    "Mentor involvement (revealed Ch 8)",
    "Conspiracy scope (Book 3)",
    "Ascension Engine (Book 4)"
  ],
  "emotional_state": "conflicted, morally compromised",
  "relationship_trust_levels": {
    "vivienne": 5.0,
    "cornelius": 2.0,
    "mentor": 8.0  // Doesn't know mentor is traitor yet
  }
}

Bailey writes scene ensuring Theodore only acts on info he has.
NPE violation prevented automatically.
```

#### Tessa Checking Book 3, Chapter 12

```
Tessa: "Character says 'I've always trusted you.' Is this consistent?"

Query MCP:
→ core-continuity-server.get_relationship_history(
    character_a: "theodore",
    character_b: "vivienne",
    up_to_point: {book: 3, chapter: 12}
  )

Response:
{
  "trust_timeline": [
    {book: 1, ch: 6, event: "Met, suspicious", trust: 2.0},
    {book: 1, ch: 11, event: "Sister's killer revealed", trust: 0.5},
    {book: 2, ch: 1, event: "Returns to help", trust: 4.0},
    {book: 2, ch: 15, event: "First kiss", trust: 6.0},
    {book: 3, ch: 5, event: "Major betrayal", trust: 3.0},
    {book: 3, ch: 12, event: "Current point", trust: 5.0}
  ],
  "issues": [
    "⚠️ Trust betrayal in Book 3, Ch 5 contradicts 'always trusted'"
  ]
}

Tessa flags: "Dialogue contradicts trust history. Suggest:
'I want to trust you' or 'I'm trying to trust you again'"
```

#### Edna Validating Setup/Payoff

```
Edna: "We're finishing Book 5. Are all Chekhov's guns fired?"

Query MCP:
→ core-continuity-server.get_unfired_setups(
    series_id: "sweetwater_factory",
    up_to_book: 5
  )

Response:
{
  "unfired_setups": [
    {
      "id": "setup_027",
      "description": "Vivienne's locket inscribed 'Always'",
      "introduced": {book: 1, chapter: 11},
      "significance": "Unknown - seemed emotional but never explained",
      "suggestion": "Either explain significance in Book 5 or remove from Book 1"
    }
  ],
  "fired_setups": 46,
  "total_setups": 47,
  "completion": "98%"
}

Edna: "We have one hanging thread. Let's either:
A) Have Vivienne explain locket significance in final chapter
B) Remove locket mention in Book 1 revision"
```

---

## DATA FLOW: VALIDATION → STORAGE → QUERY

```
VALIDATION PHASE (Before Writing):
  
  NPE Series Validator Agent
    │
    ├─► Validates series structure
    ├─► Creates character knowledge maps
    ├─► Builds setup/payoff registry
    ├─► Tracks relationship progressions
    │
    └─► STORES in MCP Database:
          {
            character_knowledge: {
              theodore: {book: 2, ch: 3, knows: [...], doesnt_know: [...]},
              vivienne: {book: 2, ch: 3, knows: [...], doesnt_know: [...]}
            },
            relationships: {
              theodore_vivienne: {book: 3, ch: 12, trust: 5.0, history: [...]}
            },
            setups: [
              {id: "setup_001", introduced: {book: 1, ch: 2}, payoff: {book: 5, ch: 20}}
            ]
          }

WRITING PHASE (During Execution):

  Bailey/Tessa/Edna/Miranda
    │
    ├─► QUERY MCP Database:
    │     "What does character know here?"
    │     "What's relationship status?"
    │     "What setups need payoff?"
    │
    └─► WRITE using precise data:
          No guessing, no conflicts, single source of truth

RESULT:
  ✅ Character knowledge consistent across all books
  ✅ Relationships progress logically
  ✅ All Chekhov's guns fired
  ✅ No continuity errors
  ✅ NPE compliance maintained
```

---

## SUMMARY: Complete System Architecture

**Agents (11 total):**
1. Market Research Agent (market trends, comp titles)
2. Series Architect Agent (5-book structure)
3. **NPE Series Validator Agent** (NEW - validates against 357 rules)
4. Commercial Validator Agent (final viability check)
5-11. Writing Team Agents (Miranda, Bailey, Tessa, Edna, Finn, Detective Logan, Dr. Viktor, Professor Mira)

**Skills (6 total):**
1. **Market-Driven Planning Skill** (orchestrates Phases 1-7)
2. Series Planning Skill (used by Miranda)
3. Book Planning Skill (used by Miranda)
4. Chapter Planning Skill (used by Miranda)
5. Scene Writing Skill (used by Bailey)
6. Review QA Skill (used by Miranda)

**NPE (Narrative Physics Engine):**
- 10 JSON rule files per genre pack
- 357 rules total (for urban fantasy example)
- Categories: Character Logic, Information Economy, Stakes Pressure, Plot Mechanics, POV Physics, Scene Architecture, Dialogue Physics, Pacing Rules, Offstage Narrative, Transitions

**MCP Database (PostgreSQL):**
- 9 MCP servers for different data types
- Stores character knowledge timelines
- Stores relationship progressions
- Stores setup/payoff registry
- Stores NPE validation results
- Single source of truth for all story data

**Integration:**
```
User → Market-Driven Planning Skill
  ↓
Skill orchestrates: Market Research → Series Architect → NPE Validator → Commercial Validator
  ↓
NPE Validator stores validated data in MCP Database
  ↓
If approved → Writing Team (Miranda + agents)
  ↓
Writing Team queries MCP Database for precise information
  ↓
Result: Validated, consistent, NPE-compliant 5-book series
```

**Key Innovation:** Combining Agents + Skills + NPE validation + MCP database = Automated quality assurance with single source of truth, catching continuity errors before writing begins.

