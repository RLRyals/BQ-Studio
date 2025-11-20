/**
 * Plugin Manager
 * Core plugin loading and lifecycle management system for BQ Studio
 */

import * as fs from 'fs';
import * as path from 'path';
import { PluginContext } from './PluginContext';
import { validatePluginManifest } from './validator';
import {
  Plugin,
  PluginManifest,
  PluginMetadata,
  PluginManagerConfig,
  PluginDiscoveryResult,
  PluginLoadResult,
  PluginActivationResult,
  PluginError,
  PluginErrorType,
  CoreServices,
} from './types';

/**
 * PluginManager class
 * Discovers, loads, and manages plugin lifecycle
 */
export class PluginManager {
  private config: PluginManagerConfig;
  private plugins: Map<string, PluginMetadata> = new Map();
  private loadOrder: string[] = [];

  constructor(config: PluginManagerConfig) {
    this.config = {
      enableSandbox: false,
      autoActivate: true,
      ...config,
    };
  }

  /**
   * Initialize plugin manager and discover all plugins
   */
  async initialize(): Promise<void> {
    console.log('[PluginManager] Initializing...');
    console.log(`[PluginManager] Plugins path: ${this.config.pluginsPath}`);

    // Ensure plugins directory exists
    if (!fs.existsSync(this.config.pluginsPath)) {
      console.warn(
        `[PluginManager] Plugins directory not found: ${this.config.pluginsPath}`
      );
      console.log('[PluginManager] Creating plugins directory...');
      fs.mkdirSync(this.config.pluginsPath, { recursive: true });
    }

    // Discover plugins
    const discovered = await this.discoverPlugins();
    console.log(`[PluginManager] Discovered ${discovered.length} plugin(s)`);

    // Load plugins
    const loadResults = await this.loadPlugins(discovered);
    const successCount = loadResults.filter((r) => r.success).length;
    console.log(
      `[PluginManager] Loaded ${successCount}/${loadResults.length} plugin(s)`
    );

    // Auto-activate if enabled
    if (this.config.autoActivate) {
      const activateResults = await this.activateAll();
      const activatedCount = activateResults.filter((r) => r.success).length;
      console.log(
        `[PluginManager] Activated ${activatedCount}/${activateResults.length} plugin(s)`
      );
    }

    console.log('[PluginManager] Initialization complete');
  }

  /**
   * Discover all plugins in the plugins directory
   */
  async discoverPlugins(): Promise<PluginDiscoveryResult[]> {
    const results: PluginDiscoveryResult[] = [];

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
        console.warn(
          `[PluginManager] Skipping ${entry.name}: plugin.json not found`
        );
        continue;
      }

      try {
        // Read and parse manifest
        const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent) as PluginManifest;

        // Validate manifest
        const validation = validatePluginManifest(manifest);

