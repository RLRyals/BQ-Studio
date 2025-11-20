/**
 * Workflow - Represents a workflow instance
 * Manages stages, state, and execution flow
 */

import { Stage } from './Stage';
import {
  WorkflowDefinition,
  WorkflowData,
  WorkflowStatus,
  StageDefinition,
  StageTransitionResult,
  ValidationResult,
  WorkflowError,
  WorkflowVisualization,
  StageVisualization,
  WorkflowSnapshot,
  TransitionValidationOptions,
} from './types';

/**
 * Workflow class for managing workflow execution
 */
export class Workflow {
  private data: WorkflowData;
  private stages: Map<string, Stage>;
  private definition: WorkflowDefinition;

  constructor(definition: WorkflowDefinition, data?: Partial<WorkflowData>) {
    this.definition = definition;
    this.data = {
      id: data?.id,
      projectId: data?.projectId || 0,
      workflowType: definition.type,
      status: data?.status || 'pending',
      currentStage: data?.currentStage || definition.stages[0]?.name || '',
      stages: definition.stages,
      state: data?.state || {},
      progress: data?.progress || 0,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
      completedAt: data?.completedAt,
      pausedAt: data?.pausedAt,
    };

    // Initialize stages
    this.stages = new Map();
    this.initializeStages();
  }

  /**
   * Initialize stage instances
   */
  private initializeStages(): void {
    for (const stageDef of this.definition.stages) {
      const stage = new Stage(stageDef, {
        workflowId: this.data.id || 0,
      });
      this.stages.set(stageDef.name, stage);
    }
  }

  /**
   * Get workflow ID
   */
  getId(): number | undefined {
    return this.data.id;
  }

  /**
   * Set workflow ID (used after database insert)
   */
  setId(id: number): void {
    this.data.id = id;
    // Update all stages with the workflow ID
    for (const stage of this.stages.values()) {
      const stageData = stage.getData();
      stageData.workflowId = id;
    }
  }

  /**
   * Get project ID
   */
  getProjectId(): number {
    return this.data.projectId;
  }

  /**
   * Get workflow type
   */
  getType(): string {
    return this.data.workflowType;
  }

  /**
   * Get workflow status
   */
  getStatus(): WorkflowStatus {
    return this.data.status;
  }

  /**
   * Get workflow data
   */
  getData(): WorkflowData {
    return { ...this.data };
  }

  /**
   * Get workflow state
   */
  getState(): Record<string, any> {
    return { ...this.data.state };
  }

  /**
   * Set workflow state
   */
  setState(state: Record<string, any>): void {
    this.data.state = { ...this.data.state, ...state };
    this.data.updatedAt = new Date().toISOString();
  }

  /**
   * Get workflow progress (0-100)
   */
  getProgress(): number {
    return this.data.progress;
  }

  /**
   * Calculate and update workflow progress
   */
  updateProgress(): void {
    const totalStages = this.stages.size;
    if (totalStages === 0) {
      this.data.progress = 100;
      return;
    }

    let completedCount = 0;
    for (const stage of this.stages.values()) {
      if (stage.isCompleted() || stage.isSkipped()) {
        completedCount++;
      }
    }

    this.data.progress = Math.round((completedCount / totalStages) * 100);
    this.data.updatedAt = new Date().toISOString();
  }

  /**
   * Get current stage name
   */
  getCurrentStageName(): string {
    return this.data.currentStage;
  }

  /**
   * Get current stage instance
   */
  getCurrentStage(): Stage | undefined {
    return this.stages.get(this.data.currentStage);
  }

  /**
   * Get stage by name
   */
  getStage(name: string): Stage | undefined {
    return this.stages.get(name);
  }

  /**
   * Get all stages
   */
  getStages(): Stage[] {
    return Array.from(this.stages.values()).sort((a, b) => a.getOrder() - b.getOrder());
  }

  /**
   * Get next stage
   */
  getNextStage(): Stage | undefined {
    const currentStage = this.getCurrentStage();
    if (!currentStage) {
      return undefined;
    }

    const currentOrder = currentStage.getOrder();
    const stages = this.getStages();

    return stages.find((stage) => stage.getOrder() === currentOrder + 1);
  }

  /**
   * Get previous stage
   */
  getPreviousStage(): Stage | undefined {
    const currentStage = this.getCurrentStage();
    if (!currentStage) {
      return undefined;
    }

    const currentOrder = currentStage.getOrder();
    const stages = this.getStages();

    return stages.find((stage) => stage.getOrder() === currentOrder - 1);
  }

  /**
   * Check if workflow is pending
   */
  isPending(): boolean {
    return this.data.status === 'pending';
  }

  /**
   * Check if workflow is in progress
   */
  isInProgress(): boolean {
    return this.data.status === 'in_progress';
  }

