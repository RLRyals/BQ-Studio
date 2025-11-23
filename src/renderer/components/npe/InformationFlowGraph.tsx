import React from 'react';
import { useNPEInformationFlowStore } from '../../stores/npeInformationFlowStore';
import type { ImpactLevel } from './types';

export const InformationFlowGraph: React.FC = () => {
  const { informationFlowData, isLoading } = useNPEInformationFlowStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading information flow data...</div>
      </div>
    );
  }

  if (!informationFlowData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No information flow data available</div>
      </div>
    );
  }

  const getImpactColor = (level: ImpactLevel): string => {
    switch (level) {
      case 'critical':
        return '#ef4444'; // red-500
      case 'high':
        return '#f97316'; // orange-500
      case 'medium':
        return '#fbbf24'; // amber-400
      case 'low':
        return '#60a5fa'; // blue-400
      case 'none':
        return '#6b7280'; // gray-500
      default:
        return '#9ca3af'; // gray-400
    }
  };

  const getImpactSize = (level: ImpactLevel): number => {
    switch (level) {
      case 'critical':
        return 16;
      case 'high':
        return 12;
      case 'medium':
        return 10;
      case 'low':
        return 8;
      case 'none':
        return 6;
      default:
        return 8;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'minor':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Timeline dimensions
  const timelineWidth = 900;
  const timelineHeight = 200;
  const padding = { top: 40, right: 40, bottom: 40, left: 40 };
  const graphWidth = timelineWidth - padding.left - padding.right;
  const graphHeight = timelineHeight - padding.top - padding.bottom;

  // Position calculations
  const xScale = (timestamp: number) => padding.left + (timestamp / 100) * graphWidth;
  const yCenter = padding.top + graphHeight / 2;

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Information Flow Graph</h2>
        {informationFlowData.context && (
          <p className="text-sm text-gray-400">
            {informationFlowData.context.bookTitle}
            {informationFlowData.context.chapterTitle &&
              `, ${informationFlowData.context.chapterTitle}`}
          </p>
        )}
      </div>

      {/* Information Timeline */}
      <div className="mb-8">
        <div className="border-t border-b border-gray-700 py-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Information Timeline
          </h3>
        </div>
        <svg width={timelineWidth} height={timelineHeight} className="bg-gray-800 rounded-lg">
          {/* Timeline base */}
          <line
            x1={padding.left}
            y1={yCenter}
            x2={timelineWidth - padding.right}
            y2={yCenter}
            stroke="#4b5563"
            strokeWidth="3"
          />

          {/* Timeline markers */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <g key={`marker-${percent}`}>
              <line
                x1={xScale(percent)}
                y1={yCenter - 10}
                x2={xScale(percent)}
                y2={yCenter + 10}
                stroke="#6b7280"
                strokeWidth="2"
              />
              <text
                x={xScale(percent)}
                y={yCenter + 30}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="11"
                fontWeight="500"
              >
                {percent}%
              </text>
            </g>
          ))}

          {/* Reveals */}
          {informationFlowData.reveals.map((reveal, index) => {
            const x = xScale(reveal.timestamp);
            const y = index % 2 === 0 ? yCenter - 40 : yCenter + 40;
            const size = getImpactSize(reveal.impactLevel);

            return (
              <g key={reveal.id}>
                {/* Connection line */}
                <line
                  x1={x}
                  y1={yCenter}
                  x2={x}
                  y2={y}
                  stroke={getImpactColor(reveal.impactLevel)}
                  strokeWidth="2"
                  strokeDasharray={reveal.changedBehavior ? '0' : '4 4'}
                />

                {/* Impact marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill={getImpactColor(reveal.impactLevel)}
                  stroke="#1f2937"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:opacity-80"
                >
                  <title>
                    Scene {reveal.sceneNumber}: {reveal.information}
                    {'\n'}Impact: {reveal.impactLevel}
                    {'\n'}Changed behavior: {reveal.changedBehavior ? 'Yes' : 'No'}
                    {'\n'}Affected: {reveal.affectedCharacters.join(', ')}
                  </title>
                </circle>

                {/* Scene number label */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {reveal.sceneNumber}
                </text>
              </g>
            );
          })}

          {/* Start/End labels */}
          <text
            x={padding.left}
            y={padding.top - 10}
            textAnchor="start"
            fill="#d1d5db"
            fontSize="12"
            fontWeight="500"
          >
            Story Start
          </text>
          <text
            x={timelineWidth - padding.right}
            y={padding.top - 10}
            textAnchor="end"
            fill="#d1d5db"
            fontSize="12"
            fontWeight="500"
          >
            Story End
          </text>
        </svg>

        {/* Timeline Legend */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Impact Level</h4>
            <div className="space-y-1">
              {['critical', 'high', 'medium', 'low', 'none'].map((level) => (
                <div key={level} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getImpactColor(level as ImpactLevel) }}
                  />
                  <span className="text-xs text-gray-400 capitalize">{level}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">
              Behavior Impact
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-500" />
                <span className="text-xs text-gray-400">Changed behavior</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-500" style={{ strokeDasharray: '4 4' }} />
                <span className="text-xs text-gray-400">No behavior change</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reveals Detail List */}
      <div className="mb-8">
        <div className="border-t border-b border-gray-700 py-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Information Reveals
          </h3>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {informationFlowData.reveals.map((reveal) => (
            <div
              key={reveal.id}
              className="p-4 bg-gray-800 rounded-lg border-l-4"
              style={{ borderLeftColor: getImpactColor(reveal.impactLevel) }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">Scene {reveal.sceneNumber}</span>
                  <span className="text-xs text-gray-500">@ {reveal.timestamp}%</span>
                  <span
                    className="text-xs font-semibold uppercase px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: getImpactColor(reveal.impactLevel),
                      color: 'white',
                    }}
                  >
                    {reveal.impactLevel}
                  </span>
                </div>
                {reveal.changedBehavior && (
                  <span className="text-xs text-green-400 font-medium">
                    Changed Behavior
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-300 mb-2">{reveal.information}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Affected:</span>
                <span className="text-gray-400">{reveal.affectedCharacters.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Character Knowledge State */}
      <div className="mb-8">
        <div className="border-t border-b border-gray-700 py-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Character Knowledge State
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {informationFlowData.characterKnowledge.map((character) => (
            <div key={character.characterName} className="p-4 bg-gray-800 rounded-lg">
              <h4 className="text-white font-semibold mb-3">{character.characterName}</h4>

              <div className="mb-3">
                <h5 className="text-xs text-green-400 font-medium mb-2 uppercase">Knows</h5>
                <ul className="space-y-1">
                  {character.knownInformation.map((info, index) => (
                    <li key={index} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{info}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {character.unknownCriticalInfo.length > 0 && (
                <div>
                  <h5 className="text-xs text-red-400 font-medium mb-2 uppercase">
                    Missing Critical Info
                  </h5>
                  <ul className="space-y-1">
                    {character.unknownCriticalInfo.map((info, index) => (
                      <li key={index} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">✗</span>
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Issues Section */}
      {informationFlowData.issues.length > 0 && (
        <div className="mb-6">
          <div className="border-t border-b border-gray-700 py-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Information Economy Issues
            </h3>
          </div>
          {informationFlowData.issues.map((issue) => {
            const reveal = informationFlowData.reveals.find((r) => r.id === issue.revealId);

            return (
              <div
                key={issue.id}
                className="mb-3 p-4 bg-gray-800 rounded-lg border-l-4"
                style={{
                  borderLeftColor:
                    issue.severity === 'critical'
                      ? '#ef4444'
                      : issue.severity === 'warning'
                        ? '#fbbf24'
                        : '#60a5fa',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${getSeverityColor(issue.severity)}`}>
                      {issue.type.toUpperCase().replace(/-/g, ' ')}
                    </span>
                    {reveal && (
                      <span className="text-xs text-gray-500">Scene {reveal.sceneNumber}</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-2">{issue.description}</p>
                {reveal && (
                  <p className="text-xs text-gray-500 italic">
                    Reveal: "{reveal.information}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6">
        <div className="border-t border-b border-gray-700 py-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Statistics
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">
              {informationFlowData.reveals.length}
            </div>
            <div className="text-xs text-gray-400">Total Reveals</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">
              {informationFlowData.reveals.filter((r) => r.changedBehavior).length}
            </div>
            <div className="text-xs text-gray-400">Impactful Reveals</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">
              {informationFlowData.reveals.filter((r) => r.impactLevel === 'critical').length}
            </div>
            <div className="text-xs text-gray-400">Critical Info</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">
              {informationFlowData.issues.length}
            </div>
            <div className="text-xs text-gray-400">Issues Found</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {informationFlowData.lastUpdated.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
