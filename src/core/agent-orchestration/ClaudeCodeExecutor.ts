/**
 * Claude Code Executor
 * Spawns and manages Claude Code CLI process for headless execution
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import {
  ClaudeCodeExecutionConfig,
  ClaudeCodeExecutionResult,
  ExecutionError,
} from './types';

export class ClaudeCodeExecutor {
  private activeProcesses: Map<string, ChildProcess>;

  constructor() {
    this.activeProcesses = new Map();
  }

  /**
   * Execute a skill using Claude Code CLI
   */
  async execute(
    jobId: string,
    config: ClaudeCodeExecutionConfig,
    onOutput?: (output: string, isError: boolean) => void,
    onProgress?: (progress: number, phase: string) => void
  ): Promise<ClaudeCodeExecutionResult> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      try {
        // Build working directory path
        const workingDir = path.join(config.workspaceRoot, config.seriesDir);

        // Build Claude Code CLI arguments
        const args = this.buildClaudeCodeArgs(config);

        // Spawn Claude Code CLI process
        const claudeCode = spawn('claude-code', args, {
          cwd: workingDir,
          env: {
            ...process.env,
            CLAUDE_SESSION_TOKEN: config.sessionToken,
          },
          shell: process.platform === 'win32', // Use shell on Windows for better compatibility
        });

        // Store process reference
        this.activeProcesses.set(jobId, claudeCode);

        let stdoutData = '';
        let stderrData = '';
        const filesCreated: string[] = [];
        let tokensUsed = { input: 0, output: 0, total: 0 };

        // Handle stdout
        claudeCode.stdout?.on('data', (data: Buffer) => {
          const output = data.toString();
          stdoutData += output;

          // Forward to callback
          if (onOutput) {
            onOutput(output, false);
          }

          // Parse output for progress updates
          const progressMatch = output.match(/Progress: (\d+)%/);
          if (progressMatch && onProgress) {
            const progress = parseInt(progressMatch[1], 10);
            onProgress(progress, 'unknown');
          }

          // Parse output for phase updates
          const phaseMatch = output.match(/Phase: (.+)/);
          if (phaseMatch && onProgress) {
            onProgress(0, phaseMatch[1]);
          }

          // Parse output for token usage
          const tokenMatch = output.match(
            /Usage: (\d+) tokens \(input: (\d+), output: (\d+)\)/
          );
          if (tokenMatch) {
            tokensUsed = {
              total: parseInt(tokenMatch[1], 10),
              input: parseInt(tokenMatch[2], 10),
              output: parseInt(tokenMatch[3], 10),
            };
          }

          // Parse output for file creation
          const fileMatch = output.match(/Created file: (.+)/);
          if (fileMatch) {
            filesCreated.push(fileMatch[1]);
          }
        });

        // Handle stderr
        claudeCode.stderr?.on('data', (data: Buffer) => {
          const output = data.toString();
          stderrData += output;

          // Forward to callback
          if (onOutput) {
            onOutput(output, true);
          }
        });

        // Handle process exit
        claudeCode.on('close', (code: number | null) => {
          // Remove from active processes
          this.activeProcesses.delete(jobId);

          const duration = Date.now() - startTime;

          if (code === 0) {
            // Success
            resolve({
              success: true,
              output: stdoutData,
              tokensUsed,
              duration,
              filesCreated,
            });
          } else {
            // Failure
            const error: ExecutionError = {
              code: `EXIT_CODE_${code ?? 'UNKNOWN'}`,
              message: stderrData || 'Claude Code execution failed',
              recoverable: this.isRecoverable(code, stderrData),
            };

            resolve({
              success: false,
              output: stdoutData,
              tokensUsed,
              duration,
              filesCreated,
              error,
            });
          }
        });

        // Handle errors
        claudeCode.on('error', (err: Error) => {
          // Remove from active processes
          this.activeProcesses.delete(jobId);

          const duration = Date.now() - startTime;

          const error: ExecutionError = {
            code: 'SPAWN_ERROR',
            message: err.message,
            stack: err.stack,
            recoverable: false,
          };

          resolve({
            success: false,
            output: stdoutData,
            tokensUsed,
            duration,
            filesCreated,
            error,
          });
        });

        // Set timeout if configured
        if (config.timeout) {
          setTimeout(() => {
            if (this.activeProcesses.has(jobId)) {
              claudeCode.kill('SIGTERM');

              const error: ExecutionError = {
                code: 'TIMEOUT',
                message: `Execution timed out after ${config.timeout}ms`,
                recoverable: false,
              };

              resolve({
                success: false,
                output: stdoutData,
                tokensUsed,
                duration: Date.now() - startTime,
                filesCreated,
                error,
              });
            }
          }, config.timeout);
        }
      } catch (err) {
        const error = err as Error;
        reject({
          success: false,
          output: '',
          tokensUsed: { input: 0, output: 0, total: 0 },
          duration: Date.now() - startTime,
          filesCreated: [],
          error: {
            code: 'EXECUTION_ERROR',
            message: error.message,
            stack: error.stack,
            recoverable: false,
          },
        });
      }
    });
  }

  /**
   * Pause execution (send SIGSTOP)
   */
  pause(jobId: string): boolean {
    const process = this.activeProcesses.get(jobId);
    if (!process || !process.pid) {
      return false;
    }

    try {
      process.kill('SIGSTOP');
      return true;
    } catch (err) {
      console.error(`Failed to pause process ${process.pid}:`, err);
      return false;
    }
  }

  /**
   * Resume execution (send SIGCONT)
   */
  resume(jobId: string): boolean {
    const process = this.activeProcesses.get(jobId);
    if (!process || !process.pid) {
      return false;
    }

    try {
      process.kill('SIGCONT');
      return true;
    } catch (err) {
      console.error(`Failed to resume process ${process.pid}:`, err);
      return false;
    }
  }

  /**
   * Cancel execution (kill process)
   */
  cancel(jobId: string): boolean {
    const process = this.activeProcesses.get(jobId);
    if (!process) {
      return false;
    }

    try {
      process.kill('SIGTERM');
      this.activeProcesses.delete(jobId);
      return true;
    } catch (err) {
      console.error(`Failed to cancel process:`, err);
      return false;
    }
  }

  /**
   * Check if a job is currently executing
   */
  isExecuting(jobId: string): boolean {
    return this.activeProcesses.has(jobId);
  }

  /**
   * Get PID for a job
   */
  getPid(jobId: string): number | undefined {
    return this.activeProcesses.get(jobId)?.pid;
  }

  /**
   * Build Claude Code CLI arguments
   */
  private buildClaudeCodeArgs(config: ClaudeCodeExecutionConfig): string[] {
    const args: string[] = [];

    // Add headless flag (assumed - verify actual CLI)
    args.push('--headless');

    // Add auto-approve flag if enabled
    if (config.autoApprove) {
      args.push('--auto-approve');
    }

    // Execute skill command (assumed - verify actual CLI)
    args.push('execute-skill');
    args.push(config.skillName);

    // Add input
    args.push('--input');
    args.push(config.input);

    return args;
  }

  /**
   * Determine if error is recoverable
   */
  private isRecoverable(code: number | null, stderr: string): boolean {
    // Network-related errors are recoverable
    if (stderr.includes('ECONNREFUSED') || stderr.includes('ETIMEDOUT')) {
      return true;
    }

    // Rate limit errors are recoverable
    if (stderr.includes('rate limit') || stderr.includes('429')) {
      return true;
    }

    // Exit code 1 might be recoverable (depends on error)
    if (code === 1 && (stderr.includes('network') || stderr.includes('timeout'))) {
      return true;
    }

    // Non-zero exit codes are generally not recoverable
    return false;
  }

  /**
   * Cleanup all active processes
   */
  cleanup(): void {
    for (const [jobId, process] of this.activeProcesses.entries()) {
      try {
        process.kill('SIGTERM');
      } catch (err) {
        console.error(`Failed to kill process for job ${jobId}:`, err);
      }
    }
    this.activeProcesses.clear();
  }
}
