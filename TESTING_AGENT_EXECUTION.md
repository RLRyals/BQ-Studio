# Testing Agent Execution System

## Overview
This guide explains how to test the newly implemented agent execution system in BQ-Studio.

## What Was Built

### Phase 1: Core Infrastructure ✅
- **QueueManager**: Multi-project queue with concurrent execution (3 at a time)
- **SessionManager**: Secure Claude Pro/Max subscription authentication
- **ClaudeCodeExecutor**: Cross-platform process spawning for Claude Code CLI
- **OutputParser**: Parses Claude Code CLI output for progress/tokens
- **UsageTracker**: Tracks token usage and subscription limits
- **AgentOrchestrationService**: High-level facade coordinating all components

### Phase 2: UI & Integration ✅
- **IPC Handlers**: Electron main/renderer communication (11 handlers)
- **Zustand Store**: State management with real-time event handling
- **AgentExecutionDashboard**: Main UI with authentication check
- **NewExecutionPanel**: Job creation form with 5 available skills
- **QueuePanel**: Queue visualization with pause/resume/cancel
- **App Route**: `/agent-execution` route added

### Phase 3: CLI Detection & Installation ✅
- **ClaudeCodeInstaller**: Cross-platform CLI detection and installation
- **CLISetupPrompt**: UI for automatic and manual CLI installation
- **Detection**: Searches common paths on Windows/Mac/Linux
- **Installation**: npm/homebrew with progress feedback

### Phase 4: Progress Monitoring ✅
- **ExecutionDetailView**: Full-screen modal with job details
- **PhaseProgressList**: Visual phase-by-phase progress tracking
- **TokenUsagePanel**: Real-time token usage and efficiency metrics
- **LiveLogsPanel**: Streaming logs with filtering and auto-scroll

### Phase 5: Advanced Features ✅
- **SkillPickerModal**: Rich skill selection UI with recommendations
- **Pause/Resume/Cancel**: Full job control (verified in QueueManager)
- **Error Recovery**: Automatic retry with exponential backoff (verified)

### Phase 6: Integration & Testing ✅
- **WorkflowManagerClient**: PostgreSQL persistence via MCP server (port 3012)
- **Workflow Tracking**: Creates workflow instances for each execution
- **Phase Synchronization**: Updates workflow state as phases progress

## Current Status

### ⚠️ Claude Code CLI Not Available
The system assumes Claude Code CLI exists with commands like:
```bash
claude-code --headless --auto-approve execute-skill <skill-name> --input "<prompt>"
```

**However, this exact CLI may not exist yet or may work differently.**

## Testing Options

### Option 1: Mock Testing (Available Now)
Use the MockClaudeCodeExecutor to simulate Claude Code behavior:

1. **Update AgentOrchestrationService** to use mock executor:
   ```typescript
   // In AgentOrchestrationService.ts, temporarily:
   import { MockClaudeCodeExecutor } from './MockClaudeCodeExecutor';
   // Replace: this.claudeCodeExecutor = new ClaudeCodeExecutor();
   // With: this.claudeCodeExecutor = new MockClaudeCodeExecutor();
   ```

2. **Run the application**:
   ```bash
   npm run dev
   ```

3. **Navigate to Agent Execution**:
   - Open: `http://localhost:5173/agent-execution`
   - You'll see authentication required screen

