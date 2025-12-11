/**
 * Live Logs Panel
 * Displays real-time streaming logs from Claude Code execution
 */

import React, { useEffect, useRef, useState } from 'react';
import type { ExecutionJob, ExecutionLog } from '../../../core/agent-orchestration/types';

interface LiveLogsPanelProps {
  job: ExecutionJob;
}

export const LiveLogsPanel: React.FC<LiveLogsPanelProps> = ({ job }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [job.logs, autoScroll]);

  // Filter logs based on selected level
  const filteredLogs = job.logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'debug':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header with Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Live Logs
        </h3>
        <div className="flex items-center space-x-3">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Logs</option>
            <option value="info">Info</option>
            <option value="warning">Warnings</option>
            <option value="error">Errors</option>
          </select>

          {/* Auto-scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${
              autoScroll
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </button>

          {/* Log Count Badge */}
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
            {filteredLogs.length} logs
          </span>
        </div>
      </div>

      {/* Logs Container */}
      <div className="p-4 bg-gray-900 dark:bg-black overflow-auto max-h-96 font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {job.status === 'pending' || job.status === 'queued' ? (
              <p>Waiting for execution to start...</p>
            ) : filter !== 'all' ? (
              <p>No {filter} logs to display.</p>
            ) : (
              <p>No logs available yet.</p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, index) => (
              <div
                key={`${log.timestamp}-${index}`}
                className="flex items-start space-x-2 py-1 hover:bg-gray-800 dark:hover:bg-gray-900 px-2 -mx-2 rounded"
              >
                {/* Timestamp */}
                <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 select-none">
                  [{formatTimestamp(log.timestamp)}]
                </span>

                {/* Level Icon */}
                <span className={`flex-shrink-0 ${getLogLevelColor(log.level)}`}>
                  {getLogLevelIcon(log.level)}
                </span>

                {/* Level Badge */}
                <span
                  className={`uppercase text-xs font-semibold flex-shrink-0 w-16 ${getLogLevelColor(
                    log.level
                  )}`}
                >
                  {log.level}
                </span>

                {/* Message */}
                <span className="text-gray-100 dark:text-gray-200 flex-1 break-all">
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {job.status === 'running' && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-700 dark:text-blue-300">
            Execution in progress - logs updating in real-time
          </span>
        </div>
      )}
    </div>
  );
};
