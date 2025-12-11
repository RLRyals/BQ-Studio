/**
 * Queue Panel
 * Displays execution queue with running, pending, completed, and failed jobs
 */

import React from 'react';
import { useAgentExecutionStore } from '../../stores/agentExecutionStore';
import type { ExecutionJob } from '../../../core/agent-orchestration/types';

export const QueuePanel: React.FC = () => {
  const { queue } = useAgentExecutionStore();

  if (!queue) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-500 dark:text-gray-400">Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Execution Queue
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Max concurrent: {queue.maxConcurrent} | Running: {queue.currentRunning}
        </div>
      </div>

      <div className="space-y-6">
        {/* Running Jobs */}
        {queue.running.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Running ({queue.running.length})
            </h3>
            <div className="space-y-3">
              {queue.running.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* Pending Jobs */}
        {queue.pending.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Pending ({queue.pending.length})
            </h3>
            <div className="space-y-3">
              {queue.pending.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Jobs */}
        {queue.completed.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Completed ({queue.completed.length})
            </h3>
            <div className="space-y-3">
              {queue.completed.slice(0, 5).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {queue.completed.length > 5 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                +{queue.completed.length - 5} more completed jobs
              </p>
            )}
          </section>
        )}

        {/* Failed Jobs */}
        {queue.failed.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
              Failed ({queue.failed.length})
            </h3>
            <div className="space-y-3">
              {queue.failed.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {queue.running.length === 0 &&
          queue.pending.length === 0 &&
          queue.completed.length === 0 &&
          queue.failed.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No executions yet. Create one above to get started!
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

/**
 * Job Card Component
 */
const JobCard: React.FC<{ job: ExecutionJob }> = ({ job }) => {
  const { pauseJob, resumeJob, cancelJob, setSelectedJob } = useAgentExecutionStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
      case 'queued':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return '-';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const diff = endTime - startTime;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
      onClick={() => setSelectedJob(job.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {job.seriesName}
            </h4>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                job.status
              )}`}
            >
              {job.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Skill: {job.skillName}
          </p>

          {job.status === 'running' && (
            <div className="space-y-2">
              {job.currentPhase && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Phase: {job.currentPhase}
                </p>
              )}

              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                  {job.progress}%
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Started: {formatTime(job.startedAt)}</span>
            <span>Duration: {formatDuration(job.startedAt, job.completedAt)}</span>
            <span>Tokens: {job.tokensUsed.total.toLocaleString()}</span>
          </div>

          {job.error && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              Error: {job.error.message}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          {job.status === 'running' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  pauseJob(job.id);
                }}
                className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Pause
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to cancel this execution?')) {
                    cancelJob(job.id);
                  }
                }}
                className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {job.status === 'paused' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resumeJob(job.id);
              }}
              className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              Resume
            </button>
          )}

          {(job.status === 'pending' || job.status === 'queued') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to cancel this execution?')) {
                  cancelJob(job.id);
                }
              }}
              className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