  /**
   * Check if workflow is completed
   */
  isCompleted(): boolean {
    return this.data.status === 'completed';
  }

  /**
   * Check if workflow is failed
   */
  isFailed(): boolean {
    return this.data.status === 'failed';
  }

  /**
   * Check if workflow is paused
   */
  isPaused(): boolean {
    return this.data.status === 'paused';
  }

  /**
   * Start the workflow
   */
  start(): void {
    if (this.data.status === 'in_progress') {
      throw new WorkflowError(
        'Workflow is already in progress',
        'WORKFLOW_ALREADY_STARTED',
        this.data.id
      );
    }

    if (this.data.status === 'completed') {
      throw new WorkflowError(
        'Cannot start completed workflow',
        'WORKFLOW_ALREADY_COMPLETED',
        this.data.id
      );
    }

    this.data.status = 'in_progress';
    this.data.updatedAt = new Date().toISOString();

    // Start the first stage if it exists and is pending
    const currentStage = this.getCurrentStage();
    if (currentStage && currentStage.isPending()) {
      currentStage.start();
    }
  }

  /**
   * Pause the workflow
   */
  pause(): void {
    if (this.data.status !== 'in_progress') {
      throw new WorkflowError(
        'Can only pause workflows that are in progress',
        'WORKFLOW_NOT_IN_PROGRESS',
        this.data.id
      );
    }

    this.data.status = 'paused';
    this.data.pausedAt = new Date().toISOString();
    this.data.updatedAt = new Date().toISOString();
  }

  /**
   * Resume the workflow
   */
  resume(): void {
    if (this.data.status !== 'paused') {
      throw new WorkflowError(
        'Can only resume paused workflows',
        'WORKFLOW_NOT_PAUSED',
        this.data.id
      );
    }

    this.data.status = 'in_progress';
    this.data.pausedAt = undefined;
    this.data.updatedAt = new Date().toISOString();

    // Resume current stage if it's in progress
    const currentStage = this.getCurrentStage();
    if (currentStage && currentStage.isPending()) {
      currentStage.start();
    }
  }

  /**
   * Complete the workflow
   */
  complete(): void {
    if (this.data.status === 'completed') {
      return; // Already completed
    }

    this.data.status = 'completed';
    this.data.completedAt = new Date().toISOString();
    this.data.updatedAt = new Date().toISOString();
    this.data.progress = 100;
  }

  /**
   * Fail the workflow
   */
  fail(error: string): void {
    this.data.status = 'failed';
    this.data.updatedAt = new Date().toISOString();
    this.setState({ error });
  }

  /**
   * Validate current stage
   */
  async validateCurrentStage(options?: TransitionValidationOptions): Promise<ValidationResult> {
    if (options?.skipValidation) {
      return {
        valid: true,
        timestamp: new Date().toISOString(),
      };
    }

    const currentStage = this.getCurrentStage();
    if (!currentStage) {
      throw new WorkflowError(
        'No current stage to validate',
        'NO_CURRENT_STAGE',
        this.data.id
      );
    }

    return currentStage.validate(this.data.state);
  }

  /**
   * Advance to next stage
   */
  async advanceToNextStage(options?: TransitionValidationOptions): Promise<StageTransitionResult> {
    const currentStage = this.getCurrentStage();
    if (!currentStage) {
      return {
        success: false,
        fromStage: this.data.currentStage,
        error: 'No current stage found',
      };
    }

    // Validate current stage before advancing
    const validationResult = await this.validateCurrentStage(options);
    if (!validationResult.valid) {
      return {
        success: false,
        fromStage: currentStage.getName(),
        validationResult,
        error: validationResult.message || 'Stage validation failed',
      };
    }

    // Complete current stage
    if (currentStage.isInProgress()) {
      currentStage.complete();
    }

    // Get next stage
    const nextStage = this.getNextStage();
    if (!nextStage) {
      // No more stages, complete the workflow
      this.complete();
      return {
        success: true,
        fromStage: currentStage.getName(),
        toStage: undefined,
      };
    }

    // Check dependencies
    const completedStages = this.getCompletedStageNames();
    if (!nextStage.areDependenciesMet(completedStages)) {
      return {
        success: false,
        fromStage: currentStage.getName(),
        toStage: nextStage.getName(),
        error: `Stage dependencies not met: ${nextStage.getDependencies().join(', ')}`,
      };
    }

    // Transition to next stage
    this.data.currentStage = nextStage.getName();
    nextStage.start();
    this.updateProgress();

    return {
      success: true,
      fromStage: currentStage.getName(),
      toStage: nextStage.getName(),
      validationResult,
    };
  }

