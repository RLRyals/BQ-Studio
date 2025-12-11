"use strict";
/**
 * Workflow Engine Types
 * Type definitions for workflow orchestration system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StageError = exports.WorkflowError = exports.WorkflowEventType = void 0;
// ============================================================================
// Event Types
// ============================================================================
/**
 * Workflow event types
 */
var WorkflowEventType;
(function (WorkflowEventType) {
    WorkflowEventType["WORKFLOW_CREATED"] = "workflow:created";
    WorkflowEventType["WORKFLOW_STARTED"] = "workflow:started";
    WorkflowEventType["WORKFLOW_COMPLETED"] = "workflow:completed";
    WorkflowEventType["WORKFLOW_FAILED"] = "workflow:failed";
    WorkflowEventType["WORKFLOW_PAUSED"] = "workflow:paused";
    WorkflowEventType["WORKFLOW_RESUMED"] = "workflow:resumed";
    WorkflowEventType["STAGE_STARTED"] = "stage:started";
    WorkflowEventType["STAGE_COMPLETED"] = "stage:completed";
    WorkflowEventType["STAGE_FAILED"] = "stage:failed";
    WorkflowEventType["STAGE_SKIPPED"] = "stage:skipped";
    WorkflowEventType["STAGE_VALIDATED"] = "stage:validated";
    WorkflowEventType["PROGRESS_UPDATED"] = "progress:updated";
})(WorkflowEventType || (exports.WorkflowEventType = WorkflowEventType = {}));
// ============================================================================
// Error Types
// ============================================================================
/**
 * Workflow error class
 */
class WorkflowError extends Error {
    constructor(message, code, workflowId, stageName) {
        super(message);
        this.code = code;
        this.workflowId = workflowId;
        this.stageName = stageName;
        this.name = 'WorkflowError';
    }
}
exports.WorkflowError = WorkflowError;
/**
 * Stage error class
 */
class StageError extends Error {
    constructor(message, code, stageName, validationResult) {
        super(message);
        this.code = code;
        this.stageName = stageName;
        this.validationResult = validationResult;
        this.name = 'StageError';
    }
}
exports.StageError = StageError;
