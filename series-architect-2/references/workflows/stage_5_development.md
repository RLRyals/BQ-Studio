# Stage 5: Book-Level Development

## Decision Point 5A: Development Approach

**For series:** "Develop all books now, or one at a time?"
**For standalone:** Skip to book development directly.

### If Multi-Book Series, Ask:

- **Option A**: Sequential (complete Book 1 fully, then Book 2, etc.)
- **Option B**: Parallel (develop high-level outline for all books, then detail each)
- **Option C**: Single book focus (develop Book 1 only, plan others later)

**Wait for user response.**

## Option A: Sequential Development

- Develop each book completely before moving to the next
- After each book's Decision Point 5B, proceed to next book
- Continue until all books completed

## Option B: Parallel Development

1. Create high-level outlines for all books (premise, major beats, character arcs)
2. Present all outlines for approval
3. Then develop detailed dossier for each book sequentially
4. After each book's Decision Point 5B, proceed to next book's detailed development

## Option C: Single Book Focus

1. Develop only Book 1 with full detail
2. Note remaining books as "planned for future development"
3. Proceed to Stage 6 after Book 1 completion

## For Each Book in Scope

### Step 1: Beat Sheet Selection

**Execute Resource Discovery Protocol for beat sheets:**

1. Survey `beat_sheet_library/` directory
2. Load `references/beat_sheets.md` for framework guidance
3. Load 3-5 most relevant beat sheet files based on genre/tropes/heat level
4. Evaluate each beat framework's fit

**Present options using Recommendation Approval Protocol:**
- Show framework names with brief descriptions
- Recommend best fit based on genre/structure
- Ask: "Type 'approved' to accept [recommendation], or let me know which framework you prefer."

**Wait for user response.**

**If creating custom beat sheet:**
- Load `references/create_new_beat_frameworks.md`
- Collaborate with user to build custom framework
- Save to `beat_sheet_library/` for future use

Once selected/created, proceed to Step 2.

---

### Step 2: Character Architecture

**CRITICAL: Complete character architecture BEFORE beat outlines.**

**Execute Resource Discovery Protocol for character templates:**
1. Check for existing character architecture template (`templates/character_architecture_template.md`)
2. If exists, load template; if not, use character_profiles_template.md

**For each romantic lead in this book:**

Create comprehensive character profile including:
- **Ghost/Wound:** Inciting traumatic event that shaped them
- **Misbelief/Lie:** False belief they hold about themselves/world
- **Need (Psychological):** What they must learn/accept to heal
- **Want (External):** What they think will solve their problem
- **Character Arc:** Starting point → transformation → ending point
- **Backstory:** Relevant history, relationships, occupation
- **Personality Traits:** Core characteristics, strengths, flaws
- **Skills/Abilities:** What they can do (mundane + supernatural if applicable)
- **Relationships:** Key connections (family, friends, enemies)
- **Internal Conflict:** Psychological struggle
- **External Conflict:** Situational obstacles

**Save character profiles:**
- For series: `outputs/couple_[A/B/C]_[species]_[mc/li].md`
- For standalone: `outputs/[name]_character_profile.md`

**For supporting characters:** Create abbreviated profiles (backstory, role, key traits only)

**Present using Recommendation Approval Protocol:**
- Summarize character arcs and how they complement each other
- Ask: "Type 'approved' to accept character architecture and continue, or let me know what needs adjustment."

**Wait for user response.**

Once approved, proceed to Step 3.

---

### Step 3: Worldbuilding (If Applicable)

**CRITICAL: Complete worldbuilding BEFORE beat outlines for speculative fiction (fantasy, paranormal, sci-fi, etc.).**

**Skip this step if:** Contemporary realistic fiction with no speculative elements.

**Execute Resource Discovery Protocol for worldbuilding:**
1. Check for existing worldbuilding template (`templates/worldbuilding_template.md`)
2. If none exists, ask user if they want to create one
3. Check for existing worldbuilding guide in `outputs/`

**If worldbuilding needed, create comprehensive guide:**

**Core Systems to Define:**
- **World Overview:** Elevator pitch, core concept, world type
- **Magic/Supernatural System:** Rules, limitations, costs, visibility
- **Species/Beings:** Physical traits, powers, weaknesses, society, culture
- **Political Structures:** Governments, leadership, jurisdiction, authority
- **Laws & Treaties:** Key rules governing the world, enforcement, loopholes
- **Geography & Locations:** Key settings, atmosphere, access
- **History & Timeline:** Major events affecting current story
- **Cultural Norms:** Relationship norms, social hierarchy, taboos
- **Technology/Infrastructure:** Communication, transportation, medicine
- **Modern World Integration:** Secrecy status, human interaction (if applicable)
- **Economy & Resources:** Currency, trade, wealth distribution
- **Conflict & Tensions:** Current and historical conflicts
- **Consistency Rules:** Absolute rules to never break

**For series:** Create series-wide worldbuilding guide (all books share same world)
**For standalone:** Create book-specific worldbuilding guide

**Save worldbuilding guide:**
- Series: `outputs/worldbuilding_guide.md`
- Standalone: `outputs/[book_title]_worldbuilding.md`

**Present using Recommendation Approval Protocol:**
- Summarize key world rules and how they create conflict/enable romance
- Ask: "Type 'approved' to accept worldbuilding and continue, or let me know what needs adjustment."

**Wait for user response.**

Once approved, proceed to Step 4.

---

### Step 4: Beat Outlines / Structural Development

**Using foundations from Steps 1-3:**
- Selected beat framework (Step 1)
- Character arcs and motivations (Step 2)
- World rules and constraints (Step 3)

