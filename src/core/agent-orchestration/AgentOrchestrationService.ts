/**
 * Agent Orchestration Service
 * High-level service that coordinates all agent execution components
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { QueueManager } from './QueueManager';
import { SessionManager } from './SessionManager';
import { ClaudeCodeExecutor } from './ClaudeCodeExecutor';
import { OutputParser } from './OutputParser';
import { UsageTracker } from './UsageTracker';
import { WorkflowManagerClient } from '../../services/WorkflowManagerClient';
import {
  ExecutionJob,
  ExecutionQueue,
  ClaudeCodeExecutionConfig,
  ClaudeCodeExecutionResult,
  AgentExecutionEvent,
  TokenUsageReport,
} from './types';

export class AgentOrchestrationService extends EventEmitter {
  private queueManager: QueueManager;
  private sessionManager: SessionManager;
  private claudeCodeExecutor: ClaudeCodeExecutor;
  private outputParser: OutputParser;
  private usageTracker: UsageTracker;
  private workflowClient: WorkflowManagerClient;
  private workspaceRoot: string;
  private workflowIdMap: Map<string, number>; // jobId -> workflowId

  constructor(workspaceRoot: string, maxConcurrent?: number) {
    super();
    this.workspaceRoot = workspaceRoot;
    this.queueManager = new QueueManager({ maxConcurrent });
    this.sessionManager = new SessionManager();
    this.claudeCodeExecutor = new ClaudeCodeExecutor();
    this.outputParser = new OutputParser();
    this.usageTracker = new UsageTracker();
    this.workflowClient = new WorkflowManagerClient();
    this.workflowIdMap = new Map();
  }

  /**
   * Create and enqueue a new execution job
   */
  async createJob(
    seriesId: number,
    seriesName: string,
    skillName: string,
    userPrompt: string
  ): Promise<string> {
    // Validate session
    if (!this.sessionManager.isAuthenticated()) {
      throw new Error('User not authenticated. Please login with Claude Pro/Max account.');
    }

    // Create job
    const job: ExecutionJob = {
      id: randomUUID(),
      seriesId,
      seriesName,
      workspaceDir: `series-${seriesId}`,
      skillName,
      userPrompt,
      status: 'pending',
      currentPhase: null,
      progress: 0,
      createdAt: new Date(),
      tokensUsed: {
        input: 0,
        output: 0,
        total: 0,
      },
      logs: [],
      retryCount: 0,
      maxRetries: 3,
    };

    // Create workflow in WorkflowManager (for persistence)
    try {
      const session = this.sessionManager.getSession();
      const workflow = await this.workflowClient.createWorkflow({
        series_id: seriesId,
        user_id: session?.userId ? parseInt(session.userId) : 1,
        concept: userPrompt,
      });

      // Store workflow ID mapping
      this.workflowIdMap.set(job.id, workflow.workflow_id);

      this.queueManager.addLog(
        job.id,
        'info',
        `Created workflow ${workflow.workflow_id} in WorkflowManager`
      );
    } catch (error) {
      // Log error but don't fail job creation
      console.warn('Failed to create workflow in WorkflowManager:', error);
      this.queueManager.addLog(
        job.id,
        'warn',
        'Failed to create workflow in WorkflowManager - execution will proceed without persistence'
      );
    }

    // Enqueue job
    await this.queueManager.enqueue(job);

    // Emit event
    this.emitEvent({
      type: 'job-queued',
      jobId: job.id,
      job,
    });

    // Process queue
    await this.processQueue();

    return job.id;
  }

  /**
   * Process queue and start pending jobs
   */
  private async processQueue(): Promise<void> {
    const queueStatus = this.queueManager.getQueueStatus();

    // Start pending jobs if capacity available
    while (
      queueStatus.currentRunning < queueStatus.maxConcurrent &&
      queueStatus.pending.length > 0
    ) {
      const job = queueStatus.pending[0];
      await this.startJob(job.id);
    }
  }

  /**
   * Start executing a job
   */
  private async startJob(jobId: string): Promise<void> {
    const job = this.queueManager.getJob(jobId);
    if (!job) {
      console.error(`Job ${jobId} not found`);
      return;
    }

    try {
      // Log start
      this.queueManager.addLog(jobId, 'info', `Starting execution of skill: ${job.skillName}`);

      // Process queue first (updates status to running)
      await this.queueManager.processQueue();

      // Emit job started event
      this.emitEvent({
        type: 'job-started',
        jobId,
        job,
      });

      // Get session token
      const sessionToken = this.sessionManager.getSessionToken();
      if (!sessionToken) {
        throw new Error('Session token not found');
      }

      // Build execution config
      const config: ClaudeCodeExecutionConfig = {
        workspaceRoot: this.workspaceRoot,
        seriesDir: job.workspaceDir,
        skillName: job.skillName,
        input: job.userPrompt,
        sessionToken,
        autoApprove: true,
      };

      // Execute Claude Code
      const result = await this.claudeCodeExecutor.execute(
        jobId,
        config,
        (output, isError) => this.handleOutput(jobId, output, isError),
        (progress, phase) => this.handleProgress(jobId, progress, phase)
      );

      // Handle result
      if (result.success) {
        await this.completeJob(jobId, result);
      } else {
        await this.failJob(jobId, result);
      }
    } catch (error) {
      const err = error as Error;
      this.queueManager.addLog(jobId, 'error', `Execution failed: ${err.message}`);

      await this.queueManager.failJob(jobId, {
        code: 'EXECUTION_ERROR',
        message: err.message,
        stack: err.stack,
        recoverable: false,
      });

      this.emitEvent({
        type: 'job-failed',
        jobId,
        job: this.queueManager.getJob(jobId)!,
        error: {
          code: 'EXECUTION_ERROR',
          message: err.message,
          recoverable: false,
        },
      });
    }
  }

  /**
   * Handle output from Claude Code
   */
  private handleOutput(jobId: string, output: string, isError: boolean): void {
    const level = isError ? 'error' : 'info';

    // Add to job logs
    this.queueManager.addLog(jobId, level, output, 'claude-code');

    // Parse output
    const parsed = this.outputParser.parseLine(output);

    if (parsed) {
      // Emit log event
      this.emitEvent({
        type: 'log',
        jobId,
        log: {
          timestamp: parsed.timestamp,
          level,
          source: 'claude-code',
          message: output,
        },
      });

      // Handle specific output types
      if (parsed.type === 'token-usage') {
        const usage: TokenUsageReport = {
          jobId,
          inputTokens: parsed.data.inputTokens,
          outputTokens: parsed.data.outputTokens,
          totalTokens: parsed.data.totalTokens,
          timestamp: parsed.timestamp,
        };

        this.queueManager.updateTokenUsage(
          jobId,
          parsed.data.inputTokens,
          parsed.data.outputTokens
        );

        const job = this.queueManager.getJob(jobId);
        if (job) {
          this.usageTracker.record(
            jobId,
            parsed.data.inputTokens,
            parsed.data.outputTokens,
            job.seriesId
          );
        }

        this.emitEvent({
          type: 'tokens-used',
          jobId,
          usage,
        });
      }
    }
  }

  /**
   * Handle progress updates
   */
  private async handleProgress(jobId: string, progress: number, phase: string): Promise<void> {
    this.queueManager.updateJobProgress(jobId, progress, phase);

    // Update workflow phase in WorkflowManager
    const workflowId = this.workflowIdMap.get(jobId);
    if (workflowId) {
      try {
        // Determine phase number from phase name (simplified)
        const phaseNumber = this.getPhaseNumberFromName(phase);
        if (phaseNumber > 0) {
          await this.workflowClient.advanceToPhase(workflowId, phaseNumber);
        }
      } catch (error) {
        console.warn('Failed to update workflow phase:', error);
      }
    }

    this.emitEvent({
      type: 'phase-progress',
      jobId,
      phase,
      progress,
      message: `Phase: ${phase} - ${progress}%`,
    });
  }

  /**
   * Get phase number from phase name (simplified mapping)
   */
  private getPhaseNumberFromName(phaseName: string): number {
    const phaseMap: Record<string, number> = {
      'Genre Identification': 1,
      'Market Research': 2,
      'Genre Pack Selection': 3,
      'Series Architecture': 4,
      'Book Planning': 5,
      'Commercial Validation': 6,
      'Handoff Documentation': 7,
      'Series Concept Analysis': 1,
      'Character Arc Planning': 2,
      'World Building': 3,
      'Plot Structure': 4,
      'Documentation': 5,
      'Story Structure': 1,
      'Chapter Breakdown': 2,
      'Scene Planning': 3,
      'Scene List': 1,
      'Beat Planning': 2,
      'Scene Draft': 1,
      'Review': 2,
    };
    return phaseMap[phaseName] || 0;
  }

  /**
   * Complete a job
   */
  private async completeJob(jobId: string, result: ClaudeCodeExecutionResult): Promise<void> {
    this.queueManager.addLog(jobId, 'info', 'Execution completed successfully');

    // Mark workflow as completed in WorkflowManager
    const workflowId = this.workflowIdMap.get(jobId);
    if (workflowId) {
      try {
        await this.workflowClient.completeCurrentPhase(workflowId, result.output);
        this.queueManager.addLog(
          jobId,
          'info',
          `Marked workflow ${workflowId} as completed in WorkflowManager`
        );
      } catch (error) {
        console.warn('Failed to mark workflow as completed:', error);
      }
    }

    await this.queueManager.completeJob(jobId, result);

    const job = this.queueManager.getJob(jobId);
    if (job) {
      this.emitEvent({
        type: 'job-completed',
        jobId,
        job,
        result,
      });
    }
  }

  /**
   * Fail a job
   */
  private async failJob(jobId: string, result: ClaudeCodeExecutionResult): Promise<void> {
    if (result.error) {
      this.queueManager.addLog(jobId, 'error', result.error.message);

      await this.queueManager.failJob(jobId, result.error);

      const job = this.queueManager.getJob(jobId);
      if (job) {
        this.emitEvent({
          type: 'job-failed',
          jobId,
          job,
          error: result.error,
        });
      }
    }
  }

  /**
   * Pause a job
   */
  async pauseJob(jobId: string): Promise<void> {
    await this.queueManager.pauseJob(jobId);
    this.claudeCodeExecutor.pause(jobId);

    const job = this.queueManager.getJob(jobId);
    if (job) {
      this.emitEvent({
        type: 'job-paused',
        jobId,
        job,
      });
    }
  }

  /**
   * Resume a job
   */
  async resumeJob(jobId: string): Promise<void> {
    await this.queueManager.resumeJob(jobId);
    this.claudeCodeExecutor.resume(jobId);

    const job = this.queueManager.getJob(jobId);
    if (job) {
      this.emitEvent({
        type: 'job-resumed',
        jobId,
        job,
      });
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    this.claudeCodeExecutor.cancel(jobId);
    await this.queueManager.cancelJob(jobId);

    const job = this.queueManager.getJob(jobId);
    if (job) {
      this.emitEvent({
        type: 'job-cancelled',
        jobId,
        job,
      });
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): ExecutionQueue {
    return this.queueManager.getQueueStatus();
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): ExecutionJob | undefined {
    return this.queueManager.getJob(jobId);
  }

  /**
   * Get jobs for a series
   */
  getJobsForSeries(seriesId: number): ExecutionJob[] {
    return this.queueManager.getJobsForSeries(seriesId);
  }

  /**
   * Authenticate with Claude subscription
   */
  async authenticate(
    sessionToken: string,
    userId: string,
    subscriptionTier: 'pro' | 'max',
    expiresAt?: Date
  ): Promise<void> {
    await this.sessionManager.saveSession(sessionToken, userId, subscriptionTier, expiresAt);
  }

  /**
   * Logout (clear session)
   */
  logout(): void {
    this.sessionManager.clearSession();
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.sessionManager.isAuthenticated();
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    return this.sessionManager.getSession();
  }

  /**
   * Get usage tracker
   */
  getUsageTracker(): UsageTracker {
    return this.usageTracker;
  }

  /**
   * Emit event
   */
  private emitEvent(event: AgentExecutionEvent): void {
    this.emit('agent-execution', event);
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.claudeCodeExecutor.cleanup();
    this.queueManager.cleanup();
    this.usageTracker.cleanup();
  }
}
