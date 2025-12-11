"use strict";
/**
 * Mock Claude Code Executor (For Testing)
 * Simulates Claude Code CLI behavior for testing without actual CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockClaudeCodeExecutor = void 0;
class MockClaudeCodeExecutor {
    constructor() {
        this.activeExecutions = new Map();
    }
    /**
     * Execute a skill (mock version with simulated progress)
     */
    async execute(jobId, config, onOutput, onProgress) {
        const startTime = Date.now();
        return new Promise((resolve) => {
            let progress = 0;
            const phases = [
                'Intake & Genre Identification',
                'Market Research & Trend Analysis',
                'Genre Pack Selection',
                'Series Architecture',
                'Book-Level Planning',
                'Commercial Validation',
                'Handoff & Documentation',
            ];
            let currentPhaseIndex = 0;
            // Simulate progress updates
            const interval = setInterval(() => {
                if (progress >= 100) {
                    clearInterval(interval);
                    this.activeExecutions.delete(jobId);
                    // Final output
                    if (onOutput) {
                        onOutput('Execution completed successfully', false);
                        onOutput('Usage: 45,200 tokens (input: 25,450, output: 19,750)', false);
                    }
                    resolve({
                        success: true,
                        output: 'Mock execution completed successfully',
                        tokensUsed: {
                            input: 25450,
                            output: 19750,
                            total: 45200,
                        },
                        duration: Date.now() - startTime,
                        filesCreated: [
                            'market-research/MARKET_RESEARCH_test.md',
                            'series-planning/SERIES_PLAN_test.md',
                        ],
                    });
                    return;
                }
                // Update progress
                progress += 5;
                const phaseProgress = Math.floor((progress / 100) * phases.length);
                currentPhaseIndex = Math.min(phaseProgress, phases.length - 1);
                const currentPhase = phases[currentPhaseIndex];
                if (onProgress) {
                    onProgress(progress, currentPhase);
                }
                if (onOutput) {
                    onOutput(`[Phase] ${currentPhase}`, false);
                    onOutput(`Progress: ${progress}%`, false);
                }
            }, 2000); // Update every 2 seconds
            this.activeExecutions.set(jobId, interval);
        });
    }
    pause(jobId) {
        const interval = this.activeExecutions.get(jobId);
        if (interval) {
            clearInterval(interval);
            return true;
        }
        return false;
    }
    resume(jobId) {
        // In mock, just return true
        return true;
    }
    cancel(jobId) {
        const interval = this.activeExecutions.get(jobId);
        if (interval) {
            clearInterval(interval);
            this.activeExecutions.delete(jobId);
            return true;
        }
        return false;
    }
    isExecuting(jobId) {
        return this.activeExecutions.has(jobId);
    }
    cleanup() {
        for (const interval of this.activeExecutions.values()) {
            clearInterval(interval);
        }
        this.activeExecutions.clear();
    }
}
exports.MockClaudeCodeExecutor = MockClaudeCodeExecutor;
