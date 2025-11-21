---
name: review-qa
description: Comprehensive review and quality assurance for written content. Use when the user wants to validate manuscript quality, check continuity, review character consistency, analyze pacing, or perform quality checks on drafts. Triggers include phrases like "review this chapter," "check for continuity errors," "validate character knowledge," "QA this manuscript," or requests for quality assurance on written content.
metadata:
  version: "1.0"
  phase: "quality-assurance"
  mcps:
    - "core-continuity-server"
    - "review-server"
    - "reporting-server"
---

# Review & Quality Assurance Skill

Systematic workflow for reviewing written content with emphasis on continuity validation, character knowledge consistency, world rule compliance, pacing analysis, and prose quality. This skill integrates with three MCP servers to provide comprehensive quality assurance capabilities.

---

## ⚠️ MANDATORY GUARDRAILS

**CRITICAL PROTOCOL - READ FIRST:**

### Permission-Based Actions

**ALWAYS ASK PERMISSION before:**
1. **Logging any issues** to the review-server or reporting-server
2. **Creating review records** in the continuity database
3. **Generating issue reports** or quality assessments
4. **Modifying any continuity data** in core-continuity-server
5. **Creating or updating review sessions** in the review-server

**Workflow:**
1. Perform analysis and validation checks
2. Present findings to the user with detailed report
3. **STOP and ASK:** "May I log these [N] issues to the review system?"
4. Wait for explicit user confirmation
5. Only after approval: Execute logging operations

**Never:**
- Auto-log issues without explicit permission
- Assume user wants issues tracked
- Create review records without confirmation
- Modify continuity data without approval

**User Response Handling:**
- "Yes" / "Approved" / "Go ahead" → Proceed with logging
- "No" / "Not yet" / "Wait" → Present findings only, no logging
- "Only critical ones" → Ask user to confirm which issues qualify
- Ambiguous response → Ask for clarification

---

## AUTOMATIC ID MANAGEMENT

### ID Discovery on Session Start

**Skills automatically handle ID resolution - users never interact with IDs directly.**

When a session starts, this skill:
1. **Queries MCP servers** to discover all relevant entities for validation
2. **Caches IDs in session memory** for the duration of the review workflow
3. **Builds human-readable mappings** (name → ID) for transparent resolution

**Example Discovery Process:**
```
Session Start:
→ Query core-continuity-server.list_characters()
→ Cache: "Alex" → char_id = "char_001", "Marcus" → char_id = "char_002"
→ Query core-continuity-server.list_world_rules()
→ Cache: "Fae Magic System" → rule_id = "rule_001"
→ Query review-server.list_issues(book_id)
→ Cache: existing issues for cross-reference
→ Query core-continuity-server.get_timeline()
→ Cache: timeline events with IDs for validation
```

**Cached IDs for Review & QA:**
- `book_ids` - All books being reviewed
- `chapter_ids` - All chapters in scope
- `character_ids` - Map of character names to IDs
- `world_rule_ids` - Map of world rules to IDs
- `timeline_event_ids` - Map of timeline events to IDs
- `location_ids` - Map of locations to IDs
- `issue_ids` - Existing issues for cross-reference
- `review_session_ids` - Active review sessions

### Transparent ID Resolution

**Users interact with names, skills handle ID translation.**

When a user says: *"Review Chapter 5 for Alex's character knowledge consistency"*

The skill:
1. **Accepts human input:** "Chapter 5", "Alex"
2. **Resolves chapter:** Uses cached mapping to get `chapter_id = "ch_005"`
3. **Resolves character:** Uses cached mapping to get `char_id = "char_001"`
4. **Queries knowledge state:** Calls `get_character_knowledge(char_001, ch_005)`
5. **Performs validation** against continuity data
6. **Identifies issues** referencing entities by name
7. **Presents findings** to user in human-readable format
8. **After permission:** Logs issues with resolved IDs internally

**User never sees:** `ch_005`, `char_001`, `issue_id = "iss_087"`, or any other ID value.

**Issue tracking happens with IDs behind the scenes**, but user only sees character names and chapter titles.

### Session State Management

**What IDs are cached during workflow:**

