# Names & Toponyms Protocol (Genre-Agnostic)

A practical, cross-genre method to produce distinctive, readable person and place names while avoiding cliché and on‑the‑nose patterns.

---

## 1) Naming Brief
- Era & setting: time period, region(s), technological/cultural context
- Tone adjectives: restrained, aristocratic, regional, modern, archaic, etc.
- Constraints:
  - Banned morphemes (series‑wide)
  - Once‑only morphemes (≤1 across major cast unless narratively linked)
  - Phonotactics (allowed clusters, vowel patterns)

## 2) Build Palettes
- People: given/family patterns per culture (syllables, common endings, stress)
- Places: physical features (hydronyms/oronyms), historical layer, function layer

## 3) Generate Candidates (broad → prune)
- Diversity target: 70% common, 20% uncommon, 10% distinctive per culture
- Syllables: mix 1–4; Initials: ≥6 different initials across top‑10 names
- Places: compose Feature + Layer + Function (e.g., Fen + Market → “Fenmarket”)

## 4) Score & Filter
- Cliché penalty: contains banned/overused morphemes (see `cliche_morphemes.txt`) → −2 each
- Once‑only reuse: morpheme repeated beyond 1 use → −3
- Root duplication: shares root with existing registry name without relation → −2
- Distribution balance: repeated initials/suffixes beyond thresholds → −1 each
- Usability: pronounceable/readable/distinct in dialogue → +1
- Cultural/era fit (manual check): fits phonotactics/era → +2; violates → −3

## 5) Contrast & Context Checks
- Contrast: top‑10 names span ≥6 initials and 1–4 syllables
- Sentence test (dialogue/narration/formal): replace if “reads loud”/on‑the‑nose
- Nickname test: natural short form (people) or colloquial alias (places)

## 6) Freeze & Register
- Add chosen names to `names_registry.json` as entries:
  - name, type (person/place/faction), role, origin/etymology, pronunciation, era, variants, morphemes, related
- Lock once‑only morphemes; update summary stats (initials, syllables, suffix counts).

---

## Workflow Integration
- Stage 3 Gate: Initialize/update registry and run evaluation. Adjust names that fail thresholds before approval.
- Stage 5 Gate: Add new names, re‑evaluate, and resolve flags prior to sign‑off.

---

## Files
- `references/names/cliche_morphemes.txt` — cross‑genre overused morphemes
- `names_registry.json` — chosen names + stats
- `names_evaluation_report.md` — flags and recommendations

