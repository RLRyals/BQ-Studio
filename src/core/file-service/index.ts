/**
 * File Service - Public API
 * Core file operations, templates, and multi-format exports for BQ Studio
 */

// Main service
export { FileService, createFileService } from './FileService';

// Template engine
export { TemplateEngine, createTemplateEngine, builtInHelpers } from './TemplateEngine';

// Exporters
export { DocxExporter } from './exporters/DocxExporter';
export { PdfExporter, convertHtmlToPdfElectron } from './exporters/PdfExporter';

// Types
export * from './types';
