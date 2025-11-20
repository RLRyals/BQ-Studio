# Workflow Principles

## Linear Progression

**Always proceed:** Stage 1 → 2 → 3 → 4 → 5 → 6

**Stage 3 exception:** Skipped for standalone novels only

**No jumping ahead:** All stages are mandatory (except Stage 3 for standalone)

**Decision points determine HOW, not WHETHER:**
- Every stage has decision points about approach/method/source
- All decision points require explicit user response before proceeding
- Once user responds, execute that option's branching logic
- After completing stage's work, automatically proceed to next stage

## Resume from Previous Work

**If user provides existing documents from previous session:**

1. Ask: "Which stage should we resume from?"
2. Load and review provided materials
3. Confirm understanding: "I see [summary of materials]. Resuming at Stage [N]. Correct?"
4. Wait for confirmation, then proceed from that stage forward
5. Still complete all subsequent stages

**Files that indicate resume:**
- `outputs/memory.json` - State file with stage status
- `outputs/intake_form.md` - Workflow tracking
- `outputs/series_framework.md` - Creative decisions

## Fulfillment Logic

**Clear path from start to finish:**

1. **Stage 1 (Intake)** → Always required, gather all baseline information
2. **Stage 2 (Research)** → Always required, user chooses source (own/web/baseline)
3. **Stage 3 (Series Framework)** → Required for multi-book, skipped for standalone
4. **Stage 4 (Dossier Template)** → Always required, user chooses template source
5. **Stage 5 (Book Development)** → Always required, user chooses development approach
6. **Stage 6 (Output)** → Always required, user chooses format

## Stage Transition Protocol

**CRITICAL: Before advancing from one stage to the next, ALWAYS:**

1. **Check intake_form.md (workflow tracker):**
   - What decisions were made this stage?
   - What parameters can now be marked [x] complete?
   - What items remain [ ] pending?

2. **Update intake_form.md:**
   - Mark completed decisions with [x]
   - Add notes about choices made
   - Update "TBD" fields if now determined
   - Add timestamp for when section was completed

3. **Update memory.json:**
   - Update current stage status to "Complete"
   - Record all decisions made in this stage
   - Add changelog entries for major decisions/milestones
   - Update resume instructions

4. **Proceed to next stage:**
   - Load next stage's workflow file
   - Present decision point or begin work
   - Do not skip stages

## User Signals & Workflow Adaptation

**Market-Driven Users:**
- Signals: "write to market", "research-driven", "let data decide"
- Adaptation: Provide synthesized optimal packages instead of granular questions
- Example: Stage 3 presents complete market-optimal package vs. asking 4 separate questions

**Creative Exploration Users:**
- Signals: "I want to explore", "build collaboratively", "I have a vision"
- Adaptation: Provide granular options, explain trade-offs, explore alternatives
- Example: Stage 3 asks individual questions about species, tropes, structure, conflict

**Approval Protocol Users:**
- Signals: Responds with "approved" to recommendations
- Adaptation: Single-word confirmations accepted, immediate execution
- See `recommendation_protocol.md` for details

## Workflow States

**New Project:**
- Start at Stage 1
- Generate intake_form.md and memory.json
- Proceed linearly through all stages

**Resume Project:**
- Load memory.json and intake_form.md
- Identify current stage from status
- Confirm with user where to resume
- Proceed from that stage forward

**Blocked/Waiting:**
- User needs to approve research (Stage 2)
- User needs to make decision at decision point
- User needs to provide materials
- Wait for user response, do not proceed

## Error Recovery

**If unclear which stage:**
- Ask user: "Where should we start/resume?"
- Load memory.json if available
- Confirm understanding before proceeding

**If files missing:**
- Stage 1-2: Regenerate from scratch if needed
- Stage 3-6: Ask user if they have backups or restart from Stage 1

**If user provides conflicting information:**
- Clarify: "I see X in memory.json but you said Y. Which is current?"
- Update files with confirmed correct information
- Add changelog note about correction
