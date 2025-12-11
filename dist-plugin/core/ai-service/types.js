"use strict";
/**
 * AI Service Types
 * Comprehensive type definitions for multi-provider AI service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.AIServiceError = void 0;
class AIServiceError extends Error {
    constructor(message, code, provider, statusCode, originalError) {
        super(message);
        this.code = code;
        this.provider = provider;
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.name = 'AIServiceError';
    }
}
exports.AIServiceError = AIServiceError;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["PROVIDER_NOT_CONFIGURED"] = "PROVIDER_NOT_CONFIGURED";
    ErrorCode["INVALID_API_KEY"] = "INVALID_API_KEY";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
