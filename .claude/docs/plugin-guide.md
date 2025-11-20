# Plugin Development Guide

## Quick Start

### 1. Create Plugin Directory
```bash
mkdir -p src/plugins/my-plugin
cd src/plugins/my-plugin
```

### 2. Create Plugin Manifest
Create `plugin.json`:
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": "Your Name",
  "icon": "plugin-icon",
  "entry": "index.ts",
  "ui": {
    "mainView": "MyPluginView",
    "sidebarIcon": "icon-name"
  }
}
```

### 3. Create Entry Point
Create `index.ts`:
```typescript
import { Plugin, PluginContext } from '@/core/plugin-manager';

export default class MyPlugin implements Plugin {
  id = 'my-plugin';
  name = 'My Plugin';
  version = '1.0.0';

  async onActivate(context: PluginContext) {
    // Initialize plugin
    console.log('Plugin activated');
  }

  async onDeactivate() {
    // Cleanup
    console.log('Plugin deactivated');
  }
}
```

### 4. Register with Plugin Manager
The plugin manager automatically discovers plugins in `src/plugins/`.

## Plugin API Reference

### Core Services

#### AI Service
```typescript
// Get AI service
const ai = context.core.ai;

// Make AI request
const response = await ai.complete({
  provider: 'anthropic',
  model: 'claude-sonnet-4',
  prompt: 'Write a story opening...',
  maxTokens: 1000
});

// Stream AI response
ai.stream({
  provider: 'anthropic',
  model: 'claude-sonnet-4',
  prompt: 'Write a chapter...',
  onChunk: (chunk) => console.log(chunk),
  onComplete: (full) => console.log('Done', full)
});
```

#### Database Service
```typescript
// Get database service
const db = context.core.db;

// Query
const projects = await db.query(
  'SELECT * FROM projects WHERE penname_id = ?',
  [pennameId]
);

// Insert
await db.execute(
  'INSERT INTO projects (id, title, type) VALUES (?, ?, ?)',
  [id, title, type]
);

// Transaction
await db.transaction(async (tx) => {
  await tx.execute('INSERT INTO ...');
  await tx.execute('UPDATE ...');
});
```

#### File Service
```typescript
// Get file service
const files = context.core.files;

// Read file
const content = await files.read('path/to/file.md');

// Write file
await files.write('path/to/output.md', content);

// Export to DOCX
await files.export({
  format: 'docx',
  source: 'path/to/file.md',
  output: 'path/to/output.docx'
});

// Load template
const template = await files.loadTemplate('book-dossier');
```

#### Event Bus
```typescript
// Get event bus
const events = context.core.events;

// Emit event
events.emit('book.created', {
  bookId: '123',
  title: 'My Book',
  penname: 'Author Name'
});

// Listen to event
events.on('book.created', (data) => {
  console.log('Book created:', data);
});

// Unsubscribe
const unsubscribe = events.on('book.updated', handler);
unsubscribe(); // Stop listening
```

#### Workflow Engine
```typescript
// Get workflow engine
const workflow = context.core.workflow;

// Create workflow
const wf = await workflow.create({
  pluginId: 'my-plugin',
  stages: [
    { id: 1, name: 'Setup', validate: () => true },
    { id: 2, name: 'Process', validate: () => true },
    { id: 3, name: 'Finalize', validate: () => true }
  ]
});

// Advance to next stage
await workflow.advance(wf.id);

// Get current stage
const current = await workflow.getCurrentStage(wf.id);

// Resume workflow
const resumed = await workflow.resume(wf.id);
```

## UI Integration

### Creating a Main View
```typescript
// ui/MyPluginView.tsx
import React from 'react';
import { usePluginContext } from '@/renderer/hooks/usePluginContext';

export function MyPluginView() {
  const { core } = usePluginContext('my-plugin');

  const handleAction = async () => {
    const result = await core.ai.complete({
      provider: 'anthropic',
      model: 'claude-sonnet-4',
      prompt: 'Generate content...'
    });
    console.log(result);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Plugin</h1>
      <button onClick={handleAction}>Generate</button>
    </div>
  );
}
```

### Creating a Dashboard Widget
```typescript
// ui/MyWidget.tsx
import React from 'react';

export function MyWidget() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">My Widget</h3>
      <p className="text-sm text-gray-600">Widget content</p>
    </div>
  );
}
```

### Registering UI Components
```typescript
// index.ts
import { MyPluginView } from './ui/MyPluginView';
import { MyWidget } from './ui/MyWidget';

