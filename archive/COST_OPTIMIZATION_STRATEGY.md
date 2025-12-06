# BQ Studio - Cost Optimization Strategy

**Using Both Claude Code Web AND Electron App**

---

## The Smart Hybrid Approach

You can use **both** Claude Code Web (subscription) and BQ Studio Electron (API) simultaneously to optimize costs:

```
┌────────────────────────────────────────────────┐
│ FictionLab (Infrastructure - Always Running)   │
│ • Postgres database                            │
│ • 9 MCP servers (ports 3001-3009)              │
│ • Shared data layer                            │
└────────────────────────────────────────────────┘
         ↓ both connect ↓
    ┌────────────────┴────────────────┐
    ↓                                 ↓
┌─────────────────┐       ┌──────────────────────┐
│ Claude Code Web │       │ BQ Studio Electron   │
│ (Subscription)  │       │ (Pay-per-use API)    │
│                 │       │                      │
│ Uses:           │       │ Uses:                │
│ • Your $724     │       │ • ANTHROPIC_API_KEY  │
│   credits       │       │ • Pay per token      │
│ • Included      │       │ • Production work    │
│ • Exploration   │       │                      │
└─────────────────┘       └──────────────────────┘
         ↓                          ↓
    Same Postgres Database!
    Both see same series/characters/scenes
```

---

## Cost Model Comparison

### Claude Code Web (Subscription)
**What you pay:** $20/month subscription (includes $724 credits currently)
**When charged:** Monthly flat fee
**Best for:**
- ✅ Brainstorming and exploration
- ✅ Testing new ideas
- ✅ Quick questions to agents
- ✅ Experimenting with workflows
- ✅ Refining prompts
- ✅ Learning and testing

**Cost per use:** $0 (included in subscription)

---

### BQ Studio Electron (API)
**What you pay:** ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
**When charged:** Per API call
**Best for:**
- 🔧 Production series planning (locked in)
- 🔧 Final chapter writing
- 🔧 Manuscript exports
- 🔧 Batch operations
- 🔧 Structured workflows
- 🔧 Client deliverables

**Cost per use:** Pay only for what you produce

---

## Real-World Usage Examples

### Scenario 1: Brainstorming New Series

**Step 1 - CCWeb (Free exploration):**
```
You: "Miranda, help me brainstorm 3 dark romantasy concepts"
Miranda: [Generates 3 concepts]
You: "Let's develop concept #2"
[15 minutes of back-and-forth]

Cost: $0 (subscription)
Tokens used: ~50,000 (exploration)
```

**Step 2 - Electron (Commit to production):**
```
Open BQ Studio Electron
Create New Series → fills in details from CCWeb
Generate Series Plan → uses API
Saves to Postgres

Cost: ~$1.50 (one-time, production data)
Tokens used: ~10,000 (focused output)
```

**Result:** Free exploration + paid production = $1.50 total

---

### Scenario 2: Writing Chapter with Edits

**Round 1 - CCWeb (Draft exploration):**
```
You: "Bailey, draft Chapter 5 where Alex discovers iron weakness"
Bailey: [Generates 2000-word draft]
You: "Hmm, the pacing feels off. Try again with more tension"
Bailey: [Generates revised draft]
You: "Better! But the dialogue needs work..."
[3 more iterations]

Cost: $0 (subscription)
Tokens used: ~100,000 (5 drafts)
```

**Round 2 - Electron (Final version):**
```
Open BQ Studio
Navigate to Chapter 5
Generate Final Draft (uses best approach from CCWeb testing)
Save to Postgres

Cost: ~$3.00 (API call)
Tokens used: ~20,000 (final output)
```

**Result:** $0 for exploration + $3 for final = $3 total (vs $15 if all via API)

---

### Scenario 3: Daily Mixed Usage

**Morning - CCWeb (Planning):**
```
• Chat with Miranda about series structure
• Ask Dr. Viktor about character motivation
• Test beat sheets for Book 3
• Brainstorm plot twists

Cost: $0
Time: 2 hours
```

**Afternoon - Electron (Production):**
```
• Create 3 new characters (API)
• Generate Chapter 7 plan (API)
• Draft 2 scenes with Bailey (API)
• Export manuscript preview (API)

Cost: ~$10
Time: 3 hours
```

