# Workflow Manager - BQ-Studio Integration

**Repository:** BQ-Studio
**Purpose:** Claude Code slash commands, skills, and workflow integration
**Version:** 3.1
**Last Updated:** 2025-12-03

---

## Overview

This document describes how BQ-Studio (Claude Code environment) integrates with the Workflow Manager MCP server to orchestrate the 12-phase novel writing workflow.

---

## Slash Commands

### `/market-driven-planning-skill`

Executes the complete market-driven planning workflow (Phases 0-8).

**Usage:**
```
/market-driven-planning-skill "Willy Wonka but serial killer"
```

**What it does:**
1. Creates a new workflow instance via `create_workflow`
2. Executes Phases 0-7 sequentially:
   - Phase 0: Premise Development
   - Phase 1: Genre Pack Management
   - Phase 2: Market Research
   - Phase 3: Series Architect
   - Phase 4: NPE Series Validation (Quality Gate)
   - Phase 5: Commercial Validation (Quality Gate)
   - Phase 6: Writing Team Review
   - Phase 7: User Approval (Wait for user)
3. After user approval, executes Phase 8: MCP Commit
4. Returns workflow to Phase 9 (ready for chapter planning)

**Implementation Location:**
- `.claude/skills/market-driven-planning.md` (or similar)

**MCP Tools Used:**
```typescript
// Create workflow
const workflow = await mcp.call('workflow-manager', 'create_workflow', {
  series_id: newSeriesId,
  user_id: currentUserId,
  concept: userConcept
});

// Execute each phase
for (let phase = 0; phase <= 7; phase++) {
  const result = await mcp.call('workflow-manager', 'execute_phase', {
    workflow_id: workflow.workflow_id,
    phase_number: phase,
    input: phaseInputs[phase]
  });

  if (result.status === 'waiting_approval') {
    // Present approval request to user
    const approval = await requestUserApproval(result);

    await mcp.call('workflow-manager', 'submit_approval', {
      approval_id: approval.approval_id,
      decision: 'approved',
      feedback: approval.userFeedback
    });
  }

  if (result.status === 'waiting_quality_gate') {
    // Quality gate executed, check if passed
    const gate = await mcp.call('workflow-manager', 'check_gate_status', {
      workflow_id: workflow.workflow_id,
      phase_number: phase
    });

    if (!gate.passed) {
      throw new Error(`Quality gate failed at Phase ${phase}`);
    }
  }
}

// Commit to database
await mcp.call('workflow-manager', 'execute_phase', {
  workflow_id: workflow.workflow_id,
  phase_number: 8,
  input: {}
});

console.log('✅ Planning complete! Ready to write Book 1.');
```

---

### `/write-series`

Executes the complete 5-book writing workflow (Phases 9-12 looped).

**Usage:**
```
/write-series <workflow_id>
```

**What it does:**
1. Verifies workflow is at Phase 9 (post-planning)
2. For Book 1:
   - Phase 9: Chapter Planning (25 chapters)
   - Phase 10: Scene Validation
   - Phase 11: Writing Execution
3. For Books 2-5:
   - Phase 12: Start book iteration (returns to Phase 9)
   - Repeat Phases 9-11
   - Request approval after each book
4. Records production metrics throughout

**Implementation Location:**
- `.claude/skills/write-series.md`

**MCP Tools Used:**
```typescript
const workflow = await mcp.call('workflow-manager', 'get_workflow_state', {
  workflow_id: workflowId
});

if (workflow.current_phase !== 9) {
  throw new Error('Workflow must be at Phase 9 (Chapter Planning)');
}

// Write Book 1
for (let phase = 9; phase <= 11; phase++) {
  const startTime = Date.now();

  const result = await mcp.call('workflow-manager', 'execute_phase', {
    workflow_id: workflowId,
    phase_number: phase,
    input: { book_number: 1 }
  });

  // Record time metric
  await mcp.call('workflow-manager', 'record_production_metric', {
    workflow_id: workflowId,
    metric_type: 'writing_time_minutes',
    metric_value: (Date.now() - startTime) / 60000,
    context: { phase_number: phase, book_number: 1 }
  });
}

// Write Books 2-5
for (let bookNum = 2; bookNum <= 5; bookNum++) {
  await mcp.call('workflow-manager', 'start_book_iteration', {
    workflow_id: workflowId,
    book_number: bookNum
  });

  // Execute Phases 9-11 for this book
  // ... (similar to Book 1)

  await mcp.call('workflow-manager', 'complete_book_iteration', {
    workflow_id: workflowId,
    book_number: bookNum
  });

  // Wait for user approval
  const approval = await waitForApproval(workflowId);
}

console.log('🎉 All 5 books complete!');
```

---

### `/workflow-status`

Displays current workflow status and metrics.

**Usage:**
```
/workflow-status
```

