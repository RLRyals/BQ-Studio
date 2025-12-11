/**
 * Workflow Manager MCP Client
 *
 * Communicates with the workflow-manager MCP server (port 3012)
 * to manage series workflows, fetch prompts, and update workflow state.
 */

import type { MCPConnectionManager } from '@fictionlab/plugin-api';

export interface WorkflowSeries {
  id: number;
  name: string;
  genre: string;
  bookCount: number;
  status: 'planning' | 'active' | 'paused' | 'completed';
  metadata?: Record<string, any>;
}

export interface WorkflowChapter {
  id: number;
  seriesId: number;
  bookNumber: number;
  chapterNumber: number;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  wordCount?: number;
  metadata?: Record<string, any>;
}

export interface WorkflowPrompt {
  id: string;
  type: 'series-planning' | 'chapter-drafting' | 'revision' | 'validation';
  content: string;
  context?: Record<string, any>;
}

export interface WorkflowUpdate {
  seriesId?: number;
  chapterId?: number;
  status?: string;
  progress?: number;
  wordCount?: number;
  metadata?: Record<string, any>;
}

/**
 * WorkflowManagerClient
 *
 * Type-safe wrapper around FictionLab's MCP service for workflow management
 */
export class WorkflowManagerClient {
  private serverId = 'workflow-manager';

  constructor(private mcpManager: MCPConnectionManager) {}

