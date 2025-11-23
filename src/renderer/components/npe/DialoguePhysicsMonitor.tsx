import React from 'react';
import { useDialoguePhysicsStore } from '../../stores/dialoguePhysicsStore';
import type { DialogueLine, DialogueViolationType } from './types';

interface DialoguePhysicsMonitorProps {
  onLineClick?: (lineId: string) => void;
}

export const DialoguePhysicsMonitor: React.FC<DialoguePhysicsMonitorProps> = ({
  onLineClick,
}) => {
  const { dialogueData, isLoading } = useDialoguePhysicsStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dialogue analysis...</div>
      </div>
    );
  }

  if (!dialogueData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No dialogue data available</div>
      </div>
    );
  }

  const getViolationColor = (violations: DialogueViolationType[]): string => {
    if (violations.length === 0) return 'border-green-500';
    if (violations.includes('echolalia')) return 'border-red-500';
    if (violations.includes('cross-purpose')) return 'border-yellow-500';
    return 'border-blue-400';
  };

  const getViolationBadge = (violationType: DialogueViolationType): React.ReactNode => {
    const badges = {
      'echolalia': (
        <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/50">
          Echolalia
        </span>
      ),
      'no-subtext': (
        <span className="px-2 py-0.5 text-xs rounded bg-blue-400/20 text-blue-400 border border-blue-400/50">
          No Subtext
        </span>
      ),
      'cross-purpose': (
        <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
          Cross-Purpose
        </span>
      ),
    };
    return badges[violationType];
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderDialogueLine = (line: DialogueLine) => {
    const borderColor = getViolationColor(line.violations);
    const hasViolations = line.violations.length > 0;

    return (
      <div
        key={line.id}
        className={`mb-3 p-3 bg-gray-800 rounded-lg border-l-4 ${borderColor} ${
          onLineClick ? 'cursor-pointer hover:bg-gray-750 transition-colors' : ''
        }`}
        onClick={() => onLineClick?.(line.id)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">#{line.lineNumber}</span>
            <span className="text-sm font-semibold text-gray-300">{line.character}:</span>
            {line.hasSubtext && !hasViolations && (
              <span className="text-xs text-green-400">✓ Subtext</span>
            )}
          </div>
          <div className="flex gap-1 flex-wrap">
            {line.violations.map((violation) => (
              <React.Fragment key={violation}>
                {getViolationBadge(violation)}
              </React.Fragment>
            ))}
          </div>
        </div>

        <p className="text-gray-200 text-sm mb-2 italic">"{line.text}"</p>

        {line.subtextSuggestion && (
          <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Suggestion:</div>
            <div className="text-xs text-gray-300">{line.subtextSuggestion}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Dialogue Physics Monitor
        </h2>
        <p className="text-sm text-gray-400">
          Scene: {dialogueData.sceneTitle}
        </p>
      </div>

      {/* Overall Score */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border-2 border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-300">
            Dialogue Health Score:
          </span>
          <span className={`text-3xl font-bold ${getScoreColor(dialogueData.overallScore)}`}>
            {dialogueData.overallScore}%
          </span>
        </div>
      </div>

      {/* Violation Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 border border-red-500/30">
          <div className="text-2xl font-bold text-red-400">
            {dialogueData.echolaliaCount}
          </div>
          <div className="text-xs text-gray-400">Echolalia</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-blue-400/30">
          <div className="text-2xl font-bold text-blue-400">
            {dialogueData.noSubtextCount}
          </div>
          <div className="text-xs text-gray-400">No Subtext</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-yellow-500/30">
          <div className="text-2xl font-bold text-yellow-400">
            {dialogueData.crossPurposeCount}
          </div>
          <div className="text-xs text-gray-400">Cross-Purpose</div>
        </div>
      </div>

      {/* Line-by-line validation */}
      <div className="mb-4">
        <div className="border-t border-b border-gray-700 py-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Line-by-Line Analysis
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto pr-2">
          {dialogueData.lines.map((line) => renderDialogueLine(line))}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Violation Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Echolalia: Character mirrors previous line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>No Subtext: Dialogue lacks hidden meaning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Cross-Purpose: Characters want different things</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {dialogueData.lastUpdated.toLocaleString()}
        </p>
        {onLineClick && (
          <p className="text-xs text-gray-500 text-center mt-1">
            Click on any line to see detailed analysis
          </p>
        )}
      </div>
    </div>
  );
};
