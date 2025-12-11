"use strict";
/**
 * Plugin Context
 * Provides plugins with access to core services and plugin-specific utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginContext = void 0;
/**
 * Plugin context provided to each plugin during activation
 * Serves as the plugin's interface to the core system
 */
class PluginContext {
    constructor(manifest, pluginPath, coreServices, pluginManager) {
        this._eventUnsubscribers = [];
        this._manifest = manifest;
        this._pluginPath = pluginPath;
        this._coreServices = coreServices;
        this._pluginManager = pluginManager;
    }
    /**
     * Get plugin manifest
     */
    get manifest() {
        return this._manifest;
    }
    /**
     * Get plugin ID
     */
    get pluginId() {
        return this._manifest.id;
    }
    /**
     * Get plugin directory path
     */
    get pluginPath() {
        return this._pluginPath;
    }
    /**
     * Access to core services
     */
    get core() {
        return this._coreServices;
    }
    /**
     * Get another plugin by ID
     * Allows plugins to access public APIs of other plugins
     */
    getPlugin(pluginId) {
        if (!this._pluginManager) {
            console.warn('PluginManager not available in context');
            return undefined;
        }
        const plugin = this._pluginManager.getPlugin(pluginId);
        return plugin?.instance;
    }
    /**
     * Get another plugin's public API
     */
    getPluginAPI(pluginId) {
        const plugin = this.getPlugin(pluginId);
        return plugin ? plugin.api : undefined;
    }
    /**
     * Check if a plugin is loaded
     */
    isPluginLoaded(pluginId) {
        if (!this._pluginManager) {
            return false;
        }
        return this._pluginManager.isPluginLoaded(pluginId);
    }
    /**
     * Check if a plugin is active
     */
    isPluginActive(pluginId) {
        if (!this._pluginManager) {
            return false;
        }
        return this._pluginManager.isPluginActive(pluginId);
    }
    /**
     * Log a message (scoped to plugin)
     */
    log(level, message, data) {
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
    onEvent(eventName, handler) {
        if (!this._coreServices.events) {
            this.log('warn', 'Event bus not available');
            return () => { };
        }
        const unsubscribe = this._coreServices.events.on(eventName, handler);
        this._eventUnsubscribers.push(unsubscribe);
        return unsubscribe;
    }
    /**
     * Emit an event (convenience wrapper)
     */
    emitEvent(eventName, data) {
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
    getStorageKey(key) {
        return `plugin.${this.pluginId}.${key}`;
    }
    /**
     * Execute database query with plugin context
     * Automatically adds plugin_id to queries for data isolation
     */
    async executeQuery(sql, params) {
        if (!this._coreServices.db) {
            throw new Error('Database service not available');
        }
        this.log('debug', `Executing query: ${sql}`, params);
        return this._coreServices.db.query(sql, params);
    }
    /**
     * Cleanup context (called during deactivation)
     */
    cleanup() {
        // Unsubscribe from all events
        this._eventUnsubscribers.forEach((unsub) => unsub());
        this._eventUnsubscribers = [];
        this.log('debug', 'Context cleaned up');
    }
    /**
     * Helper: Get plugin configuration directory
     */
    getConfigPath() {
        return this._pluginPath;
    }
    /**
     * Helper: Get plugin data directory (for plugin-specific files)
     */
    getDataPath() {
        // This would typically be in a user data directory
        // For now, return plugin path
        return this._pluginPath;
    }
    /**
     * Helper: Check if plugin has permission
     */
    hasPermission(permission) {
        const permissions = this._manifest.permissions;
        if (!permissions) {
            return false;
        }
        return permissions[permission] === true;
    }
    /**
     * Helper: Require permission (throws if not granted)
     */
    requirePermission(permission) {
        if (!this.hasPermission(permission)) {
            throw new Error(`Plugin '${this.pluginId}' requires '${permission}' permission`);
        }
    }
    /**
     * Create a scoped error for the plugin
     */
    createError(message, originalError) {
        const error = new Error(`[${this.pluginId}] ${message}`);
        if (originalError) {
            error.stack = originalError.stack;
        }
        return error;
    }
    /**
     * Safe async execution with error handling
     */
    async safeExecute(fn, errorMessage = 'Operation failed') {
        try {
            return await fn();
        }
        catch (error) {
            this.log('error', errorMessage, error);
            return undefined;
        }
    }
}
exports.PluginContext = PluginContext;
