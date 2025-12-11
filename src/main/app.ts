import { app, BrowserWindow, dialog } from 'electron';
import * as path from 'path';
import { getWorkspaceService } from '../core/workspace-service';
import { WorkspaceValidationState } from '../types/workspace';
import { registerAllHandlers } from './ipc';

let mainWindow: BrowserWindow | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    title: 'BQ Studio',
    show: false, // Don't show until ready
  });

  // Show window when ready to avoid visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the app
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    // Development mode - load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');

    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load from built files
    // __dirname is dist/main/src/main, we need to go to dist/renderer
    mainWindow.loadFile(path.join(__dirname, '../../../renderer/index.html'));
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Register IPC handlers
  registerAllHandlers();

  // Initialize workspace service and check configuration
  const workspaceService = getWorkspaceService();
  await workspaceService.loadConfig();

  const isFirstRun = await workspaceService.isFirstRun();

  if (isFirstRun) {
    // First run - workspace setup wizard will be shown by renderer
    console.log('First run detected - workspace setup required');
  } else {
    // Validate existing workspace
    const validation = await workspaceService.validate();

    if (validation.state !== WorkspaceValidationState.VALID) {
      console.warn('Workspace validation failed:', validation.error);

      // Show dialog offering to reconfigure or exit
      const choice = await dialog.showMessageBox({
        type: 'warning',
        title: 'Workspace Issue',
        message: 'Your workspace is no longer accessible.',
        detail: validation.error || 'Unknown error',
        buttons: ['Reconfigure Workspace', 'Exit'],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice.response === 1) {
        // User chose to exit
        app.quit();
        return;
      }

      // User chose to reconfigure - setup wizard will be shown
      console.log('Workspace reconfiguration required');
    } else {
      console.log('Workspace validated successfully:', validation.path);
    }
  }

  createWindow();

  // On macOS, re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app-level errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
