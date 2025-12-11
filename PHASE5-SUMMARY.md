# Phase 5: Cleanup & MCP Integration

**Status**: ✅ Complete
**Date**: 2025-12-11

## Overview

Phase 5 cleaned up legacy files, created the MCP client for workflow management, updated dependencies, and successfully built the plugin. The plugin is now ready for deployment to FictionLab.

## Changes Made

### 1. Removed Legacy Files

Deleted old in-memory versions that have been replaced by PostgreSQL implementations:

**Removed:**
- `src/core/agent-orchestration/AgentOrchestrationService.ts` (old version)
- `src/core/agent-orchestration/SessionManager.ts` (old in-memory version)
- `src/core/agent-orchestration/UsageTracker.ts` (old in-memory version)

**Updated:**
- [src/core/agent-orchestration/index.ts](src/core/agent-orchestration/index.ts) - Now exports PostgreSQL versions:
  ```typescript
  export { SessionManager } from './SessionManager.postgres';
  export { UsageTracker } from './UsageTracker.postgres';
  export { AgentOrchestrationService } from './AgentOrchestrationService.plugin';
  ```

### 2. Created WorkflowManagerClient

**Location**: [src/core/mcp/WorkflowManagerClient.ts](src/core/mcp/WorkflowManagerClient.ts)

Type-safe wrapper around FictionLab's MCP service for communicating with the workflow-manager MCP server (port 3012).

**Key Features:**

#### Series Management
```typescript
// Get series by ID
async getSeries(seriesId: number): Promise<WorkflowSeries | null>

// List all series with optional filters
async listSeries(filter?: {
  status?: 'planning' | 'active' | 'paused' | 'completed';
  genre?: string;
}): Promise<WorkflowSeries[]>

// Create new series
async createSeries(series: {
  name: string;
  genre: string;
  bookCount: number;
  metadata?: Record<string, any>;
}): Promise<WorkflowSeries | null>

// Update series
async updateSeries(seriesId: number, updates: Partial<WorkflowSeries>): Promise<boolean>
```

#### Chapter Management
```typescript
// Get chapter by ID
async getChapter(chapterId: number): Promise<WorkflowChapter | null>

// List chapters for a series
async listChapters(
  seriesId: number,
  filter?: {
    bookNumber?: number;
    status?: 'pending' | 'in-progress' | 'completed' | 'failed';
  }
): Promise<WorkflowChapter[]>

// Create new chapter
async createChapter(chapter: {
  seriesId: number;
  bookNumber: number;
  chapterNumber: number;
  title: string;
  metadata?: Record<string, any>;
}): Promise<WorkflowChapter | null>

// Update chapter
async updateChapter(chapterId: number, updates: Partial<WorkflowChapter>): Promise<boolean>
```

#### Prompt Management
```typescript
// Get prompt for a specific workflow phase
async getPrompt(params: {
  type: 'series-planning' | 'chapter-drafting' | 'revision' | 'validation';
  seriesId: number;
  chapterId?: number;
  context?: Record<string, any>;
}): Promise<WorkflowPrompt | null>

// Convenience methods
async getSeriesPlanningPrompt(seriesId: number): Promise<string | null>
async getChapterDraftingPrompt(seriesId: number, chapterId: number): Promise<string | null>
async getRevisionPrompt(seriesId: number, chapterId: number, revisionType: string): Promise<string | null>
```

#### Workflow State Management
```typescript
// Update workflow state
async updateWorkflowState(update: WorkflowUpdate): Promise<boolean>

// Convenience methods
async startChapter(chapterId: number): Promise<boolean>
async completeChapter(chapterId: number, wordCount?: number): Promise<boolean>
async failChapter(chapterId: number, errorMessage: string): Promise<boolean>
async updateChapterProgress(chapterId: number, progress: number): Promise<boolean>
```

