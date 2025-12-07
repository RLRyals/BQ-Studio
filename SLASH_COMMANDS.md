# BQ-Studio Slash Commands Quick Reference
**For Claude Code in Antigravity IDE**

---

## 🚀 Getting Started

### Start a New Workflow
```
I want to use the market-driven planning skill to develop a [genre] series.
My concept is: [your concept in 1-3 sentences]
```

**Example:**
```
I want to use the market-driven planning skill to develop a romantasy series.
My concept is: A vampire detective has to solve her own murder because she 
doesn't remember being turned.
```

---

## 📊 Workflow Status & Navigation

### Check Current Status
```
What's my current workflow status?
Where am I in the workflow?
Show me my workflow progress.
```

### Advance to Next Phase
```
Complete this phase and move to the next one.
I'm done with this phase, what's next?
Advance to the next workflow phase.
```

### Jump to Specific Phase
```
Advance to phase [number].
Skip to [phase name].
```

**Phase Numbers:**
- 0: Premise Development
- 1: Genre Pack Management
- 2: Market Research
- 3: Series Architect
- 4: NPE Validation
- 5: Commercial Validation
- 6: Writing Team Review
- 7: User Approval
- 8: MCP Commit
- 9: Chapter Planning
- 10: Scene Validation
- 11: Writing Execution
- 12: Book Production Loop

---

## 🔍 Market Research (Phase 2)

### Run Market Research
```
Run market research for [genre].
Analyze the market for [genre] books.
What are the trending tropes in [genre]?
```

### Get Comp Titles
```
Find comp titles for my concept.
What are similar books to mine?
Show me bestsellers in [genre].
```

---

## 🏗️ Series Architecture (Phase 3)

### Design Series Structure
```
Design the 5-book series structure.
Create the series architecture.
Plan the escalation pattern for my series.
```

### Review Series Plan
```
Show me the series architecture.
What's the escalation pattern?
How do the character arcs span the books?
```

---

## ✅ Validation & Approval (Phases 4-7)

### Run NPE Validation
```
Validate my series against NPE rules.
Check for narrative physics violations.
Run NPE validation on the current phase.
```

### Run Commercial Validation
```
Validate commercial viability.
What's my commercial viability score?
Run the commercial validation check.
```

### Request User Approval
```
I'm ready for approval.
Request user approval for this phase.
Submit this phase for my review.
```

### Submit Approval Decision
```
I approve this phase.
I reject this phase - [reason].
Request revisions - [specific feedback].
```

---

## 📝 Chapter Planning (Phase 9)

### Plan Chapters
```
Create detailed chapter plan for Book 1.
Plan chapters 1-5.
Generate chapter outlines.
```

### Review Chapter Plans
```
Show me the chapter plan.
What chapters are planned?
Review the chapter structure.
```

---

## ✍️ Writing Execution (Phase 11)

### Start Writing
```
Start writing chapter [number].
Draft the next chapter.
Begin writing execution.
```

### Record Writing Progress
```
I wrote [number] words today.
Record [number] chapters completed.
Update my writing metrics.
```

---

## 📈 Metrics & Analytics

### View Writing Metrics
```
Show me my writing metrics.
What's my word count?
How many chapters have I completed?
```

### Calculate Velocity
```
What's my writing velocity?
How many words per day am I averaging?
Calculate my writing speed.
```

### View Daily Stats
```
Show my writing stats for today.
What did I accomplish this week?
Display my daily writing statistics.
```

### Phase Analytics
```
How long did each phase take?
Show phase performance analytics.
What's the average time for phase [number]?
```

---

## 🔄 Book Production Loop (Phase 12)

### Start Next Book
```
Start Book [number].
Begin the next book iteration.
Move to Book 2.
```

### Revision Workflow
```
Start revision pass [number] for Book [number].
Run the structural revision pass.
Complete the dialogue revision pass.
```

**Revision Passes:**
1. Structural
2. Continuity
3. Dialogue
4. Emotional
5. Line Edit
6. Final QA

### QA Checklist
```
Run QA checklist for Book [number].
Check if Book [number] is ready to publish.
Validate publishing readiness.
```

### Mark Ready to Publish
```
Mark Book [number] as ready to publish.
This book is ready for publication.
```

---

## 🛠️ Utility Commands

### Get Pending Approvals
```
What approvals are pending?
Show me what needs my review.
List pending approval requests.
```

### View Series Progress
```
Show overall series progress.
How far along is the series?
Display series completion status.
```

### Record Quality Gate
```
Record NPE validation results.
Log quality gate for [type].
```

---

## 💡 Pro Tips

### Combine Commands
You can combine multiple requests:
```
Show me my current workflow status, writing metrics for this week, 
and what phase I should work on next.
```

### Context-Aware Requests
Claude understands context:
```
# After completing market research:
"What did we find in the market research?"

# After series architecture:
"How does Book 3 escalate from Book 2?"

# During writing:
"How many more chapters until I finish Book 1?"
```

### Natural Language
You don't need exact commands - Claude understands intent:
```
❌ Don't need: "execute_phase --phase=2 --workflow-id=1"
✅ Just say: "Run market research for my romantasy series"
```

---

## 🎯 Common Workflows

### Complete Planning (Phases 0-8)
```
1. "I want to use market-driven planning for: [concept]"
2. [Claude runs Phases 0-1 automatically]
3. "Run market research" (Phase 2)
4. "Design the series architecture" (Phase 3)
5. "Validate with NPE" (Phase 4)
6. "Run commercial validation" (Phase 5)
7. [Review results]
8. "I approve - proceed to writing" (Phases 6-8)
```

### Daily Writing Session
```
1. "What's my current workflow status?"
2. "What chapter should I work on next?"
3. "Start writing chapter [number]"
4. [Write your content]
5. "I wrote [number] words today"
6. "Show my writing velocity"
```

### Weekly Review
```
1. "Show my writing stats for this week"
2. "What's my writing velocity?"
3. "How much progress on the series?"
4. "What's next on the workflow?"
```

---

## 🔗 Related Resources

- **Skill Definition:** `.claude/skills/market-driven-planning-skill.md`
- **Visual Dashboard:** `workflow-dashboard.html`
- **Configuration Guide:** `CONFIGURATION_GUIDE.md`
- **System Architecture:** `SYSTEM_ARCHITECTURE_MAP.md`

---

## 🆘 Need Help?

### Check Connection
```
Can you list the available MCP tools?
Is the Workflow Manager connected?
```

### Debug Issues
```
What's the status of the Workflow Manager MCP?
Check if FictionLab is running.
Verify database connection.
```

### Get Documentation
```
Explain the market-driven planning workflow.
What are the 12 phases?
How does the revision workflow work?
```

---

**Remember:** These are natural language patterns, not rigid commands. 
Claude Code understands your intent and will use the appropriate MCP tools!

**Start now:** Just say what you want to do, and Claude will orchestrate the workflow! 🚀
