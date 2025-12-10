/**
 * Workspace Types
 * Type definitions for BQ-Studio workspace management
 */

/**
 * Workspace validation states
 */
export enum WorkspaceValidationState {
  VALID = 'VALID',
  INVALID_PATH = 'INVALID_PATH',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  STRUCTURE_INVALID = 'STRUCTURE_INVALID',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
}

/**
 * Workspace type indicators
 */
export enum WorkspaceType {
  LOCAL = 'local',
  NETWORK = 'network',
  CLOUD_SYNC = 'cloud_sync',
}

/**
 * Workspace validation result
 */
export interface WorkspaceValidationResult {
  state: WorkspaceValidationState;
  path?: string;
  type?: WorkspaceType;
  error?: string;
  suggestions?: string[];
}

/**
 * Permission check result
 */
export interface PermissionResult {
  readable: boolean;
  writable: boolean;
}

/**
 * Workspace configuration
 */
export interface WorkspaceConfig {
  path: string;
  isGitEnabled: boolean;
  gitRemoteUrl?: string;
  lastValidated: string; // ISO timestamp
  workspaceType?: WorkspaceType;
}

/**
 * Workspace initialization options
 */
export interface WorkspaceInitOptions {
  path: string;
  initializeGit: boolean;
  createInitialCommit?: boolean;
}

/**
 * Workspace directory structure
 */
export interface WorkspaceStructure {
  root: string;
  seriesPlanning: string;
  genrePacks: string;
  templates: string;
  exports: string;
}

/**
 * Git status information
 */
export interface GitStatus {
  isRepository: boolean;
  hasRemote: boolean;
  remoteName?: string;
  remoteUrl?: string;
  branch: string;
  ahead: number;
  behind: number;
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
  conflicted: string[];
}

/**
 * Git operation result
 */
export interface GitOperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Genre pack metadata
 */
export interface GenrePackManifest {
  name: string;
  version: string;
  displayName: string;
  description: string;
  author?: string;
  tags?: string[];
  files: string[];
}

/**
 * Genre pack info with source
 */
export interface GenrePackInfo {
  manifest: GenrePackManifest;
  source: 'workspace' | 'plugin';
  path: string;
  isOverride: boolean; // true if workspace version overrides plugin
}

/**
 * Genre pack with loaded content
 */
export interface GenrePack extends GenrePackInfo {
  loadedAt: number;
  files: Map<string, string>; // filepath → content
}

/**
 * Update status for genre packs
 */
export interface GenrePackUpdateStatus {
  status: 'using_plugin' | 'up_to_date' | 'update_available';
  needsAction: boolean;
  pluginVersion?: string;
  workspaceVersion?: string;
  changes?: string[];
}