#### Advanced Operations
```typescript
// Get next pending chapter for a series
async getNextPendingChapter(seriesId: number): Promise<WorkflowChapter | null>

// Get series statistics
async getSeriesStats(seriesId: number): Promise<{
  totalChapters: number;
  completedChapters: number;
  totalWords: number;
  progress: number;
} | null>

// Validate workflow state
async validateWorkflow(seriesId: number): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}>
```

**Usage Example:**
```typescript
// In plugin-entry.ts or AgentOrchestrationService
import { WorkflowManagerClient } from './core/mcp/WorkflowManagerClient';

// Initialize with FictionLab's MCP manager
const workflowClient = new WorkflowManagerClient(context.services.mcp);

// Check if workflow-manager is available
if (await workflowClient.isAvailable()) {
  // Get series and chapters
  const series = await workflowClient.getSeries(seriesId);
  const chapters = await workflowClient.listChapters(seriesId);

  // Get prompt for chapter drafting
  const prompt = await workflowClient.getChapterDraftingPrompt(seriesId, chapterId);

  // Update chapter status
  await workflowClient.startChapter(chapterId);
  await workflowClient.updateChapterProgress(chapterId, 50);
  await workflowClient.completeChapter(chapterId, 3500);
}
```

### 3. Updated Dependencies

**Location**: [package.json](package.json)

**Removed:**
- `electron-store` - No longer needed (using PostgreSQL)

**Moved to Optional:**
- `electron-squirrel-startup` - Only for standalone Electron mode
- `pg` - PostgreSQL client (provided by FictionLab)

**Before:**
```json
"dependencies": {
  "electron-store": "^8.1.0",
  "pg": "^8.16.3",
  // ...
}
```

**After:**
```json
"dependencies": {
  // electron-store removed
  // ...
},
"optionalDependencies": {
  "electron-squirrel-startup": "^1.0.1",
  "pg": "^8.16.3"
}
```

### 4. Fixed Build Errors

Fixed several TypeScript compilation errors:

#### Error: Missing properties in AgentExecutionEvent
```typescript
// Before
this.emitEvent({
  type: 'phase-progress',
  jobId,
  progress,
  phase,
});

// After
this.emitEvent({
  type: 'phase-progress',
  jobId,
  progress,
  phase,
  message: `Phase ${phase} at ${progress}%`, // Added required property
});
```

#### Error: Missing result in job-completed event
```typescript
// Before
this.emitEvent({
  type: 'job-completed',
  jobId,
  job,
});

// After
this.emitEvent({
  type: 'job-completed',
  jobId,
  job,
  result, // Added required property
});
```

#### Error: Wrong event type name
```typescript
// Before
this.emitEvent({
  type: 'job-retry', // Wrong name
  // ...
});

// After
this.emitEvent({
  type: 'job-retrying', // Correct name
  // ...
});
```

#### Error: QueueManager doesn't have requeueJob method
```typescript
// Before
await this.queueManager.retryJob(jobId); // Method doesn't exist

// After
await this.queueManager.enqueue(job); // Re-enqueue the job
```

#### Error: Return type mismatch (undefined vs null)
```typescript
// Before
getJob(jobId: string): ExecutionJob | null {
  return this.queueManager.getJob(jobId); // Returns undefined
}

// After
getJob(jobId: string): ExecutionJob | null {
  return this.queueManager.getJob(jobId) || null; // Convert undefined to null
}
```

#### Error: UsageTracker return type mismatch
```typescript
// Before
async getMonthlyUsageSummary(): Promise<{ totalTokens, inputTokens, outputTokens }> {
  return await this.database.getMonthlyTokenUsage(); // Returns snake_case
}

// After
async getMonthlyUsageSummary(): Promise<{ totalTokens, inputTokens, outputTokens }> {
  const result = await this.database.getMonthlyTokenUsage();
  return {
    totalTokens: result.total_tokens, // Convert to camelCase
    inputTokens: result.input_tokens,
    outputTokens: result.output_tokens,
  };
}
```

#### Error: Menu separator missing label
```typescript
// Before
{
  id: 'bq-separator',
  type: 'separator',
}

// After
{
  id: 'bq-separator',
  label: '-',
  type: 'separator',
}
```

