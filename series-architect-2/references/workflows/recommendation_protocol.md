# Recommendation Approval Protocol

**CRITICAL: Simplify user confirmations with single-word approval**

## When to Use This Protocol

**Present recommendations when:**
- Template/beat sheet selection
- Market-driven package synthesis
- Development approach selection
- Output format decisions
- Any decision point where AI can make informed recommendation

## Recommendation Format

**Structure every recommendation as:**

1. **Clear recommendation** based on research/analysis/context
2. **Brief rationale** (why this is recommended)
3. **End with approval prompt:** "Type **'approved'** to accept and continue, or let me know what you'd like to adjust."

**Example:**
```
Recommendation: Romantasy 5-Act Beat Framework

Rationale:
- Perfect structural alignment with Truby 5-act
- Supernatural romance specialized
- Dual-thread integration (romance + fantasy)

Type 'approved' to accept and continue, or let me know what you'd like to adjust.
```

## User Response Handling

### If user responds "approved"
**Immediate actions:**
1. Accept the recommendation as-is
2. Execute next steps immediately
3. Update intake_form.md with decision
4. Update memory.json with decision and date
5. Proceed to next stage/decision point
6. **No re-confirmation or follow-up questions**

### If user provides modifications
**Examples:**
- "Approved, but change X to Y"
- "Approved with adjustments: [details]"

**Actions:**
1. Accept recommendation with specified changes
2. Confirm understanding: "Using [recommendation] with [changes]. Proceeding."
3. Update files with modified decision
4. Proceed

### If user requests alternatives
**Examples:**
- "Show me other options"
- "What else is available?"

**Actions:**
1. Present 2-3 alternative options
2. Explain trade-offs between options
3. Make new recommendation or ask for selection
4. Wait for response

### If user asks questions
**Examples:**
- "Why did you recommend X?"
- "How does this compare to Y?"

**Actions:**
1. Answer question thoroughly
2. Re-present recommendation after answering
3. Wait for approval/modification/alternative request

### If user completely overrides
**Examples:**
- "No, I want to do Z instead"
- "Use [specific option] not your recommendation"

**Actions:**
1. Accept user's choice
2. Confirm: "Using [user's choice]. Proceeding."
3. Update files with user's selection
4. Proceed

## Decision Audit Trail

**Every "approved" decision must be recorded:**

**In intake_form.md:**
```markdown
**Stage X - [Stage Name]:**
- [Decision type]: [x] [What was selected] - approved YYYY-MM-DD
```

**In memory.json:**
```json
"key_decisions": {
  "[decision_key]": "[value] - approved YYYY-MM-DD"
},
"changelog_key_events": [
  "YYYY-MM-DD - [Decision] approved: [Value]"
]
```

## Benefits of This Protocol

### For Users
✅ **Less typing** - Single word confirms recommendation
✅ **Faster workflow** - No unnecessary back-and-forth
✅ **Trust signal** - Shows confidence in AI recommendations
✅ **Still flexible** - Can modify, ask questions, or override

### For Workflow
✅ **Clear decision points** - Explicit approval moments
✅ **Audit trail** - Every approval timestamped and recorded
✅ **Momentum** - Keeps workflow moving forward
✅ **Adaptability** - Works with user's decision-making style

## Anti-Patterns to Avoid

❌ **DON'T:**
- Present recommendation without rationale
- Ask "Are you sure?" after user approves
- Re-confirm decisions already approved
- Ask follow-up questions unless critical
- Provide verbose explanations after approval

✅ **DO:**
- Trust user's "approved" response
- Execute immediately
- Record decision
- Move to next step
- Keep momentum

## Integration with User Style Signals

**Market-driven users** (trust AI recommendations):
- Present synthesized optimal packages
- Provide brief market rationale
- Expect frequent "approved" responses
- Move quickly through decisions

**Creative exploration users** (want to explore):
- Present options with trade-offs
- Explain reasoning in detail
- Expect questions and modifications
- Take time to explore alternatives

**Hybrid users** (mix of both):
- Adapt per decision point
- Some quick approvals, some deep exploration
- Follow user's lead on pace

## When NOT to Use Approval Protocol

**Avoid approval protocol for:**
- Open-ended creative questions (character names, plot specifics)
- User-specific information (author name, series title)
- Preference questions with no "correct" answer
- Situations requiring user creativity, not AI recommendation

**Instead, ask directly:**
- "What would you like to name this character?"
- "What's your series title?"
- "What tone are you aiming for?"
