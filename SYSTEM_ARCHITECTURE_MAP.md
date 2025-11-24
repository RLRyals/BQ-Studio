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

## COMPLETE SYSTEM MAP

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
     └─────┬─────────────┘  └──────┬───────────┘         └──────────────────┘
           │                       │
           │ Calls in sequence:    │ Uses skills:
           │                       │
           │  ┌───────────────────────────────┐
           ├─►│ Market Research Agent         │
           │  │ - Web research                │
           │  │ - Comp titles                 │
           │  │ - Trend analysis              │
           │  │ - Initial viability score     │
           │  └───────────────────────────────┘
           │                       │
           │  ┌───────────────────────────────┐    ┌─────────────────┐
           ├─►│ Series Architect Agent        │    │ /series-planning│
           │  │ - 5-book structure            │◄───┤ /book-planning  │
           │  │ - Character arcs              │    │ /chapter-planning│
           │  │ - Escalation patterns         │    └─────────────────┘
           │  │ - Series mythology            │
           │  └───────────────────────────────┘
           │                       │
           │  ┌───────────────────────────────┐    ┌─────────────────┐
           └─►│ Commercial Validator Agent    │    │ /review-qa      │
              │ - 5-category scoring          │◄───┤                 │
              │ - Risk assessment             │    └─────────────────┘
              │ - Go/no-go recommendation     │
              └──────────┬────────────────────┘
                         │
                         │ If APPROVED
                         ▼
              ┌──────────────────────────┐
              │  HANDOFF TO WRITING TEAM │
              │                          │
              │  Miranda (Showrunner)    │
              │    ↓                     │
              │  Bailey (First Drafter)  │
              │    ↓                     │
              │  Tessa (Continuity)      │
              │    ↓                     │
              │  Edna (Editor)           │
              │    ↓                     │
              │  Finn (Style)            │
              └──────────────────────────┘
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
