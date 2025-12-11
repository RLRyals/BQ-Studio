"use strict";
/**
 * Workflow - Represents a workflow instance
 * Manages stages, state, and execution flow
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workflow = void 0;
const Stage_1 = require("./Stage");
const types_1 = require("./types");
/**
 * Workflow class for managing workflow execution
 */
class Workflow {
    constructor(definition, data) {
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
    initializeStages() {
        for (const stageDef of this.definition.stages) {
            const stage = new Stage_1.Stage(stageDef, {
                workflowId: this.data.id || 0,
            });
            this.stages.set(stageDef.name, stage);
        }
    }
    /**
     * Get workflow ID
     */
    getId() {
        return this.data.id;
    }
    /**
     * Set workflow ID (used after database insert)
     */
    setId(id) {
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
    getProjectId() {
        return this.data.projectId;
    }
    /**
     * Get workflow type
     */
    getType() {
        return this.data.workflowType;
    }
    /**
     * Get workflow status
     */
    getStatus() {
        return this.data.status;
    }
    /**
     * Get workflow data
     */
    getData() {
        return { ...this.data };
    }
    /**
     * Get workflow state
     */
    getState() {
        return { ...this.data.state };
    }
    /**
     * Set workflow state
     */
    setState(state) {
        this.data.state = { ...this.data.state, ...state };
        this.data.updatedAt = new Date().toISOString();
    }
    /**
     * Get workflow progress (0-100)
     */
    getProgress() {
        return this.data.progress;
    }
    /**
     * Calculate and update workflow progress
     */
    updateProgress() {
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
    getCurrentStageName() {
        return this.data.currentStage;
    }
    /**
     * Get current stage instance
     */
    getCurrentStage() {
        return this.stages.get(this.data.currentStage);
    }
    /**
     * Get stage by name
     */
    getStage(name) {
        return this.stages.get(name);
    }
    /**
     * Get all stages
     */
    getStages() {
        return Array.from(this.stages.values()).sort((a, b) => a.getOrder() - b.getOrder());
    }
    /**
     * Get next stage
     */
    getNextStage() {
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
    getPreviousStage() {
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
    isPending() {
        return this.data.status === 'pending';
    }
    /**
     * Check if workflow is in progress
     */
    isInProgress() {
        return this.data.status === 'in_progress';
    }
    /**
     * Check if workflow is completed
     */
    isCompleted() {
        return this.data.status === 'completed';
    }
    /**
     * Check if workflow is failed
     */
    isFailed() {
        return this.data.status === 'failed';
    }
    /**
     * Check if workflow is paused
     */
    isPaused() {
        return this.data.status === 'paused';
    }
    /**
     * Start the workflow
     */
    start() {
        if (this.data.status === 'in_progress') {
            throw new types_1.WorkflowError('Workflow is already in progress', 'WORKFLOW_ALREADY_STARTED', this.data.id);
        }
        if (this.data.status === 'completed') {
            throw new types_1.WorkflowError('Cannot start completed workflow', 'WORKFLOW_ALREADY_COMPLETED', this.data.id);
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
    pause() {
        if (this.data.status !== 'in_progress') {
            throw new types_1.WorkflowError('Can only pause workflows that are in progress', 'WORKFLOW_NOT_IN_PROGRESS', this.data.id);
        }
        this.data.status = 'paused';
        this.data.pausedAt = new Date().toISOString();
        this.data.updatedAt = new Date().toISOString();
    }
    /**
     * Resume the workflow
     */
    resume() {
        if (this.data.status !== 'paused') {
            throw new types_1.WorkflowError('Can only resume paused workflows', 'WORKFLOW_NOT_PAUSED', this.data.id);
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
    complete() {
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
    fail(error) {
        this.data.status = 'failed';
        this.data.updatedAt = new Date().toISOString();
        this.setState({ error });
    }
    /**
     * Validate current stage
     */
    async validateCurrentStage(options) {
        if (options?.skipValidation) {
            return {
                valid: true,
                timestamp: new Date().toISOString(),
            };
        }
        const currentStage = this.getCurrentStage();
        if (!currentStage) {
            throw new types_1.WorkflowError('No current stage to validate', 'NO_CURRENT_STAGE', this.data.id);
        }
        return currentStage.validate(this.data.state);
    }
    /**
     * Advance to next stage
     */
    async advanceToNextStage(options) {
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
    skipCurrentStage() {
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
    jumpToStage(stageName) {
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
    getCompletedStageNames() {
        return this.getStages()
            .filter((stage) => stage.isCompleted() || stage.isSkipped())
            .map((stage) => stage.getName());
    }
    /**
     * Get visualization data
     */
    getVisualization() {
        const stages = this.getStages().map((stage) => {
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
    createSnapshot() {
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
    restoreFromSnapshot(snapshot) {
        this.data.status = snapshot.status;
        this.data.currentStage = snapshot.currentStage;
        this.data.state = { ...snapshot.state };
        this.data.progress = snapshot.progress;
        // Restore stage states
        for (const stageData of snapshot.stages) {
            const stage = this.getStage(stageData.name);
            if (stage) {
                const stageDef = stage.getDefinition();
                const restoredStage = new Stage_1.Stage(stageDef, stageData);
                this.stages.set(stageData.name, restoredStage);
            }
        }
    }
    /**
     * Convert to database format
     */
    toDatabase() {
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
    static fromDatabase(dbRecord, definition) {
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
exports.Workflow = Workflow;
