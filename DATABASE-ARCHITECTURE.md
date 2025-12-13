# Database Architecture - FictionLab Integration

## Overview

This document explains the database architecture for BQ-Studio's integration with FictionLab.

---

## Database Schemas

### FictionLab Public Schema

**Owner:** FictionLab Core
**Purpose:** Core application tables managed by FictionLab

**Tables:**

1. **workflows** - Stores workflow definitions as JSON
   - `id` UUID (primary key)
   - `name` VARCHAR(255)
   - `description` TEXT
   - `steps` JSONB (array of workflow step definitions)
   - `target_type` VARCHAR(50)
   - `status` VARCHAR(50) - 'draft' | 'active' | 'archived'
   - `variables` JSONB
   - `created_at` TIMESTAMP
   - `updated_at` TIMESTAMP

2. **workflow_runs** - Tracks workflow execution state
   - `id` UUID (primary key)
   - `workflow_id` UUID (foreign key → workflows.id)
   - `status` VARCHAR(50) - 'pending' | 'running' | 'completed' | 'failed'
   - `execution_log` JSONB
   - `context` JSONB
   - `started_at` TIMESTAMP
   - `completed_at` TIMESTAMP
   - `created_at` TIMESTAMP

**File:** `C:\github\MCP-Electron-App\database-migrations\004_create_workflows_table.sql`

---

### MCP Server Tables (Public Schema)

**Owner:** workflow-manager MCP Server
**Purpose:** Writing workflow state tracking for multi-book series production

These tables are managed by the **workflow-manager MCP server** and track the state of writing workflows (series planning → book planning → chapter planning → scene writing).

**Tables:**

1. **workflow_instances** - Current state of each writing workflow
   - `id` SERIAL (primary key)
   - `series_id` INTEGER (foreign key → series.id)
   - `author_id` INTEGER (foreign key → authors.id)
   - `current_phase` INTEGER - Phase number (-1 to 12)
   - `phase_status` TEXT - 'in_progress' | 'waiting_approval' | 'waiting_quality_gate' | 'completed' | 'failed'
   - `current_book` INTEGER - Book number (1-5)
   - `current_chapter` INTEGER
   - `created_at` TIMESTAMP
   - `updated_at` TIMESTAMP
   - `completed_at` TIMESTAMP
   - `metadata` JSONB

2. **workflow_phase_history** - Audit trail of all phase executions
   - `id` SERIAL (primary key)
   - `workflow_id` INTEGER (foreign key → workflow_instances.id)
   - `phase_number` INTEGER
   - `phase_name` TEXT
   - `started_at` TIMESTAMP
   - `completed_at` TIMESTAMP
   - `status` TEXT - 'started' | 'completed' | 'failed' | 'skipped'
   - `agent` TEXT - Which agent executed this phase
   - `output_summary` TEXT
   - `validation_score` DECIMAL(5,2) - For quality gate phases
   - `metadata` JSONB

3. **workflow_approvals** - User approval checkpoints
   - `id` SERIAL (primary key)
   - `workflow_id` INTEGER (foreign key → workflow_instances.id)
   - `phase_number` INTEGER
   - `approval_type` TEXT - 'series_plan' | 'book_completion' | 'chapter_plan'
   - `requested_at` TIMESTAMP
   - `approved_at` TIMESTAMP
   - `approved_by` TEXT
   - `status` TEXT - 'pending' | 'approved' | 'rejected' | 'revision_requested'
   - `feedback` TEXT
   - `artifacts` JSONB - Links to documents to review
   - `metadata` JSONB

4. **workflow_quality_gates** - Quality gate results (NPE, Commercial)
   - `id` SERIAL (primary key)
   - `workflow_id` INTEGER (foreign key → workflow_instances.id)
   - `phase_number` INTEGER
   - `gate_type` TEXT - 'npe_series' | 'npe_scene' | 'commercial'
   - `score` DECIMAL(5,2)
   - `passed` BOOLEAN
   - `violations` JSONB - Array of violation objects
   - `executed_at` TIMESTAMP
   - `metadata` JSONB