**Evening - CCWeb (Review):**
```
• Ask Tessa to check continuity
• Get feedback from Edna on pacing
• Discuss next chapter with Miranda

Cost: $0
Time: 1 hour
```

**Daily Total:** $10 for production work, unlimited exploration

---

## When to Use Each

### Use CCWeb (Subscription) For:

**✅ Exploration Phase:**
- "What if" scenarios
- Multiple concept iterations
- Testing different beat sheets
- Character concept validation
- Plot hole brainstorming
- Style experimentation

**✅ Learning:**
- Understanding agents
- Testing new workflows
- Experimenting with prompts
- Trying new features

**✅ Quick Questions:**
- "Is this plot hole?"
- "Does this make sense?"
- "How should I structure this?"

**Cost Impact:** $0 (included)

---

### Use Electron (API) For:

**🔧 Production Phase:**
- Final series plan (after CCWeb brainstorming)
- Chapter drafts for publication
- Scene writing for manuscript
- Character profiles for series bible
- Export operations

**🔧 Batch Operations:**
- Generate 10 chapters at once
- Create character profiles for entire cast
- Process entire series plan

**🔧 Client Deliverables:**
- Manuscripts for publishing
- Series bibles for reference
- Final exports

**Cost Impact:** Pay per use, but focused and efficient

---

## Cost Optimization Strategies

### Strategy 1: Draft in CCWeb, Finalize in Electron
```
CCWeb:  Brainstorm → Draft → Revise → Refine (unlimited)
           ↓ once happy ↓
Electron: Generate final version → Save to production (1 API call)

Savings: 80-90% vs. drafting via API
```

---

### Strategy 2: Use CCWeb for Agent Consultation
```
Before expensive Electron operations:
1. Chat with agents in CCWeb (free)
2. Get validation and suggestions
3. Run final operation in Electron (API)

Example:
CCWeb:   "Miranda, should I split this into 2 chapters?" (free)
Miranda: "Yes, here's why..." (free)
Electron: Generate 2 chapters instead of 1 (API, but optimized)
```

---

### Strategy 3: Batch Production Work
```
Instead of:
• Generate chapter 1 in Electron ($3)
• Generate chapter 2 in Electron ($3)
• Generate chapter 3 in Electron ($3)
Total: $9

Do this:
• Plan all 3 chapters in CCWeb ($0)
• Generate all 3 in one Electron session ($7)
Total: $7 (saves $2)
```

---

## Budget Tracking

### Your Current Budget
- **Subscription credits:** $724 available ($7 spent)
- **API budget:** Set your own limit

### Recommended Monthly Budget

**For CCWeb:**
- Monthly subscription: $20 (unlimited usage within)
- Current balance: $717 remaining

**For Electron API:**
- Light usage: $20-50/month (occasional series planning)
- Medium usage: $50-100/month (regular chapter writing)
- Heavy usage: $100-300/month (daily manuscript production)

### Cost Tracking Script

Create a simple tracker:
```javascript
// Log in Electron app
const logApiCost = (operation, tokens, cost) => {
  db.insert('api_costs', {
    date: new Date(),
    operation,
    tokens,
    cost,
  });
};

// View monthly costs
SELECT SUM(cost) as total FROM api_costs
WHERE date >= '2025-11-01';
```

---

## Real Cost Examples

### Series Planning (Full 5-book series)
```
CCWeb exploration:    $0
Electron final plan:  $5-10
Total:                $5-10
```

### Chapter Writing (2000 words)
```
CCWeb drafting:       $0 (multiple iterations)
Electron final:       $2-4
Total:                $2-4
```

### Full Manuscript (80,000 words)
```
CCWeb planning:       $0
Electron 40 chapters: $80-160
Total:                $80-160
```

**Traditional ghostwriter:** $10,000-30,000
**Your cost:** $80-160 (99% savings!)

---

## Technical Setup for Dual Mode

### Electron App (.env)
```bash
# Uses API key
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Connects to FictionLab (same as CCWeb)
DATABASE_URL=postgresql://user:pass@localhost:6432/fictionlab
MCP_AUTHOR_SERVER_URL=http://localhost:3001
# ... etc
```