**What it does:**
1. Lists all active workflows for the user
2. Shows current phase, status, and progress
3. Displays key metrics (words written, velocity, completion estimate)
4. Shows pending approvals

**Example Output:**
```
📊 Workflow Status

Series: "Candy Factory of Death"
Workflow ID: workflow-789

Current Phase: 11 (Writing Execution)
Status: in_progress
Current Book: 2 / 5
Progress: 40% complete

📈 Metrics:
- Words written: 142,500 / ~356,000 total
- Current velocity: 2,847 words/hour
- Estimated completion: 3 days (Dec 6, 2025)
- NPE pass rate: 92%

📝 Pending Approvals: None
```

**Implementation:**
```typescript
const workflows = await mcp.call('workflow-manager', 'list_active_workflows', {
  user_id: currentUserId
});

for (const wf of workflows) {
  const state = await mcp.call('workflow-manager', 'get_workflow_state', {
    workflow_id: wf.workflow_id
  });

  const metrics = await mcp.call('workflow-manager', 'get_workflow_metrics', {
    workflow_id: wf.workflow_id
  });

  const velocity = await mcp.call('workflow-manager', 'get_workflow_velocity', {
    workflow_id: wf.workflow_id,
    time_window: 'week'
  });

  const approvals = await mcp.call('workflow-manager', 'get_pending_approvals', {
    workflow_id: wf.workflow_id
  });

  // Format and display
  console.log(formatWorkflowStatus(state, metrics, velocity, approvals));
}
```

---

### `/approve-series-plan`

Approves the series plan after Phase 7.

**Usage:**
```
/approve-series-plan <workflow_id> [feedback]
```

**What it does:**
1. Retrieves pending approval for the workflow
2. Displays series plan artifacts for review
3. Submits approval decision
4. Advances workflow to Phase 8

**Implementation:**
```typescript
const approvals = await mcp.call('workflow-manager', 'get_pending_approvals', {
  workflow_id: workflowId
});

const seriesApproval = approvals.find(a => a.approval_type === 'series_plan');

if (!seriesApproval) {
  throw new Error('No series plan approval pending');
}

// Display artifacts
console.log('Review these documents:');
seriesApproval.artifacts.forEach(path => {
  console.log(`- ${path}`);
});

// Submit approval
await mcp.call('workflow-manager', 'submit_approval', {
  approval_id: seriesApproval.approval_id,
  decision: 'approved',
  feedback: userFeedback || 'Approved'
});

console.log('✅ Series plan approved! Proceeding to database commit.');
```

---

## MCP Configuration

Add Workflow Manager MCP to Claude Code's MCP configuration:

**File:** `.claude/mcp.json` or user's MCP settings

```json
{
  "mcpServers": {
    "workflow-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "workflow-manager",
        "node",
        "/app/dist/index.js"
      ],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/fictionlab",
        "PORT": "3012"
      }
    }
  }
}
```

**Alternative (Local Development):**
```json
{
  "mcpServers": {
    "workflow-manager": {
      "command": "node",
      "args": [
        "/path/to/MCP-Writing-Servers/workflow-manager/dist/index.js"
      ],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/fictionlab_dev"
      }
    }
  }
}
```

---

## Integration Examples

### Example 1: Start a New Series

```typescript
// User types: /market-driven-planning-skill "Detective with OCD"

// 1. Create workflow
const workflow = await mcp.call('workflow-manager', 'create_workflow', {
  series_id: generateSeriesId(),
  user_id: 'user-123',
  concept: 'Detective with OCD'
});

console.log(`Created workflow: ${workflow.workflow_id}`);

// 2. Execute planning phases
await executePlanningWorkflow(workflow.workflow_id);

// 3. Wait for user approval
console.log('⏸️  Waiting for series plan approval...');
```

### Example 2: Check Writing Progress

```typescript
// User types: /workflow-status

const workflows = await mcp.call('workflow-manager', 'list_active_workflows', {
  user_id: currentUser.id
});

const wf = workflows[0];
const velocity = await mcp.call('workflow-manager', 'get_workflow_velocity', {
  workflow_id: wf.workflow_id
});

console.log(`You're writing at ${velocity.velocity.words_per_hour} words/hour!`);
console.log(`Estimated completion: ${velocity.projections.estimated_completion_date}`);
```

### Example 3: Query Daily Stats

```typescript
// User asks: "How many words did I write this week?"

const stats = await mcp.call('workflow-manager', 'get_daily_writing_stats', {
  author_id: currentUser.id,
  date_range: {
    start: getDateDaysAgo(7),
    end: getTodayDate()
  }
});

const totalWords = stats.reduce((sum, day) => sum + day.words_written, 0);
console.log(`You wrote ${totalWords.toLocaleString()} words this week!`);

