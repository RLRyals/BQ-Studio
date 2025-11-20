[instructions]

## How to Create Your Own Beat Frameworks

### 1) Decide your chassis
  - **phases (4×5=20 beats):** Best for romance, dark romance, trauma-informed arcs.
  - **acts (3–5 acts):** Best for romantasy/epic or when you want “quest + romance.”
  - **Tip:** Pick **one** chassis (phases *or* acts) for a single framework.

### 2) Name the framework (human + machine)
  - Human-facing title:  *e.g.,* “Winter Town Enemies-to-Lovers”
  - Machine-facing schema:  *e.g.,* `romance.winter_town.enemies_to_lovers.v1`
  - Keep a `version` string, *e.g.,* `"1.0"`.

### 3) Choose labeling & IDs
  - Use **stable, ascending `id`** per beat (1…20 or 1…N).
  - Use **`snake_case`** for internal keys; **Title Case** for display names.

### 4) Pick your thread lanes (columns you’ll fill per beat)
  - Always include: `romance_thread`, `purpose`, `scene_prompts[]`.
  - Add as needed: `external_plot_thread`, `fantasy_thread`, `trauma_thread`, `emotional_state`.
  - For dark/trauma frameworks: add `power_dynamic`, `consent_safety`, `spice_target`.

### 5) Define safety & heat policy (once, then per beat)
  - Put global notes in `metadata.heat_model`, `trigger_warnings`.
  - Per-beat, use `consent_safety` and `spice_target` to control on-page content.

### 6) Write beats as **value shifts**
  - Each beat’s **`purpose`** should express a change, not an activity.
  - Phrase prompts as **questions** to unlock drafting quickly.

### 7) Keep it portable
  - One **YAML block** inside a Markdown file.
  - Top-level key names are unique per framework (*e.g.,* `rtb_beats`, `drtb_beats`, `romantasy_beats`, or your own).
  - Avoid tool-specific syntax inside YAML (plain strings and lists).

### 8) Provide bracketed guidance in-place
  - Use square brackets `[...]` for author-facing instructions/placeholders.
  - Keep the value type stable: strings for text, arrays for prompts.

### 9) Add optional `custom_beats`
  - Use when you want cross-mapping: *e.g.,* “Save the Cat—Midpoint,” “All Is Lost.”

### 10) Sanity-check before use
  - Are IDs continuous?  
  - Does every beat have **at least** `name`, `purpose`, `romance_thread`, and one `scene_prompts` item?  
  - Do optional lanes exist **only** where relevant (no empty keys everywhere)?  

[/instructions]

[template_worksheet]
## Reusable Beat Framework Template (copy → tailor → fill)

### Usage
  - Keep **either** `phases` **or** `acts`. Delete the other block.
  - Replace bracketed text `[...]` with your content.
  - Keep field names; extend only if your workflow needs it.

