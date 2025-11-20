# Database Service

The Database Service provides a type-safe interface to the SQLite database for BQ Studio. It handles database initialization, migrations, transactions, and plugin schema extensions.

## Features

- **Type-safe queries**: All database operations are fully typed with TypeScript
- **Automatic migrations**: Schema migrations run automatically on startup
- **Transaction support**: ACID-compliant transactions for data integrity
- **Plugin extensions**: Plugins can extend the database schema
- **Backup/Restore**: Built-in database backup and restore functionality
- **Query builder**: Fluent API for building queries

## Usage

### Initialization

```typescript
import { createDatabaseService } from '@/core/database-service';
import { app } from 'electron';

// Create database service (typically in main process)
const dbService = createDatabaseService(app.getPath('userData'), {
  verbose: process.env.NODE_ENV === 'development',
});

// Initialize database (runs migrations automatically)
await dbService.initialize();
```

### Basic CRUD Operations

#### Insert

```typescript
// Insert a new project
const projectId = dbService.insert('projects', {
  name: 'My Novel Series',
  type: 'series',
  description: 'A 5-book fantasy series',
  status: 'active',
});
```

#### Select

```typescript
// Get all active projects
const projects = dbService.select('projects', {
  where: [{ field: 'status', operator: '=', value: 'active' }],
  orderBy: [{ field: 'created_at', direction: 'DESC' }],
});

// Get a single project
const project = dbService.selectOne('projects', {
  where: [{ field: 'id', operator: '=', value: 1 }],
});
```

#### Update

```typescript
// Update a project
const updatedCount = dbService.update(
  'projects',
  { description: 'Updated description' },
  { where: [{ field: 'id', operator: '=', value: 1 }] }
);
```

#### Delete

```typescript
// Delete a project
const deletedCount = dbService.delete('projects', {
  where: [{ field: 'id', operator: '=', value: 1 }],
});
```

### Advanced Queries

#### Count Records

```typescript
const activeProjectCount = dbService.count('projects', {
  where: [{ field: 'status', operator: '=', value: 'active' }],
});
```

#### Raw SQL Queries

```typescript
// Select query
const results = dbService.query(
  'SELECT * FROM projects WHERE name LIKE ?',
  ['%Novel%']
);

// Execute statement (INSERT, UPDATE, DELETE)
const result = dbService.execute(
  'UPDATE projects SET status = ? WHERE created_at < ?',
  ['archived', '2024-01-01']
);
```

### Transactions

```typescript
// All operations in the transaction are atomic
const result = dbService.transaction(() => {
  const projectId = dbService.insert('projects', {
    name: 'New Project',
    type: 'manuscript',
  });

  dbService.insert('workflows', {
    project_id: projectId,
    workflow_type: 'manuscript-writer',
    current_stage: 'chapter-1',
    stages_data: [{ name: 'Chapter 1', order: 1 }],
  });

  return projectId;
});

// Use immediate transaction for write-heavy workloads
dbService.transaction(
  () => {
    // ... operations
  },
  { immediate: true }
);
```

### Working with JSON Fields

Many tables have JSON fields for flexible data storage. These are automatically parsed:

```typescript
// Insert with JSON metadata
const projectId = dbService.insert('projects', {
  name: 'My Project',
  type: 'series',
  metadata: {
    genre: 'Fantasy',
    targetWordCount: 100000,
    targetAudience: 'Young Adult',
  },
});

// Query returns parsed JSON
const project = dbService.selectOne('projects', {
  where: [{ field: 'id', operator: '=', value: projectId }],
});

console.log(project.metadata.genre); // 'Fantasy'
```

### Plugin Schema Extensions

Plugins can extend the database schema with their own tables:

```typescript
const extension: PluginSchemaExtension = {
  pluginId: 'series-architect',
  pluginName: 'Series Architect',
  version: '1.0.0',
  sql: `
    CREATE TABLE IF NOT EXISTS series_beats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      beat_name TEXT NOT NULL,
      beat_type TEXT NOT NULL,
      content TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_series_beats_project ON series_beats(project_id);
  `,
  tables: ['series_beats'],
};

await dbService.registerPluginSchema(extension);
```

### Backup and Restore

```typescript
// Backup database
await dbService.backup({
  destination: '/path/to/backups/bq-studio-2024-01-15.db',
});

// Restore from backup
await dbService.restore({
  source: '/path/to/backups/bq-studio-2024-01-15.db',
  overwrite: true,
});
```

## Database Schema

### Core Tables

