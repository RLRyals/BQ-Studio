# Event Bus - BQ Studio

A powerful, type-safe event-driven communication system for BQ Studio plugins.

## Features

- **Type-Safe Events**: Full TypeScript support with generics
- **Wildcard Matching**: Support for `*` (single segment) and `**` (multiple segments)
- **Event History**: Track and debug events with built-in logger
- **Priority Handlers**: Control execution order with priority levels
- **Async Support**: Handle asynchronous event handlers with timeout protection
- **Memory Leak Prevention**: Auto-cleanup and max listener warnings
- **Middleware Support**: Transform or validate events before emission
- **Event Replay**: Debug by replaying historical events

## Installation

```typescript
import { EventBus, getGlobalEventBus } from '@/core/event-bus';

// Create a new EventBus instance
const eventBus = new EventBus();

// Or use the global singleton
const globalBus = getGlobalEventBus();
```

## Basic Usage

### Subscribe to Events

```typescript
// Basic subscription
const unsubscribe = eventBus.on('project.created', (data) => {
  console.log('Project created:', data.projectId);
});

// One-time subscription
eventBus.once('plugin.activated', (data) => {
  console.log('Plugin activated:', data.pluginId);
});

// Unsubscribe manually
unsubscribe();

// Or use off()
eventBus.off('project.created', handler);
```

### Emit Events

```typescript
// Emit with data
await eventBus.emit('project.created', {
  projectId: 'project-123',
  name: 'My Project',
  path: '/path/to/project',
});

// Emit without data
await eventBus.emit('system.startup');
```

### Wildcard Patterns

```typescript
// Match all project events
eventBus.on('project.*', (data) => {
  console.log('Project event:', data);
});

// Match all events at any depth
eventBus.on('**', (data) => {
  console.log('Any event:', data);
});

// Match specific patterns
eventBus.on('workflow.*.completed', (data) => {
  console.log('Something completed:', data);
});
```

## Advanced Features

### Priority-Based Handlers

```typescript
// High priority handler (runs first)
eventBus.on(
  'file.saved',
  (data) => {
    console.log('High priority handler');
  },
  { priority: 10 }
);

// Low priority handler (runs last)
eventBus.on(
  'file.saved',
  (data) => {
    console.log('Low priority handler');
  },
  { priority: -10 }
);
```

### Async Handlers with Timeout

```typescript
eventBus.on(
  'ai.request.started',
  async (data) => {
    await someAsyncOperation(data);
  },
  {
    async: true,
    timeout: 3000, // 3 second timeout
  }
);
```

### Limited Call Handlers

```typescript
// Handler that only runs 5 times
eventBus.on(
  'notification.shown',
  (data) => {
    console.log('Notification:', data);
  },
  { maxCalls: 5 }
);
```

### Middleware

```typescript
// Logging middleware
eventBus.use(async (event, data, next) => {
  console.log(`[Middleware] Event: ${event}`);
  await next();
  console.log(`[Middleware] Event completed: ${event}`);
});

// Validation middleware
eventBus.use(async (event, data, next) => {
  if (event.startsWith('project.') && !data.projectId) {
    throw new Error('Project events must have projectId');
  }
  await next();
});
```

### Wait for Event (Promise-based)

```typescript
// Wait for an event with timeout
try {
  const data = await eventBus.waitFor('workflow.completed', 10000);
  console.log('Workflow completed:', data);
} catch (error) {
  console.error('Timeout waiting for workflow completion');
}
```

## Event History & Debugging

### Get Event History

```typescript
// Get last 100 events
const history = eventBus.getHistory(100);

// Get events by pattern
const projectEvents = eventBus.getEventsByPattern('project.*');

// Get events with errors
const erroredEvents = eventBus.getEventsWithErrors();
```

### Statistics

```typescript
const stats = eventBus.getStatistics();
console.log('Total events:', stats.totalEvents);
console.log('Total subscriptions:', stats.totalSubscriptions);
console.log('Event counts:', stats.eventCounts);
console.log('Average execution time:', stats.averageExecutionTime);
console.log('Total errors:', stats.totalErrors);
```

### Export History

```typescript
// Export history as JSON
const historyJson = eventBus.exportHistory();
fs.writeFileSync('event-history.json', historyJson);
```

## Configuration

