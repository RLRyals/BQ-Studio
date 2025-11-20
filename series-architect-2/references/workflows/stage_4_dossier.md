# Stage 4: Story Dossier Selection/Creation

## Decision Point 4A: Dossier Source

Ask user:
- **Option A**: "I have my own story dossier template" (user provides)
- **Option B**: "Show me template options from library" (present curated list)
- **Option C**: "Create custom dossier collaboratively" (build from scratch)

**Wait for user response.**

## Option A: User-Provided Template

1. Request user to provide their template
2. Load and review template structure
3. Proceed to Decision Point 4B

## Option B: Library Options

**Execute Resource Discovery Protocol:**

1. Survey templates/ directory for story dossier worksheets
2. Load `references/story_dossier_templates.md` for guidance
3. Load 3-5 most relevant template files based on genre/intake data
4. Evaluate each template's fit for user's project

**Available templates:**
- `templates/story_dossier_worksheet_genre_neutral.md`
- `templates/story_dossier_worksheet_truby_style.md`
- `templates/book_dossier_template.md`

**Present options:**
- Show template names with brief descriptions
- Explain structure, best use case, genre fit for each
- Ask: "Which template fits best, or should we customize one?"

**Wait for user selection.**

Load selected template in full and proceed to Decision Point 4B.

## Option C: Custom Creation

**First, check for adaptable existing templates:**

1. Survey templates/ directory
2. Load 2-3 closest matches
3. Ask: "I found [template names]. Would you like to customize one of these, or build from scratch?"
4. Wait for response

**If customizing existing:**
- Load template and modify per user requirements
- Proceed to Decision Point 4B

**If building from scratch:**
- Collaborate on dossier structure:
  - Core story elements (premise, theme, character architecture)
  - Structural framework (acts, beats, scenes)
  - Supporting elements (world-building, subplot tracking, series continuity)
- Build template based on requirements
- Proceed to Decision Point 4B

## Decision Point 4B: Dossier Structure Confirmation

Present proposed/selected dossier structure using **Recommendation Approval Protocol**:
- Show structure sections
- Ask: "Type 'approved' to accept and continue, or let me know what to add/remove/modify."

**Wait for user response.**

If modifications needed, adjust structure and re-present.
Once approved, proceed to Stage 5.

## Before Proceeding to Stage 5

**Execute Stage Transition Protocol:**
1. Update intake_form.md - Mark Stage 4 complete, note template selected
2. Update memory.json - Record template selection, add changelog
3. Note which template file will be used for Stage 5
4. Proceed to Stage 5