        if (!validation.valid) {
          results.push({
            manifest,
            path: pluginPath,
            errors: validation.errors.map((e) => `${e.field}: ${e.message}`),
          });
          console.error(
            `[PluginManager] Invalid manifest for ${entry.name}:`,
            validation.errors
          );
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
      } catch (error) {
        console.error(
          `[PluginManager] Error discovering plugin ${entry.name}:`,
          error
        );
        continue;
      }
    }

    return results;
  }

  /**
   * Load plugins from discovery results
   */
  async loadPlugins(
    discoveries: PluginDiscoveryResult[]
  ): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = [];

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
  async loadPlugin(
    manifest: PluginManifest,
    pluginPath: string
  ): Promise<PluginLoadResult> {
    const pluginId = manifest.id;

    try {
      // Check if already loaded
      if (this.plugins.has(pluginId)) {
        throw new PluginError(
          PluginErrorType.ALREADY_LOADED,
          pluginId,
          `Plugin '${pluginId}' is already loaded`
        );
      }

      // Check dependencies
      if (manifest.dependencies) {
        for (const depId of manifest.dependencies) {
          if (!this.plugins.has(depId)) {
            throw new PluginError(
              PluginErrorType.DEPENDENCY_NOT_MET,
              pluginId,
              `Dependency '${depId}' not loaded`
            );
          }
        }
      }

      // Resolve entry point
      const entryPath = path.join(pluginPath, manifest.entry);
      if (!fs.existsSync(entryPath)) {
        throw new PluginError(
          PluginErrorType.ENTRY_NOT_FOUND,
          pluginId,
          `Entry file not found: ${manifest.entry}`
        );
      }

      // Import plugin module
      // Note: In production, this would use dynamic import
      // For now, we create a metadata stub
      const metadata: PluginMetadata = {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
  async activatePlugin(pluginId: string): Promise<PluginActivationResult> {
    try {
      const metadata = this.plugins.get(pluginId);

      if (!metadata) {
        throw new PluginError(
          PluginErrorType.NOT_LOADED,
          pluginId,
          `Plugin '${pluginId}' is not loaded`
        );
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
            throw new PluginError(
              PluginErrorType.DEPENDENCY_NOT_MET,
              pluginId,
              `Failed to activate dependency '${depId}'`
            );
          }
        }
      }

      // Create plugin context
      const context = new PluginContext(
        metadata.manifest,
        metadata.path,
        this.config.coreServices || {},
        this
      );

      // For now, we'll create a mock plugin instance
      // In production, this would be the actual imported plugin class
      const pluginInstance: Plugin = {
        id: metadata.manifest.id,
        name: metadata.manifest.name,
        version: metadata.manifest.version,
        description: metadata.manifest.description,
        onActivate: async (ctx: PluginContext) => {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
  async deactivatePlugin(pluginId: string): Promise<PluginActivationResult> {
    try {
      const metadata = this.plugins.get(pluginId);

      if (!metadata) {
        throw new PluginError(
          PluginErrorType.NOT_LOADED,
          pluginId,
          `Plugin '${pluginId}' is not loaded`
        );
      }

      if (!metadata.isActive) {
        return {
          pluginId,
          success: true,
        };
      }

      // Check if other plugins depend on this one
      for (const [otherId, otherMeta] of this.plugins.entries()) {
        if (
          otherMeta.isActive &&
          otherMeta.manifest.dependencies?.includes(pluginId)
        ) {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[PluginManager] Failed to deactivate ${pluginId}:`,
        error
      );

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
  async activateAll(): Promise<PluginActivationResult[]> {
    const results: PluginActivationResult[] = [];

    for (const pluginId of this.loadOrder) {
      const result = await this.activatePlugin(pluginId);
      results.push(result);
    }

    return results;
  }

  /**
   * Deactivate all active plugins
   */
  async deactivateAll(): Promise<PluginActivationResult[]> {
    const results: PluginActivationResult[] = [];

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
  getPlugin(pluginId: string): PluginMetadata | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get loaded plugins
   */
  getLoadedPlugins(): PluginMetadata[] {
    return this.getAllPlugins().filter((p) => p.isLoaded);
  }

  /**
   * Get active plugins
   */
  getActivePlugins(): PluginMetadata[] {
    return this.getAllPlugins().filter((p) => p.isActive);
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(pluginId: string): boolean {
    return this.plugins.has(pluginId) && this.plugins.get(pluginId)!.isLoaded;
  }

  /**
   * Check if plugin is active
   */
  isPluginActive(pluginId: string): boolean {
    return this.plugins.has(pluginId) && this.plugins.get(pluginId)!.isActive;
  }

  /**
   * Sort plugins by dependencies (topological sort)
   */
  private sortByDependencies(
    discoveries: PluginDiscoveryResult[]
  ): PluginDiscoveryResult[] {
    const sorted: PluginDiscoveryResult[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (discovery: PluginDiscoveryResult) => {
      const id = discovery.manifest.id;

      if (visited.has(id)) {
        return;
      }

      if (visiting.has(id)) {
        console.warn(
          `[PluginManager] Circular dependency detected for plugin: ${id}`
        );
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
  async reloadPlugin(pluginId: string): Promise<PluginLoadResult> {
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

    const loadResult = await this.loadPlugin(
      discovery.manifest,
      discovery.path
    );

    if (loadResult.success && this.config.autoActivate) {
      await this.activatePlugin(pluginId);
    }

    return loadResult;
  }

  /**
   * Get plugin statistics
   */
  getStats(): {
    total: number;
    loaded: number;
    active: number;
    failed: number;
  } {
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
  async shutdown(): Promise<void> {
    console.log('[PluginManager] Shutting down...');
    await this.deactivateAll();
    this.plugins.clear();
    this.loadOrder = [];
    console.log('[PluginManager] Shutdown complete');
  }
}