| Phase | IDs Cached | Refresh Trigger |
|-------|-----------|-----------------|
| Phase 1: Pre-Review Setup | `book_ids`, `chapter_ids`, `session_id` | Review initialized |
| Phase 2: Character Knowledge Validation | `character_ids`, `knowledge_state_ids` | Knowledge checked |
| Phase 3: Secondary Validations | `world_rule_ids`, `timeline_event_ids` | Rules/timeline validated |
| Phase 4: Issue Compilation | `issue_ids` (newly created) | Issues logged |

**ID Refresh Strategy:**
- IDs are refreshed after creating review session
- Issue IDs are cached as they're logged to review-server
- Cross-references between issues maintain ID relationships internally
- Session memory persists across all review phases

**How IDs are passed between phases:**
```
Phase 2 validates "Alex's knowledge" → char_id resolved
Phase 3 checks "Alex appears in timeline" → same char_id auto-resolved
Phase 4 logs issue about "Alex" → char_id included in issue metadata
User only sees "Alex" throughout
```

### User Experience

**User says:** *"Check if Alex's knowledge about the ritual site is consistent in Chapter 8"*

**Skill translation (invisible to user):**
```
1. Resolve "Alex" → character_id = "char_001"
2. Resolve "Chapter 8" → chapter_id = "ch_008"
3. Resolve "ritual site" → location_id = "loc_007" (if tracked)
4. Query: get_character_knowledge(char_001, ch_008)
5. Validate: Check when Alex learned about ritual site
6. Compare: Cross-reference with scenes where knowledge appears
7. Identify issue (if any):
   → "Alex references ritual site in Ch8 Para 15, but doesn't learn about it until Ch12"
8. Present to user: "Found 1 character knowledge issue for Alex in Chapter 8"
9. Request permission to log
10. After approval: log_issue(session_id, {
      character_id: "char_001",
      chapter_id: "ch_008",
      issue_type: "character_future_knowledge",
      ...
    })
11. Response: "Issue logged for review tracking."
```

**User never sees or types:**
- `char_001`
- `ch_008`
- `loc_007`
- `issue_id = "iss_123"`

**Throughout the workflow:**
- User: "What issues did we find for Marcus?"
- Skill: Queries issues filtered by `char_id = "char_002"`, presents results as "Marcus"
- User: "Generate a report for Book 2"
- Skill: Resolves Book 2 → `book_002`, generates report with human-readable names

**IDs are completely abstracted from user interaction.**

### Auto-Generated ID Reference (Optional)

**For transparency, skills can optionally generate ID reference documents.**

**Example: `.claude/session/review_session_id_reference.md`**
```markdown
# Review Session ID Reference - Book 2 QA

**Auto-generated reference (READ-ONLY)**
Last updated: 2025-11-20 16:00:00

## Review Session
- Session: Book 2 Complete Review: session_rev_001

## Reviewed Entities

### Characters Validated
- Alex Chen: char_001
- Marcus Blake: char_002
- Captain Hayes: char_003

### Chapters Reviewed
- Chapter 5: Blood Moon: ch_005
- Chapter 6: Revelations: ch_006
- Chapter 7: Confrontation: ch_007

### World Rules Checked
- Fae Magic System: rule_001
- Iron Vulnerability: rule_002
- Glamour Mechanics: rule_003

## Issues Logged
- Character Knowledge Issue #1: iss_087 (Alex, Chapter 5)
- Timeline Inconsistency #1: iss_088 (Chapter 6)
- World Rule Violation #1: iss_089 (Fae magic, Chapter 7)

## Continuity References
- Timeline Event: Ritual Discovery: event_023
- Location: Fae District: loc_005

---
*This is a reference document only. Users do not need to consult this for normal workflow.*
*IDs are managed automatically by the skill.*
```

**These documents:**
- Are **optional** and generated only if user requests transparency
- Are **read-only** - users never edit them
- Are **informational** - users don't need them for workflows
- Can be **regenerated** at any time from session cache
- Useful for **debugging** or **cross-referencing** complex review sessions

**Normal user workflow never requires consulting ID references.**

---

## MCP Server Integration

This skill requires three MCP servers to be running and accessible. All server interactions must follow permission protocols.

### Core Continuity Server
**Purpose:** Central source of truth for story continuity data

