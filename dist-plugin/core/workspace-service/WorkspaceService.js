"use strict";
/**
 * Workspace Service
 * Core service for managing BQ-Studio workspace
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
exports.WorkspaceService = void 0;
exports.getWorkspaceService = getWorkspaceService;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const types_1 = require("./types");
const WorkspaceInitializer_1 = require("./WorkspaceInitializer");
/**
 * WorkspaceService - Singleton service for workspace management
 */
class WorkspaceService {
    constructor() {
        this.workspaceConfig = null;
        this.configPath = path.join(electron_1.app.getPath('userData'), 'bq-studio-config.json');
        this.initializer = new WorkspaceInitializer_1.WorkspaceInitializer();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
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
    async loadConfig() {
        try {
            const configData = await fs.readFile(this.configPath, 'utf-8');
            const config = JSON.parse(configData);
            this.workspaceConfig = config.workspace || null;
            return this.workspaceConfig;
        }
        catch (error) {
            // Config file doesn't exist or is invalid
            return null;
        }
    }
    /**
     * Save workspace configuration to disk
     */
    async saveConfig(workspaceConfig) {
        try {
            let config = {};
            // Try to read existing config
            try {
                const existing = await fs.readFile(this.configPath, 'utf-8');
                config = JSON.parse(existing);
            }
            catch {
                // File doesn't exist, start with empty config
            }
            // Update workspace section
            config.workspace = workspaceConfig;
            config.version = '1.0';
            // Write config
            await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
            this.workspaceConfig = workspaceConfig;
        }
        catch (error) {
            throw new Error(`Failed to save workspace config: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get current workspace configuration
     */
    getConfig() {
        return this.workspaceConfig;
    }
    // ============================================================================
    // Workspace Path Management
    // ============================================================================
    /**
     * Get workspace path
     */
    getWorkspacePath() {
        return this.workspaceConfig?.path || null;
    }
    /**
     * Set workspace path
     */
    async setWorkspacePath(workspacePath) {
        const validation = await this.validate(workspacePath);
        if (validation.state !== types_1.WorkspaceValidationState.VALID) {
            throw new Error(`Invalid workspace path: ${validation.error}`);
        }
        const config = {
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
    getWorkspaceStructure() {
        const workspacePath = this.getWorkspacePath();
        if (!workspacePath)
            return null;
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
    getDefaultWorkspacePath() {
        return path.join(electron_1.app.getPath('documents'), 'BQ-Studio-Workspace');
    }
    // ============================================================================
    // Workspace Initialization
    // ============================================================================
    /**
     * Check if this is first run (no workspace configured)
     */
    async isFirstRun() {
        const config = await this.loadConfig();
        if (!config || !config.path)
            return true;
        // Check if workspace still exists
        try {
            await fs.access(config.path);
            return false;
        }
        catch {
            return true;
        }
    }
    /**
     * Initialize new workspace
     */
    async initializeWorkspace(options) {
        const result = await this.initializer.initialize(options);
        if (!result.success) {
            throw new Error(result.error || 'Failed to initialize workspace');
        }
        // Save workspace configuration
        const config = {
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
    async validate(workspacePath) {
        const pathToValidate = workspacePath || this.getWorkspacePath();
        if (!pathToValidate) {
            return {
                state: types_1.WorkspaceValidationState.NOT_CONFIGURED,
                error: 'No workspace configured',
                suggestions: ['Run workspace setup wizard', 'Configure workspace in settings'],
            };
        }
        // Check if path exists
        try {
            await fs.access(pathToValidate);
        }
        catch {
            return {
                state: types_1.WorkspaceValidationState.INVALID_PATH,
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
                state: types_1.WorkspaceValidationState.PERMISSION_DENIED,
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
                state: types_1.WorkspaceValidationState.STRUCTURE_INVALID,
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
            state: types_1.WorkspaceValidationState.VALID,
            path: pathToValidate,
            type: workspaceType,
        };
    }
    /**
     * Check workspace permissions
     */
    async checkPermissions(workspacePath) {
        try {
            // Test write permission
            const testFile = path.join(workspacePath, '.bq-studio-write-test');
            await fs.writeFile(testFile, 'test', 'utf-8');
            await fs.unlink(testFile);
            return { readable: true, writable: true };
        }
        catch (error) {
            // Check if at least readable
            try {
                await fs.readdir(workspacePath);
                return { readable: true, writable: false };
            }
            catch {
                return { readable: false, writable: false };
            }
        }
    }
    /**
     * Detect workspace type (local, network, cloud sync)
     */
    async detectWorkspaceType(workspacePath) {
        // Check for network drive (Windows UNC path)
        if (process.platform === 'win32' && workspacePath.startsWith('\\\\')) {
            return types_1.WorkspaceType.NETWORK;
        }
        // Check for cloud sync indicators
        const cloudPatterns = [/Dropbox/i, /Google Drive/i, /OneDrive/i, /iCloud/i];
        if (cloudPatterns.some((pattern) => pattern.test(workspacePath))) {
            return types_1.WorkspaceType.CLOUD_SYNC;
        }
        return types_1.WorkspaceType.LOCAL;
    }
    /**
     * Repair workspace structure
     */
    async repairStructure() {
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
    async updateGitConfig(isEnabled, remoteUrl) {
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
    isGitEnabled() {
        return this.workspaceConfig?.isGitEnabled ?? false;
    }
    /**
     * Get Git remote URL
     */
    getGitRemoteUrl() {
        return this.workspaceConfig?.gitRemoteUrl;
    }
}
exports.WorkspaceService = WorkspaceService;
WorkspaceService.instance = null;
/**
 * Get singleton instance (convenience export)
 */
function getWorkspaceService() {
    return WorkspaceService.getInstance();
}
