# Workflow Manager MCP Server

**Version:** 3.0  
**Port:** 3012  
**Purpose:** Orchestrates the 12-phase novel writing pipeline  
**Status:** Design Complete - Ready for Implementation

---

## Overview

The **Workflow Manager MCP** is a new MCP server that orchestrates the entire 12-phase novel writing process outlined in the System Architecture Map. It provides:

- **Centralized workflow state management** - Single source of truth for workflow progress
- **Phase transition enforcement** - Validates prerequisites before advancing
- **Quality gate coordination** - Manages NPE and commercial validation gates
- **User approval checkpoints** - Coordinates approval requests across clients
- **Multi-client support** - TypingMind, Claude Code, and FictionLab UI all use the same workflow
- **Real-time updates** - WebSocket support for live workflow state changes

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FictionLab Infrastructure                 │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │TypingMind  │  │Claude Code │  │FictionLab  │            │
│  │  Client    │  │   Client   │  │  UI Client │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│                          ▼                                   │
│         ┌────────────────────────────────────┐              │
│         │  Workflow Manager MCP (Port 3012)  │              │
│         │                                    │              │
│         │  • create_workflow()               │              │
│         │  • execute_phase()                 │              │
│         │  • request_approval()              │              │
│         │  • record_quality_gate()           │              │
│         │  • get_workflow_state()            │              │
│         └────────────┬───────────────────────┘              │
│                      │                                       │
│         ┌────────────┼────────────────────────┐             │
│         │            │                        │             │
│         ▼            ▼                        ▼             │
│  ┌──────────┐ ┌──────────┐           ┌──────────┐          │
│  │ Series   │ │Character │    ...    │   NPE    │          │
│  │ Planning │ │ Planning │           │  Server  │          │
│  │  Server  │ │  Server  │           │  Server  │          │
│  │ (3002)   │ │ (3005)   │           │  (3011)  │          │
│  └────┬─────┘ └────┬─────┘           └────┬─────┘          │
│       │            │                      │                 │
│       └────────────┼──────────────────────┘                 │
│                    │                                        │
│                    ▼                                        │
│         ┌──────────────────────┐                           │
│         │  PostgreSQL Database │                           │
│         │  (via PgBouncer)     │                           │
│         └──────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### workflow_instances

Tracks the current state of each workflow.

```sql
CREATE TABLE workflow_instances (
  id SERIAL PRIMARY KEY,
  series_id integer REFERENCES series(id),
  author_id integer references authors(id), 
  current_phase INTEGER NOT NULL DEFAULT -1, -- -1 to 12
  phase_status TEXT NOT NULL DEFAULT 'in_progress', 
    -- 'in_progress', 'waiting_approval', 'waiting_quality_gate', 'completed', 'failed'
  current_book INTEGER DEFAULT 1, -- 1-5
  current_chapter INTEGER DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP DEFAULT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_workflow_author ON workflow_instances(author_id);
CREATE INDEX idx_workflow_series ON workflow_instances(series_id);
CREATE INDEX idx_workflow_status ON workflow_instances(phase_status);
```

### workflow_phase_history

Audit trail of all phase executions.

```sql
CREATE TABLE workflow_phase_history (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  status TEXT NOT NULL, -- 'started', 'completed', 'failed', 'skipped'
  agent TEXT, -- Which agent executed this phase
  output_summary TEXT,
  validation_score DECIMAL(5,2), -- For gate phases
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_phase_history_workflow ON workflow_phase_history(workflow_id);
CREATE INDEX idx_phase_history_phase ON workflow_phase_history(phase_number);
```

### workflow_approvals

User approval checkpoints.

```sql
CREATE TABLE workflow_approvals (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  approval_type TEXT NOT NULL, 
    -- 'series_plan', 'book_completion', 'chapter_plan'
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending', 
    -- 'pending', 'approved', 'rejected', 'revision_requested'
  feedback TEXT,
  artifacts JSONB DEFAULT '[]'::jsonb, -- Links to documents to review
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_approvals_workflow ON workflow_approvals(workflow_id);
CREATE INDEX idx_approvals_status ON workflow_approvals(status);
```

### workflow_quality_gates

Quality gate results (NPE, Commercial).

```sql
CREATE TABLE workflow_quality_gates (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  gate_type TEXT NOT NULL, -- 'npe_series', 'npe_scene', 'commercial'
  score DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  violations JSONB DEFAULT '[]'::jsonb, -- Array of violation objects
  executed_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_gates_workflow ON workflow_quality_gates(workflow_id);
CREATE INDEX idx_gates_type ON workflow_quality_gates(gate_type);
```

---

## MCP Tools

### Workflow Lifecycle

#### `create_workflow`

Creates a new workflow instance for a series.

