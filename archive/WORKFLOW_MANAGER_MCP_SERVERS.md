# Workflow Manager MCP Server - Implementation Specification

**Repository:** MCP-Writing-Servers
**Location:** `workflow-manager/`
**Port:** 3012
**Version:** 3.1
**Last Updated:** 2025-12-03

---

## Overview

This document specifies the implementation of the Workflow Manager MCP server in the MCP-Writing-Servers repository. This server orchestrates the 12-phase novel writing workflow and provides production metrics.

**Implementation Path:** `MCP-Writing-Servers/workflow-manager/`

---

## Directory Structure

```
MCP-Writing-Servers/
└── workflow-manager/
    ├── src/
    │   ├── index.ts                 # MCP server entry point
    │   ├── database/
    │   │   ├── client.ts            # PostgreSQL client
    │   │   ├── migrations/          # Database migrations
    │   │   │   ├── 001_workflow_instances.sql
    │   │   │   ├── 002_workflow_phase_history.sql
    │   │   │   ├── 003_workflow_approvals.sql
    │   │   │   ├── 004_workflow_quality_gates.sql
    │   │   │   ├── 005_production_metrics.sql
    │   │   │   ├── 006_daily_writing_stats.sql
    │   │   │   └── 007_phase_performance.sql
    │   │   └── queries.ts           # SQL query helpers
    │   ├── tools/
    │   │   ├── workflow-lifecycle.ts
    │   │   ├── phase-execution.ts
    │   │   ├── quality-gates.ts
    │   │   ├── user-approvals.ts
    │   │   ├── book-production.ts
    │   │   ├── production-metrics.ts
    │   │   └── workflow-queries.ts
    │   ├── resources/
    │   │   ├── workflow-state.ts
    │   │   ├── phase-info.ts
    │   │   └── metrics.ts
    │   ├── types/
    │   │   └── workflow.ts          # TypeScript interfaces
    │   └── utils/
    │       ├── phase-definitions.ts # 12-phase configuration
    │       └── validators.ts        # Input validation
    ├── tests/
    │   ├── unit/
    │   ├── integration/
    │   └── e2e/
    ├── package.json
    ├── tsconfig.json
    ├── Dockerfile
    └── README.md
```

---

## Database Migrations

### Migration 001: workflow_instances

**File:** `src/database/migrations/001_workflow_instances.sql`

```sql
CREATE TABLE workflow_instances (
  id SERIAL PRIMARY KEY,
  series_id INTEGER REFERENCES series(id),
  author_id INTEGER REFERENCES authors(id),
  current_phase INTEGER NOT NULL DEFAULT -1, -- -1 = not started, 0-12
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
CREATE INDEX idx_workflow_phase ON workflow_instances(current_phase);
```

### Migration 002: workflow_phase_history

**File:** `src/database/migrations/002_workflow_phase_history.sql`

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
CREATE INDEX idx_phase_history_status ON workflow_phase_history(status);
```

### Migration 003: workflow_approvals

**File:** `src/database/migrations/003_workflow_approvals.sql`

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
CREATE INDEX idx_approvals_type ON workflow_approvals(approval_type);
```

### Migration 004: workflow_quality_gates

