# Session Management & Memory

**CRITICAL: Always maintain memory.json in outputs/ directory**

## Purpose

- Track all decisions and progress across chat sessions
- Enable resuming work from previous sessions
- Provide changelog of what happened when

## When to Update memory.json

1. **After completing each stage** - Update stage status to "Complete"
2. **After each major decision** - Record user's choice
3. **When generating new files** - Add to files_generated array
4. **When user corrects/clarifies** - Add note
5. **At end of significant conversation blocks** - Brief changelog entry

## Memory.json Structure

```json
{
  "project_metadata": {
    "project_name": "...",
    "session_date": "YYYY-MM-DD",
    "current_stage": "Stage N status",
    "workflow_position": "Brief description"
  },

  "stage_status": {
    "stage_1_intake": "Complete",
    "stage_2_research": "Complete - approach, approved YYYY-MM-DD",
    "stage_3_framework": "Complete - details, approved YYYY-MM-DD",
    "stage_4_dossier": "In Progress",
    "stage_5_development": "Not started",
    "stage_6_output": "Not started"
  },

  "key_decisions": {
    "scope": "6 books, 20 chapters, 30K words each",
    "genre": "Genre / Subgenre",
    "content": "Heat X, Violence Y",
    "approach": "write to market / creative exploration",
    "template": "Template name",
    "beat_sheet": "Beat framework - approved YYYY-MM-DD"
  },

  "files_generated": [
    "outputs/intake_form.md",
    "outputs/research_file.md"
  ],

  "resume_instructions": {
    "current_point": "Stage X - brief status",
    "next_steps": [
      "1. Next immediate task",
      "2. Following task"
    ],
    "context_files": [
      "outputs/intake_form.md - Purpose",
      "outputs/series_framework.md - Purpose"
    ]
  },

  "workflow_notes": {
    "user_style": "Market-driven / Creative exploration",
    "optimizations": ["Protocol names used"],
    "session_improvements": ["List of workflow changes"]
  },

  "changelog_key_events": [
    "YYYY-MM-DD - Completed Stages 1-2 (brief description)",
    "YYYY-MM-DD - Major decision or milestone"
  ]
}
```

## Changelog Format

- Timestamp + brief note (one line)
- Example: "2025-11-06 - Completed Stage 2 research (hybrid approach)"
- Example: "2025-11-06 - User selected vampire/werewolf pairing"

## Update Frequency

- **Minimum:** At end of each stage
- **Recommended:** After each significant decision
- **Always:** Before ending conversation (for resume capability)

## If memory.json Doesn't Exist

- Create it at start of Stage 1 or when user requests
- Initialize with project metadata and empty stage objects
- Add first changelog entry

## Resuming from Previous Session

If user provides memory.json from previous session:
1. Load and review it
2. Identify current stage and pending decisions
3. Confirm with user: "I see you completed Stages X, Y. Resume at Stage Z?"
4. Add changelog entry: "Session resumed from [previous date]"
5. Continue workflow from that point

## Memory.json Compaction

**When to compact:**
- File exceeds ~150 lines
- Changelog has >20 entries
- Duplicate information exists in series_framework.md
- Before starting a new major stage

**What to compact:**

### 1. Changelog Consolidation
- Keep only 5-10 key milestone events
- Replace detailed play-by-play with summaries

Example:
```
OLD (verbose):
"2025-11-06 10:00 - Session started"
"2025-11-06 10:15 - Completed intake questions"
"2025-11-06 10:30 - User selected 6-book series"

NEW (compact):
"2025-11-06 - Completed Stage 1 Intake (6 books, Heat 4, Violence 2)"
```

### 2. Stage Decision Objects
- Keep: Status, what was chosen, when
- Remove: Detailed rationale (belongs in series_framework.md)
- Remove: Market analysis snippets (in research file)

### 3. Conversation Notes
- Keep: User workflow style signals
- Remove: Detailed preference explanations
- Remove: Play-by-play of workflow improvements

**What to NEVER compact:**
- Current stage and workflow position
- Resume instructions (critical for continuity)
- Files generated list
- Key decisions list (compact form)
- User workflow style signals

**Result:** Clean ~50-80 line file focused on state/resume, not content duplication