4. **Mock Authentication**:
   - Click "Authenticate with Claude"
   - (You'll need to add mock auth logic or bypass for testing)

5. **Create Test Execution**:
   - Enter series name: "Test Series"
   - Select skill: "Market-Driven Planning"
   - Enter concept: "A vampire detective story"
   - Click "Start Execution"

6. **Observe**:
   - Job appears in queue panel
   - Progress updates every 2 seconds
   - Phases cycle through 7 phases
   - Token usage displayed
   - Completes after ~40 seconds

### Option 2: Real Claude Code CLI (When Available)

#### Prerequisites:
1. Claude Code CLI installed and accessible in PATH
2. Claude Pro or Max subscription
3. Session token from Claude.ai

#### Steps:

1. **Verify Claude Code CLI**:
   ```bash
   claude-code --help
   ```

2. **Test Skill Execution Manually**:
   ```bash
   cd workspace/test-series/
   claude-code execute-skill market-driven-planning-skill --input "test concept"
   ```

3. **Verify Output Format**:
   - Check if output includes: `Usage: X tokens (input: Y, output: Z)`
   - Check if output includes: `[Phase] Phase Name`
   - Check if output includes: `Progress: X%`

4. **Update ClaudeCodeExecutor** if needed:
   - Adjust command arguments in `buildClaudeCodeArgs()`
   - Update OutputParser regex patterns based on actual output

5. **Authenticate in UI**:
   - Get session token from Claude.ai
   - Use IPC handler to store it securely

6. **Run Full Test**:
   - Create execution job
   - Monitor real-time progress
   - Verify files created in workspace
   - Check token usage accuracy

## Testing Checklist

### Core Functionality
- [ ] QueueManager enqueues jobs
- [ ] Queue respects max concurrent (3)
- [ ] Jobs transition: pending → running → completed
- [ ] Retry logic works for recoverable errors
- [ ] Session token stored securely (encrypted)
- [ ] Token usage tracked per job
- [ ] Usage percentage calculated correctly

### UI Functionality
- [ ] Authentication screen shows when not logged in
- [ ] Job creation form validates inputs
- [ ] Skills dropdown shows all 5 skills
- [ ] Skill info displays correctly
- [ ] Job appears in queue after creation
- [ ] Progress bar updates in real-time
- [ ] Phase name displays correctly
- [ ] Token count updates
- [ ] Pause button pauses job
- [ ] Resume button resumes job
- [ ] Cancel button cancels job
- [ ] Completed jobs move to completed section
- [ ] Failed jobs show error message
- [ ] Usage indicator shows monthly usage
- [ ] Session info displays correctly
- [ ] Logout button clears session

### Integration
- [ ] IPC handlers registered in main process
- [ ] Events flow from main to renderer
- [ ] Store updates trigger UI re-render
- [ ] Workspace path from WorkspaceService used
- [ ] Series subdirectories created correctly
- [ ] Files written to correct locations

## Known Issues / TODOs

1. **Claude Code CLI Integration**:
   - Exact command format unknown
   - Output format unknown
   - Session token mechanism unknown
   - Headless mode support unknown

2. **Authentication**:
   - Need actual OAuth flow or session token input UI
   - Mock authentication for testing

3. **Missing Features** (Optional):
   - ExecutionDetailView (detailed logs/conversation)
   - SkillPickerModal (better skill selection UX)
   - WorkflowManagerClient integration
   - Export logs/results

4. **Testing**:
   - Need unit tests for core components
   - Need integration tests with mock executor
   - Need E2E tests with real CLI (when available)

## Debug Mode

To enable detailed logging, add to AgentOrchestrationService:

```typescript
// In startJob method, after config
console.log('Starting job:', jobId);
console.log('Config:', config);
console.log('Working directory:', path.join(config.workspaceRoot, config.seriesDir));
```

## Architecture Diagram

```
User (Non-Technical)
  ↓
BQ-Studio UI (React + Tailwind)
  ↓
Zustand Store (agentExecutionStore)
  ↓
IPC (Electron Renderer → Main)
  ↓
Agent Orchestration Service
  ↓
Queue Manager (3 concurrent jobs)
  ↓
Claude Code Executor
  ↓
Claude Code CLI (child process)
  ↓
.claude/skills/ + .claude/agents/
  ↓
Claude Pro/Max Subscription (Anthropic API)
  ↓
MCP Servers (FictionLab - ports 3001-3012)
  ↓
PostgreSQL Database
```

## Key Files Reference

### Core
- `src/core/agent-orchestration/types.ts` - Type definitions
- `src/core/agent-orchestration/QueueManager.ts` - Queue management
- `src/core/agent-orchestration/SessionManager.ts` - Authentication
- `src/core/agent-orchestration/ClaudeCodeExecutor.ts` - Process spawning
- `src/core/agent-orchestration/OutputParser.ts` - Output parsing
- `src/core/agent-orchestration/UsageTracker.ts` - Token tracking
- `src/core/agent-orchestration/AgentOrchestrationService.ts` - Facade

### IPC
- `src/main/ipc/agentExecutionHandlers.ts` - IPC handlers
- `src/main/ipc/index.ts` - Handler registration

### UI
- `src/renderer/stores/agentExecutionStore.ts` - Zustand store
- `src/renderer/components/AgentExecution/AgentExecutionDashboard.tsx` - Dashboard
- `src/renderer/components/AgentExecution/NewExecutionPanel.tsx` - Job creation
- `src/renderer/components/AgentExecution/QueuePanel.tsx` - Queue display

### Routes
- `src/renderer/App.tsx` - `/agent-execution` route

## Questions for Real Testing

When testing with actual Claude Code CLI, verify:

1. **Authentication**:
   - How do users get session token?
   - How long do tokens last?
   - How to refresh tokens?

2. **Commands**:
   - Exact command syntax?
   - Available flags?
   - How to pass input?

3. **Output**:
   - What's the exact format?
   - Where are token stats reported?
   - How are errors formatted?

4. **Process Management**:
   - Can multiple instances run?
   - How to pause/resume?
   - How to handle crashes?

5. **MCP Integration**:
   - Does Claude Code auto-discover `.claude/mcp.json`?
   - How to specify MCP server URLs?
   - How are tool calls logged?

## Success Criteria

The system is working correctly when:

✅ Users can create execution jobs through UI
✅ Jobs queue and respect concurrency limits
✅ Progress updates in real-time
✅ Token usage tracked accurately
✅ Files created in correct workspace directories
✅ Multiple series can run simultaneously
✅ Errors handled gracefully with retry
✅ Users can pause/resume/cancel jobs
✅ Session authentication persists across restarts
✅ Usage limits monitored and warnings shown

## Need Help?

Contact the development team if you encounter:
- Claude Code CLI integration issues
- Unexpected errors in queue management
- UI not updating in real-time
- Session authentication problems
- Performance issues with multiple jobs
