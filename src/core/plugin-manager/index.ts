/**
 * Plugin Manager Module
 * Public API for the BQ Studio plugin system
 */

// Core classes
export { PluginManager } from './PluginManager';
export { PluginContext } from './PluginContext';

// Validator
export { PluginManifestValidator, validatePluginManifest } from './validator';
export type { ValidationError, ValidationResult } from './validator';

// Types
export type {
  Plugin,
  PluginManifest,
  PluginMetadata,
  PluginManagerConfig,
  PluginDiscoveryResult,
  PluginLoadResult,
  PluginActivationResult,
  CoreServices,
} from './types';

export { PluginError, PluginErrorType } from './types';
