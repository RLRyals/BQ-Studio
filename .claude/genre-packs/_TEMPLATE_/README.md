# Genre Pack Template

**DO NOT USE THIS TEMPLATE DIRECTLY FOR PLANNING**

This is a teaching tool and example structure for creating your own genre pack. Copy this folder, rename it to your genre, and customize the files for your specific needs.

---

## Quick Start

1. **Copy this folder:**
   ```bash
   cp -r _TEMPLATE_ your-genre-name
   ```

2. **Read the comprehensive guide:**
   [CREATING_YOUR_GENRE_PACK.md](../CREATING_YOUR_GENRE_PACK.md)

3. **Start with manifest.json:**
   - Open `manifest.json`
   - Replace all bracketed placeholders
   - Remove the comment fields (they start with `_comment_`)
   - Update the file list as you create/remove files

4. **Customize template files:**
   - Work through files in this order:
     1. manifest.json (genre configuration)
     2. beat-sheets/ (story structures)
     3. style-guides/ (writing conventions)
     4. validation-rules/ (quality checklists)
     5. templates/ (planning documents)

5. **Delete instruction sections:**
   - Each template has "INSTRUCTIONS:" sections
   - These explain how to use the template
   - Delete them after you customize
   - Keep the actual content structure

---

## What's Included

### manifest.json
Configuration file that defines your genre pack metadata, content ratings, structure, and file listings. Heavily commented to explain each field.

### beat-sheets/
Story structure frameworks for your genre.

- **example-beat-sheet.md** - Comprehensive template showing how to create a beat sheet with:
  - Act structure overview
  - Detailed beat breakdowns
  - Genre-specific requirements
  - Examples and common mistakes
  - Troubleshooting guidance

### style-guides/
Writing conventions, voice, and tone guidelines.

- **example-style-guide.md** - Complete template covering:
  - Genre definition and reader expectations
  - Overall tone and voice
  - Sentence structure and pacing
  - Dialogue style
  - Description balance
  - Genre-specific style elements
  - Examples and revision checklist

### validation-rules/
Quality checklists to ensure books meet genre standards.

- **example-validation.md** - Comprehensive validation guide including:
  - Genre identity validation
  - Structure and beat compliance
  - Character requirements
  - Content rating checks
  - Trope validation
  - Market standards
  - Reader expectation checks

### templates/
Planning documents customized for your genre.

- **character-template.md** - Character profile questions with:
  - Basic information and physical description
  - Personality and background
  - Genre-specific sections (magic for fantasy, sleuthing for mystery, romance for romance)
  - Character arc mapping
  - Relationship tracking

- **world-template.md** - World-building framework covering:
  - Magic systems (fantasy)
  - Supernatural rules (paranormal)
  - Technology (sci-fi)
  - Historical period details (historical)
  - Geography and locations
  - Society, culture, and governance
  - Consistency rules

---

## How to Customize

### For Each File:

1. **Read the INSTRUCTIONS sections first**
   - Understand what each section is for
   - See examples of how to fill it out

2. **Replace bracketed placeholders**
   - `[Your Genre]` → Your actual genre (e.g., "Cozy Mystery")
   - `[Description]` → Your actual content
   - All `[...]` sections need your specific information

3. **Delete or adapt sections**
   - Not all sections apply to all genres
   - Fantasy needs magic systems; contemporary doesn't
   - Romance needs romantic profile sections; thriller might not
   - Delete what doesn't fit, add what you need

4. **Add genre-specific content**
   - Include unique requirements for your genre
   - Add examples from published books
   - Reference genre conventions
   - Note common pitfalls

5. **Remove instruction sections**
   - Once you've customized, delete the "INSTRUCTIONS:" paragraphs
   - Keep the structure and your content
   - Leave helpful guidance for yourself/team

---

## Customization by Genre

