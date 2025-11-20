# Resource Discovery Protocol

**CRITICAL: Always check existing resources before creating new ones**

## When Templates/Beat Sheets Are Needed

1. **Survey**: Check relevant directories (templates/, beat_sheet_library/, schemas/)
2. **Load**: Read files that might match requirements
3. **Evaluate**: Assess fit based on genre, structure, user needs
4. **Present**: Show user the best 3-5 matches with brief explanations
5. **Propose new**: Only if no existing resource fits, propose creating custom

## Directory Structure

- `templates/` - Story dossier worksheets, character templates, planning forms (markdown)
- `beat_sheet_library/` - Genre-specific beat frameworks (romance, romantasy, dark romance, three-act, etc.)
- `schemas/` - JSON schemas for structured data validation (voice profiles, chapter state, etc.)
- `references/` - Reference guides (how to create beat frameworks, universal fantasies, market research)

## Schema Usage

When generating structured outputs (Stage 6, Option C: JSON):
1. Check schemas/ directory for applicable JSON schemas
2. If schema exists for data type, use it to structure output
3. Validate output against schema structure
4. If no schema exists but structured data needed, propose creating one

## When to Load References

**Load references/story_dossier_templates.md when:**
- Stage 4, Decision Point 4A, Option B (showing library options)
- Stage 4, Option C (need examples for custom building)
- User asks about dossier structure possibilities

**Load references/beat_sheets.md when:**
- Stage 5, Step 1 (beat sheet selection for each book)
- Need framework guidance before surveying beat_sheet_library/
- Explaining structure options for story

**Load references/create_new_beat_frameworks.md when:**
- No existing beat sheet in beat_sheet_library/ fits user's needs
- User explicitly wants to create custom beat framework
- Need guidance on creating genre-specific beats

**Load references/universal_fantasies.md when:**
- Stage 5, Step 3 (mapping fantasies to book)
- User asks about emotional reader experience
- Selecting fantasies based on genre/premise

**Load references/market_research_guide.md when:**
- Stage 2, Decision Point 2A, Option B or C (conducting research)
- User asks about genre conventions or positioning

## Proposing New Resources

**When no existing resource fits (after checking directories):**
1. **Confirm gap**: "I checked [directory] and found [X] resources, but none quite match [specific need]."
2. **Propose solution**: "I can create a custom [template/beat sheet/schema] based on [rationale]."
3. **Show structure**: Present outline/structure of proposed new resource
4. **Get approval**: Wait for user confirmation before creating
5. **Create and save**: If approved, create new resource and save to appropriate directory
6. **Document**: Add brief description to relevant references/ guide if applicable

## Resource Checklist by Stage

**Stage 1 (Intake):**
- Use: templates/intake_form_template_lean.md

**Stage 2 (Research):**
- Reference: references/market_research_guide.md
- Output: templates/research_output_template.md

**Stage 3 (Series Framework):**
- Use: templates/series_overview_template.md (creative blueprint)

**Stage 4 (Dossier Selection):**
- Check directory: templates/ (all story dossier worksheets)
- Reference: references/story_dossier_templates.md
- Available templates:
  - templates/story_dossier_worksheet_genre_neutral.md
  - templates/story_dossier_worksheet_truby_style.md
  - templates/book_dossier_template.md

**Stage 5 (Book Development):**
- **Beat Sheet Selection:**
  - Check directory: beat_sheet_library/
  - Reference: references/beat_sheets.md
  - If creating new: references/create_new_beat_frameworks.md
- **Character Development:**
  - templates/character_architecture_template.md
  - templates/character_profiles_template.md
- **Chapter/Scene Planning:**
  - templates/chapter_summary_template.md
  - templates/scene_card_template.md
  - templates/subplot_tracking_template.md
- **Universal Fantasies:**
  - references/universal_fantasies.md

**Stage 6 (Output):**
- If JSON format: Check schemas/ directory first
- Available schemas: voice-profile.schema.json, chapter-style-state.schema.json

**Never assume resources don't exist. Always check first.**
