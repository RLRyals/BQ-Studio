/**
 * Stage - Represents a single stage in a workflow
 * Handles validation, state management, and transitions
 */

import {
  StageDefinition,
  StageData,
  StageStatus,
  ValidationResult,
  ValidationFunction,
  StageError,
} from './types';

/**
 * Stage class for managing workflow stages
 */
export class Stage {
  private definition: StageDefinition;
  private data: StageData;

  constructor(definition: StageDefinition, data?: Partial<StageData>) {
    this.definition = definition;
    this.data = {
      workflowId: data?.workflowId || 0,
      name: definition.name,
      order: definition.order,
      status: data?.status || 'pending',
      data: data?.data || {},
      validationResult: data?.validationResult,
      startedAt: data?.startedAt,
      completedAt: data?.completedAt,
      id: data?.id,
    };
  }

  /**
   * Get stage name
   */
  getName(): string {
    return this.definition.name;
  }

  /**
   * Get stage order
   */
  getOrder(): number {
    return this.definition.order;
  }

  /**
   * Get stage status
   */
  getStatus(): StageStatus {
    return this.data.status;
  }

  /**
   * Get stage definition
   */
  getDefinition(): StageDefinition {
    return { ...this.definition };
  }

  /**
   * Get stage data
   */
  getData(): StageData {
    return { ...this.data };
  }

  /**
   * Get stage-specific data
   */
  getStageData(): Record<string, any> {
    return { ...this.data.data };
  }

  /**
   * Set stage-specific data
   */
  setStageData(data: Record<string, any>): void {
    this.data.data = { ...this.data.data, ...data };
  }

  /**
   * Check if stage is pending
   */
  isPending(): boolean {
    return this.data.status === 'pending';
  }

  /**
   * Check if stage is in progress
   */
  isInProgress(): boolean {
    return this.data.status === 'in_progress';
  }

  /**
   * Check if stage is completed
   */
  isCompleted(): boolean {
    return this.data.status === 'completed';
  }

  /**
   * Check if stage is skipped
   */
  isSkipped(): boolean {
    return this.data.status === 'skipped';
  }

  /**
   * Check if stage is failed
   */
  isFailed(): boolean {
    return this.data.status === 'failed';
  }

  /**
   * Check if stage can be skipped
   */
  canSkip(): boolean {
    return this.definition.allowSkip === true;
  }

  /**
   * Start the stage
   */
  start(): void {
    if (this.data.status === 'in_progress') {
      throw new StageError(
        `Stage ${this.definition.name} is already in progress`,
        'STAGE_ALREADY_STARTED',
        this.definition.name
      );
    }

    if (this.data.status === 'completed') {
      throw new StageError(
        `Stage ${this.definition.name} is already completed`,
        'STAGE_ALREADY_COMPLETED',
        this.definition.name
      );
    }

    this.data.status = 'in_progress';
    this.data.startedAt = new Date().toISOString();
  }

  /**
   * Complete the stage
   */
  complete(): void {
    if (this.data.status !== 'in_progress') {
      throw new StageError(
        `Cannot complete stage ${this.definition.name} that is not in progress`,
        'STAGE_NOT_IN_PROGRESS',
        this.definition.name
      );
    }

    this.data.status = 'completed';
    this.data.completedAt = new Date().toISOString();
  }

  /**
   * Skip the stage
   */
  skip(): void {
    if (!this.canSkip()) {
      throw new StageError(
        `Stage ${this.definition.name} cannot be skipped`,
        'STAGE_CANNOT_SKIP',
        this.definition.name
      );
    }

    this.data.status = 'skipped';
    this.data.completedAt = new Date().toISOString();
  }

  /**
   * Fail the stage
   */
  fail(error: string): void {
    this.data.status = 'failed';
    this.data.completedAt = new Date().toISOString();
    this.data.validationResult = {
      valid: false,
      message: error,
      errors: [error],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset the stage to pending
   */
  reset(): void {
    this.data.status = 'pending';
    this.data.startedAt = undefined;
    this.data.completedAt = undefined;
    this.data.validationResult = undefined;
  }

  /**
   * Validate the stage
   */
  async validate(workflowState: Record<string, any>): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      timestamp: new Date().toISOString(),
    };

    // If no validation function, stage is valid
    if (!this.definition.validation) {
      this.data.validationResult = result;
      return result;
    }

    try {
      const validationResult = await this.definition.validation(
        this.data.data,
        workflowState
      );

      if (validationResult === true) {
        result.valid = true;
      } else if (validationResult === false) {
        result.valid = false;
        result.message = 'Validation failed';
        result.errors = ['Validation failed'];
      } else {
        // String error message
        result.valid = false;
        result.message = validationResult;
        result.errors = [validationResult];
      }
    } catch (error) {
      result.valid = false;
      result.message = error instanceof Error ? error.message : 'Validation error';
      result.errors = [result.message];
    }

    this.data.validationResult = result;
    return result;
  }

  /**
   * Get validation result
   */
  getValidationResult(): ValidationResult | undefined {
    return this.data.validationResult;
  }

  /**
   * Check if stage has dependencies
   */
  hasDependencies(): boolean {
    return (
      this.definition.dependencies !== undefined &&
      this.definition.dependencies.length > 0
    );
  }

  /**
   * Get stage dependencies
   */
  getDependencies(): string[] {
    return this.definition.dependencies || [];
  }

  /**
   * Check if dependencies are met
   */
  areDependenciesMet(completedStages: string[]): boolean {
    if (!this.hasDependencies()) {
      return true;
    }

    const dependencies = this.getDependencies();
    return dependencies.every((dep) => completedStages.includes(dep));
  }

  /**
   * Get stage description
   */
  getDescription(): string | undefined {
    return this.definition.description;
  }

  /**
   * Get stage metadata
   */
  getMetadata(): Record<string, any> | undefined {
    return this.definition.metadata;
  }

  /**
   * Convert stage to database format
   */
  toDatabase(): {
    workflow_id: number;
    stage_name: string;
    stage_order: number;
    status: StageStatus;
    data: Record<string, any>;
    validation_result?: ValidationResult;
    started_at?: string;
    completed_at?: string;
  } {
    return {
      workflow_id: this.data.workflowId,
      stage_name: this.data.name,
      stage_order: this.data.order,
      status: this.data.status,
      data: this.data.data,
      validation_result: this.data.validationResult,
      started_at: this.data.startedAt,
      completed_at: this.data.completedAt,
    };
  }

  /**
   * Create stage from database record
   */
  static fromDatabase(
    dbRecord: any,
    definition: StageDefinition
  ): Stage {
    return new Stage(definition, {
      id: dbRecord.id,
      workflowId: dbRecord.workflow_id,
      name: dbRecord.stage_name,
      order: dbRecord.stage_order,
      status: dbRecord.status,
      data: dbRecord.data || {},
      validationResult: dbRecord.validation_result,
      startedAt: dbRecord.started_at,
      completedAt: dbRecord.completed_at,
    });
  }
}
