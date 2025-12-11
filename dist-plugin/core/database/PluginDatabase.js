"use strict";
/**
 * Plugin Database Adapter
 *
 * Wraps FictionLab's database service for BQ-Studio plugin use.
 * Provides type-safe access to plugin-specific tables.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginDatabase = void 0;
/**
 * Plugin Database
 *
 * Provides typed access to BQ-Studio plugin tables in PostgreSQL
 */
class PluginDatabase {
    constructor(db) {
        this.db = db;
        this.schema = db.getPluginSchema();
    }
    // ========================================
    // Claude Sessions
    // ========================================
    async saveSession(userId, sessionToken, subscriptionTier, expiresAt) {
        const result = await this.db.query(`INSERT INTO ${this.schema}.claude_sessions
       (user_id, session_token, subscription_tier, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         session_token = $2,
         subscription_tier = $3,
         expires_at = $4,
         updated_at = NOW()
       RETURNING *`, [userId, sessionToken, subscriptionTier, expiresAt || null]);
        return result[0];
    }
    async getSession(userId) {
        const result = await this.db.query(`SELECT * FROM ${this.schema}.claude_sessions
       WHERE user_id = $1`, [userId]);
        return result.length > 0 ? result[0] : null;
    }
    async deleteSession(userId) {
        await this.db.query(`DELETE FROM ${this.schema}.claude_sessions
       WHERE user_id = $1`, [userId]);
    }
    async updateSessionExpiry(userId, expiresAt) {
        await this.db.query(`UPDATE ${this.schema}.claude_sessions
       SET expires_at = $2, updated_at = NOW()
       WHERE user_id = $1`, [userId, expiresAt]);
    }
    // ========================================
    // Token Usage
    // ========================================
    async recordTokenUsage(jobId, seriesId, inputTokens, outputTokens) {
        const result = await this.db.query(`INSERT INTO ${this.schema}.token_usage
       (job_id, series_id, input_tokens, output_tokens)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [jobId, seriesId, inputTokens, outputTokens]);
        return result[0];
    }
    async getTokenUsageByJob(jobId) {
        return await this.db.query(`SELECT * FROM ${this.schema}.token_usage
       WHERE job_id = $1
       ORDER BY timestamp DESC`, [jobId]);
    }
    async getTokenUsageBySeries(seriesId) {
        return await this.db.query(`SELECT * FROM ${this.schema}.token_usage
       WHERE series_id = $1
       ORDER BY timestamp DESC`, [seriesId]);
    }
    async getTotalTokenUsage() {
        const result = await this.db.query(`SELECT
         COALESCE(SUM(total_tokens), 0) as total_tokens,
         COALESCE(SUM(input_tokens), 0) as input_tokens,
         COALESCE(SUM(output_tokens), 0) as output_tokens,
         COUNT(*) as execution_count
       FROM ${this.schema}.token_usage`);
        return result[0];
    }
    async getDailyTokenUsage(startDate, endDate) {
        return await this.db.query(`SELECT
         DATE(timestamp) as date,
         COALESCE(SUM(total_tokens), 0) as total_tokens,
         COALESCE(SUM(input_tokens), 0) as input_tokens,
         COALESCE(SUM(output_tokens), 0) as output_tokens,
         COUNT(*) as execution_count
       FROM ${this.schema}.token_usage
       WHERE timestamp >= $1 AND timestamp < $2
       GROUP BY DATE(timestamp)
       ORDER BY DATE(timestamp)`, [startDate, endDate]);
    }
    async getMonthlyTokenUsage() {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        const result = await this.db.query(`SELECT
         COALESCE(SUM(total_tokens), 0) as total_tokens,
         COALESCE(SUM(input_tokens), 0) as input_tokens,
         COALESCE(SUM(output_tokens), 0) as output_tokens
       FROM ${this.schema}.token_usage
       WHERE timestamp >= $1 AND timestamp < $2`, [startOfMonth, endOfMonth]);
        return result[0];
    }
    async cleanupOldTokenUsage(retentionDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const result = await this.db.query(`DELETE FROM ${this.schema}.token_usage
       WHERE timestamp < $1
       RETURNING COUNT(*) as count`, [cutoffDate]);
        return result[0]?.count || 0;
    }
    // ========================================
    // Execution Jobs
    // ========================================
    async createJob(job) {
        const result = await this.db.query(`INSERT INTO ${this.schema}.execution_jobs
       (id, workflow_id, series_id, series_name, workspace_dir, skill_name, user_prompt,
        status, max_retries)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`, [
            job.id,
            job.workflow_id || null,
            job.series_id || null,
            job.series_name,
            job.workspace_dir,
            job.skill_name,
            job.user_prompt,
            job.status || 'pending',
            job.max_retries || 3,
        ]);
        return result[0];
    }
    async getJob(jobId) {
        const result = await this.db.query(`SELECT * FROM ${this.schema}.execution_jobs
       WHERE id = $1`, [jobId]);
        return result.length > 0 ? result[0] : null;
    }
    async updateJobStatus(jobId, status, errorCode, errorMessage, errorRecoverable) {
        await this.db.query(`UPDATE ${this.schema}.execution_jobs
       SET status = $2,
           error_code = $3,
           error_message = $4,
           error_recoverable = $5,
           updated_at = NOW(),
           started_at = CASE WHEN $2 = 'running' AND started_at IS NULL THEN NOW() ELSE started_at END,
           completed_at = CASE WHEN $2 IN ('completed', 'failed', 'cancelled') THEN NOW() ELSE completed_at END
       WHERE id = $1`, [jobId, status, errorCode || null, errorMessage || null, errorRecoverable || null]);
    }
    async updateJobProgress(jobId, progress, currentPhase) {
        await this.db.query(`UPDATE ${this.schema}.execution_jobs
       SET progress = $2,
           current_phase = $3,
           updated_at = NOW()
       WHERE id = $1`, [jobId, progress, currentPhase || null]);
    }
    async updateJobTokens(jobId, inputTokens, outputTokens) {
        await this.db.query(`UPDATE ${this.schema}.execution_jobs
       SET tokens_input = tokens_input + $2,
           tokens_output = tokens_output + $3,
           tokens_total = tokens_total + $2 + $3,
           updated_at = NOW()
       WHERE id = $1`, [jobId, inputTokens, outputTokens]);
    }
    async incrementJobRetryCount(jobId) {
        const result = await this.db.query(`UPDATE ${this.schema}.execution_jobs
       SET retry_count = retry_count + 1,
           updated_at = NOW()
       WHERE id = $1
       RETURNING retry_count`, [jobId]);
        return result[0]?.retry_count || 0;
    }
    async getJobsBySeries(seriesId) {
        return await this.db.query(`SELECT * FROM ${this.schema}.execution_jobs
       WHERE series_id = $1
       ORDER BY created_at DESC`, [seriesId]);
    }
    async getJobsByStatus(status) {
        return await this.db.query(`SELECT * FROM ${this.schema}.execution_jobs
       WHERE status = ANY($1)
       ORDER BY created_at ASC`, [status]);
    }
    // ========================================
    // Job Logs
    // ========================================
    async addJobLog(jobId, level, message, source) {
        await this.db.query(`INSERT INTO ${this.schema}.job_logs
       (job_id, level, message, source)
       VALUES ($1, $2, $3, $4)`, [jobId, level, message, source || null]);
    }
    async getJobLogs(jobId, limit = 100) {
        return await this.db.query(`SELECT * FROM ${this.schema}.job_logs
       WHERE job_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`, [jobId, limit]);
    }
    async cleanupOldJobLogs(retentionDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const result = await this.db.query(`DELETE FROM ${this.schema}.job_logs
       WHERE timestamp < $1
       RETURNING COUNT(*) as count`, [cutoffDate]);
        return result[0]?.count || 0;
    }
    // ========================================
    // Utility
    // ========================================
    /**
     * Get the underlying FictionLab database instance
     */
    getDatabase() {
        return this.db;
    }
    /**
     * Get the plugin schema name
     */
    getSchema() {
        return this.schema;
    }
    /**
     * Execute a raw query (use sparingly)
     */
    async query(sql, params) {
        return await this.db.query(sql, params);
    }
    /**
     * Execute a transaction
     */
    async transaction(callback) {
        return await this.db.transaction(callback);
    }
}
exports.PluginDatabase = PluginDatabase;