**MCP Tool Access:**
- `mcp__core-continuity-server__get-character` - Retrieve character profile
- `mcp__core-continuity-server__get-world-rule` - Retrieve world/magic rules
- `mcp__core-continuity-server__get-timeline` - Retrieve timeline events
- `mcp__core-continuity-server__list-characters` - List all characters
- `mcp__core-continuity-server__list-world-rules` - List all world rules
- `mcp__core-continuity-server__validate-consistency` - Run consistency checks

**Usage Pattern:**
```
1. Query character knowledge base for reference data
2. Compare manuscript content against continuity records
3. Identify discrepancies and violations
4. ASK PERMISSION before updating any records
```

**Example Calls:**
```javascript
// Retrieve character knowledge profile
mcp__core-continuity-server__get-character({
  characterId: "char_001",
  includeKnowledge: true,
  includeHistory: true
})

// Get world rule for validation
mcp__core-continuity-server__get-world-rule({
  ruleId: "magic_system_001",
  category: "magic"
})

// Validate timeline consistency
mcp__core-continuity-server__validate-consistency({
  scope: "timeline",
  bookId: "book_01",
  chapterId: "ch_05"
})
```

### Review Server
**Purpose:** Issue tracking, review sessions, and quality metrics

**MCP Tool Access:**
- `mcp__review-server__create-review-session` - Start new review session
- `mcp__review-server__log-issue` - Log identified issue
- `mcp__review-server__get-issue` - Retrieve issue details
- `mcp__review-server__update-issue-status` - Update issue status
- `mcp__review-server__list-issues` - Query issues by filters
- `mcp__review-server__add-review-note` - Add reviewer commentary
- `mcp__review-server__get-review-metrics` - Get quality metrics

**Usage Pattern:**
```
1. Create review session for manuscript section
2. Perform validation checks
3. Compile findings list
4. ASK PERMISSION to log issues
5. On approval: Log each issue with categorization
6. Add summary notes to review session
```

**Example Calls:**
```javascript
// ONLY AFTER USER APPROVAL
// Create review session
mcp__review-server__create-review-session({
  manuscriptId: "book_01_ch_05",
  reviewType: "quality-assurance",
  reviewerId: "claude",
  scope: {
    bookId: "book_01",
    chapterId: "ch_05",
    sections: ["full"]
  }
})

// Log character knowledge issue
mcp__review-server__log-issue({
  sessionId: "review_session_123",
  issueType: "character_knowledge",
  severity: "high",
  category: "continuity",
  location: {
    bookId: "book_01",
    chapterId: "ch_05",
    paragraph: 12,
    lineNumber: 287
  },
  description: "Character knows about X but shouldn't have this knowledge until Chapter 8",
  suggestedFix: "Remove reference to X or rephrase to indicate speculation",
  affectedEntities: ["char_001"]
})
```

### Reporting Server
**Purpose:** Analytics, aggregate reports, and issue tracking dashboards

**MCP Tool Access:**
- `mcp__reporting-server__generate-quality-report` - Generate QA summary
- `mcp__reporting-server__get-issue-statistics` - Get issue stats
- `mcp__reporting-server__get-trend-analysis` - Analyze quality trends
- `mcp__reporting-server__export-review-data` - Export review data
- `mcp__reporting-server__get-error-hotspots` - Identify problem areas

**Usage Pattern:**
```
1. Generate quality report after review completion
2. ASK PERMISSION before creating reports
3. Present analytics and trends to user
4. Export data if requested
```

**Example Calls:**
```javascript
// ONLY AFTER USER APPROVAL
// Generate quality report
mcp__reporting-server__generate-quality-report({
  scope: {
    bookId: "book_01",
    chapters: ["ch_01", "ch_02", "ch_03", "ch_04", "ch_05"]
  },
  reportType: "comprehensive",
  includeMetrics: true,
  includeTrends: true
})

// Get issue statistics
mcp__reporting-server__get-issue-statistics({
  groupBy: ["issueType", "severity"],
  filters: {
    bookId: "book_01",
    dateRange: "last_30_days"
  }
})
```

---

## Review Workflow

### Phase 1: Pre-Review Setup

**Step 1: Initialize Review Session**
1. Identify manuscript scope (book, chapters, sections)
2. Load relevant continuity data from core-continuity-server
3. **ASK PERMISSION:** "May I create a review session for [scope]?"
4. On approval: Create review session in review-server
5. Set up tracking for current review

