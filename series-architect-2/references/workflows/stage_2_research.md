# Stage 2: Research Phase

## Decision Point 2A: Research Source

Ask user:
- **Option A**: "I have my own research" (user provides files/notes)
- **Option B**: "Search the web for market research" (specify focus areas)
- **Option C**: "Use baseline market research" (AI-generated from genre knowledge)
- **Option D**: "Hybrid" (combine multiple approaches)

**Wait for user response.**

## Option A: User-Provided Research

1. Request user to provide research files/notes
2. Load and review provided materials
3. Summarize key findings relevant to series development
4. Proceed to Decision Point 2B

## Option B: Web Research

1. Ask: "What research areas? (comp titles, trope analysis, reader expectations, heat/violence norms, market trends, etc.)"
2. Wait for user specification
3. Execute web research using specified focus areas
4. Compile findings into research output
5. Save to `outputs/[project_name]_market_research.md`
6. Proceed to Decision Point 2B

## Option C: Baseline Research

1. Generate baseline market research from genre knowledge and intake data
2. Cover: typical genre conventions, common tropes, heat/violence norms, reader expectations
3. Save to `outputs/[project_name]_market_research.md`
4. Proceed to Decision Point 2B

## Option D: Hybrid

1. Combine multiple research approaches
2. Example: Web research + baseline knowledge
3. Example: User research + supplemental web search
4. Synthesize findings into comprehensive report
5. Save to `outputs/[project_name]_market_research.md`
6. Proceed to Decision Point 2B

## Decision Point 2B: Research Review

Present research findings using **Recommendation Approval Protocol**:
- Summarize key findings
- Ask: "Type 'approved' to accept and continue, or let me know what to add/adjust."

**Wait for user response.**

If revisions/additions needed, incorporate feedback and re-present.
Once approved, proceed to Stage 3.

## Before Proceeding to Stage 3

**Execute Stage Transition Protocol:**
1. Update intake_form.md - Mark Stage 2 complete, note approach used
2. Update memory.json - Record research completion, add changelog
3. Verify research file is saved and referenced
4. Proceed to Stage 3
