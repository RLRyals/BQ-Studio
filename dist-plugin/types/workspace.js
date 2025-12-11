"use strict";
/**
 * Workspace Types
 * Type definitions for BQ-Studio workspace management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceType = exports.WorkspaceValidationState = void 0;
/**
 * Workspace validation states
 */
var WorkspaceValidationState;
(function (WorkspaceValidationState) {
    WorkspaceValidationState["VALID"] = "VALID";
    WorkspaceValidationState["INVALID_PATH"] = "INVALID_PATH";
    WorkspaceValidationState["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    WorkspaceValidationState["STRUCTURE_INVALID"] = "STRUCTURE_INVALID";
    WorkspaceValidationState["NOT_CONFIGURED"] = "NOT_CONFIGURED";
})(WorkspaceValidationState || (exports.WorkspaceValidationState = WorkspaceValidationState = {}));
/**
 * Workspace type indicators
 */
var WorkspaceType;
(function (WorkspaceType) {
    WorkspaceType["LOCAL"] = "local";
    WorkspaceType["NETWORK"] = "network";
    WorkspaceType["CLOUD_SYNC"] = "cloud_sync";
})(WorkspaceType || (exports.WorkspaceType = WorkspaceType = {}));
