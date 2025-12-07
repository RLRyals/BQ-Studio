# Workflow Manager MCP - System Overview

**Version:** 3.1 (Phase 3 Complete - Production Metrics)
**Last Updated:** 2025-12-03
**Status:** Design Complete - Ready for Implementation

---

## Purpose

The **Workflow Manager MCP** orchestrates the entire 12-phase novel writing process for FictionLab. It provides centralized workflow state management, quality gate coordination, user approval checkpoints, and comprehensive production metrics across all clients (TypingMind, Claude Code, FictionLab UI).

---

## System Architecture

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
│         │  • record_production_metric()      │              │
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

## Repository Structure

This system is implemented across three repositories:

### 1. **BQ-Studio** (This Repo)
- High-level workflow design and architecture
- Claude Code slash commands and skills
- User-facing documentation
- Integration examples

**Document:** [WORKFLOW_MANAGER_BQ_STUDIO.md](./WORKFLOW_MANAGER_BQ_STUDIO.md)

### 2. **MCP-Writing-Servers**
- Workflow Manager MCP server implementation
- Database schema and migrations
- MCP tools and resources
- Server-side logic and API

**Document:** Reference to `MCP-Writing-Servers/workflow-manager/README.md`

### 3. **MCP-Electron-App** (FictionLab UI)
- Dashboard components for workflow visualization
- Analytics dashboard with metrics and charts
- Real-time workflow state display
- User approval interfaces

**Document:** Reference to `MCP-Electron-App/docs/WORKFLOW_DASHBOARD.md`

---

## Implementation Phases

### Phase 1: Core Infrastructure ✅ COMPLETE
- Database schema design (7 tables)
- Workflow lifecycle tools
- Phase execution tools
- Quality gate coordination
- User approval system

### Phase 2: Book Production Loop ✅ COMPLETE
- Multi-book iteration support (Books 1-5)
- Book-level approval gates
- Series progress tracking
- Workflow queries and resources

### Phase 3: Production Metrics ✅ COMPLETE
- Production metrics database schema
- Metrics recording tools
- Analytics and velocity calculations
- Daily writing statistics
- Phase performance analytics
- MCP Resources for metrics visualization
- FictionLab Analytics Dashboard integration

---

## Key Features

1. **Centralized State Management** - Single source of truth for workflow progress
2. **Multi-Client Support** - TypingMind, Claude Code, FictionLab all use same workflow
3. **Quality Enforcement** - NPE and Commercial validation gates
4. **User Approval Checkpoints** - Explicit approval at key milestones
5. **Audit Trail** - Complete history of phase executions
6. **Resumable Workflows** - Pause and resume across sessions
7. **Production Metrics** - Comprehensive analytics on writing productivity
8. **Velocity Tracking** - Real-time writing speed and efficiency metrics
9. **Predictive Analytics** - Estimated completion dates
10. **Performance Insights** - Identify bottleneck phases

---

## Database Tables (7 Total)

### Core Workflow
1. **workflow_instances** - Current workflow state
2. **workflow_phase_history** - Audit trail of phase executions
3. **workflow_approvals** - User approval checkpoints
4. **workflow_quality_gates** - NPE and commercial validation results

### Production Metrics
5. **production_metrics** - Individual production metrics (words, time, scores)
6. **daily_writing_stats** - Aggregated daily statistics
7. **phase_performance** - System-wide phase analytics

---

## MCP Tools (20+ Tools)

### Workflow Lifecycle
- `create_workflow` - Create new workflow instance
- `get_workflow_state` - Get current workflow state
- `advance_to_phase` - Move to specific phase
- `complete_current_phase` - Mark phase complete and advance

### Phase Execution
- `execute_phase` - Execute a phase with input
- `retry_failed_phase` - Retry failed phase
- `skip_phase` - Skip phase (admin only)

### Quality Gates
- `record_quality_gate` - Record NPE/commercial validation results
- `check_gate_status` - Check if gate passed

### User Approvals
- `request_approval` - Request user approval
- `submit_approval` - Submit approval decision
- `get_pending_approvals` - Get pending approvals

