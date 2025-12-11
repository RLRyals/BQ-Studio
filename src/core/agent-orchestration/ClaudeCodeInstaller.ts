/**
 * Claude Code CLI Installer
 * Detects, installs, and manages Claude Code CLI
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';

const execAsync = promisify(exec);

export interface ClaudeCodeInfo {
  isInstalled: boolean;
  version?: string;
  path?: string;
  needsUpdate?: boolean;
}

export class ClaudeCodeInstaller {
  private static instance: ClaudeCodeInstaller;
  private cachedInfo: ClaudeCodeInfo | null = null;

  private constructor() {}

  static getInstance(): ClaudeCodeInstaller {
    if (!ClaudeCodeInstaller.instance) {
      ClaudeCodeInstaller.instance = new ClaudeCodeInstaller();
    }
    return ClaudeCodeInstaller.instance;
  }

  /**
   * Check if Claude Code CLI is installed
   */
  async detectCLI(): Promise<ClaudeCodeInfo> {
    // Clear cache
    this.cachedInfo = null;

    try {
      // Try to run claude-code --version
      const { stdout, stderr } = await execAsync('claude-code --version', {
        timeout: 5000,
      });

      const version = stdout.trim() || stderr.trim();

      this.cachedInfo = {
        isInstalled: true,
        version,
        path: await this.findCLIPath(),
      };

      return this.cachedInfo;
    } catch (error) {
      // CLI not found in PATH
      // Try to find it in common locations
      const commonPaths = await this.getCommonCLIPaths();

      for (const cliPath of commonPaths) {
        try {
          const exists = await this.fileExists(cliPath);
          if (exists) {
            // Found it! Get version
            const { stdout } = await execAsync(`"${cliPath}" --version`, {
              timeout: 5000,
            });

            this.cachedInfo = {
              isInstalled: true,
              version: stdout.trim(),
              path: cliPath,
            };

            return this.cachedInfo;
          }
        } catch (err) {
          // Keep trying other paths
          continue;
        }
      }

      // Not found anywhere
      this.cachedInfo = {
        isInstalled: false,
      };

      return this.cachedInfo;
    }
  }

  /**
   * Get common paths where Claude Code CLI might be installed
   */
  private async getCommonCLIPaths(): Promise<string[]> {
    const platform = process.platform;
    const paths: string[] = [];

    if (platform === 'win32') {
      // Windows paths
      const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
      const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
      const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
      const localAppData = process.env.LOCALAPPDATA || path.join(userProfile, 'AppData', 'Local');

      paths.push(
        path.join(localAppData, 'Programs', 'claude-code', 'claude-code.exe'),
        path.join(programFiles, 'Claude Code', 'claude-code.exe'),
        path.join(programFilesX86, 'Claude Code', 'claude-code.exe'),
        path.join(userProfile, '.claude-code', 'bin', 'claude-code.exe'),
        // VS Code extension path
        path.join(userProfile, '.vscode', 'extensions', 'anthropic.claude-code-*', 'bin', 'claude-code.exe'),
      );
    } else if (platform === 'darwin') {
      // macOS paths
      const home = process.env.HOME || '/Users/default';

      paths.push(
        '/usr/local/bin/claude-code',
        '/opt/homebrew/bin/claude-code',
        path.join(home, '.local', 'bin', 'claude-code'),
        path.join(home, '.claude-code', 'bin', 'claude-code'),
        // VS Code extension path
        path.join(home, '.vscode', 'extensions', 'anthropic.claude-code-*', 'bin', 'claude-code'),
      );
    } else {
      // Linux paths
      const home = process.env.HOME || '/home/default';

      paths.push(
        '/usr/local/bin/claude-code',
        '/usr/bin/claude-code',
        path.join(home, '.local', 'bin', 'claude-code'),
        path.join(home, '.claude-code', 'bin', 'claude-code'),
        // VS Code extension path
        path.join(home, '.vscode', 'extensions', 'anthropic.claude-code-*', 'bin', 'claude-code'),
      );
    }

    return paths;
  }

  /**
   * Install Claude Code CLI
   */
  async installCLI(
    onProgress?: (message: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      onProgress?.('Detecting platform...');

      const platform = process.platform;
      const installMethod = this.getInstallMethod(platform);

      onProgress?.(`Installing via ${installMethod}...`);

      if (platform === 'win32') {
        return await this.installOnWindows(onProgress);
      } else if (platform === 'darwin') {
        return await this.installOnMacOS(onProgress);
      } else {
        return await this.installOnLinux(onProgress);
      }
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Install on Windows
   */
  private async installOnWindows(
    onProgress?: (message: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Try npm installation first
      onProgress?.('Installing via npm...');

      await execAsync('npm install -g @anthropic-ai/claude-code', {
        timeout: 120000, // 2 minutes
      });

      onProgress?.('Verifying installation...');

      // Verify installation
      const info = await this.detectCLI();
      if (info.isInstalled) {
        return { success: true };
      }

      return {
        success: false,
        error: 'Installation completed but CLI not detected',
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: `Installation failed: ${err.message}`,
      };
    }
  }

  /**
   * Install on macOS
   */
  private async installOnMacOS(
    onProgress?: (message: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Try homebrew first
      onProgress?.('Checking for Homebrew...');

      try {
        await execAsync('which brew', { timeout: 5000 });

        onProgress?.('Installing via Homebrew...');
        await execAsync('brew install anthropic/tap/claude-code', {
          timeout: 120000,
        });

        const info = await this.detectCLI();
        if (info.isInstalled) {
          return { success: true };
        }
      } catch (err) {
        // Homebrew not available, try npm
        onProgress?.('Homebrew not found, trying npm...');
      }

      // Fallback to npm
      await execAsync('npm install -g @anthropic-ai/claude-code', {
        timeout: 120000,
      });

      onProgress?.('Verifying installation...');

      const info = await this.detectCLI();
      if (info.isInstalled) {
        return { success: true };
      }

      return {
        success: false,
        error: 'Installation completed but CLI not detected',
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: `Installation failed: ${err.message}`,
      };
    }
  }

  /**
   * Install on Linux
   */
  private async installOnLinux(
    onProgress?: (message: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      onProgress?.('Installing via npm...');

      await execAsync('npm install -g @anthropic-ai/claude-code', {
        timeout: 120000,
      });

      onProgress?.('Verifying installation...');

      const info = await this.detectCLI();
      if (info.isInstalled) {
        return { success: true };
      }

      return {
        success: false,
        error: 'Installation completed but CLI not detected',
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: `Installation failed: ${err.message}`,
      };
    }
  }

  /**
   * Get recommended installation method for platform
   */
  private getInstallMethod(platform: string): string {
    switch (platform) {
      case 'win32':
        return 'npm';
      case 'darwin':
        return 'Homebrew (or npm)';
      case 'linux':
        return 'npm';
      default:
        return 'npm';
    }
  }

  /**
   * Find CLI path in PATH
   */
  private async findCLIPath(): Promise<string | undefined> {
    try {
      const command = process.platform === 'win32' ? 'where claude-code' : 'which claude-code';
      const { stdout } = await execAsync(command, { timeout: 5000 });
      return stdout.trim().split('\n')[0]; // First result
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cached CLI info
   */
  getCachedInfo(): ClaudeCodeInfo | null {
    return this.cachedInfo;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedInfo = null;
  }

  /**
   * Open installation instructions in browser
   */
  openInstallationGuide(): void {
    const url = 'https://docs.anthropic.com/claude-code/installation';
    const { shell } = require('electron');
    shell.openExternal(url);
  }
}
