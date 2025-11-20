# Stage 6: Output Generation

## Decision Point 6A: Output Format

Ask user:
- **Option A**: Single markdown file per book
- **Option B**: Multi-file structure (dossier + character sheets + beat sheet, etc.)
- **Option C**: Structured JSON (programmatic use)
- **Option D**: Docx for editing

**Wait for user response.**

## Option A: Single Markdown File

- Generate single comprehensive markdown file per book
- Include all dossier sections in one document
- Save to `outputs/book_[N]_complete.md`
- Proceed to Decision Point 6B

## Option B: Multi-File Structure

Generate separate files:
- Main book dossier: `book_[N]_dossier.md`
- Character profiles: `book_[N]_characters.md`
- Beat sheet: `book_[N]_beats.md`
- Chapter summaries: `book_[N]_chapters.md`
- Additional files as relevant to dossier template

Proceed to Decision Point 6B.

## Option C: Structured JSON

**Execute Resource Discovery Protocol for schemas:**

1. Check `schemas/` directory for applicable JSON schemas
2. If schema exists, use it to structure output
3. If no schema exists, propose creating one

Generate structured JSON file per book:
- Save to `outputs/book_[N]_data.json`
- Include all dossier data in machine-readable format
- Validate against schema structure

Proceed to Decision Point 6B.

## Option D: Docx Output

- Generate .docx files per book with formatted dossier
- Include proper headings, tables, and formatting for editing
- Save to `outputs/book_[N]_dossier.docx`
- Proceed to Decision Point 6B

## Decision Point 6B: Series Package

**If multi-book:** "Create master series document linking all books?"
**If standalone:** Skip to output generation completion.

**Wait for user response.**

### If Yes (Create Master Document)

Generate master series document containing:
- Series overview and bible (from Stage 3)
- Links/references to all book dossiers
- Series continuity notes
- Character appearance tracking across books

Save to `outputs/series_master.md` (or appropriate format).

### If No

Proceed with individual book outputs only.

## Generate All Outputs

Save all files to `outputs/` directory.

## Completion Summary

Present completion summary:
- List all generated files with brief descriptions
- Provide guide to navigating outputs
- Confirm workflow completion

**Example:**
```
✓ Series Architect workflow complete!

Files generated:
- outputs/intake_form.md - Workflow tracking and decisions
- outputs/series_framework.md - Creative blueprint for 6-book series
- outputs/market_research.md - Genre analysis and market positioning
- outputs/book_1_dossier.md - Complete story dossier for Book 1
- outputs/book_2_dossier.md - Complete story dossier for Book 2
[... etc]
- outputs/memory.json - Session state for future resume

All files saved to outputs/ directory.
```

## Before Concluding

**Execute final Stage Transition Protocol:**
1. Update intake_form.md - Mark Stage 6 complete, list all outputs
2. Update memory.json - Mark workflow complete, final changelog entry
3. Confirm all files are saved and referenced
4. Workflow complete