```typescript
create_workflow(
  series_id: string,
  user_id: string,
  concept: string
) -> {
  workflow_id: string,
  current_phase: number,
  phase_status: string
}
```

**Example:**
```typescript
const workflow = await mcp.call('workflow-manager', 'create_workflow', {
  series_id: 'uuid-123',
  user_id: 'user-456',
  concept: 'Willy Wonka but serial killer'
});
// Returns: { workflow_id: 'workflow-789', current_phase: -1, phase_status: 'in_progress' }
```

#### `get_workflow_state`

Retrieves the current state of a workflow.

```typescript
get_workflow_state(
  workflow_id: string
) -> {
  workflow_id: string,
  series_id: string,
  current_phase: number,
  phase_name: string,
  phase_status: string,
  current_book: number,
  current_chapter: number | null,
  created_at: string,
  updated_at: string
}
```

#### `advance_to_phase`

Advances the workflow to a specific phase (validates prerequisites).

```typescript
advance_to_phase(
  workflow_id: string,
  target_phase: number
) -> {
  success: boolean,
  current_phase: number,
  phase_status: string,
  message: string
}
```

#### `complete_current_phase`

Marks the current phase as completed and advances to the next.

```typescript
complete_current_phase(
  workflow_id: string,
  output: {
    summary: string,
    artifacts?: string[],
    metadata?: object
  }
) -> {
  completed_phase: number,
  next_phase: number,
  phase_status: string
}
```

---

### Phase Execution

#### `execute_phase`

Executes a specific phase with input data.

```typescript
execute_phase(
  workflow_id: string,
  phase_number: number,
  input: object
) -> {
  phase_number: number,
  status: string, // 'completed', 'waiting_approval', 'waiting_quality_gate', 'failed'
  output: object,
  next_action?: string
}
```

**Example - Phase 0 (Premise Development):**
```typescript
const result = await mcp.call('workflow-manager', 'execute_phase', {
  workflow_id: 'workflow-789',
  phase_number: 0,
  input: {
    concept: 'Willy Wonka but serial killer',
    target_genre: 'Dark Horror'
  }
});
// Returns: { phase_number: 0, status: 'completed', output: { refined_concept: '...' } }
```

#### `retry_failed_phase`

Retries a phase that previously failed.

```typescript
retry_failed_phase(
  workflow_id: string,
  phase_number: number
) -> PhaseResult
```

#### `skip_phase`

Skips a phase (admin only, for testing).

```typescript
skip_phase(
  workflow_id: string,
  phase_number: number,
  reason: string
) -> PhaseSkip
```

---

### Quality Gates

#### `record_quality_gate`

Records the result of a quality gate validation.

```typescript
record_quality_gate(
  workflow_id: string,
  gate_type: 'npe_series' | 'npe_scene' | 'commercial',
  score: number,
  passed: boolean,
  violations: Array<{
    category: string,
    severity: string,
    message: string,
    suggestion: string
  }>
) -> {
  gate_id: string,
  passed: boolean,
  next_action: string // 'proceed' or 'return_to_phase_X'
}
```

**Example - NPE Series Validation (Phase 4):**
```typescript
const gate = await mcp.call('workflow-manager', 'record_quality_gate', {
  workflow_id: 'workflow-789',
  gate_type: 'npe_series',
  score: 87,
  passed: true,
  violations: []
});
// Returns: { gate_id: 'gate-123', passed: true, next_action: 'proceed' }
```

#### `check_gate_status`

Checks if a quality gate has been passed.

```typescript
check_gate_status(
  workflow_id: string,
  phase_number: number
) -> {
  has_gate: boolean,
  passed: boolean | null,
  score: number | null,
  violations: array
}
```

---

### User Approvals

#### `request_approval`

Requests user approval for a phase.

```typescript
request_approval(
  workflow_id: string,
  approval_type: 'series_plan' | 'book_completion' | 'chapter_plan',
  artifacts: string[] // Paths to documents to review
) -> {
  approval_id: string,
  status: 'pending',
  requested_at: string
}
```

**Example - Series Plan Approval (Phase 7):**
```typescript
const approval = await mcp.call('workflow-manager', 'request_approval', {
  workflow_id: 'workflow-789',
  approval_type: 'series_plan',
  artifacts: [
    '/series/uuid-123/architecture.md',
    '/series/uuid-123/npe-validation-report.md',
    '/series/uuid-123/commercial-assessment.md'
  ]
});
// Returns: { approval_id: 'approval-456', status: 'pending', requested_at: '2024-12-02T...' }
```

#### `submit_approval`

Submits an approval decision.

```typescript
submit_approval(
  approval_id: string,
  decision: 'approved' | 'rejected' | 'revision_requested',
  feedback?: string
) -> {
  approval_id: string,
  status: string,
  approved_at: string,
  next_action: string
}
```

