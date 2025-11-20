/**
 * Workflow Engine Types
 * Type definitions for workflow orchestration system
 */

// ============================================================================
// Workflow Status Types
// ============================================================================

export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';

// ============================================================================
// Stage Types
// ============================================================================

/**
 * Stage definition in a workflow
 */
export interface StageDefinition {
  name: string;
  order: number;
  description?: string;
  validation?: ValidationFunction;
  dependencies?: string[]; // Names of stages that must complete first
  allowSkip?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Validation function for a stage
 * Returns true if valid, false or error message if invalid
 */
export type ValidationFunction = (
  stageData: Record<string, any>,
  workflowState: Record<string, any>
) => boolean | string | Promise<boolean | string>;

/**
 * Stage validation result
 */
export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: string[];
  warnings?: string[];
  timestamp: string;
}

/**
 * Stage data stored in database
 */
export interface StageData {
  id?: number;
  workflowId: number;
  name: string;
  order: number;
  status: StageStatus;
  data: Record<string, any>;
  validationResult?: ValidationResult;
  startedAt?: string;
  completedAt?: string;
}

// ============================================================================
// Workflow Types
// ============================================================================

/**
 * Workflow definition/template
 */
export interface WorkflowDefinition {
  type: string;
  name: string;
  description?: string;
  stages: StageDefinition[];
  allowBranching?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Workflow instance data
 */
export interface WorkflowData {
  id?: number;
  projectId: number;
  workflowType: string;
  status: WorkflowStatus;
  currentStage: string;
  stages: StageDefinition[];
  state: Record<string, any>;
  progress: number; // 0-100
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  pausedAt?: string;
}

/**
 * Workflow creation options
 */
export interface CreateWorkflowOptions {
  projectId: number;
  definition: WorkflowDefinition;
  initialState?: Record<string, any>;
}

/**
 * Workflow execution options
 */
export interface ExecuteWorkflowOptions {
  autoAdvance?: boolean; // Automatically advance through stages
  stopOnError?: boolean; // Stop execution on stage error
  eventEmitter?: WorkflowEventEmitter;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Workflow event types
 */
export enum WorkflowEventType {
  WORKFLOW_CREATED = 'workflow:created',
  WORKFLOW_STARTED = 'workflow:started',
  WORKFLOW_COMPLETED = 'workflow:completed',
  WORKFLOW_FAILED = 'workflow:failed',
  WORKFLOW_PAUSED = 'workflow:paused',
  WORKFLOW_RESUMED = 'workflow:resumed',
  STAGE_STARTED = 'stage:started',
  STAGE_COMPLETED = 'stage:completed',
  STAGE_FAILED = 'stage:failed',
  STAGE_SKIPPED = 'stage:skipped',
  STAGE_VALIDATED = 'stage:validated',
  PROGRESS_UPDATED = 'progress:updated',
}

/**
 * Workflow event data
 */
export interface WorkflowEvent {
  type: WorkflowEventType;
  workflowId: number;
  timestamp: string;
  data: {
    status?: WorkflowStatus;
    stageName?: string;
    stageStatus?: StageStatus;
    progress?: number;
    error?: string;
    metadata?: Record<string, any>;
  };
}

/**
 * Event emitter interface
 */
export interface WorkflowEventEmitter {
  emit(event: WorkflowEvent): void | Promise<void>;
}

// ============================================================================
// Stage Transition Types
// ============================================================================

/**
 * Stage transition result
 */
export interface StageTransitionResult {
  success: boolean;
  fromStage: string;
  toStage?: string;
  error?: string;
  validationResult?: ValidationResult;
}

/**
 * Transition validation options
 */
export interface TransitionValidationOptions {
  skipValidation?: boolean;
  allowSkip?: boolean;
}

// ============================================================================
// Workflow Engine Configuration
// ============================================================================

/**
 * Workflow engine configuration
 */
export interface WorkflowEngineConfig {
  databaseService: any; // DatabaseService instance
  eventEmitter?: WorkflowEventEmitter;
  autoSave?: boolean; // Auto-save state after each transition
  defaultStopOnError?: boolean;
}

// ============================================================================
// Query and Filter Types
// ============================================================================

/**
 * Workflow query filters
 */
export interface WorkflowQueryFilter {
  projectId?: number;
  workflowType?: string;
  status?: WorkflowStatus | WorkflowStatus[];
  currentStage?: string;
}

/**
 * Workflow visualization data
 */
export interface WorkflowVisualization {
  workflowId: number;
  workflowType: string;
  status: WorkflowStatus;
  progress: number;
  stages: StageVisualization[];
  currentStage: string;
}

/**
 * Stage visualization data
 */
export interface StageVisualization {
  name: string;
  order: number;
  status: StageStatus;
  description?: string;
  isCurrent: boolean;
  progress: number; // 0-100 for this stage
  startedAt?: string;
  completedAt?: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Workflow error class
 */
export class WorkflowError extends Error {
  constructor(
    message: string,
    public code: string,
    public workflowId?: number,
    public stageName?: string
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

/**
 * Stage error class
 */
export class StageError extends Error {
  constructor(
    message: string,
    public code: string,
    public stageName: string,
    public validationResult?: ValidationResult
  ) {
    super(message);
    this.name = 'StageError';
  }
}

// ============================================================================
// Resume and Recovery Types
// ============================================================================

/**
 * Workflow resume options
 */
export interface ResumeWorkflowOptions {
  fromStage?: string; // Resume from specific stage
  resetCurrentStage?: boolean; // Reset current stage to pending
}

/**
 * Workflow snapshot for resume capability
 */
export interface WorkflowSnapshot {
  workflowId: number;
  status: WorkflowStatus;
  currentStage: string;
  state: Record<string, any>;
  progress: number;
  stages: StageData[];
  timestamp: string;
}