### Book Production Loop
- `start_book_iteration` - Start new book (2-5)
- `complete_book_iteration` - Complete book and request approval
- `get_series_progress` - Get series progress

### Production Metrics (Phase 3)
- `record_production_metric` - Record metric (words, time, scores)
- `get_workflow_metrics` - Get aggregated metrics
- `get_phase_analytics` - Get phase performance analytics
- `get_daily_writing_stats` - Get daily statistics
- `get_workflow_velocity` - Get velocity and projections
- `update_daily_stats` - Update daily stats

### Workflow Queries
- `get_phase_history` - Get phase execution history
- `get_workflow_timeline` - Get workflow timeline
- `list_active_workflows` - List active workflows for user

---

## MCP Resources

Provide read-only access to workflow state via URI patterns:

```
workflow://{workflow_id}/state
workflow://{workflow_id}/current-phase
workflow://{workflow_id}/series-progress
workflow://{workflow_id}/approvals/pending
workflow://{workflow_id}/gates/{gate_type}
workflow://{workflow_id}/metrics/summary
workflow://{workflow_id}/metrics/velocity
workflow://{workflow_id}/metrics/daily-stats
workflow://analytics/phase-performance
workflow://phases/{phase_number}/description
```

---

## Real-World Usage Flow

**Hour 1 - Planning (Phases 0-7)**
1. User invokes `/market-driven-planning-skill` in Claude Code
2. Workflow Manager creates workflow instance
3. Executes Phases 0-7 (Premise → Series Architecture)
4. NPE Validation (Phase 4) → Score 87/100 → PASS
5. Commercial Validation (Phase 5) → Score 8/10 → APPROVE
6. User Approval (Phase 7) → User reviews and approves in TypingMind

**Hours 2-3 - Book 1 Writing (Phases 9-11)**
7. Chapter Planning (Phase 9) → 25 chapters planned
8. Scene Validation (Phase 10) → Scenes validated
9. Writing Execution (Phase 11) → Book 1 written
   - **Metrics recorded:** 71,250 words, 8.5 hours, 2,847 words/hour

**Hours 4-8 - Books 2-5 (Phase 12 Loop)**
10. Phase 12 starts Book 2 iteration → Returns to Phase 9
11. Repeats for Books 2, 3, 4, 5
12. User approval after each book

**Hour 8 - Series Complete**
13. Workflow status: `completed`
14. All 5 books written (356,250 total words)
15. Analytics show: 92% NPE pass rate, 0.28 planning ratio

---

## Benefits Summary

- **Centralized orchestration** across all clients
- **Quality assurance** through validation gates
- **User control** with approval checkpoints
- **Complete audit trail** of all operations
- **Real-time metrics** and productivity insights
- **Predictive analytics** for completion estimates
- **Performance optimization** through bottleneck identification

---

## Next Steps

1. **Review repo-specific documents:**
   - BQ-Studio: [WORKFLOW_MANAGER_BQ_STUDIO.md](./WORKFLOW_MANAGER_BQ_STUDIO.md)
   - MCP-Writing-Servers: `workflow-manager/README.md`
   - MCP-Electron-App: `docs/WORKFLOW_DASHBOARD.md`

2. **Implementation sequence:**
   - Database migrations (MCP-Writing-Servers)
   - MCP server implementation (MCP-Writing-Servers)
   - Claude Code integration (BQ-Studio)
   - Dashboard UI (MCP-Electron-App)

3. **Testing and deployment:**
   - Unit tests, integration tests, E2E tests
   - Staging deployment
   - Production rollout

---

**Related Documents:**
- [Full Design Specification](./WORKFLOW_MANAGER_MCP.md) - Complete technical design
- [BQ-Studio Integration](./WORKFLOW_MANAGER_BQ_STUDIO.md) - Claude Code skills and commands
- MCP-Writing-Servers: `workflow-manager/README.md` - Server implementation
- MCP-Electron-App: `docs/WORKFLOW_DASHBOARD.md` - Dashboard UI