5. **production_metrics** - Production tracking throughout workflow lifecycle
   - `id` SERIAL (primary key)
   - `workflow_id` INTEGER (foreign key → workflow_instances.id)
   - `metric_type` TEXT - 'words_written', 'chapters_completed', 'scenes_validated', 'planning_time_minutes', etc.
   - `metric_value` DECIMAL(10,2)
   - `phase_number` INTEGER
   - `book_number` INTEGER
   - `chapter_number` INTEGER
   - `recorded_at` TIMESTAMP
   - `metadata` JSONB

**File:** `C:\github\MCP-Electron-App\WORKFLOW_MANAGER_MCP.md`

**Important Distinction:**
- **FictionLab's `workflows`/`workflow_runs`** = Workflow execution engine state (which steps have been executed in FictionLab workflows)
- **MCP's `workflow_instances`/`workflow_phase_history`** = Writing workflow state (series/book/chapter progress in the writing process)
- These serve different purposes and work together - FictionLab workflows call Claude Code skills that update MCP workflow state

---

### Plugin Schema: plugin_claude_code_executor

**Owner:** claude-code-executor plugin
**Purpose:** Plugin-specific tables for Claude Code execution tracking

**Tables:**

1. **claude_sessions** - Tracks Claude Code CLI sessions
   - `id` VARCHAR(255) (primary key)
   - `skill_name` VARCHAR(255)
   - `workspace_directory` TEXT
   - `session_token` TEXT
   - `current_phase` INTEGER
   - `status` VARCHAR(50)
   - `metadata` JSONB
   - `created_at` TIMESTAMP
   - `updated_at` TIMESTAMP

2. **token_usage** - Tracks Claude token consumption
   - `id` SERIAL (primary key)
   - `session_id` VARCHAR(255) (foreign key → claude_sessions.id)
   - `phase_number` INTEGER
   - `input_tokens` INTEGER
   - `output_tokens` INTEGER
   - `total_tokens` INTEGER
   - `cost_estimate` DECIMAL(10, 4)
   - `model_name` VARCHAR(100)
   - `recorded_at` TIMESTAMP

3. **execution_jobs** - Job queue state and retry logic
   - `id` VARCHAR(255) (primary key)
   - `session_id` VARCHAR(255) (foreign key → claude_sessions.id)
   - `skill_name` VARCHAR(255)
   - `phase_number` INTEGER
   - `status` VARCHAR(50)
   - `priority` INTEGER
   - `retry_count` INTEGER
   - `max_retries` INTEGER
   - `error_message` TEXT
   - `input_data` JSONB
   - `output_data` JSONB
   - `scheduled_at` TIMESTAMP
   - `started_at` TIMESTAMP
   - `completed_at` TIMESTAMP
   - `created_at` TIMESTAMP
   - `updated_at` TIMESTAMP

4. **job_logs** - Execution logs for debugging
   - `id` SERIAL (primary key)
   - `job_id` VARCHAR(255) (foreign key → execution_jobs.id)
   - `level` VARCHAR(20) - 'info' | 'warn' | 'error'
   - `message` TEXT
   - `metadata` JSONB
   - `created_at` TIMESTAMP

**File:** `marketplace/plugins/claude-code-executor/schema.sql`

---

## Architecture Decisions

### Why No BQ-Studio Workflow Tables?

**Initial Misunderstanding:**
- Originally designed `workflow_templates`, `workflow_steps`, `workflow_instances`, `workflow_step_executions` tables in BQ-Studio

**Correction:**
- FictionLab already has `workflows` and `workflow_runs` tables
- BQ-Studio workflows are **JSON files** users import (like N8N), not database templates
- Workflow steps stored as **JSONB** in `workflows.steps`, not separate table

**Result:**
- Removed obsolete workflow methods from `PluginDatabase.ts` (lines 425-707)
- Deleted `src/core/database/schema/workflow-tables.sql`
- Plugin only manages its own execution tracking tables

