"use strict";
/**
 * Event Bus Type Definitions
 * Comprehensive type definitions for the event-driven communication system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusError = exports.EventBusErrorType = void 0;
/**
 * Event Bus error types
 */
var EventBusErrorType;
(function (EventBusErrorType) {
    EventBusErrorType["HANDLER_TIMEOUT"] = "HANDLER_TIMEOUT";
    EventBusErrorType["HANDLER_ERROR"] = "HANDLER_ERROR";
    EventBusErrorType["MAX_LISTENERS_EXCEEDED"] = "MAX_LISTENERS_EXCEEDED";
    EventBusErrorType["INVALID_EVENT_NAME"] = "INVALID_EVENT_NAME";
    EventBusErrorType["MIDDLEWARE_ERROR"] = "MIDDLEWARE_ERROR";
})(EventBusErrorType || (exports.EventBusErrorType = EventBusErrorType = {}));
/**
 * Event Bus error class
 */
class EventBusError extends Error {
    constructor(type, message, event, originalError) {
        super(message);
        this.type = type;
        this.event = event;
        this.originalError = originalError;
        this.name = 'EventBusError';
    }
}
exports.EventBusError = EventBusError;