```typescript
const eventBus = new EventBus({
  // Maximum listeners per event (0 = unlimited)
  maxListeners: 100,

  // Warn when max listeners exceeded
  warnOnMaxListeners: true,

  // Default timeout for async handlers (ms)
  defaultAsyncTimeout: 5000,

  // Enable event history tracking
  enableHistory: true,

  // Logger configuration
  logger: {
    maxHistory: 500,
    logToConsole: true,
    logLevel: 'info',
    trackExecutionTime: true,
  },
});
```

## Type Safety

Define custom event types:

```typescript
interface MyEvents {
  'user.login': { userId: string; email: string };
  'user.logout': { userId: string };
  'data.sync': { records: number };
}

const typedBus = new EventBus() as TypedEventBus<MyEvents>;

// TypeScript will enforce correct event names and data types
typedBus.on('user.login', (data) => {
  // data is typed as { userId: string; email: string }
  console.log(data.userId, data.email);
});

// TypeScript error: wrong event name
// typedBus.on('user.signin', ...);

// TypeScript error: wrong data type
// await typedBus.emit('user.login', { id: 123 });
```

## Standard Event Types

BQ Studio defines standard event types in `BQStudioEvents`:

### Project Events
- `project.created` - New project created
- `project.updated` - Project updated
- `project.deleted` - Project deleted
- `project.opened` - Project opened
- `project.closed` - Project closed

### File Events
- `file.created` - File created
- `file.updated` - File updated
- `file.deleted` - File deleted
- `file.saved` - File saved
- `file.opened` - File opened
- `file.closed` - File closed

### Workflow Events
- `workflow.started` - Workflow started
- `workflow.stage.completed` - Workflow stage completed
- `workflow.completed` - Workflow completed
- `workflow.failed` - Workflow failed

### AI Events
- `ai.request.started` - AI request started
- `ai.request.completed` - AI request completed
- `ai.request.failed` - AI request failed
- `ai.stream.chunk` - AI stream chunk received

### Plugin Events
- `plugin.activated` - Plugin activated
- `plugin.deactivated` - Plugin deactivated
- `plugin.loaded` - Plugin loaded
- `plugin.unloaded` - Plugin unloaded
- `plugin.error` - Plugin error

### Database Events
- `db.query.executed` - Database query executed
- `db.transaction.started` - Transaction started
- `db.transaction.committed` - Transaction committed
- `db.transaction.rollback` - Transaction rolled back

### UI Events
- `ui.theme.changed` - Theme changed
- `ui.modal.opened` - Modal opened
- `ui.modal.closed` - Modal closed
- `ui.notification.shown` - Notification shown

### System Events
- `system.startup` - System startup
- `system.shutdown` - System shutdown
- `system.error` - System error

## Plugin Integration

### In Plugin Context

```typescript
export default class MyPlugin implements Plugin {
  private unsubscribers: UnsubscribeFunction[] = [];

  async onActivate(context: PluginContext) {
    const { events } = context;

    // Subscribe to events
    const unsub1 = events.on('project.created', this.handleProjectCreated);
    const unsub2 = events.on('file.saved', this.handleFileSaved);

    // Store for cleanup
    this.unsubscribers.push(unsub1, unsub2);

    // Emit events
    await events.emit('plugin.activated', {
      pluginId: this.id,
      name: this.name,
    });
  }

  async onDeactivate() {
    // Clean up all subscriptions
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
  }

  private handleProjectCreated = (data: any) => {
    console.log('Project created:', data);
  };

  private handleFileSaved = (data: any) => {
    console.log('File saved:', data);
  };
}
```

## Memory Leak Prevention

### Best Practices

1. **Always unsubscribe**: Use the returned unsubscribe function or `off()` method
2. **Use `once()`**: For one-time events, use `once()` instead of `on()`
3. **Clean up in deactivate**: Remove all listeners in plugin's `onDeactivate()`
4. **Watch warnings**: Pay attention to max listener warnings
5. **Use maxCalls**: Limit handler execution with `maxCalls` option

### Example: Proper Cleanup

