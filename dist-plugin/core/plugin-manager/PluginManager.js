"use strict";
/**
 * Plugin Manager
 * Core plugin loading and lifecycle management system for BQ Studio
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PluginContext_1 = require("./PluginContext");
const validator_1 = require("./validator");
const types_1 = require("./types");
/**
 * PluginManager class
 * Discovers, loads, and manages plugin lifecycle
 */
class PluginManager {
    constructor(config) {
        this.plugins = new Map();
        this.loadOrder = [];
        this.config = {
            enableSandbox: false,
            autoActivate: true,
            ...config,
        };
    }
    /**
     * Initialize plugin manager and discover all plugins
     */
    async initialize() {
        console.log('[PluginManager] Initializing...');
        console.log(`[PluginManager] Plugins path: ${this.config.pluginsPath}`);
        // Ensure plugins directory exists
        if (!fs.existsSync(this.config.pluginsPath)) {
            console.warn(`[PluginManager] Plugins directory not found: ${this.config.pluginsPath}`);
            console.log('[PluginManager] Creating plugins directory...');
            fs.mkdirSync(this.config.pluginsPath, { recursive: true });
        }
        // Discover plugins
        const discovered = await this.discoverPlugins();
        console.log(`[PluginManager] Discovered ${discovered.length} plugin(s)`);
        // Load plugins
        const loadResults = await this.loadPlugins(discovered);
        const successCount = loadResults.filter((r) => r.success).length;
        console.log(`[PluginManager] Loaded ${successCount}/${loadResults.length} plugin(s)`);
        // Auto-activate if enabled
        if (this.config.autoActivate) {
            const activateResults = await this.activateAll();
            const activatedCount = activateResults.filter((r) => r.success).length;
            console.log(`[PluginManager] Activated ${activatedCount}/${activateResults.length} plugin(s)`);
        }
        console.log('[PluginManager] Initialization complete');
    }
    /**
     * Discover all plugins in the plugins directory
     */
    async discoverPlugins() {
        const results = [];
        if (!fs.existsSync(this.config.pluginsPath)) {
            return results;
        }
        const entries = fs.readdirSync(this.config.pluginsPath, {
            withFileTypes: true,
        });
        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }
            const pluginPath = path.join(this.config.pluginsPath, entry.name);
            const manifestPath = path.join(pluginPath, 'plugin.json');
            // Check if plugin.json exists
            if (!fs.existsSync(manifestPath)) {
                console.warn(`[PluginManager] Skipping ${entry.name}: plugin.json not found`);
                continue;
            }
            try {
                // Read and parse manifest
                const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
                const manifest = JSON.parse(manifestContent);
                // Validate manifest
                const validation = (0, validator_1.validatePluginManifest)(manifest);
                if (!validation.valid) {
                    results.push({
                        manifest,
                        path: pluginPath,
                        errors: validation.errors.map((e) => `${e.field}: ${e.message}`),
                    });
                    console.error(`[PluginManager] Invalid manifest for ${entry.name}:`, validation.errors);
                    continue;
                }
                // Check if ID matches directory name
                if (manifest.id !== entry.name) {
                    results.push({
                        manifest,
                        path: pluginPath,
                        errors: [
                            `Plugin ID '${manifest.id}' does not match directory name '${entry.name}'`,
                        ],
                    });
                    continue;
                }
                results.push({
                    manifest,
                    path: pluginPath,
                });
            }
            catch (error) {
                console.error(`[PluginManager] Error discovering plugin ${entry.name}:`, error);
                continue;
            }
        }
        return results;
    }
    /**
     * Load plugins from discovery results
     */
    async loadPlugins(discoveries) {
        const results = [];
        // Filter out plugins with errors
        const validDiscoveries = discoveries.filter((d) => !d.errors);
        // Sort by dependencies (topological sort)
        const sorted = this.sortByDependencies(validDiscoveries);
        for (const discovery of sorted) {
            const result = await this.loadPlugin(discovery.manifest, discovery.path);
            results.push(result);
        }
        return results;
    }
    /**
     * Load a single plugin
     */
    async loadPlugin(manifest, pluginPath) {
        const pluginId = manifest.id;
        try {
            // Check if already loaded
            if (this.plugins.has(pluginId)) {
                throw new types_1.PluginError(types_1.PluginErrorType.ALREADY_LOADED, pluginId, `Plugin '${pluginId}' is already loaded`);
            }
            // Check dependencies
            if (manifest.dependencies) {
                for (const depId of manifest.dependencies) {
                    if (!this.plugins.has(depId)) {
                        throw new types_1.PluginError(types_1.PluginErrorType.DEPENDENCY_NOT_MET, pluginId, `Dependency '${depId}' not loaded`);
                    }
                }
            }
            // Resolve entry point
            const entryPath = path.join(pluginPath, manifest.entry);
            if (!fs.existsSync(entryPath)) {
                throw new types_1.PluginError(types_1.PluginErrorType.ENTRY_NOT_FOUND, pluginId, `Entry file not found: ${manifest.entry}`);
            }
            // Import plugin module
            // Note: In production, this would use dynamic import
            // For now, we create a metadata stub
            const metadata = {
                manifest,
                path: pluginPath,
                isLoaded: true,
                isActive: false,
                loadedAt: new Date(),
            };
            this.plugins.set(pluginId, metadata);
            this.loadOrder.push(pluginId);
            console.log(`[PluginManager] Loaded plugin: ${pluginId}`);
            return {
                pluginId,
                success: true,
                metadata,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[PluginManager] Failed to load ${pluginId}:`, error);
            return {
                pluginId,
                success: false,
                error: errorMessage,
            };
        }
    }
    /**
     * Activate a plugin
     */
    async activatePlugin(pluginId) {
        try {
            const metadata = this.plugins.get(pluginId);
            if (!metadata) {
                throw new types_1.PluginError(types_1.PluginErrorType.NOT_LOADED, pluginId, `Plugin '${pluginId}' is not loaded`);
            }
            if (metadata.isActive) {
                return {
                    pluginId,
                    success: true,
                };
            }
            // Activate dependencies first
            if (metadata.manifest.dependencies) {
                for (const depId of metadata.manifest.dependencies) {
                    const depResult = await this.activatePlugin(depId);
                    if (!depResult.success) {
                        throw new types_1.PluginError(types_1.PluginErrorType.DEPENDENCY_NOT_MET, pluginId, `Failed to activate dependency '${depId}'`);
                    }
                }
            }
            // Create plugin context
            const context = new PluginContext_1.PluginContext(metadata.manifest, metadata.path, this.config.coreServices || {}, this);
            // For now, we'll create a mock plugin instance
            // In production, this would be the actual imported plugin class
            const pluginInstance = {
                id: metadata.manifest.id,
                name: metadata.manifest.name,
                version: metadata.manifest.version,
                description: metadata.manifest.description,
                onActivate: async (_ctx) => {
                    console.log(`[Plugin: ${pluginId}] Activated`);
                },
                onDeactivate: async () => {
                    console.log(`[Plugin: ${pluginId}] Deactivated`);
                },
            };
            // Call onActivate
            await pluginInstance.onActivate(context);
            // Update metadata
            metadata.instance = pluginInstance;
            metadata.context = context;
            metadata.isActive = true;
            metadata.activatedAt = new Date();
            console.log(`[PluginManager] Activated plugin: ${pluginId}`);
            return {
                pluginId,
                success: true,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[PluginManager] Failed to activate ${pluginId}:`, error);
            const metadata = this.plugins.get(pluginId);
            if (metadata) {
                metadata.error = error instanceof Error ? error : new Error(errorMessage);
            }
            return {
                pluginId,
                success: false,
                error: errorMessage,
            };
        }
    }
    /**
     * Deactivate a plugin
     */
    async deactivatePlugin(pluginId) {
        try {
            const metadata = this.plugins.get(pluginId);
            if (!metadata) {
                throw new types_1.PluginError(types_1.PluginErrorType.NOT_LOADED, pluginId, `Plugin '${pluginId}' is not loaded`);
            }
            if (!metadata.isActive) {
                return {
                    pluginId,
                    success: true,
                };
            }
            // Check if other plugins depend on this one
            for (const [otherId, otherMeta] of this.plugins.entries()) {
                if (otherMeta.isActive &&
                    otherMeta.manifest.dependencies?.includes(pluginId)) {
                    // Deactivate dependent plugin first
                    await this.deactivatePlugin(otherId);
                }
            }
            // Call onDeactivate
            if (metadata.instance?.onDeactivate) {
                await metadata.instance.onDeactivate();
            }
            // Cleanup context
            metadata.context?.cleanup();
            // Update metadata
            metadata.isActive = false;
            metadata.activatedAt = undefined;
            console.log(`[PluginManager] Deactivated plugin: ${pluginId}`);
            return {
                pluginId,
                success: true,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[PluginManager] Failed to deactivate ${pluginId}:`, error);
            return {
                pluginId,
                success: false,
                error: errorMessage,
            };
        }
    }
    /**
     * Activate all loaded plugins
     */
    async activateAll() {
        const results = [];
        for (const pluginId of this.loadOrder) {
            const result = await this.activatePlugin(pluginId);
            results.push(result);
        }
        return results;
    }
    /**
     * Deactivate all active plugins
     */
    async deactivateAll() {
        const results = [];
        // Deactivate in reverse load order
        for (const pluginId of [...this.loadOrder].reverse()) {
            const result = await this.deactivatePlugin(pluginId);
            results.push(result);
        }
        return results;
    }
    /**
     * Get plugin metadata
     */
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }
    /**
     * Get all plugins
     */
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    /**
     * Get loaded plugins
     */
    getLoadedPlugins() {
        return this.getAllPlugins().filter((p) => p.isLoaded);
    }
    /**
     * Get active plugins
     */
    getActivePlugins() {
        return this.getAllPlugins().filter((p) => p.isActive);
    }
    /**
     * Check if plugin is loaded
     */
    isPluginLoaded(pluginId) {
        return this.plugins.has(pluginId) && this.plugins.get(pluginId).isLoaded;
    }
    /**
     * Check if plugin is active
     */
    isPluginActive(pluginId) {
        return this.plugins.has(pluginId) && this.plugins.get(pluginId).isActive;
    }
    /**
     * Sort plugins by dependencies (topological sort)
     */
    sortByDependencies(discoveries) {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();
        const visit = (discovery) => {
            const id = discovery.manifest.id;
            if (visited.has(id)) {
                return;
            }
            if (visiting.has(id)) {
                console.warn(`[PluginManager] Circular dependency detected for plugin: ${id}`);
                return;
            }
            visiting.add(id);
            // Visit dependencies first
            const deps = discovery.manifest.dependencies || [];
            for (const depId of deps) {
                const depDiscovery = discoveries.find((d) => d.manifest.id === depId);
                if (depDiscovery) {
                    visit(depDiscovery);
                }
            }
            visiting.delete(id);
            visited.add(id);
            sorted.push(discovery);
        };
        discoveries.forEach((d) => visit(d));
        return sorted;
    }
    /**
     * Reload a plugin (deactivate, unload, load, activate)
     */
    async reloadPlugin(pluginId) {
        console.log(`[PluginManager] Reloading plugin: ${pluginId}`);
        // Deactivate if active
        if (this.isPluginActive(pluginId)) {
            await this.deactivatePlugin(pluginId);
        }
        // Unload
        const metadata = this.plugins.get(pluginId);
        if (metadata) {
            this.plugins.delete(pluginId);
            const index = this.loadOrder.indexOf(pluginId);
            if (index > -1) {
                this.loadOrder.splice(index, 1);
            }
        }
        // Reload
        const discoveries = await this.discoverPlugins();
        const discovery = discoveries.find((d) => d.manifest.id === pluginId);
        if (!discovery) {
            return {
                pluginId,
                success: false,
                error: 'Plugin not found during rediscovery',
            };
        }
        const loadResult = await this.loadPlugin(discovery.manifest, discovery.path);
        if (loadResult.success && this.config.autoActivate) {
            await this.activatePlugin(pluginId);
        }
        return loadResult;
    }
    /**
     * Get plugin statistics
     */
    getStats() {
        const all = this.getAllPlugins();
        return {
            total: all.length,
            loaded: all.filter((p) => p.isLoaded).length,
            active: all.filter((p) => p.isActive).length,
            failed: all.filter((p) => p.error).length,
        };
    }
    /**
     * Shutdown plugin manager (deactivate all plugins)
     */
    async shutdown() {
        console.log('[PluginManager] Shutting down...');
        await this.deactivateAll();
        this.plugins.clear();
        this.loadOrder = [];
        console.log('[PluginManager] Shutdown complete');
    }
}
exports.PluginManager = PluginManager;
