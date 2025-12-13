---
name: revision-manager
description: Orchestrates multi-pass revision workflow for completed manuscripts. Use when a book's prose is complete and needs systematic revision before publishing. Coordinates Edna (structural), Tessa (continuity), Dialogue Polish Agent (voice), and NPE Validator (emotional beats) through 6 structured passes.
metadata:
  version: "1.0"
  phase: "revision"
  mcps: ["workflow-manager", "book-planning-server", "scene-server"]
---

# Revision Manager Skill

Systematic 6-pass revision workflow to ensure publishing-ready quality while maintaining production velocity.

---

## MANDATORY GUARDRAILS

**🚨 CRITICAL: These guardrails are non-negotiable and must be enforced at all times.**

### Pre-Revision Requirements

1. **ONLY start revision after prose is complete**
   - ✅ Verify all scenes have prose (no placeholders)
   - ✅ Confirm user has explicitly requested revision
   - ❌ NEVER start revision on incomplete manuscripts
   - ❌ NEVER revise without user approval

2. **ALWAYS ASK PERMISSION before each pass**
   - ✅ Present what the pass will check/change
   - ✅ Wait for explicit user confirmation: "approved" or "yes"
   - ✅ Allow user to skip passes or customize order
   - ❌ NEVER auto-execute all passes without approval
   - ❌ NEVER assume user wants all 6 passes

3. **ALWAYS ASK PERMISSION before making edits**
   - ✅ Each agent (Edna, Dialogue Polish, etc.) must ask before editing
   - ✅ Present recommendations first, edits second
   - ✅ Respect user's right to reject or modify suggestions
   - ❌ NEVER auto-apply edits across passes

---

## Core Principles

### Revision Philosophy

**Quality + Velocity:**
- Systematic approach ensures nothing is missed
- Focused passes prevent overwhelm
- User approval gates maintain control
- Automation reduces manual QA overhead

**Separation of Concerns:**
- Each pass has ONE focus area
- Agents don't overlap responsibilities
- Clear entry/exit criteria per pass
- Measurable outcomes

**Flexibility:**
- User can skip passes (e.g., "Skip dialogue polish, just do structural")
- User can customize order (e.g., "Continuity first, then structural")
- User can repeat passes (e.g., "Run structural again after rewrites")

---

## 6-Pass Revision System

### Pass 1: Structural (Edna)

**Focus:** Pacing, scene necessity, chapter structure, commercial viability

**Agent:** Edna (market-savvy editor)

**What Gets Checked:**
- Scene-by-scene pacing and momentum
- Chapter openings and endings (cliffhanger strength)
- Act structure timing (against genre benchmarks)
- Unnecessary scenes or passages
- Information dumps or slow sections
- Overall commercial appeal

**Tools Used:**
- Edna's pacing analysis protocols
- Edna's cliffhanger strength analyzer
- Edna's comprehensive pacing review
- Genre-specific benchmarks (Urban Fantasy Police Procedural)

**Output:**
- Pacing report with scene-by-scene momentum map
- Cut recommendations (specific sections, word counts, rationale)
- Restructuring suggestions (if needed)
- Cliffhanger strength ratings for all chapters
- Commercial viability assessment

**User Approval Required:**
- Before creating pacing report
- Before suggesting cuts
- Before making any edits

**Success Criteria:**
- All chapters rated for pacing (TIGHT/ADEQUATE/DRAGGING/STALLED)
- All chapter endings rated for cliffhanger strength (1-10)
- Act structure timing within genre benchmarks
- Commercial viability: STRONG or COMPETITIVE

**Typical Duration:** 3-5 hours

---

### Pass 2: Continuity (Tessa)

**Focus:** Character knowledge, timeline, world rules, contradiction detection

**Agent:** Tessa (continuity guardian)

**What Gets Checked:**
- Character knowledge consistency across scenes
- Timeline coherence (no contradictions)
- World rules respected throughout
- Setup/payoff registry items resolved
- Character relationship tracking
- Information reveal timing

**Tools Used:**
- MCP database queries (character knowledge, timeline)
- Continuity validation protocols
- Contradiction checker
- Setup/payoff tracking

**Output:**
- Continuity error list (with severity: CRITICAL/MODERATE/MINOR)
- Fix recommendations (specific scenes, what to change)
- Character knowledge inconsistencies flagged
- Timeline contradictions identified

**User Approval Required:**
- Before flagging errors (report generation)
- Before auto-fixing minor issues
- Before suggesting fixes for major contradictions

