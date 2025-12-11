"use strict";
/**
 * BQ Studio Plugin Entry Point
 *
 * Main plugin implementation for FictionLab.
 * Transforms BQ-Studio from standalone Electron app to FictionLab plugin.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AgentOrchestrationService_plugin_1 = require("./core/agent-orchestration/AgentOrchestrationService.plugin");
const ClaudeCodeInstaller_1 = require("./core/agent-orchestration/ClaudeCodeInstaller");
const PluginDatabase_1 = require("./core/database/PluginDatabase");
const SessionManager_postgres_1 = require("./core/agent-orchestration/SessionManager.postgres");
const UsageTracker_postgres_1 = require("./core/agent-orchestration/UsageTracker.postgres");
/**
 * BQ Studio Plugin
 *
 * Provides AI-powered publishing workflows using Claude Code in headless mode.
 * Uses the user's Claude Pro/Max subscription for execution.
 */
class BQStudioPlugin {
    constructor() {
        this.id = 'bq-studio';
        this.name = 'BQ Studio - Publishing Workflow Engine';
        this.version = '1.0.0';
        this.context = null;
        this.orchestrationService = null;
        this.claudeCodeInstaller = null;
        this.pluginDatabase = null;
        this.sessionManager = null;
        this.usageTracker = null;
    }
    /**
     * Plugin activation
     * Called when FictionLab loads and activates the plugin
     */
    async onActivate(context) {
        this.context = context;
        context.logger.info('BQ Studio plugin activating...');
        try {
            // Create plugin database schema
            await this.initializeDatabase(context);
            // Initialize Plugin Database wrapper
            this.pluginDatabase = new PluginDatabase_1.PluginDatabase(context.services.database);
            // Initialize SessionManager with PostgreSQL
            this.sessionManager = new SessionManager_postgres_1.SessionManager(this.pluginDatabase);
            await this.sessionManager.initialize();
            // Initialize UsageTracker with PostgreSQL
            this.usageTracker = new UsageTracker_postgres_1.UsageTracker(this.pluginDatabase);
            // Initialize Claude Code installer
            this.claudeCodeInstaller = ClaudeCodeInstaller_1.ClaudeCodeInstaller.getInstance();
            // Initialize orchestration service with injected dependencies
            this.orchestrationService = new AgentOrchestrationService_plugin_1.AgentOrchestrationService({
                workspaceRoot: context.workspace.root,
                maxConcurrent: context.config.get('maxConcurrentJobs', 3),
                database: this.pluginDatabase,
                sessionManager: this.sessionManager,
                usageTracker: this.usageTracker,
                logger: context.logger,
            });
            // Forward agent execution events to renderer via IPC
            this.orchestrationService.on('agent-execution', (event) => {
                context.ipc.send('agent-execution:event', event);
            });
            // Register IPC handlers
            this.registerHandlers(context);
            // Register UI components
            this.registerUI(context);
            // Show activation notification
            context.ui.showNotification({
                type: 'success',
                title: 'BQ Studio Activated',
                message: 'Publishing workflow engine is ready!',
                duration: 3000,
            });
            context.logger.info('BQ Studio plugin activated successfully');
        }
        catch (error) {
            context.logger.error('Failed to activate BQ Studio plugin:', error);
            context.ui.showNotification({
                type: 'error',
                title: 'BQ Studio Activation Failed',
                message: error.message,
                duration: 5000,
            });
            throw error;
        }
    }
    /**
     * Plugin deactivation
     * Called when FictionLab deactivates or unloads the plugin
     */
    async onDeactivate() {
        if (!this.context) {
            return;
        }
        this.context.logger.info('BQ Studio plugin deactivating...');
        try {
            // Save any pending configuration
            if (this.orchestrationService) {
                const queueStatus = this.orchestrationService.getQueueStatus();
                await this.context.config.set('lastQueueSnapshot', {
                    timestamp: new Date().toISOString(),
                    running: queueStatus.running.length,
                    pending: queueStatus.pending.length,
                });
            }
            // Cleanup orchestration service
            if (this.orchestrationService) {
                this.orchestrationService.cleanup();
                this.orchestrationService = null;
            }
            this.context.logger.info('BQ Studio plugin deactivated');
        }
        catch (error) {
            this.context.logger.error('Error during deactivation:', error);
        }
        finally {
            this.context = null;
        }
    }
    /**
     * Configuration change handler
     */
    async onConfigChange(config) {
        if (!this.context || !this.orchestrationService) {
            return;
        }
        this.context.logger.info('Configuration changed:', Object.keys(config));
        // Handle max concurrent jobs change
        if (config.maxConcurrentJobs !== undefined) {
            // Would need to update queue manager - for now just log
            this.context.logger.info(`Max concurrent jobs: ${config.maxConcurrentJobs}`);
        }
    }
    /**
     * Initialize database schema
     */
    async initializeDatabase(context) {
        context.logger.info('Initializing database schema...');
        // Create plugin schema
        await context.services.database.createPluginSchema();
        const schema = context.services.database.getPluginSchema();
        // Create execution_jobs table
        await context.services.database.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.execution_jobs (
        id UUID PRIMARY KEY,
        workflow_id INTEGER,
        series_id INTEGER,
        series_name VARCHAR(255) NOT NULL,
        workspace_dir VARCHAR(255) NOT NULL,
        skill_name VARCHAR(100) NOT NULL,
        user_prompt TEXT NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
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
      )
    `);
        // Create job_logs table
        await context.services.database.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.job_logs (
        id SERIAL PRIMARY KEY,
        job_id UUID NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        level VARCHAR(10) NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
        source VARCHAR(50),
        message TEXT NOT NULL
      )
    `);
        // Create index on job_id for faster log queries
        await context.services.database.query(`
      CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON ${schema}.job_logs(job_id)
    `);
        // Create token_usage table
        await context.services.database.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.token_usage (
        id SERIAL PRIMARY KEY,
        job_id UUID,
        series_id INTEGER,
        timestamp TIMESTAMP DEFAULT NOW(),
        input_tokens INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED
      )
    `);
        // Create claude_sessions table
        await context.services.database.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.claude_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        session_token TEXT NOT NULL,
        subscription_tier VARCHAR(10) CHECK (subscription_tier IN ('pro', 'max')),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);
        context.logger.info('Database schema initialized successfully');
    }
    /**
     * Register IPC handlers
     */
    registerHandlers(context) {
        // Job management
        context.ipc.handle('create-job', this.handleCreateJob.bind(this));
        context.ipc.handle('pause-job', this.handlePauseJob.bind(this));
        context.ipc.handle('resume-job', this.handleResumeJob.bind(this));
        context.ipc.handle('cancel-job', this.handleCancelJob.bind(this));
        // Job queries
        context.ipc.handle('get-queue-status', this.handleGetQueueStatus.bind(this));
        context.ipc.handle('get-job', this.handleGetJob.bind(this));
        context.ipc.handle('get-series-jobs', this.handleGetSeriesJobs.bind(this));
        // Authentication
        context.ipc.handle('authenticate', this.handleAuthenticate.bind(this));
        context.ipc.handle('logout', this.handleLogout.bind(this));
        context.ipc.handle('is-authenticated', this.handleIsAuthenticated.bind(this));
        context.ipc.handle('get-session-info', this.handleGetSessionInfo.bind(this));
        // Usage tracking
        context.ipc.handle('get-usage-summary', this.handleGetUsageSummary.bind(this));
        // Claude Code CLI management
        context.ipc.handle('detect-cli', this.handleDetectCLI.bind(this));
        context.ipc.handle('install-cli', this.handleInstallCLI.bind(this));
        context.ipc.handle('open-install-guide', this.handleOpenInstallGuide.bind(this));
        context.logger.debug('IPC handlers registered');
    }
    /**
     * Register UI components
     */
    registerUI(context) {
        // Register main menu
        context.ui.registerMenuItem({
            id: 'bq-studio-menu',
            label: 'BQ Studio',
            submenu: [
                {
                    id: 'bq-new-series',
                    label: 'New Series Workflow',
                    accelerator: 'CmdOrCtrl+Shift+N',
                    click: () => {
                        context.ui.showView('StudioDashboard');
                    },
                },
                {
                    id: 'bq-active-jobs',
                    label: 'Active Jobs',
                    accelerator: 'CmdOrCtrl+Shift+J',
                    click: () => {
                        context.ui.showView('JobMonitor');
                    },
                },
                {
                    id: 'bq-usage',
                    label: 'Token Usage',
                    click: () => {
                        context.ui.showView('UsageTracker');
                    },
                },
                {
                    id: 'bq-separator',
                    label: '-',
                    type: 'separator',
                },
                {
                    id: 'bq-settings',
                    label: 'Settings',
                    click: () => {
                        context.ui.showView('StudioSettings');
                    },
                },
            ],
        });
        context.logger.debug('UI components registered');
    }
    // ========================================
    // IPC Handler Implementations
    // ========================================
    async handleCreateJob(_event, params) {
        if (!this.orchestrationService) {
            throw new Error('Orchestration service not initialized');
        }
        return await this.orchestrationService.createJob(params.seriesId, params.seriesName, params.skillName, params.userPrompt);
    }
    async handlePauseJob(_event, jobId) {
        if (!this.orchestrationService) {
            throw new Error('Orchestration service not initialized');
        }
        await this.orchestrationService.pauseJob(jobId);
    }
    async handleResumeJob(_event, jobId) {
        if (!this.orchestrationService) {
            throw new Error('Orchestration service not initialized');
        }
        await this.orchestrationService.resumeJob(jobId);
    }
    async handleCancelJob(_event, jobId) {
        if (!this.orchestrationService) {
            throw new Error('Orchestration service not initialized');
        }
        await this.orchestrationService.cancelJob(jobId);
    }
    async handleGetQueueStatus() {
        if (!this.orchestrationService) {
            throw new Error('Orchestration service not initialized');
        }
        return this.orchestrationService.getQueueStatus();
    }
    async handleGetJob(_event, jobId) {
        if (!this.orchestrationService) {
            throw new Error('Orchestration service not initialized');
        }
        const job = this.orchestrationService.getJob(jobId);
        return job || null;
    }
    async handleGetSeriesJobs(_event, seriesId) {
        if (!this.orchestrationService) {
            throw new Error('Orchestration service not initialized');
        }
        return this.orchestrationService.getJobsForSeries(seriesId);
    }
    async handleAuthenticate(_event, params) {
        if (!this.sessionManager) {
            throw new Error('Session manager not initialized');
        }
        await this.sessionManager.saveSession(params.sessionToken, params.userId, params.subscriptionTier, params.expiresAt ? new Date(params.expiresAt) : undefined);
    }
    async handleLogout() {
        if (!this.sessionManager) {
            throw new Error('Session manager not initialized');
        }
        await this.sessionManager.clearSession();
    }
    async handleIsAuthenticated() {
        if (!this.sessionManager) {
            return false;
        }
        return this.sessionManager.isAuthenticated();
    }
    async handleGetSessionInfo() {
        if (!this.sessionManager) {
            return null;
        }
        return this.sessionManager.getSession();
    }
    async handleGetUsageSummary() {
        if (!this.usageTracker || !this.sessionManager) {
            return {
                totalTokens: 0,
                monthlyUsage: 0,
                usagePercentage: 0,
            };
        }
        const summary = await this.usageTracker.getTotalUsage();
        const monthlyUsage = await this.usageTracker.getCurrentMonthUsage();
        const session = this.sessionManager.getSession();
        const tier = session?.subscriptionTier || 'pro';
        return {
            totalTokens: summary.totalTokens,
            monthlyUsage: this.usageTracker.getTotalTokensForPeriod(monthlyUsage),
            usagePercentage: await this.usageTracker.getUsagePercentage(tier),
        };
    }
    async handleDetectCLI() {
        if (!this.claudeCodeInstaller) {
            return { isInstalled: false };
        }
        return await this.claudeCodeInstaller.detectCLI();
    }
    async handleInstallCLI() {
        if (!this.claudeCodeInstaller || !this.context) {
            return {
                success: false,
                error: 'Installer not initialized',
            };
        }
        const context = this.context;
        const result = await this.claudeCodeInstaller.installCLI((message) => {
            context.ipc.send('install-progress', message);
        });
        return result;
    }
    async handleOpenInstallGuide() {
        if (!this.claudeCodeInstaller) {
            throw new Error('Installer not initialized');
        }
        this.claudeCodeInstaller.openInstallationGuide();
    }
}
exports.default = BQStudioPlugin;
// CommonJS export for FictionLab plugin loader
module.exports = BQStudioPlugin;
