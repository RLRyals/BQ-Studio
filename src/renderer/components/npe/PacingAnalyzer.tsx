import React from 'react';
import { useNPEPacingStore } from '../../stores/npePacingStore';
import type { ScenePacing, SceneType, TimeTreatment } from './types';

export const PacingAnalyzer: React.FC = () => {
  const { pacingData, isLoading } = useNPEPacingStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading pacing analysis...</div>
      </div>
    );
  }

  if (!pacingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No pacing data available</div>
      </div>
    );
  }

  const getSceneTypeColor = (type: SceneType): string => {
    switch (type) {
      case 'micro':
        return '#60a5fa'; // blue-400
      case 'medium':
        return '#fbbf24'; // amber-400
      case 'centerpiece':
        return '#f87171'; // red-400
      default:
        return '#9ca3af'; // gray-400
    }
  };

  const getTimeTreatmentColor = (treatment: TimeTreatment): string => {
    switch (treatment) {
      case 'expand':
        return '#10b981'; // green-500
      case 'compress':
        return '#ef4444'; // red-500
      case 'neutral':
        return '#6b7280'; // gray-500
      default:
        return '#9ca3af'; // gray-400
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

  // SVG dimensions for charts
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 40, bottom: 60, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Scene length chart calculations
  const maxWordCount = Math.max(...pacingData.scenes.map((s) => s.wordCount));
  const sceneWidth = graphWidth / pacingData.scenes.length;

  // Energy modulation chart calculations
  const xScale = (sceneNumber: number) =>
    padding.left + ((sceneNumber - 1) / (pacingData.scenes.length - 1)) * graphWidth;
  const yScale = (value: number) => padding.top + graphHeight - (value / 100) * graphHeight;

  const generatePath = (dataKey: 'tension' | 'volume' | 'conflict'): string => {
    const points = pacingData.energyModulation.map((point) => ({
      x: xScale(point.sceneNumber),
      y: yScale(point[dataKey]),
    }));

    if (points.length === 0) return '';

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    return path;
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Pacing Analyzer</h2>
        {pacingData.context && (
          <p className="text-sm text-gray-400">
            {pacingData.context.bookTitle}
            {pacingData.context.chapterTitle && `, ${pacingData.context.chapterTitle}`}
          </p>
        )}
      </div>

      {/* Scene Length Chart */}
      <div className="mb-8">
        <div className="border-t border-b border-gray-700 py-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Scene Length Distribution
          </h3>
        </div>
        <svg width={chartWidth} height={chartHeight} className="bg-gray-800 rounded-lg">
          {/* Grid lines */}
          <g className="grid">
            {[0, 25, 50, 75, 100].map((percent) => (
              <line
                key={`grid-h-${percent}`}
                x1={padding.left}
                y1={padding.top + (graphHeight * (100 - percent)) / 100}
                x2={chartWidth - padding.right}
                y2={padding.top + (graphHeight * (100 - percent)) / 100}
                stroke="#374151"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* Y-axis label */}
          <text
            x={15}
            y={padding.top + graphHeight / 2}
            textAnchor="middle"
            fill="#d1d5db"
            fontSize="12"
            fontWeight="500"
            transform={`rotate(-90, 15, ${padding.top + graphHeight / 2})`}
          >
            Word Count
          </text>

          {/* Bars */}
          {pacingData.scenes.map((scene, index) => {
            const barHeight = (scene.wordCount / maxWordCount) * graphHeight;
            const x = padding.left + index * sceneWidth;
            const y = chartHeight - padding.bottom - barHeight;

            return (
              <g key={scene.sceneId}>
                <rect
                  x={x + sceneWidth * 0.1}
                  y={y}
                  width={sceneWidth * 0.8}
                  height={barHeight}
                  fill={getSceneTypeColor(scene.type)}
                  opacity={0.8}
                  className="transition-opacity hover:opacity-100"
                />
                <text
                  x={x + sceneWidth / 2}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="10"
                >
                  {scene.sceneNumber}
                </text>
                <text
                  x={x + sceneWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fill="#d1d5db"
                  fontSize="10"
                >
                  {scene.wordCount}
                </text>
              </g>
            );
          })}

          {/* X-axis label */}
          <text
            x={padding.left + graphWidth / 2}
            y={chartHeight - 10}
            textAnchor="middle"
            fill="#d1d5db"
            fontSize="12"
            fontWeight="500"
          >
            Scene Number
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#60a5fa' }} />
            <span className="text-xs text-gray-400">Micro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }} />
            <span className="text-xs text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f87171' }} />
            <span className="text-xs text-gray-400">Centerpiece</span>
          </div>
        </div>
      </div>

      {/* Time Treatment Heatmap */}
      <div className="mb-8">
        <div className="border-t border-b border-gray-700 py-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Time Treatment Pattern
          </h3>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {pacingData.scenes.map((scene) => (
            <div
              key={scene.sceneId}
              className="aspect-square rounded flex flex-col items-center justify-center p-2"
              style={{ backgroundColor: getTimeTreatmentColor(scene.timeTreatment) }}
            >
              <span className="text-white font-bold text-sm">{scene.sceneNumber}</span>
              <span className="text-white text-xs opacity-80 capitalize">
                {scene.timeTreatment}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
            <span className="text-xs text-gray-400">Expand</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }} />
            <span className="text-xs text-gray-400">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-xs text-gray-400">Compress</span>
          </div>
        </div>
      </div>

      {/* Energy Modulation Graph */}
      <div className="mb-8">
        <div className="border-t border-b border-gray-700 py-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Energy Modulation
          </h3>
        </div>
        <svg width={chartWidth} height={chartHeight} className="bg-gray-800 rounded-lg">
          {/* Grid lines */}
          <g className="grid">
            {[0, 25, 50, 75, 100].map((percent) => (
              <line
                key={`grid-energy-${percent}`}
                x1={padding.left}
                y1={yScale(percent)}
                x2={chartWidth - padding.right}
                y2={yScale(percent)}
                stroke="#374151"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* Y-axis label */}
          <text
            x={15}
            y={padding.top + graphHeight / 2}
            textAnchor="middle"
            fill="#d1d5db"
            fontSize="12"
            fontWeight="500"
            transform={`rotate(-90, 15, ${padding.top + graphHeight / 2})`}
          >
            Energy Level
          </text>

          {/* Lines */}
          <path
            d={generatePath('tension')}
            stroke="#ef4444"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={generatePath('volume')}
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={generatePath('conflict')}
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {pacingData.energyModulation.map((point) => (
            <g key={`points-${point.sceneNumber}`}>
              <circle
                cx={xScale(point.sceneNumber)}
                cy={yScale(point.tension)}
                r="4"
                fill="#ef4444"
                stroke="#1f2937"
                strokeWidth="2"
              />
              <circle
                cx={xScale(point.sceneNumber)}
                cy={yScale(point.volume)}
                r="4"
                fill="#3b82f6"
                stroke="#1f2937"
                strokeWidth="2"
              />
              <circle
                cx={xScale(point.sceneNumber)}
                cy={yScale(point.conflict)}
                r="4"
                fill="#10b981"
                stroke="#1f2937"
                strokeWidth="2"
              />
            </g>
          ))}

          {/* X-axis labels */}
          {pacingData.scenes.map((scene) => (
            <text
              key={`x-label-${scene.sceneNumber}`}
              x={xScale(scene.sceneNumber)}
              y={chartHeight - padding.bottom + 20}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="10"
            >
              {scene.sceneNumber}
            </text>
          ))}

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <text
              key={`y-label-${percent}`}
              x={padding.left - 10}
              y={yScale(percent)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#9ca3af"
              fontSize="10"
            >
              {percent}
            </text>
          ))}

          {/* X-axis label */}
          <text
            x={padding.left + graphWidth / 2}
            y={chartHeight - 10}
            textAnchor="middle"
            fill="#d1d5db"
            fontSize="12"
            fontWeight="500"
          >
            Scene Number
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-xs text-gray-400">Tension</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-xs text-gray-400">Volume (Quiet/Loud)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
            <span className="text-xs text-gray-400">Conflict (Connection/Conflict)</span>
          </div>
        </div>
      </div>

      {/* Issues Section */}
      {pacingData.issues.length > 0 && (
        <div className="mb-6">
          <div className="border-t border-b border-gray-700 py-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Detected Issues
            </h3>
          </div>
          {pacingData.issues.map((issue) => (
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
                    {issue.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    Scenes: {issue.affectedScenes.join(', ')}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-300">{issue.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Section */}
      {pacingData.recommendations.length > 0 && (
        <div className="mb-6">
          <div className="border-t border-b border-gray-700 py-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Pacing Recommendations
            </h3>
          </div>
          {pacingData.recommendations.map((rec) => (
            <div key={rec.id} className="mb-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400 font-semibold">Scene {rec.sceneNumber}:</span>
                <span className="text-white font-medium">{rec.recommendation}</span>
              </div>
              <p className="text-sm text-gray-400 ml-2 pl-4 border-l-2 border-gray-700">
                {rec.reasoning}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {pacingData.lastUpdated.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
