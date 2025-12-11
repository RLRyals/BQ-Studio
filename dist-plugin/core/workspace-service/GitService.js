"use strict";
/**
 * Git Service
 * Manages Git operations for workspace using simple-git
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitService = void 0;
exports.getGitService = getGitService;
const simple_git_1 = __importDefault(require("simple-git"));
class GitService {
    constructor() {
        this.git = null;
        this.workspacePath = null;
    }
    /**
     * Initialize Git service for a workspace
     */
    initialize(workspacePath) {
        this.workspacePath = workspacePath;
        this.git = (0, simple_git_1.default)(workspacePath);
    }
    /**
     * Check if workspace is initialized
     */
    ensureInitialized() {
        if (!this.git || !this.workspacePath) {
            throw new Error('Git service not initialized. Call initialize() first.');
        }
    }
    // ============================================================================
    // Repository Management
    // ============================================================================
    /**
     * Initialize a new Git repository
     */
    async initRepository(workspacePath) {
        try {
            this.initialize(workspacePath);
            await this.git.init();
            return {
                success: true,
                message: 'Git repository initialized successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to initialize repository',
            };
        }
    }
    /**
     * Check if path is a Git repository
     */
    async isRepository(workspacePath) {
        try {
            const pathToCheck = workspacePath || this.workspacePath;
            if (!pathToCheck)
                return false;
            const git = (0, simple_git_1.default)(pathToCheck);
            await git.revparse(['--git-dir']);
            return true;
        }
        catch {
            return false;
        }
    }
    // ============================================================================
    // Remote Management
    // ============================================================================
    /**
     * Add remote repository
     */
    async addRemote(name, url) {
        this.ensureInitialized();
        try {
            await this.git.addRemote(name, url);
            return {
                success: true,
                message: `Remote "${name}" added successfully`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to add remote',
            };
        }
    }
    /**
     * Get remote URL
     */
    async getRemoteUrl(name = 'origin') {
        this.ensureInitialized();
        try {
            const remotes = await this.git.getRemotes(true);
            const remote = remotes.find((r) => r.name === name);
            return remote?.refs.fetch || null;
        }
        catch {
            return null;
        }
    }
    /**
     * Update remote URL
     */
    async setRemoteUrl(name, url) {
        this.ensureInitialized();
        try {
            await this.git.remote(['set-url', name, url]);
            return {
                success: true,
                message: `Remote "${name}" URL updated successfully`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update remote URL',
            };
        }
    }
    /**
     * Remove remote
     */
    async removeRemote(name) {
        this.ensureInitialized();
        try {
            await this.git.removeRemote(name);
            return {
                success: true,
                message: `Remote "${name}" removed successfully`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove remote',
            };
        }
    }
    // ============================================================================
    // Status & Info
    // ============================================================================
    /**
     * Get repository status
     */
    async status() {
        this.ensureInitialized();
        try {
            const isRepo = await this.isRepository();
            if (!isRepo) {
                return {
                    isRepository: false,
                    hasRemote: false,
                    branch: '',
                    ahead: 0,
                    behind: 0,
                    modified: [],
                    added: [],
                    deleted: [],
                    untracked: [],
                    conflicted: [],
                };
            }
            const status = await this.git.status();
            const remoteUrl = await this.getRemoteUrl();
            return {
                isRepository: true,
                hasRemote: remoteUrl !== null,
                remoteUrl: remoteUrl || undefined,
                remoteName: remoteUrl ? 'origin' : undefined,
                branch: status.current || 'main',
                ahead: status.ahead,
                behind: status.behind,
                modified: status.modified,
                added: status.created,
                deleted: status.deleted,
                untracked: status.not_added,
                conflicted: status.conflicted,
            };
        }
        catch (error) {
            throw new Error(`Failed to get Git status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ============================================================================
    // Commit Operations
    // ============================================================================
    /**
     * Stage files
     */
    async add(files) {
        this.ensureInitialized();
        try {
            if (!files || files.length === 0) {
                // Stage all changes
                await this.git.add('.');
            }
            else {
                // Stage specific files
                await this.git.add(files);
            }
            return {
                success: true,
                message: 'Files staged successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to stage files',
            };
        }
    }
    /**
     * Commit changes
     */
    async commit(message, files) {
        this.ensureInitialized();
        try {
            // Stage files if specified
            if (files && files.length > 0) {
                await this.add(files);
            }
            else {
                // Stage all changes
                await this.add();
            }
            // Commit
            const result = await this.git.commit(message);
            return {
                success: true,
                message: `Committed: ${result.summary.changes} changes, ${result.summary.insertions} insertions, ${result.summary.deletions} deletions`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to commit changes',
            };
        }
    }
    // ============================================================================
    // Push/Pull Operations
    // ============================================================================
    /**
     * Push to remote
     */
    async push(remote = 'origin', branch) {
        this.ensureInitialized();
        try {
            const currentBranch = branch || (await this.git.revparse(['--abbrev-ref', 'HEAD']));
            await this.git.push(remote, currentBranch);
            return {
                success: true,
                message: `Pushed to ${remote}/${currentBranch}`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to push',
            };
        }
    }
    /**
     * Pull from remote
     */
    async pull(remote = 'origin', branch) {
        this.ensureInitialized();
        try {
            const currentBranch = branch || (await this.git.revparse(['--abbrev-ref', 'HEAD']));
            await this.git.pull(remote, currentBranch);
            return {
                success: true,
                message: `Pulled from ${remote}/${currentBranch}`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to pull',
            };
        }
    }
    // ============================================================================
    // Branch Operations
    // ============================================================================
    /**
     * Get current branch name
     */
    async getCurrentBranch() {
        this.ensureInitialized();
        try {
            const status = await this.git.status();
            return status.current || 'main';
        }
        catch {
            return 'main';
        }
    }
    /**
     * Create new branch
     */
    async createBranch(branchName) {
        this.ensureInitialized();
        try {
            await this.git.branch([branchName]);
            return {
                success: true,
                message: `Branch "${branchName}" created successfully`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create branch',
            };
        }
    }
    /**
     * Checkout branch
     */
    async checkoutBranch(branchName) {
        this.ensureInitialized();
        try {
            await this.git.checkout(branchName);
            return {
                success: true,
                message: `Switched to branch "${branchName}"`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to checkout branch',
            };
        }
    }
    // ============================================================================
    // Helper Methods
    // ============================================================================
    /**
     * Check if there are uncommitted changes
     */
    async hasUncommittedChanges() {
        this.ensureInitialized();
        try {
            const status = await this.git.status();
            return !status.isClean();
        }
        catch {
            return false;
        }
    }
    /**
     * Get commit history
     */
    async getLog(maxCount = 10) {
        this.ensureInitialized();
        try {
            const log = await this.git.log({ maxCount });
            return [...log.all];
        }
        catch {
            return [];
        }
    }
}
exports.GitService = GitService;
/**
 * Singleton instance
 */
let gitServiceInstance = null;
/**
 * Get GitService singleton
 */
function getGitService() {
    if (!gitServiceInstance) {
        gitServiceInstance = new GitService();
    }
    return gitServiceInstance;
}
