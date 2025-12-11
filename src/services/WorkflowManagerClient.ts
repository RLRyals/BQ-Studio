/**
 * Workflow Manager Client
 * Provides methods to interact with the Workflow Manager MCP Server (port 3012)
 */

export interface WorkflowInstance {
  workflow_id: number;
  series_id: number;
  user_id: number;
  current_phase: number;
  status: 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'failed';
  concept?: string;
  created_at: string;
  updated_at: string;
}

export interface PhaseExecutionResult {
  success: boolean;
  phase_number: number;
  status: string;
  output?: any;
  quality_gate_passed?: boolean;
  approval_required?: boolean;
  error?: string;
}

export interface QualityGateResult {
  gate_id: number;
  workflow_id: number;
  phase_number: number;
  gate_type: string;
  passed: boolean;
  score?: number;
  details?: any;
}

export interface ApprovalRequest {
  approval_id: number;
  workflow_id: number;
  phase_number: number;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  artifacts?: any;
}

export interface WorkflowMetrics {
  workflow_id: number;
  total_phases: number;
  completed_phases: number;
  time_elapsed_minutes: number;
  estimated_time_remaining_minutes?: number;
  quality_scores: Record<number, number>;
}

/**
 * Client for interacting with Workflow Manager MCP Server
 */
