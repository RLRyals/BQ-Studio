"use strict";
/**
 * Agent Orchestration Service (Plugin Version)
 * High-level service that coordinates all agent execution components
 *
 * This version accepts injected dependencies for use in FictionLab plugin mode.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestrationService = void 0;
const events_1 = require("events");
const crypto_1 = require("crypto");
const QueueManager_1 = require("./QueueManager");
const ClaudeCodeExecutor_1 = require("./ClaudeCodeExecutor");
const OutputParser_1 = require("./OutputParser");
class AgentOrchestrationService extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.workspaceRoot = config.workspaceRoot;
        this.database = config.database;
        this.sessionManager = config.sessionManager;
        this.usageTracker = config.usageTracker;
        this.logger = config.logger;
        this.workflowClient = config.workflowClient || null;
        this.queueManager = new QueueManager_1.QueueManager({ maxConcurrent: config.maxConcurrent });
        this.claudeCodeExecutor = new ClaudeCodeExecutor_1.ClaudeCodeExecutor();
        this.outputParser = new OutputParser_1.OutputParser();
        this.workflowIdMap = new Map();
        // Initialize from database on startup
        this.initializeFromDatabase().catch((error) => {
            this.logger.error('Failed to initialize from database:', error);
        });
    }
    /**
     * Initialize orchestration state from database
     */
    async initializeFromDatabase() {
        try {
            // Load pending/running jobs from database
            const pendingJobs = await this.database.getJobsByStatus(['pending', 'running']);
            for (const jobRecord of pendingJobs) {
                // Reconstruct ExecutionJob from database record
                const job = {
                    id: jobRecord.id,
                    seriesId: jobRecord.series_id || 0,
                    seriesName: jobRecord.series_name,
                    workspaceDir: jobRecord.workspace_dir,
                    skillName: jobRecord.skill_name,
                    userPrompt: jobRecord.user_prompt,
                    status: jobRecord.status,
                    currentPhase: jobRecord.current_phase || null,
                    progress: jobRecord.progress,
                    createdAt: jobRecord.created_at,
                    tokensUsed: {
                        input: jobRecord.tokens_input,
                        output: jobRecord.tokens_output,
                        total: jobRecord.tokens_total,
                    },
                    logs: [], // Logs loaded on demand
                    retryCount: jobRecord.retry_count,
                    maxRetries: jobRecord.max_retries,
                    error: jobRecord.error_code
                        ? {
                            code: jobRecord.error_code,
                            message: jobRecord.error_message || 'Unknown error',
                            recoverable: jobRecord.error_recoverable || false,
                        }
                        : undefined,
                };
                // Add to queue
                await this.queueManager.enqueue(job);
                // Resume running jobs
                if (job.status === 'running') {
                    this.logger.warn(`Job ${job.id} was running when plugin restarted - will be retried`);
                    // Mark as pending for retry
                    await this.database.updateJobStatus(job.id, 'pending');
                }
            }
            this.logger.info(`Initialized ${pendingJobs.length} jobs from database`);
        }
        catch (error) {
            this.logger.error('Failed to initialize from database:', error);
            throw error;
        }
    }
    /**
     * Create and enqueue a new execution job
     */
    async createJob(seriesId, seriesName, skillName, userPrompt) {
        // Validate session
        if (!this.sessionManager.isAuthenticated()) {
            throw new Error('User not authenticated. Please login with Claude Pro/Max account.');
        }
        // Create job
        const job = {
            id: (0, crypto_1.randomUUID)(),
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
        // Persist to database
        try {
            await this.database.createJob({
                id: job.id,
                workflow_id: null,
                series_id: seriesId,
                series_name: seriesName,
                workspace_dir: job.workspaceDir,
                skill_name: skillName,
                user_prompt: userPrompt,
                status: 'pending',
                max_retries: 3,
            });
            await this.database.addJobLog(job.id, 'info', `Job created: ${skillName} for series ${seriesName}`);
        }
        catch (error) {
            this.logger.error('Failed to persist job to database:', error);
            throw new Error(`Failed to create job: ${error.message}`);
        }
        // Create workflow in WorkflowManager (if available)
        if (this.workflowClient) {
            try {
                const session = this.sessionManager.getSession();
                const workflow = await this.workflowClient.createWorkflow({
                    series_id: seriesId,
                    user_id: session?.userId ? parseInt(session.userId) : 1,
                    concept: userPrompt,
                });
                // Store workflow ID mapping
                this.workflowIdMap.set(job.id, workflow.workflow_id);
                await this.database.addJobLog(job.id, 'info', `Created workflow ${workflow.workflow_id} in WorkflowManager`);
            }
            catch (error) {
                this.logger.warn('Failed to create workflow in WorkflowManager:', error);
                await this.database.addJobLog(job.id, 'warn', 'Failed to create workflow in WorkflowManager - execution will proceed without persistence');
            }
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
    async processQueue() {
        const queueStatus = this.queueManager.getQueueStatus();
        // Start pending jobs if capacity available
        while (queueStatus.currentRunning < queueStatus.maxConcurrent &&
            queueStatus.pending.length > 0) {
            const job = queueStatus.pending[0];
            await this.startJob(job.id);
        }
    }
    /**
     * Start executing a job
     */
    async startJob(jobId) {
        const job = this.queueManager.getJob(jobId);
        if (!job) {
            this.logger.error(`Job ${jobId} not found`);
            return;
        }
        try {
            // Update database status
            await this.database.updateJobStatus(jobId, 'running');
            await this.database.addJobLog(jobId, 'info', `Starting execution of skill: ${job.skillName}`);
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
            const config = {
                workspaceRoot: this.workspaceRoot,
                seriesDir: job.workspaceDir,
                skillName: job.skillName,
                input: job.userPrompt,
                sessionToken,
                autoApprove: true,
            };
            // Execute Claude Code
            const result = await this.claudeCodeExecutor.execute(jobId, config, (output, isError) => this.handleOutput(jobId, output, isError), (progress, phase) => this.handleProgress(jobId, progress, phase));
            // Handle result
            if (result.success) {
                await this.completeJob(jobId, result);
            }
            else {
                await this.failJob(jobId, result);
            }
        }
        catch (error) {
            const err = error;
            await this.database.addJobLog(jobId, 'error', `Execution failed: ${err.message}`);
            await this.database.updateJobStatus(jobId, 'failed', 'EXECUTION_ERROR', err.message, false);
            await this.queueManager.failJob(jobId, {
                code: 'EXECUTION_ERROR',
                message: err.message,
                stack: err.stack,
                recoverable: false,
            });
            this.emitEvent({
                type: 'job-failed',
                jobId,
                job: this.queueManager.getJob(jobId),
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
    handleOutput(jobId, output, isError) {
        const level = isError ? 'error' : 'info';
        // Add to database logs (async, don't block)
        this.database.addJobLog(jobId, level, output, 'claude-code').catch((error) => {
            this.logger.error('Failed to add job log:', error);
        });
        // Add to queue manager (in-memory)
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
                const usage = {
                    jobId,
                    inputTokens: parsed.data.inputTokens,
                    outputTokens: parsed.data.outputTokens,
                    totalTokens: parsed.data.totalTokens,
                    timestamp: parsed.timestamp,
                };
                // Update queue manager
                this.queueManager.updateTokenUsage(jobId, parsed.data.inputTokens, parsed.data.outputTokens);
                // Update database (async, don't block)
                this.database
                    .updateJobTokens(jobId, parsed.data.inputTokens, parsed.data.outputTokens)
                    .catch((error) => {
                    this.logger.error('Failed to update job tokens:', error);
                });
                // Record in usage tracker
                const job = this.queueManager.getJob(jobId);
                if (job) {
                    this.usageTracker
                        .record(jobId, parsed.data.inputTokens, parsed.data.outputTokens, job.seriesId)
                        .catch((error) => {
                        this.logger.error('Failed to record token usage:', error);
                    });
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
    async handleProgress(jobId, progress, phase) {
        // Update queue manager
        this.queueManager.updateJobProgress(jobId, progress, phase);
        // Update database (async, don't block)
        this.database.updateJobProgress(jobId, progress, phase).catch((error) => {
            this.logger.error('Failed to update job progress:', error);
        });
        // Update workflow phase in WorkflowManager
        const workflowId = this.workflowIdMap.get(jobId);
        if (workflowId && this.workflowClient) {
            try {
                // Determine phase number from phase name (simplified)
                const phaseNumber = this.getPhaseNumberFromName(phase);
                if (phaseNumber > 0) {
                    await this.workflowClient.advanceToPhase(workflowId, phaseNumber);
                }
            }
            catch (error) {
                this.logger.warn('Failed to update workflow phase:', error);
            }
        }
        this.emitEvent({
            type: 'phase-progress',
            jobId,
            progress,
            phase,
            message: `Phase ${phase} at ${progress}%`,
        });
    }
    /**
     * Complete a job successfully
     */
    async completeJob(jobId, result) {
        await this.database.updateJobStatus(jobId, 'completed');
        await this.database.addJobLog(jobId, 'info', 'Job completed successfully');
        this.queueManager.completeJob(jobId, result);
        // Complete workflow
        const workflowId = this.workflowIdMap.get(jobId);
        if (workflowId && this.workflowClient) {
            try {
                await this.workflowClient.completeCurrentPhase(workflowId, result.output);
            }
            catch (error) {
                this.logger.warn('Failed to complete workflow:', error);
            }
        }
        const job = this.queueManager.getJob(jobId);
        if (job) {
            this.emitEvent({
                type: 'job-completed',
                jobId,
                job,
                result,
            });
        }
        // Process next queued job
        await this.processQueue();
    }
    /**
     * Mark job as failed
     */
    async failJob(jobId, result) {
        const error = result.error || { code: 'UNKNOWN', message: 'Unknown error', recoverable: false };
        await this.database.updateJobStatus(jobId, 'failed', error.code, error.message, error.recoverable);
        await this.database.addJobLog(jobId, 'error', `Job failed: ${error.message}`);
        await this.queueManager.failJob(jobId, error);
        const job = this.queueManager.getJob(jobId);
        if (job) {
            this.emitEvent({
                type: 'job-failed',
                jobId,
                job,
                error,
            });
        }
        // Retry if recoverable
        if (error.recoverable && job && job.retryCount < job.maxRetries) {
            const retryCount = await this.database.incrementJobRetryCount(jobId);
            await this.database.addJobLog(jobId, 'info', `Retrying job (attempt ${retryCount}/${job.maxRetries})`);
            await this.database.updateJobStatus(jobId, 'pending');
            job.status = 'pending';
            job.retryCount = retryCount;
            // Re-queue the job for retry (add back to pending queue)
            await this.queueManager.enqueue(job);
            this.emitEvent({
                type: 'job-retrying',
                jobId,
                job,
                retryCount,
            });
        }
        // Process next queued job
        await this.processQueue();
    }
    /**
     * Pause a running job
     */
    async pauseJob(jobId) {
        await this.database.updateJobStatus(jobId, 'paused');
        await this.database.addJobLog(jobId, 'info', 'Job paused by user');
        await this.queueManager.pauseJob(jobId);
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
     * Resume a paused job
     */
    async resumeJob(jobId) {
        await this.database.updateJobStatus(jobId, 'pending');
        await this.database.addJobLog(jobId, 'info', 'Job resumed by user');
        await this.queueManager.resumeJob(jobId);
        const job = this.queueManager.getJob(jobId);
        if (job) {
            this.emitEvent({
                type: 'job-resumed',
                jobId,
                job,
            });
        }
        await this.processQueue();
    }
    /**
     * Cancel a job
     */
    async cancelJob(jobId) {
        await this.database.updateJobStatus(jobId, 'cancelled');
        await this.database.addJobLog(jobId, 'info', 'Job cancelled by user');
        await this.queueManager.cancelJob(jobId);
        const job = this.queueManager.getJob(jobId);
        if (job) {
            this.emitEvent({
                type: 'job-cancelled',
                jobId,
                job,
            });
        }
        await this.processQueue();
    }
    /**
     * Get queue status
     */
    getQueueStatus() {
        return this.queueManager.getQueueStatus();
    }
    /**
     * Get job by ID
     */
    getJob(jobId) {
        return this.queueManager.getJob(jobId) || null;
    }
    /**
     * Get jobs for a series
     */
    getJobsForSeries(seriesId) {
        return this.queueManager.getJobsForSeries(seriesId);
    }
    /**
     * Authenticate with Claude Pro/Max
     */
    async authenticate(sessionToken, userId, subscriptionTier, expiresAt) {
        await this.sessionManager.saveSession(sessionToken, userId, subscriptionTier, expiresAt);
        this.logger.info(`Authenticated as ${userId} with ${subscriptionTier} subscription`);
    }
    /**
     * Logout
     */
    logout() {
        this.sessionManager.clearSession();
        this.logger.info('Logged out');
    }
    /**
     * Check if authenticated
     */
    isAuthenticated() {
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
    getUsageTracker() {
        return this.usageTracker;
    }
    /**
     * Cleanup
     */
    cleanup() {
        this.logger.info('Cleaning up AgentOrchestrationService');
        this.removeAllListeners();
    }
    /**
     * Emit event to listeners
     */
    emitEvent(event) {
        this.emit('agent-execution', event);
    }
    /**
     * Helper: Get phase number from phase name
     */
    getPhaseNumberFromName(phaseName) {
        const phaseMap = {
            'planning': 1,
            'research': 2,
            'writing': 3,
            'revision': 4,
            'finalization': 5,
        };
        return phaseMap[phaseName.toLowerCase()] || 0;
    }
}
exports.AgentOrchestrationService = AgentOrchestrationService;