**File:** `src/database/migrations/004_workflow_quality_gates.sql`

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
CREATE INDEX idx_gates_passed ON workflow_quality_gates(passed);
```

### Migration 005: production_metrics

**File:** `src/database/migrations/005_production_metrics.sql`

```sql
CREATE TABLE production_metrics (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
    -- 'words_written', 'chapters_completed', 'scenes_validated',
    -- 'planning_time_minutes', 'writing_time_minutes', 'revision_time_minutes',
    -- 'npe_score', 'commercial_score', 'agent_invocations'
  metric_value DECIMAL(10,2) NOT NULL,
  phase_number INTEGER,
  book_number INTEGER,
  chapter_number INTEGER,
  recorded_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_metrics_workflow ON production_metrics(workflow_id);
CREATE INDEX idx_metrics_type ON production_metrics(metric_type);
CREATE INDEX idx_metrics_phase ON production_metrics(phase_number);
CREATE INDEX idx_metrics_recorded ON production_metrics(recorded_at);
CREATE INDEX idx_metrics_book ON production_metrics(book_number);
```

### Migration 006: daily_writing_stats

**File:** `src/database/migrations/006_daily_writing_stats.sql`

```sql
CREATE TABLE daily_writing_stats (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES authors(id),
  stat_date DATE NOT NULL,
  words_written INTEGER DEFAULT 0,
  chapters_completed INTEGER DEFAULT 0,
  scenes_written INTEGER DEFAULT 0,
  writing_time_minutes INTEGER DEFAULT 0,
  phases_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(workflow_id, stat_date)
);

CREATE INDEX idx_daily_stats_workflow ON daily_writing_stats(workflow_id);
CREATE INDEX idx_daily_stats_author ON daily_writing_stats(author_id);
CREATE INDEX idx_daily_stats_date ON daily_writing_stats(stat_date);
```

### Migration 007: phase_performance

**File:** `src/database/migrations/007_phase_performance.sql`

```sql
CREATE TABLE phase_performance (
  id SERIAL PRIMARY KEY,
  phase_number INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  avg_duration_minutes DECIMAL(10,2),
  avg_quality_score DECIMAL(5,2),
  last_execution TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(phase_number)
);

CREATE INDEX idx_phase_perf_number ON phase_performance(phase_number);
```

---

## TypeScript Types

**File:** `src/types/workflow.ts`

```typescript
export interface WorkflowInstance {
  id: number;
  series_id: number;
  author_id: number;
  current_phase: number;
  phase_status: 'in_progress' | 'waiting_approval' | 'waiting_quality_gate' | 'completed' | 'failed';
  current_book: number;
  current_chapter: number | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
  metadata: Record<string, any>;
}

export interface PhaseHistory {
  id: number;
  workflow_id: number;
  phase_number: number;
  phase_name: string;
  started_at: Date;
  completed_at: Date | null;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  agent: string | null;
  output_summary: string | null;
  validation_score: number | null;
  metadata: Record<string, any>;
}

export interface WorkflowApproval {
  id: number;
  workflow_id: number;
  phase_number: number;
  approval_type: 'series_plan' | 'book_completion' | 'chapter_plan';
  requested_at: Date;
  approved_at: Date | null;
  approved_by: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  feedback: string | null;
  artifacts: string[];
  metadata: Record<string, any>;
}

export interface QualityGate {
  id: number;
  workflow_id: number;
  phase_number: number;
  gate_type: 'npe_series' | 'npe_scene' | 'commercial';
  score: number;
  passed: boolean;
  violations: Violation[];
  executed_at: Date;
  metadata: Record<string, any>;
}

export interface Violation {
  category: string;
  severity: 'error' | 'warning';
  message: string;
  suggestion: string;
}

export interface ProductionMetric {
  id: number;
  workflow_id: number;
  metric_type: string;
  metric_value: number;
  phase_number: number | null;
  book_number: number | null;
  chapter_number: number | null;
  recorded_at: Date;
  metadata: Record<string, any>;
}

export interface DailyWritingStats {
  id: number;
  workflow_id: number;
  author_id: number;
  stat_date: string; // YYYY-MM-DD
  words_written: number;
  chapters_completed: number;
  scenes_written: number;
  writing_time_minutes: number;
  phases_completed: number;
  created_at: Date;
  metadata: Record<string, any>;
}

export interface PhasePerformance {
  id: number;
  phase_number: number;
  phase_name: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_minutes: number;
  avg_quality_score: number | null;
  last_execution: Date | null;
  metadata: Record<string, any>;
}
```

---

## MCP Server Implementation

### Main Entry Point

**File:** `src/index.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { initDatabase } from './database/client.js';
import { registerWorkflowTools } from './tools/index.js';
import { registerWorkflowResources } from './resources/index.js';

const server = new Server(
  {
    name: 'workflow-manager',
    version: '3.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Initialize database connection
await initDatabase();

// Register tools
registerWorkflowTools(server);

// Register resources
registerWorkflowResources(server);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Workflow Manager MCP server running on stdio');
```

### Tool Registration

**File:** `src/tools/index.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';

import { workflowLifecycleTools } from './workflow-lifecycle.js';
import { phaseExecutionTools } from './phase-execution.js';
import { qualityGateTools } from './quality-gates.js';
import { userApprovalTools } from './user-approvals.js';
import { bookProductionTools } from './book-production.js';
import { productionMetricsTools } from './production-metrics.js';
import { workflowQueryTools } from './workflow-queries.js';

export function registerWorkflowTools(server: Server) {
  // Register all tool categories
  workflowLifecycleTools(server);
  phaseExecutionTools(server);
  qualityGateTools(server);
  userApprovalTools(server);
  bookProductionTools(server);
  productionMetricsTools(server);
  workflowQueryTools(server);
}
```

### Example Tool Implementation: create_workflow

**File:** `src/tools/workflow-lifecycle.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { db } from '../database/client.js';

export function workflowLifecycleTools(server: Server) {
  // create_workflow
  server.setRequestHandler(
    {
      method: 'tools/call',
      params: {
        name: 'create_workflow',
        arguments: z.object({
          series_id: z.string(),
          user_id: z.string(),
          concept: z.string(),
        }),
      },
    },
    async (request) => {
      const { series_id, user_id, concept } = request.params.arguments;

      const result = await db.query(
        `INSERT INTO workflow_instances (series_id, author_id, current_phase, metadata)
         VALUES ($1, $2, -1, $3)
         RETURNING id, current_phase, phase_status`,
        [series_id, user_id, JSON.stringify({ concept })]
      );

      const workflow = result.rows[0];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              workflow_id: workflow.id,
              current_phase: workflow.current_phase,
              phase_status: workflow.phase_status,
            }),
          },
        ],
      };
    }
  );

  // get_workflow_state
  server.setRequestHandler(
    {
      method: 'tools/call',
      params: {
        name: 'get_workflow_state',
        arguments: z.object({
          workflow_id: z.string(),
        }),
      },
    },
    async (request) => {
      const { workflow_id } = request.params.arguments;

      const result = await db.query(
        `SELECT w.*, s.title as series_title
         FROM workflow_instances w
         JOIN series s ON w.series_id = s.id
         WHERE w.id = $1`,
        [workflow_id]
      );

      if (result.rows.length === 0) {
        throw new Error(`Workflow ${workflow_id} not found`);
      }

      const workflow = result.rows[0];
      const phaseName = getPhase Name(workflow.current_phase);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              workflow_id: workflow.id,
              series_id: workflow.series_id,
              series_title: workflow.series_title,
              current_phase: workflow.current_phase,
              phase_name: phaseName,
              phase_status: workflow.phase_status,
              current_book: workflow.current_book,
              current_chapter: workflow.current_chapter,
              created_at: workflow.created_at,
              updated_at: workflow.updated_at,
            }),
          },
        ],
      };
    }
  );

  // Additional lifecycle tools...
}

