/**
 * Genre Pack Service
 * Manages genre pack loading with workspace override capability
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';
import { getWorkspaceService } from '../workspace-service';
import {
  GenrePackManifest,
  GenrePackInfo,
  GenrePack,
  GenrePackUpdateStatus,
} from '../../types/workspace';

/**
 * Genre Pack Service - Singleton for genre pack management
 */
export class GenrePackService {
  private static instance: GenrePackService | null = null;
  private cache: Map<string, GenrePack> = new Map();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): GenrePackService {
    if (!GenrePackService.instance) {
      GenrePackService.instance = new GenrePackService();
    }
    return GenrePackService.instance;
  }

  // ============================================================================
  // Genre Pack Loading
  // ============================================================================

  /**
   * Load genre pack (workspace first, then plugin)
   */
  async loadGenrePack(packName: string, forceRefresh = false): Promise<GenrePack | null> {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.cache.get(packName);
      if (cached && Date.now() - cached.loadedAt < this.cacheTTL) {
        return cached;
      }
    }

    // Try workspace first
    const workspaceService = getWorkspaceService();
    const workspacePath = workspaceService.getWorkspacePath();

    if (workspacePath) {
      const workspacePackPath = path.join(workspacePath, 'genre-packs', packName);
      const workspacePack = await this.loadGenrePackFromPath(
        workspacePackPath,
        'workspace'
      );

      if (workspacePack) {
        // Cache and return
        this.cache.set(packName, workspacePack);
        return workspacePack;
      }
    }

    // Fall back to plugin genre pack
    const pluginPackPath = path.join(app.getAppPath(), '.claude', 'genre-packs', packName);
    const pluginPack = await this.loadGenrePackFromPath(pluginPackPath, 'plugin');

    if (pluginPack) {
      this.cache.set(packName, pluginPack);
      return pluginPack;
    }

    return null;
  }

  /**
   * Load genre pack from specific path
   */
  private async loadGenrePackFromPath(
    packPath: string,
    source: 'workspace' | 'plugin'
  ): Promise<GenrePack | null> {
    try {
      // Check if directory exists
      const stats = await fs.stat(packPath);
      if (!stats.isDirectory()) {
        return null;
      }

      // Load manifest
      const manifestPath = path.join(packPath, 'manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest: GenrePackManifest = JSON.parse(manifestContent);

      // Check if workspace version overrides plugin
      const isOverride = source === 'workspace';

      // Load all files listed in manifest
      const files = new Map<string, string>();
      for (const filePath of manifest.files) {
        const fullPath = path.join(packPath, filePath);
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          files.set(filePath, content);
        } catch (error) {
          console.warn(`Failed to load genre pack file: ${filePath}`, error);
        }
      }

      return {
        manifest,
        source,
        path: packPath,
        isOverride,
        loadedAt: Date.now(),
        files,
      };
    } catch (error) {
      // Genre pack not found at this path
      return null;
    }
  }

  /**
   * Get genre pack file content
   */
  async getGenrePackFile(packName: string, filePath: string): Promise<string | null> {
    const pack = await this.loadGenrePack(packName);
    if (!pack) return null;

    return pack.files.get(filePath) || null;
  }

  // ============================================================================
  // Genre Pack Discovery
  // ============================================================================

  /**
   * List all available genre packs (workspace + plugin, merged)
   */
  async listAvailableGenrePacks(): Promise<GenrePackInfo[]> {
    const packs = new Map<string, GenrePackInfo>();

    // Load plugin genre packs first (as fallback)
    const pluginPath = path.join(app.getAppPath(), '.claude', 'genre-packs');
    const pluginPacks = await this.listGenrePacksInPath(pluginPath, 'plugin');

    for (const pack of pluginPacks) {
      packs.set(pack.manifest.name, pack);
    }

    // Load workspace genre packs (overrides plugin)
    const workspaceService = getWorkspaceService();
    const workspacePath = workspaceService.getWorkspacePath();

    if (workspacePath) {
      const workspacePacksPath = path.join(workspacePath, 'genre-packs');
      const workspacePacks = await this.listGenrePacksInPath(workspacePacksPath, 'workspace');

      for (const pack of workspacePacks) {
        // Mark as override if plugin version exists
        pack.isOverride = packs.has(pack.manifest.name);
        packs.set(pack.manifest.name, pack);
      }
    }

    return Array.from(packs.values()).sort((a, b) =>
      a.manifest.displayName.localeCompare(b.manifest.displayName)
    );
  }

  /**
   * List genre packs in a specific path
   */
  private async listGenrePacksInPath(
    basePath: string,
    source: 'workspace' | 'plugin'
  ): Promise<GenrePackInfo[]> {
    const packs: GenrePackInfo[] = [];

    try {
      const entries = await fs.readdir(basePath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const packPath = path.join(basePath, entry.name);
        const manifestPath = path.join(packPath, 'manifest.json');

        try {
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');
          const manifest: GenrePackManifest = JSON.parse(manifestContent);

          packs.push({
            manifest,
            source,
            path: packPath,
            isOverride: false, // Will be set later if workspace overrides plugin
          });
        } catch (error) {
          // Skip directories without valid manifest
          console.warn(`Skipping invalid genre pack: ${entry.name}`, error);
        }
      }
    } catch (error) {
      // Path doesn't exist or isn't accessible
      return [];
    }

    return packs;
  }

  // ============================================================================
  // Genre Pack Management
  // ============================================================================

  /**
   * Copy plugin genre pack to workspace for customization
   */
  async copyPluginGenrePackToWorkspace(packName: string): Promise<void> {
    const workspaceService = getWorkspaceService();
    const workspacePath = workspaceService.getWorkspacePath();

    if (!workspacePath) {
      throw new Error('No workspace configured');
    }

    // Source: plugin genre pack
    const pluginPackPath = path.join(app.getAppPath(), '.claude', 'genre-packs', packName);

    // Destination: workspace genre pack
    const workspacePackPath = path.join(workspacePath, 'genre-packs', packName);

    // Check if workspace version already exists
    try {
      await fs.access(workspacePackPath);
      throw new Error('Genre pack already exists in workspace');
    } catch {
      // Good - doesn't exist yet
    }

    // Copy directory recursively
    await this.copyDirectory(pluginPackPath, workspacePackPath);

    // Invalidate cache for this pack
    this.cache.delete(packName);
  }

  /**
   * Recursively copy directory
   */
  private async copyDirectory(source: string, destination: string): Promise<void> {
    await fs.mkdir(destination, { recursive: true });

    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }

  /**
   * Check for genre pack updates
   */
  async checkForGenrePackUpdates(packName: string): Promise<GenrePackUpdateStatus> {
    const workspaceService = getWorkspaceService();
    const workspacePath = workspaceService.getWorkspacePath();

    if (!workspacePath) {
      return { status: 'using_plugin', needsAction: false };
    }

    // Load workspace version
    const workspacePackPath = path.join(workspacePath, 'genre-packs', packName);
    const workspacePack = await this.loadGenrePackFromPath(
      workspacePackPath,
      'workspace'
    );

    if (!workspacePack) {
      return { status: 'using_plugin', needsAction: false };
    }

    // Load plugin version
    const pluginPackPath = path.join(app.getAppPath(), '.claude', 'genre-packs', packName);
    const pluginPack = await this.loadGenrePackFromPath(pluginPackPath, 'plugin');

    if (!pluginPack) {
      // Workspace has custom genre pack with no plugin equivalent
      return { status: 'up_to_date', needsAction: false };
    }

    // Compare versions
    if (workspacePack.manifest.version === pluginPack.manifest.version) {
      return { status: 'up_to_date', needsAction: false };
    }

    return {
      status: 'update_available',
      needsAction: true,
      workspaceVersion: workspacePack.manifest.version,
      pluginVersion: pluginPack.manifest.version,
      changes: [], // TODO: Implement diff logic
    };
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  /**
   * Invalidate cache for specific genre pack
   */
  invalidateCache(packName?: string): void {
    if (packName) {
      this.cache.delete(packName);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Get GenrePackService singleton
 */
export function getGenrePackService(): GenrePackService {
  return GenrePackService.getInstance();
}
