/**
 * Event Logger
 * Handles event logging, history tracking, and debugging capabilities
 */

import {
  EventLogEntry,
  EventHandlerError,
  EventLoggerConfig,
  EventStatistics,
} from './types';

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: Required<EventLoggerConfig> = {
  maxHistory: 500,
  logToConsole: false,
  logLevel: 'info',
  trackExecutionTime: true,
};

/**
 * EventLogger class for tracking and debugging events
 */
export class EventLogger {
  private config: Required<EventLoggerConfig>;
  private history: EventLogEntry[] = [];
  private eventCounts: Map<string, number> = new Map();
  private totalEvents = 0;
  private totalExecutionTime = 0;
  private totalErrors = 0;

  constructor(config: EventLoggerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Log an event emission
   */
  public logEvent(
    event: string,
    data: any,
    handlerCount: number,
    executionTime: number,
    errors?: EventHandlerError[]
  ): EventLogEntry {
    const entry: EventLogEntry = {
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
  private addToHistory(entry: EventLogEntry): void {
    this.history.push(entry);

    // Keep history size under limit
    if (this.history.length > this.config.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Update internal statistics
   */
  private updateStatistics(
    event: string,
    executionTime: number,
    errors?: EventHandlerError[]
  ): void {
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
  private logToConsole(entry: EventLogEntry): void {
    const { event, data, handlerCount, executionTime, errors } = entry;
    const timestamp = entry.timestamp.toISOString();

    const message = `[EventBus] ${timestamp} - Event: ${event} | Handlers: ${handlerCount} | Time: ${executionTime}ms`;

    if (errors && errors.length > 0) {
      console.error(message, { data, errors });
    } else if (this.config.logLevel === 'debug') {
      console.debug(message, { data });
    } else if (this.config.logLevel === 'info') {
      console.info(message);
    }
  }

  /**
   * Get event history
   */
  public getHistory(limit?: number): EventLogEntry[] {
    if (limit) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  /**
   * Get events matching a pattern
   */
  public getEventsByPattern(pattern: string): EventLogEntry[] {
    const regex = this.patternToRegex(pattern);
    return this.history.filter((entry) => regex.test(entry.event));
  }

  /**
   * Get events within a time range
   */
  public getEventsByTimeRange(start: Date, end: Date): EventLogEntry[] {
    return this.history.filter(
      (entry) => entry.timestamp >= start && entry.timestamp <= end
    );
  }

  /**
   * Get events with errors
   */
  public getEventsWithErrors(): EventLogEntry[] {
    return this.history.filter((entry) => entry.errors && entry.errors.length > 0);
  }

  /**
   * Get statistics
   */
  public getStatistics(): EventStatistics {
    const eventCounts: Record<string, number> = {};
    this.eventCounts.forEach((count, event) => {
      eventCounts[event] = count;
    });

    return {
      totalEvents: this.totalEvents,
      totalSubscriptions: 0, // Will be set by EventBus
      eventCounts,
      averageExecutionTime:
        this.totalEvents > 0 ? this.totalExecutionTime / this.totalEvents : 0,
      totalErrors: this.totalErrors,
    };
  }

  /**
   * Replay events (for debugging)
   * Returns array of event entries that can be re-emitted
   */
  public replay(pattern?: string, since?: Date): EventLogEntry[] {
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
  public clearHistory(): void {
    this.history = [];
  }

  /**
   * Clear all statistics
   */
  public clearStatistics(): void {
    this.eventCounts.clear();
    this.totalEvents = 0;
    this.totalExecutionTime = 0;
    this.totalErrors = 0;
  }

  /**
   * Clear everything
   */
  public clear(): void {
    this.clearHistory();
    this.clearStatistics();
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert wildcard pattern to regex
   */
  private patternToRegex(pattern: string): RegExp {
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
  public exportHistory(): string {
    return JSON.stringify(
      {
        history: this.history,
        statistics: this.getStatistics(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Get configuration
   */
  public getConfig(): Required<EventLoggerConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<EventLoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
