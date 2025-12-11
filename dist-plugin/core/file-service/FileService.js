"use strict";
/**
 * File Service
 * Core file operations service with sandboxed access, templates, and exports
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
exports.FileService = void 0;
exports.createFileService = createFileService;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const chokidar_1 = require("chokidar");
const types_1 = require("./types");
const TemplateEngine_1 = require("./TemplateEngine");
const DocxExporter_1 = require("./exporters/DocxExporter");
const PdfExporter_1 = require("./exporters/PdfExporter");
/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    enableWatcher: true,
    watcherOptions: {
        ignored: '/(^|[\\/\\\\])\\../',
        persistent: true,
        ignoreInitial: true,
    },
};
/**
 * FileService class
 * Provides sandboxed file operations, template processing, and multi-format exports
 */
class FileService {
    constructor(config) {
        this.watchers = new Map();
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
        this.templateEngine = new TemplateEngine_1.TemplateEngine();
        this.docxExporter = new DocxExporter_1.DocxExporter();
        this.pdfExporter = new PdfExporter_1.PdfExporter();
    }
    // ============================================================================
    // Path Validation & Utilities
    // ============================================================================
    /**
     * Resolve and validate path is within workspace
     */
    resolvePath(filePath) {
        const resolved = path.isAbsolute(filePath)
            ? path.normalize(filePath)
            : path.normalize(path.join(this.config.workspaceRoot, filePath));
        // Security check: ensure path is within workspace
        if (!resolved.startsWith(this.config.workspaceRoot)) {
            throw new types_1.FileServiceError(`Path "${filePath}" is outside workspace root`, types_1.FileServiceErrorCode.SANDBOX_VIOLATION, filePath);
        }
        return resolved;
    }
    /**
     * Check if file extension is allowed
     */
    checkExtension(filePath) {
        if (!this.config.allowedExtensions)
            return;
        const ext = path.extname(filePath).toLowerCase();
        if (!this.config.allowedExtensions.includes(ext)) {
            throw new types_1.FileServiceError(`File type "${ext}" is not allowed`, types_1.FileServiceErrorCode.INVALID_FILE_TYPE, filePath);
        }
    }
    /**
     * Check if file size is within limits
     */
    async checkFileSize(filePath) {
        const stats = await fs.stat(filePath);
        if (stats.size > this.config.maxFileSize) {
            throw new types_1.FileServiceError(`File size (${stats.size} bytes) exceeds maximum (${this.config.maxFileSize} bytes)`, types_1.FileServiceErrorCode.FILE_TOO_LARGE, filePath);
        }
    }
    // ============================================================================
    // File Operations
    // ============================================================================
    /**
     * Read file contents
     */
    async readFile(filePath, options = {}) {
        try {
            const resolved = this.resolvePath(filePath);
            this.checkExtension(resolved);
            await this.checkFileSize(resolved);
            const encoding = options.encoding || 'utf-8';
            const content = await fs.readFile(resolved, options.raw ? undefined : encoding);
            return content;
        }
        catch (error) {
            if (error instanceof types_1.FileServiceError)
                throw error;
            if (error.code === 'ENOENT') {
                throw new types_1.FileServiceError(`File not found: ${filePath}`, types_1.FileServiceErrorCode.FILE_NOT_FOUND, filePath, error);
            }
            throw new types_1.FileServiceError(`Failed to read file: ${filePath}`, types_1.FileServiceErrorCode.IO_ERROR, filePath, error);
        }
    }
    /**
     * Write file contents
     */
    async writeFile(filePath, content, options = {}) {
        try {
            const resolved = this.resolvePath(filePath);
            this.checkExtension(resolved);
            // Check if file exists
            const exists = await this.exists(filePath);
            if (exists && !options.overwrite) {
                throw new types_1.FileServiceError(`File already exists: ${filePath}`, types_1.FileServiceErrorCode.FILE_ALREADY_EXISTS, filePath);
            }
            // Create directories if needed
            if (options.createDirectories) {
                const dir = path.dirname(resolved);
                await fs.mkdir(dir, { recursive: true });
            }
            const encoding = options.encoding || 'utf-8';
            await fs.writeFile(resolved, content, typeof content === 'string' ? encoding : undefined);
            return {
                success: true,
                path: resolved,
                message: 'File written successfully',
            };
        }
        catch (error) {
            if (error instanceof types_1.FileServiceError)
                throw error;
            throw new types_1.FileServiceError(`Failed to write file: ${filePath}`, types_1.FileServiceErrorCode.IO_ERROR, filePath, error);
        }
    }
    /**
     * Copy file or directory
     */
    async copy(source, destination, recursive = false) {
        try {
            const resolvedSource = this.resolvePath(source);
            const resolvedDest = this.resolvePath(destination);
            const stats = await fs.stat(resolvedSource);
            if (stats.isDirectory() && !recursive) {
                throw new types_1.FileServiceError('Cannot copy directory without recursive flag', types_1.FileServiceErrorCode.INVALID_PATH, source);
            }
            await fs.cp(resolvedSource, resolvedDest, { recursive });
            return {
                success: true,
                path: resolvedDest,
                message: 'File copied successfully',
            };
        }
        catch (error) {
            if (error instanceof types_1.FileServiceError)
                throw error;
            throw new types_1.FileServiceError(`Failed to copy: ${source} to ${destination}`, types_1.FileServiceErrorCode.IO_ERROR, source, error);
        }
    }
    /**
     * Move/rename file or directory
     */
    async move(source, destination) {
        try {
            const resolvedSource = this.resolvePath(source);
            const resolvedDest = this.resolvePath(destination);
            await fs.rename(resolvedSource, resolvedDest);
            return {
                success: true,
                path: resolvedDest,
                message: 'File moved successfully',
            };
        }
        catch (error) {
            throw new types_1.FileServiceError(`Failed to move: ${source} to ${destination}`, types_1.FileServiceErrorCode.IO_ERROR, source, error);
        }
    }
    /**
     * Delete file or directory
     */
    async delete(filePath, recursive = false) {
        try {
            const resolved = this.resolvePath(filePath);
            const stats = await fs.stat(resolved);
            if (stats.isDirectory()) {
                await fs.rm(resolved, { recursive, force: true });
            }
            else {
                await fs.unlink(resolved);
            }
            return {
                success: true,
                path: resolved,
                message: 'File deleted successfully',
            };
        }
        catch (error) {
            throw new types_1.FileServiceError(`Failed to delete: ${filePath}`, types_1.FileServiceErrorCode.IO_ERROR, filePath, error);
        }
    }
    /**
     * Check if file or directory exists
     */
    async exists(filePath) {
        try {
            const resolved = this.resolvePath(filePath);
            await fs.access(resolved);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get file metadata
     */
    async getMetadata(filePath) {
        try {
            const resolved = this.resolvePath(filePath);
            const stats = await fs.stat(resolved);
            return {
                path: resolved,
                name: path.basename(resolved),
                extension: path.extname(resolved),
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isDirectory: stats.isDirectory(),
            };
        }
        catch (error) {
            throw new types_1.FileServiceError(`Failed to get metadata: ${filePath}`, types_1.FileServiceErrorCode.FILE_NOT_FOUND, filePath, error);
        }
    }
    // ============================================================================
    // Directory Operations
    // ============================================================================
    /**
     * Create directory
     */
    async createDirectory(dirPath, recursive = true) {
        try {
            const resolved = this.resolvePath(dirPath);
            await fs.mkdir(resolved, { recursive });
            return {
                success: true,
                path: resolved,
                message: 'Directory created successfully',
            };
        }
        catch (error) {
            throw new types_1.FileServiceError(`Failed to create directory: ${dirPath}`, types_1.FileServiceErrorCode.IO_ERROR, dirPath, error);
        }
    }
    /**
     * List directory contents
     */
    async listDirectory(dirPath, options = {}) {
        try {
            const resolved = this.resolvePath(dirPath);
            const entries = await fs.readdir(resolved, { withFileTypes: true });
            const results = [];
            for (const entry of entries) {
                const fullPath = path.join(resolved, entry.name);
                // Apply filter if provided
                if (options.filter && !options.filter(fullPath)) {
                    continue;
                }
                const metadata = await this.getMetadata(path.relative(this.config.workspaceRoot, fullPath));
                results.push(metadata);
                // Recursively list subdirectories if requested
                if (options.recursive && entry.isDirectory()) {
                    const subResults = await this.listDirectory(path.relative(this.config.workspaceRoot, fullPath), options);
                    results.push(...subResults);
                }
            }
            return results;
        }
        catch (error) {
            throw new types_1.FileServiceError(`Failed to list directory: ${dirPath}`, types_1.FileServiceErrorCode.DIRECTORY_NOT_FOUND, dirPath, error);
        }
    }
    // ============================================================================
    // File Watching
    // ============================================================================
    /**
     * Watch file or directory for changes
     */
    watch(filePath, callback) {
        if (!this.config.enableWatcher) {
            throw new types_1.FileServiceError('File watching is disabled', types_1.FileServiceErrorCode.PERMISSION_DENIED);
        }
        const resolved = this.resolvePath(filePath);
        // Check if already watching this path
        let watcherInstance = this.watchers.get(resolved);
        if (!watcherInstance) {
            // Create new watcher
            const watcher = (0, chokidar_1.watch)(resolved, this.config.watcherOptions);
            watcherInstance = {
                path: resolved,
                watcher,
                callbacks: [],
            };
            this.watchers.set(resolved, watcherInstance);
            // Set up event handlers
            watcher
                .on('add', (path) => this.emitWatcherEvent(resolved, 'add', path))
                .on('change', (path) => this.emitWatcherEvent(resolved, 'change', path))
                .on('unlink', (path) => this.emitWatcherEvent(resolved, 'unlink', path))
                .on('addDir', (path) => this.emitWatcherEvent(resolved, 'addDir', path))
                .on('unlinkDir', (path) => this.emitWatcherEvent(resolved, 'unlinkDir', path));
        }
        // Add callback
        watcherInstance.callbacks.push(callback);
        // Return unsubscribe function
        return () => {
            const instance = this.watchers.get(resolved);
            if (instance) {
                const index = instance.callbacks.indexOf(callback);
                if (index > -1) {
                    instance.callbacks.splice(index, 1);
                }
                // If no more callbacks, close watcher
                if (instance.callbacks.length === 0) {
                    instance.watcher.close();
                    this.watchers.delete(resolved);
                }
            }
        };
    }
    /**
     * Emit watcher event to all callbacks
     */
    async emitWatcherEvent(watchedPath, type, eventPath) {
        const instance = this.watchers.get(watchedPath);
        if (!instance)
            return;
        const event = {
            type,
            path: eventPath,
        };
        // Get metadata if file still exists
        if (type === 'add' || type === 'change' || type === 'addDir') {
            try {
                event.stats = await this.getMetadata(path.relative(this.config.workspaceRoot, eventPath));
            }
            catch {
                // File might have been deleted immediately
            }
        }
        // Call all callbacks
        for (const callback of instance.callbacks) {
            try {
                callback(event);
            }
            catch (error) {
                console.error('Error in file watcher callback:', error);
            }
        }
    }
    /**
     * Stop watching all files
     */
    unwatchAll() {
        for (const instance of this.watchers.values()) {
            instance.watcher.close();
        }
        this.watchers.clear();
    }
    // ============================================================================
    // Template Operations
    // ============================================================================
    /**
     * Process template with variables
     */
    async processTemplate(templatePath, variables) {
        const content = (await this.readFile(templatePath));
        const result = this.templateEngine.process(content, variables);
        if (!result.success) {
            throw new types_1.FileServiceError(`Template processing failed: ${result.error?.message}`, types_1.FileServiceErrorCode.TEMPLATE_PARSE_ERROR, templatePath, result.error);
        }
        return result.content;
    }
    /**
     * Get template engine instance
     */
    getTemplateEngine() {
        return this.templateEngine;
    }
    // ============================================================================
    // Export Operations
    // ============================================================================
    /**
     * Export markdown to various formats
     */
    async export(markdownPath, options) {
        const content = (await this.readFile(markdownPath));
        switch (options.format) {
            case 'docx':
                return this.docxExporter.export(content, options);
            case 'pdf':
                return this.pdfExporter.export(content, options);
            case 'html':
                // Simple HTML export using marked (could be enhanced)
                const { marked } = await Promise.resolve().then(() => __importStar(require('marked')));
                const html = await marked(content);
                await this.writeFile(options.outputPath, html, { overwrite: true });
                return {
                    success: true,
                    outputPath: options.outputPath,
                    format: 'html',
                    message: 'HTML export successful',
                };
            case 'markdown':
                // Just copy the file
                await this.copy(markdownPath, options.outputPath);
                return {
                    success: true,
                    outputPath: options.outputPath,
                    format: 'markdown',
                    message: 'Markdown copied successfully',
                };
            default:
                throw new types_1.FileServiceError(`Unsupported export format: ${options.format}`, types_1.FileServiceErrorCode.UNSUPPORTED_FORMAT);
        }
    }
    // ============================================================================
    // Cleanup
    // ============================================================================
    /**
     * Clean up resources
     */
    dispose() {
        this.unwatchAll();
    }
}
exports.FileService = FileService;
/**
 * Factory function to create FileService instance
 */
function createFileService(workspaceRoot) {
    return new FileService({ workspaceRoot });
}
