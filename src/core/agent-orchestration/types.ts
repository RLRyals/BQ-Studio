/**
 * Agent Orchestration Types
 * Types for managing headless Claude Code execution with multi-project queue support
 */

export type ExecutionStatus =
  | 'pending'
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ExecutionJob {
  id: string; // unique job ID
  seriesId: number; // from FictionLab database
  seriesName: string;
  workspaceDir: string; // relative path within user's workspace (e.g., "series-1")

  // Skill configuration
  skillName: string; // e.g., "market-driven-planning-skill"
  userPrompt: string; // initial concept/instructions from user

  // Execution state
  status: ExecutionStatus;
  currentPhase: string | null;
  progress: number; // 0-100

  // Timestamps
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  lastActivityAt?: Date;

  // Token tracking
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };

  // Progress tracking
  logs: ExecutionLog[];

  // Workflow integration
  workflowId?: number; // from WorkflowManagerClient

  // Error handling
  error?: ExecutionError;
  retryCount: number;
  maxRetries: number;

  // Process management
  processId?: number; // PID of Claude Code CLI process
}

export interface ExecutionQueue {
  pending: ExecutionJob[];
  running: ExecutionJob[];
  completed: ExecutionJob[];
  failed: ExecutionJob[];

  maxConcurrent: number; // how many can run simultaneously
  currentRunning: number;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: 'system' | 'claude-code' | 'agent'; // where the log came from
  message: string;
  metadata?: Record<string, any>;
}

export interface ExecutionError {
  code: string;
  message: string;
  phase?: string;
  stack?: string;
  recoverable: boolean;
}

export interface ClaudeCodeOutput {
  type: 'log' | 'phase-update' | 'token-usage' | 'error' | 'completion';
  timestamp: Date;
  data: any;
}

export interface TokenUsageReport {
  jobId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  timestamp: Date;
}

export interface ClaudeSession {
  sessionToken: string;
  userId: string;
  subscriptionTier: 'pro' | 'max';
  expiresAt?: Date;
  isValid: boolean;
}

/**
 * Configuration for Claude Code execution
 */
export interface ClaudeCodeExecutionConfig {
  workspaceRoot: string; // user's workspace root path
  seriesDir: string; // relative path for this series
  skillName: string;
  input: string;
  sessionToken: string;
  autoApprove: boolean;
  timeout?: number; // in milliseconds
}

/**
 * Result from Claude Code execution
 */
export interface ClaudeCodeExecutionResult {
  success: boolean;
  output: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  duration: number; // milliseconds
  filesCreated: string[];
  error?: ExecutionError;
}

/**
 * Events emitted during execution
 */
export type AgentExecutionEvent =
  | { type: 'job-queued'; jobId: string; job: ExecutionJob }
  | { type: 'job-started'; jobId: string; job: ExecutionJob }
  | { type: 'job-paused'; jobId: string; job: ExecutionJob }
  | { type: 'job-resumed'; jobId: string; job: ExecutionJob }
  | { type: 'job-cancelled'; jobId: string; job: ExecutionJob }
  | { type: 'job-completed'; jobId: string; job: ExecutionJob; result: ClaudeCodeExecutionResult }
  | { type: 'job-failed'; jobId: string; job: ExecutionJob; error: ExecutionError }
  | { type: 'job-retrying'; jobId: string; job: ExecutionJob; retryCount: number }
  | { type: 'phase-started'; jobId: string; phase: string }
  | { type: 'phase-progress'; jobId: string; phase: string; progress: number; message: string }
  | { type: 'phase-completed'; jobId: string; phase: string }
  | { type: 'tokens-used'; jobId: string; usage: TokenUsageReport }
  | { type: 'log'; jobId: string; log: ExecutionLog };

/**
 * Queue configuration
 */
export interface QueueConfig {
  maxConcurrent: number;
  retryAttempts: number;
  retryDelay: number; // milliseconds
  maxRetryDelay: number; // milliseconds
  backoffMultiplier: number;
}
