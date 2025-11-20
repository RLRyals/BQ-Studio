/**
 * WorkflowEngine - Orchestrates workflow execution
 * Manages workflow lifecycle, persistence, and events
 */

import { DatabaseService } from '../database-service';
import { Workflow } from './Workflow';
import { Stage } from './Stage';
import {
  WorkflowEngineConfig,
  WorkflowDefinition,
  CreateWorkflowOptions,
  ExecuteWorkflowOptions,
  WorkflowQueryFilter,
  WorkflowStatus,
  WorkflowEvent,
  WorkflowEventType,
  WorkflowEventEmitter,
  ResumeWorkflowOptions,
  WorkflowVisualization,
  StageTransitionResult,
  WorkflowError,
  TransitionValidationOptions,
} from './types';

/**
 * Workflow Engine for managing workflow execution
 */
export class WorkflowEngine {
  private db: DatabaseService;
  private eventEmitter?: WorkflowEventEmitter;
  private autoSave: boolean;
  private defaultStopOnError: boolean;
  private workflowDefinitions: Map<string, WorkflowDefinition>;
  private activeWorkflows: Map<number, Workflow>;

  constructor(config: WorkflowEngineConfig) {
    this.db = config.databaseService;
    this.eventEmitter = config.eventEmitter;
    this.autoSave = config.autoSave !== false; // Default true
    this.defaultStopOnError = config.defaultStopOnError !== false; // Default true
    this.workflowDefinitions = new Map();
    this.activeWorkflows = new Map();
  }

  /**
   * Register a workflow definition
   */
  registerWorkflowDefinition(definition: WorkflowDefinition): void {
    // Validate stages have unique names and sequential orders
    const stageNames = new Set<string>();
    const stageOrders = new Set<number>();

    for (const stage of definition.stages) {
      if (stageNames.has(stage.name)) {
        throw new Error(`Duplicate stage name: ${stage.name}`);
      }
      if (stageOrders.has(stage.order)) {
        throw new Error(`Duplicate stage order: ${stage.order}`);
      }
      stageNames.add(stage.name);
      stageOrders.add(stage.order);
    }

    this.workflowDefinitions.set(definition.type, definition);
  }