**Example - User Approves:**
```typescript
const result = await mcp.call('workflow-manager', 'submit_approval', {
  approval_id: 'approval-456',
  decision: 'approved',
  feedback: 'Looks great! Proceed to writing.'
});
// Returns: { approval_id: 'approval-456', status: 'approved', next_action: 'advance_to_phase_8' }
```

#### `get_pending_approvals`

Gets all pending approvals for a workflow.

```typescript
get_pending_approvals(
  workflow_id: string
) -> Array<{
  approval_id: string,
  approval_type: string,
  requested_at: string,
  artifacts: string[]
}>
```

---

### Book Production Loop (Phase 12)

#### `start_book_iteration`

Starts a new book iteration in the production loop.

```typescript
start_book_iteration(
  workflow_id: string,
  book_number: number // 2-5
) -> {
  book_number: number,
  iteration_started: string,
  current_phase: number // Returns to Phase 9 (Chapter Planning)
}
```

#### `complete_book_iteration`

Completes a book iteration and requests approval.

```typescript
complete_book_iteration(
  workflow_id: string,
  book_number: number
) -> {
  book_number: number,
  completed_at: string,
  approval_id: string, // Auto-creates approval request
  next_book: number | null // null if all 5 books complete
}
```

#### `get_series_progress`

Gets the overall progress of the series.

```typescript
get_series_progress(
  workflow_id: string
) -> {
  total_books: number,
  books_completed: number,
  current_book: number,
  current_phase: number,
  percent_complete: number
}
```

---

### Workflow Queries

#### `get_phase_history`

Gets the complete history of phase executions.

```typescript
get_phase_history(
  workflow_id: string
) -> Array<{
  phase_number: number,
  phase_name: string,
  started_at: string,
  completed_at: string | null,
  status: string,
  agent: string,
  validation_score: number | null
}>
```

#### `get_workflow_timeline`

Gets a timeline view of the workflow.

```typescript
get_workflow_timeline(
  workflow_id: string
) -> {
  created_at: string,
  phases: Array<{
    phase_number: number,
    phase_name: string,
    duration_minutes: number,
    status: string
  }>,
  total_duration_hours: number
}
```

#### `list_active_workflows`

Lists all active workflows for a user.

```typescript
list_active_workflows(
  user_id: string
) -> Array<{
  workflow_id: string,
  series_id: string,
  series_title: string,
  current_phase: number,
  phase_status: string,
  created_at: string
}>
```

---

## MCP Resources

Resources provide read-only access to workflow state.

### Current State

```
workflow://{workflow_id}/state
```

Returns the current workflow state as JSON.

### Current Phase

```
workflow://{workflow_id}/current-phase
```

Returns the current phase number and name.

### Series Progress

```
workflow://{workflow_id}/series-progress
```

Returns the series production progress (books completed, current book, etc.).

### Phase Documentation

```
workflow://phases/{phase_number}/description
workflow://phases/{phase_number}/requirements
workflow://phases/{phase_number}/outputs
```

Returns documentation for a specific phase.

### Approval Status

```
workflow://{workflow_id}/approvals/pending
workflow://{workflow_id}/approvals/history
```

Returns pending or historical approvals.

### Quality Gates

```
workflow://{workflow_id}/gates/npe-series
workflow://{workflow_id}/gates/npe-scene
workflow://{workflow_id}/gates/commercial
```

Returns quality gate results.

---

## Client Integration Examples

### Claude Code (market-driven-planning-skill)

```typescript
// User invokes: /market-driven-planning-skill with concept
const concept = "Willy Wonka but serial killer";

// Step 1: Create workflow
const workflow = await mcp.call('workflow-manager', 'create_workflow', {
  series_id: seriesId,
  user_id: userId,
  concept: concept
});

console.log(`Created workflow: ${workflow.workflow_id}`);

// Step 2: Execute Phase 0 (Premise Development)
const phase0 = await mcp.call('workflow-manager', 'execute_phase', {
  workflow_id: workflow.workflow_id,
  phase_number: 0,
  input: { concept }
});

// Step 3: Execute Phase 1 (Genre Pack Management)
const phase1 = await mcp.call('workflow-manager', 'execute_phase', {
  workflow_id: workflow.workflow_id,
  phase_number: 1,
  input: { target_genre: phase0.output.target_genre }
});

// ... continue through phases

// Step 4: Check workflow state
const state = await mcp.call('workflow-manager', 'get_workflow_state', {
  workflow_id: workflow.workflow_id
});

console.log(`Current Phase: ${state.current_phase} - ${state.phase_name}`);
console.log(`Status: ${state.phase_status}`);
```

### TypingMind (User Queries)