**Step 2: Load Reference Data**
```
Load from core-continuity-server:
- Character profiles (all characters appearing in scope)
- Character knowledge states (what they know/when they learned it)
- World rules (magic system, technology, society rules)
- Timeline events (chronological reference)
- Location details (settings and their properties)
- Established facts (canon facts from earlier content)
```

**Step 3: Prepare Validation Checklist**
Enable all relevant checks:
- [x] Character knowledge continuity
- [x] Timeline consistency
- [x] World/magic system compliance
- [x] Character behavior consistency
- [x] Pacing analysis
- [x] Prose quality
- [x] Investigation procedure authenticity (if applicable)
- [x] Dialogue consistency
- [x] Setting/location accuracy

### Phase 2: Primary Validation - Character Knowledge Continuity

**⚠️ PRIORITY #1: Character Knowledge Errors**

Character knowledge continuity is the most common and impactful error type. Characters must only know what they've learned or experienced up to the current point in the narrative timeline.

**Validation Process:**

**Step 1: Build Knowledge Timeline**
```
For each character in the manuscript section:
1. Query core-continuity-server for character knowledge state
2. Identify what character knows at THIS point in timeline
3. Identify what character will learn LATER
4. Create knowledge boundary map
```

**Step 2: Analyze Character Actions & Dialogue**
```
For each character appearance:
1. Extract all dialogue lines
2. Extract all internal thoughts/POV content
3. Extract all actions that imply knowledge
4. Extract all reactions to events/information
```

**Step 3: Cross-Reference Knowledge State**
```
For each extracted element:
1. Identify implied knowledge (what must be known for this to make sense)
2. Check against character knowledge timeline
3. Flag if character exhibits knowledge they shouldn't have yet
4. Flag if character lacks knowledge they should have by now
```

**Common Knowledge Errors:**
1. **Future Knowledge:** Character knows something they haven't learned yet
2. **Missing Knowledge:** Character lacks information they should have
3. **Inconsistent Knowledge:** Character alternates between knowing/not knowing
4. **Impossible Inference:** Character deduces something without sufficient clues
5. **Forgotten Knowledge:** Character forgets something they clearly learned
6. **Meta-Knowledge:** Character knows plot information they couldn't know

**Example Validation:**
```
MANUSCRIPT: "Sarah realized the artifact was from Atlantis."

CHECK:
- Does Sarah know Atlantis exists? (Query: char_knowledge)
- Has Sarah learned about ancient artifacts? (Query: timeline_events)
- Has Sarah encountered relevant clues? (Query: scene_history)

IF any check fails:
→ FLAG: Character knowledge violation (SEVERITY: HIGH)
→ NOTE: Sarah shouldn't know about Atlantis until Chapter 12
→ SUGGEST: Rephrase as speculation or discovery moment
```

**Issue Severity Levels:**
- **CRITICAL:** Breaks major plot logic, impossible to miss
- **HIGH:** Significant continuity break, reduces credibility
- **MEDIUM:** Noticeable but could be explained/rationalized
- **LOW:** Minor inconsistency, easily overlooked

### Phase 3: Secondary Validations

**Timeline Consistency**
```
1. Extract all time references (dates, durations, sequences)
2. Map events to timeline from core-continuity-server
3. Check for:
   - Impossible timelines (events in wrong order)
   - Duration errors (travel time, healing time, etc.)
   - Age/date inconsistencies
   - Seasonal/weather mismatches
   - Temporal paradoxes
```

**World Rule Compliance**
```
1. Load world rules from core-continuity-server
2. Identify all world-system interactions in manuscript:
   - Magic usage
   - Technology usage
   - Social rules/customs
   - Physical laws (if non-standard)
   - Established limitations
3. Validate each interaction against rules
4. Flag violations with explanation
```

**Character Behavior Consistency**
```
1. Load character profiles (personality, motivations, patterns)
2. Analyze character actions/reactions in manuscript
3. Check for:
   - Out-of-character behavior (without justification)
   - Inconsistent speech patterns
   - Contradictory motivations
   - Unexplained personality shifts
   - Forgotten character traits
```

**Investigation Procedure Authenticity** (if applicable)
```
For detective/mystery/procedural content:
1. Verify investigation steps follow logical sequence
2. Check evidence handling accuracy
3. Validate deduction processes
4. Ensure clues are available when needed
5. Verify procedural accuracy (if real-world procedures)
6. Check timeline of investigation activities
```

