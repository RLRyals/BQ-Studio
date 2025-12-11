/**
 * IPC Handlers for Agent Execution
 * Main process handlers for agent orchestration
 */

import { ipcMain, BrowserWindow } from 'electron';
import { AgentOrchestrationService } from '../../core/agent-orchestration';
import { ClaudeCodeInstaller } from '../../core/agent-orchestration/ClaudeCodeInstaller';
import { WorkspaceService } from '../../core/workspace-service/WorkspaceService';
import type {
  ExecutionJob,
  ExecutionQueue,
  AgentExecutionEvent,
  ClaudeSession,
} from '../../core/agent-orchestration/types';
import type { ClaudeCodeInfo } from '../../core/agent-orchestration/ClaudeCodeInstaller';

let orchestrationService: AgentOrchestrationService | null = null;

/**
 * Initialize orchestration service
 */
function getOrchestrationService(): AgentOrchestrationService {
  if (!orchestrationService) {
    const workspaceService = WorkspaceService.getInstance();
    const workspacePath = workspaceService.getWorkspacePath();

    if (!workspacePath) {
      throw new Error('Workspace not configured. Please set up your workspace first.');
    }

    orchestrationService = new AgentOrchestrationService(workspacePath, 3);

    // Forward events to renderer
    orchestrationService.on('agent-execution', (event: AgentExecutionEvent) => {
      const windows = BrowserWindow.getAllWindows();
      windows.forEach((win) => {
        win.webContents.send('agent-execution:event', event);
      });
    });
  }

  return orchestrationService;
}

/**
 * Register all IPC handlers
 */
