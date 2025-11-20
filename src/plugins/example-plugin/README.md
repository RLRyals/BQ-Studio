# Example Plugin

A simple example plugin demonstrating the BQ Studio plugin system.

## Overview

This plugin serves as a reference implementation for creating plugins in BQ Studio. It demonstrates:

- Plugin manifest structure
- Plugin lifecycle (onActivate, onDeactivate)
- Access to core services via PluginContext
- Event subscription and emission
- Permission management
- Public API exposure
- UI component integration

## Structure

```
example-plugin/
├── plugin.json          # Plugin manifest
├── index.ts            # Entry point (Plugin class)
├── ui/                 # React components
│   ├── ExampleView.tsx    # Main view
│   └── ExampleWidget.tsx  # Dashboard widget
└── README.md           # This file
```

## Plugin Manifest (plugin.json)

The `plugin.json` file defines the plugin metadata:

```json
{
  "id": "example-plugin",
  "name": "Example Plugin",
  "version": "1.0.0",
  "description": "A simple example plugin",
  "author": "BQ Studio Team",
  "icon": "puzzle",
  "entry": "index.ts",
  "ui": {
    "mainView": "ExampleView",
    "dashboardWidget": "ExampleWidget"
  },
  "permissions": {
    "ai": true,
    "database": true
  }
}
```

## Plugin Class (index.ts)

The entry point exports a default class implementing the `Plugin` interface:

```typescript
export default class ExamplePlugin implements Plugin {
  id = 'example-plugin';
  name = 'Example Plugin';
  version = '1.0.0';

  async onActivate(context: PluginContext) {
    // Initialize plugin
  }

  async onDeactivate() {
    // Clean up resources
  }
}
```

## Using Core Services

The plugin context provides access to core services:

```typescript
// AI Service
const response = await context.core.ai.complete({
  provider: 'anthropic',
  model: 'claude-sonnet-4',
  prompt: 'Generate content...'
});

// Database Service
const results = await context.core.db.query('SELECT * FROM projects');

// Event Bus
context.onEvent('project.created', (data) => {
  console.log('Project created:', data);
});

// File Service
const content = await context.core.files.read('path/to/file.md');
```

## Public API

Plugins can expose a public API for other plugins:

```typescript
api = {
  greet: (name: string): string => {
    return `Hello, ${name}!`;
  }
};
```

Other plugins can access this API:

```typescript
const exampleAPI = context.getPluginAPI('example-plugin');
const greeting = exampleAPI.greet('World');
```

## UI Components

UI components are React components that integrate with the main application:

- **Main View**: Rendered when plugin is opened in workspace tabs
- **Dashboard Widget**: Displayed on the main dashboard

## Permissions

The plugin declares required permissions in the manifest:

- `ai`: Access to AI services
- `database`: Access to database
- `fileSystem`: File system access
- `network`: Network access

## Development

1. Modify the plugin code
2. Reload the plugin: `pluginManager.reloadPlugin('example-plugin')`
3. Test in the application

## Best Practices

1. **Error Handling**: Always wrap operations in try-catch blocks
2. **Resource Cleanup**: Unsubscribe from events in onDeactivate
3. **Permissions**: Only request permissions you need
4. **Logging**: Use context.log() for consistent logging
5. **Dependencies**: Declare plugin dependencies in manifest

## References

- [Plugin Development Guide](/.claude/docs/plugin-guide.md)
- [Architecture Overview](/.claude/docs/architecture.md)
