"use strict";
/**
 * Workflow Manager MCP Client
 *
 * Communicates with the workflow-manager MCP server (port 3012)
 * to manage series workflows, fetch prompts, and update workflow state.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowManagerClient = void 0;
/**
 * WorkflowManagerClient
 *
 * Type-safe wrapper around FictionLab's MCP service for workflow management
 */
class WorkflowManagerClient {
    constructor(mcpManager) {
        this.mcpManager = mcpManager;
        this.serverId = 'workflow-manager';
    }
    /**
     * Check if workflow-manager MCP server is running
     */
    async isAvailable() {
        try {
            return await this.mcpManager.isServerRunning(this.serverId);
        }
        catch (error) {
            console.error('Failed to check workflow-manager availability:', error);
            return false;
        }
    }
    /**
     * Get endpoint URL for workflow-manager
     */
    getEndpoint() {
        return this.mcpManager.getEndpoint(this.serverId);
    }
    /**
     * Get server info including available tools
     */
    async getServerInfo() {
        return await this.mcpManager.getServerInfo(this.serverId);
    }
    // ========================================
    // Series Management
    // ========================================
    /**
     * Get series by ID
     */
    async getSeries(seriesId) {
        try {
            return await this.mcpManager.callTool(this.serverId, 'get_series', {
                seriesId,
            });
        }
        catch (error) {
            console.error(`Failed to get series ${seriesId}:`, error);
            return null;
        }
    }
    /**
     * List all series
     */
    async listSeries(filter) {
        try {
            return await this.mcpManager.callTool(this.serverId, 'list_series', {
                filter: filter || {},
            });
        }
        catch (error) {
            console.error('Failed to list series:', error);
            return [];
        }
    }
    /**
     * Create new series
     */
    async createSeries(series) {
        try {
            return await this.mcpManager.callTool(this.serverId, 'create_series', {
                series,
            });
        }
        catch (error) {
            console.error('Failed to create series:', error);
            return null;
        }
    }
    /**
     * Update series
     */
    async updateSeries(seriesId, updates) {
        try {
            await this.mcpManager.callTool(this.serverId, 'update_series', {
                seriesId,
                updates,
            });
            return true;
        }
        catch (error) {
            console.error(`Failed to update series ${seriesId}:`, error);
            return false;
        }
    }
    // ========================================
    // Chapter Management
    // ========================================
    /**
     * Get chapter by ID
     */
    async getChapter(chapterId) {
        try {
            return await this.mcpManager.callTool(this.serverId, 'get_chapter', {
                chapterId,
            });
        }
        catch (error) {
            console.error(`Failed to get chapter ${chapterId}:`, error);
            return null;
        }
    }
    /**
     * List chapters for a series
     */
    async listChapters(seriesId, filter) {
        try {
            return await this.mcpManager.callTool(this.serverId, 'list_chapters', {
                seriesId,
                filter: filter || {},
            });
        }
        catch (error) {
            console.error(`Failed to list chapters for series ${seriesId}:`, error);
            return [];
        }
    }
    /**
     * Create new chapter
     */
    async createChapter(chapter) {
        try {
            return await this.mcpManager.callTool(this.serverId, 'create_chapter', {
                chapter,
            });
        }
        catch (error) {
            console.error('Failed to create chapter:', error);
            return null;
        }
    }
    /**
     * Update chapter
     */
    async updateChapter(chapterId, updates) {
        try {
            await this.mcpManager.callTool(this.serverId, 'update_chapter', {
                chapterId,
                updates,
            });
            return true;
        }
        catch (error) {
            console.error(`Failed to update chapter ${chapterId}:`, error);
            return false;
        }
    }
    // ========================================
    // Prompt Management
    // ========================================
    /**
     * Get prompt for a specific workflow phase
     */
    async getPrompt(params) {
        try {
            return await this.mcpManager.callTool(this.serverId, 'get_prompt', params);
        }
        catch (error) {
            console.error('Failed to get prompt:', error);
            return null;
        }
    }
    /**
     * Generate series planning prompt
     */
    async getSeriesPlanningPrompt(seriesId) {
        const prompt = await this.getPrompt({
            type: 'series-planning',
            seriesId,
        });
        return prompt?.content || null;
    }
    /**
     * Generate chapter drafting prompt
     */
    async getChapterDraftingPrompt(seriesId, chapterId) {
        const prompt = await this.getPrompt({
            type: 'chapter-drafting',
            seriesId,
            chapterId,
        });
        return prompt?.content || null;
    }
    /**
     * Generate revision prompt
     */
    async getRevisionPrompt(seriesId, chapterId, revisionType) {
        const prompt = await this.getPrompt({
            type: 'revision',
            seriesId,
            chapterId,
            context: { revisionType },
        });
        return prompt?.content || null;
    }
    // ========================================
    // Workflow State Management
    // ========================================
    /**
     * Update workflow state
     */
    async updateWorkflowState(update) {
        try {
            await this.mcpManager.callTool(this.serverId, 'update_workflow_state', update);
            return true;
        }
        catch (error) {
            console.error('Failed to update workflow state:', error);
            return false;
        }
    }
    /**
     * Mark chapter as in-progress
     */
    async startChapter(chapterId) {
        return await this.updateWorkflowState({
            chapterId,
            status: 'in-progress',
        });
    }
    /**
     * Mark chapter as completed
     */
    async completeChapter(chapterId, wordCount) {
        return await this.updateWorkflowState({
            chapterId,
            status: 'completed',
            wordCount,
        });
    }
    /**
     * Mark chapter as failed
     */
    async failChapter(chapterId, errorMessage) {
        return await this.updateWorkflowState({
            chapterId,
            status: 'failed',
            metadata: { errorMessage },
        });
    }
    /**
     * Update chapter progress
     */
    async updateChapterProgress(chapterId, progress) {
        return await this.updateWorkflowState({
            chapterId,
            progress,
        });
    }
    // ========================================
    // Advanced Operations
    // ========================================
    /**
     * Get next pending chapter for a series
     */
    async getNextPendingChapter(seriesId) {
        const chapters = await this.listChapters(seriesId, { status: 'pending' });
        return chapters.length > 0 ? chapters[0] : null;
    }
    /**
     * Get series statistics
     */
    async getSeriesStats(seriesId) {
        try {
            return await this.mcpManager.callTool(this.serverId, 'get_series_stats', { seriesId });
        }
        catch (error) {
            console.error(`Failed to get stats for series ${seriesId}:`, error);
            return null;
        }
    }
    /**
     * Validate workflow state
     */
    async validateWorkflow(seriesId) {
        try {
            return await this.mcpManager.callTool(this.serverId, 'validate_workflow', { seriesId });
        }
        catch (error) {
            console.error(`Failed to validate workflow for series ${seriesId}:`, error);
            return { valid: false, errors: [String(error)], warnings: [] };
        }
    }
}
exports.WorkflowManagerClient = WorkflowManagerClient;