### Claude Code Web (.claude/mcp-web.json)
```json
{
  "mcpServers": {
    "author-server": {
      "url": "https://xxxxx.trycloudflare.com"
    }
  }
}
```

**Key Point:** Both connect to same FictionLab Postgres, so data syncs automatically!

---

## Workflow Example: Complete Series

**Week 1 - Series Planning (CCWeb)**
```
Monday-Friday: Brainstorm with Miranda ($0)
• 3 concept iterations
• 5 beat sheet tests
• Character concept exploration
• Series structure refinement

Friday afternoon: Generate final plan (Electron $5)
```

**Week 2-3 - Book 1 Outline (Mixed)**
```
CCWeb:
• Chapter structure discussions ($0)
• Scene brainstorming ($0)
• Plot hole validation ($0)

Electron:
• Generate 20 chapter outlines ($20)
• Create 15 character profiles ($10)

Total: $30
```

**Week 4-8 - Writing Book 1 (Mixed)**
```
Daily CCWeb:
• Morning planning with agents ($0)
• Continuity checks with Tessa ($0)
• Style feedback from Finn ($0)

Weekly Electron:
• Generate 2 chapters/week ($8/week × 5 weeks = $40)
• Export progress ($2)

Total: $42
```

**Complete Book 1 (80k words):**
- Planning: $5
- Outlining: $30
- Writing: $42
- **Total: $77**

**Compare to:**
- Ghostwriter: $10,000
- Your savings: $9,923 (99.2% savings!)

---

## Best Practices

### 1. Always Explore in CCWeb First
Don't spend API credits exploring. Use CCWeb for:
- "What if" questions
- Multiple iterations
- Testing approaches
- Getting agent feedback

**Then** use Electron for the final, optimized version.

---

### 2. Validate Before API Calls
```
❌ Bad:
Generate chapter → review → hate it → regenerate → hate it
Cost: $12 (4 generations)

✅ Good:
Chat with Bailey in CCWeb → refine approach → generate once in Electron
Cost: $3 (1 optimized generation)
```

---

### 3. Batch Similar Operations
```
❌ Individual calls:
Generate character 1: $1
Generate character 2: $1
Generate character 3: $1
Total: $3

✅ Batch call:
Generate all 3 characters: $2
Total: $2 (saves 33%)
```

---

### 4. Use CCWeb for Debugging
```
If Electron generates unexpected results:
1. Don't regenerate (costs more)
2. Copy output to CCWeb
3. Ask agent what went wrong (free)
4. Adjust prompt
5. Try again in Electron (optimized)
```

---

### 5. Monitor Your Spending
```
Set alerts:
• Daily API budget: $10
• Weekly: $50
• Monthly: $200

Track in Electron:
• Log every API call
• Show running total
• Alert when approaching limit
```

---

## Summary

### The Hybrid Model Advantage

**CCWeb = Unlimited Thinking**
- Explore freely
- Test everything
- Iterate endlessly
- Learn and refine
- Zero marginal cost

**Electron = Efficient Production**
- Generate finals
- Batch operations
- Save to database
- Export deliverables
- Pay only for output

**Together = Best of Both Worlds**
- Free exploration + paid production
- Optimize before API calls
- Validate with agents (free)
- Produce efficiently (paid)
- Save 80-90% vs. API-only

---

## Your Specific Situation

**Current Credits:** $717 remaining (CCWeb subscription)
**Recommendation:**
1. Use CCWeb extensively this weekend (it's included!)
2. Test all agents and workflows (free)
3. Refine prompts and approaches (free)
4. Build Electron app in parallel
5. Use Electron for final productions only
6. Monitor API costs carefully

**Expected Monthly Cost:**
- CCWeb: $20 subscription (unlimited)
- Electron API: $50-100 (focused production)
- **Total: $70-120/month** for complete series writing system

**vs. Traditional costs:**
- Ghostwriter: $10,000+ per book
- Editor: $1,000-3,000 per book
- **Your savings: 99%+**

---

**The Bottom Line:** Use CCWeb for thinking, Electron for producing. Both share the same data. You get unlimited exploration + efficient production. 🎯
