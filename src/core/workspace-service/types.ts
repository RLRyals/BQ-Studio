/**
 * Workspace Service Types
 * Internal types for workspace service implementation
 */

import {
  WorkspaceValidationState,
  WorkspaceType,
  WorkspaceValidationResult,
  WorkspaceConfig,
  WorkspaceInitOptions,
  WorkspaceStructure,
} from '../../types/workspace';

export type {
  WorkspaceValidationResult,
  WorkspaceConfig,
  WorkspaceInitOptions,
  WorkspaceStructure,
};

export {
  WorkspaceValidationState,
  WorkspaceType,
};

/**
 * Workspace service configuration
 */
export interface WorkspaceServiceConfig {
  configPath: string; // Path to bq-studio-config.json
}

/**
 * Workspace directory template
 */
export interface WorkspaceTemplate {
  directories: string[];
  files: Array<{
    path: string;
    content: string;
    template?: boolean; // If true, process as template
  }>;
}

/**
 * Workspace creation result
 */
export interface WorkspaceCreationResult {
  success: boolean;
  path: string;
  message?: string;
  error?: string;
}