### Schema Separation

**FictionLab Public Schema:**
- Workflow definitions and execution state
- Managed by FictionLab's workflow engine
- UUID-based primary keys
- JSONB for flexible data storage

**Plugin Schemas:**
- Each plugin creates its own schema: `plugin_{plugin-id}`
- Isolated data management
- Plugins cannot modify FictionLab core tables
- Clean separation of concerns

---

## Data Flow: Workflow Execution

### Step 1: User Imports Workflow

1. User selects `book-planning-workflow.json` file
2. FictionLab parses JSON and validates structure
3. FictionLab inserts record into `workflows` table:
   ```sql
   INSERT INTO workflows (id, name, steps, status, variables)
   VALUES (gen_random_uuid(), 'Book Planning Workflow', <steps_jsonb>, 'active', <variables_jsonb>)
   ```

### Step 2: User Runs Workflow

1. User selects workflow and provides input variables
2. FictionLab creates execution record:
   ```sql
   INSERT INTO workflow_runs (id, workflow_id, status, context)
   VALUES (gen_random_uuid(), <workflow_id>, 'pending', <context_jsonb>)
   ```

### Step 3: Workflow Engine Executes Steps

For each step in `workflows.steps` JSONB array:

1. **FictionLab Workflow Engine:**
   - Substitutes variables: `{{series_id}}` → actual value
   - Calls plugin action via IPC: `plugin:claude-code-executor:execute-skill`

2. **claude-code-executor Plugin:**
   - Creates session record:
     ```sql
     INSERT INTO plugin_claude_code_executor.claude_sessions
     (id, skill_name, workspace_directory, current_phase, status)
     VALUES (<session_id>, 'book-planning-skill', <workspace>, 1, 'active')
     ```
   - Creates job record:
     ```sql
     INSERT INTO plugin_claude_code_executor.execution_jobs
     (id, session_id, skill_name, phase_number, status, input_data)
     VALUES (<job_id>, <session_id>, 'book-planning-skill', 1, 'running', <input_jsonb>)
     ```
   - Spawns Claude Code CLI as child process
   - Logs execution to `job_logs` table

3. **Claude Code CLI:**
   - Executes skill phase
   - Writes outputs to MCP servers (e.g., `workflow-manager`)
   - Returns structured result

4. **Plugin Returns Result:**
   - Updates `execution_jobs` with output:
     ```sql
     UPDATE plugin_claude_code_executor.execution_jobs
     SET status = 'completed', output_data = <output_jsonb>, completed_at = NOW()
     WHERE id = <job_id>
     ```
   - Tracks token usage:
     ```sql
     INSERT INTO plugin_claude_code_executor.token_usage
     (session_id, phase_number, input_tokens, output_tokens, total_tokens)
     VALUES (<session_id>, 1, 5000, 3000, 8000)
     ```
   - Returns to workflow engine:
     ```json
     {
       "success": true,
       "result": {
         "book_id": "book_123",
         "outputs": ["foundation.md"],
         "metadata": { "phaseCompleted": 1 }
       }
     }
     ```

5. **FictionLab Workflow Engine:**
   - Extracts outputs via JSONPath: `$.result.book_id` → `"book_123"`
   - Updates `workflow_runs` execution log:
     ```sql
     UPDATE workflow_runs
     SET execution_log = jsonb_set(execution_log, '{phase-1-foundation}', <step_output_jsonb>)
     WHERE id = <run_id>
     ```
   - Proceeds to next step with variable substitution: `{{phase-1-foundation.book_id}}`

### Step 4: Workflow Completion

1. All steps executed successfully
2. FictionLab updates workflow run:
   ```sql
   UPDATE workflow_runs
   SET status = 'completed', completed_at = NOW()
   WHERE id = <run_id>
   ```
3. User can view outputs in FictionLab UI

---

## PluginDatabase.ts - Valid Methods

After cleanup, `PluginDatabase.ts` only manages **plugin-specific tables**:

