/**
 * Path Selector Component
 * Allows user to select workspace folder location
 */

import React, { useState } from 'react';

interface PathSelectorProps {
  defaultPath: string;
  selectedPath: string;
  onPathChange: (path: string) => void;
  disabled?: boolean;
}

export const PathSelector: React.FC<PathSelectorProps> = ({
  defaultPath,
  selectedPath,
  onPathChange,
  disabled = false,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleBrowse = async () => {
    setIsSelecting(true);
    try {
      const path = await window.electron.invoke('workspace:selectFolder');
      if (path) {
        onPathChange(path);
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleUseDefault = () => {
    onPathChange(defaultPath);
  };

  const isDefaultPath = selectedPath === defaultPath;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Workspace Location
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={selectedPath}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
            disabled={disabled}
          />
          <button
            onClick={handleBrowse}
            disabled={disabled || isSelecting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
          >
            {isSelecting ? 'Selecting...' : 'Browse...'}
          </button>
        </div>
      </div>

      {!isDefaultPath && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleUseDefault}
            disabled={disabled}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:text-gray-400"
          >
            Use default location
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({defaultPath})
          </span>
        </div>
      )}

      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p>Your workspace will contain:</p>
        <ul className="list-disc list-inside ml-2 space-y-0.5">
          <li>Series planning documents</li>
          <li>Character profiles and voice guides</li>
          <li>Custom genre packs</li>
          <li>Templates and exports</li>
        </ul>
      </div>
    </div>
  );
};
