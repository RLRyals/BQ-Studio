/**
 * Plugin Manager Type Definitions
 * Core types for the BQ Studio plugin system
 */

import { PluginContext } from './PluginContext';

/**
 * Plugin manifest structure (plugin.json)
 */
export interface PluginManifest {
  /** Unique plugin identifier (must match directory name) */
  id: string;

  /** Display name */
  name: string;

  /** Semantic version (MAJOR.MINOR.PATCH) */
  version: string;

  /** Brief description of plugin functionality */
  description: string;

  /** Author name or organization */
  author: string;

  /** Icon name for UI display */
  icon?: string;

  /** Entry point file path (relative to plugin directory) */
  entry: string;

  /** Plugin dependencies (array of plugin IDs) */
  dependencies?: string[];

  /** UI configuration */
  ui?: {
    /** Main view component name */
    mainView?: string;

    /** Sidebar icon name */
    sidebarIcon?: string;

    /** Dashboard widget component name */
    dashboardWidget?: string;
  };

  /** Database configuration */
  data?: {
    /** SQL schema file paths */
    schemas?: string[];
  };

  /** Permissions required by plugin */
  permissions?: {
    /** File system access */
    fileSystem?: boolean;

    /** Network access */
    network?: boolean;

    /** AI service access */
    ai?: boolean;

    /** Database access */
    database?: boolean;
  };
}

/**
 * Plugin interface - all plugins must implement this
 */
export interface Plugin {
  /** Plugin unique ID */
  id: string;

  /** Plugin display name */
  name: string;

  /** Plugin version */
  version: string;

  /** Plugin description */
  description?: string;

  /** UI components */
  ui?: {
    mainView?: React.ComponentType<any>;
    dashboardWidget?: React.ComponentType<any>;
  };

  /**
   * Called when plugin is activated
   * @param context Plugin context with access to core services
   */
  onActivate(context: PluginContext): Promise<void> | void;

  /**
   * Called when plugin is deactivated
   * Cleanup resources, unsubscribe from events, etc.
   */
  onDeactivate?(): Promise<void> | void;

  /**
   * Optional public API exposed to other plugins
   */
  api?: Record<string, any>;
}

/**
 * Plugin metadata (runtime state)
 */
export interface PluginMetadata {
  /** Plugin manifest */
  manifest: PluginManifest;

  /** Absolute path to plugin directory */
  path: string;

  /** Plugin instance */
  instance?: Plugin;

  /** Plugin context */
  context?: PluginContext;

  /** Activation state */
  isActive: boolean;

  /** Load state */
  isLoaded: boolean;

  /** Load timestamp */
  loadedAt?: Date;

  /** Activation timestamp */
  activatedAt?: Date;

  /** Error if plugin failed to load/activate */
  error?: Error;
}

/**
 * Core services available to plugins via PluginContext
 */
export interface CoreServices {
  /** AI service for LLM interactions */
  ai?: any; // AIService (will be implemented in Issue #7)

  /** Database service for SQLite operations */
  db?: any; // DatabaseService (will be implemented in Issue #8)

  /** File service for file operations and templates */
  files?: any; // FileService (will be implemented in Issue #9)

  /** Event bus for plugin communication */
  events?: any; // EventBus (will be implemented in Issue #11)

  /** Workflow engine for stage-based processes */
  workflow?: any; // WorkflowEngine (will be implemented in Issue #10)
}

/**
 * Plugin manager configuration
 */
export interface PluginManagerConfig {
  /** Path to plugins directory */
  pluginsPath: string;

  /** Core services to inject */
  coreServices?: CoreServices;

  /** Enable plugin sandboxing */
  enableSandbox?: boolean;

  /** Auto-activate plugins on load */
  autoActivate?: boolean;
}

/**
 * Plugin discovery result
 */
export interface PluginDiscoveryResult {
  /** Plugin manifest */
  manifest: PluginManifest;

  /** Absolute path to plugin directory */
  path: string;

  /** Validation errors (if any) */
  errors?: string[];
}

/**
 * Plugin load result
 */
export interface PluginLoadResult {
  /** Plugin ID */
  pluginId: string;

  /** Success status */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Plugin metadata if successful */
  metadata?: PluginMetadata;
}

/**
 * Plugin activation result
 */
export interface PluginActivationResult {
  /** Plugin ID */
  pluginId: string;

  /** Success status */
  success: boolean;

  /** Error message if failed */
  error?: string;
}

/**
 * Plugin error types
 */
export enum PluginErrorType {
  MANIFEST_NOT_FOUND = 'MANIFEST_NOT_FOUND',
  MANIFEST_INVALID = 'MANIFEST_INVALID',
  ENTRY_NOT_FOUND = 'ENTRY_NOT_FOUND',
  LOAD_FAILED = 'LOAD_FAILED',
  ACTIVATION_FAILED = 'ACTIVATION_FAILED',
  DEACTIVATION_FAILED = 'DEACTIVATION_FAILED',
  DEPENDENCY_NOT_MET = 'DEPENDENCY_NOT_MET',
  ALREADY_LOADED = 'ALREADY_LOADED',
  NOT_LOADED = 'NOT_LOADED',
}

/**
 * Plugin error class
 */
export class PluginError extends Error {
  constructor(
    public type: PluginErrorType,
    public pluginId: string,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PluginError';
  }
}
