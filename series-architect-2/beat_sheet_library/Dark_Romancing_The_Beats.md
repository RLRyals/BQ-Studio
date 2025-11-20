# Dark Romancing the Beat (20-Beat) — YAML Master Outline

Below is the **Dark Romance** version of the 4‑phase, 20‑beat framework in **YAML** format, modeled after your Romantasy/Dark framework we developed earlier, but adapted for contemporary/non‑fantasy dark romance. It preserves emphasis on trauma, power exchange, consent, aftercare, and high‑heat scenes without explicit detail.

```yaml
drtb_beats:
  metadata:
    version: "1.0"
    schema: "dark_romance.rtb.20beats"
    notes: "Dark Romance 4-phase, 20-beat structure with power, consent, and aftercare lenses; compatible with plotting templates."
    recommended_use: "Pair each beat with POV, Scene Type, Spice, Wound, Conflict, and Outcome fields."
  
  # -----------------------------
  # PHASE I — The Wound and the Trigger
  # -----------------------------
  phase_1:
    phase_title: "Phase I — The Wound and the Trigger"
    principle: "Falling in love isn’t the goal; survival and control are."
    beats:
      - id: 1
        name: "Opening Scar"
        purpose: "Surface the MC’s core wound (abandonment, betrayal, shame, control) and the hostile world that shaped it."
        romance_thread: "Love is contraindicated; attraction = threat."
        external_plot_thread: "Money, safety, reputation, or blackmail pressure established."
        power_dynamic: "Asymmetric; MC has low leverage."
        consent_safety: "None required; establish boundaries they currently lack."
        spice_target: 0
        scene_prompts:
          - "What daily behavior shows their survival strategy?"
          - "What symbol anchors the wound (e.g., scar, object, ritual)?"
      - id: 2
        name: "The Collision (Meet Brutal / Meet Beautiful)"
        purpose: "Protagonist and Love Interest meet under morally gray or coercive-adjacent circumstances."
        romance_thread: "Chemistry reads as danger; curiosity mixes with fear/disgust."
        external_plot_thread: "Job, debt, rescue, or leverage forces interaction."
        power_dynamic: "LI > MC (positional power)"
        consent_safety: "Explicit verbal check or ground rule even in nonsexual scene."
        spice_target: 1
        scene_prompts:
          - "What concrete leverage keeps them in contact?"
          - "What single moment makes the dangerous person irresistible?"
      - id: 3
        name: "Denial (‘You’re the Last Person I Should Want’)"
        purpose: "Both reject their attraction because it exposes their control issues."
        romance_thread: "Projection, contempt, or moral superiority masks arousal."
        external_plot_thread: "Separation has a real cost (money, safety, opportunity)."
        power_dynamic: "Verbal sparring; boundaries asserted."
        consent_safety: "State limits; refusal is honored on-page."
        spice_target: 0
        scene_prompts:
          - "What judgment each makes about the other and why it’s wrong?"
          - "What excuse keeps them ‘professional’ while not leaving?"
      - id: 4
        name: "The Chain (Adhesion via Power/Debt/Circumstance)"
        purpose: "Force proximity with negotiation (contract, shelter, debt, protection)."
        romance_thread: "Compelled closeness seeds intimacy."
        external_plot_thread: "Failure to adhere risks livelihood/reputation."
        power_dynamic: "Formalized imbalance (rules, surveillance, locked spaces)."
        consent_safety: "Introduce safe phrase/signals; codify exit options."
        spice_target: 1
        scene_prompts:
          - "What rules keep them together—and who wrote them?"
          - "What is the meaningful escape clause?"
      - id: 5
        name: "The Crack Appears (Glimmer of Humanity)"
        purpose: "A brief vulnerability or caretaking reframes the monster as human."
        romance_thread: "Kindness, competence, or confession makes the reader root for the irredeemable."
        external_plot_thread: "Shared small win or crisis handled together."
        power_dynamic: "Momentary equalization."
        consent_safety: "Model check-ins (water, warmth, pain, ‘do you want to continue?’)."
        spice_target: 1
        scene_prompts:
          - "What tiny, specific care is shown without fanfare?"
          - "What does the MC now suspect about the LI’s wound?"

  # -----------------------------
  # PHASE II — The Obsession
  # -----------------------------
  phase_2:
    phase_title: "Phase II — The Obsession"
    principle: "Desire deepens faster than trust; control becomes courtship."
    beats:
      - id: 6
        name: "Temptation Games"
        purpose: "Ritualized seduction with rules; testing limits."
        romance_thread: "Push-pull play; pleasure entwines with power."
        external_plot_thread: "Risk of discovery, rival, or escalating leverage."
        power_dynamic: "Negotiated—but still skewed."
        consent_safety: "On-page negotiation; implement stop signals; aftercare plan."
        spice_target: 2
        scene_prompts:
          - "What sensory ritual frames their play (lighting, mirrors, music)?"
          - "How is consent made visible without killing the vibe?"
      - id: 7
        name: "First Corruption / First Surrender"
        purpose: "Cross the first real line together; addictive high follows."
        romance_thread: "Loss of control feels like liberation."
        external_plot_thread: "Someone/thing sees or suspects; stakes rise."
        power_dynamic: "MC chooses to submit/lead; LI yields/answers."
        consent_safety: "Before/during/after checks; limits respected."
        spice_target: 3
        scene_prompts:
          - "Who initiates, who yields, what rule is new?"
          - "What do they admit in aftermath that they could not before?"
      - id: 8
        name: "Addiction"
        purpose: "They seek each other out; logic erodes; dependency forms."
        romance_thread: "Heat scenes parallel emotional disclosure."
        external_plot_thread: "Secrets, reputations, family/work pressure intensify."
        power_dynamic: "Oscillating control; both complicit."
        consent_safety: "Fatigue/aftercare shown; add/adjust limits."
        spice_target: 3
        scene_prompts:
          - "What pattern makes them unable to stop?"
          - "What outside cost is mounting?"
      - id: 9
        name: "Mirror Scene (Power Shift)"
        purpose: "Reversal that exposes the other’s trauma; empathy blooms."
        romance_thread: "Formerly submissive leads; formerly dominant obeys."
        external_plot_thread: "Private reversal risks public fallout if exposed."
        power_dynamic: "Deliberate flip; equality glimpsed."
        consent_safety: "New limits for the reversal; monitoring/cool-down."
        spice_target: 4
        scene_prompts:
          - "What tool/setting mirrors earlier scene with roles swapped?"
          - "What truth is seen in the aftermath?"
      - id: 10
        name: "The Fracture (Fear of Exposure)"
        purpose: "Betrayal or truth detonates trust; walls slam back up."
        romance_thread: "Retreat into denial/anger; love = danger."
        external_plot_thread: "Public story, rival, blackmail, or witnessing."
        power_dynamic: "Power reverts to armor; distance imposed."
        consent_safety: "Stop all play; articulate harm; pause to reassess."
        spice_target: 1
        scene_prompts:
          - "What specific fact or omission breaks them?"
          - "Who leaves, who lets them go, and at what cost?"

  # -----------------------------
  # PHASE III — The Ruin
  # -----------------------------
  phase_3:
    phase_title: "Phase III — The Ruin"
    principle: "The only way out of the dark is through truth and consequence."
    beats:
      - id: 11
        name: "The Fall / Breakup"
        purpose: "Relationship implodes; worst fears validated."
        romance_thread: "Abandonment, betrayal, or moral boundary crossed."
        external_plot_thread: "Scandal, job loss, family ultimatum, legal heat."
        power_dynamic: "No contact or hostile distance."
        consent_safety: "No intimacy; ethics foregrounded."
        spice_target: 0
        scene_prompts:
          - "What do they lose right now—status, safety, community?"
          - "What accusation cuts deepest and why?"
      - id: 12
        name: "The Abyss (Dark Night of the Soul)"
        purpose: "Alone with themselves; reckon with complicity and need."
        romance_thread: "The attraction wasn’t a mistake; the lies were."
        external_plot_thread: "Outside world worsens, forcing a decision."
        power_dynamic: "None; isolation."
        consent_safety: "Therapy/ally/mentor scene optional."
        spice_target: 0
        scene_prompts:
          - "What belief must die to make love possible?"
          - "What promise replaces the old protection?"
      - id: 13
        name: "The Reckoning (Truth or Death)"
        purpose: "Confront abuser/rival/self; choose growth with cost."
        romance_thread: "Love demands truth, apology, boundary, or sacrifice."
        external_plot_thread: "Public confession or confrontation under pressure."
        power_dynamic: "Voluntary surrender of leverage."
        consent_safety: "If re-approaching intimacy, re-negotiate from zero."
        spice_target: 0
        scene_prompts:
          - "What action proves change today—not words?"
          - "Who benefits from the cost besides the couple?"
      - id: 14
        name: "Sacrifice / Grand Gesture Plan"
        purpose: "A plan that risks pride, status, safety, or freedom for the LI’s good."
        romance_thread: "Gesture is tailored to the wound and love language."
        external_plot_thread: "Requires facing public/antagonist/institution."
        power_dynamic: "Kneeling, yielding, or equalization by deed."
        consent_safety: "No intimacy yet; prove safety first."
        spice_target: 0
        scene_prompts:
          - "What is given up that cannot be easily regained?"
          - "How will the LI feel undeniably protected/seen?"
      - id: 15
        name: "The Ruin Kiss (Grand Gesture)"
        purpose: "Climactic emotional/physical act fusing love and pain; rebirth through ruin."
        romance_thread: "Confession + acceptance under real pressure."
        external_plot_thread: "Gesture intersects with public or antagonist resolution."
        power_dynamic: "From dominance/submission → chosen equality."
        consent_safety: "Re-negotiation; explicit ‘yes’ before intimacy resumes; aftercare on page."
        spice_target: 4
        scene_prompts:
          - "What reversal makes this scene different from all prior heat?"
          - "What line/action signals new equality?"

  # -----------------------------
  # PHASE IV — The Rebirth
  # -----------------------------
  phase_4:
    phase_title: "Phase IV — The Rebirth"
    principle: "Love doesn’t save them; it makes them honest."
    beats:
      - id: 16
        name: "Proof of Transformation"
        purpose: "Characters behave in ways they could not in Phase I; new choices under stress."
        romance_thread: "Care, boundaries, and shared authorship on page."
        external_plot_thread: "Take a reputational or financial hit for truth."
        power_dynamic: "Equilibrium; negotiated roles."
        consent_safety: "Aftercare normalized; private signals established."
        spice_target: 1
        scene_prompts:
          - "What stressor proves they won’t relapse into old coping?"
          - "What boundary is lovingly enforced?"
      - id: 17
        name: "Declaration of Truth / Love"
        purpose: "Not idealized ‘I love you,’ but ‘I see you and choose you, scars and all.’"
        romance_thread: "Plain speech or deed with no performative flourish."
        external_plot_thread: "Community/family acknowledgment shifts."
        power_dynamic: "Balanced; no threats."
        consent_safety: "N/A"
        spice_target: 1
        scene_prompts:
          - "Who declares first and why now?"
          - "What acceptance looks like for the other?"
      - id: 18
        name: "Quiet Aftermath (HEA/HFN)"
        purpose: "Show sustainable choice; peace built from honesty, not fantasy."
        romance_thread: "Domestic or ritual intimacy; gentleness after storm."
        external_plot_thread: "Work/life redesigned around truth."
        power_dynamic: "Stable partnership."
        consent_safety: "Aftercare as normal intimacy."
        spice_target: 1
        scene_prompts:
          - "What small ritual says ‘home’ for them?"
          - "What flaw remains—but is manageable together?"
      - id: 19
        name: "New World Order"
        purpose: "External consequences settle; their dynamic is visible and functional."
        romance_thread: "Partnership meets the world without pretending."
        external_plot_thread: "Roles, careers, or reputations reconfigured."
        power_dynamic: "Public equality; private negotiated play continues."
        consent_safety: "Boundaries remain visible to the reader."
        spice_target: 0
        scene_prompts:
          - "Who must adjust and how do the MC/LI hold the line?"
          - "What public gesture signals health?"
      - id: 20
        name: "Closing Image — The Scar and the Hand"
        purpose: "Echo Beat 1 with the wound touched by love; symbol of earned intimacy."
        romance_thread: "A scar, token, or ritual now means safety and choice."
        external_plot_thread: "Life continues with new equilibrium."
        power_dynamic: "Soft, chosen equality."
        consent_safety: "N/A"
        spice_target: 1
        scene_prompts:
          - "What image mirrors the opening but healed?"
          - "What line lands the theme of love through truth?"

  # -----------------------------
  # BONUS LAYERS (Optional but recommended for Dark Romance)
  # -----------------------------
  bonus_beats:
    notes: "Use these to customize intensity and ethics across the book."
    beats:
      - id: 21
        name: "Consent & Aftercare (Standing Beat)"
        purpose: "Normalize negotiation and aftercare as part of the romance aesthetic."
        usage: "Before/after high-intensity scenes; vary language to keep tone."
        prompts:
          - "What signals/phrases are theirs?"
          - "What aftercare ritual suits each POV?"
      - id: 22
        name: "Spice Ladder (Designed Escalation)"
        purpose: "Plan heat increases and decreases with narrative function."
        usage: "0–1 tease in Phase I; 2–3 in early Phase II; 4 at Beat 9 or 15; taper to 1 in Phase IV."
        prompts:
          - "Why must this scene be now (not earlier/later)?"
          - "What emotion does this heat unlock?"
      - id: 23
        name: "Mirror Power Reversal"
        purpose: "Stage a deliberate role-flip to expose hidden wounds."
        usage: "Pair with Beat 9; echo earlier choreography with new meaning."
        prompts:
          - "What line/action proves consent is authorial, not performative?"
      - id: 24
        name: "Moral Mirror (Antagonist/Ex)"
        purpose: "Show the path of untransformed control/shame."
        usage: "Contrast in Phases II–III; resolution in IV."
        prompts:
          - "Which belief do they share with the MC or LI—and reject?"
      - id: 25
        name: "The Intimate Quiet"
        purpose: "A small, human ritual that resets tenderness and trust."
        usage: "Place post-rupture or before the climax."
        prompts:
          - "How does the body calm after adrenaline (breath, tea, shower, music)?"
      - id: 26
        name: "Public Boundary"
        purpose: "Demonstrate healthy limits in front of others."
        usage: "Often in Phase IV ‘New World Order’."
        prompts:
          - "What public line do they refuse to cross—and how is it respected?"

  # -----------------------------
  # CUSTOMIZATION HOOKS (per project)
  # -----------------------------
  custom_beats:
    - name: "Ethical Menace (Nonsexual Threat)"
      attaches_to: "Phase I–II"
      notes: "Threat of reputation, career, or physical risk that never becomes sexual violence."
    - name: "Third-Party Pressure"
      attaches_to: "Phases II–III"
      notes: "Rival, press, family, or law compels reckoning."
    - name: "Ritual Object"
      attaches_to: "Across all phases"
      notes: "Cord, mirror, ring, scar; evolve its meaning from control → consent → care."
```