### If You Write Contemporary Romance:
- **Beat sheets:** Romance beat sheet, save the cat adapted for romance
- **Style guides:** Focus on voice, heat level, dialogue (banter)
- **Validation:** HEA requirement, heat level matching, romantic arc
- **Character template:** Emphasize romantic profile section, remove magic/supernatural
- **World template:** Simplify significantly or skip (real-world setting)

### If You Write Cozy Mystery:
- **Beat sheets:** Mystery investigation structure, clue placement
- **Style guides:** Light tone even with murder, clean content
- **Validation:** Amateur sleuth, small-town, justice served
- **Character template:** Sleuthing profile section, community connections
- **World template:** Small-town setting details

### If You Write Epic Fantasy:
- **Beat sheets:** Hero's journey, three-act with fantasy beats
- **Style guides:** Elevated prose, world-building integration
- **Validation:** Magic system consistency, world-building depth
- **Character template:** Powers/abilities section, species details
- **World template:** Full world-building (this is crucial)

### If You Write Thriller:
- **Beat sheets:** Fast-paced structure with twists
- **Style guides:** Punchy prose, short chapters, tension
- **Validation:** Pacing, twists, stakes escalation
- **Character template:** Skills section, stakes emphasis
- **World template:** Minimal unless unusual setting

---

## After Customization

1. **Test your genre pack:**
   - Use it to plan a book
   - Note what works and what's missing
   - Refine based on actual use

2. **Update manifest.json:**
   - Make sure file list is accurate
   - Update version number when you make changes
   - Add update date

3. **Keep it current:**
   - Update as you learn more about your genre
   - Add new beat sheets as you discover them
   - Refine validation rules based on beta reader feedback
   - Note market trends

4. **Share (optional):**
   - If you create something useful, consider sharing
   - Help other authors in your genre
   - Contribute to BQ-Studio community

---

## Example Structure

After customization, your genre pack might look like:

```
cozy-mystery/
├── manifest.json              # Configured for cozy mystery
├── README.md                  # Optional: genre-specific documentation
├── beat-sheets/
│   ├── cozy-mystery-structure.md    # Your customized beat sheet
│   └── series-arc-light.md          # Optional: for series planning
├── style-guides/
│   ├── cozy-conventions.md          # Genre requirements
│   ├── voice-and-tone.md            # Light, conversational tone
│   └── common-tropes.md             # Small-town, amateur sleuth, etc.
├── validation-rules/
│   ├── cozy-requirements.md         # Amateur sleuth, clean content, etc.
│   └── market-standards.md          # Word count, pacing, etc.
└── templates/
    ├── amateur-sleuth-character.md  # Character template with sleuthing section
    ├── small-town-setting.md        # Simplified world template for town
    └── series-bible.md              # Overall series planning
```

---

## Tips

**Start Simple:**
Don't try to create everything at once. Start with:
- manifest.json
- One primary beat sheet
- Basic style guide
- Essential validation rules

Expand over time as you use it.

**Use Examples:**
Study published books in your genre. Note:
- Where beats occur
- What tropes are common
- What style elements work
- What readers expect

**Make It Yours:**
This is YOUR reference tool. Include:
- Things you personally tend to forget
- Reminders of what works for you
- Your unique approach to the genre
- Notes from your learning journey

**Keep It Updated:**
Genre conventions evolve. Your pack should too:
- Add new trends
- Remove outdated advice
- Refine based on experience
- Note market changes

---

## Need Help?

1. **Read the main guide:** [CREATING_YOUR_GENRE_PACK.md](../CREATING_YOUR_GENRE_PACK.md)
2. **Study existing genre packs:** (When community packs are available)
3. **Ask Claude Code:** "Help me create a [genre] beat sheet"
4. **Research your genre:** Read craft books, analyze bestsellers

---

## Template Version

**Version:** 1.0
**Created:** 2025-11-21
**Last Updated:** 2025-11-21

---

**Ready to create your genre pack?**

1. Copy this folder: `cp -r _TEMPLATE_ your-genre-name`
2. Open manifest.json and start customizing
3. Work through each file
4. Test with actual planning
5. Refine and iterate

Happy genre pack creating!
