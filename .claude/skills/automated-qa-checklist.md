---
name: automated-qa-checklist
description: Final publishing readiness validation system. Queries all validation systems (NPE, continuity, KU optimization, production metrics) to certify manuscript is ready to publish. Part of Pass 6 in revision workflow.
metadata:
  version: "1.0"
  phase: "final-qa"
  mcps: ["workflow-manager", "book-planning-server", "scene-server", "character-planning-server", "core-continuity-server"]
---

# Automated QA Checklist

Final validation system that certifies manuscript publishing readiness by querying all quality gates and validation systems.

---

## Purpose

**Publishing Readiness Certification:**
- Automated validation of all quality requirements
- No manual checklist needed
- Clear pass/fail status
- Specific blocker identification if not ready

**When to Use:**
- Pass 6 of revision workflow (always)
- Before formatting for KDP
- Before uploading to publishing platforms
- Any time user wants publishing status check

**What It Does:**
- Queries all MCP validation systems
- Checks NPE validations
- Validates continuity status
- Confirms KU optimization (cliffhangers, hooks)
- Verifies production completeness
- Generates "READY TO PUBLISH" or blocker list

---

## QA Checklist Categories

### Category 1: NPE Validation

**What Gets Checked:**
- All series-level NPE scores ≥80
- All scene-level NPE validations passed
- No unresolved setup/payoff items
- Emotional beats tracked and validated
- Character arcs complete

**MCP Queries:**
```javascript
// Query NPE Validator
const npeStatus = await query_npe_validation(workflow_id, book_number);

// Check series-level NPE
const seriesNPE = npeStatus.series_npe_score; // Must be ≥80

// Check scene-level NPE
const sceneValidations = npeStatus.scene_validations; // All must pass

// Check setup/payoff registry
const setupPayoff = npeStatus.setup_payoff_registry; // All resolved
```

**Pass Criteria:**
- ✅ Series NPE score ≥80
- ✅ All scene NPE validations passed
- ✅ Setup/payoff registry: 0 unresolved items
- ✅ Emotional beats: All tracked and validated

**Blocker Examples:**
- ❌ Series NPE score: 75 (below 80 threshold)
- ❌ 3 scenes failed NPE validation
- ❌ 2 unresolved setup/payoff items

---

### Category 2: Continuity Validation

**What Gets Checked:**
- Character knowledge consistent across all scenes
- Timeline coherent (no contradictions)
- World rules respected throughout
- No continuity errors flagged

**MCP Queries:**
```javascript
// Query Continuity System
const continuityStatus = await query_continuity(workflow_id, book_number);

// Check for errors
const criticalErrors = continuityStatus.errors.filter(e => e.severity === 'CRITICAL');
const moderateErrors = continuityStatus.errors.filter(e => e.severity === 'MODERATE');

// Check character knowledge
const knowledgeInconsistencies = continuityStatus.character_knowledge_errors;

// Check timeline
const timelineErrors = continuityStatus.timeline_contradictions;
```

**Pass Criteria:**
- ✅ Zero CRITICAL continuity errors
- ✅ Zero MODERATE continuity errors (or all acknowledged)
- ✅ Character knowledge consistent
- ✅ Timeline coherent

**Blocker Examples:**
- ❌ 1 CRITICAL error: Character knows information before learning it
- ❌ 2 MODERATE errors: Timeline contradictions in Chapters 5 and 12
- ❌ Character knowledge inconsistency: Jax in Ch 7 vs Ch 15

---

### Category 3: KU Optimization (if applicable)

**What Gets Checked:**
- All chapter cliffhangers rated ≥7/10
- Book 1 opening hook ≥8/10 (if Book 1)
- Inter-book transitions optimized (if series)
- Book 5 ending provides closure (if Book 5)

**MCP Queries:**
```javascript
// Query Edna's KU optimization results
const kuStatus = await query_ku_optimization(workflow_id, book_number);

// Check cliffhanger ratings
const chapterCliffhangers = kuStatus.cliffhanger_ratings; // Array of {chapter, rating}
const weakCliffhangers = chapterCliffhangers.filter(c => c.rating < 7);

// Check Book 1 hook (if applicable)
if (book_number === 1) {
  const book1Hook = kuStatus.first_chapter_hook_rating; // Must be ≥8
}

// Check inter-book transition (if applicable)
if (book_number < 5) {
  const interBookTransition = kuStatus.inter_book_transition;
  // Check satisfaction and urgency scores
}

// Check Book 5 closure (if applicable)
if (book_number === 5) {
  const book5Closure = kuStatus.series_finale_closure;
  // Check closure quality
}
```

