/**
 * IPC Handlers Registration
 * Central registration for all IPC handlers
 */

import { registerWorkspaceHandlers } from './workspaceHandlers';
import { registerGitHandlers } from './gitHandlers';
import { registerGenrePackHandlers } from './genrePackHandlers';
import { registerAgentExecutionHandlers, cleanupAgentExecution } from './agentExecutionHandlers';

/**
 * Register all IPC handlers
 */
export function registerAllHandlers(): void {
  registerWorkspaceHandlers();
  registerGitHandlers();
  registerGenrePackHandlers();
  registerAgentExecutionHandlers();
}

/**
 * Cleanup handlers on app quit
 */
export function cleanupHandlers(): void {
  cleanupAgentExecution();
}
