/**
 * Commit Dialog Component
 * UI for manually committing changes to Git
 */

import React, { useState, useEffect } from 'react';
import { GitStatus } from '../../../types/workspace';

interface CommitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (message: string) => Promise<void>;
}

export const CommitDialog: React.FC<CommitDialogProps> = ({ isOpen, onClose, onCommit }) => {
  const [message, setMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<GitStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const gitStatus = (await window.electron.invoke('git:status')) as GitStatus;
      setStatus(gitStatus);
    } catch (error) {
      console.error('Failed to load Git status:', error);
    }
  };

  const handleCommit = async () => {
    if (!message.trim()) {
      setError('Commit message is required');
      return;
    }

    setIsCommitting(true);
    setError(null);

    try {
      await onCommit(message.trim());
      setMessage('');
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to commit');
    } finally {
      setIsCommitting(false);
    }
  };

  if (!isOpen) return null;

  const hasChanges =
    status &&
    (status.modified.length > 0 ||
      status.added.length > 0 ||
      status.deleted.length > 0 ||
      status.untracked.length > 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Commit Changes
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {!hasChanges && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                No changes to commit. All files are up to date.
              </p>
            </div>
          )}

          {hasChanges && status && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Files to commit:
                </label>
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-40 overflow-y-auto">
                  <div className="space-y-1 text-xs font-mono">
                    {status.modified.map((file) => (
                      <div key={file} className="text-yellow-600 dark:text-yellow-400">
                        M {file}
                      </div>
                    ))}
                    {status.added.map((file) => (
                      <div key={file} className="text-green-600 dark:text-green-400">
                        A {file}
                      </div>
                    ))}
                    {status.deleted.map((file) => (
                      <div key={file} className="text-red-600 dark:text-red-400">
                        D {file}
                      </div>
                    ))}
                    {status.untracked.map((file) => (
                      <div key={file} className="text-blue-600 dark:text-blue-400">
                        ? {file}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="commit-message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Commit message
                </label>
                <textarea
                  id="commit-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your changes..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isCommitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use a clear, descriptive message about what changed
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isCommitting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Cancel
          </button>
          {hasChanges && (
            <button
              onClick={handleCommit}
              disabled={isCommitting || !message.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
            >
              {isCommitting ? 'Committing...' : 'Commit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