**Pass Criteria:**
- ✅ 90%+ of chapters have cliffhangers ≥7/10
- ✅ No chapters with cliffhangers <5/10
- ✅ Book 1 hook ≥8/10 (if Book 1)
- ✅ Inter-book balance: satisfaction 7-9/10, urgency 7-9/10 (if Books 1-4)
- ✅ Book 5 closure ≥9/10 (if Book 5)

**Blocker Examples:**
- ❌ 3 chapters with cliffhangers <7/10 (Chapters 5, 12, 18)
- ❌ Book 1 opening hook: 6/10 (below 8 threshold)
- ❌ Book 3 ending: satisfaction 9/10, urgency 4/10 (urgency too low)

---

### Category 4: Production Completeness

**What Gets Checked:**
- Word count targets met (300+ pages for KU)
- All chapters have approved outlines
- All scenes have prose (no placeholders)
- Revision passes 1-5 complete

**MCP Queries:**
```javascript
// Query Workflow Manager
const productionStatus = await query_production_status(workflow_id, book_number);

// Check word count
const wordCount = productionStatus.total_word_count;
const pageCount = Math.floor(wordCount / 250); // Approximate pages

// Check chapter outlines
const chaptersWithoutOutlines = productionStatus.chapters.filter(c => !c.outline_approved);

// Check scene prose
const scenesWithoutProse = productionStatus.scenes.filter(s => !s.prose_complete);

// Check revision passes
const revisionPasses = productionStatus.revision_passes; // Array of completed passes
```

**Pass Criteria:**
- ✅ Word count ≥75,000 (300+ pages for KU)
- ✅ All chapters have approved outlines
- ✅ All scenes have prose (no placeholders)
- ✅ Revision passes 1-5 marked complete

**Blocker Examples:**
- ❌ Word count: 68,000 (below 75,000 minimum)
- ❌ 2 chapters missing approved outlines (Chapters 15, 16)
- ❌ 5 scenes missing prose (placeholders in Chapters 18-20)
- ❌ Revision Pass 3 (Dialogue) not complete

---

### Category 5: Metadata & Publishing Prep

**What Gets Checked:**
- Title finalized
- Blurb written
- Keywords researched
- Categories selected
- Cover design complete (or placeholder)

**MCP Queries:**
```javascript
// Query Book Planning Server
const metadata = await query_book_metadata(workflow_id, book_number);

// Check required fields
const hasTitle = metadata.title && metadata.title.length > 0;
const hasBlurb = metadata.blurb && metadata.blurb.length > 0;
const hasKeywords = metadata.keywords && metadata.keywords.length >= 7;
const hasCategories = metadata.categories && metadata.categories.length >= 2;
const hasCover = metadata.cover_status !== 'MISSING';
```

**Pass Criteria:**
- ✅ Title finalized
- ✅ Blurb written (150-300 words)
- ✅ Keywords researched (7+ keywords)
- ✅ Categories selected (2+ categories)
- ✅ Cover design complete or placeholder

**Blocker Examples:**
- ❌ Blurb missing
- ❌ Only 3 keywords (need 7)
- ❌ No categories selected

---

## QA Checklist Report Format

### PASS Example (Ready to Publish)

```markdown
# PUBLISHING READINESS REPORT
**Book:** [Book Title] (Book [X] of 5)
**Date:** [Date]
**Status:** ✅ **READY TO PUBLISH**

---

## NPE Validation ✅ PASS
- Series NPE score: 87/100 ✅
- Scene validations: 60/60 passed ✅
- Setup/payoff registry: 0 unresolved ✅
- Emotional beats: All validated ✅

## Continuity Validation ✅ PASS
- Critical errors: 0 ✅
- Moderate errors: 0 ✅
- Character knowledge: Consistent ✅
- Timeline: Coherent ✅

## KU Optimization ✅ PASS
- Chapter cliffhangers: 58/60 ≥7/10 (97%) ✅
- Weak cliffhangers: 2 (Chapters 8, 14 at 6/10) ⚠️ Acceptable
- Book 1 hook: 9/10 ✅
- Act break cliffhangers: All ≥9/10 ✅

## Production Completeness ✅ PASS
- Word count: 82,500 (330 pages) ✅
- Chapter outlines: 20/20 approved ✅
- Scene prose: 60/60 complete ✅
- Revision passes: 5/5 complete ✅

## Metadata & Publishing Prep ✅ PASS
- Title: "Shadow Protocol" ✅
- Blurb: 287 words ✅
- Keywords: 10 researched ✅
- Categories: Urban Fantasy, Police Procedural ✅
- Cover: Placeholder ready ✅

---

## CERTIFICATION

✅ **This manuscript is READY TO PUBLISH**

All quality gates passed. No blockers identified.

**Recommended Next Steps:**
1. Final proofread (optional)
2. Format for KDP (EPUB generation)
3. Upload to KDP
4. Schedule launch

**Quality Summary:**
- Commercial viability: STRONG
- Continuity: CLEAN
- KU optimization: OPTIMIZED
- Production: COMPLETE
- Publishing prep: READY
```

