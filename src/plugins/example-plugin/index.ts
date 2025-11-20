/**
 * Example Plugin
 * Demonstrates how to create a plugin for BQ Studio
 */

import { Plugin, PluginContext } from '@/core/plugin-manager';

export default class ExamplePlugin implements Plugin {
  id = 'example-plugin';
  name = 'Example Plugin';
  version = '1.0.0';
  description = 'A simple example plugin';

  // Store plugin context for later use
  private context?: PluginContext;

  // Event unsubscribers
  private unsubscribers: (() => void)[] = [];

  /**
   * Called when plugin is activated
   */
  async onActivate(context: PluginContext): Promise<void> {
    this.context = context;

    // Log activation
    context.log('info', 'Example plugin is activating!');

    // Example: Subscribe to events
    const unsubscribe = context.onEvent('project.created', (data) => {
      context.log('info', 'Project created event received', data);
    });
    this.unsubscribers.push(unsubscribe);

    // Example: Check permissions
    if (context.hasPermission('ai')) {
      context.log('info', 'AI service access granted');
    }

    if (context.hasPermission('database')) {
      context.log('info', 'Database access granted');
    }

    // Example: Access core services (when available)
    if (context.core.events) {
      context.log('info', 'Event bus is available');
    }

    if (context.core.ai) {
      context.log('info', 'AI service is available');
    }

    if (context.core.db) {
      context.log('info', 'Database service is available');
    }

    context.log('info', 'Example plugin activated successfully!');
  }

  /**
   * Called when plugin is deactivated
   */
  async onDeactivate(): Promise<void> {
    if (this.context) {
      this.context.log('info', 'Example plugin is deactivating...');
    }

    // Unsubscribe from events
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];

    // Clean up resources
    this.context = undefined;

    console.log('[Example Plugin] Deactivated');
  }

  /**
   * Example public API method
   * Other plugins can call this via: context.getPluginAPI('example-plugin').greet(name)
   */
  api = {
    greet: (name: string): string => {
      return `Hello, ${name}! Welcome to BQ Studio!`;
    },

    getExampleData: async (): Promise<any> => {
      if (!this.context) {
        throw new Error('Plugin not activated');
      }

      this.context.log('info', 'Getting example data...');

      return {
        message: 'This is example data from the Example Plugin',
        timestamp: new Date().toISOString(),
        pluginId: this.id,
        version: this.version,
      };
    },
  };
}