export default class MyPlugin implements Plugin {
  // ... other properties

  ui = {
    mainView: MyPluginView,
    dashboardWidget: MyWidget
  };
}
```

## Database Schema

### Extending Database
Create `schemas/schema.sql`:
```sql
-- Plugin-specific tables
CREATE TABLE IF NOT EXISTS my_plugin_data (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_my_plugin_project ON my_plugin_data(project_id);
```

### Running Migrations
```typescript
// In onActivate
async onActivate(context: PluginContext) {
  const schema = await context.core.files.read(
    'src/plugins/my-plugin/schemas/schema.sql'
  );
  await context.core.db.executeSql(schema);
}
```

## Event System

### Standard Events
```typescript
// Emit standard events
events.emit('project.created', { projectId, title });
events.emit('project.updated', { projectId, changes });
events.emit('project.deleted', { projectId });

events.emit('file.created', { filePath, type });
events.emit('file.updated', { filePath });

events.emit('workflow.advanced', { workflowId, stage });
events.emit('workflow.completed', { workflowId });
```

### Custom Events
```typescript
// Emit custom plugin events
events.emit('my-plugin.action-completed', { data });

// Listen to other plugin events
events.on('series-architect.book-created', (data) => {
  // React to book creation
});
```

## Best Practices

### 1. Error Handling
```typescript
try {
  await core.ai.complete({ ... });
} catch (error) {
  console.error('AI request failed:', error);
  // Show user-friendly error message
  context.ui.showError('Failed to generate content');
}
```

### 2. Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await doSomething();
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Data Validation
```typescript
function validateInput(data: unknown): data is ValidType {
  // Runtime validation
  return typeof data === 'object' && 'requiredField' in data;
}
```

### 4. Resource Cleanup
```typescript
async onDeactivate() {
  // Unsubscribe from events
  this.unsubscribers.forEach(unsub => unsub());

  // Close connections
  await this.cleanup();
}
```

### 5. Testing
```typescript
// tests/MyPlugin.test.ts
import { describe, it, expect } from 'vitest';
import MyPlugin from '../index';

describe('MyPlugin', () => {
  it('should activate successfully', async () => {
    const plugin = new MyPlugin();
    const context = createMockContext();
    await plugin.onActivate(context);
    expect(plugin.isActive).toBe(true);
  });
});
```

## Plugin Dependencies

### Declaring Dependencies
```json
{
  "dependencies": ["series-architect", "penname-manager"]
}
```

### Using Other Plugins
```typescript
// Access other plugin's public API
const seriesArchitect = context.getPlugin('series-architect');
const books = await seriesArchitect.api.getBooks(seriesId);
```

## Publishing Plugins

### 1. Version Your Plugin
Follow semantic versioning (MAJOR.MINOR.PATCH)

### 2. Document Your Plugin
Create README.md with:
- What the plugin does
- How to use it
- Configuration options
- API reference

### 3. Test Thoroughly
- Unit tests for services
- Component tests for UI
- Integration tests with core services
- E2E tests for user workflows

### 4. Package Plugin
```bash
npm run build:plugin my-plugin
```

## Examples

### Complete Plugin Example
See `src/plugins/series-architect/` for a full reference implementation of:
- Multi-stage workflow
- AI integration
- Template system
- Complex UI with multiple views
- Database integration
- Export pipeline

### Minimal Plugin Example
```typescript
// Minimal plugin that adds a dashboard widget
export default class SimplePlugin implements Plugin {
  id = 'simple-plugin';
  name = 'Simple Plugin';
  version = '1.0.0';

  ui = {
    dashboardWidget: () => (
      <div className="p-4 bg-white rounded shadow">
        <h3>Hello from Simple Plugin!</h3>
      </div>
    )
  };

  async onActivate(context: PluginContext) {
    console.log('Simple plugin activated');
  }

  async onDeactivate() {
    console.log('Simple plugin deactivated');
  }
}
```

## Troubleshooting

### Plugin Not Loading
- Check `plugin.json` is valid JSON
- Verify `id` matches directory name
- Check entry file path is correct
- Look in console for errors

### Database Errors
- Ensure migrations run on activation
- Check foreign key constraints
- Verify column types match usage

### UI Not Rendering
- Check component is exported correctly
- Verify component is registered in plugin manifest
- Check React console for errors

### Events Not Firing
- Verify event names match exactly
- Check subscription happens before emission
- Ensure event bus is properly initialized

## Support

For questions and issues:
- Check architecture.md for system overview
- Review series-architect plugin as reference
- Ask in project discussions
