/**
 * Queue Manager
 * Manages execution queue for multiple series running concurrently
 */

import {
  ExecutionJob,
  ExecutionQueue,
  ExecutionStatus,
  QueueConfig,
  ClaudeCodeExecutionResult,
  ExecutionError,
} from './types';

export class QueueManager {
  private queue: ExecutionQueue;
  private config: QueueConfig;
  private executionCallbacks: Map<
    string,
    {
      resolve: (result: ClaudeCodeExecutionResult) => void;
      reject: (error: Error) => void;
    }
  >;

  constructor(config?: Partial<QueueConfig>) {
    this.config = {
      maxConcurrent: config?.maxConcurrent ?? 3,
      retryAttempts: config?.retryAttempts ?? 3,
      retryDelay: config?.retryDelay ?? 5000,
      maxRetryDelay: config?.maxRetryDelay ?? 60000,
      backoffMultiplier: config?.backoffMultiplier ?? 2,
    };

    this.queue = {
      pending: [],
      running: [],
      completed: [],
      failed: [],
      maxConcurrent: this.config.maxConcurrent,
      currentRunning: 0,
    };

    this.executionCallbacks = new Map();
  }

  /**
   * Add job to queue
   */
  async enqueue(job: ExecutionJob): Promise<string> {
    job.status = 'pending';
    job.createdAt = new Date();
    job.retryCount = 0;
    job.maxRetries = this.config.retryAttempts;

    this.queue.pending.push(job);

    return job.id;
  }

  /**
   * Process pending jobs (start if capacity available)
   */
  async processQueue(): Promise<void> {
    while (
      this.queue.currentRunning < this.queue.maxConcurrent &&
      this.queue.pending.length > 0
    ) {
      const job = this.queue.pending.shift()!;
      await this.startJob(job);
    }
  }

  /**
   * Start executing a job
   */
  private async startJob(job: ExecutionJob): Promise<void> {
    job.status = 'running';
    job.startedAt = new Date();
    job.lastActivityAt = new Date();

    this.queue.running.push(job);
    this.queue.currentRunning++;
  }

  /**
   * Mark job as completed
   */
  async completeJob(
    jobId: string,
    result: ClaudeCodeExecutionResult
  ): Promise<void> {
    const job = this.findRunningJob(jobId);
    if (!job) {
      console.warn(`Cannot complete job ${jobId}: not found in running queue`);
      return;
    }

    job.status = 'completed';
    job.completedAt = new Date();
    job.tokensUsed = result.tokensUsed;

    // Move from running to completed
    this.removeFromRunning(jobId);
    this.queue.completed.push(job);
    this.queue.currentRunning--;

    // Resolve callback if exists
    const callbacks = this.executionCallbacks.get(jobId);
    if (callbacks) {
      callbacks.resolve(result);
      this.executionCallbacks.delete(jobId);
    }

    // Process next pending job
    await this.processQueue();
  }

  /**
   * Mark job as failed
   */
  async failJob(jobId: string, error: ExecutionError): Promise<void> {
    const job = this.findRunningJob(jobId);
    if (!job) {
      console.warn(`Cannot fail job ${jobId}: not found in running queue`);
      return;
    }

    job.error = error;

    // Retry logic
    if (job.retryCount < job.maxRetries && error.recoverable) {
      job.retryCount++;
      job.status = 'pending';

      // Remove from running and add back to pending
      this.removeFromRunning(jobId);
      this.queue.pending.push(job);
      this.queue.currentRunning--;

      // Wait before retrying
      const delay = Math.min(
        this.config.retryDelay * Math.pow(this.config.backoffMultiplier, job.retryCount - 1),
        this.config.maxRetryDelay
      );

      setTimeout(() => {
        this.processQueue();
      }, delay);
    } else {
      // Move to failed
      job.status = 'failed';
      this.removeFromRunning(jobId);
      this.queue.failed.push(job);
      this.queue.currentRunning--;

      // Reject callback if exists
      const callbacks = this.executionCallbacks.get(jobId);
      if (callbacks) {
        callbacks.reject(new Error(error.message));
        this.executionCallbacks.delete(jobId);
      }

      // Process next pending job
      await this.processQueue();
    }
  }