### 5. Created TypeScript Configuration for Plugin Build

**Location**: [tsconfig.plugin.json](tsconfig.plugin.json)

Separate TypeScript configuration specifically for plugin builds:

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist-plugin",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@fictionlab/plugin-api": ["./src/types/fictionlab-plugin-api.d.ts"]
    }
  },
  "include": [
    "src/plugin-entry.ts",
    "src/core/**/*.ts",
    "src/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "dist-plugin",
    "src/main",
    "src/renderer",
    "src/core/plugin-manager" // Excludes React dependencies
  ]
}
```

**Key Features:**
- Path mapping for `@fictionlab/plugin-api` to local types
- Excludes Electron-specific code (main/renderer)
- Excludes plugin-manager code that has React dependencies
- CommonJS module format for Node.js compatibility

**Updated Build Script:**
```json
// Before
"build:plugin:main": "tsc src/plugin-entry.ts --outDir dist-plugin --module commonjs ..."

// After
"build:plugin:main": "tsc -p tsconfig.plugin.json"
```

## Build Success ✅

The plugin now builds successfully:

```bash
npm run build:plugin:main
# ✅ Compiles without errors
```

## Architecture Overview

```
BQ-Studio Plugin
├── Plugin Entry (plugin-entry.ts)
│   ├── Initializes PluginDatabase
│   ├── Initializes SessionManager (PostgreSQL)
│   ├── Initializes UsageTracker (PostgreSQL)
│   └── Initializes AgentOrchestrationService (with dependency injection)
│
├── Core Services
│   ├── AgentOrchestrationService.plugin.ts
│   │   ├── Uses injected SessionManager
│   │   ├── Uses injected UsageTracker
│   │   ├── Uses injected PluginDatabase
│   │   └── Uses injected PluginLogger
│   │
│   ├── SessionManager.postgres.ts
│   │   └── Manages Claude sessions in PostgreSQL
│   │
│   ├── UsageTracker.postgres.ts
│   │   └── Tracks token usage in PostgreSQL
│   │
│   └── PluginDatabase.ts
│       └── Wraps FictionLabDatabase with type-safe methods
│
├── MCP Integration
│   └── WorkflowManagerClient.ts
│       └── Communicates with workflow-manager MCP server
│
└── Type Definitions
    └── fictionlab-plugin-api.d.ts
        └── TypeScript types for FictionLab plugin API
```

## Database Schema (Reminder)

All tables use `plugin_bq_studio` schema:

### 1. claude_sessions
```sql
CREATE TABLE plugin_bq_studio.claude_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  session_token TEXT NOT NULL,
  subscription_tier VARCHAR(10) CHECK (subscription_tier IN ('pro', 'max')),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. token_usage
```sql
CREATE TABLE plugin_bq_studio.token_usage (
  id SERIAL PRIMARY KEY,
  job_id UUID,
  series_id INTEGER,
  timestamp TIMESTAMP DEFAULT NOW(),
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED
);
```

