/**
 * Git Init Option Component
 * Checkbox for optional Git initialization
 */

import React from 'react';

interface GitInitOptionProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export const GitInitOption: React.FC<GitInitOptionProps> = ({
  enabled,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="git-init"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div className="flex-1">
          <label
            htmlFor="git-init"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Initialize Git repository (for version control)
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Git lets you track changes and sync across devices. You'll manage commits manually via
            the UI.
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-7 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="text-xs text-blue-800 dark:text-blue-300 space-y-2">
            <p className="font-medium">What is Git?</p>
            <p>
              Git is a version control system that creates "save points" for your work. Think of
              it like:
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>
                <strong>Save points</strong>: Commit your work at any time to create a snapshot
              </li>
              <li>
                <strong>Cloud backup</strong>: Push to GitHub/GitLab for remote storage
              </li>
              <li>
                <strong>Multi-device</strong>: Work on different computers and sync your progress
              </li>
            </ul>
            <p className="pt-1">
              <strong>Note:</strong> All Git operations are done through the BQ-Studio UI. No
              command line needed!
            </p>
          </div>
        </div>
      )}

      {!enabled && (
        <div className="ml-7 text-xs text-gray-500 dark:text-gray-400">
          You can enable Git later in Settings if you change your mind.
        </div>
      )}
    </div>
  );
};
