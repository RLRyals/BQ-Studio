/**
 * Plugin Database Adapter
 *
 * Wraps FictionLab's database service for BQ-Studio plugin use.
 * Provides type-safe access to plugin-specific tables.
 */

import type { FictionLabDatabase } from '@fictionlab/plugin-api';

export interface ClaudeSessionRecord {
  id: number;
  user_id: string;
  session_token: string;
  subscription_tier: 'pro' | 'max';
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface TokenUsageRecord {
  id: number;
  job_id: string | null;
  series_id: number | null;
  timestamp: Date;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface ExecutionJobRecord {
  id: string;
  workflow_id: number | null;
  series_id: number | null;
  series_name: string;
  workspace_dir: string;
  skill_name: string;
  user_prompt: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  current_phase: string | null;
  progress: number;
  tokens_input: number;
  tokens_output: number;
  tokens_total: number;
  retry_count: number;
  max_retries: number;
  error_code: string | null;
  error_message: string | null;
  error_recoverable: boolean | null;
  created_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
  updated_at: Date;
}

/**
 * Plugin Database
 *
 * Provides typed access to BQ-Studio plugin tables in PostgreSQL
 */
export class PluginDatabase {
  private schema: string;

  constructor(private db: FictionLabDatabase) {
    this.schema = db.getPluginSchema();
  }

  // ========================================
  // Claude Sessions
  // ========================================

  async saveSession(
    userId: string,
    sessionToken: string,
    subscriptionTier: 'pro' | 'max',
    expiresAt?: Date
  ): Promise<ClaudeSessionRecord> {
    const result = await this.db.query<ClaudeSessionRecord[]>(
      `INSERT INTO ${this.schema}.claude_sessions
       (user_id, session_token, subscription_tier, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         session_token = $2,
         subscription_tier = $3,
         expires_at = $4,
         updated_at = NOW()
       RETURNING *`,
      [userId, sessionToken, subscriptionTier, expiresAt || null]
    );

    return result[0];
  }

  async getSession(userId: string): Promise<ClaudeSessionRecord | null> {
    const result = await this.db.query<ClaudeSessionRecord[]>(
      `SELECT * FROM ${this.schema}.claude_sessions
       WHERE user_id = $1`,
      [userId]
    );

    return result.length > 0 ? result[0] : null;
  }

  async deleteSession(userId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM ${this.schema}.claude_sessions
       WHERE user_id = $1`,
      [userId]
    );
  }

  async updateSessionExpiry(userId: string, expiresAt: Date): Promise<void> {
    await this.db.query(
      `UPDATE ${this.schema}.claude_sessions
       SET expires_at = $2, updated_at = NOW()
       WHERE user_id = $1`,
      [userId, expiresAt]
    );
  }

  // ========================================
  // Token Usage
  // ========================================

  async recordTokenUsage(
    jobId: string | null,
    seriesId: number | null,
    inputTokens: number,
    outputTokens: number
  ): Promise<TokenUsageRecord> {
    const result = await this.db.query<TokenUsageRecord[]>(
      `INSERT INTO ${this.schema}.token_usage
       (job_id, series_id, input_tokens, output_tokens)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [jobId, seriesId, inputTokens, outputTokens]
    );

    return result[0];
  }

  async getTokenUsageByJob(jobId: string): Promise<TokenUsageRecord[]> {
    return await this.db.query<TokenUsageRecord[]>(
      `SELECT * FROM ${this.schema}.token_usage
       WHERE job_id = $1
       ORDER BY timestamp DESC`,
      [jobId]
    );
  }

  async getTokenUsageBySeries(seriesId: number): Promise<TokenUsageRecord[]> {
    return await this.db.query<TokenUsageRecord[]>(
      `SELECT * FROM ${this.schema}.token_usage
       WHERE series_id = $1
       ORDER BY timestamp DESC`,
      [seriesId]
    );
  }

  async getTotalTokenUsage(): Promise<{
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    execution_count: number;
  }> {
    const result = await this.db.query<
      Array<{
        total_tokens: number;
        input_tokens: number;
        output_tokens: number;
        execution_count: number;
      }>
    >(
      `SELECT
         COALESCE(SUM(total_tokens), 0) as total_tokens,
         COALESCE(SUM(input_tokens), 0) as input_tokens,
         COALESCE(SUM(output_tokens), 0) as output_tokens,
         COUNT(*) as execution_count
       FROM ${this.schema}.token_usage`
    );

    return result[0];
  }

  async getDailyTokenUsage(startDate: Date, endDate: Date): Promise<
    Array<{
      date: string;
      total_tokens: number;
      input_tokens: number;
      output_tokens: number;
      execution_count: number;
    }>
  > {
    return await this.db.query(
      `SELECT
         DATE(timestamp) as date,
         COALESCE(SUM(total_tokens), 0) as total_tokens,
         COALESCE(SUM(input_tokens), 0) as input_tokens,
         COALESCE(SUM(output_tokens), 0) as output_tokens,
         COUNT(*) as execution_count
       FROM ${this.schema}.token_usage
       WHERE timestamp >= $1 AND timestamp < $2
       GROUP BY DATE(timestamp)
       ORDER BY DATE(timestamp)`,
      [startDate, endDate]
    );
  }

  async getMonthlyTokenUsage(): Promise<{
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const result = await this.db.query<
      Array<{
        total_tokens: number;
        input_tokens: number;
        output_tokens: number;
      }>
    >(
      `SELECT
         COALESCE(SUM(total_tokens), 0) as total_tokens,
         COALESCE(SUM(input_tokens), 0) as input_tokens,
         COALESCE(SUM(output_tokens), 0) as output_tokens
       FROM ${this.schema}.token_usage
       WHERE timestamp >= $1 AND timestamp < $2`,
      [startOfMonth, endOfMonth]
    );

    return result[0];
  }

  async cleanupOldTokenUsage(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.db.query<Array<{ count: number }>>(
      `DELETE FROM ${this.schema}.token_usage
       WHERE timestamp < $1
       RETURNING COUNT(*) as count`,
      [cutoffDate]
    );

    return result[0]?.count || 0;
  }

  // ========================================
  // Execution Jobs
  // ========================================

  async createJob(job: Partial<ExecutionJobRecord>): Promise<ExecutionJobRecord> {
    const result = await this.db.query<ExecutionJobRecord[]>(
      `INSERT INTO ${this.schema}.execution_jobs
       (id, workflow_id, series_id, series_name, workspace_dir, skill_name, user_prompt,
        status, max_retries)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        job.id,
        job.workflow_id || null,
        job.series_id || null,
        job.series_name,
        job.workspace_dir,
        job.skill_name,
        job.user_prompt,
        job.status || 'pending',
        job.max_retries || 3,
      ]
    );

    return result[0];
  }

  async getJob(jobId: string): Promise<ExecutionJobRecord | null> {
    const result = await this.db.query<ExecutionJobRecord[]>(
      `SELECT * FROM ${this.schema}.execution_jobs
       WHERE id = $1`,
      [jobId]
    );

    return result.length > 0 ? result[0] : null;
  }

  async updateJobStatus(
    jobId: string,
    status: ExecutionJobRecord['status'],
    errorCode?: string,
    errorMessage?: string,
    errorRecoverable?: boolean
  ): Promise<void> {
    await this.db.query(
      `UPDATE ${this.schema}.execution_jobs
       SET status = $2,
           error_code = $3,
           error_message = $4,
           error_recoverable = $5,
           updated_at = NOW(),
           started_at = CASE WHEN $2 = 'running' AND started_at IS NULL THEN NOW() ELSE started_at END,
           completed_at = CASE WHEN $2 IN ('completed', 'failed', 'cancelled') THEN NOW() ELSE completed_at END
       WHERE id = $1`,
      [jobId, status, errorCode || null, errorMessage || null, errorRecoverable || null]
    );
  }

  async updateJobProgress(
    jobId: string,
    progress: number,
    currentPhase?: string
  ): Promise<void> {
    await this.db.query(
      `UPDATE ${this.schema}.execution_jobs
       SET progress = $2,
           current_phase = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [jobId, progress, currentPhase || null]
    );
  }

  async updateJobTokens(
    jobId: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<void> {
    await this.db.query(
      `UPDATE ${this.schema}.execution_jobs
       SET tokens_input = tokens_input + $2,
           tokens_output = tokens_output + $3,
           tokens_total = tokens_total + $2 + $3,
           updated_at = NOW()
       WHERE id = $1`,
      [jobId, inputTokens, outputTokens]
    );
  }

  async incrementJobRetryCount(jobId: string): Promise<number> {
    const result = await this.db.query<Array<{ retry_count: number }>>(
      `UPDATE ${this.schema}.execution_jobs
       SET retry_count = retry_count + 1,
           updated_at = NOW()
       WHERE id = $1
       RETURNING retry_count`,
      [jobId]
    );

    return result[0]?.retry_count || 0;
  }

  async getJobsBySeries(seriesId: number): Promise<ExecutionJobRecord[]> {
    return await this.db.query<ExecutionJobRecord[]>(
      `SELECT * FROM ${this.schema}.execution_jobs
       WHERE series_id = $1
       ORDER BY created_at DESC`,
      [seriesId]
    );
  }

  async getJobsByStatus(status: ExecutionJobRecord['status'][]): Promise<ExecutionJobRecord[]> {
    return await this.db.query<ExecutionJobRecord[]>(
      `SELECT * FROM ${this.schema}.execution_jobs
       WHERE status = ANY($1)
       ORDER BY created_at ASC`,
      [status]
    );
  }

  // ========================================
  // Job Logs
  // ========================================

  async addJobLog(
    jobId: string,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    source?: string
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO ${this.schema}.job_logs
       (job_id, level, message, source)
       VALUES ($1, $2, $3, $4)`,
      [jobId, level, message, source || null]
    );
  }

  async getJobLogs(jobId: string, limit: number = 100): Promise<
    Array<{
      id: number;
      job_id: string;
      timestamp: Date;
      level: string;
      source: string | null;
      message: string;
    }>
  > {
    return await this.db.query(
      `SELECT * FROM ${this.schema}.job_logs
       WHERE job_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [jobId, limit]
    );
  }

  async cleanupOldJobLogs(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.db.query<Array<{ count: number }>>(
      `DELETE FROM ${this.schema}.job_logs
       WHERE timestamp < $1
       RETURNING COUNT(*) as count`,
      [cutoffDate]
    );

    return result[0]?.count || 0;
  }

  // ========================================
  // Utility
  // ========================================

  /**
   * Get the underlying FictionLab database instance
   */
  getDatabase(): FictionLabDatabase {
    return this.db;
  }

  /**
   * Get the plugin schema name
   */
  getSchema(): string {
    return this.schema;
  }

  /**
   * Execute a raw query (use sparingly)
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    return await this.db.query<T>(sql, params);
  }

  /**
   * Execute a transaction
   */
  async transaction(callback: (client: any) => Promise<void>): Promise<void> {
    return await this.db.transaction(callback);
  }
}