export class WorkflowManagerClient {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3012') {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize SSE connection to the MCP server
   */
  private async initializeSession(): Promise<void> {
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
  private async callTool<T = any>(toolName: string, args: Record<string, any>): Promise<T> {
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

    const result: any = await response.json();

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
  async createWorkflow(params: {
    series_id: number;
    user_id: number;
    concept?: string;
  }): Promise<WorkflowInstance> {
    return this.callTool<WorkflowInstance>('create_workflow', params);
  }

  /**
   * Get current workflow state
   */
  async getWorkflowState(workflowId: number): Promise<WorkflowInstance> {
    return this.callTool<WorkflowInstance>('get_workflow_state', {
      workflow_id: workflowId,
    });
  }

  /**
   * Advance to the next phase
   */
  async advanceToPhase(workflowId: number, phaseNumber: number): Promise<{ success: boolean; message: string }> {
    return this.callTool('advance_to_phase', {
      workflow_id: workflowId,
      phase_number: phaseNumber,
    });
  }

  /**
   * Complete the current phase
   */
  async completeCurrentPhase(workflowId: number, output?: any): Promise<{ success: boolean; message: string }> {
    return this.callTool('complete_current_phase', {
      workflow_id: workflowId,
      output,
    });
  }

  /**
   * Execute a specific phase
   */
  async executePhase(params: {
    workflow_id: number;
    phase_number: number;
    input?: any;
  }): Promise<PhaseExecutionResult> {
    return this.callTool<PhaseExecutionResult>('execute_phase', params);
  }

  /**
   * Retry a failed phase
   */
  async retryFailedPhase(workflowId: number, phaseNumber: number): Promise<PhaseExecutionResult> {
    return this.callTool<PhaseExecutionResult>('retry_failed_phase', {
      workflow_id: workflowId,
      phase_number: phaseNumber,
    });
  }

  /**
   * Skip a phase (if allowed)
   */
  async skipPhase(workflowId: number, phaseNumber: number, reason: string): Promise<{ success: boolean; message: string }> {
    return this.callTool('skip_phase', {
      workflow_id: workflowId,
      phase_number: phaseNumber,
      reason,
    });
  }

  /**
   * Record a quality gate result
   */
  async recordQualityGate(params: {
    workflow_id: number;
    phase_number: number;
    gate_type: string;
    passed: boolean;
    score?: number;
    details?: any;
  }): Promise<QualityGateResult> {
    return this.callTool<QualityGateResult>('record_quality_gate', params);
  }

  /**
   * Check quality gate status
   */
  async checkGateStatus(workflowId: number, phaseNumber: number): Promise<QualityGateResult[]> {
    return this.callTool<QualityGateResult[]>('check_gate_status', {
      workflow_id: workflowId,
      phase_number: phaseNumber,
    });
  }

  /**
   * Request user approval
   */
  async requestApproval(params: {
    workflow_id: number;
    phase_number: number;
    requested_by: string;
    artifacts?: any;
  }): Promise<ApprovalRequest> {
    return this.callTool<ApprovalRequest>('request_approval', params);
  }

  /**
   * Submit approval decision
   */
  async submitApproval(params: {
    approval_id: number;
    approved: boolean;
    notes?: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.callTool('submit_approval', params);
  }

  /**
   * Get pending approvals for a workflow
   */
  async getPendingApprovals(workflowId: number): Promise<ApprovalRequest[]> {
    return this.callTool<ApprovalRequest[]>('get_pending_approvals', {
      workflow_id: workflowId,
    });
  }

  /**
   * Start a book iteration (for Phase 12)
   */
  async startBookIteration(params: {
    workflow_id: number;
    book_number: number;
    book_id: number;
  }): Promise<{ success: boolean; iteration_id: number }> {
    return this.callTool('start_book_iteration', params);
  }

  /**
   * Complete a book iteration
   */
  async completeBookIteration(params: {
    workflow_id: number;
    iteration_id: number;
    words_written: number;
    chapters_completed: number;
  }): Promise<{ success: boolean; message: string }> {
    return this.callTool('complete_book_iteration', params);
  }

  /**
   * Get series progress (for multi-book workflows)
   */
  async getSeriesProgress(workflowId: number): Promise<{
    total_books: number;
    completed_books: number;
    current_book: number;
    total_words: number;
  }> {
    return this.callTool('get_series_progress', {
      workflow_id: workflowId,
    });
  }

  /**
   * Record a production metric
   */
  async recordProductionMetric(params: {
    workflow_id: number;
    metric_type: string;
    value: number;
    metadata?: any;
  }): Promise<{ success: boolean; metric_id: number }> {
    return this.callTool('record_production_metric', params);
  }

  /**
   * Get workflow metrics
   */
  async getWorkflowMetrics(workflowId: number): Promise<WorkflowMetrics> {
    return this.callTool<WorkflowMetrics>('get_workflow_metrics', {
      workflow_id: workflowId,
    });
  }

  /**
   * Get phase analytics
   */
  async getPhaseAnalytics(workflowId: number, phaseNumber: number): Promise<{
    phase_number: number;
    avg_duration_minutes: number;
    success_rate: number;
    common_issues: string[];
  }> {
    return this.callTool('get_phase_analytics', {
      workflow_id: workflowId,
      phase_number: phaseNumber,
    });
  }

  /**
   * Get daily writing stats
   */
  async getDailyWritingStats(workflowId: number, date: string): Promise<{
    date: string;
    words_written: number;
    chapters_completed: number;
    hours_worked: number;
  }> {
    return this.callTool('get_daily_writing_stats', {
      workflow_id: workflowId,
      date,
    });
  }

  /**
   * Get workflow velocity (words per hour)
   */
  async getWorkflowVelocity(workflowId: number): Promise<{
    avg_words_per_hour: number;
    avg_chapters_per_day: number;
    estimated_completion_date: string;
  }> {
    return this.callTool('get_workflow_velocity', {
      workflow_id: workflowId,
    });
  }

  /**
   * Update daily stats
   */
  async updateDailyStats(params: {
    workflow_id: number;
    date: string;
    words_written: number;
    chapters_completed: number;
    hours_worked: number;
  }): Promise<{ success: boolean; message: string }> {
    return this.callTool('update_daily_stats', params);
  }

  /**
   * Get phase history
   */
  async getPhaseHistory(workflowId: number): Promise<Array<{
    phase_number: number;
    phase_name: string;
    status: string;
    started_at: string;
    completed_at?: string;
    output?: any;
  }>> {
    return this.callTool('get_phase_history', {
      workflow_id: workflowId,
    });
  }

  /**
   * Get workflow timeline
   */
  async getWorkflowTimeline(workflowId: number): Promise<Array<{
    timestamp: string;
    event_type: string;
    phase_number?: number;
    description: string;
  }>> {
    return this.callTool('get_workflow_timeline', {
      workflow_id: workflowId,
    });
  }

  /**
   * List active workflows
   */
  async listActiveWorkflows(userId?: number): Promise<WorkflowInstance[]> {
    return this.callTool<WorkflowInstance[]>('list_active_workflows', {
      user_id: userId,
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; database: any }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json() as Promise<{ status: string; database: any }>;
  }
}

// Export a singleton instance
export const workflowManagerClient = new WorkflowManagerClient();
