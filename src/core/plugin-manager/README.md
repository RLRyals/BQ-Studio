# Plugin Manager

The Plugin Manager is the core system for discovering, loading, and managing plugins in BQ Studio. It provides a complete plugin lifecycle management system with dependency resolution, validation, and isolation.

## Features

- **Plugin Discovery**: Automatically scans `src/plugins/` directory
- **Manifest Validation**: Validates `plugin.json` schemas
- **Dependency Resolution**: Topological sorting for plugin dependencies
- **Lifecycle Management**: Handles activation and deactivation
- **Service Injection**: Provides plugins with access to core services via PluginContext
- **Error Handling**: Graceful error handling for plugin failures
- **Sandboxing**: Plugin isolation (configurable)
- **Hot Reload**: Support for reloading plugins without restart

## Architecture

### Components

1. **PluginManager**: Core class for plugin management
2. **PluginContext**: Dependency injection container for plugins
3. **Validator**: Manifest validation and schema checking
4. **Types**: TypeScript type definitions

### Plugin Lifecycle

```
Discovery → Validation → Loading → Activation → Running → Deactivation → Cleanup
```

## Usage

### Initialize Plugin Manager

```typescript
import { PluginManager } from '@/core/plugin-manager';
import * as path from 'path';

const pluginManager = new PluginManager({
  pluginsPath: path.join(__dirname, '../plugins'),
  coreServices: {
    ai: aiService,
    db: databaseService,
    files: fileService,
    events: eventBus,
    workflow: workflowEngine,
  },
  enableSandbox: false,
  autoActivate: true,
});

// Initialize (discovers and loads all plugins)
await pluginManager.initialize();
```

### Plugin Operations

```typescript
// Get all plugins
const plugins = pluginManager.getAllPlugins();

// Get active plugins
const activePlugins = pluginManager.getActivePlugins();

// Check plugin status
const isLoaded = pluginManager.isPluginLoaded('example-plugin');
const isActive = pluginManager.isPluginActive('example-plugin');

// Activate/Deactivate plugins
await pluginManager.activatePlugin('example-plugin');
await pluginManager.deactivatePlugin('example-plugin');

// Reload a plugin
await pluginManager.reloadPlugin('example-plugin');

// Get statistics
const stats = pluginManager.getStats();
console.log(stats); // { total: 5, loaded: 5, active: 4, failed: 0 }
```

### Creating a Plugin

#### 1. Create Plugin Directory

```bash
mkdir -p src/plugins/my-plugin
cd src/plugins/my-plugin
```

#### 2. Create plugin.json

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "author": "Your Name",
  "icon": "star",
  "entry": "index.ts",
  "dependencies": [],
  "ui": {
    "mainView": "MyPluginView",
    "dashboardWidget": "MyWidget"
  },
  "permissions": {
    "ai": true,
    "database": true,
    "fileSystem": false,
    "network": false
  }
}
```

#### 3. Create index.ts

```typescript
import { Plugin, PluginContext } from '@/core/plugin-manager';

export default class MyPlugin implements Plugin {
  id = 'my-plugin';
  name = 'My Plugin';
  version = '1.0.0';

  async onActivate(context: PluginContext) {
    context.log('info', 'Plugin activated!');

    // Access core services
    if (context.core.ai) {
      const response = await context.core.ai.complete({
        provider: 'anthropic',
        model: 'claude-sonnet-4',
        prompt: 'Hello!',
      });
    }

    // Subscribe to events
    context.onEvent('project.created', (data) => {
      context.log('info', 'Project created', data);
    });
  }

  async onDeactivate() {
    console.log('Plugin deactivated');
  }

  // Public API for other plugins
  api = {
    doSomething: () => {
      return 'Something done!';
    },
  };
}
```

## Plugin Context API

The `PluginContext` provides plugins with access to:

### Properties

- `manifest`: Plugin manifest
- `pluginId`: Plugin ID
- `pluginPath`: Plugin directory path
- `core`: Core services (ai, db, files, events, workflow)

### Methods

#### Plugin Access

```typescript
// Get another plugin
const otherPlugin = context.getPlugin('other-plugin');

// Get another plugin's API
const api = context.getPluginAPI('other-plugin');
```

#### Logging

```typescript
context.log('info', 'Information message');
context.log('warn', 'Warning message');
context.log('error', 'Error message', errorObject);
context.log('debug', 'Debug message');
```

#### Events

```typescript
// Subscribe to events (auto-cleanup on deactivation)
const unsubscribe = context.onEvent('event-name', (data) => {
  console.log('Event received:', data);
});

// Emit events
context.emitEvent('my-event', { foo: 'bar' });
```

#### Database

```typescript
// Execute queries
const results = await context.executeQuery(
  'SELECT * FROM projects WHERE id = ?',
  [projectId]
);
```

#### Permissions

```typescript
// Check permission
if (context.hasPermission('ai')) {
  // Use AI service
}

// Require permission (throws if not granted)
context.requirePermission('database');
```

#### Utilities

```typescript
// Create scoped error
const error = context.createError('Something went wrong', originalError);

// Safe execution with error handling
const result = await context.safeExecute(async () => {
  return await riskyOperation();
}, 'Operation failed');

