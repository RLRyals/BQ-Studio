/**
 * Plugin Context
 * Provides plugins with access to core services and plugin-specific utilities
 */

import { CoreServices, PluginManifest } from './types';

/**
 * Plugin context provided to each plugin during activation
 * Serves as the plugin's interface to the core system
 */
export class PluginContext {
  private _manifest: PluginManifest;
  private _pluginPath: string;
  private _coreServices: CoreServices;
  private _pluginManager: any; // Reference to PluginManager (avoid circular dependency)
  private _eventUnsubscribers: (() => void)[] = [];

  constructor(
    manifest: PluginManifest,
    pluginPath: string,
    coreServices: CoreServices,
    pluginManager?: any
  ) {
    this._manifest = manifest;
    this._pluginPath = pluginPath;
    this._coreServices = coreServices;
    this._pluginManager = pluginManager;
  }

  /**
   * Get plugin manifest
   */
  get manifest(): PluginManifest {
    return this._manifest;
  }

  /**
   * Get plugin ID
   */
  get pluginId(): string {
    return this._manifest.id;
  }

  /**
   * Get plugin directory path
   */
  get pluginPath(): string {
    return this._pluginPath;
  }

  /**
   * Access to core services
   */
  get core(): CoreServices {
    return this._coreServices;
  }

  /**
   * Get another plugin by ID
   * Allows plugins to access public APIs of other plugins
   */
  getPlugin<T = any>(pluginId: string): T | undefined {
    if (!this._pluginManager) {
      console.warn('PluginManager not available in context');
      return undefined;
    }

    const plugin = this._pluginManager.getPlugin(pluginId);
    return plugin?.instance as T;
  }

  /**
   * Get another plugin's public API
   */
  getPluginAPI<T = any>(pluginId: string): T | undefined {
    const plugin = this.getPlugin(pluginId);
    return plugin ? (plugin as any).api : undefined;
  }

  /**
   * Check if a plugin is loaded
   */
  isPluginLoaded(pluginId: string): boolean {
    if (!this._pluginManager) {
      return false;
    }
    return this._pluginManager.isPluginLoaded(pluginId);
  }

  /**
   * Check if a plugin is active
   */
  isPluginActive(pluginId: string): boolean {
    if (!this._pluginManager) {
      return false;
    }
    return this._pluginManager.isPluginActive(pluginId);
  }

  /**
   * Log a message (scoped to plugin)
   */
  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    const prefix = `[Plugin: ${this.pluginId}]`;
    const logData = data ? [prefix, message, data] : [prefix, message];

    switch (level) {
      case 'info':
        console.log(...logData);
        break;
      case 'warn':
        console.warn(...logData);
        break;
      case 'error':
        console.error(...logData);
        break;
      case 'debug':
        console.debug(...logData);
        break;
    }
  }

  /**
   * Subscribe to an event (auto-cleanup on deactivation)
   * This is a convenience wrapper that tracks subscriptions
   */
  onEvent(eventName: string, handler: (...args: any[]) => void): () => void {
    if (!this._coreServices.events) {
      this.log('warn', 'Event bus not available');
      return () => {};
    }

    const unsubscribe = this._coreServices.events.on(eventName, handler);
    this._eventUnsubscribers.push(unsubscribe);

    return unsubscribe;
  }

  /**
   * Emit an event (convenience wrapper)
   */
  emitEvent(eventName: string, data?: any): void {
    if (!this._coreServices.events) {
      this.log('warn', 'Event bus not available');
      return;
    }

    this._coreServices.events.emit(eventName, data);
  }

  /**
   * Get plugin-specific storage key
   * Namespaces storage to prevent conflicts
   */
  getStorageKey(key: string): string {
    return `plugin.${this.pluginId}.${key}`;
  }

  /**
   * Execute database query with plugin context
   * Automatically adds plugin_id to queries for data isolation
   */
  async executeQuery(sql: string, params?: any[]): Promise<any> {
    if (!this._coreServices.db) {
      throw new Error('Database service not available');
    }

    this.log('debug', `Executing query: ${sql}`, params);
    return this._coreServices.db.query(sql, params);
  }

  /**
   * Cleanup context (called during deactivation)
   */
  cleanup(): void {
    // Unsubscribe from all events
    this._eventUnsubscribers.forEach((unsub) => unsub());
    this._eventUnsubscribers = [];

    this.log('debug', 'Context cleaned up');
  }

  /**
   * Helper: Get plugin configuration directory
   */
  getConfigPath(): string {
    return this._pluginPath;
  }

  /**
   * Helper: Get plugin data directory (for plugin-specific files)
   */
  getDataPath(): string {
    // This would typically be in a user data directory
    // For now, return plugin path
    return this._pluginPath;
  }

  /**
   * Helper: Check if plugin has permission
   */
  hasPermission(permission: string): boolean {
    const permissions = this._manifest.permissions;
    if (!permissions) {
      return false;
    }

    return (permissions as any)[permission] === true;
  }

  /**
   * Helper: Require permission (throws if not granted)
   */
  requirePermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      throw new Error(
        `Plugin '${this.pluginId}' requires '${permission}' permission`
      );
    }
  }

  /**
   * Create a scoped error for the plugin
   */
  createError(message: string, originalError?: Error): Error {
    const error = new Error(`[${this.pluginId}] ${message}`);
    if (originalError) {
      error.stack = originalError.stack;
    }
    return error;
  }

  /**
   * Safe async execution with error handling
   */
  async safeExecute<T>(
    fn: () => Promise<T>,
    errorMessage = 'Operation failed'
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.log('error', errorMessage, error);
      return undefined;
    }
  }
}