**Pacing Analysis**
```
1. Analyze scene-to-scene transitions
2. Identify pacing issues:
   - Info-dumps (too much exposition)
   - Rushed sequences (insufficient development)
   - Stagnant scenes (no progress)
   - Uneven tension curves
3. Map emotional/tension beats
4. Check chapter endings (hooks, cliffhangers)
```

**Prose Quality**
```
1. Identify clarity issues:
   - Unclear antecedents
   - Ambiguous descriptions
   - Confusing action sequences
2. Check dialogue:
   - Distinct character voices
   - Natural flow
   - Attribution clarity
3. Note stylistic inconsistencies:
   - Tense shifts
   - POV slips
   - Voice changes
```

### Phase 4: Issue Compilation & Reporting

**Step 1: Compile Findings**
```
Organize all identified issues by:
- Issue type (knowledge, timeline, world-rule, etc.)
- Severity (critical, high, medium, low)
- Location (book, chapter, section, paragraph)
- Affected entities (characters, locations, rules)
```

**Step 2: Generate Report**
```
Create structured report with:
1. Executive Summary
   - Total issues found
   - Breakdown by type
   - Breakdown by severity
   - Priority issues requiring immediate attention

2. Detailed Issue List
   - For each issue:
     * Location (precise reference)
     * Issue type and severity
     * Description of problem
     * Why it's a problem (continuity implications)
     * Suggested fix
     * Affected entities
     * Related issues (if any)

3. Positive Findings
   - Elements done well
   - Consistent areas
   - Strong continuity maintenance

4. Overall Assessment
   - Quality score (if applicable)
   - Comparison to previous reviews
   - Trend analysis
```

**Step 3: Present to User**
```
1. Show executive summary first
2. Highlight critical/high issues
3. Present full detailed report
4. **STOP AND ASK:**
   "I've identified [N] issues in this review:
   - [X] critical
   - [Y] high priority
   - [Z] medium priority
   - [W] low priority

   May I log these issues to the review system for tracking?"
5. Wait for explicit permission
```

**Step 4: Logging (Only After Permission)**
```
IF user approves:
1. Log each issue to review-server
   - Use appropriate issue types
   - Set correct severity levels
   - Include all context and suggestions
   - Link to affected entities

2. Add review notes to session
   - Overall assessment
   - Key recommendations
   - Reviewer commentary

3. Update review session status
   - Mark as completed
   - Add completion timestamp
   - Include summary metrics

4. Generate quality report (if requested)
   - Use reporting-server
   - Include trends and analytics
   - Export data if needed
```

---

## Issue Categories & Types

### Character Knowledge Issues
- `character_future_knowledge` - Knows something they haven't learned yet
- `character_missing_knowledge` - Lacks knowledge they should have
- `character_inconsistent_knowledge` - Alternates between knowing/not knowing
- `character_impossible_inference` - Deduces without sufficient information
- `character_forgotten_knowledge` - Forgets previously established knowledge
- `character_meta_knowledge` - Knows plot information impossibly

### Timeline Issues
- `timeline_sequence_error` - Events in impossible order
- `timeline_duration_error` - Incorrect time passage
- `timeline_date_inconsistency` - Conflicting dates/ages
- `timeline_seasonal_mismatch` - Wrong season/weather for timeframe
- `timeline_paradox` - Temporal logic violation

### World Rule Issues
- `magic_system_violation` - Breaks established magic rules
- `technology_inconsistency` - Tech usage contradicts world setup
- `social_rule_violation` - Violates cultural/social norms
- `physical_law_violation` - Breaks established physical rules
- `limitation_ignored` - Ignores established constraints

### Character Behavior Issues
- `out_of_character` - Actions inconsistent with personality
- `inconsistent_speech` - Voice/pattern doesn't match character
- `contradictory_motivation` - Actions contradict established goals
- `unexplained_shift` - Personality change without justification
- `forgotten_trait` - Ignores established character trait

### Investigation Issues
- `illogical_deduction` - Detective/investigator logic flawed
- `missing_evidence` - Conclusion without necessary evidence
- `procedural_error` - Investigation procedure incorrect
- `evidence_mishandling` - Evidence usage inconsistent
- `clue_availability` - Clue used before it could be discovered

