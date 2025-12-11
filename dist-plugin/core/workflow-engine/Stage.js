"use strict";
/**
 * Stage - Represents a single stage in a workflow
 * Handles validation, state management, and transitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stage = void 0;
const types_1 = require("./types");
/**
 * Stage class for managing workflow stages
 */
class Stage {
    constructor(definition, data) {
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
    getName() {
        return this.definition.name;
    }
    /**
     * Get stage order
     */
    getOrder() {
        return this.definition.order;
    }
    /**
     * Get stage status
     */
    getStatus() {
        return this.data.status;
    }
    /**
     * Get stage definition
     */
    getDefinition() {
        return { ...this.definition };
    }
    /**
     * Get stage data
     */
    getData() {
        return { ...this.data };
    }
    /**
     * Get stage-specific data
     */
    getStageData() {
        return { ...this.data.data };
    }
    /**
     * Set stage-specific data
     */
    setStageData(data) {
        this.data.data = { ...this.data.data, ...data };
    }
    /**
     * Check if stage is pending
     */
    isPending() {
        return this.data.status === 'pending';
    }
    /**
     * Check if stage is in progress
     */
    isInProgress() {
        return this.data.status === 'in_progress';
    }
    /**
     * Check if stage is completed
     */
    isCompleted() {
        return this.data.status === 'completed';
    }
    /**
     * Check if stage is skipped
     */
    isSkipped() {
        return this.data.status === 'skipped';
    }
    /**
     * Check if stage is failed
     */
    isFailed() {
        return this.data.status === 'failed';
    }
    /**
     * Check if stage can be skipped
     */
    canSkip() {
        return this.definition.allowSkip === true;
    }
    /**
     * Start the stage
     */
    start() {
        if (this.data.status === 'in_progress') {
            throw new types_1.StageError(`Stage ${this.definition.name} is already in progress`, 'STAGE_ALREADY_STARTED', this.definition.name);
        }
        if (this.data.status === 'completed') {
            throw new types_1.StageError(`Stage ${this.definition.name} is already completed`, 'STAGE_ALREADY_COMPLETED', this.definition.name);
        }
        this.data.status = 'in_progress';
        this.data.startedAt = new Date().toISOString();
    }
    /**
     * Complete the stage
     */
    complete() {
        if (this.data.status !== 'in_progress') {
            throw new types_1.StageError(`Cannot complete stage ${this.definition.name} that is not in progress`, 'STAGE_NOT_IN_PROGRESS', this.definition.name);
        }
        this.data.status = 'completed';
        this.data.completedAt = new Date().toISOString();
    }
    /**
     * Skip the stage
     */
    skip() {
        if (!this.canSkip()) {
            throw new types_1.StageError(`Stage ${this.definition.name} cannot be skipped`, 'STAGE_CANNOT_SKIP', this.definition.name);
        }
        this.data.status = 'skipped';
        this.data.completedAt = new Date().toISOString();
    }
    /**
     * Fail the stage
     */
    fail(error) {
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
    reset() {
        this.data.status = 'pending';
        this.data.startedAt = undefined;
        this.data.completedAt = undefined;
        this.data.validationResult = undefined;
    }
    /**
     * Validate the stage
     */
    async validate(workflowState) {
        const result = {
            valid: true,
            timestamp: new Date().toISOString(),
        };
        // If no validation function, stage is valid
        if (!this.definition.validation) {
            this.data.validationResult = result;
            return result;
        }
        try {
            const validationResult = await this.definition.validation(this.data.data, workflowState);
            if (validationResult === true) {
                result.valid = true;
            }
            else if (validationResult === false) {
                result.valid = false;
                result.message = 'Validation failed';
                result.errors = ['Validation failed'];
            }
            else {
                // String error message
                result.valid = false;
                result.message = validationResult;
                result.errors = [validationResult];
            }
        }
        catch (error) {
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
    getValidationResult() {
        return this.data.validationResult;
    }
    /**
     * Check if stage has dependencies
     */
    hasDependencies() {
        return (this.definition.dependencies !== undefined &&
            this.definition.dependencies.length > 0);
    }
    /**
     * Get stage dependencies
     */
    getDependencies() {
        return this.definition.dependencies || [];
    }
    /**
     * Check if dependencies are met
     */
    areDependenciesMet(completedStages) {
        if (!this.hasDependencies()) {
            return true;
        }
        const dependencies = this.getDependencies();
        return dependencies.every((dep) => completedStages.includes(dep));
    }
    /**
     * Get stage description
     */
    getDescription() {
        return this.definition.description;
    }
    /**
     * Get stage metadata
     */
    getMetadata() {
        return this.definition.metadata;
    }
    /**
     * Convert stage to database format
     */
    toDatabase() {
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
    static fromDatabase(dbRecord, definition) {
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
exports.Stage = Stage;
