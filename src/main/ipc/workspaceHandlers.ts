/**
 * Workspace IPC Handlers
 * Handle workspace-related IPC calls from renderer process
 */

import { ipcMain, dialog } from 'electron';
import { getWorkspaceService } from '../../core/workspace-service';
import { WorkspaceInitOptions } from '../../types/workspace';

/**
 * Register all workspace IPC handlers
 */
export function registerWorkspaceHandlers(): void {
  const workspaceService = getWorkspaceService();

  // Get workspace path
  ipcMain.handle('workspace:getPath', async () => {
    return workspaceService.getWorkspacePath();
  });

  // Get workspace configuration
  ipcMain.handle('workspace:getConfig', async () => {
    return workspaceService.getConfig();
  });

  // Get default workspace path
  ipcMain.handle('workspace:getDefaultPath', async () => {
    return workspaceService.getDefaultWorkspacePath();
  });

  // Select folder dialog
  ipcMain.handle('workspace:selectFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select BQ-Studio Workspace Folder',
      defaultPath: workspaceService.getDefaultWorkspacePath(),
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // Check if first run
  ipcMain.handle('workspace:isFirstRun', async () => {
    return await workspaceService.isFirstRun();
  });

  // Initialize workspace
  ipcMain.handle('workspace:initialize', async (_event, options: WorkspaceInitOptions) => {
    try {
      await workspaceService.initializeWorkspace(options);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Validate workspace
  ipcMain.handle('workspace:validate', async (_event, path?: string) => {
    return await workspaceService.validate(path);
  });

  // Set workspace path
  ipcMain.handle('workspace:setPath', async (_event, path: string) => {
    try {
      await workspaceService.setWorkspacePath(path);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Get workspace structure
  ipcMain.handle('workspace:getStructure', async () => {
    return workspaceService.getWorkspaceStructure();
  });

  // Repair workspace structure
  ipcMain.handle('workspace:repair', async () => {
    try {
      await workspaceService.repairStructure();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Update Git configuration
  ipcMain.handle(
    'workspace:updateGitConfig',
    async (_event, isEnabled: boolean, remoteUrl?: string) => {
      try {
        await workspaceService.updateGitConfig(isEnabled, remoteUrl);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Check if Git is enabled
  ipcMain.handle('workspace:isGitEnabled', async () => {
    return workspaceService.isGitEnabled();
  });

  // Get Git remote URL
  ipcMain.handle('workspace:getGitRemoteUrl', async () => {
    return workspaceService.getGitRemoteUrl();
  });
}
