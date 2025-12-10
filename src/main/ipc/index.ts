/**
 * IPC Handlers Registration
 * Central registration for all IPC handlers
 */

import { registerWorkspaceHandlers } from './workspaceHandlers';
import { registerGitHandlers } from './gitHandlers';
import { registerGenrePackHandlers } from './genrePackHandlers';

/**
 * Register all IPC handlers
 */
export function registerAllHandlers(): void {
  registerWorkspaceHandlers();
  registerGitHandlers();
  registerGenrePackHandlers();
}