  /**
   * Skip current stage
   */
  skipCurrentStage(): StageTransitionResult {
    const currentStage = this.getCurrentStage();
    if (!currentStage) {
      return {
        success: false,
        fromStage: this.data.currentStage,
        error: 'No current stage found',
      };
    }

    if (!currentStage.canSkip()) {
      return {
        success: false,
        fromStage: currentStage.getName(),
        error: 'Current stage cannot be skipped',
      };
    }

    // Skip the stage
    currentStage.skip();

    // Get next stage
    const nextStage = this.getNextStage();
    if (!nextStage) {
      // No more stages, complete the workflow
      this.complete();
      return {
        success: true,
        fromStage: currentStage.getName(),
        toStage: undefined,
      };
    }

    // Transition to next stage
    this.data.currentStage = nextStage.getName();
    nextStage.start();
    this.updateProgress();

    return {
      success: true,
      fromStage: currentStage.getName(),
      toStage: nextStage.getName(),
    };
  }

  /**
   * Jump to a specific stage
   */
  jumpToStage(stageName: string): StageTransitionResult {
    const targetStage = this.getStage(stageName);
    if (!targetStage) {
      return {
        success: false,
        fromStage: this.data.currentStage,
        error: `Stage ${stageName} not found`,
      };
    }

    const currentStage = this.getCurrentStage();
    const fromStageName = currentStage?.getName() || this.data.currentStage;

    // Check dependencies
    const completedStages = this.getCompletedStageNames();
    if (!targetStage.areDependenciesMet(completedStages)) {
      return {
        success: false,
        fromStage: fromStageName,
        toStage: stageName,
        error: `Stage dependencies not met: ${targetStage.getDependencies().join(', ')}`,
      };
    }

    // Complete current stage if in progress
    if (currentStage && currentStage.isInProgress()) {
      currentStage.complete();
    }

    // Transition to target stage
    this.data.currentStage = stageName;
    if (targetStage.isPending()) {
      targetStage.start();
    }
    this.updateProgress();

    return {
      success: true,
      fromStage: fromStageName,
      toStage: stageName,
    };
  }

  /**
   * Get completed stage names
   */
  private getCompletedStageNames(): string[] {
    return this.getStages()
      .filter((stage) => stage.isCompleted() || stage.isSkipped())
      .map((stage) => stage.getName());
  }

  /**
   * Get visualization data
   */
  getVisualization(): WorkflowVisualization {
    const stages: StageVisualization[] = this.getStages().map((stage) => {
      const stageData = stage.getData();
      return {
        name: stage.getName(),
        order: stage.getOrder(),
        status: stage.getStatus(),
        description: stage.getDescription(),
        isCurrent: stage.getName() === this.data.currentStage,
        progress: stage.isCompleted() || stage.isSkipped() ? 100 : stage.isInProgress() ? 50 : 0,
        startedAt: stageData.startedAt,
        completedAt: stageData.completedAt,
      };
    });

    return {
      workflowId: this.data.id || 0,
      workflowType: this.data.workflowType,
      status: this.data.status,
      progress: this.data.progress,
      stages,
      currentStage: this.data.currentStage,
    };
  }

  /**
   * Create snapshot for resume capability
   */
  createSnapshot(): WorkflowSnapshot {
    return {
      workflowId: this.data.id || 0,
      status: this.data.status,
      currentStage: this.data.currentStage,
      state: { ...this.data.state },
      progress: this.data.progress,
      stages: this.getStages().map((stage) => stage.getData()),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Restore from snapshot
   */
  restoreFromSnapshot(snapshot: WorkflowSnapshot): void {
    this.data.status = snapshot.status;
    this.data.currentStage = snapshot.currentStage;
    this.data.state = { ...snapshot.state };
    this.data.progress = snapshot.progress;

    // Restore stage states
    for (const stageData of snapshot.stages) {
      const stage = this.getStage(stageData.name);
      if (stage) {
        const stageDef = stage.getDefinition();
        const restoredStage = new Stage(stageDef, stageData);
        this.stages.set(stageData.name, restoredStage);
      }
    }
  }

  /**
   * Convert to database format
   */
  toDatabase(): {
    project_id: number;
    workflow_type: string;
    status: WorkflowStatus;
    current_stage: string;
    stages_data: StageDefinition[];
    state: Record<string, any>;
    progress: number;
  } {
    return {
      project_id: this.data.projectId,
      workflow_type: this.data.workflowType,
      status: this.data.status,
      current_stage: this.data.currentStage,
      stages_data: this.data.stages,
      state: this.data.state,
      progress: this.data.progress,
    };
  }

  /**
   * Create workflow from database record
   */
  static fromDatabase(dbRecord: any, definition: WorkflowDefinition): Workflow {
    return new Workflow(definition, {
      id: dbRecord.id,
      projectId: dbRecord.project_id,
      status: dbRecord.status || 'pending',
      currentStage: dbRecord.current_stage,
      state: dbRecord.state || {},
      progress: dbRecord.progress || 0,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      completedAt: dbRecord.completed_at,
    });
  }
}
