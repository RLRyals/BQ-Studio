# Intake Samples - Testing Mode Quick Start

This directory contains 5 pre-filled intake forms (A-E) designed to demonstrate the Series Architect workflow without requiring users to answer lengthy questionnaires.

---

## What Are Intake Samples?

Intake samples are **pre-configured project setups** that allow you to:
- Experience the full workflow in 30-60 minutes
- See how different beat sheet frameworks work
- Test the system before committing to your own project
- Learn by example with realistic scenarios

Each sample is paired with a specific beat sheet from the `beat_sheet_library/` directory.

---

## Available Samples

### Sample A: Mutual Trauma Bonding
**File:** `intake_A_mutual_trauma_bonding.md`
**Beat Sheet:** `beat_sheet_library/A_MutualTrauma_Bonding.md`

**Project:** *Shattered & Bound* (5-book series)
- **Premise:** Both MCs are survivors of similar trauma; they co-regulate and heal together
- **Genre:** Contemporary Romance / Trauma Healing
- **Heat:** 3 🌶️ (medium, emotionally grounded)
- **Violence:** 2 🔪 (past-event references, non-graphic)
- **Structure:** Parallel development (outline all books, then detail)

**Best for demonstrating:**
- Trauma-informed romance with consent protocols
- Dual character arcs with mirror wounds
- Co-regulation and grounding techniques
- Parallel healing journeys

**Who should use this sample:**
- Writers interested in trauma representation
- Those exploring dark romance with emotional safety
- Authors wanting to see consent-forward intimacy escalation

---

### Sample B: Protector × Wounded
**File:** `intake_B_protector_wounded.md`
**Beat Sheet:** `beat_sheet_library/B_Protector_Wounded.md`

**Project:** *Guarding Grace* (5-book series)
- **Premise:** Protector/caretaker dynamic with power rebalancing; wounded MC reclaims agency
- **Genre:** Contemporary Romance / Bodyguard Romance
- **Heat:** 3 🌶️ (medium heat, power-aware)
- **Violence:** 2 🔪 (situational threats, protective action)
- **Structure:** Sequential development (complete Book 1, then Book 2, etc.)

**Best for demonstrating:**
- Asymmetric power dynamics addressed directly
- Agency restoration for wounded character
- Caretaker burnout subplot
- Mutual rescue theme (subverting savior tropes)

**Who should use this sample:**
- Writers exploring protector archetypes
- Those interested in bodyguard/guardian romance
- Authors wanting to subvert rescue fantasies responsibly

---

### Sample C: Toxic Coping → Healing
**File:** `intake_C_toxic_coping.md`
**Beat Sheet:** `beat_sheet_library/C_Toxic_Coping.md`

**Project:** *Breaking Clean* (5-book series)
- **Premise:** Redemption arc with addiction/destructive patterns; MC hits rock bottom then rebuilds
- **Genre:** Contemporary Romance / Recovery Drama
- **Heat:** 2 🌶️ (lower heat, recovery-focused)
- **Violence:** 3 🔪 (self-harm potential, intervention scenes)
- **Structure:** Single book focus (develop Book 1 only, plan others later)

**Best for demonstrating:**
- Maladaptive coping mechanisms on page
- Intervention and accountability beats
- Professional help integration (therapy, support groups)
- Non-linear healing progression
- Amends and rebuilding trust

**Who should use this sample:**
- Writers tackling addiction or self-destructive behavior
- Those interested in redemption arcs
- Authors wanting realistic recovery representation

---

### Sample D: Post-Trauma Re-Entry
**File:** `intake_D_post_trauma_reentry.md`
**Beat Sheet:** `beat_sheet_library/D_PostTrauma_Reentry.md`

**Project:** *Coming Home Broken* (5-book series)
- **Premise:** Veteran/survivor returns from crisis; struggles with reintegration and identity reconstruction
- **Genre:** Contemporary Romance / Military/Veteran Romance
- **Heat:** 2 🌶️ (gentle, PTSD-aware)
- **Violence:** 2 🔪 (flashbacks, past trauma referenced)
- **Structure:** Parallel development

**Best for demonstrating:**
- PTSD representation with grounding techniques
- Reintegration challenges (civilian life, relationships, employment)
- Support system building (found family)
- Identity reconstruction after trauma
- Chosen family themes

**Who should use this sample:**
- Writers tackling veteran romance
- Those interested in PTSD/trauma reintegration
- Authors exploring identity after crisis

---

### Sample E: Dark Trauma Hybrid
**File:** `intake_E_dark_trauma_hybrid.md`
**Beat Sheet:** `beat_sheet_library/E_Dark_TraumaHybrid.md`

**Project:** *Beautiful Ruin* (5-book series)
- **Premise:** High-intensity dark romance with heavy themes; explicit consent tracking despite dark content
- **Genre:** Dark Romance / Psychological Thriller Romance
- **Heat:** 4 🌶️ (high heat, explicit)
- **Violence:** 4 🔪 (on-page violence, intense scenes)
- **Structure:** Sequential development

**Best for demonstrating:**
- Dark romance with safety rails
- Morally gray/complex characters
- Explicit consent framework for intense scenes
- Trigger warning management
- Aftercare and processing scenes despite dark themes
- Dubious situations handled with consent tracking

**Who should use this sample:**
- Writers exploring dark romance
- Those interested in morally complex characters
- Authors needing framework for intense/dark content with emotional safety

---

## How to Use Intake Samples