  /**
   * Check if workflow-manager MCP server is running
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.mcpManager.isServerRunning(this.serverId);
    } catch (error) {
      console.error('Failed to check workflow-manager availability:', error);
      return false;
    }
  }

  /**
   * Get endpoint URL for workflow-manager
   */
  getEndpoint(): string | null {
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
  async getSeries(seriesId: number): Promise<WorkflowSeries | null> {
    try {
      return await this.mcpManager.callTool<WorkflowSeries>(this.serverId, 'get_series', {
        seriesId,
      });
    } catch (error) {
      console.error(`Failed to get series ${seriesId}:`, error);
      return null;
    }
  }

  /**
   * List all series
   */
  async listSeries(filter?: {
    status?: WorkflowSeries['status'];
    genre?: string;
  }): Promise<WorkflowSeries[]> {
    try {
      return await this.mcpManager.callTool<WorkflowSeries[]>(this.serverId, 'list_series', {
        filter: filter || {},
      });
    } catch (error) {
      console.error('Failed to list series:', error);
      return [];
    }
  }

  /**
   * Create new series
   */
  async createSeries(series: {
    name: string;
    genre: string;
    bookCount: number;
    metadata?: Record<string, any>;
  }): Promise<WorkflowSeries | null> {
    try {
      return await this.mcpManager.callTool<WorkflowSeries>(this.serverId, 'create_series', {
        series,
      });
    } catch (error) {
      console.error('Failed to create series:', error);
      return null;
    }
  }

  /**
   * Update series
   */
  async updateSeries(seriesId: number, updates: Partial<WorkflowSeries>): Promise<boolean> {
    try {
      await this.mcpManager.callTool(this.serverId, 'update_series', {
        seriesId,
        updates,
      });
      return true;
    } catch (error) {
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
  async getChapter(chapterId: number): Promise<WorkflowChapter | null> {
    try {
      return await this.mcpManager.callTool<WorkflowChapter>(this.serverId, 'get_chapter', {
        chapterId,
      });
    } catch (error) {
      console.error(`Failed to get chapter ${chapterId}:`, error);
      return null;
    }
  }

  /**
   * List chapters for a series
   */
  async listChapters(
    seriesId: number,
    filter?: {
      bookNumber?: number;
      status?: WorkflowChapter['status'];
    }
  ): Promise<WorkflowChapter[]> {
    try {
      return await this.mcpManager.callTool<WorkflowChapter[]>(this.serverId, 'list_chapters', {
        seriesId,
        filter: filter || {},
      });
    } catch (error) {
      console.error(`Failed to list chapters for series ${seriesId}:`, error);
      return [];
    }
  }

  /**
   * Create new chapter
   */
  async createChapter(chapter: {
    seriesId: number;
    bookNumber: number;
    chapterNumber: number;
    title: string;
    metadata?: Record<string, any>;
  }): Promise<WorkflowChapter | null> {
    try {
      return await this.mcpManager.callTool<WorkflowChapter>(this.serverId, 'create_chapter', {
        chapter,
      });
    } catch (error) {
      console.error('Failed to create chapter:', error);
      return null;
    }
  }

  /**
   * Update chapter
   */
  async updateChapter(chapterId: number, updates: Partial<WorkflowChapter>): Promise<boolean> {
    try {
      await this.mcpManager.callTool(this.serverId, 'update_chapter', {
        chapterId,
        updates,
      });
      return true;
    } catch (error) {
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
  async getPrompt(params: {
    type: WorkflowPrompt['type'];
    seriesId: number;
    chapterId?: number;
    context?: Record<string, any>;
  }): Promise<WorkflowPrompt | null> {
    try {
      return await this.mcpManager.callTool<WorkflowPrompt>(this.serverId, 'get_prompt', params);
    } catch (error) {
      console.error('Failed to get prompt:', error);
      return null;
    }
  }

  /**
   * Generate series planning prompt
   */
  async getSeriesPlanningPrompt(seriesId: number): Promise<string | null> {
    const prompt = await this.getPrompt({
      type: 'series-planning',
      seriesId,
    });
    return prompt?.content || null;
  }

  /**
   * Generate chapter drafting prompt
   */
  async getChapterDraftingPrompt(seriesId: number, chapterId: number): Promise<string | null> {
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
  async getRevisionPrompt(
    seriesId: number,
    chapterId: number,
    revisionType: string
  ): Promise<string | null> {
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
  async updateWorkflowState(update: WorkflowUpdate): Promise<boolean> {
    try {
      await this.mcpManager.callTool(this.serverId, 'update_workflow_state', update);
      return true;
    } catch (error) {
      console.error('Failed to update workflow state:', error);
      return false;
    }
  }

  /**
   * Mark chapter as in-progress
   */
  async startChapter(chapterId: number): Promise<boolean> {
    return await this.updateWorkflowState({
      chapterId,
      status: 'in-progress',
    });
  }

  /**
   * Mark chapter as completed
   */
  async completeChapter(chapterId: number, wordCount?: number): Promise<boolean> {
    return await this.updateWorkflowState({
      chapterId,
      status: 'completed',
      wordCount,
    });
  }

  /**
   * Mark chapter as failed
   */
  async failChapter(chapterId: number, errorMessage: string): Promise<boolean> {
    return await this.updateWorkflowState({
      chapterId,
      status: 'failed',
      metadata: { errorMessage },
    });
  }

  /**
   * Update chapter progress
   */
  async updateChapterProgress(chapterId: number, progress: number): Promise<boolean> {
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
  async getNextPendingChapter(seriesId: number): Promise<WorkflowChapter | null> {
    const chapters = await this.listChapters(seriesId, { status: 'pending' });
    return chapters.length > 0 ? chapters[0] : null;
  }

  /**
   * Get series statistics
   */
  async getSeriesStats(seriesId: number): Promise<{
    totalChapters: number;
    completedChapters: number;
    totalWords: number;
    progress: number;
  } | null> {
    try {
      return await this.mcpManager.callTool(this.serverId, 'get_series_stats', { seriesId });
    } catch (error) {
      console.error(`Failed to get stats for series ${seriesId}:`, error);
      return null;
    }
  }

  /**
   * Validate workflow state
   */
  async validateWorkflow(seriesId: number): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      return await this.mcpManager.callTool(this.serverId, 'validate_workflow', { seriesId });
    } catch (error) {
      console.error(`Failed to validate workflow for series ${seriesId}:`, error);
      return { valid: false, errors: [String(error)], warnings: [] };
    }
  }
}
