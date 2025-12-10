/**
 * Template Engine
 * Simple but powerful template processing with variable substitution
 */

import {
  TemplateConfig,
  TemplateVariables,
  TemplateResult,
  TemplateMetadata,
  FileServiceError,
  FileServiceErrorCode,
} from './types';

/**
 * Default template configuration
 */
const DEFAULT_CONFIG: Required<TemplateConfig> = {
  delimiter: '{{',
  closingDelimiter: '}}',
  throwOnMissing: false,
  defaultValue: '',
};

/**
 * TemplateEngine class
 * Processes templates with variable substitution using {{ variable }} syntax
 */
export class TemplateEngine {
  private config: Required<TemplateConfig>;

  constructor(config: TemplateConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Process template with variables
   */
  process(template: string, variables: TemplateVariables): TemplateResult {
    try {
      const missingVariables: string[] = [];
      let content = template;

      // Find all variable placeholders
      const variablePattern = this.createVariablePattern();
      const matches = content.matchAll(variablePattern);

      for (const match of matches) {
        const fullMatch = match[0];
        const variablePath = match[1].trim();

        // Get variable value using dot notation path
        const value = this.getNestedValue(variables, variablePath);

        if (value === undefined || value === null) {
          missingVariables.push(variablePath);

          if (this.config.throwOnMissing) {
            throw new FileServiceError(
              `Missing template variable: ${variablePath}`,
              FileServiceErrorCode.MISSING_VARIABLES
            );
          }

          // Replace with default value
          content = content.replace(fullMatch, this.config.defaultValue);
        } else {
          // Replace with actual value
          content = content.replace(fullMatch, String(value));
        }
      }

      return {
        success: true,
        content,
        missingVariables: missingVariables.length > 0 ? missingVariables : undefined,
      };
    } catch (error) {
      if (error instanceof FileServiceError) {
        return {
          success: false,
          error: error as Error,
        };
      }

      return {
        success: false,
        error: new FileServiceError(
          'Template processing failed',
          FileServiceErrorCode.TEMPLATE_PARSE_ERROR,
          undefined,
          error as Error
        ),
      };
    }
  }

  /**
   * Extract variable names from template
   */
  extractVariables(template: string): TemplateMetadata {
    const variables: string[] = [];
    const variablePattern = this.createVariablePattern();
    const matches = template.matchAll(variablePattern);

    for (const match of matches) {
      const variablePath = match[1].trim();
      if (!variables.includes(variablePath)) {
        variables.push(variablePath);
      }
    }

    return {
      path: '',
      variables,
    };
  }

  /**
   * Validate template syntax
   */
  validate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for unmatched delimiters
    const openCount = (template.match(new RegExp(this.escapeRegex(this.config.delimiter), 'g')) || []).length;
    const closeCount = (template.match(new RegExp(this.escapeRegex(this.config.closingDelimiter), 'g')) || []).length;

    if (openCount !== closeCount) {
      errors.push(`Unmatched delimiters: ${openCount} opening, ${closeCount} closing`);
    }

    // Check for empty variable names
    const emptyPattern = new RegExp(
      `${this.escapeRegex(this.config.delimiter)}\\s*${this.escapeRegex(this.config.closingDelimiter)}`,
      'g'
    );
    const emptyMatches = template.match(emptyPattern);
    if (emptyMatches) {
      errors.push(`Found ${emptyMatches.length} empty variable placeholder(s)`);
    }

    // Check for nested delimiters
    const nestedPattern = new RegExp(
      `${this.escapeRegex(this.config.delimiter)}[^${this.escapeRegex(this.config.closingDelimiter)}]*${this.escapeRegex(this.config.delimiter)}`,
      'g'
    );
    const nestedMatches = template.match(nestedPattern);
    if (nestedMatches) {
      errors.push('Found nested delimiters (not supported)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Process template with conditional logic
   * Supports: {{#if variable}} content {{/if}}
   */
  processWithConditionals(template: string, variables: TemplateVariables): TemplateResult {
    try {
      let content = template;

      // Process if blocks
      const ifPattern = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs;
      content = content.replace(ifPattern, (_match, variableName, blockContent) => {
        const value = this.getNestedValue(variables, variableName);
        return this.isTruthy(value) ? blockContent : '';
      });

      // Process unless blocks
      const unlessPattern = /\{\{#unless\s+(\w+)\}\}(.*?)\{\{\/unless\}\}/gs;
      content = content.replace(unlessPattern, (_match, variableName, blockContent) => {
        const value = this.getNestedValue(variables, variableName);
        return !this.isTruthy(value) ? blockContent : '';
      });

      // Process each blocks (simple array iteration)
      const eachPattern = /\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs;
      content = content.replace(eachPattern, (_match, variableName, itemTemplate) => {
        const array = this.getNestedValue(variables, variableName);
        if (!Array.isArray(array)) return '';

        return array
          .map((item, index) => {
            // Create item context with special variables
            const itemContext = {
              ...variables,
              this: item,
              '@index': index,
              '@first': index === 0,
              '@last': index === array.length - 1,
            };
            return this.process(itemTemplate, itemContext).content || '';
          })
          .join('');
      });

      // Process regular variables
      return this.process(content, variables);
    } catch (error) {
      return {
        success: false,
        error: new FileServiceError(
          'Conditional template processing failed',
          FileServiceErrorCode.TEMPLATE_PARSE_ERROR,
          undefined,
          error as Error
        ),
      };
    }
  }

  /**
   * Register custom helper function
   */
  private helpers: Map<string, (...args: any[]) => string> = new Map();

  registerHelper(name: string, fn: (...args: any[]) => string): void {
    this.helpers.set(name, fn);
  }

  /**
   * Process template with custom helpers
   * Supports: {{helper arg1 arg2}}
   */
  processWithHelpers(template: string, variables: TemplateVariables): TemplateResult {
    try {
      let content = template;

      // Pattern to match helper calls: {{helperName arg1 arg2}}
      const helperPattern = /\{\{(\w+)\s+([^}]+)\}\}/g;

      content = content.replace(helperPattern, (match, helperName, argsString) => {
        const helper = this.helpers.get(helperName);
        if (!helper) {
          // Not a helper, might be a regular variable
          return match;
        }

        // Parse arguments (simple space-separated for now)
        const args = argsString
          .split(/\s+/)
          .map((arg: string) => {
            // If arg is a variable reference, resolve it
            const trimmed = arg.trim();
            if (variables.hasOwnProperty(trimmed)) {
              return this.getNestedValue(variables, trimmed);
            }
            // Otherwise treat as literal
            return trimmed.replace(/^["']|["']$/g, ''); // Remove quotes
          });

        try {
          return helper(...args);
        } catch (error) {
          console.error(`Helper '${helperName}' failed:`, error);
          return match;
        }
      });

      // Process remaining regular variables
      return this.process(content, variables);
    } catch (error) {
      return {
        success: false,
        error: new FileServiceError(
          'Helper template processing failed',
          FileServiceErrorCode.TEMPLATE_PARSE_ERROR,
          undefined,
          error as Error
        ),
      };
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Create regex pattern for variable matching
   */
  private createVariablePattern(): RegExp {
    const escaped = this.escapeRegex(this.config.delimiter);
    const escapedClosing = this.escapeRegex(this.config.closingDelimiter);
    return new RegExp(`${escaped}\\s*([^${escapedClosing}]+?)\\s*${escapedClosing}`, 'g');
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get nested value from object using dot notation
   * Example: "user.profile.name" from { user: { profile: { name: "John" } } }
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Check if value is truthy for conditionals
   */
  private isTruthy(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<TemplateConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<TemplateConfig> {
    return { ...this.config };
  }
}

/**
 * Built-in helper functions
 */
export const builtInHelpers = {
  uppercase: (str: string) => str.toUpperCase(),
  lowercase: (str: string) => str.toLowerCase(),
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
  truncate: (str: string, length: number) =>
    str.length > length ? str.substring(0, length) + '...' : str,
  repeat: (str: string, times: number) => str.repeat(times),
  replace: (str: string, search: string, replacement: string) =>
    str.replace(new RegExp(search, 'g'), replacement),
  join: (...args: any[]) => args.join(' '),
  default: (value: any, defaultValue: any) => value || defaultValue,
};

/**
 * Create TemplateEngine with built-in helpers registered
 */
export function createTemplateEngine(config: TemplateConfig = {}): TemplateEngine {
  const engine = new TemplateEngine(config);

  // Register built-in helpers
  Object.entries(builtInHelpers).forEach(([name, fn]) => {
    engine.registerHelper(name, fn);
  });

  return engine;
}