  /**
   * Get workflow definition
   */
  getWorkflowDefinition(type: string): WorkflowDefinition | undefined {
    return this.workflowDefinitions.get(type);
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(options: CreateWorkflowOptions): Promise<Workflow> {
    const definition = options.definition;

    // Validate definition is registered
    if (!this.workflowDefinitions.has(definition.type)) {
      this.registerWorkflowDefinition(definition);
    }

    // Create workflow instance
    const workflow = new Workflow(definition, {
      projectId: options.projectId,
      state: options.initialState || {},
    });

    // Persist to database
    const workflowId = await this.saveWorkflow(workflow);
    workflow.setId(workflowId);

    // Save stages
    await this.saveWorkflowStages(workflow);

    // Emit event
    await this.emitEvent({
      type: WorkflowEventType.WORKFLOW_CREATED,
      workflowId,
      timestamp: new Date().toISOString(),
      data: {
        status: workflow.getStatus(),
      },
    });

    // Cache workflow
    this.activeWorkflows.set(workflowId, workflow);

    return workflow;
  }

  /**
   * Load workflow from database
   */
  async loadWorkflow(workflowId: number): Promise<Workflow> {
    // Check cache first
    const cached = this.activeWorkflows.get(workflowId);
    if (cached) {
      return cached;
    }

    // Load from database
    const dbWorkflow = this.db.selectOne('workflows', {
      where: [{ field: 'id', operator: '=', value: workflowId }],
    });

    if (!dbWorkflow) {
      throw new WorkflowError(
        `Workflow ${workflowId} not found`,
        'WORKFLOW_NOT_FOUND',
        workflowId
      );
    }

    // Get workflow definition
    const definition = this.workflowDefinitions.get(dbWorkflow.workflow_type);
    if (!definition) {
      throw new WorkflowError(
        `Workflow definition not found for type: ${dbWorkflow.workflow_type}`,
        'DEFINITION_NOT_FOUND',
        workflowId
      );
    }

    // Create workflow instance
    const workflow = Workflow.fromDatabase(dbWorkflow, definition);

    // Load stages
    const dbStages = this.db.select('workflow_stages', {
      where: [{ field: 'workflow_id', operator: '=', value: workflowId }],
      orderBy: [{ field: 'stage_order', direction: 'ASC' }],
    });

    // Restore stage states
    for (const dbStage of dbStages) {
      const stage = workflow.getStage(dbStage.stage_name);
      if (stage) {
        const stageDef = stage.getDefinition();
        const restoredStage = Stage.fromDatabase(dbStage, stageDef);
        // Replace stage in workflow (accessing private property)
        (workflow as any).stages.set(dbStage.stage_name, restoredStage);
      }
    }

    // Cache workflow
    this.activeWorkflows.set(workflowId, workflow);

    return workflow;
  }

  /**
   * Save workflow to database
   */
  private async saveWorkflow(workflow: Workflow): Promise<number> {
    const dbData = workflow.toDatabase();
    const workflowId = workflow.getId();

    if (workflowId) {
      // Update existing workflow
      this.db.update('workflows', dbData, {
        where: [{ field: 'id', operator: '=', value: workflowId }],
      });
      return workflowId;
    } else {
      // Insert new workflow
      return this.db.insert('workflows', dbData);
    }
  }

  /**
   * Save workflow stages to database
   */
  private async saveWorkflowStages(workflow: Workflow): Promise<void> {
    const workflowId = workflow.getId();
    if (!workflowId) {
      throw new WorkflowError(
        'Cannot save stages for workflow without ID',
        'NO_WORKFLOW_ID'
      );
    }

    const stages = workflow.getStages();

    for (const stage of stages) {
      const stageData = stage.getData();
      const dbData = stage.toDatabase();

      if (stageData.id) {
        // Update existing stage
        this.db.update('workflow_stages', dbData, {
          where: [{ field: 'id', operator: '=', value: stageData.id }],
        });
      } else {
        // Insert new stage
        const stageId = this.db.insert('workflow_stages', dbData);
        // Update stage with ID
        (stage as any).data.id = stageId;
      }
    }
  }

  /**
   * Start a workflow
   */
  async startWorkflow(
    workflowId: number,
    options?: ExecuteWorkflowOptions
  ): Promise<void> {
    const workflow = await this.loadWorkflow(workflowId);

    // Start the workflow
    workflow.start();

    // Save state
    if (this.autoSave) {
      await this.saveWorkflow(workflow);
      await this.saveWorkflowStages(workflow);
    }

    // Emit event
    await this.emitEvent({
      type: WorkflowEventType.WORKFLOW_STARTED,
      workflowId,
      timestamp: new Date().toISOString(),
      data: {
        status: workflow.getStatus(),
        stageName: workflow.getCurrentStageName(),
      },
    });

    // Auto-advance if requested
    if (options?.autoAdvance) {
      await this.executeWorkflow(workflowId, options);
    }
  }

  /**
   * Execute workflow (auto-advance through stages)
   */
  async executeWorkflow(
    workflowId: number,
    options?: ExecuteWorkflowOptions
  ): Promise<void> {
    const workflow = await this.loadWorkflow(workflowId);
    const stopOnError = options?.stopOnError !== undefined
      ? options.stopOnError
      : this.defaultStopOnError;

    while (!workflow.isCompleted() && !workflow.isFailed() && !workflow.isPaused()) {
      const currentStage = workflow.getCurrentStage();
      if (!currentStage) {
        break;
      }

      // Emit stage started event
      await this.emitEvent({
        type: WorkflowEventType.STAGE_STARTED,
        workflowId,
        timestamp: new Date().toISOString(),
        data: {
          stageName: currentStage.getName(),
          stageStatus: currentStage.getStatus(),
        },
      });

      // Advance to next stage
      const result = await workflow.advanceToNextStage();

      if (!result.success) {
        // Stage transition failed
        currentStage.fail(result.error || 'Stage transition failed');
        workflow.fail(result.error || 'Stage transition failed');

        await this.emitEvent({
          type: WorkflowEventType.STAGE_FAILED,
          workflowId,
          timestamp: new Date().toISOString(),
          data: {
            stageName: currentStage.getName(),
            stageStatus: 'failed',
            error: result.error,
          },
        });

        await this.emitEvent({
          type: WorkflowEventType.WORKFLOW_FAILED,
          workflowId,
          timestamp: new Date().toISOString(),
          data: {
            status: 'failed',
            error: result.error,
          },
        });

        if (this.autoSave) {
          await this.saveWorkflow(workflow);
          await this.saveWorkflowStages(workflow);
        }

        if (stopOnError) {
          throw new WorkflowError(
            result.error || 'Stage transition failed',
            'STAGE_TRANSITION_FAILED',
            workflowId,
            currentStage.getName()
          );
        }

        break;
      }

      // Emit stage completed event
      await this.emitEvent({
        type: WorkflowEventType.STAGE_COMPLETED,
        workflowId,
        timestamp: new Date().toISOString(),
        data: {
          stageName: result.fromStage,
          stageStatus: 'completed',
        },
      });

      // Emit progress update
      await this.emitEvent({
        type: WorkflowEventType.PROGRESS_UPDATED,
        workflowId,
        timestamp: new Date().toISOString(),
        data: {
          progress: workflow.getProgress(),
        },
      });

      // Save state
      if (this.autoSave) {
        await this.saveWorkflow(workflow);
        await this.saveWorkflowStages(workflow);
      }

      // Check if workflow is complete
      if (!result.toStage) {
        await this.emitEvent({
          type: WorkflowEventType.WORKFLOW_COMPLETED,
          workflowId,
          timestamp: new Date().toISOString(),
          data: {
            status: 'completed',
            progress: 100,
          },
        });
        break;
      }
    }
  }

  /**
   * Advance workflow to next stage
   */
  async advanceStage(
    workflowId: number,
    options?: TransitionValidationOptions
  ): Promise<StageTransitionResult> {
    const workflow = await this.loadWorkflow(workflowId);
    const currentStage = workflow.getCurrentStage();

    if (!currentStage) {
      throw new WorkflowError(
        'No current stage to advance',
        'NO_CURRENT_STAGE',
        workflowId
      );
    }

    // Advance to next stage
    const result = await workflow.advanceToNextStage(options);

    // Emit events
    if (result.success) {
      await this.emitEvent({
        type: WorkflowEventType.STAGE_COMPLETED,
        workflowId,
        timestamp: new Date().toISOString(),
        data: {
          stageName: result.fromStage,
          stageStatus: 'completed',
        },
      });

      if (result.toStage) {
        await this.emitEvent({
          type: WorkflowEventType.STAGE_STARTED,
          workflowId,
          timestamp: new Date().toISOString(),
          data: {
            stageName: result.toStage,
            stageStatus: 'in_progress',
          },
        });
      } else {
        await this.emitEvent({
          type: WorkflowEventType.WORKFLOW_COMPLETED,
          workflowId,
          timestamp: new Date().toISOString(),
          data: {
            status: 'completed',
            progress: 100,
          },
        });
      }

      await this.emitEvent({
        type: WorkflowEventType.PROGRESS_UPDATED,
        workflowId,
        timestamp: new Date().toISOString(),
        data: {
          progress: workflow.getProgress(),
        },
      });
    } else {
      await this.emitEvent({
        type: WorkflowEventType.STAGE_FAILED,
        workflowId,
        timestamp: new Date().toISOString(),
        data: {
          stageName: currentStage.getName(),
          stageStatus: 'failed',
          error: result.error,
        },
      });
    }

    // Save state
    if (this.autoSave) {
      await this.saveWorkflow(workflow);
      await this.saveWorkflowStages(workflow);
    }

    return result;
  }

  /**
   * Pause a workflow
   */
  async pauseWorkflow(workflowId: number): Promise<void> {
    const workflow = await this.loadWorkflow(workflowId);
    workflow.pause();

    // Save state
    if (this.autoSave) {
      await this.saveWorkflow(workflow);
    }

    // Emit event
    await this.emitEvent({
      type: WorkflowEventType.WORKFLOW_PAUSED,
      workflowId,
      timestamp: new Date().toISOString(),
      data: {
        status: 'paused',
      },
    });
  }

  /**
   * Resume a workflow
   */
  async resumeWorkflow(
    workflowId: number,
    options?: ResumeWorkflowOptions
  ): Promise<void> {
    const workflow = await this.loadWorkflow(workflowId);

    // Jump to specific stage if requested
    if (options?.fromStage) {
      workflow.jumpToStage(options.fromStage);
    }

    // Reset current stage if requested
    if (options?.resetCurrentStage) {
      const currentStage = workflow.getCurrentStage();
      if (currentStage) {
        currentStage.reset();
      }
    }

    workflow.resume();

    // Save state
    if (this.autoSave) {
      await this.saveWorkflow(workflow);
      await this.saveWorkflowStages(workflow);
    }

    // Emit event
    await this.emitEvent({
      type: WorkflowEventType.WORKFLOW_RESUMED,
      workflowId,
      timestamp: new Date().toISOString(),
      data: {
        status: 'in_progress',
        stageName: workflow.getCurrentStageName(),
      },
    });
  }

  /**
   * Skip current stage
   */
  async skipStage(workflowId: number): Promise<StageTransitionResult> {
    const workflow = await this.loadWorkflow(workflowId);
    const currentStage = workflow.getCurrentStage();

    if (!currentStage) {
      throw new WorkflowError(
        'No current stage to skip',
        'NO_CURRENT_STAGE',
        workflowId
      );
    }

    const result = workflow.skipCurrentStage();

    // Emit events
    if (result.success) {
      await this.emitEvent({
        type: WorkflowEventType.STAGE_SKIPPED,
        workflowId,
        timestamp: new Date().toISOString(),
        data: {
          stageName: result.fromStage,
          stageStatus: 'skipped',
        },
      });

      if (result.toStage) {
        await this.emitEvent({
          type: WorkflowEventType.STAGE_STARTED,
          workflowId,
          timestamp: new Date().toISOString(),
          data: {
            stageName: result.toStage,
            stageStatus: 'in_progress',
          },
        });
      }

      await this.emitEvent({
        type: WorkflowEventType.PROGRESS_UPDATED,
        workflowId,
        timestamp: new Date().toISOString(),
        data: {
          progress: workflow.getProgress(),
        },
      });
    }

    // Save state
    if (this.autoSave) {
      await this.saveWorkflow(workflow);
      await this.saveWorkflowStages(workflow);
    }

    return result;
  }

  /**
   * Update workflow state
   */
  async updateWorkflowState(
    workflowId: number,
    state: Record<string, any>
  ): Promise<void> {
    const workflow = await this.loadWorkflow(workflowId);
    workflow.setState(state);

    // Save state
    if (this.autoSave) {
      await this.saveWorkflow(workflow);
    }
  }

  /**
   * Update stage data
   */
  async updateStageData(
    workflowId: number,
    stageName: string,
    data: Record<string, any>
  ): Promise<void> {
    const workflow = await this.loadWorkflow(workflowId);
    const stage = workflow.getStage(stageName);

    if (!stage) {
      throw new WorkflowError(
        `Stage ${stageName} not found`,
        'STAGE_NOT_FOUND',
        workflowId,
        stageName
      );
    }

    stage.setStageData(data);

    // Save state
    if (this.autoSave) {
      await this.saveWorkflowStages(workflow);
    }
  }

  /**
   * Get workflow visualization
   */
  async getWorkflowVisualization(workflowId: number): Promise<WorkflowVisualization> {
    const workflow = await this.loadWorkflow(workflowId);
    return workflow.getVisualization();
  }

  /**
   * Query workflows
   */
  async queryWorkflows(filter?: WorkflowQueryFilter): Promise<Workflow[]> {
    const conditions: any[] = [];

    if (filter?.projectId) {
      conditions.push({ field: 'project_id', operator: '=', value: filter.projectId });
    }

    if (filter?.workflowType) {
      conditions.push({ field: 'workflow_type', operator: '=', value: filter.workflowType });
    }

    if (filter?.status) {
      if (Array.isArray(filter.status)) {
        conditions.push({ field: 'status', operator: 'IN', value: filter.status });
      } else {
        conditions.push({ field: 'status', operator: '=', value: filter.status });
      }
    }

    if (filter?.currentStage) {
      conditions.push({ field: 'current_stage', operator: '=', value: filter.currentStage });
    }

    const dbWorkflows = this.db.select('workflows', {
      where: conditions.length > 0 ? conditions : undefined,
      orderBy: [{ field: 'created_at', direction: 'DESC' }],
    });

    const workflows: Workflow[] = [];

    for (const dbWorkflow of dbWorkflows) {
      const definition = this.workflowDefinitions.get(dbWorkflow.workflow_type);
      if (definition) {
        const workflow = await this.loadWorkflow(dbWorkflow.id);
        workflows.push(workflow);
      }
    }

    return workflows;
  }

  /**
   * Get workflow count by status
   */
  async getWorkflowStats(projectId?: number): Promise<Record<WorkflowStatus, number>> {
    const stats: Record<WorkflowStatus, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      failed: 0,
      paused: 0,
    };

    const conditions: any[] = [];
    if (projectId) {
      conditions.push({ field: 'project_id', operator: '=', value: projectId });
    }

    const statuses: WorkflowStatus[] = ['pending', 'in_progress', 'completed', 'failed', 'paused'];

    for (const status of statuses) {
      const statusConditions = [...conditions, { field: 'status', operator: '=', value: status }];
      stats[status] = this.db.count('workflows', {
        where: statusConditions,
      });
    }

    return stats;
  }

  /**
   * Emit workflow event
   */
  private async emitEvent(event: WorkflowEvent): Promise<void> {
    if (this.eventEmitter) {
      try {
        await this.eventEmitter.emit(event);
      } catch (error) {
        console.error('Failed to emit workflow event:', error);
        // Don't throw - event emission failures shouldn't break workflow execution
      }
    }
  }

  /**
   * Clear workflow cache
   */
  clearCache(workflowId?: number): void {
    if (workflowId) {
      this.activeWorkflows.delete(workflowId);
    } else {
      this.activeWorkflows.clear();
    }
  }
}
