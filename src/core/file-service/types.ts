/**
 * File Service Types for BQ Studio
 * Type-safe interfaces for file operations, templates, and exports
 */

import { FSWatcher } from 'chokidar';

// ============================================================================
// Core File Service Types
// ============================================================================

export interface FileServiceConfig {
  workspaceRoot: string; // Root directory for sandboxed access
  allowedExtensions?: string[]; // Allowed file extensions (undefined = all)
  maxFileSize?: number; // Maximum file size in bytes (default: 100MB)
  enableWatcher?: boolean; // Enable file system watchers
  watcherOptions?: WatcherOptions;
}

export interface WatcherOptions {
  ignored?: string | string[]; // Paths to ignore
  persistent?: boolean; // Keep process running as long as files are being watched
  ignoreInitial?: boolean; // Don't emit events for initial add
  depth?: number; // Maximum depth to traverse
}

export interface FileOperationResult {
  success: boolean;
  path?: string;
  error?: Error;
  message?: string;
}

export interface FileMetadata {
  path: string;
  name: string;
  extension: string;
  size: number;
  created: Date;
  modified: Date;
  isDirectory: boolean;
}

export interface ReadFileOptions {
  encoding?: BufferEncoding;
  raw?: boolean; // Return buffer instead of string
}

export interface WriteFileOptions {
  encoding?: BufferEncoding;
  createDirectories?: boolean;
  overwrite?: boolean;
}

export interface DirectoryOptions {
  recursive?: boolean;
  filter?: (path: string) => boolean;
}

export interface WatcherInstance {
  path: string;
  watcher: FSWatcher;
  callbacks: WatcherCallback[];
}

export type WatcherCallback = (event: WatcherEvent) => void;

export interface WatcherEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  stats?: FileMetadata;
}

// ============================================================================
// Template Engine Types
// ============================================================================

export interface TemplateConfig {
  delimiter?: string; // Default: '{{'
  closingDelimiter?: string; // Default: '}}'
  throwOnMissing?: boolean; // Throw error if variable not found
  defaultValue?: string; // Default value for missing variables
}

export interface TemplateVariables {
  [key: string]: string | number | boolean | null | undefined | TemplateVariables;
}

export interface TemplateResult {
  success: boolean;
  content?: string;
  error?: Error;
  missingVariables?: string[];
}

export interface TemplateMetadata {
  path: string;
  variables: string[]; // List of variables found in template
  requiredVariables?: string[]; // Variables marked as required
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportOptions {
  outputPath: string;
  format: ExportFormat;
  metadata?: ExportMetadata;
  styling?: ExportStyling;
}

export type ExportFormat = 'docx' | 'pdf' | 'html' | 'markdown';

export interface ExportMetadata {
  title?: string;
  author?: string;
  subject?: string;
  description?: string;
  keywords?: string[];
  creator?: string;
  created?: Date;
  modified?: Date;
}

export interface ExportStyling {
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  margins?: ExportMargins;
  pageSize?: PageSize;
  orientation?: PageOrientation;
  headerFooter?: boolean;
  tableOfContents?: boolean;
}

export interface ExportMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export type PageSize = 'letter' | 'legal' | 'a4' | 'a5';
export type PageOrientation = 'portrait' | 'landscape';

export interface ExportResult {
  success: boolean;
  outputPath?: string;
  format: ExportFormat;
  error?: Error;
  message?: string;
  fileSize?: number;
}

// ============================================================================
// DOCX Export Types
// ============================================================================

export interface DocxExportOptions extends ExportOptions {
  format: 'docx';
  styling?: DocxStyling;
}

export interface DocxStyling extends ExportStyling {
  headingStyles?: {
    h1?: ParagraphStyle;
    h2?: ParagraphStyle;
    h3?: ParagraphStyle;
    h4?: ParagraphStyle;
    h5?: ParagraphStyle;
    h6?: ParagraphStyle;
  };
  paragraphStyle?: ParagraphStyle;
  listStyle?: ListStyle;
  codeStyle?: ParagraphStyle;
}

export interface ParagraphStyle {
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  spacing?: {
    before?: number;
    after?: number;
    line?: number;
  };
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface ListStyle {
  bulletCharacter?: string;
  numberFormat?: 'decimal' | 'lowerLetter' | 'upperLetter' | 'lowerRoman' | 'upperRoman';
  indent?: number;
}

// ============================================================================
// PDF Export Types
// ============================================================================

export interface PdfExportOptions extends ExportOptions {
  format: 'pdf';
  styling?: PdfStyling;
  pdfOptions?: PuppeteerPdfOptions;
}

export interface PdfStyling extends ExportStyling {
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  codeBlockBackground?: string;
  codeBlockColor?: string;
}

export interface PuppeteerPdfOptions {
  scale?: number;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
  landscape?: boolean;
  pageRanges?: string;
  format?: string;
  width?: string | number;
  height?: string | number;
  preferCSSPageSize?: boolean;
  margin?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
}

// ============================================================================
// Markdown Processing Types
// ============================================================================

export interface MarkdownParseResult {
  html: string;
  metadata?: MarkdownMetadata;
  headings?: MarkdownHeading[];
  links?: MarkdownLink[];
}

export interface MarkdownMetadata {
  title?: string;
  author?: string;
  date?: string;
  tags?: string[];
  [key: string]: any;
}

export interface MarkdownHeading {
  level: number;
  text: string;
  slug: string;
}

export interface MarkdownLink {
  text: string;
  url: string;
  title?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class FileServiceError extends Error {
  constructor(
    message: string,
    public code: FileServiceErrorCode,
    public path?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FileServiceError';
  }
}

export enum FileServiceErrorCode {
  // Permission errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SANDBOX_VIOLATION = 'SANDBOX_VIOLATION',

  // File errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_ALREADY_EXISTS = 'FILE_ALREADY_EXISTS',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',

  // Directory errors
  DIRECTORY_NOT_FOUND = 'DIRECTORY_NOT_FOUND',
  DIRECTORY_NOT_EMPTY = 'DIRECTORY_NOT_EMPTY',

  // Template errors
  TEMPLATE_PARSE_ERROR = 'TEMPLATE_PARSE_ERROR',
  MISSING_VARIABLES = 'MISSING_VARIABLES',
  INVALID_TEMPLATE = 'INVALID_TEMPLATE',

  // Export errors
  EXPORT_FAILED = 'EXPORT_FAILED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  INVALID_MARKDOWN = 'INVALID_MARKDOWN',

  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PATH = 'INVALID_PATH',
  IO_ERROR = 'IO_ERROR',
}
