"use strict";
/**
 * Workflow Manager Client
 * Provides methods to interact with the Workflow Manager MCP Server (port 3012)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowManagerClient = exports.WorkflowManagerClient = void 0;
/**
 * Client for interacting with Workflow Manager MCP Server
 */
class WorkflowManagerClient {
    constructor(baseUrl = 'http://localhost:3012') {
        this.sessionId = null;
        this.baseUrl = baseUrl;
    }
    /**
     * Initialize SSE connection to the MCP server
     */
    async initializeSession() {
        if (this.sessionId) {
            return; // Already initialized
        }
        // For SSE-based MCP, we need to establish a session
        // This is a simplified version - actual implementation may vary
        const response = await fetch(`${this.baseUrl}/`, {
            method: 'GET',
            headers: {
                'Accept': 'text/event-stream',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to initialize session: ${response.statusText}`);
        }
        // Extract session ID from response (implementation depends on MCP server)
        // For now, we'll use a simple approach
        this.sessionId = 'default-session';
    }
    /**
     * Call an MCP tool
     */
    async callTool(toolName, args) {
        await this.initializeSession();
        const response = await fetch(`${this.baseUrl}/api/tool-call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'tools/call',
                params: {
                    name: toolName,
                    arguments: args,
                },
                id: Date.now(),
            }),
        });
        if (!response.ok) {
            throw new Error(`MCP call failed: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.error) {
            throw new Error(`MCP error: ${result.error.message}`);
        }
        // Parse the result content
        if (result.result?.content?.[0]?.text) {
            return JSON.parse(result.result.content[0].text);
        }
        return result.result;
    }
    /**
     * Create a new workflow instance
     */
    async createWorkflow(params) {
        return this.callTool('create_workflow', params);
    }
    /**
     * Get current workflow state
     */
    async getWorkflowState(workflowId) {
        return this.callTool('get_workflow_state', {
            workflow_id: workflowId,
        });
    }
    /**
     * Advance to the next phase
     */
    async advanceToPhase(workflowId, phaseNumber) {
        return this.callTool('advance_to_phase', {
            workflow_id: workflowId,
            phase_number: phaseNumber,
        });
    }
    /**
     * Complete the current phase
     */
    async completeCurrentPhase(workflowId, output) {
        return this.callTool('complete_current_phase', {
            workflow_id: workflowId,
            output,
        });
    }
    /**
     * Execute a specific phase
     */
    async executePhase(params) {
        return this.callTool('execute_phase', params);
    }
    /**
     * Retry a failed phase
     */
    async retryFailedPhase(workflowId, phaseNumber) {
        return this.callTool('retry_failed_phase', {
            workflow_id: workflowId,
            phase_number: phaseNumber,
        });
    }
    /**
     * Skip a phase (if allowed)
     */
    async skipPhase(workflowId, phaseNumber, reason) {
        return this.callTool('skip_phase', {
            workflow_id: workflowId,
            phase_number: phaseNumber,
            reason,
        });
    }
    /**
     * Record a quality gate result
     */
    async recordQualityGate(params) {
        return this.callTool('record_quality_gate', params);
    }
    /**
     * Check quality gate status
     */
    async checkGateStatus(workflowId, phaseNumber) {
        return this.callTool('check_gate_status', {
            workflow_id: workflowId,
            phase_number: phaseNumber,
        });
    }
    /**
     * Request user approval
     */
    async requestApproval(params) {
        return this.callTool('request_approval', params);
    }
    /**
     * Submit approval decision
     */
    async submitApproval(params) {
        return this.callTool('submit_approval', params);
    }
    /**
     * Get pending approvals for a workflow
     */
    async getPendingApprovals(workflowId) {
        return this.callTool('get_pending_approvals', {
            workflow_id: workflowId,
        });
    }
    /**
     * Start a book iteration (for Phase 12)
     */
    async startBookIteration(params) {
        return this.callTool('start_book_iteration', params);
    }
    /**
     * Complete a book iteration
     */
    async completeBookIteration(params) {
        return this.callTool('complete_book_iteration', params);
    }
    /**
     * Get series progress (for multi-book workflows)
     */
    async getSeriesProgress(workflowId) {
        return this.callTool('get_series_progress', {
            workflow_id: workflowId,
        });
    }
    /**
     * Record a production metric
     */
    async recordProductionMetric(params) {
        return this.callTool('record_production_metric', params);
    }
    /**
     * Get workflow metrics
     */
    async getWorkflowMetrics(workflowId) {
        return this.callTool('get_workflow_metrics', {
            workflow_id: workflowId,
        });
    }
    /**
     * Get phase analytics
     */
    async getPhaseAnalytics(workflowId, phaseNumber) {
        return this.callTool('get_phase_analytics', {
            workflow_id: workflowId,
            phase_number: phaseNumber,
        });
    }
    /**
     * Get daily writing stats
     */
    async getDailyWritingStats(workflowId, date) {
        return this.callTool('get_daily_writing_stats', {
            workflow_id: workflowId,
            date,
        });
    }
    /**
     * Get workflow velocity (words per hour)
     */
    async getWorkflowVelocity(workflowId) {
        return this.callTool('get_workflow_velocity', {
            workflow_id: workflowId,
        });
    }
    /**
     * Update daily stats
     */
    async updateDailyStats(params) {
        return this.callTool('update_daily_stats', params);
    }
    /**
     * Get phase history
     */
    async getPhaseHistory(workflowId) {
        return this.callTool('get_phase_history', {
            workflow_id: workflowId,
        });
    }
    /**
     * Get workflow timeline
     */
    async getWorkflowTimeline(workflowId) {
        return this.callTool('get_workflow_timeline', {
            workflow_id: workflowId,
        });
    }
    /**
     * List active workflows
     */
    async listActiveWorkflows(userId) {
        return this.callTool('list_active_workflows', {
            user_id: userId,
        });
    }
    /**
     * Health check
     */
    async healthCheck() {
        const response = await fetch(`${this.baseUrl}/health`);
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.statusText}`);
        }
        return response.json();
    }
}
exports.WorkflowManagerClient = WorkflowManagerClient;
// Export a singleton instance
exports.workflowManagerClient = new WorkflowManagerClient();
