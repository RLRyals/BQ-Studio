/**
 * Workspace Settings Component
 * UI for managing workspace configuration
 */

import React, { useState, useEffect } from 'react';
import { useWorkspaceConfigStore } from '../../stores/workspaceConfigStore';
import { GitStatus, WorkspaceConfig, GitOperationResult } from '../../../types/workspace';

export const WorkspaceSettings: React.FC = () => {
  const { config, setConfig } = useWorkspaceConfigStore();
  const [workspacePath, setWorkspacePath] = useState('');
  const [gitRemoteUrl, setGitRemoteUrl] = useState('');
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [isChangingPath, setIsChangingPath] = useState(false);
  const [isUpdatingRemote, setIsUpdatingRemote] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadWorkspaceInfo();
  }, []);

  const loadWorkspaceInfo = async () => {
    try {
      const currentConfig = (await window.electron.invoke('workspace:getConfig')) as WorkspaceConfig;
      if (currentConfig) {
        setWorkspacePath(currentConfig.path);
        setConfig(currentConfig);

        if (currentConfig.isGitEnabled) {
          const remoteUrl = (await window.electron.invoke('workspace:getGitRemoteUrl')) as string | null;
          if (remoteUrl) {
            setGitRemoteUrl(remoteUrl);
          }

          const status = (await window.electron.invoke('git:status')) as GitStatus | { success: false; error: string };
          if ('isRepository' in status) {
            setGitStatus(status);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load workspace info:', error);
    }
  };

  const handleChangeWorkspacePath = async () => {
    setIsChangingPath(true);
    setMessage(null);

    try {
      const newPath = (await window.electron.invoke('workspace:selectFolder')) as string | null;
      if (newPath) {
        const result = (await window.electron.invoke('workspace:setPath', newPath)) as {
          success: boolean;
          error?: string;
        };
        if (result.success) {
          setWorkspacePath(newPath);
          setMessage({ type: 'success', text: 'Workspace location updated successfully' });
          await loadWorkspaceInfo();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update workspace location' });
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to change workspace location',
      });
    } finally {
      setIsChangingPath(false);
    }
  };

  const handleUpdateGitRemote = async () => {
    if (!gitRemoteUrl.trim()) {
      setMessage({ type: 'error', text: 'Remote URL is required' });
      return;
    }

    setIsUpdatingRemote(true);
    setMessage(null);

    try {
      // Check if remote exists
      const existingRemote = (await window.electron.invoke(
        'git:getRemoteUrl',
        'origin'
      )) as string | null;

      let result;
      if (existingRemote) {
        // Update existing remote
        result = (await window.electron.invoke(
          'git:setRemoteUrl',
          'origin',
          gitRemoteUrl
        )) as GitOperationResult;
      } else {
        // Add new remote
        result = (await window.electron.invoke(
          'git:addRemote',
          'origin',
          gitRemoteUrl
        )) as GitOperationResult;
      }

      if (result.success) {
        setMessage({ type: 'success', text: 'Git remote updated successfully' });
        await window.electron.invoke('workspace:updateGitConfig', true, gitRemoteUrl);
        await loadWorkspaceInfo();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update Git remote' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update Git remote',
      });
    } finally {
      setIsUpdatingRemote(false);
    }
  };

  const handleRepairWorkspace = async () => {
    setMessage(null);

    try {
      const result = (await window.electron.invoke('workspace:repair')) as {
        success: boolean;
        error?: string;
      };
      if (result.success) {
        setMessage({ type: 'success', text: 'Workspace structure repaired successfully' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to repair workspace' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to repair workspace',
      });
    }
  };

  const handleOpenWorkspace = async () => {
    if (workspacePath) {
      // Open in file explorer (platform-specific)
      if (window.electron.platform === 'win32') {
        await window.electron.invoke('shell:openPath', workspacePath);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Workspace Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your BQ-Studio workspace location and configuration
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <p
            className={`text-sm ${
              message.type === 'success'
                ? 'text-green-800 dark:text-green-300'
                : 'text-red-800 dark:text-red-300'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Workspace Location */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Workspace Location
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={workspacePath}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
              <button
                onClick={handleChangeWorkspacePath}
                disabled={isChangingPath}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
              >
                {isChangingPath ? 'Changing...' : 'Change'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRepairWorkspace}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-colors"
            >
              Repair Structure
            </button>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>Your workspace contains:</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>Series planning documents</li>
              <li>Character profiles and voice guides</li>
              <li>Custom genre packs</li>
              <li>Templates and exports</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Git Configuration */}
      {config?.isGitEnabled && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Git Configuration
          </h3>

          <div className="space-y-4">
            {/* Git Status */}
            {gitStatus && gitStatus.isRepository && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                    <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">
                      {gitStatus.branch}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Remote:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {gitStatus.hasRemote ? 'Connected' : 'Not configured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Uncommitted changes:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {gitStatus.modified.length +
                        gitStatus.added.length +
                        gitStatus.deleted.length +
                        gitStatus.untracked.length}
                    </span>
                  </div>
                  {gitStatus.hasRemote && (
                    <>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Ahead:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {gitStatus.ahead} commits
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Remote URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remote Repository URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gitRemoteUrl}
                  onChange={(e) => setGitRemoteUrl(e.target.value)}
                  placeholder="https://github.com/username/my-workspace.git"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button
                  onClick={handleUpdateGitRemote}
                  disabled={isUpdatingRemote}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
                >
                  {isUpdatingRemote ? 'Updating...' : 'Update'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Connect to a private GitHub or GitLab repository for cloud backup
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Tip:</strong> Create a private repository on GitHub or GitLab, then paste
                the clone URL here. You can manage commits and pushes from the main BQ-Studio
                interface.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enable Git (if not already enabled) */}
      {!config?.isGitEnabled && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Version Control
          </h3>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Git is not currently enabled for this workspace. You can enable it to track changes
              and sync across devices.
            </p>

            <button
              onClick={async () => {
                const result = (await window.electron.invoke(
                  'workspace:updateGitConfig',
                  true
                )) as { success: boolean };
                if (result.success) {
                  await loadWorkspaceInfo();
                  setMessage({
                    type: 'success',
                    text: 'Git enabled. You can now initialize the repository.',
                  });
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              Enable Git
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">Danger Zone</h3>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Re-run Workspace Setup
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This will guide you through selecting a new workspace location. Your current
                workspace will not be deleted.
              </p>
            </div>
            <button
              onClick={() => {
                // Trigger setup wizard
                window.location.reload();
              }}
              className="ml-4 px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md font-medium transition-colors"
            >
              Reconfigure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