  /**
   * Pause a running job
   */
  async pauseJob(jobId: string): Promise<void> {
    const job = this.findRunningJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found or not running`);
    }

    job.status = 'paused';
    job.lastActivityAt = new Date();
  }

  /**
   * Resume a paused job
   */
  async resumeJob(jobId: string): Promise<void> {
    const job = this.findRunningJob(jobId);
    if (!job || job.status !== 'paused') {
      throw new Error(`Job ${jobId} not found or not paused`);
    }

    job.status = 'running';
    job.lastActivityAt = new Date();
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    // Find job in any queue
    let job = this.findJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.status = 'cancelled';

    // Remove from queues
    if (this.queue.pending.includes(job)) {
      this.queue.pending = this.queue.pending.filter((j) => j.id !== jobId);
    }

    if (this.queue.running.includes(job)) {
      this.removeFromRunning(jobId);
      this.queue.currentRunning--;
    }

    // Reject callback if exists
    const callbacks = this.executionCallbacks.get(jobId);
    if (callbacks) {
      callbacks.reject(new Error('Job cancelled by user'));
      this.executionCallbacks.delete(jobId);
    }

    // Process next job
    await this.processQueue();
  }

  /**
   * Get queue status
   */
  getQueueStatus(): ExecutionQueue {
    return {
      ...this.queue,
      pending: [...this.queue.pending],
      running: [...this.queue.running],
      completed: [...this.queue.completed],
      failed: [...this.queue.failed],
    };
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): ExecutionJob | undefined {
    return this.findJob(jobId);
  }

  /**
   * Get all jobs for a series
   */
  getJobsForSeries(seriesId: number): ExecutionJob[] {
    return [
      ...this.queue.pending,
      ...this.queue.running,
      ...this.queue.completed,
      ...this.queue.failed,
    ].filter((job) => job.seriesId === seriesId);
  }

  /**
   * Update job progress
   */
  updateJobProgress(jobId: string, progress: number, currentPhase?: string): void {
    const job = this.findJob(jobId);
    if (job) {
      job.progress = Math.max(0, Math.min(100, progress));
      if (currentPhase) {
        job.currentPhase = currentPhase;
      }
      job.lastActivityAt = new Date();
    }
  }

  /**
   * Add log to job
   */
  addLog(
    jobId: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    source: 'system' | 'claude-code' | 'agent' = 'system',
    metadata?: Record<string, any>
  ): void {
    const job = this.findJob(jobId);
    if (job) {
      job.logs.push({
        timestamp: new Date(),
        level,
        source,
        message,
        metadata,
      });
      job.lastActivityAt = new Date();
    }
  }

  /**
   * Update token usage for job
   */
  updateTokenUsage(
    jobId: string,
    inputTokens: number,
    outputTokens: number
  ): void {
    const job = this.findJob(jobId);
    if (job) {
      job.tokensUsed.input += inputTokens;
      job.tokensUsed.output += outputTokens;
      job.tokensUsed.total = job.tokensUsed.input + job.tokensUsed.output;
      job.lastActivityAt = new Date();
    }
  }

  /**
   * Register execution promise callbacks
   */
  registerExecutionCallbacks(
    jobId: string,
    resolve: (result: ClaudeCodeExecutionResult) => void,
    reject: (error: Error) => void
  ): void {
    this.executionCallbacks.set(jobId, { resolve, reject });
  }

  /**
   * Helper: Find job in any queue
   */
  private findJob(jobId: string): ExecutionJob | undefined {
    return (
      this.queue.pending.find((j) => j.id === jobId) ||
      this.queue.running.find((j) => j.id === jobId) ||
      this.queue.completed.find((j) => j.id === jobId) ||
      this.queue.failed.find((j) => j.id === jobId)
    );
  }

  /**
   * Helper: Find running job
   */
  private findRunningJob(jobId: string): ExecutionJob | undefined {
    return this.queue.running.find((j) => j.id === jobId);
  }

  /**
   * Helper: Remove job from running queue
   */
  private removeFromRunning(jobId: string): void {
    this.queue.running = this.queue.running.filter((j) => j.id !== jobId);
  }

  /**
   * Clear completed and failed jobs older than retention period
   */
  cleanup(retentionDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    this.queue.completed = this.queue.completed.filter(
      (job) => job.completedAt && job.completedAt > cutoffDate
    );

    this.queue.failed = this.queue.failed.filter(
      (job) => job.lastActivityAt > cutoffDate
    );
  }
}