---

### FAIL Example (Blockers Present)

```markdown
# PUBLISHING READINESS REPORT
**Book:** [Book Title] (Book [X] of 5)
**Date:** [Date]
**Status:** ❌ **NOT READY TO PUBLISH**

---

## NPE Validation ❌ FAIL
- Series NPE score: 75/100 ❌ (Below 80 threshold)
- Scene validations: 57/60 passed ❌ (3 failures)
- Setup/payoff registry: 2 unresolved ❌
- Emotional beats: All validated ✅

**Blockers:**
1. Series NPE score must be ≥80 (currently 75)
2. 3 scenes failed NPE validation (Scenes 12, 34, 58)
3. 2 unresolved setup/payoff items:
   - Setup in Ch 5: Magic artifact mentioned, never resolved
   - Setup in Ch 12: Character's secret, never revealed

## Continuity Validation ⚠️ WARNING
- Critical errors: 0 ✅
- Moderate errors: 2 ⚠️
- Character knowledge: 1 inconsistency ❌
- Timeline: Coherent ✅

**Blockers:**
1. Character knowledge inconsistency: Jax knows about safe in Ch 7, but doesn't learn about it until Ch 15
2. Moderate continuity errors:
   - Ch 8: Character refers to event that hasn't happened yet
   - Ch 14: Timeline contradiction (2 days vs. 3 days since incident)

## KU Optimization ❌ FAIL
- Chapter cliffhangers: 52/60 ≥7/10 (87%) ❌ (Below 90% target)
- Weak cliffhangers: 8 chapters <7/10 ❌
- Book 1 hook: 6/10 ❌ (Below 8 threshold)
- Act break cliffhangers: 2/5 <9/10 ❌

**Blockers:**
1. Book 1 opening hook too weak (6/10, need ≥8/10)
2. 8 chapters with weak cliffhangers (<7/10):
   - Ch 3: 5/10 - Resolution instead of tension
   - Ch 7: 6/10 - Vague unease
   - Ch 11: 4/10 - Character goes to bed
   - Ch 14: 6/10 - Abstract concern
   - Ch 17: 5/10 - No specific hook
   - Ch 19: 6/10 - Low urgency
   - Ch 22: 5/10 - Easy stopping point
   - Ch 25: 6/10 - Mild curiosity only
3. Act break cliffhangers weak:
   - Midpoint (Ch 10): 7/10 (need ≥9/10)
   - Act 3 start (Ch 15): 8/10 (need ≥9/10)

## Production Completeness ❌ FAIL
- Word count: 68,000 (272 pages) ❌ (Below 300 page target)
- Chapter outlines: 18/20 approved ❌
- Scene prose: 55/60 complete ❌
- Revision passes: 4/5 complete ❌

**Blockers:**
1. Word count below KU target (need 75,000+, have 68,000)
2. 2 chapters missing approved outlines (Ch 18, 19)
3. 5 scenes missing prose (placeholders in Ch 18-20)
4. Revision Pass 5 (Line Edit) not complete

## Metadata & Publishing Prep ⚠️ WARNING
- Title: "Shadow Protocol" ✅
- Blurb: MISSING ❌
- Keywords: 3 researched ❌ (Need 7)
- Categories: 1 selected ❌ (Need 2)
- Cover: Placeholder ready ✅

**Blockers:**
1. Blurb not written
2. Only 3 keywords (need 7)
3. Only 1 category (need 2)

---

## BLOCKERS SUMMARY

**CRITICAL (Must Fix Before Publishing):**
1. Series NPE score: 75 → must be ≥80
2. 3 scenes failed NPE validation
3. 2 unresolved setup/payoff items
4. Character knowledge inconsistency (Jax, Ch 7 vs Ch 15)
5. Book 1 hook: 6/10 → must be ≥8/10
6. 8 chapters with weak cliffhangers (<7/10)
7. Word count: 68,000 → need 75,000+ (add 7,000 words)
8. 5 scenes missing prose
9. Blurb not written

**HIGH PRIORITY (Should Fix):**
10. 2 moderate continuity errors
11. 2 chapters missing approved outlines
12. Revision Pass 5 not complete
13. Only 3 keywords (need 7)
14. Only 1 category (need 2)

**Total Blockers:** 14

---

## RECOMMENDED ACTIONS (Priority Order)

### Immediate (Fix First):
1. **Complete missing prose** (5 scenes in Ch 18-20)
2. **Fix character knowledge inconsistency** (Jax, Ch 7 vs Ch 15)
3. **Resolve setup/payoff items** (2 unresolved)
4. **Strengthen Book 1 hook** (6/10 → 8/10)

### High Priority (Fix Next):
5. **Strengthen weak cliffhangers** (8 chapters <7/10)
6. **Improve NPE score** (75 → 80+)
7. **Fix NPE validation failures** (3 scenes)
8. **Add 7,000 words** to reach KU target
9. **Complete Revision Pass 5** (Line Edit)

### Before Publishing:
10. **Write blurb** (150-300 words)
11. **Research keywords** (need 4 more)
12. **Select categories** (need 1 more)
13. **Approve chapter outlines** (Ch 18, 19)
14. **Fix continuity errors** (2 moderate)

---

## ESTIMATED TIME TO READY

**Critical fixes:** 8-12 hours
**High priority fixes:** 6-8 hours
**Publishing prep:** 2-3 hours

**Total:** 16-23 hours of work remaining

---

❌ **This manuscript is NOT READY TO PUBLISH**

**14 blockers must be resolved before publishing.**

Recommend addressing critical fixes first, then high priority, then publishing prep.
```

