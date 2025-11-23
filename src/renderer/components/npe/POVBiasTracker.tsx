import React, { useState } from 'react';
import { usePOVBiasStore } from '../../stores/povBiasStore';
import type { ScenePOVState, BiasLevel } from './types';

interface POVBiasTrackerProps {
  onSceneClick?: (sceneId: string) => void;
}

export const POVBiasTracker: React.FC<POVBiasTrackerProps> = ({ onSceneClick }) => {
  const { povBiasData, isLoading } = usePOVBiasStore();
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading POV bias data...</div>
      </div>
    );
  }

  if (!povBiasData || povBiasData.scenes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No POV bias data available</div>
      </div>
    );
  }

  const getBiasLevelColor = (level: BiasLevel): string => {
    switch (level) {
      case 'objective':
        return 'bg-green-500';
      case 'mildly-biased':
        return 'bg-yellow-500';
      case 'strongly-biased':
        return 'bg-orange-500';
      case 'unreliable':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBiasLevelLabel = (level: BiasLevel): string => {
    switch (level) {
      case 'objective':
        return 'Objective';
      case 'mildly-biased':
        return 'Mildly Biased';
      case 'strongly-biased':
        return 'Strongly Biased';
      case 'unreliable':
        return 'Unreliable';
      default:
        return level;
    }
  };

  const getMisreadingSeverityColor = (severity: 'minor' | 'moderate' | 'critical'): string => {
    switch (severity) {
      case 'minor':
        return 'text-blue-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSubjectivityColor = (score: number): string => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-blue-400';
    return 'text-green-400';
  };

  const handleSceneToggle = (sceneId: string) => {
    setExpandedSceneId(expandedSceneId === sceneId ? null : sceneId);
    onSceneClick?.(sceneId);
  };

  const renderScene = (scene: ScenePOVState) => {
    const isExpanded = expandedSceneId === scene.sceneId;

    return (
      <div
        key={scene.sceneId}
        className="bg-gray-800 rounded-lg overflow-hidden mb-3 transition-all"
      >
        {/* Scene Header - Always Visible */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-750 transition-colors"
          onClick={() => handleSceneToggle(scene.sceneId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-semibold">{scene.sceneTitle}</h3>
                <span className="text-sm text-gray-400">POV: {scene.povCharacter}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`px-2 py-1 rounded text-xs font-medium text-white ${getBiasLevelColor(
                    scene.biasLevel
                  )}`}
                >
                  {getBiasLevelLabel(scene.biasLevel)}
                </div>
                {scene.isSubjective && (
                  <span className="px-2 py-1 rounded text-xs font-medium text-white bg-purple-500">
                    Subjective
                  </span>
                )}
                {scene.misreadings.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {scene.misreadings.length} misreading
                    {scene.misreadings.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="text-gray-400">
              {isExpanded ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-700">
            {/* Misreadings */}
            {scene.misreadings.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  POV Misreadings:
                </h4>
                <div className="space-y-2">
                  {scene.misreadings.map((misreading, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900 rounded p-3 border-l-4 border-orange-500"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-xs text-gray-400">Event:</div>
                        <span
                          className={`text-xs font-medium ${getMisreadingSeverityColor(
                            misreading.severity
                          )}`}
                        >
                          {misreading.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 mb-2">{misreading.event}</div>

                      <div className="text-xs text-gray-400 mb-1">POV Interpretation:</div>
                      <div className="text-sm text-yellow-300 italic mb-2">
                        "{misreading.povInterpretation}"
                      </div>

                      {misreading.actualReality && (
                        <>
                          <div className="text-xs text-gray-400 mb-1">Actual Reality:</div>
                          <div className="text-sm text-green-300">
                            {misreading.actualReality}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selective Attention */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Selective Attention:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Noticed */}
                <div className="bg-gray-900 rounded p-3">
                  <div className="text-xs text-green-400 font-medium mb-2">
                    What POV Noticed:
                  </div>
                  <ul className="space-y-1">
                    {scene.selectiveAttention.noticed.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ignored */}
                <div className="bg-gray-900 rounded p-3">
                  <div className="text-xs text-red-400 font-medium mb-2">
                    What POV Ignored:
                  </div>
                  <ul className="space-y-1">
                    {scene.selectiveAttention.ignored.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-red-400 mt-1">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Significance */}
              <div className="mt-2 p-2 bg-blue-900 bg-opacity-20 rounded border border-blue-700">
                <div className="text-xs text-blue-400 font-medium mb-1">
                  Significance:
                </div>
                <div className="text-sm text-gray-300">
                  {scene.selectiveAttention.significance}
                </div>
              </div>
            </div>

            {/* Operating System Reveals */}
            {scene.operatingSystemReveals.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Operating System Reveals:
                </h4>
                <div className="space-y-2">
                  {scene.operatingSystemReveals.map((reveal, idx) => (
                    <div key={idx} className="bg-gray-900 rounded p-3 border-l-4 border-purple-500">
                      <div className="text-xs text-purple-400 font-medium mb-1">
                        Worldview Element:
                      </div>
                      <div className="text-sm text-white mb-2 font-semibold">
                        "{reveal.worldviewElement}"
                      </div>

                      <div className="text-xs text-gray-400 mb-1">
                        How It Shapes Perception:
                      </div>
                      <div className="text-sm text-gray-300 mb-2">
                        {reveal.howItShapesPerception}
                      </div>

                      <div className="text-xs text-gray-400 mb-1">Example:</div>
                      <div className="text-sm text-gray-300 italic">{reveal.example}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Notes */}
            {scene.validationNotes && (
              <div className="p-3 bg-gray-900 rounded border border-gray-700">
                <div className="text-xs text-gray-400 font-medium mb-1">
                  Validation Notes:
                </div>
                <div className="text-sm text-gray-300">{scene.validationNotes}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">POV Bias Tracker</h2>
        {povBiasData.context && (
          <p className="text-sm text-gray-400">
            {povBiasData.context.bookTitle}
            {povBiasData.context.chapterTitle && `, ${povBiasData.context.chapterTitle}`}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Validate POV subjectivity and bias per scene
        </p>
      </div>

      {/* Overall Metrics */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-400">Overall Subjectivity:</span>
            <span
              className={`text-2xl font-bold ${getSubjectivityColor(
                povBiasData.overallSubjectivity
              )}`}
            >
              {povBiasData.overallSubjectivity}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2.5 rounded-full"
              style={{ width: `${povBiasData.overallSubjectivity}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white mb-1">
            {povBiasData.totalMisreadings}
          </div>
          <div className="text-xs text-gray-400">Total Misreadings</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-red-400">
              {povBiasData.criticalMisreadings}
            </span>
            <span className="text-xs text-red-400">Critical</span>
          </div>
          <div className="text-xs text-gray-400">Requires Attention</div>
        </div>
      </div>

      {/* Scene List */}
      <div className="mb-6">
        <div className="border-t border-b border-gray-700 py-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Scene-by-Scene Analysis ({povBiasData.scenes.length} scenes)
          </h3>
        </div>
        <div className="space-y-2">{povBiasData.scenes.map((scene) => renderScene(scene))}</div>
      </div>

      {/* Legend */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Bias Level Guide
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['objective', 'mildly-biased', 'strongly-biased', 'unreliable'] as BiasLevel[]).map(
            (level) => (
              <div key={level} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getBiasLevelColor(level)}`} />
                <span className="text-xs text-gray-300">{getBiasLevelLabel(level)}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {povBiasData.lastUpdated.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          Click on scenes to expand details. Data will connect to MCP in Phase 4.
        </p>
      </div>
    </div>
  );
};