```yaml
metadata:
  version: "1.0"
  title: "[human-friendly name of this framework]"
  schema: "[machine_name.like_this.v1]"
  type: "[choose: romance | dark_romance | romantasy | trauma_romance | custom]"
  labeling_style: "snake_case"
  heat_model: "[none | closed_door | open_door | explicit]"
  notes: "[1–2 lines on intended use and subgenre fit]"

trigger_warnings:
  - "[list possible content warnings or write 'none']"

# Pick ONE of the following top-level containers for your beats:
#  - rtb_beats / drtb_beats / romantasy_beats / custom_beats_root
# Name it something stable for your ecosystem:
my_beats:

  # ──────────────────────────────────────────────────────────
  # OPTION A: 4-Phase chassis (20 beats)
  # Keep this 'phases' block OR delete it if using 'acts'.
  phases:
    phase_1:
      label: "[opening_state | normal_world | collide]"
      beats:
        - id: 1
          name: "[beat name: e.g., meet_cute]"
          purpose: "[what value changes here? (e.g., isolation → spark)]"
          romance_thread: "[small step in intimacy (e.g., curiosity, denial, spark)]"
          external_plot_thread: "[outside pressure/conflict or 'n/a']"
          fantasy_thread: "[magic/political stakes or 'n/a']"
          trauma_thread: "[wound/safety need surfaced or 'n/a']"
          emotional_state: "[state_at_start → state_at_end]"
          power_dynamic: "[optional; e.g., rivals, boss/employee, captor/captive]"
          consent_safety: "[boundaries, signals, aftercare; 'check-in only' okay]"
          spice_target: "[fade_to_black | kissing | heavy_petting | explicit | n/a]"
          scene_prompts:
            - "[question that would produce a scene]"
            - "[2–3 prompts total is ideal]"
        - id: 2
          name: "[beat name]"
          purpose: "[value shift]"
          romance_thread: "[intimacy movement]"
          external_plot_thread: "[pressure/conflict]"
          emotional_state: "[→]"
          consent_safety: "[if relevant]"
          spice_target: "[if relevant]"
          scene_prompts:
            - "[prompt]"
        # ...continue until id: 5 for phase_1

    phase_2:
      label: "[rising_complication | magnetism_vs_masks]"
      beats:
        - id: 6
          name: "[beat name]"
          purpose: "[value shift]"
          romance_thread: "[movement]"
          external_plot_thread: "[pressure/conflict]"
          fantasy_thread: "[optional]"
          trauma_thread: "[optional]"
          emotional_state: "[→]"
          consent_safety: "[if relevant]"
          spice_target: "[if relevant]"
          scene_prompts:
            - "[prompt]"
        # ...ids 7–10

    phase_3:
      label: "[crisis | fracture | dark_moment]"
      beats:
        - id: 11
          name: "[beat name]"
          purpose: "[value shift]"
          romance_thread: "[movement]"
          external_plot_thread: "[pressure/conflict]"
          emotional_state: "[→]"
          consent_safety: "[if relevant]"
          spice_target: "[if relevant]"
          scene_prompts:
            - "[prompt]"
        # ...ids 12–15

    phase_4:
      label: "[repair | proof | commitment]"
      beats:
        - id: 16
          name: "[beat name]"
          purpose: "[value shift]"
          romance_thread: "[movement]"
          external_plot_thread: "[pressure/resolution]"
          emotional_state: "[→]"
          consent_safety: "[if relevant]"
          spice_target: "[if relevant]"
          scene_prompts:
            - "[prompt]"
        # ...ids 17–20

  # ──────────────────────────────────────────────────────────
  # OPTION B: Act chassis (3–5 acts; romantasy-friendly)
  # Keep this 'acts' block OR delete it if using 'phases'.
  acts:
    act_1:
      label: "[ordinary_world → inciting_magic]"
      beats:
        - id: 1
          name: "[beat name]"
          purpose: "[value shift]"
          romance_thread: "[movement]"
          fantasy_thread: "[inciting wonder / taboo / prophecy]"
          external_plot_thread: "[call to adventure or refusal cost]"
          emotional_state: "[→]"
          scene_prompts:
            - "[prompt]"
        # ...ids 2–X for act_1

    act_2:
      label: "[tests_allies_enemies | bond_in_trials]"
      beats:
        - id: [next_id_number]
          name: "[beat name]"
          purpose: "[value shift]"
          romance_thread: "[movement]"
          fantasy_thread: "[trial, pact, forbidden aid]"
          external_plot_thread: "[antagonist pressure]"
          consent_safety: "[boundaries under stress]"
          spice_target: "[if relevant]"
          scene_prompts:
            - "[prompt]"
        # ...continue through acts 3–5 as needed

  # ──────────────────────────────────────────────────────────
  # OPTIONAL: Cross-maps and bonus anchors
  custom_beats:
    - key: "[unique_key_like_midpoint_truth]"
      display_name: "[Midpoint—Truth Glimpse]"
      aligns_with: "[save_the_cat.midpoint | story_grid.midpoint | truby.self_revelation]"
      purpose: "[why you want this extra control point]"
      notes: "[how to use it when drafting]"
````

### Fill Guidance (quick heuristics)

* **purpose:** “[state A] → [state B]” (value change, not choreography).
* **romance_thread:** “micro-step” verbs: *notice → spark → trust → reveal → choice → proof → vow*.
* **external_plot_thread:** pressure that *forces* the micro-step.
* **fantasy/trauma threads:** only add when genuinely plot-active.
* **emotional_state:** “felt sense” before/after: *guarded → curious*, *ashamed → seen*.
* **consent_safety:** concrete behaviors: *verbal check-in, safeword confirmed, aftercare planned*.
* **spice_target:** set on a **ladder** across the middle beats; taper into **proof/aftercare** near the end.

[/template_worksheet]
