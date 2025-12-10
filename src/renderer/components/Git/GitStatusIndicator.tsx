/**
 * Git Status Indicator Component
 * Shows Git status in the UI (only if workspace has Git enabled)
 */

import React, { useState, useEffect } from 'react';
import { GitStatus } from '../../../types/workspace';
import { useWorkspaceConfigStore } from '../../stores/workspaceConfigStore';

interface GitStatusIndicatorProps {
  onCommitClick?: () => void;
  onPushClick?: () => void;
}

export const GitStatusIndicator: React.FC<GitStatusIndicatorProps> = ({
  onCommitClick,
  onPushClick,
}) => {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { config } = useWorkspaceConfigStore();

  useEffect(() => {
    if (config?.isGitEnabled) {
      loadStatus();
      // Refresh status every 30 seconds
      const interval = setInterval(loadStatus, 30000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [config?.isGitEnabled]);

  const loadStatus = async () => {
    try {
      const gitStatus = (await window.electron.invoke('git:status')) as GitStatus;
      setStatus(gitStatus);
    } catch (error) {
      console.error('Failed to load Git status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if Git not enabled
  if (!config?.isGitEnabled) {
    return null;
  }

  // Don't show if not a repository
  if (!isLoading && (!status || !status.isRepository)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full" />
        <span>Loading Git status...</span>
      </div>
    );
  }

  if (!status) return null;

  const changesCount =
    status.modified.length +
    status.added.length +
    status.deleted.length +
    status.untracked.length;

  const hasChanges = changesCount > 0;

  return (
    <div className="flex items-center gap-2">
      {/* Branch indicator */}
      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-mono">{status.branch}</span>
      </div>

      {/* Changes indicator */}
      {hasChanges && (
        <button
          onClick={onCommitClick}
          className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
          title={`${changesCount} uncommitted ${changesCount === 1 ? 'change' : 'changes'}`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
          <span>{changesCount}</span>
        </button>
      )}

      {/* Ahead/behind indicator */}
      {status.hasRemote && (status.ahead > 0 || status.behind > 0) && (
        <div className="flex items-center gap-1">
          {status.ahead > 0 && (
            <button
              onClick={onPushClick}
              className="flex items-center gap-0.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              title={`${status.ahead} ${status.ahead === 1 ? 'commit' : 'commits'} ahead`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{status.ahead}</span>
            </button>
          )}
          {status.behind > 0 && (
            <div
              className="flex items-center gap-0.5 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs"
              title={`${status.behind} ${status.behind === 1 ? 'commit' : 'commits'} behind`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{status.behind}</span>
            </div>
          )}
        </div>
      )}

      {/* Clean state indicator */}
      {!hasChanges && status.ahead === 0 && status.behind === 0 && (
        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Up to date</span>
        </div>
      )}
    </div>
  );
};
