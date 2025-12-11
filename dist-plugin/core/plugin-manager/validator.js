"use strict";
/**
 * Plugin Manifest Validator
 * Validates plugin.json schemas and ensures plugin integrity
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManifestValidator = void 0;
exports.validatePluginManifest = validatePluginManifest;
/**
 * Validates a plugin manifest against the schema
 */
class PluginManifestValidator {
    /**
     * Validate manifest structure and required fields
     */
    validate(manifest) {
        const errors = [];
        // Check if manifest is an object
        if (!manifest || typeof manifest !== 'object') {
            errors.push({
                field: 'manifest',
                message: 'Plugin manifest must be a valid JSON object',
            });
            return { valid: false, errors };
        }
        const m = manifest;
        // Validate required fields
        this.validateRequiredString(m, 'id', errors);
        this.validateRequiredString(m, 'name', errors);
        this.validateRequiredString(m, 'version', errors);
        this.validateRequiredString(m, 'description', errors);
        this.validateRequiredString(m, 'author', errors);
        this.validateRequiredString(m, 'entry', errors);
        // Validate ID format (lowercase, hyphens only)
        if (m.id && !/^[a-z][a-z0-9-]*$/.test(m.id)) {
            errors.push({
                field: 'id',
                message: 'Plugin ID must start with lowercase letter and contain only lowercase letters, numbers, and hyphens',
            });
        }
        // Validate version format (semantic versioning)
        if (m.version && !/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(m.version)) {
            errors.push({
                field: 'version',
                message: 'Version must follow semantic versioning format (e.g., 1.0.0, 1.2.3-beta)',
            });
        }
        // Validate entry file extension
        if (m.entry && !m.entry.endsWith('.ts') && !m.entry.endsWith('.js')) {
            errors.push({
                field: 'entry',
                message: 'Entry file must be a TypeScript (.ts) or JavaScript (.js) file',
            });
        }
        // Validate optional fields
        if (m.dependencies !== undefined) {
            this.validateDependencies(m.dependencies, errors);
        }
        if (m.ui !== undefined) {
            this.validateUI(m.ui, errors);
        }
        if (m.data !== undefined) {
            this.validateData(m.data, errors);
        }
        if (m.permissions !== undefined) {
            this.validatePermissions(m.permissions, errors);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Validate required string field
     */
    validateRequiredString(manifest, field, errors) {
        const value = manifest[field];
        if (!value || typeof value !== 'string' || value.trim() === '') {
            errors.push({
                field,
                message: `Field '${field}' is required and must be a non-empty string`,
            });
        }
    }
    /**
     * Validate dependencies array
     */
    validateDependencies(dependencies, errors) {
        if (!Array.isArray(dependencies)) {
            errors.push({
                field: 'dependencies',
                message: 'Dependencies must be an array of plugin IDs',
            });
            return;
        }
        dependencies.forEach((dep, index) => {
            if (typeof dep !== 'string' || dep.trim() === '') {
                errors.push({
                    field: `dependencies[${index}]`,
                    message: 'Each dependency must be a non-empty string (plugin ID)',
                });
            }
        });
    }
    /**
     * Validate UI configuration
     */
    validateUI(ui, errors) {
        if (typeof ui !== 'object' || ui === null) {
            errors.push({
                field: 'ui',
                message: 'UI configuration must be an object',
            });
            return;
        }
        const uiConfig = ui;
        // Validate optional string fields
        const optionalFields = ['mainView', 'sidebarIcon', 'dashboardWidget'];
        optionalFields.forEach((field) => {
            if (uiConfig[field] !== undefined &&
                (typeof uiConfig[field] !== 'string' || uiConfig[field].trim() === '')) {
                errors.push({
                    field: `ui.${field}`,
                    message: `UI field '${field}' must be a non-empty string`,
                });
            }
        });
    }
    /**
     * Validate data configuration
     */
    validateData(data, errors) {
        if (typeof data !== 'object' || data === null) {
            errors.push({
                field: 'data',
                message: 'Data configuration must be an object',
            });
            return;
        }
        const dataConfig = data;
        if (dataConfig.schemas !== undefined) {
            if (!Array.isArray(dataConfig.schemas)) {
                errors.push({
                    field: 'data.schemas',
                    message: 'Schemas must be an array of file paths',
                });
            }
            else {
                dataConfig.schemas.forEach((schema, index) => {
                    if (typeof schema !== 'string' || schema.trim() === '') {
                        errors.push({
                            field: `data.schemas[${index}]`,
                            message: 'Each schema must be a non-empty string (file path)',
                        });
                    }
                });
            }
        }
    }
    /**
     * Validate permissions configuration
     */
    validatePermissions(permissions, errors) {
        if (typeof permissions !== 'object' || permissions === null) {
            errors.push({
                field: 'permissions',
                message: 'Permissions configuration must be an object',
            });
            return;
        }
        const permsConfig = permissions;
        // Validate boolean permissions
        const booleanFields = ['fileSystem', 'network', 'ai', 'database'];
        booleanFields.forEach((field) => {
            if (permsConfig[field] !== undefined &&
                typeof permsConfig[field] !== 'boolean') {
                errors.push({
                    field: `permissions.${field}`,
                    message: `Permission '${field}' must be a boolean value`,
                });
            }
        });
    }
    /**
     * Format validation errors for display
     */
    static formatErrors(errors) {
        if (errors.length === 0) {
            return 'No errors';
        }
        return errors
            .map((error) => `  - ${error.field}: ${error.message}`)
            .join('\n');
    }
}
exports.PluginManifestValidator = PluginManifestValidator;
/**
 * Convenience function to validate a manifest
 */
function validatePluginManifest(manifest) {
    const validator = new PluginManifestValidator();
    return validator.validate(manifest);
}