### Option 1: Via Testing Quickstart Script
```bash
python3 scripts/testing_quickstart.py --sample A
# or B, C, D, E
```

This automatically:
1. Copies the chosen sample to `outputs/intake_form.md`
2. Creates/updates `outputs/memory.json` with testing mode flags
3. Marks Stage 1 as complete
4. Sets up for Stage 2 (Research Phase)

### Option 2: Via AI Agent Prompting
```
"Start Testing mode. I want to see sample B (Protector × Wounded)."
```

The AI will:
1. Present sample descriptions
2. Copy chosen sample on approval
3. Set `testing: true` flag in memory
4. Proceed from Stage 2 with Express defaults

### Option 3: Manual Copy (For Customization)
```bash
cp intake_samples/intake_B_protector_wounded.md outputs/intake_form.md
# Then manually edit as desired
```

---

## Sample Structure

Each intake file includes:
- **Project Parameters** - Books, chapters, word counts, genre
- **Content Levels** - Heat 🌶️ and violence 🔪 ratings
- **Development Approach** - Sequential, parallel, or single book focus
- **Series Overview** - High-level concept
- **Beat Sheet Selection** - Which framework to use
- **Character Notes** - Initial MC concepts
- **World Notes** - Setting/world elements (if applicable)
- **Universal Fantasies** - Emotional reader desires to fulfill
- **Additional Context** - Special considerations

---

## Mapping to Beat Sheets

| Sample | Beat Sheet | Genre Focus | Heat | Violence | Key Themes |
|--------|-----------|-------------|------|----------|------------|
| A | A_MutualTrauma_Bonding.md | Contemporary | 3 | 2 | Co-regulation, shared healing |
| B | B_Protector_Wounded.md | Bodyguard | 3 | 2 | Power rebalancing, agency |
| C | C_Toxic_Coping.md | Recovery | 2 | 3 | Redemption, accountability |
| D | D_PostTrauma_Reentry.md | Veteran | 2 | 2 | Reintegration, PTSD |
| E | E_Dark_TraumaHybrid.md | Dark Romance | 4 | 4 | Consent in dark themes |

---

## Customizing Samples

You can use a sample as a **starting point** and modify:
1. Copy the sample to `outputs/intake_form.md`
2. Edit the parameters (change book count, heat level, etc.)
3. Adjust character concepts and world notes
4. Keep or change the beat sheet selection
5. Start the workflow from Stage 2

This gives you a head start while tailoring to your needs.

---

## Creating Your Own Samples

To add custom samples for your team or organization:

1. **Complete a full workflow** (Stages 1-6)
2. **Save the intake_form.md** from outputs
3. **Anonymize or genericize** the content
4. **Copy to intake_samples/** with naming: `intake_[X]_[description].md`
5. **Update this README** with the new sample description
6. **Pair with a beat sheet** (existing or custom)

**Naming convention:** `intake_[LETTER]_[short_descriptor].md`
- Use letters F-Z for custom samples
- Keep descriptors lowercase with underscores
- Match to beat sheet naming if creating paired framework

---

## Testing Mode Workflow

When using samples in Testing mode, the workflow follows:

1. **Stage 1 (Intake)** - ✅ Pre-completed (sample file)
2. **Stage 2 (Research)** - Light/baseline research (time-boxed)
3. **Stage 3 (Framework)** - Minimal scaffolding (Express defaults)
4. **Stage 4 (Dossier)** - Auto-select template based on sample
5. **Stage 5 (Development)** - Develop Book 1 only (demo)
6. **Stage 6 (Output)** - Generate compiled dossier

**Typical duration:** 30-60 minutes for Book 1 demo

---

## Tips for Using Samples

### For Learning
- Try multiple samples to see different beat sheet styles
- Compare trauma-informed frameworks (A-E) to standard romance
- Notice how heat/violence levels affect content planning

### For Evaluation
- Use Testing mode to assess if Series Architect fits your needs
- Compare output quality across different samples
- Evaluate template comprehensiveness

### For Inspiration
- Use samples as springboards for your own projects
- Mix elements from multiple samples
- Study how different themes are structured

---

## Sample Outcomes

After completing a sample workflow, you'll have:
- **Completed Book 1 dossier** (~5,000-10,000 words of planning)
- **Chapter outlines** for Acts 1-5 (if split by acts)
- **Character profiles** with arcs mapped to beats
- **Beat-by-beat outline** showing story progression
- **World-building guide** (if applicable)
- **Names registry** with cliché evaluation
- **Navigation index** showing all generated files

This demonstrates the **full output structure** you'd get for your own projects.

---

## Frequently Asked Questions

### Can I use a sample for my actual book?
Yes! Customize the intake file with your specifics and use it as your project foundation.

### How accurate are the sample projects?
Samples are realistic representations of actual romance/romantasy series planning, not toy examples.

### Why are all samples romance/dark romance?
Series Architect is optimized for romance and romantasy genres. For other genres, use the three-act structure beat sheet with custom modifications.

### Can I mix beat sheets?
Not within a single book, but you can use different beat sheets for different books in a series. The AI will guide you through this.

### What if I want more heat or violence?
Copy and edit the sample's content levels in `outputs/intake_form.md` before starting Stage 2.

---

**Last Updated:** 2025-11-10
**Compatible With:** Series Architect v2.1+

For more information, see:
- [QUICKSTART.md](../QUICKSTART.md) - General getting started guide
- [SKILL.md](../SKILL.md) - Complete workflow documentation
- [references/beat_sheets.md](../references/beat_sheets.md) - Beat sheet selection guide