### Pacing Issues
- `info_dump` - Too much exposition at once
- `rushed_sequence` - Insufficient development/time
- `stagnant_scene` - No plot/character progress
- `uneven_tension` - Tension curve problematic
- `weak_chapter_end` - Missing hook/cliffhanger

### Prose Issues
- `unclear_reference` - Ambiguous antecedent/description
- `dialogue_attribution` - Unclear who's speaking
- `action_confusion` - Action sequence unclear
- `voice_inconsistency` - Narrative voice shifts
- `pov_slip` - POV violation
- `tense_shift` - Unintentional tense change

---

## Review Completion Checklist

**Before Marking Review Complete:**

### Data Validation
- [ ] All character knowledge states verified
- [ ] All timeline references cross-checked
- [ ] All world rule applications validated
- [ ] All character behaviors assessed
- [ ] All investigation procedures checked (if applicable)
- [ ] Pacing analyzed across all sections
- [ ] Prose quality reviewed comprehensively

### Issue Documentation
- [ ] All issues compiled and categorized
- [ ] Severity levels assigned to all issues
- [ ] Locations precisely identified (book/chapter/paragraph)
- [ ] Suggested fixes provided for all issues
- [ ] Affected entities linked to issues
- [ ] Related issues cross-referenced

### Report Quality
- [ ] Executive summary completed
- [ ] Detailed issue list formatted
- [ ] Positive findings included
- [ ] Overall assessment written
- [ ] Comparison data added (if available)
- [ ] Trends identified and noted

### Permission Protocol
- [ ] User permission obtained before logging
- [ ] User confirmed scope of logging
- [ ] User approved report generation
- [ ] User notified of completion

### System Updates (Only After Permission)
- [ ] Review session created in review-server
- [ ] All approved issues logged
- [ ] Review notes added to session
- [ ] Session marked complete
- [ ] Quality report generated (if requested)
- [ ] Metrics updated in reporting-server

### Communication
- [ ] Full report delivered to user
- [ ] Critical issues highlighted
- [ ] Next steps recommended
- [ ] Follow-up plan discussed
- [ ] User questions addressed

---

## Communication Protocol

**Tone & Style:**
- Professional but approachable
- Clear and specific (avoid vague assessments)
- Constructive (focus on solutions, not just problems)
- Respectful of author's work
- Balanced (acknowledge strengths alongside issues)

**Presenting Findings:**
```
STRUCTURE:
1. Start with positive findings
2. Present critical issues clearly
3. Explain why each issue matters
4. Provide actionable suggestions
5. End with encouragement and next steps

EXAMPLE:
"The character development in this chapter is strong, and Sarah's emotional arc is compelling. However, I've identified 3 high-priority continuity issues:

1. **Character Knowledge Violation (High)** - Chapter 5, Paragraph 12
   Sarah references the 'ancient prophecy' but won't learn about it until Chapter 8 when Marcus tells her. This creates a continuity break.

   SUGGEST: Either remove the prophecy reference or add a scene where Sarah discovers it earlier.

[Continue with other issues...]

Overall, these are addressable issues, and the strong character work provides a solid foundation for revision."
```

**Permission Requests:**
```
ALWAYS use clear, direct language:
✓ "May I log these 7 issues to the review system?"
✓ "Should I create a review record for this chapter?"
✓ "Can I generate a quality report with these findings?"

NEVER assume permission:
✗ "I'll log these issues now..."
✗ "Creating review record..."
✗ "Updating the database..."
```

---

## Advanced Review Scenarios

### Multi-Book Review
```
1. Load series continuity data from core-continuity-server
2. Validate cross-book consistency
3. Check character knowledge evolution across books
4. Verify timeline continuity between books
5. Track character arc progression
6. Identify series-level patterns and issues
```

### Revision Review
```
1. Load previous review data from review-server
2. Check if previous issues were addressed
3. Identify new issues introduced in revision
4. Compare quality metrics to previous version
5. Validate that fixes didn't create new problems
6. Generate revision comparison report
```

### Rapid Review (Express Mode)
```
1. Focus on critical issues only
2. Prioritize character knowledge and timeline
3. Quick scan for world rule violations
4. Skip detailed prose analysis
5. Generate abbreviated report
6. Recommend full review if concerns found
```

