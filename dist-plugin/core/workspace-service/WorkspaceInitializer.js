"use strict";
/**
 * Workspace Initializer
 * Creates and initializes BQ-Studio workspace structure
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
exports.WorkspaceInitializer = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const GitService_1 = require("./GitService");
class WorkspaceInitializer {
    /**
     * Initialize a new workspace at the specified path
     */
    async initialize(options) {
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
        }
        catch (error) {
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
    async createWorkspaceStructure(workspacePath) {
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
    async createTemplateFiles(workspacePath, options) {
        // Read template files from BQ-Studio templates directory
        const templatesDir = path.join(process.cwd(), 'templates');
        // Create README
        const readmeTemplate = await this.loadTemplate(templatesDir, 'workspace-readme-template.md');
        const readme = this.processReadmeTemplate(readmeTemplate, options);
        await fs.writeFile(path.join(workspacePath, 'README.md'), readme, 'utf-8');
        // Create .gitignore if git is enabled
        if (options.initializeGit) {
            const gitignoreTemplate = await this.loadTemplate(templatesDir, 'workspace-gitignore-template.txt');
            await fs.writeFile(path.join(workspacePath, '.gitignore'), gitignoreTemplate, 'utf-8');
        }
    }
    /**
     * Load template file from templates directory
     */
    async loadTemplate(templatesDir, filename) {
        try {
            const templatePath = path.join(templatesDir, filename);
            return await fs.readFile(templatePath, 'utf-8');
        }
        catch (error) {
            console.error(`Failed to load template ${filename}:`, error);
            return '';
        }
    }
    /**
     * Process README template with variables
     * Simple template processing - replaces {{variable}} with values
     */
    processReadmeTemplate(template, options) {
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
            return String(variables[varName] ?? match);
        });
        return processed;
    }
    /**
     * Initialize Git repository
     */
    async initializeGit(workspacePath, createInitialCommit) {
        const gitService = (0, GitService_1.getGitService)();
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
    async validateStructure(workspacePath) {
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
        }
        catch {
            return false;
        }
    }
    /**
     * Repair workspace structure
     * Creates missing directories
     */
    async repairStructure(workspacePath) {
        await this.createWorkspaceStructure(workspacePath);
    }
}
exports.WorkspaceInitializer = WorkspaceInitializer;