function getPhaseName(phaseNumber: number): string {
  const phases = [
    'Premise Development',
    'Genre Pack Management',
    'Market Research',
    'Series Architect',
    'NPE Series Validation',
    'Commercial Validation',
    'Writing Team Review',
    'User Approval',
    'MCP Commit',
    'Chapter Planning',
    'Scene Validation',
    'Writing Execution',
    'Book Production Loop',
  ];

  return phases[phaseNumber] || 'Unknown Phase';
}
```

### Example Tool: record_production_metric

**File:** `src/tools/production-metrics.ts`

```typescript
export function productionMetricsTools(server: Server) {
  server.setRequestHandler(
    {
      method: 'tools/call',
      params: {
        name: 'record_production_metric',
        arguments: z.object({
          workflow_id: z.string(),
          metric_type: z.string(),
          metric_value: z.number(),
          context: z.object({
            phase_number: z.number().optional(),
            book_number: z.number().optional(),
            chapter_number: z.number().optional(),
            metadata: z.record(z.any()).optional(),
          }).optional(),
        }),
      },
    },
    async (request) => {
      const { workflow_id, metric_type, metric_value, context } = request.params.arguments;

      // Insert metric
      const result = await db.query(
        `INSERT INTO production_metrics
         (workflow_id, metric_type, metric_value, phase_number, book_number, chapter_number, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, recorded_at`,
        [
          workflow_id,
          metric_type,
          metric_value,
          context?.phase_number || null,
          context?.book_number || null,
          context?.chapter_number || null,
          JSON.stringify(context?.metadata || {}),
        ]
      );

      const metric = result.rows[0];

      // Update daily stats if applicable
      if (['words_written', 'chapters_completed', 'scenes_written'].includes(metric_type)) {
        await updateDailyStats(workflow_id, metric_type, metric_value);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              metric_id: metric.id,
              recorded_at: metric.recorded_at,
            }),
          },
        ],
      };
    }
  );

  // Additional metrics tools...
}

