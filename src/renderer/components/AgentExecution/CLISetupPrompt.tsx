/**
 * CLI Setup Prompt
 * Detects and installs Claude Code CLI if not present
 */

import React, { useEffect, useState } from 'react';

interface CLIInfo {
  isInstalled: boolean;
  version?: string;
  path?: string;
  needsUpdate?: boolean;
}

export const CLISetupPrompt: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [cliInfo, setCLIInfo] = useState<CLIInfo | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState<string>('');
  const [installError, setInstallError] = useState<string>('');

  // Check for CLI on mount
  useEffect(() => {
    checkCLI();

    // Listen for install progress
    const removeListener = window.electron.ipcRenderer.on(
      'agent-execution:install-progress',
      (_event, message: string) => {
        setInstallProgress(message);
      }
    );

    return removeListener;
  }, []);

  const checkCLI = async () => {
    setIsChecking(true);
    try {
      const info = await window.electron.ipcRenderer.invoke('agent-execution:detect-cli');
      setCLIInfo(info);

      if (info.isInstalled) {
        // CLI is installed, we're good!
        onComplete();
      }
    } catch (error) {
      console.error('Failed to detect CLI:', error);
      setCLIInfo({ isInstalled: false });
    } finally {
      setIsChecking(false);
    }
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    setInstallError('');
    setInstallProgress('Starting installation...');

    try {
      const result = await window.electron.ipcRenderer.invoke('agent-execution:install-cli');

      if (result.success) {
        setInstallProgress('Installation complete!');
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setInstallError(result.error || 'Installation failed');
        setInstallProgress('');
      }
    } catch (error) {
      const err = error as Error;
      setInstallError(err.message);
      setInstallProgress('');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleOpenGuide = () => {
    window.electron.ipcRenderer.invoke('agent-execution:open-install-guide');
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking for Claude Code CLI...</p>
        </div>
      </div>
    );
  }

  if (cliInfo?.isInstalled) {
    return null; // Will call onComplete() and unmount
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Claude Code CLI Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            BQ-Studio uses Claude Code CLI to execute agent skills. The CLI is not currently
            installed on your system.
          </p>
        </div>

        {!isInstalling && !installProgress && (
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                What is Claude Code CLI?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Claude Code CLI is a command-line tool that enables headless execution of AI agent
                skills using your Claude Pro or Max subscription. It handles authentication,
                context management, and tool use automatically.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Installation Methods
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• <strong>Windows:</strong> npm install -g @anthropic-ai/claude-code</li>
                <li>• <strong>macOS:</strong> brew install anthropic/tap/claude-code</li>
                <li>• <strong>Linux:</strong> npm install -g @anthropic-ai/claude-code</li>
              </ul>
            </div>
          </div>
        )}

        {isInstalling && (
          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="font-medium text-blue-900 dark:text-blue-100">Installing...</span>
              </div>
              {installProgress && (
                <p className="text-sm text-blue-700 dark:text-blue-300 pl-8">{installProgress}</p>
              )}
            </div>
          </div>
        )}

        {installError && (
          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <h3 className="font-medium text-red-900 dark:text-red-100 mb-1">
                Installation Failed
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">{installError}</p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:cursor-not-allowed"
          >
            {isInstalling ? 'Installing...' : 'Install Automatically'}
          </button>
          <button
            onClick={handleOpenGuide}
            disabled={isInstalling}
            className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Manual Installation Guide
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={checkCLI}
            disabled={isInstalling}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            I've installed it manually, check again
          </button>
        </div>
      </div>
    </div>
  );
};