// Get namespaced storage key
const key = context.getStorageKey('myData'); // "plugin.my-plugin.myData"
```

## Manifest Schema

### Required Fields

- `id` (string): Unique plugin identifier (lowercase, hyphens only)
- `name` (string): Display name
- `version` (string): Semantic version (e.g., "1.0.0")
- `description` (string): Brief description
- `author` (string): Author name
- `entry` (string): Entry file path (e.g., "index.ts")

### Optional Fields

- `icon` (string): Icon name for UI
- `dependencies` (string[]): Array of plugin IDs this plugin depends on
- `ui` (object): UI configuration
  - `mainView` (string): Main view component name
  - `sidebarIcon` (string): Sidebar icon name
  - `dashboardWidget` (string): Dashboard widget component name
- `data` (object): Database configuration
  - `schemas` (string[]): SQL schema file paths
- `permissions` (object): Required permissions
  - `fileSystem` (boolean): File system access
  - `network` (boolean): Network access
  - `ai` (boolean): AI service access
  - `database` (boolean): Database access

## Validation

Manifest validation checks:

- Required fields are present and non-empty
- ID format (lowercase, hyphens only)
- Version format (semantic versioning)
- Entry file extension (.ts or .js)
- Dependencies array structure
- UI configuration structure
- Permissions boolean values

### Example Validation

```typescript
import { validatePluginManifest } from '@/core/plugin-manager';

const result = validatePluginManifest(manifest);

if (!result.valid) {
  console.error('Validation errors:');
  result.errors.forEach((error) => {
    console.error(`  - ${error.field}: ${error.message}`);
  });
}
```

## Error Handling

The Plugin Manager provides comprehensive error handling:

### Error Types

- `MANIFEST_NOT_FOUND`: plugin.json file not found
- `MANIFEST_INVALID`: Invalid manifest schema
- `ENTRY_NOT_FOUND`: Entry file not found
- `LOAD_FAILED`: Plugin failed to load
- `ACTIVATION_FAILED`: Plugin failed to activate
- `DEACTIVATION_FAILED`: Plugin failed to deactivate
- `DEPENDENCY_NOT_MET`: Required dependency not loaded
- `ALREADY_LOADED`: Plugin already loaded
- `NOT_LOADED`: Plugin not loaded

### Example Error Handling

```typescript
try {
  await pluginManager.activatePlugin('my-plugin');
} catch (error) {
  if (error instanceof PluginError) {
    console.error(`Plugin error: ${error.type}`);
    console.error(`Plugin ID: ${error.pluginId}`);
    console.error(`Message: ${error.message}`);
    if (error.originalError) {
      console.error(`Original error:`, error.originalError);
    }
  }
}
```

## Dependency Resolution

Plugins can declare dependencies on other plugins:

```json
{
  "dependencies": ["penname-manager", "series-architect"]
}
```

The Plugin Manager:

1. Performs topological sort to determine load order
2. Loads dependencies before dependent plugins
3. Activates dependencies before dependent plugins
4. Deactivates dependent plugins before dependencies
5. Detects and warns about circular dependencies

## Best Practices

### 1. Resource Cleanup

Always clean up resources in `onDeactivate`:

```typescript
async onDeactivate() {
  // Unsubscribe from events
  this.unsubscribers.forEach(unsub => unsub());

  // Close connections
  await this.cleanup();

  // Clear references
  this.context = undefined;
}
```

### 2. Error Handling

Wrap plugin operations in try-catch:

```typescript
async onActivate(context: PluginContext) {
  try {
    await this.initialize(context);
  } catch (error) {
    context.log('error', 'Initialization failed', error);
    throw error;
  }
}
```

### 3. Permission Checks

Check permissions before using services:

```typescript
async onActivate(context: PluginContext) {
  if (!context.hasPermission('ai')) {
    context.log('warn', 'AI permission not granted');
    return;
  }

  // Use AI service
}
```

### 4. Event Subscriptions

Use context.onEvent for automatic cleanup:

```typescript
async onActivate(context: PluginContext) {
  // This subscription will be auto-cleaned on deactivation
  context.onEvent('project.created', (data) => {
    this.handleProjectCreated(data);
  });
}
```

### 5. Logging

Use context.log for consistent logging:

```typescript
context.log('info', 'Operation completed successfully');
context.log('warn', 'Non-critical issue detected', { issue });
context.log('error', 'Operation failed', error);
context.log('debug', 'Debug information', { data });
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { PluginManager } from './PluginManager';

describe('PluginManager', () => {
  it('should discover plugins', async () => {
    const manager = new PluginManager({
      pluginsPath: './test/fixtures/plugins',
    });

    const plugins = await manager.discoverPlugins();
    expect(plugins.length).toBeGreaterThan(0);
  });

  it('should validate manifests', async () => {
    // Test manifest validation
  });

  it('should handle dependencies', async () => {
    // Test dependency resolution
  });
});
```

## Integration

### Electron Main Process

```typescript
import { PluginManager } from './core/plugin-manager';
import { app } from 'electron';
import * as path from 'path';

const pluginManager = new PluginManager({
  pluginsPath: path.join(app.getAppPath(), 'src/plugins'),
  coreServices: {
    ai: aiService,
    db: databaseService,
    files: fileService,
    events: eventBus,
    workflow: workflowEngine,
  },
});

app.on('ready', async () => {
  await pluginManager.initialize();
});

app.on('before-quit', async () => {
  await pluginManager.shutdown();
});
```

## Future Enhancements

- [ ] Plugin marketplace/registry
- [ ] Plugin versioning and updates
- [ ] Plugin sandboxing with VM isolation
- [ ] Plugin performance monitoring
- [ ] Plugin hot reload in development
- [ ] Plugin configuration UI
- [ ] Plugin analytics and telemetry

## References

- [Plugin Development Guide](/.claude/docs/plugin-guide.md)
- [Architecture Overview](/.claude/docs/architecture.md)
- [Example Plugin](../../plugins/example-plugin/README.md)
