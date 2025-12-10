/**
 * Workspace Initializer
 * Creates and initializes BQ-Studio workspace structure
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { WorkspaceInitOptions, WorkspaceCreationResult } from './types';
import { getGitService } from './GitService';

export class WorkspaceInitializer {
  /**
   * Initialize a new workspace at the specified path
   */
  async initialize(options: WorkspaceInitOptions): Promise<WorkspaceCreationResult> {
    try {
      const { path: workspacePath } = options;

      // Create workspace directory if it doesn't exist
      await fs.mkdir(workspacePath, { recursive: true });

      // Create workspace structure
      await this.createWorkspaceStructure(workspacePath);

      // Create template files
      await this.createTemplateFiles(workspacePath, options);

      // Initialize Git if requested
      if (options.initializeGit) {
        await this.initializeGit(workspacePath, options.createInitialCommit);
      }

      return {
        success: true,
        path: workspacePath,
        message: 'Workspace initialized successfully',
      };
    } catch (error) {
      return {
        success: false,
        path: options.path,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create workspace directory structure
   */
  private async createWorkspaceStructure(workspacePath: string): Promise<void> {
    const directories = [
      'series-planning',
      'genre-packs',
      'templates',
      'exports',
    ];

    for (const dir of directories) {
      const dirPath = path.join(workspacePath, dir);
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Create template files in workspace
   */
  private async createTemplateFiles(
    workspacePath: string,
    options: WorkspaceInitOptions
  ): Promise<void> {
    // Read template files from BQ-Studio templates directory
    const templatesDir = path.join(process.cwd(), 'templates');

    // Create README
    const readmeTemplate = await this.loadTemplate(templatesDir, 'workspace-readme-template.md');
    const readme = this.processReadmeTemplate(readmeTemplate, options);
    await fs.writeFile(path.join(workspacePath, 'README.md'), readme, 'utf-8');

    // Create .gitignore if git is enabled
    if (options.initializeGit) {
      const gitignoreTemplate = await this.loadTemplate(
        templatesDir,
        'workspace-gitignore-template.txt'
      );
      await fs.writeFile(path.join(workspacePath, '.gitignore'), gitignoreTemplate, 'utf-8');
    }
  }

  /**
   * Load template file from templates directory
   */
  private async loadTemplate(templatesDir: string, filename: string): Promise<string> {
    try {
      const templatePath = path.join(templatesDir, filename);
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Failed to load template ${filename}:`, error);
      return '';
    }
  }

  /**
   * Process README template with variables
   * Simple template processing - replaces {{variable}} with values
   */
  private processReadmeTemplate(
    template: string,
    options: WorkspaceInitOptions
  ): string {
    const variables = {
      gitEnabled: options.initializeGit,
      createdDate: new Date().toISOString().split('T')[0],
      bqStudioVersion: process.env.npm_package_version || 'unknown',
    };

    let processed = template;

    // Simple template processing
    // Replace {{#if gitEnabled}}...{{else}}...{{/if}} blocks
    const gitEnabledRegex = /\{\{#if gitEnabled\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
    processed = processed.replace(gitEnabledRegex, (_match, ifBlock, elseBlock) => {
      return variables.gitEnabled ? ifBlock : elseBlock;
    });

    // Replace simple {{variable}} placeholders
    processed = processed.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return String(variables[varName as keyof typeof variables] ?? match);
    });

    return processed;
  }

  /**
   * Initialize Git repository
   */
  private async initializeGit(
    workspacePath: string,
    createInitialCommit?: boolean
  ): Promise<void> {
    const gitService = getGitService();

    // Initialize repository
    const initResult = await gitService.initRepository(workspacePath);
    if (!initResult.success) {
      throw new Error(initResult.error || 'Failed to initialize Git repository');
    }

    // Create initial commit if requested
    if (createInitialCommit) {
      gitService.initialize(workspacePath);

      const commitResult = await gitService.commit('Initial workspace setup');
      if (!commitResult.success) {
        console.warn('Failed to create initial commit:', commitResult.error);
        // Don't throw - git is initialized, just no initial commit
      }
    }
  }

  /**
   * Validate workspace structure
   * Checks if all required directories exist
   */
  async validateStructure(workspacePath: string): Promise<boolean> {
    const requiredDirs = ['series-planning', 'genre-packs', 'templates', 'exports'];

    try {
      for (const dir of requiredDirs) {
        const dirPath = path.join(workspacePath, dir);
        const stats = await fs.stat(dirPath);
        if (!stats.isDirectory()) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Repair workspace structure
   * Creates missing directories
   */
  async repairStructure(workspacePath: string): Promise<void> {
    await this.createWorkspaceStructure(workspacePath);
  }
}