// Show daily breakdown
stats.forEach(day => {
  console.log(`${day.stat_date}: ${day.words_written} words`);
});
```

---

## Production Metrics Integration

### Recording Metrics During Writing

When executing writing phases, automatically record metrics:

```typescript
// During Phase 11 (Writing Execution)
const chapterText = await generateChapter(chapterPlan);

// Record words written
await mcp.call('workflow-manager', 'record_production_metric', {
  workflow_id: workflowId,
  metric_type: 'words_written',
  metric_value: countWords(chapterText),
  context: {
    phase_number: 11,
    book_number: currentBook,
    chapter_number: currentChapter
  }
});

// Record chapter completion
await mcp.call('workflow-manager', 'record_production_metric', {
  workflow_id: workflowId,
  metric_type: 'chapters_completed',
  metric_value: 1,
  context: {
    phase_number: 11,
    book_number: currentBook
  }
});
```

### Recording Time Metrics

Track time spent in each phase:

```typescript
const startTime = Date.now();

await mcp.call('workflow-manager', 'execute_phase', {
  workflow_id: workflowId,
  phase_number: 9,
  input: { book_number: 1 }
});

const durationMinutes = (Date.now() - startTime) / 60000;

await mcp.call('workflow-manager', 'record_production_metric', {
  workflow_id: workflowId,
  metric_type: 'planning_time_minutes',
  metric_value: durationMinutes,
  context: {
    phase_number: 9,
    book_number: 1,
    metadata: { chapters_planned: 25 }
  }
});
```

### Recording Quality Scores

When quality gates execute:

```typescript
// NPE Validation result
await mcp.call('workflow-manager', 'record_production_metric', {
  workflow_id: workflowId,
  metric_type: 'npe_score',
  metric_value: 87,
  context: {
    phase_number: 4,
    metadata: { gate_type: 'npe_series' }
  }
});

// Commercial Validation result
await mcp.call('workflow-manager', 'record_production_metric', {
  workflow_id: workflowId,
  metric_type: 'commercial_score',
  metric_value: 8,
  context: {
    phase_number: 5,
    metadata: { gate_type: 'commercial' }
  }
});
```

---

## Error Handling

### Quality Gate Failures

```typescript
const gate = await mcp.call('workflow-manager', 'check_gate_status', {
  workflow_id: workflowId,
  phase_number: 4
});

if (!gate.passed) {
  console.error('❌ NPE Validation Failed!');
  console.log(`Score: ${gate.score}/100 (minimum 80 required)`);

  gate.violations.forEach(v => {
    console.log(`- ${v.category}: ${v.message}`);
    console.log(`  Suggestion: ${v.suggestion}`);
  });

  // Return to planning phase
  await mcp.call('workflow-manager', 'advance_to_phase', {
    workflow_id: workflowId,
    target_phase: 3
  });
}
```

### Approval Rejections

```typescript
const approval = await mcp.call('workflow-manager', 'submit_approval', {
  approval_id: approvalId,
  decision: 'revision_requested',
  feedback: 'The protagonist needs more depth. Revise character arc.'
});

if (approval.next_action.includes('return_to_phase')) {
  const returnPhase = parseInt(approval.next_action.split('_').pop());
  console.log(`⏪ Returning to Phase ${returnPhase} for revisions...`);
}
```

---

## Best Practices

1. **Always check workflow state** before executing operations
2. **Record metrics consistently** for accurate analytics
3. **Handle approval timeouts** gracefully
4. **Provide clear feedback** to users during long operations
5. **Use batch operations** when possible to reduce MCP calls
6. **Cache workflow state** when appropriate (short-lived)
7. **Surface errors clearly** with actionable suggestions

---

## Testing

### Manual Testing Commands

```bash
# Test workflow creation
/market-driven-planning-skill "Test concept"

# Check status
/workflow-status

# Approve plan
/approve-series-plan <workflow-id>

# Write series
/write-series <workflow-id>
```

### Integration Tests

Located in `.claude/tests/workflow-manager.test.ts`:

```typescript
describe('Workflow Manager Integration', () => {
  it('should create workflow and execute planning phases', async () => {
    // Test implementation
  });

  it('should record production metrics during writing', async () => {
    // Test implementation
  });

  it('should handle quality gate failures', async () => {
    // Test implementation
  });
});
```

---

## Related Documents

- [Workflow Manager Overview](./WORKFLOW_MANAGER_OVERVIEW.md) - System overview
- [Full Design Specification](./WORKFLOW_MANAGER_MCP.md) - Complete technical design
- MCP-Writing-Servers: `workflow-manager/README.md` - Server implementation
- MCP-Electron-App: `docs/WORKFLOW_DASHBOARD.md` - Dashboard UI

---

**Next Steps:**
1. Implement slash commands in `.claude/skills/`
2. Add MCP configuration
3. Test integration with Workflow Manager MCP
4. Document user-facing workflows
