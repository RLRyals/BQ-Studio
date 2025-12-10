/**
 * Git IPC Handlers
 * Handle Git-related IPC calls from renderer process
 */

import { ipcMain } from 'electron';
import { getGitService } from '../../core/workspace-service';
import { getWorkspaceService } from '../../core/workspace-service';

/**
 * Register all Git IPC handlers
 */
export function registerGitHandlers(): void {
  const gitService = getGitService();
  const workspaceService = getWorkspaceService();

  // Initialize Git service with workspace path
  const initializeGitService = () => {
    const workspacePath = workspaceService.getWorkspacePath();
    if (!workspacePath) {
      throw new Error('No workspace configured');
    }
    gitService.initialize(workspacePath);
  };

  // Check if workspace is a Git repository
  ipcMain.handle('git:isRepository', async () => {
    try {
      const workspacePath = workspaceService.getWorkspacePath();
      if (!workspacePath) return false;

      return await gitService.isRepository(workspacePath);
    } catch (error) {
      console.error('Failed to check if repository:', error);
      return false;
    }
  });

  // Get Git status
  ipcMain.handle('git:status', async () => {
    try {
      initializeGitService();
      return await gitService.status();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get Git status',
      };
    }
  });

  // Commit changes
  ipcMain.handle('git:commit', async (_event, message: string, files?: string[]) => {
    try {
      initializeGitService();
      return await gitService.commit(message, files);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to commit changes',
      };
    }
  });

  // Push to remote
  ipcMain.handle('git:push', async (_event, remote?: string, branch?: string) => {
    try {
      initializeGitService();
      return await gitService.push(remote, branch);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to push',
      };
    }
  });

  // Pull from remote
  ipcMain.handle('git:pull', async (_event, remote?: string, branch?: string) => {
    try {
      initializeGitService();
      return await gitService.pull(remote, branch);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pull',
      };
    }
  });

  // Add remote
  ipcMain.handle('git:addRemote', async (_event, name: string, url: string) => {
    try {
      initializeGitService();
      return await gitService.addRemote(name, url);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add remote',
      };
    }
  });

  // Set remote URL
  ipcMain.handle('git:setRemoteUrl', async (_event, name: string, url: string) => {
    try {
      initializeGitService();
      return await gitService.setRemoteUrl(name, url);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set remote URL',
      };
    }
  });

  // Get remote URL
  ipcMain.handle('git:getRemoteUrl', async (_event, name: string = 'origin') => {
    try {
      initializeGitService();
      return await gitService.getRemoteUrl(name);
    } catch (error) {
      return null;
    }
  });

  // Remove remote
  ipcMain.handle('git:removeRemote', async (_event, name: string) => {
    try {
      initializeGitService();
      return await gitService.removeRemote(name);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove remote',
      };
    }
  });

  // Get current branch
  ipcMain.handle('git:getCurrentBranch', async () => {
    try {
      initializeGitService();
      return await gitService.getCurrentBranch();
    } catch (error) {
      return 'main';
    }
  });

  // Get commit log
  ipcMain.handle('git:getLog', async (_event, maxCount: number = 10) => {
    try {
      initializeGitService();
      return await gitService.getLog(maxCount);
    } catch (error) {
      return [];
    }
  });

  // Check for uncommitted changes
  ipcMain.handle('git:hasUncommittedChanges', async () => {
    try {
      initializeGitService();
      return await gitService.hasUncommittedChanges();
    } catch (error) {
      return false;
    }
  });
}
