"use strict";
/**
 * File Service Types for BQ Studio
 * Type-safe interfaces for file operations, templates, and exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileServiceErrorCode = exports.FileServiceError = void 0;
// ============================================================================
// Error Types
// ============================================================================
class FileServiceError extends Error {
    constructor(message, code, path, originalError) {
        super(message);
        this.code = code;
        this.path = path;
        this.originalError = originalError;
        this.name = 'FileServiceError';
    }
}
exports.FileServiceError = FileServiceError;
var FileServiceErrorCode;
(function (FileServiceErrorCode) {
    // Permission errors
    FileServiceErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    FileServiceErrorCode["SANDBOX_VIOLATION"] = "SANDBOX_VIOLATION";
    // File errors
    FileServiceErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    FileServiceErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    FileServiceErrorCode["FILE_ALREADY_EXISTS"] = "FILE_ALREADY_EXISTS";
    FileServiceErrorCode["INVALID_FILE_TYPE"] = "INVALID_FILE_TYPE";
    // Directory errors
    FileServiceErrorCode["DIRECTORY_NOT_FOUND"] = "DIRECTORY_NOT_FOUND";
    FileServiceErrorCode["DIRECTORY_NOT_EMPTY"] = "DIRECTORY_NOT_EMPTY";
    // Template errors
    FileServiceErrorCode["TEMPLATE_PARSE_ERROR"] = "TEMPLATE_PARSE_ERROR";
    FileServiceErrorCode["MISSING_VARIABLES"] = "MISSING_VARIABLES";
    FileServiceErrorCode["INVALID_TEMPLATE"] = "INVALID_TEMPLATE";
    // Export errors
    FileServiceErrorCode["EXPORT_FAILED"] = "EXPORT_FAILED";
    FileServiceErrorCode["UNSUPPORTED_FORMAT"] = "UNSUPPORTED_FORMAT";
    FileServiceErrorCode["INVALID_MARKDOWN"] = "INVALID_MARKDOWN";
    // General errors
    FileServiceErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    FileServiceErrorCode["INVALID_PATH"] = "INVALID_PATH";
    FileServiceErrorCode["IO_ERROR"] = "IO_ERROR";
})(FileServiceErrorCode || (exports.FileServiceErrorCode = FileServiceErrorCode = {}));