### Claude Sessions
- `createSession(data)` → Insert into `claude_sessions`
- `getSession(id)` → Select from `claude_sessions`
- `updateSessionStatus(id, status, phase?)` → Update `claude_sessions`
- `getActiveSession(skillName)` → Query `claude_sessions WHERE status = 'active'`

### Token Usage
- `recordTokenUsage(data)` → Insert into `token_usage`
- `getTokenUsageBySession(sessionId)` → Select from `token_usage`
- `getTotalTokenUsage(startDate?, endDate?)` → Aggregate query on `token_usage`

### Execution Jobs
- `createJob(data)` → Insert into `execution_jobs`
- `getJob(id)` → Select from `execution_jobs`
- `updateJobStatus(id, status, outputData?, error?)` → Update `execution_jobs`
- `getQueuedJobs()` → Query `execution_jobs WHERE status IN ('pending', 'running')`
- `incrementRetryCount(id)` → Update `execution_jobs.retry_count`

### Job Logs
- `createLog(jobId, level, message, metadata?)` → Insert into `job_logs`
- `getJobLogs(jobId)` → Select from `job_logs`
- `getRecentLogs(limit)` → Query recent `job_logs`
- `cleanupOldLogs(cutoffDate)` → Delete old records from `job_logs`

**File:** `src/core/database/PluginDatabase.ts` (lines 67-423 are valid)

---

## Files Reference

### FictionLab Repository

**Database Migrations:**
- `database-migrations/004_create_workflows_table.sql` - Core workflow tables

**Workflow Engine:**
- `src/main/workflow-engine.ts` - Executes workflows, calls plugins

**Plugin System:**
- `src/core/plugin-manager/PluginManager.ts` - Loads plugins from `userData/plugins/`

### BQ-Studio Repository

**Plugin Schema:**
- `marketplace/plugins/claude-code-executor/schema.sql` - Plugin-specific tables

**Plugin Database Wrapper:**
- `src/core/database/PluginDatabase.ts` - Helper methods for plugin schema

**Deleted Files:**
- ~~`src/core/database/schema/workflow-tables.sql`~~ (obsolete, deleted)

**Removed Code:**
- ~~`PluginDatabase.ts` lines 425-707~~ (workflow methods, removed)

---

## Summary

**Database Architecture - Three Schemas:**

1. **FictionLab Public Schema** (Core)
   - `workflows` → Workflow definitions (JSON importable)
   - `workflow_runs` → Workflow execution engine state
   - Purpose: Track which steps have been executed in FictionLab workflows

2. **MCP Server Public Schema** (workflow-manager MCP)
   - `workflow_instances` → Writing workflow state (series/book/chapter progress)
   - `workflow_phase_history` → Audit trail of writing phases
   - `workflow_approvals` → User approval checkpoints
   - `workflow_quality_gates` → Quality gate results (NPE, Commercial)
   - `production_metrics` → Writing production tracking
   - Purpose: Track the state of the writing process itself

3. **Plugin Schemas** (plugin_claude_code_executor)
   - `claude_sessions` → Claude Code CLI sessions
   - `token_usage` → Token consumption tracking
   - `execution_jobs` → Job queue state
   - `job_logs` → Execution logs
   - Purpose: Track Claude Code execution details

**How They Work Together:**

```
User runs FictionLab workflow (book-planning-workflow.json)
    ↓
FictionLab workflow engine (workflows/workflow_runs tables)
    ↓
Calls claude-code-executor plugin (plugin_claude_code_executor schema)
    ↓
Spawns Claude Code CLI executing book-planning-skill.md
    ↓
Skill uses workflow-manager MCP (workflow_instances/workflow_phase_history tables)
    ↓
Writing state updated, outputs returned
```

**Key Insight:**
- **FictionLab workflows** = Automation/orchestration layer (JSON files)
- **MCP workflow state** = Domain data layer (writing progress)
- **Plugin state** = Execution layer (job tracking)
- All three work together with no duplication or overlap
