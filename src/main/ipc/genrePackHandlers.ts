/**
 * Genre Pack IPC Handlers
 * Handle genre pack-related IPC calls from renderer process
 */

import { ipcMain } from 'electron';
import { getGenrePackService } from '../../core/genre-pack-service';

/**
 * Register all genre pack IPC handlers
 */
export function registerGenrePackHandlers(): void {
  const genrePackService = getGenrePackService();

  // List all available genre packs
  ipcMain.handle('genrepack:list', async () => {
    try {
      return await genrePackService.listAvailableGenrePacks();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list genre packs',
      };
    }
  });

  // Load specific genre pack
  ipcMain.handle('genrepack:load', async (_event, packName: string, forceRefresh = false) => {
    try {
      return await genrePackService.loadGenrePack(packName, forceRefresh);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load genre pack',
      };
    }
  });

  // Get genre pack file content
  ipcMain.handle('genrepack:getFile', async (_event, packName: string, filePath: string) => {
    try {
      return await genrePackService.getGenrePackFile(packName, filePath);
    } catch (error) {
      return null;
    }
  });

  // Copy plugin genre pack to workspace
  ipcMain.handle('genrepack:copy', async (_event, packName: string) => {
    try {
      await genrePackService.copyPluginGenrePackToWorkspace(packName);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to copy genre pack',
      };
    }
  });

  // Check for genre pack updates
  ipcMain.handle('genrepack:checkUpdates', async (_event, packName: string) => {
    try {
      return await genrePackService.checkForGenrePackUpdates(packName);
    } catch (error) {
      return {
        status: 'up_to_date',
        needsAction: false,
      };
    }
  });

  // Invalidate cache
  ipcMain.handle('genrepack:invalidateCache', async (_event, packName?: string) => {
    try {
      genrePackService.invalidateCache(packName);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to invalidate cache',
      };
    }
  });
}
