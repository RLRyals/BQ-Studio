import React, { useState } from 'react';
import { useCharacterStateStore } from '../../stores/characterStateStore';
import type { CharacterTimeline, CharacterVersion, BehavioralPalette, ContextState } from './types';

interface CharacterStateTrackerProps {
  onVersionClick?: (characterId: string, version: string) => void;
}

export const CharacterStateTracker: React.FC<CharacterStateTrackerProps> = ({
  onVersionClick,
}) => {
  const { characterStateData, isLoading } = useCharacterStateStore();
  const [selectedVersion, setSelectedVersion] = useState<{
    characterId: string;
    version: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading character state data...</div>
      </div>
    );
  }

  if (!characterStateData || characterStateData.timelines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No character state data available</div>
      </div>
    );
  }

  const getContextStateColor = (state: ContextState): string => {
    switch (state) {
      case 'baseline':
        return 'bg-green-500';
      case 'mild-stress':
        return 'bg-yellow-500';
      case 'moderate-stress':
        return 'bg-orange-500';
      case 'extreme-stress':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getContextStateLabel = (state: ContextState): string => {
    switch (state) {
      case 'baseline':
        return 'Baseline';
      case 'mild-stress':
        return 'Mild Stress';
      case 'moderate-stress':
        return 'Moderate Stress';
      case 'extreme-stress':
        return 'Extreme Stress';
      default:
        return state;
    }
  };

  const getBehaviorEmoji = (behavior: BehavioralPalette): string => {
    const emojiMap: Record<BehavioralPalette, string> = {
      anxiety: '😰',
      attraction: '💖',
      anger: '😡',
      fear: '😨',
      shame: '😔',
      joy: '😊',
      grief: '😢',
      contempt: '😤',
      curiosity: '🤔',
    };
    return emojiMap[behavior] || '●';
  };

  const getBehaviorColor = (behavior: BehavioralPalette): string => {
    const colorMap: Record<BehavioralPalette, string> = {
      anxiety: 'text-yellow-400',
      attraction: 'text-pink-400',
      anger: 'text-red-400',
      fear: 'text-purple-400',
      shame: 'text-gray-400',
      joy: 'text-green-400',
      grief: 'text-blue-400',
      contempt: 'text-orange-400',
      curiosity: 'text-cyan-400',
    };
    return colorMap[behavior] || 'text-gray-400';
  };

  const handleVersionClick = (characterId: string, version: string) => {
    setSelectedVersion({ characterId, version });
    onVersionClick?.(characterId, version);
  };

  const renderTimeline = (timeline: CharacterTimeline) => {
    const width = 800;
    const height = 120;
    const padding = { left: 60, right: 60, top: 20, bottom: 20 };
    const timelineWidth = width - padding.left - padding.right;

    return (
      <div key={timeline.characterId} className="mb-8">
        {/* Character Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: timeline.color }}
          />
          <h3 className="text-lg font-semibold text-white">{timeline.characterName}</h3>
        </div>

        {/* Timeline SVG */}
        <svg width={width} height={height} className="mb-4">
          {/* Timeline base line */}
          <line
            x1={padding.left}
            y1={height / 2}
            x2={width - padding.right}
            y2={height / 2}
            stroke="#4b5563"
            strokeWidth="3"
          />

          {/* Version markers */}
          {timeline.versions.map((version) => {
            const x = padding.left + (version.storyPosition / 100) * timelineWidth;
            const isSelected =
              selectedVersion?.characterId === timeline.characterId &&
              selectedVersion?.version === version.version;

            return (
              <g
                key={version.version}
                onClick={() => handleVersionClick(timeline.characterId, version.version)}
                className="cursor-pointer"
              >
                {/* Vertical line */}
                <line
                  x1={x}
                  y1={height / 2 - 30}
                  x2={x}
                  y2={height / 2 + 30}
                  stroke={timeline.color}
                  strokeWidth={isSelected ? 3 : 2}
                  opacity={isSelected ? 1 : 0.7}
                />

                {/* Version circle */}
                <circle
                  cx={x}
                  cy={height / 2}
                  r={isSelected ? 12 : 10}
                  fill={timeline.color}
                  stroke="#1f2937"
                  strokeWidth="2"
                />

                {/* Version label */}
                <text
                  x={x}
                  y={height / 2 - 40}
                  textAnchor="middle"
                  fill="#f9fafb"
                  fontSize="14"
                  fontWeight="600"
                >
                  {version.version}
                </text>

                {/* Position label */}
                <text
                  x={x}
                  y={height / 2 + 45}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="11"
                >
                  {version.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Version Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {timeline.versions.map((version) => {
            const isSelected =
              selectedVersion?.characterId === timeline.characterId &&
              selectedVersion?.version === version.version;

            return (
              <div
                key={version.version}
                className={`bg-gray-800 rounded-lg p-3 transition-all ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleVersionClick(timeline.characterId, version.version)}
              >
                {/* Version Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{version.version}</span>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium text-white ${getContextStateColor(
                      version.contextState
                    )}`}
                  >
                    {getContextStateLabel(version.contextState)}
                  </div>
                </div>

                {/* Active Behaviors */}
                <div className="mb-2">
                  <div className="text-xs text-gray-400 mb-1">Active Behaviors:</div>
                  <div className="flex flex-wrap gap-1">
                    {version.activeBehaviors.map((behavior) => (
                      <span
                        key={behavior}
                        className={`text-lg ${getBehaviorColor(behavior)}`}
                        title={behavior}
                      >
                        {getBehaviorEmoji(behavior)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Wounds */}
                <div className="mb-2">
                  <div className="text-xs text-gray-400 mb-1">Wounds:</div>
                  {version.wounds.map((wound, idx) => (
                    <div key={idx} className="mb-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{wound.woundName}</span>
                        <span className="text-gray-500">{wound.healingProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-0.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            wound.active ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${wound.healingProgress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Transition Trigger */}
                {version.transitionTrigger && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Trigger:</div>
                    <div className="text-xs text-gray-300 italic">
                      {version.transitionTrigger}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Character State Tracker</h2>
        {characterStateData.context && (
          <p className="text-sm text-gray-400">{characterStateData.context.bookTitle}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Track character progression through story versions (V1-V4)
        </p>
      </div>

      {/* Timelines */}
      <div className="space-y-6">
        {characterStateData.timelines.map((timeline) => renderTimeline(timeline))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Behavioral Palette Legend
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {[
            'anxiety',
            'attraction',
            'anger',
            'fear',
            'shame',
            'joy',
            'grief',
            'contempt',
            'curiosity',
          ].map((behavior) => (
            <div key={behavior} className="flex items-center gap-2">
              <span className={`text-lg ${getBehaviorColor(behavior as BehavioralPalette)}`}>
                {getBehaviorEmoji(behavior as BehavioralPalette)}
              </span>
              <span className="text-xs text-gray-400 capitalize">{behavior}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {characterStateData.lastUpdated.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          Click on version markers to view details. Data will connect to MCP in Phase 4.
        </p>
      </div>
    </div>
  );
};