### Comprehensive Review (Deep Mode)
```
1. Full validation across all categories
2. Detailed analysis of every element
3. Cross-reference all continuity data
4. Extensive prose and pacing analysis
5. Generate comprehensive report with analytics
6. Include trend analysis and predictive insights
```

---

## Quality Metrics

**Continuity Score** (0-100)
- 95-100: Excellent (minimal issues)
- 85-94: Good (minor issues only)
- 70-84: Fair (noticeable issues, needs revision)
- 50-69: Poor (significant issues, major revision needed)
- <50: Critical (fundamental continuity problems)

**Issue Density**
- Critical issues per 10,000 words
- High-priority issues per 10,000 words
- Total issues per 10,000 words

**Category Breakdown**
- Percentage by issue type
- Most common issue categories
- Severity distribution

**Trend Analysis**
- Improvement/decline over time
- Recurring issue patterns
- Problem area identification

---

## Best Practices

### Do's
- ✓ Always query core-continuity-server for reference data
- ✓ Always ask permission before logging anything
- ✓ Provide specific locations for every issue
- ✓ Include suggested fixes with every issue
- ✓ Acknowledge strong elements alongside problems
- ✓ Explain why issues matter (impact on reader)
- ✓ Cross-reference related issues
- ✓ Track patterns across multiple reviews

### Don'ts
- ✗ Never log issues without explicit permission
- ✗ Never assume you know what the user wants tracked
- ✗ Never provide vague issue descriptions ("this feels off")
- ✗ Never criticize without providing constructive suggestions
- ✗ Never ignore positive findings
- ✗ Never skip the permission protocol
- ✗ Never modify continuity data without approval
- ✗ Never auto-create review sessions

---

## Error Handling

**MCP Server Connection Issues:**
```
IF core-continuity-server unavailable:
→ NOTIFY user immediately
→ EXPLAIN limited validation capability
→ OFFER manual-only review (no continuity queries)
→ DO NOT proceed without user approval

IF review-server unavailable:
→ NOTIFY user
→ OFFER review-only mode (no logging)
→ PROVIDE findings as document
→ SAVE findings for later logging when server returns

IF reporting-server unavailable:
→ CONTINUE with review and logging
→ NOTIFY user about missing analytics
→ OFFER to generate report when server returns
```

**Data Inconsistencies:**
```
IF continuity data conflicts with manuscript:
→ FLAG as potential issue
→ ASK user which is authoritative
→ SUGGEST update to continuity database if manuscript is correct
→ WAIT for user decision before proceeding
```

**Unclear Validation Results:**
```
IF uncertain whether something is an issue:
→ NOTE uncertainty in findings
→ PRESENT both interpretations
→ ASK user for guidance
→ LEARN from user response for future reviews
```

---

## Quick Reference

### Essential Commands
```
# Query character knowledge
mcp__core-continuity-server__get-character({ characterId, includeKnowledge: true })

# Validate timeline
mcp__core-continuity-server__validate-consistency({ scope: "timeline" })

# Create review session (AFTER PERMISSION)
mcp__review-server__create-review-session({ manuscriptId, reviewType })

# Log issue (AFTER PERMISSION)
mcp__review-server__log-issue({ sessionId, issueType, severity, description })

# Generate report (AFTER PERMISSION)
mcp__reporting-server__generate-quality-report({ scope, reportType })
```

### Validation Priority Order
1. Character knowledge continuity (highest priority)
2. Timeline consistency
3. World rule compliance
4. Character behavior consistency
5. Investigation authenticity (if applicable)
6. Pacing analysis
7. Prose quality

### Permission Checkpoints
- Before creating review session
- Before logging any issues
- Before creating reports
- Before modifying any data
- Before exporting any data

---

## Version History

### Version 1.0 (2025-11-20)
**Initial Release:**
- Complete review workflow with 7-phase validation
- Integration with 3 MCP servers (core-continuity, review, reporting)
- Mandatory permission protocols and guardrails
- Character knowledge continuity as primary focus
- Comprehensive issue categorization (40+ issue types)
- Multi-mode support (standard, rapid, comprehensive, multi-book)
- Quality metrics and trend analysis
- Complete validation checklist
- Error handling protocols

---

**Last Updated:** 2025-11-20
**Version:** 1.0
**Phase:** Quality Assurance
**Required MCPs:** core-continuity-server, review-server, reporting-server
