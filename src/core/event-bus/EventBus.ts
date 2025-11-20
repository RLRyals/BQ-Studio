/**
 * Event Bus
 * Core event-driven communication system for BQ Studio plugins
 */

import {
  EventHandler,
  UnsubscribeFunction,
  SubscriptionOptions,
  EventSubscription,
  EventBusConfig,
  EventMiddleware,
  EventHandlerError,
  EventBusError,
  EventBusErrorType,
  EventStatistics,
  BQStudioEvents,
  TypedEventBus,
} from './types';
import { EventLogger } from './EventLogger';

/**
 * Default EventBus configuration
 */
const DEFAULT_CONFIG: Required<EventBusConfig> = {
  maxListeners: 100,
  warnOnMaxListeners: true,
  defaultAsyncTimeout: 5000,
  logger: {
    maxHistory: 500,
    logToConsole: false,
    logLevel: 'info',
    trackExecutionTime: true,
  },
  enableHistory: true,
};

/**
 * Default subscription options
 */
const DEFAULT_SUBSCRIPTION_OPTIONS: Required<SubscriptionOptions> = {
  priority: 0,
  maxCalls: Infinity,
  async: false,
  timeout: 5000,
};

/**
 * EventBus class implementing pub/sub pattern with advanced features
 */
export class EventBus implements TypedEventBus<BQStudioEvents> {
  private config: Required<EventBusConfig>;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private middlewares: EventMiddleware[] = [];
  private logger: EventLogger;
  private listenerCounts: Map<string, number> = new Map();

  constructor(config: EventBusConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      logger: { ...DEFAULT_CONFIG.logger, ...config.logger },
    };