**Create beat outline for this book:**

1. **Premise & Theme:** 2-3 sentence book premise, thematic focus
2. **Beat-by-Beat Outline:** Apply selected framework beats to THIS book
   - Map character ghost/wound to opening situation
   - Map character misbelief to early beats
   - Map character arc transformation to mid-point and climax
   - Map character need fulfillment to resolution
   - Ensure world rules create obstacles and opportunities
   - For romance: map relationship development to beat structure

3. **Series Continuity (if applicable):**
   - How this book advances series arc
   - What threads carry over from previous books
   - What threads set up future books
   - Ensure series escalation pattern maintained

**Save beat outline:**
- Series: `outputs/book_[N]_beat_outline.md` or `outputs/[book_title]_beat_outline.md`
- Standalone: `outputs/[book_title]_beat_outline.md`

**Present using Recommendation Approval Protocol:**
- Summarize major beats and character arc progression
- Ask: "Type 'approved' to accept beat outline and continue, or let me know what needs adjustment."

**Wait for user response.**

Once approved, proceed to Step 5.

---

### Step 5: Apply Dossier Template & Generate Complete Book Dossier

**Create book-specific folder structure:**
- Series: `outputs/book_[N]_[book_title]/`
- Standalone: `outputs/[book_title]/`

This folder will house:
- Complete book dossier
- All act-based scene breakdowns (Step 6)
- Any additional book-specific planning documents

**Compile all developed components into unified book dossier:**

**Execute Resource Discovery Protocol:**
1. Load appropriate story dossier template from `templates/`
2. Check `references/story_dossier_templates.md` for template selection guidance

**Organize dossier to include:**
- **Book metadata:** Title, number, word count, chapters, genre, heat/violence
- **Premise & theme** (from Step 4)
- **Character profiles** (from Step 2)
- **Worldbuilding** (from Step 3, or reference to series-wide guide)
- **Beat outline** (from Step 4)
- **Act-by-act structure** (high-level, without scene detail)
- **Subplot tracking**
- **Trope integration map**
- **Universal fantasies map**
- **Research integration** (relevant findings from Stage 2)
- **Series continuity notes** (if applicable)

**NOTE:** Dossier is comprehensive planning document. Scene-level detail (Step 6) is separate and optional.

**Save complete dossier in book folder:**
- Series: `outputs/book_[N]_[book_title]/book_[N]_[book_title]_dossier.md`
- Standalone: `outputs/[book_title]/[book_title]_dossier.md`

**Present using Recommendation Approval Protocol:**
- Provide dossier summary and file location
- Ask: "Type 'approved' to accept dossier and continue to scene development, or let me know what needs adjustment."

**Wait for user response.**

Once approved, proceed to Step 6.

---

### Step 6: Scene-Level Detail (Optional, Execution-Level)

**CRITICAL: Scene detail is SEPARATE from dossier. Create as standalone files organized by act.**

**Expand beat outline into detailed scene/chapter structure:**

**Execute Resource Discovery Protocol:**
1. Check for scene card template (`templates/scene_card_template.md`)
2. Check for chapter summary template (`templates/chapter_summary_template.md`)
3. Ask user preference: scene cards or chapter summaries

**Create detailed breakdown:**

**Option A: Scene Cards** (granular, best for complex plots)
- One card per scene
- Includes: POV, setting, goal, conflict, outcome, emotional beat, word count estimate

**Option B: Chapter Summaries** (streamlined, best for simpler structures)
- One summary per chapter
- Includes: Chapter number, POV, major events, character development, key scenes, chapter goal

**Integrate:**
- Subplot tracking (weave secondary plots through scenes)
- Trope execution (ensure selected tropes manifest in scenes)
- Universal fantasies mapping (which scenes deliver which emotional beats)

**Save scene detail in SEPARATE FILES by act within book folder:**
- **Act-based organization (recommended):**
  - `outputs/book_[N]_[book_title]/book_[N]_act_1.md`
  - `outputs/book_[N]_[book_title]/book_[N]_act_2.md`
  - `outputs/book_[N]_[book_title]/book_[N]_act_3.md`
  - `outputs/book_[N]_[book_title]/book_[N]_act_4.md`
  - `outputs/book_[N]_[book_title]/book_[N]_act_5.md`
- Each act file contains scene cards or chapter summaries for that act only
- Allows focused development and easier navigation during drafting

**Alternative organization (if user prefers single file):**
- Scene cards: `outputs/book_[N]_[book_title]/book_[N]_scene_cards.md`
- Chapter summaries: `outputs/book_[N]_[book_title]/book_[N]_chapter_summaries.md`

**Present using Recommendation Approval Protocol:**
- Summarize scene flow and pacing
- Ask: "Type 'approved' to accept scene detail and proceed, or let me know what needs adjustment."

**Wait for user response.**

Once approved, proceed to Decision Point 5B.

## Decision Point 5B: Book Review Checkpoint

Present completed book dossier using **Recommendation Approval Protocol**:
- Summarize book structure and key elements
- Ask: "Review Book [N] dossier. Type 'approved' to proceed, or let me know what needs adjustment."

**Wait for user response.**

If revisions needed, incorporate feedback and re-present.

Once approved:
- If more books remain in development scope, proceed to next book
- If all books in scope are complete, proceed to Stage 6

## Before Proceeding to Stage 6

**Execute Stage Transition Protocol:**
1. Update intake_form.md - Mark Stage 5 complete, note all books developed
2. Update memory.json - Record book development completion, add changelog
3. List all book dossier files generated
4. Proceed to Stage 6
