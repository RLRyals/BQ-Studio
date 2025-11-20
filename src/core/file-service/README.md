# File Service

Core file operations service for BQ Studio with sandboxed access, template processing, and multi-format exports.

## Features

- **Sandboxed File Operations**: Safe file read/write with workspace isolation
- **Template Engine**: Variable substitution with conditionals and helpers
- **Multi-Format Exports**: Convert markdown to DOCX, PDF, and HTML
- **File Watching**: Monitor files and directories for changes
- **Directory Management**: Create, list, and manage directories
- **Type-Safe**: Full TypeScript support with comprehensive types

## Installation

The File Service is part of BQ Studio's core services. Import it from:

```typescript
import { FileService, createFileService } from '@/core/file-service';
```

## Quick Start

### Basic File Operations

```typescript
import { createFileService } from '@/core/file-service';

// Create service instance
const fileService = createFileService('/path/to/workspace');

// Read file
const content = await fileService.readFile('document.md');

// Write file
await fileService.writeFile('output.txt', 'Hello, World!', {
  createDirectories: true,
  overwrite: true,
});

// Copy file
await fileService.copy('source.md', 'backup.md');

// Move file
await fileService.move('old-name.txt', 'new-name.txt');

// Delete file
await fileService.delete('temp.txt');

// Check if file exists
const exists = await fileService.exists('document.md');

// Get file metadata
const metadata = await fileService.getMetadata('document.md');
console.log(metadata.size, metadata.modified);
```

### Directory Operations

```typescript
// Create directory
await fileService.createDirectory('my-folder', true);

// List directory contents
const files = await fileService.listDirectory('my-folder');

// List recursively
const allFiles = await fileService.listDirectory('my-folder', {
  recursive: true,
  filter: (path) => path.endsWith('.md'),
});
```

### File Watching

```typescript
// Watch for changes
const unwatch = fileService.watch('documents/', (event) => {
  console.log(`File ${event.type}: ${event.path}`);
  if (event.stats) {
    console.log(`Size: ${event.stats.size} bytes`);
  }
});

// Stop watching
unwatch();

// Stop all watchers
fileService.unwatchAll();
```

### Template Processing

```typescript
import { createTemplateEngine } from '@/core/file-service';

const engine = createTemplateEngine();

// Simple variable substitution
const result = engine.process(
  'Hello, {{name}}! You are {{age}} years old.',
  { name: 'John', age: 30 }
);
console.log(result.content); // "Hello, John! You are 30 years old."

// Nested variables
const template = 'Author: {{user.profile.name}}';
const data = {
  user: {
    profile: {
      name: 'Jane Doe',
    },
  },
};
const output = engine.process(template, data);
```

### Conditional Templates

