# Stage 1: Intake & Assessment

## Critical Actions

**Generate both intake form AND series framework stub at Stage 1:**

1. **Intake Form (Workflow Tracker)**
   - Generate from `templates/intake_form_template_lean.md`
   - Save to `outputs/intake_form.md`
   - Update before each stage transition
   - Tracks THAT decisions were made and WHEN

2. **Series Framework (Creative Blueprint)**
   - Generate stub from `templates/series_overview_template.md`
   - Save to `outputs/series_framework.md`
   - Fill in creative details as stages progress
   - Tracks WHAT was decided and WHY

3. **Memory.json (Session State)**
   - Create `outputs/memory.json`
   - Initialize with project metadata
   - Add first changelog entry

## Intake Questions

Gather baseline information through conversational intake:

- **Series/Book Title** (if user has one, or note "Generate during Stage 3")
- Number of books in series (or standalone)
- Chapters per book (estimate or target)
- Words per chapter / Words per book
- Genre/Subgenre
- Series tropes (known or to be determined)
- Book-level tropes/sub-plots/mini-arcs
- Universal fantasies (AI-suggested or user-specified)
- Custom beat sheet (user-provided or template)
- Heat level (1-5 🌶️)
- Violence/Gore level (1-5 🔪)

**Note:** If user doesn't provide a title or says "I don't know yet", mark as "Generate during Stage 3" in intake form. Title is REQUIRED - never proceed past Stage 3 without a final title.

## Tracking Responses

**As each question is answered:**
- Mark corresponding section in intake_form.md as [x] (complete)
- If answer is "TBD" or "to be determined", mark as [ ] (pending)
- Note which stage will resolve pending items

## Decision Point 1A: Completeness Check

Present what's been gathered and ask:
- "Do you have all this information, or should we develop some elements together?"
- "Do you have existing materials (research, character notes, plot ideas) to work from?"

**Wait for user response before proceeding.**

## Before Proceeding to Stage 2

**Execute Stage Transition Protocol:**
1. Review intake_form.md
2. Identify pending decisions and note which stage will resolve them
3. Update project status in intake form
4. Update memory.json with Stage 1 completion
5. Add changelog entry: "YYYY-MM-DD - Stage 1 Intake complete"