    this.logger = new EventLogger(this.config.logger);
  }

  /**
   * Subscribe to an event
   * @param event Event name or wildcard pattern
   * @param handler Event handler function
   * @param options Subscription options
   * @returns Unsubscribe function
   */
  public on<K extends keyof BQStudioEvents>(
    event: K | string,
    handler: EventHandler<BQStudioEvents[K]>,
    options: SubscriptionOptions = {}
  ): UnsubscribeFunction {
    return this.subscribe(event as string, handler, false, options);
  }

  /**
   * Subscribe to an event (one-time)
   * @param event Event name or wildcard pattern
   * @param handler Event handler function
   * @param options Subscription options
   * @returns Unsubscribe function
   */
  public once<K extends keyof BQStudioEvents>(
    event: K | string,
    handler: EventHandler<BQStudioEvents[K]>,
    options: SubscriptionOptions = {}
  ): UnsubscribeFunction {
    return this.subscribe(event as string, handler, true, options);
  }

  /**
   * Emit an event
   * @param event Event name
   * @param data Event payload
   */
  public async emit<K extends keyof BQStudioEvents>(
    event: K | string,
    data?: BQStudioEvents[K]
  ): Promise<void> {
    const startTime = performance.now();
    const errors: EventHandlerError[] = [];

    try {
      // Run middleware chain
      await this.runMiddleware(event as string, data);

      // Get matching subscriptions
      const matchingSubscriptions = this.getMatchingSubscriptions(event as string);

      // Sort by priority (higher priority first)
      matchingSubscriptions.sort((a, b) => b.options.priority - a.options.priority);

      // Execute handlers
      await this.executeHandlers(matchingSubscriptions, data, errors);

      // Remove one-time subscriptions and subscriptions that exceeded maxCalls
      this.cleanupSubscriptions(matchingSubscriptions);
    } catch (error) {
      errors.push({
        subscriptionId: 'middleware',
        pattern: event as string,
        error: error as Error,
        timestamp: new Date(),
      });
    } finally {
      // Log event
      if (this.config.enableHistory) {
        const executionTime = performance.now() - startTime;
        const handlerCount = this.getMatchingSubscriptions(event as string).length;
        this.logger.logEvent(
          event as string,
          data,
          handlerCount,
          executionTime,
          errors.length > 0 ? errors : undefined
        );
      }
    }

    // Throw if there were errors (in development mode)
    if (errors.length > 0 && process.env.NODE_ENV === 'development') {
      console.error(`[EventBus] Errors occurred while emitting "${event}":`, errors);
    }
  }

  /**
   * Unsubscribe from an event
   * @param event Event name or pattern
   * @param handler Optional specific handler to remove (if not provided, removes all handlers for event)
   */
  public off<K extends keyof BQStudioEvents>(
    event: K | string,
    handler?: EventHandler<BQStudioEvents[K]>
  ): void {
    const subscriptions = this.subscriptions.get(event as string);
    if (!subscriptions) return;

    if (handler) {
      // Remove specific handler
      const index = subscriptions.findIndex((sub) => sub.handler === handler);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        this.updateListenerCount(event as string, -1);
      }
    } else {
      // Remove all handlers for this event
      const count = subscriptions.length;
      this.subscriptions.delete(event as string);
      this.updateListenerCount(event as string, -count);
    }

    // Clean up empty subscription arrays
    if (subscriptions && subscriptions.length === 0) {
      this.subscriptions.delete(event as string);
    }
  }

  /**
   * Remove all event listeners
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.off(event);
    } else {
      this.subscriptions.clear();
      this.listenerCounts.clear();
    }
  }

  /**
   * Add middleware
   * @param middleware Middleware function
   */
  public use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Get event history
   */
  public getHistory(limit?: number) {
    return this.logger.getHistory(limit);
  }

  /**
   * Get events by pattern
   */
  public getEventsByPattern(pattern: string) {
    return this.logger.getEventsByPattern(pattern);
  }

  /**
   * Get events with errors
   */
  public getEventsWithErrors() {
    return this.logger.getEventsWithErrors();
  }

  /**
   * Get statistics
   */
  public getStatistics(): EventStatistics {
    const stats = this.logger.getStatistics();
    stats.totalSubscriptions = this.getTotalSubscriptionCount();
    return stats;
  }

  /**
   * Clear event history
   */
  public clearHistory(): void {
    this.logger.clearHistory();
  }

  /**
   * Export history as JSON
   */
  public exportHistory(): string {
    return this.logger.exportHistory();
  }

  /**
   * Get listener count for an event
   */
  public listenerCount(event: string): number {
    return this.listenerCounts.get(event) || 0;
  }

  /**
   * Get all event names with listeners
   */
  public eventNames(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Wait for an event (Promise-based)
   * @param event Event name
   * @param timeout Optional timeout in ms
   * @returns Promise that resolves with event data
   */
  public waitFor<K extends keyof BQStudioEvents>(
    event: K | string,
    timeout?: number
  ): Promise<BQStudioEvents[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined;

      const unsubscribe = this.once(event, (data) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(data);
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          unsubscribe();
          reject(
            new EventBusError(
              EventBusErrorType.HANDLER_TIMEOUT,
              `Timeout waiting for event "${event}"`,
              event as string
            )
          );
        }, timeout);
      }
    });
  }

  /**
   * Internal: Subscribe to an event
   */
  private subscribe(
    pattern: string,
    handler: EventHandler,
    once: boolean,
    options: SubscriptionOptions
  ): UnsubscribeFunction {
    // Validate event name
    if (!pattern || typeof pattern !== 'string') {
      throw new EventBusError(
        EventBusErrorType.INVALID_EVENT_NAME,
        'Event name must be a non-empty string'
      );
    }

    // Create subscription
    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      pattern,
      handler,
      once,
      options: { ...DEFAULT_SUBSCRIPTION_OPTIONS, ...options },
      callCount: 0,
      createdAt: new Date(),
    };

    // Add to subscriptions map
    if (!this.subscriptions.has(pattern)) {
      this.subscriptions.set(pattern, []);
    }

    const subscriptions = this.subscriptions.get(pattern)!;
    subscriptions.push(subscription);

    // Update listener count and check max listeners
    this.updateListenerCount(pattern, 1);
    this.checkMaxListeners(pattern);

    // Return unsubscribe function
    return () => {
      const index = subscriptions.indexOf(subscription);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        this.updateListenerCount(pattern, -1);
      }
    };
  }

  /**
   * Get subscriptions that match an event
   */
  private getMatchingSubscriptions(event: string): EventSubscription[] {
    const matching: EventSubscription[] = [];

    for (const [pattern, subscriptions] of this.subscriptions.entries()) {
      if (this.matchesPattern(event, pattern)) {
        matching.push(...subscriptions);
      }
    }

    return matching;
  }

  /**
   * Check if an event matches a pattern
   * Supports wildcards: * (single segment) and ** (multiple segments)
   */
  private matchesPattern(event: string, pattern: string): boolean {
    // Exact match
    if (event === pattern) return true;

    // No wildcards
    if (!pattern.includes('*')) return false;

    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '__DOUBLE_STAR__')
      .replace(/\*/g, '[^.]+')
      .replace(/__DOUBLE_STAR__/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(event);
  }

  /**
   * Execute event handlers
   */
  private async executeHandlers(
    subscriptions: EventSubscription[],
    data: any,
    errors: EventHandlerError[]
  ): Promise<void> {
    for (const subscription of subscriptions) {
      try {
        // Check if subscription has exceeded max calls
        if (subscription.callCount >= subscription.options.maxCalls) {
          continue;
        }

        // Increment call count
        subscription.callCount++;

        // Execute handler with timeout
        if (subscription.options.async) {
          await this.executeWithTimeout(
            subscription.handler(data),
            subscription.options.timeout
          );
        } else {
          const result = subscription.handler(data);
          // If handler returns a promise, wait for it
          if (result instanceof Promise) {
            await this.executeWithTimeout(result, subscription.options.timeout);
          }
        }
      } catch (error) {
        errors.push({
          subscriptionId: subscription.id,
          pattern: subscription.pattern,
          error: error as Error,
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Execute promise with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new EventBusError(
                EventBusErrorType.HANDLER_TIMEOUT,
                `Handler execution exceeded timeout of ${timeout}ms`
              )
            ),
          timeout
        )
      ),
    ]);
  }

  /**
   * Run middleware chain
   */
  private async runMiddleware(event: string, data: any): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        try {
          await middleware(event, data, next);
        } catch (error) {
          throw new EventBusError(
            EventBusErrorType.MIDDLEWARE_ERROR,
            'Middleware execution failed',
            event,
            error as Error
          );
        }
      }
    };

    await next();
  }

  /**
   * Clean up one-time subscriptions and subscriptions that exceeded maxCalls
   */
  private cleanupSubscriptions(subscriptions: EventSubscription[]): void {
    for (const subscription of subscriptions) {
      if (
        subscription.once ||
        subscription.callCount >= subscription.options.maxCalls
      ) {
        const subs = this.subscriptions.get(subscription.pattern);
        if (subs) {
          const index = subs.indexOf(subscription);
          if (index !== -1) {
            subs.splice(index, 1);
            this.updateListenerCount(subscription.pattern, -1);
          }
        }
      }
    }
  }

  /**
   * Update listener count
   */
  private updateListenerCount(event: string, delta: number): void {
    const current = this.listenerCounts.get(event) || 0;
    const newCount = current + delta;

    if (newCount <= 0) {
      this.listenerCounts.delete(event);
    } else {
      this.listenerCounts.set(event, newCount);
    }
  }

  /**
   * Check and warn if max listeners exceeded
   */
  private checkMaxListeners(event: string): void {
    if (!this.config.warnOnMaxListeners || this.config.maxListeners === 0) {
      return;
    }

    const count = this.listenerCount(event);
    if (count > this.config.maxListeners) {
      console.warn(
        `[EventBus] Warning: Possible memory leak detected. ` +
          `Event "${event}" has ${count} listeners (max: ${this.config.maxListeners}). ` +
          `Use off() to remove listeners when no longer needed.`
      );
    }
  }

  /**
   * Get total subscription count
   */
  private getTotalSubscriptionCount(): number {
    let total = 0;
    for (const subscriptions of this.subscriptions.values()) {
      total += subscriptions.length;
    }
    return total;
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Destroy the event bus and clean up all resources
   */
  public destroy(): void {
    this.removeAllListeners();
    this.middlewares = [];
    this.logger.clear();
  }
}