### 3. execution_jobs
```sql
CREATE TABLE plugin_bq_studio.execution_jobs (
  id UUID PRIMARY KEY,
  workflow_id INTEGER,
  series_id INTEGER,
  series_name VARCHAR(255) NOT NULL,
  workspace_dir VARCHAR(255) NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  user_prompt TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  current_phase VARCHAR(100),
  progress INTEGER DEFAULT 0,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_code VARCHAR(50),
  error_message TEXT,
  error_recoverable BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. job_logs
```sql
CREATE TABLE plugin_bq_studio.job_logs (
  id SERIAL PRIMARY KEY,
  job_id UUID NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  level VARCHAR(10) CHECK (level IN ('info', 'warn', 'error', 'debug')),
  source VARCHAR(50),
  message TEXT NOT NULL
);
CREATE INDEX idx_job_logs_job_id ON plugin_bq_studio.job_logs(job_id);
```

## Testing Checklist

### Build Testing
- [x] Plugin builds successfully: `npm run build:plugin:main`
- [ ] Plugin packages successfully: `npm run build:plugin:package`
- [ ] Plugin installs locally: `npm run install:plugin:local`

### Runtime Testing (After installation in FictionLab)
- [ ] Plugin loads successfully in FictionLab
- [ ] Database schema creates correctly
- [ ] Authentication flow works
- [ ] Job creation and queueing works
- [ ] Token usage tracking works
- [ ] MCP workflow integration works
- [ ] Crash recovery works (stop and restart FictionLab)
- [ ] Job logs persist to database

### MCP Testing
- [ ] WorkflowManagerClient connects to MCP server
- [ ] Can fetch series and chapters
- [ ] Can generate prompts
- [ ] Can update workflow state

## Installation Instructions

### 1. Build the Plugin
```bash
cd c:/github/BQ-Studio
npm run build:plugin
```

This will:
1. Clean the `dist-plugin` directory
2. Compile TypeScript to CommonJS
3. Build renderer (if needed)
4. Package everything into plugin format

### 2. Install to FictionLab (Local Development)
```bash
npm run install:plugin:local
```

This will copy the plugin to:
- **Windows**: `%APPDATA%/FictionLab/plugins/bq-studio`
- **macOS**: `~/Library/Application Support/FictionLab/plugins/bq-studio`
- **Linux**: `~/.config/FictionLab/plugins/bq-studio`

### 3. Restart FictionLab
The plugin will be loaded on next startup.

### 4. Verify Installation
Check FictionLab logs for:
```
[Plugin Manager] Loading plugin: bq-studio
[Plugin Manager] BQ Studio plugin activating...
[Plugin Manager] Database schema initialized successfully
[Plugin Manager] BQ Studio plugin activated successfully
```

## Next Steps (Phase 6+)

### Immediate
1. **Package and Test**: Run full build and install to FictionLab
2. **MCP Integration**: Wire up WorkflowManagerClient in AgentOrchestrationService
3. **Renderer Updates**: Update renderer to use new plugin IPC channels
4. **End-to-End Testing**: Test complete workflow from series creation to chapter drafting

### Future Enhancements
1. **Error Handling**: Add comprehensive error handling and recovery
2. **Performance**: Add database connection pooling and caching
3. **Monitoring**: Add metrics and monitoring dashboard
4. **UI Polish**: Enhance renderer UI with real-time job monitoring
5. **Documentation**: Add user documentation and API reference

## Summary

Phase 5 successfully:

✅ **Removed legacy files** - Deleted old in-memory implementations
✅ **Created MCP client** - Type-safe WorkflowManagerClient for workflow integration
✅ **Updated dependencies** - Removed electron-store, cleaned up package.json
✅ **Fixed build errors** - Resolved all TypeScript compilation errors
✅ **Created plugin config** - Separate tsconfig.plugin.json for plugin builds
✅ **Successful build** - Plugin compiles without errors

The plugin is now **ready for packaging and deployment** to FictionLab!

## Files Changed

### Created
- `src/core/mcp/WorkflowManagerClient.ts` (390 lines)
- `tsconfig.plugin.json` (34 lines)
- `PHASE5-SUMMARY.md` (this file)

### Modified
- `src/core/agent-orchestration/index.ts` - Updated exports to use PostgreSQL versions
- `src/core/agent-orchestration/AgentOrchestrationService.plugin.ts` - Fixed event emissions and retry logic
- `src/core/agent-orchestration/UsageTracker.postgres.ts` - Fixed return type conversion
- `src/plugin-entry.ts` - Fixed menu separator definition
- `package.json` - Removed electron-store, moved pg to optionalDependencies, updated build script

### Deleted
- `src/core/agent-orchestration/AgentOrchestrationService.ts` (old version)
- `src/core/agent-orchestration/SessionManager.ts` (old in-memory version)
- `src/core/agent-orchestration/UsageTracker.ts` (old in-memory version)