```typescript
class MyService {
  private eventBus: EventBus;
  private unsubscribers: UnsubscribeFunction[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupListeners();
  }

  private setupListeners() {
    this.unsubscribers.push(
      this.eventBus.on('data.changed', this.handleDataChanged),
      this.eventBus.on('user.login', this.handleUserLogin),
      this.eventBus.on('system.shutdown', this.handleShutdown)
    );
  }

  public destroy() {
    // Remove all subscriptions
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
  }

  private handleDataChanged = (data: any) => {
    // Handle event
  };

  private handleUserLogin = (data: any) => {
    // Handle event
  };

  private handleShutdown = (data: any) => {
    this.destroy();
  };
}
```

## Performance Considerations

1. **Wildcard patterns**: More specific patterns are faster than broad wildcards
2. **Priority handlers**: Use sparingly, as sorting has overhead
3. **Async handlers**: Set appropriate timeouts to prevent hanging
4. **History size**: Adjust `maxHistory` based on memory constraints
5. **Middleware**: Keep middleware lightweight

## Error Handling

```typescript
// Errors in handlers don't stop other handlers
eventBus.on('data.process', (data) => {
  throw new Error('Handler error');
});

eventBus.on('data.process', (data) => {
  console.log('This still runs');
});

// Check for errors in history
const errored = eventBus.getEventsWithErrors();
errored.forEach((entry) => {
  console.error('Event:', entry.event);
  console.error('Errors:', entry.errors);
});
```

## Testing

```typescript
import { EventBus } from '@/core/event-bus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  afterEach(() => {
    eventBus.destroy();
  });

  it('should emit and receive events', async () => {
    const handler = jest.fn();
    eventBus.on('test.event', handler);

    await eventBus.emit('test.event', { value: 123 });

    expect(handler).toHaveBeenCalledWith({ value: 123 });
  });

  it('should support wildcard patterns', async () => {
    const handler = jest.fn();
    eventBus.on('test.*', handler);

    await eventBus.emit('test.event1', { a: 1 });
    await eventBus.emit('test.event2', { b: 2 });

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('should unsubscribe correctly', async () => {
    const handler = jest.fn();
    const unsub = eventBus.on('test.event', handler);

    unsub();
    await eventBus.emit('test.event', {});

    expect(handler).not.toHaveBeenCalled();
  });
});
```

## Architecture

### Event Flow

```
Emit Event
    |
    v
Middleware Chain
    |
    v
Pattern Matching
    |
    v
Priority Sorting
    |
    v
Handler Execution (with timeout)
    |
    v
Cleanup (once/maxCalls)
    |
    v
Event Logging
```

### Wildcard Matching

- `*` - Matches single segment: `project.*` matches `project.created` but not `project.file.created`
- `**` - Matches multiple segments: `project.**` matches `project.created` and `project.file.created`
- Exact match is always checked first for performance

### Memory Management

- Subscriptions are stored in a Map for O(1) lookup
- One-time subscriptions are automatically removed after execution
- MaxCalls subscriptions are removed when limit is reached
- Empty subscription arrays are cleaned up
- Listener count tracking prevents memory leaks

## API Reference

### EventBus Methods

- `on(event, handler, options?)` - Subscribe to event
- `once(event, handler, options?)` - Subscribe to event (one-time)
- `emit(event, data?)` - Emit event
- `off(event, handler?)` - Unsubscribe from event
- `removeAllListeners(event?)` - Remove all listeners
- `use(middleware)` - Add middleware
- `waitFor(event, timeout?)` - Wait for event (Promise)
- `getHistory(limit?)` - Get event history
- `getEventsByPattern(pattern)` - Get events by pattern
- `getEventsWithErrors()` - Get events with errors
- `getStatistics()` - Get statistics
- `clearHistory()` - Clear event history
- `exportHistory()` - Export history as JSON
- `listenerCount(event)` - Get listener count
- `eventNames()` - Get all event names
- `destroy()` - Destroy event bus

### EventLogger Methods

- `logEvent(event, data, handlerCount, executionTime, errors?)` - Log event
- `getHistory(limit?)` - Get event history
- `getEventsByPattern(pattern)` - Get events by pattern
- `getEventsByTimeRange(start, end)` - Get events by time range
- `getEventsWithErrors()` - Get events with errors
- `getStatistics()` - Get statistics
- `replay(pattern?, since?)` - Replay events
- `clearHistory()` - Clear history
- `clearStatistics()` - Clear statistics
- `clear()` - Clear everything
- `exportHistory()` - Export history as JSON

## License

MIT