---

## Implementation in Revision Workflow

### Pass 6 Execution

**When Invoked:**
- Automatically at end of revision workflow
- User can run manually: "Check publishing readiness"
- Before formatting for KDP
- Any time status check needed

**Process:**
1. Query all MCP systems (NPE, continuity, production, metadata)
2. Validate each category against pass criteria
3. Identify blockers (critical and high priority)
4. Generate comprehensive report
5. Certify "READY TO PUBLISH" or list blockers
6. Provide recommended actions (if blockers exist)

**No User Approval Needed:**
- This is a report, not an edit
- Automatically runs as final step
- User reviews results

**Output:**
- Publishing Readiness Report (markdown)
- Clear pass/fail status
- Specific blocker list (if fail)
- Recommended actions (priority order)
- Estimated time to ready (if fail)

---

## MCP Integration

### Workflow Manager MCP Tool

```javascript
/**
 * Run automated QA checklist for publishing readiness
 */
async function run_qa_checklist(workflow_id, book_number) {
  const report = {
    book_title: await get_book_title(workflow_id, book_number),
    book_number: book_number,
    date: new Date().toISOString(),
    status: 'PENDING',
    categories: {}
  };

  // Category 1: NPE Validation
  const npeStatus = await query_npe_validation(workflow_id, book_number);
  report.categories.npe = validate_npe(npeStatus);

  // Category 2: Continuity Validation
  const continuityStatus = await query_continuity(workflow_id, book_number);
  report.categories.continuity = validate_continuity(continuityStatus);

  // Category 3: KU Optimization
  const kuStatus = await query_ku_optimization(workflow_id, book_number);
  report.categories.ku = validate_ku_optimization(kuStatus, book_number);

  // Category 4: Production Completeness
  const productionStatus = await query_production_status(workflow_id, book_number);
  report.categories.production = validate_production(productionStatus);

  // Category 5: Metadata & Publishing Prep
  const metadata = await query_book_metadata(workflow_id, book_number);
  report.categories.metadata = validate_metadata(metadata);

  // Determine overall status
  const allPassed = Object.values(report.categories).every(c => c.status === 'PASS');
  report.status = allPassed ? 'READY_TO_PUBLISH' : 'NOT_READY';

  // Collect blockers
  report.blockers = collect_blockers(report.categories);

  // Generate recommendations
  if (!allPassed) {
    report.recommendations = generate_recommendations(report.blockers);
    report.estimated_time = estimate_time_to_ready(report.blockers);
  }

  // Store report
  await store_qa_report(workflow_id, book_number, report);

  return report;
}
```

---

## Success Metrics

**QA Checklist Effectiveness:**
- All quality gates validated automatically
- Zero manual checklist needed
- Clear pass/fail status
- Specific blocker identification

**Publishing Readiness:**
- Manuscripts certified "READY TO PUBLISH" meet all quality standards
- No surprises after upload to KDP
- Confidence in commercial viability

**Time Savings:**
- Manual QA: 3-5 hours
- Automated QA: 1 hour
- Reduction: 60-80%

---

## Common QA Scenarios

### Scenario 1: First Full Revision Complete
**User:** "Run final QA"
**Outcome:** Likely some blockers (first time through)
**Action:** Address blockers, run QA again

### Scenario 2: After Fixing Blockers
**User:** "Check publishing readiness again"
**Outcome:** Fewer blockers or READY TO PUBLISH
**Action:** Continue fixing or proceed to publishing

### Scenario 3: Quick Status Check
**User:** "Am I ready to publish?"
**Outcome:** Instant status without full revision
**Action:** Review blockers, decide next steps

### Scenario 4: Pre-Upload Validation
**User:** "Final check before KDP upload"
**Outcome:** Confirm READY TO PUBLISH status
**Action:** Proceed with confidence

---

**Ready to validate publishing readiness with comprehensive automated QA. Run this as Pass 6 of revision workflow or anytime you need a status check.**
