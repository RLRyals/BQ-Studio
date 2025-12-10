/**
 * File Service
 * Core file operations service with sandboxed access, templates, and exports
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { watch } from 'chokidar';
import {
  FileServiceConfig,
  FileServiceError,
  FileServiceErrorCode,
  FileOperationResult,
  FileMetadata,
  ReadFileOptions,
  WriteFileOptions,
  DirectoryOptions,
  WatcherInstance,
  WatcherCallback,
  WatcherEvent,
  ExportOptions,
  ExportResult,
} from './types';
import { TemplateEngine } from './TemplateEngine';
import { DocxExporter } from './exporters/DocxExporter';
import { PdfExporter } from './exporters/PdfExporter';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Partial<FileServiceConfig> = {
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
export class FileService {
  private config: Required<FileServiceConfig>;
  private watchers: Map<string, WatcherInstance> = new Map();
  private templateEngine: TemplateEngine;
  private docxExporter: DocxExporter;
  private pdfExporter: PdfExporter;

  constructor(config: FileServiceConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as Required<FileServiceConfig>;

    this.templateEngine = new TemplateEngine();
    this.docxExporter = new DocxExporter();
    this.pdfExporter = new PdfExporter();
  }

  // ============================================================================
  // Path Validation & Utilities
  // ============================================================================

  /**
   * Resolve and validate path is within workspace
   */
  private resolvePath(filePath: string): string {
    const resolved = path.isAbsolute(filePath)
      ? path.normalize(filePath)
      : path.normalize(path.join(this.config.workspaceRoot, filePath));

    // Security check: ensure path is within workspace
    if (!resolved.startsWith(this.config.workspaceRoot)) {
      throw new FileServiceError(
        `Path "${filePath}" is outside workspace root`,
        FileServiceErrorCode.SANDBOX_VIOLATION,
        filePath
      );
    }

    return resolved;
  }

  /**
   * Check if file extension is allowed
   */
  private checkExtension(filePath: string): void {
    if (!this.config.allowedExtensions) return;

    const ext = path.extname(filePath).toLowerCase();
    if (!this.config.allowedExtensions.includes(ext)) {
      throw new FileServiceError(
        `File type "${ext}" is not allowed`,
        FileServiceErrorCode.INVALID_FILE_TYPE,
        filePath
      );
    }
  }

  /**
   * Check if file size is within limits
   */
  private async checkFileSize(filePath: string): Promise<void> {
    const stats = await fs.stat(filePath);
    if (stats.size > this.config.maxFileSize) {
      throw new FileServiceError(
        `File size (${stats.size} bytes) exceeds maximum (${this.config.maxFileSize} bytes)`,
        FileServiceErrorCode.FILE_TOO_LARGE,
        filePath
      );
    }
  }

  // ============================================================================
  // File Operations
  // ============================================================================

  /**
   * Read file contents
   */
  async readFile(filePath: string, options: ReadFileOptions = {}): Promise<string | Buffer> {
    try {
      const resolved = this.resolvePath(filePath);
      this.checkExtension(resolved);

      await this.checkFileSize(resolved);

      const encoding = options.encoding || 'utf-8';
      const content = await fs.readFile(resolved, options.raw ? undefined : encoding);

      return content;
    } catch (error) {
      if (error instanceof FileServiceError) throw error;

      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new FileServiceError(
          `File not found: ${filePath}`,
          FileServiceErrorCode.FILE_NOT_FOUND,
          filePath,
          error as Error
        );
      }

      throw new FileServiceError(
        `Failed to read file: ${filePath}`,
        FileServiceErrorCode.IO_ERROR,
        filePath,
        error as Error
      );
    }
  }

  /**
   * Write file contents
   */
  async writeFile(
    filePath: string,
    content: string | Buffer,
    options: WriteFileOptions = {}
  ): Promise<FileOperationResult> {
    try {
      const resolved = this.resolvePath(filePath);
      this.checkExtension(resolved);

      // Check if file exists
      const exists = await this.exists(filePath);
      if (exists && !options.overwrite) {
        throw new FileServiceError(
          `File already exists: ${filePath}`,
          FileServiceErrorCode.FILE_ALREADY_EXISTS,
          filePath
        );
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
    } catch (error) {
      if (error instanceof FileServiceError) throw error;

      throw new FileServiceError(
        `Failed to write file: ${filePath}`,
        FileServiceErrorCode.IO_ERROR,
        filePath,
        error as Error
      );
    }
  }

  /**
   * Copy file or directory
   */
  async copy(source: string, destination: string, recursive = false): Promise<FileOperationResult> {
    try {
      const resolvedSource = this.resolvePath(source);
      const resolvedDest = this.resolvePath(destination);

      const stats = await fs.stat(resolvedSource);

      if (stats.isDirectory() && !recursive) {
        throw new FileServiceError(
          'Cannot copy directory without recursive flag',
          FileServiceErrorCode.INVALID_PATH,
          source
        );
      }

      await fs.cp(resolvedSource, resolvedDest, { recursive });

      return {
        success: true,
        path: resolvedDest,
        message: 'File copied successfully',
      };
    } catch (error) {
      if (error instanceof FileServiceError) throw error;

      throw new FileServiceError(
        `Failed to copy: ${source} to ${destination}`,
        FileServiceErrorCode.IO_ERROR,
        source,
        error as Error
      );
    }
  }

  /**
   * Move/rename file or directory
   */
  async move(source: string, destination: string): Promise<FileOperationResult> {
    try {
      const resolvedSource = this.resolvePath(source);
      const resolvedDest = this.resolvePath(destination);

      await fs.rename(resolvedSource, resolvedDest);

      return {
        success: true,
        path: resolvedDest,
        message: 'File moved successfully',
      };
    } catch (error) {
      throw new FileServiceError(
        `Failed to move: ${source} to ${destination}`,
        FileServiceErrorCode.IO_ERROR,
        source,
        error as Error
      );
    }
  }

  /**
   * Delete file or directory
   */
  async delete(filePath: string, recursive = false): Promise<FileOperationResult> {
    try {
      const resolved = this.resolvePath(filePath);

      const stats = await fs.stat(resolved);

      if (stats.isDirectory()) {
        await fs.rm(resolved, { recursive, force: true });
      } else {
        await fs.unlink(resolved);
      }

      return {
        success: true,
        path: resolved,
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new FileServiceError(
        `Failed to delete: ${filePath}`,
        FileServiceErrorCode.IO_ERROR,
        filePath,
        error as Error
      );
    }
  }

  /**
   * Check if file or directory exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const resolved = this.resolvePath(filePath);
      await fs.access(resolved);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(filePath: string): Promise<FileMetadata> {
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
    } catch (error) {
      throw new FileServiceError(
        `Failed to get metadata: ${filePath}`,
        FileServiceErrorCode.FILE_NOT_FOUND,
        filePath,
        error as Error
      );
    }
  }

  // ============================================================================
  // Directory Operations
  // ============================================================================

  /**
   * Create directory
   */
  async createDirectory(dirPath: string, recursive = true): Promise<FileOperationResult> {
    try {
      const resolved = this.resolvePath(dirPath);
      await fs.mkdir(resolved, { recursive });

      return {
        success: true,
        path: resolved,
        message: 'Directory created successfully',
      };
    } catch (error) {
      throw new FileServiceError(
        `Failed to create directory: ${dirPath}`,
        FileServiceErrorCode.IO_ERROR,
        dirPath,
        error as Error
      );
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(dirPath: string, options: DirectoryOptions = {}): Promise<FileMetadata[]> {
    try {
      const resolved = this.resolvePath(dirPath);
      const entries = await fs.readdir(resolved, { withFileTypes: true });

      const results: FileMetadata[] = [];

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
          const subResults = await this.listDirectory(
            path.relative(this.config.workspaceRoot, fullPath),
            options
          );
          results.push(...subResults);
        }
      }

      return results;
    } catch (error) {
      throw new FileServiceError(
        `Failed to list directory: ${dirPath}`,
        FileServiceErrorCode.DIRECTORY_NOT_FOUND,
        dirPath,
        error as Error
      );
    }
  }

  // ============================================================================
  // File Watching
  // ============================================================================

  /**
   * Watch file or directory for changes
   */
  watch(filePath: string, callback: WatcherCallback): () => void {
    if (!this.config.enableWatcher) {
      throw new FileServiceError(
        'File watching is disabled',
        FileServiceErrorCode.PERMISSION_DENIED
      );
    }

    const resolved = this.resolvePath(filePath);

    // Check if already watching this path
    let watcherInstance = this.watchers.get(resolved);

    if (!watcherInstance) {
      // Create new watcher
      const watcher = watch(resolved, this.config.watcherOptions);

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
  private async emitWatcherEvent(
    watchedPath: string,
    type: WatcherEvent['type'],
    eventPath: string
  ): Promise<void> {
    const instance = this.watchers.get(watchedPath);
    if (!instance) return;

    const event: WatcherEvent = {
      type,
      path: eventPath,
    };

    // Get metadata if file still exists
    if (type === 'add' || type === 'change' || type === 'addDir') {
      try {
        event.stats = await this.getMetadata(path.relative(this.config.workspaceRoot, eventPath));
      } catch {
        // File might have been deleted immediately
      }
    }

    // Call all callbacks
    for (const callback of instance.callbacks) {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in file watcher callback:', error);
      }
    }
  }

  /**
   * Stop watching all files
   */
  unwatchAll(): void {
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
  async processTemplate(
    templatePath: string,
    variables: Record<string, any>
  ): Promise<string> {
    const content = (await this.readFile(templatePath)) as string;
    const result = this.templateEngine.process(content, variables);

    if (!result.success) {
      throw new FileServiceError(
        `Template processing failed: ${result.error?.message}`,
        FileServiceErrorCode.TEMPLATE_PARSE_ERROR,
        templatePath,
        result.error
      );
    }

    return result.content!;
  }

  /**
   * Get template engine instance
   */
  getTemplateEngine(): TemplateEngine {
    return this.templateEngine;
  }

  // ============================================================================
  // Export Operations
  // ============================================================================

  /**
   * Export markdown to various formats
   */
  async export(markdownPath: string, options: ExportOptions): Promise<ExportResult> {
    const content = (await this.readFile(markdownPath)) as string;

    switch (options.format) {
      case 'docx':
        return this.docxExporter.export(content, options);

      case 'pdf':
        return this.pdfExporter.export(content, options);

      case 'html':
        // Simple HTML export using marked (could be enhanced)
        const { marked } = await import('marked');
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
        throw new FileServiceError(
          `Unsupported export format: ${options.format}`,
          FileServiceErrorCode.UNSUPPORTED_FORMAT
        );
    }
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Clean up resources
   */
  dispose(): void {
    this.unwatchAll();
  }
}

/**
 * Factory function to create FileService instance
 */
export function createFileService(workspaceRoot: string): FileService {
  return new FileService({ workspaceRoot });
}
