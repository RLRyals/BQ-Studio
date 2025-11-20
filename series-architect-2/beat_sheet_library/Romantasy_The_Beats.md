# 🌹 Full Romantasy Beat Outline (YAML)

Below is the complete romantasy beat framework in **YAML** format (including the optional bonus beats).  
You can copy this block into your LLM or parse it directly.

```yaml
romantasy_beats:
  metadata:
    version: "1.0"
    schema: "romantasy.full.beats"
    notes: "Acts I–V plus optional bonus beats for deeper layering."
  act_1:
    act_title: "Act I – Collision & Catalyst"
    beats:
      - id: 1
        name: "Opening Image / Ordinary World"
        purpose: "Establish protagonist’s normal life, flaws, wound, and core theme."
        romance_thread: "Show what kind of love the MC believes they cannot have."
        fantasy_thread: "Hint at magic, court politics, or looming danger."
        emotional_state: "Restless, confined, unaware."
        scene_prompts:
          - "What is the MC missing before the story begins?"
          - "How does the world subtly show magic or power structures?"
          - "What inner flaw or belief will the story challenge?"
      - id: 2
        name: "Inciting Incident – The Disruption"
        purpose: "A magical, violent, or political event shatters the MC’s world."
        romance_thread: "First sight or first connection to the love interest."
        fantasy_thread: "Attack, abduction, summons, awakening, prophecy trigger, etc."
        emotional_state: "Shock, denial, fear."
        scene_prompts:
          - "What forces the MC into danger or into the magical world?"
          - "How does the LI enter the story — directly or indirectly?"
          - "What rule was broken that cannot be undone?"
      - id: 3
        name: "Refusal / Resistance"
        purpose: "MC resists the call to change, love, or power."
        romance_thread: "LI seems untrustworthy, arrogant, cruel, or cold."
        fantasy_thread: "MC pushes back against destiny, court rules, magic laws, or forced relocation."
        emotional_state: "Fear, resentment, uncertainty."
        scene_prompts:
          - "What does the MC refuse to accept about their new reality?"
          - "What early conflict forms between MC and LI?"
          - "What belief is blocking transformation?"
      - id: 4
        name: "Crossing the Threshold"
        purpose: "The MC fully enters the magical world or conflict."
        romance_thread: "Forced proximity begins — cannot avoid the LI."
        fantasy_thread: "Arrival at court, kingdom, rebellion, academy, or magical realm."
        emotional_state: "Reluctant acceptance, guarded curiosity."
        scene_prompts:
          - "What symbolic moment shows the point of no return?"
          - "How does the new world destabilize the MC?"
          - "Why must the MC stay close to the LI?"

  act_2:
    act_title: "Act II – Tension & Transformation"
    beats:
      - id: 5
        name: "Tests, Trials, and Training"
        purpose: "MC faces trials, danger, and world expansion."
        romance_thread: "The MC and LI clash but must work together."
        fantasy_thread: "Lessons in magic, combat, politics, or survival."
        emotional_state: "Friction, rivalry, begrudging respect."
        scene_prompts:
          - "What does the MC struggle to learn?"
          - "How does the LI challenge or provoke the MC?"
          - "What threat forces cooperation?"
      - id: 6
        name: "First Spark / Vulnerable Moment"
        purpose: "First moment of emotional intimacy or exposed vulnerability."
        romance_thread: "The first real crack in the walls — wound-tending, confession, shared history."
        fantasy_thread: "Magic reacts to emotion OR shared danger bonds them."
        emotional_state: "Curiosity, longing, confusion."
        scene_prompts:
          - "What truth or wound is revealed?"
          - "What quiet moment makes the reader ship them?"
          - "What physical or emotional closeness happens?"
      - id: 7
        name: "The World Deepens / Secrets & Stakes"
        purpose: "Reveal deeper layers of magic, politics, prophecy, or rebellion."
        romance_thread: "Growing attraction, jealousy, accidental softness."
        fantasy_thread: "New threat emerges, bigger than the MC imagined."
        emotional_state: "Wonder, growing fear, deepening bond."
        scene_prompts:
          - "What major world or lore reveal changes the stakes?"
          - "What secret does the LI hint at but not reveal?"
          - "How does the MC’s presence disrupt the world?"
      - id: 8
        name: "Midpoint Revelation / The Choice to Feel"
        purpose: "Emotional or physical turning point — they choose each other, even briefly."
        romance_thread: "Kiss, intimacy, confession, or promise — but not yet secure."
        fantasy_thread: "A truth, artifact, death, or prophecy changes the direction of the story."
        emotional_state: "Desire, hope, danger."
        scene_prompts:
          - "What moment makes them believe love might be possible?"
          - "What changes in the world because of that choice?"
          - "Why is this happiness temporary or doomed?"

  act_3:
    act_title: "Act III – Rift & Ruin"
    beats:
      - id: 9
        name: "The False Victory"
        purpose: "It looks like things are improving — but it's an illusion."
        romance_thread: "They act like lovers, allies, or equals."
        fantasy_thread: "They win a battle or gain a temporary advantage."
        emotional_state: "Peace, hope, foreshadowed dread."
        scene_prompts:
          - "What makes the reader think things might work out?"
          - "What joy or victory moment happens before everything collapses?"
      - id: 10
        name: "The Betrayal / Lie Revealed"
        purpose: "The truth detonates and destroys trust."
        romance_thread: "Identity lie, mission lie, political manipulation, prophecy reveal."
        fantasy_thread: "The LI, MC, or world authority turns out to be dangerous or deceptive."
        emotional_state: "Heartbreak, rage, betrayal."
        scene_prompts:
          - "What information breaks them apart?"
          - "Who kept the truth and why?"
          - "How does this betray both love and destiny?"
      - id: 11
        name: "The Breakup / Separation"
        purpose: "The lovers are separated physically, emotionally, morally, or magically."
        romance_thread: "One leaves, is taken, refuses the other, or believes the other is lost."
        fantasy_thread: "War, invasion, magical collapse, rebellion, exile."
        emotional_state: "Abandonment, grief, hopelessness."
        scene_prompts:
          - "Why can’t they be together — truly?"
          - "What external force makes the separation absolute?"
      - id: 12
        name: "Dark Night of the Soul"
        purpose: "MC hits their lowest point and must face themselves alone."
        romance_thread: "Realization of true love, what was lost, and what must change."
        fantasy_thread: "The world is falling apart, and only the MC can change it."
        emotional_state: "Isolation, despair, self-reflection."
        scene_prompts:
          - "What does the MC finally admit to themselves?"
          - "What power or truth is unlocked in suffering?"

  act_4:
    act_title: "Act IV – Reclamation & Reunion"
    beats:
      - id: 13
        name: "Self-Reckoning / Claiming Power"
        purpose: "MC rises, changed — chooses destiny instead of running from it."
        romance_thread: "Love becomes a reason to fight, not a wound."
        fantasy_thread: "Power is accepted, prophecy is reinterpreted, alliances form."
        emotional_state: "Resolve, courage, rebirth."
        scene_prompts:
          - "What power or knowledge does the MC now claim?"
          - "What belief did they shed?"
      - id: 14
        name: "The Grand Gesture / Reunion"
        purpose: "One risks everything to reach the other — the emotional climax."
        romance_thread: "Confession, rescue, sacrifice, devotion, forgiveness."
        fantasy_thread: "Their reunion shifts the balance of power in the world."
        emotional_state: "Fear → relief → devotion."
        scene_prompts:
          - "Who risks everything for love?"
          - "What makes the reunion earned, not convenient?"
      - id: 15
        name: "Climactic Battle / Sacrifice"
        purpose: "Love and fate merge in the final confrontation."
        romance_thread: "They fight together — or die for each other."
        fantasy_thread: "Final battle, magical duel, rebellion, curse breaking."
        emotional_state: "Terror, power, transcendence."
        scene_prompts:
          - "What sacrifice is made — life, crown, power, freedom?"
          - "How do they defeat the antagonist together?"

  act_5:
    act_title: "Act V – Coronation & Consequence"
    beats:
      - id: 16
        name: "Aftermath / Resurrection"
        purpose: "Victory comes with cost — the world is changed."
        romance_thread: "They reunite or grieve in the aftermath."
        fantasy_thread: "Magic shifts, realm rebuilds, rulers fall or rise."
        emotional_state: "Grief, exhaustion, relief."
        scene_prompts:
          - "What does victory cost?"
      - id: 17
        name: "Resolution / New Balance"
        purpose: "Their love and power reshape the world."
        romance_thread: "They choose one another freely."
        fantasy_thread: "A new world order, peace, or changed future."
        emotional_state: "Peace, promise, renewal."
        scene_prompts:
          - "Who are they now that the world has changed?"
      - id: 18
        name: "Final Image / Echo of the Beginning"
        purpose: "Return to a symbolic mirror of Beat 1 — now transformed."
        romance_thread: "A kiss, a crown, a quiet moment, a shared future."
        fantasy_thread: "A restored realm, a quiet campfire, a rebuilt court."
        emotional_state: "Completion, fulfillment."
        scene_prompts:
          - "What visual proves the journey is complete?"

  bonus_beats:
    notes: "Optional layers for depth; include as needed."
    beats:
      - id: 19
        name: "Shadow Couple Arc"
        purpose: "Secondary couple mirrors or contrasts the main romance, illuminating flaws or fate."
        usage: "Weave 2–4 scenes across Acts II–IV; intersect at climax or aftermath."
        scene_prompts:
          - "How does the shadow couple reflect the main pair’s fear or strength?"
          - "Where do their choices warn or inspire the MC/LI?"
      - id: 20
        name: "Moral Mirror (Rival/Villain Parallel)"
        purpose: "Antagonist or rival represents the path the hero could take without love or growth."
        usage: "Introduce in Act I; crystallize the mirror in Act III; resolve in Act IV/V."
        scene_prompts:
          - "What core belief does the mirror share with the MC — and where do they diverge?"
          - "What choice proves the MC won’t become the mirror?"
      - id: 21
        name: "Prophecy Twist"
        purpose: "Reinterpret or break destiny to serve character growth over fatalism."
        usage: "Seed clues in Act II; reveal the twist around the Midpoint or Act III."
        scene_prompts:
          - "What exact wording allowed a new interpretation?"
          - "How does the twist empower free will and love?"
      - id: 22
        name: "The Intimate Quiet Scene"
        purpose: "Tender human moment that re-centers stakes in love and personhood."
        usage: "Place after a loss or before the climax (II late or IV early)."
        scene_prompts:
          - "What mundane act (cooking, braiding hair, stargazing) makes them feel safe?"
          - "What unspoken promise is made here?"
      - id: 23
        name: "Epilogue / Series Hook"
        purpose: "Tease the next arc or show a glimpse of lasting peace with a question mark."
        usage: "Final pages; can be a time jump or new POV."
        scene_prompts:
          - "What thread remains unresolved by design?"
          - "What image offers hope or haunting foreshadowing?"
      - id: 24
        name: "The Thematic Refrain"
        purpose: "Echo the story’s core message in a single repeated line or symbol."
        usage: "Seed in Act I; repeat with new meaning in the finale."
        scene_prompts:
          - "What short line captures the theme (e.g., 'Love is the magic they fear')?"
          - "How does its meaning evolve from Act I to Act V?"

custom_beats:
  # Act I — Collision & Catalyst (target ≲12%)
  - name: "Inciting Incident – The Disruption"
    must_land: "Act I (<=12%)"
    attaches_to: "Truby: Problem → Desire ignition"
    notes: "Magical/political shock; connects MC↔LI; triggers threshold."

  - name: "Crossing the Threshold"
    must_land: "Act I (10–20%)"
    attaches_to: "Truby: Plan begins (entry to new arena)"
    notes: "Forced proximity / entry into magical court, academy, rebellion, etc."

  # Act II — Tension & Transformation (≈20–50%)
  - name: "Tests, Trials, and Training"
    must_land: "Act II (25–40%)"
    attaches_to: "Truby: Plan under Opposition"
    notes: "Skill build + opponent pressure; friction with LI."

  - name: "First Spark / Vulnerable Moment"
    must_land: "Act II (30–45%)"
    attaches_to: "Truby: Minor Revelation → Desire refines"
    notes: "Emotional intimacy; magic reacts to emotion."

  - name: "The World Deepens / Secrets & Stakes"
    must_land: "Act II (35–50%)"
    attaches_to: "Truby: Opposition escalates"
    notes: "Lore/politics/prophecy reveal raises risk."

  # Act III — Rift & Ruin (Midpoint to Crisis)
  - name: "Midpoint Revelation / The Choice to Feel"
    must_land: "Act III (50% ±5%)"
    attaches_to: "Truby: Major Revelation → Re-aim"
    notes: "Kiss/intimacy/confession paired with world-altering truth."

  - name: "False Victory"
    must_land: "Act III (55–65%)"
    attaches_to: "Truby: Plan temporary success"
    notes: "They act as lovers/allies; peace before the fall."

  - name: "Betrayal / Lie Revealed"
    must_land: "Act III (65–72%)"
    attaches_to: "Truby: Revelation exposes Opponent power"
    notes: "Identity/mission/prophecy truth detonates trust."

  - name: "Breakup / Separation"
    must_land: "Act III (70–78%)"
    attaches_to: "Truby: Approach to Battle (stakes spike)"
    notes: "Physical/emotional/magical separation; exile/abduction/war."

  - name: "Dark Night of the Soul"
    must_land: "Act III (75–82%)"
    attaches_to: "Truby: Self-knowledge pressure (pre-Revelation)"
    notes: "Alone with the wound; admits what must change."

  # Act IV — Reclamation & Reunion (toward Climax)
  - name: "Self-Reckoning / Claiming Power"
    must_land: "Act IV (80–88%)"
    attaches_to: "Truby: Self-Revelation → New Plan"
    notes: "Chooses destiny; moral shift enables agency."

  - name: "Grand Gesture / Reunion"
    must_land: "Act IV (86–92%)"
    attaches_to: "Truby: New Plan under fire"
    notes: "Earned forgiveness/rescue/sacrifice; shifts power balance."

  - name: "Climactic Battle / Sacrifice"
    must_land: "Act V (90–95%)"
    attaches_to: "Truby: Battle"
    notes: "Love + fate merge; defeat the antagonist together."

  # Act V — Coronation & Consequence (denouement)
  - name: "Aftermath / Resurrection"
    must_land: "Act V (95–98%)"
    attaches_to: "Truby: Consequence of Battle"
    notes: "Victory with cost; realm changes."

  - name: "Resolution / New Balance"
    must_land: "Act V (98–100%)"
    attaches_to: "Truby: New Equilibrium"
    notes: "They choose each other freely; world order set."

  - name: "Final Image / Echo"
    must_land: "Act V (final page)"
    attaches_to: "Truby: New Equilibrium (symbolic)"
    notes: "Mirror of Opening Image, transformed."

  # Optional Layers (the macro treats these as non-required but placeable)
  - name: "Shadow Couple Arc"
    must_land: "Acts II–IV (sprinkle)"
    attaches_to: "Truby: Counter-theme mirror"
    notes: "2–4 scenes; intersects at climax/aftermath."
    optional: true

  - name: "Moral Mirror (Rival/Villain Parallel)"
    must_land: "Acts I–V (introduce early; crystallize III)"
    attaches_to: "Truby: Moral Argument"
    notes: "The path the hero could take without love/growth."
    optional: true

  - name: "Prophecy Twist"
    must_land: "Act II–III (seed II; reveal Mid/III)"
    attaches_to: "Truby: Revelation → Re-aim"
    notes: "Destiny reinterpreted to serve choice over fate."
    optional: true

  - name: "The Intimate Quiet Scene"
    must_land: "Act II late or Act IV early"
    attaches_to: "Truby: Value contrast; stakes re-centering"
    notes: "Tender human moment pre/post loss."
    optional: true

  - name: "Epilogue / Series Hook"
    must_land: "Final pages"
    attaches_to: "Truby: New Equilibrium → Next engine"
    notes: "Glimpse of peace with a question mark."
    optional: true

  - name: "The Thematic Refrain"
    must_land: "Act I seed → Act V echo"
    attaches_to: "Truby: Image System (moral echo)"
    notes: "Short line/symbol repeated with new meaning."
    optional: true

```
