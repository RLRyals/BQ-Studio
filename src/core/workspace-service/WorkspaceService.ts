/**
 * Workspace Service
 * Core service for managing BQ-Studio workspace
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';
import {
  WorkspaceValidationState,
  WorkspaceType,
  WorkspaceValidationResult,
  WorkspaceConfig,
  WorkspaceInitOptions,
  WorkspaceStructure,
} from './types';
import { WorkspaceInitializer } from './WorkspaceInitializer';
import { PermissionResult } from '../../types/workspace';

/**
 * WorkspaceService - Singleton service for workspace management
 */
export class WorkspaceService {
  private static instance: WorkspaceService | null = null;
  private workspaceConfig: WorkspaceConfig | null = null;
  private configPath: string;
  private initializer: WorkspaceInitializer;

  private constructor() {
    this.configPath = path.join(app.getPath('userData'), 'bq-studio-config.json');
    this.initializer = new WorkspaceInitializer();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): WorkspaceService {
    if (!WorkspaceService.instance) {
      WorkspaceService.instance = new WorkspaceService();
    }
    return WorkspaceService.instance;
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  /**
   * Load workspace configuration from disk
   */
  async loadConfig(): Promise<WorkspaceConfig | null> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configData);
      this.workspaceConfig = config.workspace || null;
      return this.workspaceConfig;
    } catch (error) {
      // Config file doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Save workspace configuration to disk
   */
  async saveConfig(workspaceConfig: WorkspaceConfig): Promise<void> {
    try {
      let config: any = {};

      // Try to read existing config
      try {
        const existing = await fs.readFile(this.configPath, 'utf-8');
        config = JSON.parse(existing);
      } catch {
        // File doesn't exist, start with empty config
      }

      // Update workspace section
      config.workspace = workspaceConfig;
      config.version = '1.0';

      // Write config
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
      this.workspaceConfig = workspaceConfig;
    } catch (error) {
      throw new Error(
        `Failed to save workspace config: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get current workspace configuration
   */
  getConfig(): WorkspaceConfig | null {
    return this.workspaceConfig;
  }

  // ============================================================================
  // Workspace Path Management
  // ============================================================================

  /**
   * Get workspace path
   */
  getWorkspacePath(): string | null {
    return this.workspaceConfig?.path || null;
  }

  /**
   * Set workspace path
   */
  async setWorkspacePath(workspacePath: string): Promise<void> {
    const validation = await this.validate(workspacePath);

    if (validation.state !== WorkspaceValidationState.VALID) {
      throw new Error(`Invalid workspace path: ${validation.error}`);
    }

    const config: WorkspaceConfig = {
      path: workspacePath,
      isGitEnabled: this.workspaceConfig?.isGitEnabled ?? false,
      gitRemoteUrl: this.workspaceConfig?.gitRemoteUrl,
      lastValidated: new Date().toISOString(),
      workspaceType: validation.type,
    };

    await this.saveConfig(config);
  }

  /**
   * Get workspace structure paths
   */
  getWorkspaceStructure(): WorkspaceStructure | null {
    const workspacePath = this.getWorkspacePath();
    if (!workspacePath) return null;

    return {
      root: workspacePath,
      seriesPlanning: path.join(workspacePath, 'series-planning'),
      genrePacks: path.join(workspacePath, 'genre-packs'),
      templates: path.join(workspacePath, 'templates'),
      exports: path.join(workspacePath, 'exports'),
    };
  }

  /**
   * Get default workspace path
   */
  getDefaultWorkspacePath(): string {
    return path.join(app.getPath('documents'), 'BQ-Studio-Workspace');
  }

  // ============================================================================
  // Workspace Initialization
  // ============================================================================

  /**
   * Check if this is first run (no workspace configured)
   */
  async isFirstRun(): Promise<boolean> {
    const config = await this.loadConfig();
    if (!config || !config.path) return true;

    // Check if workspace still exists
    try {
      await fs.access(config.path);
      return false;
    } catch {
      return true;
    }
  }

  /**
   * Initialize new workspace
   */
  async initializeWorkspace(options: WorkspaceInitOptions): Promise<void> {
    const result = await this.initializer.initialize(options);

    if (!result.success) {
      throw new Error(result.error || 'Failed to initialize workspace');
    }

    // Save workspace configuration
    const config: WorkspaceConfig = {
      path: options.path,
      isGitEnabled: options.initializeGit,
      lastValidated: new Date().toISOString(),
    };

    await this.saveConfig(config);
  }

  // ============================================================================
  // Workspace Validation
  // ============================================================================

  /**
   * Validate workspace
   */
  async validate(workspacePath?: string): Promise<WorkspaceValidationResult> {
    const pathToValidate = workspacePath || this.getWorkspacePath();

    if (!pathToValidate) {
      return {
        state: WorkspaceValidationState.NOT_CONFIGURED,
        error: 'No workspace configured',
        suggestions: ['Run workspace setup wizard', 'Configure workspace in settings'],
      };
    }

    // Check if path exists
    try {
      await fs.access(pathToValidate);
    } catch {
      return {
        state: WorkspaceValidationState.INVALID_PATH,
        path: pathToValidate,
        error: 'Workspace path does not exist',
        suggestions: [
          'Workspace may have been moved or deleted',
          'Reconfigure workspace',
          'Create new workspace',
        ],
      };
    }

    // Check permissions
    const permissions = await this.checkPermissions(pathToValidate);
    if (!permissions.writable) {
      return {
        state: WorkspaceValidationState.PERMISSION_DENIED,
        path: pathToValidate,
        error: 'Workspace is not writable',
        suggestions: [
          'Check folder permissions',
          'Choose a different workspace location',
          permissions.readable ? 'Use read-only mode' : 'Cannot access workspace',
        ],
      };
    }

    // Check structure
    const structureValid = await this.initializer.validateStructure(pathToValidate);
    if (!structureValid) {
      return {
        state: WorkspaceValidationState.STRUCTURE_INVALID,
        path: pathToValidate,
        error: 'Workspace structure is incomplete',
        suggestions: ['Repair workspace structure', 'Reinitialize workspace'],
      };
    }

    // Detect workspace type
    const workspaceType = await this.detectWorkspaceType(pathToValidate);

    // Update last validated timestamp if this is the configured workspace
    if (pathToValidate === this.getWorkspacePath() && this.workspaceConfig) {
      this.workspaceConfig.lastValidated = new Date().toISOString();
      this.workspaceConfig.workspaceType = workspaceType;
      await this.saveConfig(this.workspaceConfig);
    }

    return {
      state: WorkspaceValidationState.VALID,
      path: pathToValidate,
      type: workspaceType,
    };
  }

  /**
   * Check workspace permissions
   */
  private async checkPermissions(workspacePath: string): Promise<PermissionResult> {
    try {
      // Test write permission
      const testFile = path.join(workspacePath, '.bq-studio-write-test');
      await fs.writeFile(testFile, 'test', 'utf-8');
      await fs.unlink(testFile);

      return { readable: true, writable: true };
    } catch (error) {
      // Check if at least readable
      try {
        await fs.readdir(workspacePath);
        return { readable: true, writable: false };
      } catch {
        return { readable: false, writable: false };
      }
    }
  }

  /**
   * Detect workspace type (local, network, cloud sync)
   */
  private async detectWorkspaceType(workspacePath: string): Promise<WorkspaceType> {
    // Check for network drive (Windows UNC path)
    if (process.platform === 'win32' && workspacePath.startsWith('\\\\')) {
      return WorkspaceType.NETWORK;
    }

    // Check for cloud sync indicators
    const cloudPatterns = [/Dropbox/i, /Google Drive/i, /OneDrive/i, /iCloud/i];

    if (cloudPatterns.some((pattern) => pattern.test(workspacePath))) {
      return WorkspaceType.CLOUD_SYNC;
    }

    return WorkspaceType.LOCAL;
  }

  /**
   * Repair workspace structure
   */
  async repairStructure(): Promise<void> {
    const workspacePath = this.getWorkspacePath();
    if (!workspacePath) {
      throw new Error('No workspace configured');
    }

    await this.initializer.repairStructure(workspacePath);
  }

  // ============================================================================
  // Git Configuration
  // ============================================================================

  /**
   * Update Git configuration
   */
  async updateGitConfig(isEnabled: boolean, remoteUrl?: string): Promise<void> {
    if (!this.workspaceConfig) {
      throw new Error('No workspace configured');
    }

    this.workspaceConfig.isGitEnabled = isEnabled;
    if (remoteUrl !== undefined) {
      this.workspaceConfig.gitRemoteUrl = remoteUrl || undefined;
    }

    await this.saveConfig(this.workspaceConfig);
  }

  /**
   * Check if Git is enabled for workspace
   */
  isGitEnabled(): boolean {
    return this.workspaceConfig?.isGitEnabled ?? false;
  }

  /**
   * Get Git remote URL
   */
  getGitRemoteUrl(): string | undefined {
    return this.workspaceConfig?.gitRemoteUrl;
  }
}

/**
 * Get singleton instance (convenience export)
 */
export function getWorkspaceService(): WorkspaceService {
  return WorkspaceService.getInstance();
}
