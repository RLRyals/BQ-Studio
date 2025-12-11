"use strict";
/**
 * Event Bus Module
 * Export all event bus components and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusErrorType = exports.EventBusError = exports.EventLogger = exports.EventBus = void 0;
exports.getGlobalEventBus = getGlobalEventBus;
exports.resetGlobalEventBus = resetGlobalEventBus;
const EventBus_1 = require("./EventBus");
var EventBus_2 = require("./EventBus");
Object.defineProperty(exports, "EventBus", { enumerable: true, get: function () { return EventBus_2.EventBus; } });
var EventLogger_1 = require("./EventLogger");
Object.defineProperty(exports, "EventLogger", { enumerable: true, get: function () { return EventLogger_1.EventLogger; } });
var types_1 = require("./types");
Object.defineProperty(exports, "EventBusError", { enumerable: true, get: function () { return types_1.EventBusError; } });
Object.defineProperty(exports, "EventBusErrorType", { enumerable: true, get: function () { return types_1.EventBusErrorType; } });
/**
 * Create a singleton EventBus instance
 */
let globalEventBus = null;
function getGlobalEventBus() {
    if (!globalEventBus) {
        globalEventBus = new EventBus_1.EventBus({
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
function resetGlobalEventBus() {
    if (globalEventBus) {
        globalEventBus.destroy();
        globalEventBus = null;
    }
}