- **projects**: All user projects (series, manuscripts, etc.)
- **pennames**: Author pen names with branding and voice profiles
- **workflows**: Workflow definitions and instances
- **workflow_stages**: Individual stage completion tracking
- **files**: File metadata and content tracking
- **ai_interactions**: Log of all AI API calls for debugging and cost tracking

### System Tables

- **migrations**: Track applied database migrations
- **plugin_schemas**: Track plugin-specific schema extensions
- **settings**: Application and user settings

See `/database/schema.sql` for the complete schema documentation.

## Migration System

Migrations are SQL files in `src/core/database-service/migrations/` that run automatically on database initialization.

### Creating a Migration

1. Create a new SQL file: `002_add_feature.sql`
2. Write your schema changes:

```sql
-- Migration 002: Add new feature
-- Version: 002
-- Created: 2024-01-15

ALTER TABLE projects ADD COLUMN priority TEXT DEFAULT 'normal';

CREATE INDEX idx_projects_priority ON projects(priority);

-- Record migration (required)
INSERT INTO migrations (version, name) VALUES ('002', 'add_feature');
```

3. Migration runs automatically on next startup

### Migration Best Practices

- Always use `IF NOT EXISTS` for CREATE TABLE
- Always use `IF EXISTS` for DROP TABLE
- Test migrations on a backup database first
- Keep migrations small and focused
- Never modify existing migrations that have been released

## Type Safety

All database operations are fully typed:

```typescript
// TypeScript knows the shape of the data
const project: Project = dbService.selectOne('projects', {
  where: [{ field: 'id', operator: '=', value: 1 }],
});

// Compile error: 'invalidField' doesn't exist on ProjectInput
dbService.insert('projects', {
  invalidField: 'value', // ❌ TypeScript error
});

// Autocomplete works for all fields
dbService.insert('projects', {
  name: 'My Project', // ✅ Autocomplete available
  type: 'series', // ✅ Autocomplete available
});
```

## Error Handling

```typescript
try {
  await dbService.initialize();
} catch (error) {
  console.error('Failed to initialize database:', error);
  // Handle error appropriately
}

// Transactions automatically rollback on error
try {
  dbService.transaction(() => {
    // If any operation fails, all changes are rolled back
    dbService.insert('projects', { ... });
    dbService.insert('workflows', { ... });
  });
} catch (error) {
  console.error('Transaction failed:', error);
}
```

## Performance Tips

1. **Use indexes**: Create indexes on frequently queried fields
2. **Use transactions**: Batch multiple operations in a transaction
3. **Use prepared statements**: The service uses prepared statements internally
4. **Limit results**: Use `limit` and `offset` for pagination
5. **Use WAL mode**: Enabled by default for better concurrency

## Testing

```typescript
import { DatabaseService } from '@/core/database-service';
import * as path from 'path';

// Use in-memory database for tests
const testDb = new DatabaseService({
  filename: ':memory:',
  verbose: false,
});

await testDb.initialize();

// Run tests...

testDb.close();
```

## Advanced Usage

### Direct Database Access

For complex queries not covered by the query builder:

```typescript
const db = dbService.getDatabase();

// Use better-sqlite3 API directly
const stmt = db.prepare(`
  SELECT p.*, COUNT(f.id) as file_count
  FROM projects p
  LEFT JOIN files f ON f.project_id = p.id
  GROUP BY p.id
`);

const results = stmt.all();
```

### Custom Query Builders

Build your own query helpers:

```typescript
class ProjectRepository {
  constructor(private db: DatabaseService) {}

  findActiveSeriesProjects() {
    return this.db.select('projects', {
      where: [
        { field: 'type', operator: '=', value: 'series' },
        { field: 'status', operator: '=', value: 'active' },
      ],
      orderBy: [{ field: 'created_at', direction: 'DESC' }],
    });
  }

  archiveOldProjects(beforeDate: string) {
    return this.db.update(
      'projects',
      { status: 'archived' },
      {
        where: [
          { field: 'created_at', operator: '<', value: beforeDate },
          { field: 'status', operator: '=', value: 'active' },
        ],
      }
    );
  }
}
```

## Troubleshooting

### Database is locked

- Enable WAL mode (enabled by default)
- Increase timeout: `{ timeout: 10000 }`
- Ensure transactions are committed

### Migration failed

- Check migration SQL syntax
- Ensure migrations are numbered sequentially
- Check database permissions

### Performance issues

- Add indexes on frequently queried fields
- Use transactions for bulk operations
- Limit result sets with `limit` parameter
- Consider archiving old data

## See Also

- [Architecture Documentation](/.claude/docs/architecture.md)
- [Plugin Guide](/.claude/docs/plugin-guide.md)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3/wiki)
