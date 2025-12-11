"use strict";
/**
 * Plugin Manager Type Definitions
 * Core types for the BQ Studio plugin system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginError = exports.PluginErrorType = void 0;
/**
 * Plugin error types
 */
var PluginErrorType;
(function (PluginErrorType) {
    PluginErrorType["MANIFEST_NOT_FOUND"] = "MANIFEST_NOT_FOUND";
    PluginErrorType["MANIFEST_INVALID"] = "MANIFEST_INVALID";
    PluginErrorType["ENTRY_NOT_FOUND"] = "ENTRY_NOT_FOUND";
    PluginErrorType["LOAD_FAILED"] = "LOAD_FAILED";
    PluginErrorType["ACTIVATION_FAILED"] = "ACTIVATION_FAILED";
    PluginErrorType["DEACTIVATION_FAILED"] = "DEACTIVATION_FAILED";
    PluginErrorType["DEPENDENCY_NOT_MET"] = "DEPENDENCY_NOT_MET";
    PluginErrorType["ALREADY_LOADED"] = "ALREADY_LOADED";
    PluginErrorType["NOT_LOADED"] = "NOT_LOADED";
})(PluginErrorType || (exports.PluginErrorType = PluginErrorType = {}));
/**
 * Plugin error class
 */
class PluginError extends Error {
    constructor(type, pluginId, message, originalError) {
        super(message);
        this.type = type;
        this.pluginId = pluginId;
        this.originalError = originalError;
        this.name = 'PluginError';
    }
}
exports.PluginError = PluginError;