async function updateDailyStats(
  workflowId: string,
  metricType: string,
  value: number
) {
  const today = new Date().toISOString().split('T')[0];

  const column = {
    words_written: 'words_written',
    chapters_completed: 'chapters_completed',
    scenes_written: 'scenes_written',
  }[metricType];

  await db.query(
    `INSERT INTO daily_writing_stats (workflow_id, stat_date, ${column})
     VALUES ($1, $2, $3)
     ON CONFLICT (workflow_id, stat_date)
     DO UPDATE SET ${column} = daily_writing_stats.${column} + $3`,
    [workflowId, today, value]
  );
}
```

---

## MCP Resources

**File:** `src/resources/index.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export function registerWorkflowResources(server: Server) {
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'workflow://{workflow_id}/state',
          name: 'Workflow State',
          description: 'Current state of a workflow',
          mimeType: 'application/json',
        },
        {
          uri: 'workflow://{workflow_id}/metrics/summary',
          name: 'Metrics Summary',
          description: 'Aggregated metrics for a workflow',
          mimeType: 'application/json',
        },
        // Additional resources...
      ],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    if (uri.startsWith('workflow://') && uri.includes('/state')) {
      const workflowId = extractWorkflowId(uri);
      const state = await getWorkflowState(workflowId);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(state, null, 2),
          },
        ],
      };
    }

    // Handle other resource URIs...
  });
}
```

---

## Docker Configuration

**File:** `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3012

CMD ["node", "dist/index.js"]
```

**File:** `docker-compose.yml` (in MCP-Writing-Servers root)

```yaml
version: '3.8'

services:
  workflow-manager:
    build: ./workflow-manager
    container_name: workflow-manager
    ports:
      - "3012:3012"
    environment:
      - DATABASE_URL=postgresql://fictionlab:password@postgres:5432/fictionlab
      - NODE_ENV=production
    depends_on:
      - postgres
    restart: unless-stopped
```

---

## Testing

### Unit Tests

**File:** `tests/unit/workflow-lifecycle.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createWorkflow, getWorkflowState } from '../../src/tools/workflow-lifecycle';

describe('Workflow Lifecycle', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('should create a new workflow', async () => {
    const result = await createWorkflow({
      series_id: 'series-123',
      user_id: 'user-456',
      concept: 'Test concept',
    });

    expect(result.workflow_id).toBeDefined();
    expect(result.current_phase).toBe(-1);
    expect(result.phase_status).toBe('in_progress');
  });

  it('should retrieve workflow state', async () => {
    const created = await createWorkflow({...});
    const state = await getWorkflowState({ workflow_id: created.workflow_id });

    expect(state.workflow_id).toBe(created.workflow_id);
    expect(state.phase_name).toBe('Not Started');
  });
});
```

---

## Deployment

### Installation

```bash
cd MCP-Writing-Servers/workflow-manager
npm install
npm run build
```

### Run Database Migrations

```bash
npm run migrate
```

### Start Server

```bash
npm start
```

### Docker Deployment

```bash
docker-compose up -d workflow-manager
```

---

## Related Documents

- [Workflow Manager Overview](../BQ-Studio/WORKFLOW_MANAGER_OVERVIEW.md) - System overview
- [BQ-Studio Integration](../BQ-Studio/WORKFLOW_MANAGER_BQ_STUDIO.md) - Claude Code integration
- [FictionLab Dashboard](./WORKFLOW_MANAGER_ELECTRON_APP.md) - Dashboard UI

---

**Next Steps:**
1. Implement database migrations
2. Implement MCP tools
3. Write unit and integration tests
4. Deploy to staging environment
5. Integration testing with clients