```typescript
// User asks: "What's the status of my series?"
const workflows = await mcp.call('workflow-manager', 'list_active_workflows', {
  user_id: currentUser.id
});

if (workflows.length === 0) {
  return "You don't have any active workflows. Start one with /market-driven-planning-skill!";
}

const workflow = workflows[0];
const state = await mcp.call('workflow-manager', 'get_workflow_state', {
  workflow_id: workflow.workflow_id
});

return `Your series "${workflow.series_title}" is currently in Phase ${state.current_phase}: ${state.phase_name}. Status: ${state.phase_status}`;

// User asks: "Do I have any pending approvals?"
const approvals = await mcp.call('workflow-manager', 'get_pending_approvals', {
  workflow_id: workflow.workflow_id
});

if (approvals.length > 0) {
  return `You have ${approvals.length} pending approval(s). Review the series plan to proceed.`;
}
```

### FictionLab UI (Dashboard)

```typescript
// Dashboard component
const WorkflowDashboard = () => {
  const [workflow, setWorkflow] = useState(null);
  const [progress, setProgress] = useState(null);
  
  useEffect(() => {
    // Load active workflow
    const loadWorkflow = async () => {
      const workflows = await mcp.call('workflow-manager', 'list_active_workflows', {
        user_id: currentUser.id
      });
      
      if (workflows.length > 0) {
        const wf = workflows[0];
        setWorkflow(wf);
        
        // Get series progress
        const prog = await mcp.call('workflow-manager', 'get_series_progress', {
          workflow_id: wf.workflow_id
        });
        setProgress(prog);
      }
    };
    
    loadWorkflow();
    
    // Subscribe to real-time updates
    websocket.on('workflow_updated', (data) => {
      if (data.workflow_id === workflow?.workflow_id) {
        setWorkflow(data.state);
      }
    });
  }, []);
  
  return (
    <div>
      <h2>Series Production Progress</h2>
      <ProgressBar 
        phases={12} 
        current={workflow?.current_phase}
        booksCompleted={progress?.books_completed}
        totalBooks={5}
      />
      
      <PhaseIndicator 
        phase={workflow?.current_phase}
        status={workflow?.phase_status}
      />
      
      <ApprovalQueue workflow_id={workflow?.workflow_id} />
    </div>
  );
};
```

---

## Real-World Usage Scenario

### Scenario: User writes a 5-book series from concept to completion

**Hour 1 - Planning (Phases 0-7)**

1. User opens Claude Code, invokes `/market-driven-planning-skill` with concept
2. Workflow Manager creates workflow instance
3. Phases 0-3 execute (Premise → Genre Pack → Market Research → Series Architect)
4. Phase 4 (NPE Validation) runs, scores 87/100 → PASS
5. Phase 5 (Commercial Validation) runs, scores 8/10 → APPROVE
6. Phase 6 (Writing Team Review) completes
7. Phase 7 (User Approval) - Workflow Manager requests approval
8. User reviews documents in TypingMind, approves
9. Phase 8 (MCP Commit) - Data stored in database

**Hours 2-3 - Book 1 Writing (Phases 9-11)**

10. Phase 9 (Chapter Planning) - 25 chapters planned
11. Phase 10 (Scene Validation) - Scenes validated
12. Phase 11 (Writing Execution) - Book 1 written

**Hours 4-8 - Books 2-5 (Phase 12 Loop)**

13. Phase 12 starts Book 2 iteration
14. Repeats Phases 9-11 for Book 2
15. User approval gate → User approves Book 2
16. Repeats for Books 3, 4, 5

**Hour 8 - Series Complete**

17. Workflow status: `completed`
18. All 5 books written and validated
19. User can export manuscripts

**Throughout the process:**
- User checks status in TypingMind: "What phase am I on?"
- FictionLab UI shows real-time progress bar
- Approval notifications sent when user input needed
- All clients see same workflow state

---

## Benefits

1. **Centralized State** - Single source of truth for workflow progress
2. **Multi-Client Support** - TypingMind, Claude Code, FictionLab all use same workflow
3. **Quality Enforcement** - Gates prevent advancing with flawed plans
4. **User Control** - Explicit approval checkpoints
5. **Audit Trail** - Complete history of phase executions
6. **Resumable** - Pause and resume workflows across sessions
7. **Scalable** - Supports subscription tiers and limits
8. **Observable** - Real-time workflow state updates

---

## Next Steps for Implementation

1. Create database migrations for new tables
2. Implement MCP server in TypeScript/Node.js
3. Add to FictionLab's docker-compose.yml (port 3012)
4. Update client MCP configurations
5. Create UI components for FictionLab dashboard
6. Write comprehensive tests
7. Deploy to production

---

**Last Updated:** 2024-12-02  
**Version:** 3.0 (Design Complete)  
**Status:** Ready for Implementation