export function registerAgentExecutionHandlers(): void {
  /**
   * Create new execution job
   */
  ipcMain.handle(
    'agent-execution:create-job',
    async (
      _event,
      params: {
        seriesId: number;
        seriesName: string;
        skillName: string;
        userPrompt: string;
      }
    ): Promise<string> => {
      try {
        const service = getOrchestrationService();
        const jobId = await service.createJob(
          params.seriesId,
          params.seriesName,
          params.skillName,
          params.userPrompt
        );
        return jobId;
      } catch (error) {
        const err = error as Error;
        throw new Error(`Failed to create job: ${err.message}`);
      }
    }
  );

  /**
   * Pause a job
   */
  ipcMain.handle('agent-execution:pause-job', async (_event, jobId: string): Promise<void> => {
    try {
      const service = getOrchestrationService();
      await service.pauseJob(jobId);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to pause job: ${err.message}`);
    }
  });

  /**
   * Resume a job
   */
  ipcMain.handle('agent-execution:resume-job', async (_event, jobId: string): Promise<void> => {
    try {
      const service = getOrchestrationService();
      await service.resumeJob(jobId);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to resume job: ${err.message}`);
    }
  });

  /**
   * Cancel a job
   */
  ipcMain.handle('agent-execution:cancel-job', async (_event, jobId: string): Promise<void> => {
    try {
      const service = getOrchestrationService();
      await service.cancelJob(jobId);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to cancel job: ${err.message}`);
    }
  });

  /**
   * Get queue status
   */
  ipcMain.handle('agent-execution:get-queue-status', async (): Promise<ExecutionQueue> => {
    try {
      const service = getOrchestrationService();
      return service.getQueueStatus();
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to get queue status: ${err.message}`);
    }
  });

  /**
   * Get job by ID
   */
  ipcMain.handle(
    'agent-execution:get-job',
    async (_event, jobId: string): Promise<ExecutionJob | null> => {
      try {
        const service = getOrchestrationService();
        const job = service.getJob(jobId);
        return job || null;
      } catch (error) {
        const err = error as Error;
        throw new Error(`Failed to get job: ${err.message}`);
      }
    }
  );

  /**
   * Get jobs for a series
   */
  ipcMain.handle(
    'agent-execution:get-series-jobs',
    async (_event, seriesId: number): Promise<ExecutionJob[]> => {
      try {
        const service = getOrchestrationService();
        return service.getJobsForSeries(seriesId);
      } catch (error) {
        const err = error as Error;
        throw new Error(`Failed to get series jobs: ${err.message}`);
      }
    }
  );

  /**
   * Authenticate with Claude subscription
   */
  ipcMain.handle(
    'agent-execution:authenticate',
    async (
      _event,
      params: {
        sessionToken: string;
        userId: string;
        subscriptionTier: 'pro' | 'max';
        expiresAt?: string;
      }
    ): Promise<void> => {
      try {
        const service = getOrchestrationService();
        await service.authenticate(
          params.sessionToken,
          params.userId,
          params.subscriptionTier,
          params.expiresAt ? new Date(params.expiresAt) : undefined
        );
      } catch (error) {
        const err = error as Error;
        throw new Error(`Failed to authenticate: ${err.message}`);
      }
    }
  );

  /**
   * Logout
   */
  ipcMain.handle('agent-execution:logout', async (): Promise<void> => {
    try {
      const service = getOrchestrationService();
      service.logout();
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to logout: ${err.message}`);
    }
  });

  /**
   * Check if authenticated
   */
  ipcMain.handle('agent-execution:is-authenticated', async (): Promise<boolean> => {
    try {
      const service = getOrchestrationService();
      return service.isAuthenticated();
    } catch (error) {
      return false;
    }
  });

  /**
   * Get session info
   */
  ipcMain.handle('agent-execution:get-session-info', async (): Promise<ClaudeSession | null> => {
    try {
      const service = getOrchestrationService();
      return service.getSessionInfo();
    } catch (error) {
      return null;
    }
  });

  /**
   * Get usage summary
   */
  ipcMain.handle(
    'agent-execution:get-usage-summary',
    async (): Promise<{
      totalTokens: number;
      monthlyUsage: number;
      usagePercentage: number;
    }> => {
      try {
        const service = getOrchestrationService();
        const usageTracker = service.getUsageTracker();
        const summary = usageTracker.getTotalUsage();

        // Get session to determine tier
        const session = service.getSessionInfo();
        const tier = session?.subscriptionTier || 'pro';

        return {
          totalTokens: summary.totalTokens,
          monthlyUsage: usageTracker.getTotalTokensForPeriod(
            usageTracker.getCurrentMonthUsage()
          ),
          usagePercentage: usageTracker.getUsagePercentage(tier),
        };
      } catch (error) {
        return {
          totalTokens: 0,
          monthlyUsage: 0,
          usagePercentage: 0,
        };
      }
    }
  );

  /**
   * Detect Claude Code CLI
   */
  ipcMain.handle('agent-execution:detect-cli', async (): Promise<ClaudeCodeInfo> => {
    try {
      const installer = ClaudeCodeInstaller.getInstance();
      return await installer.detectCLI();
    } catch (error) {
      return {
        isInstalled: false,
      };
    }
  });

  /**
   * Install Claude Code CLI
   */
  ipcMain.handle(
    'agent-execution:install-cli',
    async (_event): Promise<{ success: boolean; error?: string }> => {
      try {
        const installer = ClaudeCodeInstaller.getInstance();

        // Send progress updates to renderer
        const windows = BrowserWindow.getAllWindows();

        const result = await installer.installCLI((message) => {
          windows.forEach((win) => {
            win.webContents.send('agent-execution:install-progress', message);
          });
        });

        return result;
      } catch (error) {
        const err = error as Error;
        return {
          success: false,
          error: err.message,
        };
      }
    }
  );

  /**
   * Open installation guide
   */
  ipcMain.handle('agent-execution:open-install-guide', async (): Promise<void> => {
    const installer = ClaudeCodeInstaller.getInstance();
    installer.openInstallationGuide();
  });
}

/**
 * Cleanup on app quit
 */
export function cleanupAgentExecution(): void {
  if (orchestrationService) {
    orchestrationService.cleanup();
    orchestrationService = null;
  }
}
