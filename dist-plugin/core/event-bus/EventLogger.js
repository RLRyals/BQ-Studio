"use strict";
/**
 * Event Logger
 * Handles event logging, history tracking, and debugging capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLogger = void 0;
/**
 * Default logger configuration
 */
const DEFAULT_CONFIG = {
    maxHistory: 500,
    logToConsole: false,
    logLevel: 'info',
    trackExecutionTime: true,
};
/**
 * EventLogger class for tracking and debugging events
 */
class EventLogger {
    constructor(config = {}) {
        this.history = [];
        this.eventCounts = new Map();
        this.totalEvents = 0;
        this.totalExecutionTime = 0;
        this.totalErrors = 0;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Log an event emission
     */
    logEvent(event, data, handlerCount, executionTime, errors) {
        const entry = {
            id: this.generateEventId(),
            event,
            data,
            timestamp: new Date(),
            handlerCount,
            executionTime,
            errors,
        };
        // Add to history
        this.addToHistory(entry);
        // Update statistics
        this.updateStatistics(event, executionTime, errors);
        // Console logging
        if (this.config.logToConsole) {
            this.logToConsole(entry);
        }
        return entry;
    }
    /**
     * Add entry to history with size management
     */
    addToHistory(entry) {
        this.history.push(entry);
        // Keep history size under limit
        if (this.history.length > this.config.maxHistory) {
            this.history.shift();
        }
    }
    /**
     * Update internal statistics
     */
    updateStatistics(event, executionTime, errors) {
        this.totalEvents++;
        this.totalExecutionTime += executionTime;
        // Update event counts
        const currentCount = this.eventCounts.get(event) || 0;
        this.eventCounts.set(event, currentCount + 1);
        // Update error count
        if (errors && errors.length > 0) {
            this.totalErrors += errors.length;
        }
    }
    /**
     * Log to console based on log level
     */
    logToConsole(entry) {
        const { event, data, handlerCount, executionTime, errors } = entry;
        const timestamp = entry.timestamp.toISOString();
        const message = `[EventBus] ${timestamp} - Event: ${event} | Handlers: ${handlerCount} | Time: ${executionTime}ms`;
        if (errors && errors.length > 0) {
            console.error(message, { data, errors });
        }
        else if (this.config.logLevel === 'debug') {
            console.debug(message, { data });
        }
        else if (this.config.logLevel === 'info') {
            console.info(message);
        }
    }
    /**
     * Get event history
     */
    getHistory(limit) {
        if (limit) {
            return this.history.slice(-limit);
        }
        return [...this.history];
    }
    /**
     * Get events matching a pattern
     */
    getEventsByPattern(pattern) {
        const regex = this.patternToRegex(pattern);
        return this.history.filter((entry) => regex.test(entry.event));
    }
    /**
     * Get events within a time range
     */
    getEventsByTimeRange(start, end) {
        return this.history.filter((entry) => entry.timestamp >= start && entry.timestamp <= end);
    }
    /**
     * Get events with errors
     */
    getEventsWithErrors() {
        return this.history.filter((entry) => entry.errors && entry.errors.length > 0);
    }
    /**
     * Get statistics
     */
    getStatistics() {
        const eventCounts = {};
        this.eventCounts.forEach((count, event) => {
            eventCounts[event] = count;
        });
        return {
            totalEvents: this.totalEvents,
            totalSubscriptions: 0, // Will be set by EventBus
            eventCounts,
            averageExecutionTime: this.totalEvents > 0 ? this.totalExecutionTime / this.totalEvents : 0,
            totalErrors: this.totalErrors,
        };
    }
    /**
     * Replay events (for debugging)
     * Returns array of event entries that can be re-emitted
     */
    replay(pattern, since) {
        let events = this.history;
        if (pattern) {
            events = this.getEventsByPattern(pattern);
        }
        if (since) {
            events = events.filter((entry) => entry.timestamp >= since);
        }
        return events;
    }
    /**
     * Clear event history
     */
    clearHistory() {
        this.history = [];
    }
    /**
     * Clear all statistics
     */
    clearStatistics() {
        this.eventCounts.clear();
        this.totalEvents = 0;
        this.totalExecutionTime = 0;
        this.totalErrors = 0;
    }
    /**
     * Clear everything
     */
    clear() {
        this.clearHistory();
        this.clearStatistics();
    }
    /**
     * Generate unique event ID
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Convert wildcard pattern to regex
     */
    patternToRegex(pattern) {
        // Escape special regex characters except * and .
        let regexPattern = pattern
            .replace(/[+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*\*/g, '__DOUBLE_STAR__')
            .replace(/\*/g, '[^.]+')
            .replace(/__DOUBLE_STAR__/g, '.*');
        return new RegExp(`^${regexPattern}$`);
    }
    /**
     * Export history as JSON
     */
    exportHistory() {
        return JSON.stringify({
            history: this.history,
            statistics: this.getStatistics(),
            exportedAt: new Date().toISOString(),
        }, null, 2);
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
}
exports.EventLogger = EventLogger;
