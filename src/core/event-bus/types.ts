/**
 * Event Bus Type Definitions
 * Comprehensive type definitions for the event-driven communication system
 */

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (data: T) => void | Promise<void>;

/**
 * Unsubscribe function returned from event subscriptions
 */
export type UnsubscribeFunction = () => void;

/**
 * Event subscription options
 */
export interface SubscriptionOptions {
  /** Handler priority (higher priority handlers execute first) */
  priority?: number;

  /** Maximum number of times this handler can be called */
  maxCalls?: number;

  /** Whether to run handler asynchronously */
  async?: boolean;

  /** Timeout for async handlers (ms) */
  timeout?: number;
}

/**
 * Event subscription metadata
 */
export interface EventSubscription<T = any> {
  /** Unique subscription ID */
  id: string;

  /** Event pattern this subscription listens to */
  pattern: string;

  /** Event handler function */
  handler: EventHandler<T>;

  /** Whether this is a one-time subscription */
  once: boolean;

  /** Subscription options */
  options: SubscriptionOptions;

  /** Number of times this handler has been called */
  callCount: number;

  /** Timestamp when subscription was created */
  createdAt: Date;
}

/**
 * Event log entry
 */
export interface EventLogEntry {
  /** Unique event ID */
  id: string;

  /** Event name */
  event: string;

  /** Event payload data */
  data: any;

  /** Timestamp when event was emitted */
  timestamp: Date;

  /** Number of handlers that were notified */
  handlerCount: number;

  /** Execution time in milliseconds */
  executionTime: number;

  /** Errors that occurred during handler execution */
  errors?: EventHandlerError[];
}

/**
 * Event handler error
 */
export interface EventHandlerError {
  /** Subscription ID that errored */
  subscriptionId: string;

  /** Event pattern that errored */
  pattern: string;

  /** Error object */
  error: Error;

  /** Timestamp when error occurred */
  timestamp: Date;
}

/**
 * Event logger configuration
 */
export interface EventLoggerConfig {
  /** Maximum number of events to keep in history */
  maxHistory?: number;

  /** Whether to log events to console */
  logToConsole?: boolean;

  /** Log level for console output */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  /** Whether to track execution time */
  trackExecutionTime?: boolean;
}

/**
 * Event Bus configuration
 */
export interface EventBusConfig {
  /** Maximum number of listeners per event (0 = unlimited) */
  maxListeners?: number;

  /** Whether to warn when max listeners is exceeded */
  warnOnMaxListeners?: boolean;

  /** Default timeout for async handlers (ms) */
  defaultAsyncTimeout?: number;

  /** Event logger configuration */
  logger?: EventLoggerConfig;

  /** Whether to enable event history */
  enableHistory?: boolean;
}

/**
 * Event statistics
 */
export interface EventStatistics {
  /** Total number of events emitted */
  totalEvents: number;

  /** Total number of subscriptions */
  totalSubscriptions: number;

  /** Events by name with count */
  eventCounts: Record<string, number>;

  /** Average execution time per event */
  averageExecutionTime: number;

  /** Total errors encountered */
  totalErrors: number;
}

/**
 * Middleware function type
 */
export type EventMiddleware = (
  event: string,
  data: any,
  next: () => void | Promise<void>
) => void | Promise<void>;

/**
 * Event pattern matcher result
 */
export interface PatternMatchResult {
  /** Whether the pattern matches */
  matches: boolean;

  /** Captured wildcard segments (if any) */
  captures?: string[];
}

/**
 * Standard event types used throughout BQ Studio
 */
export interface BQStudioEvents {
  // Project events
  'project.created': { projectId: string; name: string; path: string };
  'project.updated': { projectId: string; changes: Record<string, any> };
  'project.deleted': { projectId: string };
  'project.opened': { projectId: string };
  'project.closed': { projectId: string };

  // File events
  'file.created': { path: string; content?: string };
  'file.updated': { path: string; content: string };
  'file.deleted': { path: string };
  'file.saved': { path: string; content: string };
  'file.opened': { path: string };
  'file.closed': { path: string };

  // Workflow events
  'workflow.started': { workflowId: string; name: string };
  'workflow.stage.completed': { workflowId: string; stageId: string; output: any };
  'workflow.completed': { workflowId: string; result: any };
  'workflow.failed': { workflowId: string; error: Error };

  // AI events
  'ai.request.started': { requestId: string; model: string };
  'ai.request.completed': { requestId: string; response: any };
  'ai.request.failed': { requestId: string; error: Error };
  'ai.stream.chunk': { requestId: string; chunk: string };

  // Plugin events
  'plugin.activated': { pluginId: string; name: string };
  'plugin.deactivated': { pluginId: string };
  'plugin.loaded': { pluginId: string };
  'plugin.unloaded': { pluginId: string };
  'plugin.error': { pluginId: string; error: Error };

  // Database events
  'db.query.executed': { query: string; duration: number };
  'db.transaction.started': { transactionId: string };
  'db.transaction.committed': { transactionId: string };
  'db.transaction.rollback': { transactionId: string };

  // UI events
  'ui.theme.changed': { theme: 'light' | 'dark' };
  'ui.modal.opened': { modalId: string };
  'ui.modal.closed': { modalId: string };
  'ui.notification.shown': { message: string; type: 'info' | 'success' | 'warning' | 'error' };

  // System events
  'system.startup': { timestamp: Date };
  'system.shutdown': { timestamp: Date };
  'system.error': { error: Error; context?: any };
}

/**
 * Type-safe event bus interface
 */
export interface TypedEventBus<TEvents extends Record<string, any> = BQStudioEvents> {
  on<K extends keyof TEvents>(
    event: K | string,
    handler: EventHandler<TEvents[K]>,
    options?: SubscriptionOptions
  ): UnsubscribeFunction;

  once<K extends keyof TEvents>(
    event: K | string,
    handler: EventHandler<TEvents[K]>,
    options?: SubscriptionOptions
  ): UnsubscribeFunction;

  emit<K extends keyof TEvents>(
    event: K | string,
    data?: TEvents[K]
  ): Promise<void>;

  off<K extends keyof TEvents>(
    event: K | string,
    handler?: EventHandler<TEvents[K]>
  ): void;
}

/**
 * Event Bus error types
 */
export enum EventBusErrorType {
  HANDLER_TIMEOUT = 'HANDLER_TIMEOUT',
  HANDLER_ERROR = 'HANDLER_ERROR',
  MAX_LISTENERS_EXCEEDED = 'MAX_LISTENERS_EXCEEDED',
  INVALID_EVENT_NAME = 'INVALID_EVENT_NAME',
  MIDDLEWARE_ERROR = 'MIDDLEWARE_ERROR',
}

/**
 * Event Bus error class
 */
export class EventBusError extends Error {
  constructor(
    public type: EventBusErrorType,
    message: string,
    public event?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'EventBusError';
  }
}
