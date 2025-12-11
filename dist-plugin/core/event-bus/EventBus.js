"use strict";
/**
 * Event Bus
 * Core event-driven communication system for BQ Studio plugins
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const types_1 = require("./types");
const EventLogger_1 = require("./EventLogger");
/**
 * Default EventBus configuration
 */
const DEFAULT_CONFIG = {
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
const DEFAULT_SUBSCRIPTION_OPTIONS = {
    priority: 0,
    maxCalls: Infinity,
    async: false,
    timeout: 5000,
};
/**
 * EventBus class implementing pub/sub pattern with advanced features
 */
class EventBus {
    constructor(config = {}) {
        this.subscriptions = new Map();
        this.middlewares = [];
        this.listenerCounts = new Map();
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
            logger: { ...DEFAULT_CONFIG.logger, ...config.logger },
        };
        this.logger = new EventLogger_1.EventLogger(this.config.logger);
    }
    /**
     * Subscribe to an event
     * @param event Event name or wildcard pattern
     * @param handler Event handler function
     * @param options Subscription options
     * @returns Unsubscribe function
     */
    on(event, handler, options = {}) {
        return this.subscribe(event, handler, false, options);
    }
    /**
     * Subscribe to an event (one-time)
     * @param event Event name or wildcard pattern
     * @param handler Event handler function
     * @param options Subscription options
     * @returns Unsubscribe function
     */
    once(event, handler, options = {}) {
        return this.subscribe(event, handler, true, options);
    }
    /**
     * Emit an event
     * @param event Event name
     * @param data Event payload
     */
    async emit(event, data) {
        const startTime = performance.now();
        const errors = [];
        try {
            // Run middleware chain
            await this.runMiddleware(event, data);
            // Get matching subscriptions
            const matchingSubscriptions = this.getMatchingSubscriptions(event);
            // Sort by priority (higher priority first)
            matchingSubscriptions.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0));
            // Execute handlers
            await this.executeHandlers(matchingSubscriptions, data, errors);
            // Remove one-time subscriptions and subscriptions that exceeded maxCalls
            this.cleanupSubscriptions(matchingSubscriptions);
        }
        catch (error) {
            errors.push({
                subscriptionId: 'middleware',
                pattern: event,
                error: error,
                timestamp: new Date(),
            });
        }
        finally {
            // Log event
            if (this.config.enableHistory) {
                const executionTime = performance.now() - startTime;
                const handlerCount = this.getMatchingSubscriptions(event).length;
                this.logger.logEvent(event, data, handlerCount, executionTime, errors.length > 0 ? errors : undefined);
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
    off(event, handler) {
        const subscriptions = this.subscriptions.get(event);
        if (!subscriptions)
            return;
        if (handler) {
            // Remove specific handler
            const index = subscriptions.findIndex((sub) => sub.handler === handler);
            if (index !== -1) {
                subscriptions.splice(index, 1);
                this.updateListenerCount(event, -1);
            }
        }
        else {
            // Remove all handlers for this event
            const count = subscriptions.length;
            this.subscriptions.delete(event);
            this.updateListenerCount(event, -count);
        }
        // Clean up empty subscription arrays
        if (subscriptions && subscriptions.length === 0) {
            this.subscriptions.delete(event);
        }
    }
    /**
     * Remove all event listeners
     */
    removeAllListeners(event) {
        if (event) {
            this.off(event);
        }
        else {
            this.subscriptions.clear();
            this.listenerCounts.clear();
        }
    }
    /**
     * Add middleware
     * @param middleware Middleware function
     */
    use(middleware) {
        this.middlewares.push(middleware);
    }
    /**
     * Get event history
     */
    getHistory(limit) {
        return this.logger.getHistory(limit);
    }
    /**
     * Get events by pattern
     */
    getEventsByPattern(pattern) {
        return this.logger.getEventsByPattern(pattern);
    }
    /**
     * Get events with errors
     */
    getEventsWithErrors() {
        return this.logger.getEventsWithErrors();
    }
    /**
     * Get statistics
     */
    getStatistics() {
        const stats = this.logger.getStatistics();
        stats.totalSubscriptions = this.getTotalSubscriptionCount();
        return stats;
    }
    /**
     * Clear event history
     */
    clearHistory() {
        this.logger.clearHistory();
    }
    /**
     * Export history as JSON
     */
    exportHistory() {
        return this.logger.exportHistory();
    }
    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        return this.listenerCounts.get(event) || 0;
    }
    /**
     * Get all event names with listeners
     */
    eventNames() {
        return Array.from(this.subscriptions.keys());
    }
    /**
     * Wait for an event (Promise-based)
     * @param event Event name
     * @param timeout Optional timeout in ms
     * @returns Promise that resolves with event data
     */
    waitFor(event, timeout) {
        return new Promise((resolve, reject) => {
            let timeoutId;
            const unsubscribe = this.once(event, (data) => {
                if (timeoutId)
                    clearTimeout(timeoutId);
                resolve(data);
            });
            if (timeout) {
                timeoutId = setTimeout(() => {
                    unsubscribe();
                    reject(new types_1.EventBusError(types_1.EventBusErrorType.HANDLER_TIMEOUT, `Timeout waiting for event "${event}"`, event));
                }, timeout);
            }
        });
    }
    /**
     * Internal: Subscribe to an event
     */
    subscribe(pattern, handler, once, options) {
        // Validate event name
        if (!pattern || typeof pattern !== 'string') {
            throw new types_1.EventBusError(types_1.EventBusErrorType.INVALID_EVENT_NAME, 'Event name must be a non-empty string');
        }
        // Create subscription
        const subscription = {
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
        const subscriptions = this.subscriptions.get(pattern);
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
    getMatchingSubscriptions(event) {
        const matching = [];
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
    matchesPattern(event, pattern) {
        // Exact match
        if (event === pattern)
            return true;
        // No wildcards
        if (!pattern.includes('*'))
            return false;
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
    async executeHandlers(subscriptions, data, errors) {
        for (const subscription of subscriptions) {
            try {
                // Check if subscription has exceeded max calls
                if (subscription.options.maxCalls !== undefined && subscription.callCount >= subscription.options.maxCalls) {
                    continue;
                }
                // Increment call count
                subscription.callCount++;
                // Execute handler with timeout
                if (subscription.options.async) {
                    const promise = subscription.handler(data);
                    if (promise instanceof Promise) {
                        if (subscription.options.timeout !== undefined) {
                            await this.executeWithTimeout(promise, subscription.options.timeout);
                        }
                        else {
                            await promise;
                        }
                    }
                }
                else {
                    const result = subscription.handler(data);
                    // If handler returns a promise, wait for it
                    if (result instanceof Promise && subscription.options.timeout !== undefined) {
                        await this.executeWithTimeout(result, subscription.options.timeout);
                    }
                }
            }
            catch (error) {
                errors.push({
                    subscriptionId: subscription.id,
                    pattern: subscription.pattern,
                    error: error,
                    timestamp: new Date(),
                });
            }
        }
    }
    /**
     * Execute promise with timeout
     */
    async executeWithTimeout(promise, timeout) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new types_1.EventBusError(types_1.EventBusErrorType.HANDLER_TIMEOUT, `Handler execution exceeded timeout of ${timeout}ms`)), timeout)),
        ]);
    }
    /**
     * Run middleware chain
     */
    async runMiddleware(event, data) {
        let index = 0;
        const next = async () => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                try {
                    await middleware(event, data, next);
                }
                catch (error) {
                    throw new types_1.EventBusError(types_1.EventBusErrorType.MIDDLEWARE_ERROR, 'Middleware execution failed', event, error);
                }
            }
        };
        await next();
    }
    /**
     * Clean up one-time subscriptions and subscriptions that exceeded maxCalls
     */
    cleanupSubscriptions(subscriptions) {
        for (const subscription of subscriptions) {
            if (subscription.once ||
                (subscription.options.maxCalls !== undefined && subscription.callCount >= subscription.options.maxCalls)) {
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
    updateListenerCount(event, delta) {
        const current = this.listenerCounts.get(event) || 0;
        const newCount = current + delta;
        if (newCount <= 0) {
            this.listenerCounts.delete(event);
        }
        else {
            this.listenerCounts.set(event, newCount);
        }
    }
    /**
     * Check and warn if max listeners exceeded
     */
    checkMaxListeners(event) {
        if (!this.config.warnOnMaxListeners || this.config.maxListeners === 0) {
            return;
        }
        const count = this.listenerCount(event);
        if (count > this.config.maxListeners) {
            console.warn(`[EventBus] Warning: Possible memory leak detected. ` +
                `Event "${event}" has ${count} listeners (max: ${this.config.maxListeners}). ` +
                `Use off() to remove listeners when no longer needed.`);
        }
    }
    /**
     * Get total subscription count
     */
    getTotalSubscriptionCount() {
        let total = 0;
        for (const subscriptions of this.subscriptions.values()) {
            total += subscriptions.length;
        }
        return total;
    }
    /**
     * Generate unique subscription ID
     */
    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Destroy the event bus and clean up all resources
     */
    destroy() {
        this.removeAllListeners();
        this.middlewares = [];
        this.logger.clear();
    }
}
exports.EventBus = EventBus;
