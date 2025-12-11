"use strict";
/**
 * Plugin Manager Module
 * Public API for the BQ Studio plugin system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginErrorType = exports.PluginError = exports.validatePluginManifest = exports.PluginManifestValidator = exports.PluginContext = exports.PluginManager = void 0;
// Core classes
var PluginManager_1 = require("./PluginManager");
Object.defineProperty(exports, "PluginManager", { enumerable: true, get: function () { return PluginManager_1.PluginManager; } });
var PluginContext_1 = require("./PluginContext");
Object.defineProperty(exports, "PluginContext", { enumerable: true, get: function () { return PluginContext_1.PluginContext; } });
// Validator
var validator_1 = require("./validator");
Object.defineProperty(exports, "PluginManifestValidator", { enumerable: true, get: function () { return validator_1.PluginManifestValidator; } });
Object.defineProperty(exports, "validatePluginManifest", { enumerable: true, get: function () { return validator_1.validatePluginManifest; } });
var types_1 = require("./types");
Object.defineProperty(exports, "PluginError", { enumerable: true, get: function () { return types_1.PluginError; } });
Object.defineProperty(exports, "PluginErrorType", { enumerable: true, get: function () { return types_1.PluginErrorType; } });
