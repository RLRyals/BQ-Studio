/**
 * Execution Detail View
 * Detailed view for a single execution job with real-time logs and progress
 */

import React from 'react';
import { useAgentExecutionStore } from '../../stores/agentExecutionStore';
import { PhaseProgressList } from './PhaseProgressList';
import { TokenUsagePanel } from './TokenUsagePanel';
import { LiveLogsPanel } from './LiveLogsPanel';

export const ExecutionDetailView: React.FC = () => {
  const { selectedJobId, queue, setSelectedJobId } = useAgentExecutionStore();

  // Find the selected job across all queue states
  const job =
    queue.running.find((j) => j.id === selectedJobId) ||
    queue.pending.find((j) => j.id === selectedJobId) ||
    queue.completed.find((j) => j.id === selectedJobId) ||
    queue.failed.find((j) => j.id === selectedJobId);

  if (!selectedJobId || !job) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'pending':
      case 'queued':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {job.seriesName}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                  job.status
                )}`}
              >
                {job.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">{job.skillName}</span>
              <span>•</span>
              <span>Job ID: {job.id.slice(0, 8)}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedJobId(null)}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* User Prompt */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Concept / Prompt
            </h3>
            <p className="text-gray-900 dark:text-white">{job.userPrompt}</p>
          </div>

          {/* Error Display */}
          {job.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    {job.error.code}: {job.error.message}
                  </h3>
                  {job.error.details && (
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {job.error.details}
                    </p>
                  )}
                  {job.error.recoverable && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Retry {job.retryCount + 1}/{job.maxRetries} in progress...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Phase Progress */}
            <div>
              <PhaseProgressList job={job} />
            </div>

            {/* Right Column: Token Usage */}
            <div>
              <TokenUsagePanel job={job} />
            </div>
          </div>

          {/* Live Logs */}
          <LiveLogsPanel job={job} />
        </div>

        {/* Footer with Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {job.status === 'running' && job.currentPhase && (
              <span>Current Phase: {job.currentPhase}</span>
            )}
            {job.status === 'completed' && job.completedAt && (
              <span>
                Completed: {new Date(job.completedAt).toLocaleString()}
              </span>
            )}
            {job.status === 'failed' && job.failedAt && (
              <span>Failed: {new Date(job.failedAt).toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {job.status === 'running' && (
              <button
                onClick={() =>
                  useAgentExecutionStore.getState().pauseJob(job.id)
                }
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
              >
                Pause
              </button>
            )}
            {job.status === 'paused' && (
              <button
                onClick={() =>
                  useAgentExecutionStore.getState().resumeJob(job.id)
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Resume
              </button>
            )}
            {(job.status === 'running' || job.status === 'paused') && (
              <button
                onClick={() =>
                  useAgentExecutionStore.getState().cancelJob(job.id)
                }
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => setSelectedJobId(null)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
