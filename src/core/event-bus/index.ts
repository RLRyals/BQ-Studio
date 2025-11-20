/**
 * Event Bus Module
 * Export all event bus components and types
 */

export { EventBus } from './EventBus';
export { EventLogger } from './EventLogger';

export type {
  EventHandler,
  UnsubscribeFunction,
  SubscriptionOptions,
  EventSubscription,
  EventLogEntry,
  EventHandlerError,
  EventLoggerConfig,
  EventBusConfig,
  EventStatistics,
  EventMiddleware,
  PatternMatchResult,
  BQStudioEvents,
  TypedEventBus,
} from './types';

export { EventBusError, EventBusErrorType } from './types';

/**
 * Create a singleton EventBus instance
 */
let globalEventBus: EventBus | null = null;

export function getGlobalEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus({
      enableHistory: true,
      logger: {
        logToConsole: process.env.NODE_ENV === 'development',
        maxHistory: 500,
      },
    });
  }
  return globalEventBus;
}

/**
 * Reset the global EventBus instance (mainly for testing)
 */
export function resetGlobalEventBus(): void {
  if (globalEventBus) {
    globalEventBus.destroy();
    globalEventBus = null;
  }
}