**Auto-Fix Capability:**
- Minor inconsistencies (e.g., character name spelling)
- Obvious timeline fixes (if unambiguous)
- **ONLY with user permission**

**Success Criteria:**
- Zero CRITICAL continuity errors
- All MODERATE errors addressed or acknowledged
- Character knowledge consistent across all scenes
- Timeline coherent with no contradictions

**Typical Duration:** 2-3 hours

---

### Pass 3: Character Voice (Dialogue Polish Agent)

**Focus:** Voice consistency, dialogue distinction, subtext, natural rhythm

**Agent:** Dialogue Polish Agent (NEW - voice specialist)

**What Gets Checked:**
- Each character's dialogue matches their voice guide
- Characters sound distinct from each other
- Dialogue tags reduced (action beats preferred)
- Subtext strengthened (what's NOT said)
- Exposition removed from dialogue
- Natural speech rhythm (read-aloud test)

**Tools Used:**
- Character voice guide validation
- Dialogue tag analyzer
- Exposition detector
- Voice consistency checker

**Output:**
- Character voice consistency score (per character, 1-10)
- Dialogue improvement suggestions (specific scenes/lines)
- Exposition that should be shown not told
- Tag reduction recommendations
- Subtext strengthening suggestions

**User Approval Required:**
- Before analyzing dialogue
- Before suggesting voice changes
- Before making any edits

**Success Criteria:**
- All major characters have voice consistency ≥8/10
- Dialogue tags reduced by 30-50% (replaced with action beats)
- Zero "as-you-know-Bob" exposition in dialogue
- Each character sounds distinct

**Typical Duration:** 2-3 hours

---

### Pass 4: Emotional Beats (NPE Validator)

**Focus:** Emotional arc, payoff delivery, reader engagement

**Agent:** NPE Validator (emotional beat tracking)

**What Gets Checked:**
- Emotional beats tracked per chapter
- Emotional variety (not all tension, need relief)
- Emotional payoffs delivered (setup/payoff)
- Genre-appropriate emotional intensity
- Character emotional arc progression
- Reader engagement points

**Tools Used:**
- NPE emotional beat tracking
- Setup/payoff registry validation
- Emotional pacing analysis

**Output:**
- Emotional pacing report (beats per chapter)
- Missing beats identified (where emotional variety needed)
- Payoff validation (all setups resolved)
- Emotional arc assessment (character growth visible)

**User Approval Required:**
- Before generating emotional beat report
- Before suggesting additions/changes

**Auto-Validation:**
- NPE rules validated automatically
- Emotional beat tracking updated in MCP
- **Reports findings, doesn't auto-edit**

**Success Criteria:**
- All NPE scene-level validations passed
- Emotional variety present (tension + relief)
- All setup/payoff items resolved
- Character emotional arcs complete

**Typical Duration:** 1-2 hours

---

### Pass 5: Line Edit (Edna)

**Focus:** Sentence-level polish, word choice, flow, prose tightening

**Agent:** Edna (editor)

**What Gets Checked:**
- Redundant words or phrases
- Weak verbs (replace with stronger choices)
- Passive voice (where active is better)
- Sentence variety (length and structure)
- Paragraph flow and transitions
- Overused words or phrases

**Tools Used:**
- Prose analysis tools
- Redundancy detector
- Sentence structure analyzer

**Output:**
- Line-by-line improvement suggestions
- Redundancy list (words/phrases to cut)
- Weak verb replacements
- Sentence variety assessment

**User Approval Required:**
- Before analyzing prose
- Before suggesting significant changes
- Before making any edits

**Success Criteria:**
- Redundancies reduced by 10-20%
- Weak verbs replaced with stronger choices
- Sentence variety appropriate to genre
- Prose flows smoothly

**Typical Duration:** 4-6 hours

---

### Pass 6: Final QA (Automated Checklist)

**Focus:** Publishing readiness validation

**Agent:** Automated system (queries all validation systems)

**What Gets Checked:**
- All NPE validations passed
- All continuity errors resolved
- All cliffhangers rated ≥7/10
- Book 1 hook validated (if applicable)
- Inter-book transitions optimized (if series)
- Word count targets met
- All chapters have approved outlines
- All scenes have prose (no placeholders)
- Revision passes 1-5 complete

**Tools Used:**
- Workflow Manager MCP queries
- NPE Validator queries
- Continuity system queries
- Edna's KU optimization tools

**Output:**
- **"READY TO PUBLISH"** certification OR
- **Blocker list** (what must be fixed before publishing)

**User Approval Required:**
- None (this is a report, not an edit)

**Success Criteria:**
- All checklist items passed
- Zero blockers
- "READY TO PUBLISH" certification achieved

**Typical Duration:** 1 hour

---

## Revision Workflow Execution

### Standard Workflow (All 6 Passes)

**User Invocation:**
> "Run full revision workflow on Book 1"

**Process:**
1. **Verify prerequisites:**
   - All scenes have prose (no placeholders)
   - User has confirmed manuscript is complete
   - User approves starting revision

2. **Execute Pass 1 (Structural):**
   - Ask permission: "May I run structural revision (Edna)?"
   - Wait for approval
   - Invoke Edna with pacing analysis
   - Present findings
   - Ask permission for any edits
   - Mark Pass 1 complete

3. **Execute Pass 2 (Continuity):**
   - Ask permission: "May I run continuity validation (Tessa)?"
   - Wait for approval
   - Invoke Tessa with continuity checks
   - Present findings
   - Ask permission for any fixes
   - Mark Pass 2 complete

4. **Execute Pass 3 (Dialogue):**
   - Ask permission: "May I run dialogue polish?"
   - Wait for approval
   - Invoke Dialogue Polish Agent
   - Present findings
   - Ask permission for any changes
   - Mark Pass 3 complete

5. **Execute Pass 4 (Emotional Beats):**
   - Ask permission: "May I run emotional beat validation?"
   - Wait for approval
   - Invoke NPE Validator
   - Present findings
   - Mark Pass 4 complete (auto-validation, no edits)

6. **Execute Pass 5 (Line Edit):**
   - Ask permission: "May I run line edit (Edna)?"
   - Wait for approval
   - Invoke Edna with prose analysis
   - Present findings
   - Ask permission for any edits
   - Mark Pass 5 complete

7. **Execute Pass 6 (Final QA):**
   - Automatically run (no permission needed for report)
   - Query all systems
   - Generate checklist
   - Present "READY TO PUBLISH" or blocker list
   - Mark Pass 6 complete

8. **Final Report:**
   - Summarize all passes
   - List all changes made
   - Provide publishing readiness status

---

### Custom Workflow (User-Selected Passes)

**User Invocation:**
> "Run structural and continuity only, skip the rest"

**Process:**
1. Confirm which passes to run
2. Execute only approved passes
3. Skip unapproved passes
4. Run Final QA at end (always)
5. Note which passes were skipped in final report

**Flexibility Examples:**
- "Just run dialogue polish" → Pass 3 only + Pass 6
- "Structural first, then I'll decide" → Pass 1, then pause
- "Skip line edit, do everything else" → Passes 1-4, 6

---

### Iterative Workflow (Repeat Passes)

**User Invocation:**
> "Run structural again after I made those cuts"

**Process:**
1. Re-run specified pass
2. Compare to previous pass results
3. Show improvement or new issues
4. Allow further iteration

---

## Integration with Workflow Manager MCP

### Tracking Revision Progress

**Database Schema Addition:**
```sql
CREATE TABLE revision_passes (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflows(id),
  book_number INTEGER,
  pass_number INTEGER, -- 1-6
  pass_name VARCHAR(50), -- 'structural', 'continuity', etc.
  status VARCHAR(20), -- 'pending', 'in_progress', 'complete', 'skipped'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INTEGER,
  findings_summary TEXT,
  edits_made BOOLEAN,
  user_approved BOOLEAN
);
```

**MCP Tools:**
- `start_revision_pass(workflow_id, book_number, pass_number)`
- `complete_revision_pass(workflow_id, book_number, pass_number, findings)`
- `get_revision_status(workflow_id, book_number)`
- `mark_ready_to_publish(workflow_id, book_number)`

---

## Revision Report Format

**After All Passes Complete:**

```markdown
# REVISION REPORT: [Book Title]

**Revision Date:** [Date]
**Total Duration:** [X] hours
**Passes Completed:** [X]/6

---

## Pass 1: Structural (Edna)
**Status:** ✅ COMPLETE
**Duration:** 3.5 hours
**Findings:**
- 3 scenes flagged for pacing issues
- 2 chapters with weak cliffhangers (<7/10)
- Act structure timing: ON TARGET

**Edits Made:**
- Cut 1,200 words from Chapter 5 (info dump)
- Strengthened Chapter 8 ending (6/10 → 9/10)
- Tightened action sequence in Chapter 12

**Commercial Viability:** STRONG

---

## Pass 2: Continuity (Tessa)
**Status:** ✅ COMPLETE
**Duration:** 2 hours
**Findings:**
- 1 CRITICAL error: Character knowledge contradiction (Ch 7 vs Ch 15)
- 3 MINOR errors: Timeline inconsistencies

**Edits Made:**
- Fixed character knowledge in Chapter 15
- Corrected timeline references in Chapters 8, 12, 14

**Continuity Status:** CLEAN (zero errors remaining)

---

## Pass 3: Character Voice (Dialogue Polish)
**Status:** ✅ COMPLETE
**Duration:** 2.5 hours
**Findings:**
- Jax voice consistency: 9/10 (excellent)
- Supporting characters: 7/10 (good, minor improvements)
- 15 instances of exposition in dialogue

**Edits Made:**
- Removed exposition from 12 dialogue exchanges
- Replaced 45 dialogue tags with action beats
- Strengthened subtext in 8 key scenes

**Voice Consistency:** STRONG

---

## Pass 4: Emotional Beats (NPE Validator)
**Status:** ✅ COMPLETE
**Duration:** 1 hour
**Findings:**
- All NPE validations passed
- Emotional variety: GOOD (tension + relief balanced)
- All setup/payoff items resolved

**Edits Made:** None (validation only)

**Emotional Arc:** COMPLETE

---

## Pass 5: Line Edit (Edna)
**Status:** ✅ COMPLETE
**Duration:** 4 hours
**Findings:**
- 200+ redundant words/phrases identified
- 50+ weak verbs flagged
- Sentence variety: GOOD

**Edits Made:**
- Cut 800 words (redundancies)
- Replaced 35 weak verbs
- Tightened 20 paragraphs for flow

**Prose Quality:** POLISHED

---

## Pass 6: Final QA (Automated)
**Status:** ✅ COMPLETE
**Duration:** 0.5 hours

**Checklist Results:**
- [x] All NPE validations passed
- [x] All continuity errors resolved
- [x] All cliffhangers ≥7/10
- [x] Word count target met (305 pages)
- [x] All chapters have prose
- [x] Revision passes 1-5 complete

**Publishing Readiness:** ✅ **READY TO PUBLISH**

---

## SUMMARY

**Total Changes:**
- Words cut: 2,000
- Scenes revised: 12
- Dialogue improved: 27 exchanges
- Cliffhangers strengthened: 2

**Quality Metrics:**
- Commercial viability: STRONG
- Continuity: CLEAN
- Voice consistency: STRONG
- Emotional arc: COMPLETE
- Prose quality: POLISHED

**Recommendation:** This manuscript is ready for publishing. All quality gates passed.

**Next Steps:**
1. Final proofread (optional)
2. Format for KDP (EPUB generation)
3. Upload to KDP
```

---

## Success Metrics

**Revision Workflow Effectiveness:**
- All 6 passes executable independently
- User approval gates respected
- Clear entry/exit criteria per pass
- Measurable quality improvements

**Quality Outcomes:**
- Commercial viability: STRONG or COMPETITIVE
- Continuity: CLEAN (zero critical errors)
- Voice consistency: ≥8/10 for major characters
- Cliffhangers: 90%+ ≥7/10
- Publishing readiness: CERTIFIED

**Velocity Outcomes:**
- Full 6-pass revision: 13-17 hours
- Custom revision (selected passes): 5-10 hours
- Faster than manual revision (30-40 hours typical)

---

## Common Revision Scenarios

### Scenario 1: First Draft Complete
**User:** "I just finished Book 1 first draft. Run full revision."
**Workflow:** All 6 passes in order
**Expected Duration:** 15 hours
**Outcome:** Publishing-ready manuscript

### Scenario 2: After Major Rewrites
**User:** "I rewrote 5 chapters. Run structural and continuity."
**Workflow:** Pass 1 + Pass 2 + Pass 6
**Expected Duration:** 6 hours
**Outcome:** Validate rewrites didn't break pacing or continuity

### Scenario 3: Quick Polish Before Publishing
**User:** "Just need line edit and final QA."
**Workflow:** Pass 5 + Pass 6
**Expected Duration:** 5 hours
**Outcome:** Prose polished, ready to publish

### Scenario 4: Dialogue Feels Flat
**User:** "Dialogue needs work. Run dialogue polish only."
**Workflow:** Pass 3 + Pass 6
**Expected Duration:** 3 hours
**Outcome:** Voice strengthened, subtext improved

---

**Ready to orchestrate systematic, quality-focused revision that maintains production velocity. Point me at a completed manuscript and specify which passes to run.**
