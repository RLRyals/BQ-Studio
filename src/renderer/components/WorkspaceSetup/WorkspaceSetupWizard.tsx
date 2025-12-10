/**
 * Workspace Setup Wizard
 * Multi-step wizard for first-run workspace configuration
 */

import React, { useState, useEffect } from 'react';
import { PathSelector } from './PathSelector';
import { GitInitOption } from './GitInitOption';
import { useWorkspaceConfigStore } from '../../stores/workspaceConfigStore';
import { WorkspaceValidationState } from '../../../types/workspace';

interface WorkspaceSetupWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
}

type WizardStep = 'welcome' | 'location' | 'git' | 'creating' | 'complete';

export const WorkspaceSetupWizard: React.FC<WorkspaceSetupWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [selectedPath, setSelectedPath] = useState('');
  const [defaultPath, setDefaultPath] = useState('');
  const [gitEnabled, setGitEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { setConfig, setIsFirstRun, setValidationState } = useWorkspaceConfigStore();

  // Load default path on mount
  useEffect(() => {
    const loadDefaultPath = async () => {
      try {
        const path = await window.electron.invoke('workspace:getDefaultPath');
        setDefaultPath(path);
        setSelectedPath(path);
      } catch (error) {
        console.error('Failed to get default path:', error);
        setError('Failed to load default workspace location');
      }
    };

    loadDefaultPath();
  }, []);

  const handleNext = () => {
    setError(null);

    switch (step) {
      case 'welcome':
        setStep('location');
        break;
      case 'location':
        setStep('git');
        break;
      case 'git':
        createWorkspace();
        break;
    }
  };

  const handleBack = () => {
    setError(null);

    switch (step) {
      case 'location':
        setStep('welcome');
        break;
      case 'git':
        setStep('location');
        break;
    }
  };

  const createWorkspace = async () => {
    setStep('creating');
    setIsCreating(true);
    setError(null);

    try {
      // Initialize workspace
      const initResult = await window.electron.invoke('workspace:initialize', {
        path: selectedPath,
        initializeGit: gitEnabled,
        createInitialCommit: gitEnabled,
      });

      if (!initResult.success) {
        throw new Error(initResult.error || 'Failed to initialize workspace');
      }

      // Load configuration
      const config = await window.electron.invoke('workspace:getConfig');

      if (config) {
        setConfig(config);
        setIsFirstRun(false);
        setValidationState(WorkspaceValidationState.VALID);
      }

      setStep('complete');
    } catch (error) {
      console.error('Failed to create workspace:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setStep('git'); // Go back to last step before creation
    } finally {
      setIsCreating(false);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      // If no cancel handler, just close (user can exit app)
      window.close();
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 'welcome':
        return true;
      case 'location':
        return selectedPath.length > 0;
      case 'git':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">BQ-Studio Workspace Setup</h2>
          <p className="text-blue-100 text-sm mt-1">
            {step === 'welcome' && 'Welcome to BQ-Studio'}
            {step === 'location' && 'Step 1 of 2: Choose Workspace Location'}
            {step === 'git' && 'Step 2 of 2: Optional Git Setup'}
            {step === 'creating' && 'Creating Your Workspace...'}
            {step === 'complete' && 'Setup Complete!'}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 min-h-[300px]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">Error</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          )}

          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Welcome to BQ-Studio
                </h3>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400">
                  BQ-Studio needs a <strong>workspace</strong> to store your creative work. Your
                  workspace will contain:
                </p>

                <ul className="space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Series planning documents</strong> - outlines, character profiles,
                      world-building
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Custom genre packs</strong> - personalized writing templates
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Exports</strong> - DOCX and PDF versions of your work
                    </span>
                  </li>
                </ul>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Your workspace is separate from BQ-Studio code</strong>
                    <br />
                    This means you can update BQ-Studio without affecting your work, and you can
                    back up your workspace independently.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location Step */}
          {step === 'location' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Choose where to create your BQ-Studio workspace. The default location is
                recommended for most users.
              </p>

              <PathSelector
                defaultPath={defaultPath}
                selectedPath={selectedPath}
                onPathChange={setSelectedPath}
                disabled={isCreating}
              />

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Note:</strong> Choose a location that's easy to find and back up. Avoid
                  cloud-synced folders (Dropbox, OneDrive) if you plan to use Git.
                </p>
              </div>
            </div>
          )}

          {/* Git Step */}
          {step === 'git' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Optionally initialize your workspace as a Git repository for version control and
                cloud backup.
              </p>

              <GitInitOption
                enabled={gitEnabled}
                onChange={setGitEnabled}
                disabled={isCreating}
              />

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Workspace Location:</strong>
                  <br />
                  <code className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded mt-1 inline-block">
                    {selectedPath}
                  </code>
                </p>
              </div>
            </div>
          )}

          {/* Creating Step */}
          {step === 'creating' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Creating your workspace...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                This will only take a moment
              </p>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Workspace Created Successfully!
                </h3>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400">
                  Your BQ-Studio workspace has been created at:
                </p>

                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md p-4 my-4">
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {selectedPath}
                  </code>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>What's next?</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    <li>Start creating your first series planning document</li>
                    <li>Explore the included genre packs</li>
                    {gitEnabled && (
                      <li>Connect your workspace to a private GitHub/GitLab repository</li>
                    )}
                    <li>Customize templates to match your writing style</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
          <div>
            {step !== 'welcome' && step !== 'creating' && step !== 'complete' && (
              <button
                onClick={handleBack}
                disabled={isCreating}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {step !== 'complete' && step !== 'creating' && onCancel && (
              <button
                onClick={handleCancelClick}
                disabled={isCreating}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                Cancel
              </button>
            )}

            {step === 'complete' ? (
              <button
                onClick={handleFinish}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
              >
                Get Started
              </button>
            ) : (
              step !== 'creating' && (
                <button
                  onClick={handleNext}
                  disabled={!canGoNext() || isCreating}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
                >
                  {step === 'git' ? 'Create Workspace' : 'Next'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