```typescript
// If/unless conditionals
const template = `
{{#if premium}}
  Welcome, premium member!
{{/if}}

{{#unless verified}}
  Please verify your email.
{{/unless}}
`;

const result = engine.processWithConditionals(template, {
  premium: true,
  verified: false,
});
```

### Array Iteration

```typescript
// Loop over arrays
const template = `
{{#each books}}
  - {{this.title}} by {{this.author}} ({{@index}})
{{/each}}
`;

const result = engine.processWithConditionals(template, {
  books: [
    { title: 'Book 1', author: 'Author A' },
    { title: 'Book 2', author: 'Author B' },
  ],
});
```

### Custom Template Helpers

```typescript
// Register custom helper
engine.registerHelper('shout', (text) => text.toUpperCase() + '!!!');

// Use helper in template
const result = engine.processWithHelpers(
  'Message: {{shout greeting}}',
  { greeting: 'hello' }
);
console.log(result.content); // "Message: HELLO!!!"
```

### Built-in Helpers

The template engine includes these built-in helpers:

- `uppercase`: Convert to uppercase
- `lowercase`: Convert to lowercase
- `capitalize`: Capitalize first letter
- `truncate`: Truncate string to length
- `repeat`: Repeat string N times
- `replace`: Replace text
- `join`: Join arguments
- `default`: Use default value if empty

```typescript
const template = '{{uppercase name}} - {{truncate description 50}}';
```

### Export to DOCX

```typescript
// Export markdown to Word document
await fileService.export('document.md', {
  outputPath: 'output.docx',
  format: 'docx',
  metadata: {
    title: 'My Document',
    author: 'John Doe',
    subject: 'Important Document',
  },
  styling: {
    fontSize: 12,
    fontFamily: 'Calibri',
    margins: {
      top: 1,
      right: 1,
      bottom: 1,
      left: 1,
    },
  },
});
```

### Export to PDF

```typescript
// Export markdown to PDF (generates HTML for Electron conversion)
await fileService.export('document.md', {
  outputPath: 'output.pdf',
  format: 'pdf',
  metadata: {
    title: 'My Document',
    author: 'John Doe',
  },
  styling: {
    fontSize: 12,
    fontFamily: 'Georgia, serif',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    linkColor: '#0066CC',
  },
});
```

### Export to HTML

```typescript
// Export markdown to HTML
await fileService.export('document.md', {
  outputPath: 'output.html',
  format: 'html',
});
```

## Advanced Features

### Process Template Files

```typescript
// Load and process template file
const output = await fileService.processTemplate('templates/email.txt', {
  userName: 'John',
  subject: 'Welcome',
});

await fileService.writeFile('emails/welcome.txt', output, {
  createDirectories: true,
});
```

### Extract Template Variables

```typescript
const engine = createTemplateEngine();
const template = 'Hello {{name}}, you have {{count}} messages.';

const metadata = engine.extractVariables(template);
console.log(metadata.variables); // ['name', 'count']
```

### Validate Template Syntax

```typescript
const engine = createTemplateEngine();
const template = 'Hello {{name}}, {{}}'; // Invalid: empty variable

const validation = engine.validate(template);
if (!validation.valid) {
  console.error('Template errors:', validation.errors);
}
```

### Custom Delimiters

```typescript
// Use custom delimiters
const engine = new TemplateEngine({
  delimiter: '<%',
  closingDelimiter: '%>',
});

const result = engine.process('<% greeting %>, <% name %>!', {
  greeting: 'Hello',
  name: 'World',
});
```

### Error Handling

```typescript
try {
  await fileService.readFile('non-existent.txt');
} catch (error) {
  if (error instanceof FileServiceError) {
    switch (error.code) {
      case FileServiceErrorCode.FILE_NOT_FOUND:
        console.error('File not found:', error.path);
        break;
      case FileServiceErrorCode.SANDBOX_VIOLATION:
        console.error('Access denied:', error.message);
        break;
      case FileServiceErrorCode.FILE_TOO_LARGE:
        console.error('File too large:', error.message);
        break;
      default:
        console.error('File operation failed:', error.message);
    }
  }
}
```

## Security Features

### Sandboxed Access

All file operations are restricted to the workspace root directory:

```typescript
const fileService = createFileService('/path/to/workspace');

// ✅ Allowed - within workspace
await fileService.readFile('documents/file.txt');
await fileService.readFile('../relative/path.txt'); // Resolved to workspace

// ❌ Denied - outside workspace (throws SANDBOX_VIOLATION)
await fileService.readFile('/etc/passwd');
```

### File Type Restrictions

```typescript
const fileService = new FileService({
  workspaceRoot: '/workspace',
  allowedExtensions: ['.md', '.txt', '.docx', '.pdf'],
});

// ✅ Allowed
await fileService.readFile('document.md');

// ❌ Denied (throws INVALID_FILE_TYPE)
await fileService.readFile('script.exe');
```

### File Size Limits

```typescript
const fileService = new FileService({
  workspaceRoot: '/workspace',
  maxFileSize: 10 * 1024 * 1024, // 10MB limit
});

// ❌ Denied if file > 10MB (throws FILE_TOO_LARGE)
await fileService.readFile('huge-file.txt');
```

## API Reference

### FileService

**Constructor:**
```typescript
new FileService(config: FileServiceConfig)
```

**File Operations:**
- `readFile(path, options?)`: Read file contents
- `writeFile(path, content, options?)`: Write file
- `copy(source, dest, recursive?)`: Copy file/directory
- `move(source, dest)`: Move/rename file
- `delete(path, recursive?)`: Delete file/directory
- `exists(path)`: Check if file exists
- `getMetadata(path)`: Get file metadata

**Directory Operations:**
- `createDirectory(path, recursive?)`: Create directory
- `listDirectory(path, options?)`: List directory contents

**Watching:**
- `watch(path, callback)`: Watch for changes
- `unwatchAll()`: Stop all watchers

**Templates:**
- `processTemplate(path, variables)`: Process template file
- `getTemplateEngine()`: Get template engine instance

**Exports:**
- `export(markdownPath, options)`: Export to DOCX/PDF/HTML

**Cleanup:**
- `dispose()`: Clean up resources

### TemplateEngine

**Constructor:**
```typescript
new TemplateEngine(config?: TemplateConfig)
```

**Methods:**
- `process(template, variables)`: Process template
- `processWithConditionals(template, variables)`: Process with if/unless/each
- `processWithHelpers(template, variables)`: Process with custom helpers
- `extractVariables(template)`: Get variable names
- `validate(template)`: Validate template syntax
- `registerHelper(name, fn)`: Add custom helper
- `setConfig(config)`: Update configuration

## Error Codes

```typescript
enum FileServiceErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SANDBOX_VIOLATION = 'SANDBOX_VIOLATION',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_ALREADY_EXISTS = 'FILE_ALREADY_EXISTS',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  DIRECTORY_NOT_FOUND = 'DIRECTORY_NOT_FOUND',
  DIRECTORY_NOT_EMPTY = 'DIRECTORY_NOT_EMPTY',
  TEMPLATE_PARSE_ERROR = 'TEMPLATE_PARSE_ERROR',
  MISSING_VARIABLES = 'MISSING_VARIABLES',
  INVALID_TEMPLATE = 'INVALID_TEMPLATE',
  EXPORT_FAILED = 'EXPORT_FAILED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  INVALID_MARKDOWN = 'INVALID_MARKDOWN',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PATH = 'INVALID_PATH',
  IO_ERROR = 'IO_ERROR',
}
```

## Best Practices

### 1. Always Use createFileService

```typescript
// ✅ Good
const fileService = createFileService(workspaceRoot);

// ❌ Avoid (unless you need custom config)
const fileService = new FileService({ workspaceRoot, /* complex config */ });
```

### 2. Clean Up Watchers

```typescript
// ✅ Good - cleanup when done
const unwatch = fileService.watch('docs/', handler);
// ... later
unwatch();

// ❌ Avoid - memory leak
fileService.watch('docs/', handler);
// Never cleaned up!
```

### 3. Handle Errors Properly

```typescript
// ✅ Good - specific error handling
try {
  await fileService.readFile('config.json');
} catch (error) {
  if (error instanceof FileServiceError) {
    if (error.code === FileServiceErrorCode.FILE_NOT_FOUND) {
      // Create default config
    }
  }
}
```

### 4. Use createDirectories Option

```typescript
// ✅ Good - automatically creates parent dirs
await fileService.writeFile('deeply/nested/file.txt', content, {
  createDirectories: true,
});

// ❌ Avoid - will fail if dirs don't exist
await fileService.writeFile('deeply/nested/file.txt', content);
```

### 5. Validate Templates Early

```typescript
// ✅ Good - validate before using
const engine = createTemplateEngine();
const validation = engine.validate(templateString);

if (!validation.valid) {
  console.error('Invalid template:', validation.errors);
  return;
}

const result = engine.process(templateString, data);
```

## Integration with BQ Studio

### In Plugin Context

```typescript
export default class MyPlugin implements Plugin {
  async onActivate(context: PluginContext) {
    const fileService = context.core.files;

    // Read manuscript content
    const content = await fileService.readFile('manuscripts/chapter-1.md');

    // Process with template
    const output = await fileService.processTemplate('templates/export.md', {
      title: 'Chapter 1',
      content,
    });

    // Export to DOCX
    await fileService.export('output.md', {
      outputPath: 'exports/chapter-1.docx',
      format: 'docx',
    });
  }
}
```

### In Main Process

```typescript
import { createFileService } from '@/core/file-service';
import { app } from 'electron';
import path from 'path';

const workspaceRoot = path.join(app.getPath('documents'), 'BQ-Studio');
const fileService = createFileService(workspaceRoot);

// Use throughout the application
```

## Dependencies

- `chokidar`: File watching
- `docx`: DOCX export
- `marked`: Markdown parsing
- `fs/promises`: File system operations (Node.js built-in)

## License

Part of BQ Studio - All rights reserved
