"use strict";
/**
 * File Service - Public API
 * Core file operations, templates, and multi-format exports for BQ Studio
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertHtmlToPdfElectron = exports.PdfExporter = exports.DocxExporter = exports.builtInHelpers = exports.createTemplateEngine = exports.TemplateEngine = exports.createFileService = exports.FileService = void 0;
// Main service
var FileService_1 = require("./FileService");
Object.defineProperty(exports, "FileService", { enumerable: true, get: function () { return FileService_1.FileService; } });
Object.defineProperty(exports, "createFileService", { enumerable: true, get: function () { return FileService_1.createFileService; } });
// Template engine
var TemplateEngine_1 = require("./TemplateEngine");
Object.defineProperty(exports, "TemplateEngine", { enumerable: true, get: function () { return TemplateEngine_1.TemplateEngine; } });
Object.defineProperty(exports, "createTemplateEngine", { enumerable: true, get: function () { return TemplateEngine_1.createTemplateEngine; } });
Object.defineProperty(exports, "builtInHelpers", { enumerable: true, get: function () { return TemplateEngine_1.builtInHelpers; } });
// Exporters
var DocxExporter_1 = require("./exporters/DocxExporter");
Object.defineProperty(exports, "DocxExporter", { enumerable: true, get: function () { return DocxExporter_1.DocxExporter; } });
var PdfExporter_1 = require("./exporters/PdfExporter");
Object.defineProperty(exports, "PdfExporter", { enumerable: true, get: function () { return PdfExporter_1.PdfExporter; } });
Object.defineProperty(exports, "convertHtmlToPdfElectron", { enumerable: true, get: function () { return PdfExporter_1.convertHtmlToPdfElectron; } });
// Types
__exportStar(require("./types"), exports);
