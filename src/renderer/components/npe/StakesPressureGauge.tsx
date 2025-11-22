import React, { useMemo } from 'react';
import { useStakesPressureStore } from '../../stores/stakesPressureStore';
import type { PressureThread, PressureDataPoint, PressureCheckpoint } from './types';
import { PRESSURE_THREAD_COLORS, PRESSURE_THREAD_NAMES } from './types';

interface StakesPressureGaugeProps {
  onCheckpointClick?: (checkpointId: string) => void;
}

export const StakesPressureGauge: React.FC<StakesPressureGaugeProps> = ({
  onCheckpointClick,
}) => {
  const { pressureData, isLoading } = useStakesPressureStore();

  // Chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Generate path for a pressure thread
  const generatePath = (points: PressureDataPoint[]): string => {
    if (points.length === 0) return '';

    return points
      .map((point, index) => {
        const x = padding.left + (point.storyPosition / 100) * graphWidth;
        const y = padding.top + graphHeight - (point.pressureLevel / 100) * graphHeight;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // Group data points by thread
  const threadDataMap = useMemo(() => {
    if (!pressureData) return new Map<PressureThread, PressureDataPoint[]>();

    const map = new Map<PressureThread, PressureDataPoint[]>();
    pressureData.dataPoints.forEach((point) => {
      const points = map.get(point.thread) || [];
      points.push(point);
      map.set(point.thread, points);
    });

    // Sort points by story position
    map.forEach((points) => points.sort((a, b) => a.storyPosition - b.storyPosition));

    return map;
  }, [pressureData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading pressure data...</div>
      </div>
    );
  }

  if (!pressureData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No pressure data available</div>
      </div>
    );
  }

  const getSeverityColor = (severity: string): string => {
    if (severity === 'critical') return 'text-red-400';
    if (severity === 'warning') return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Stakes/Pressure Gauge
        </h2>
        <p className="text-sm text-gray-400">
          {pressureData.bookTitle}
        </p>
      </div>

      {/* Violation Summary */}
      {pressureData.totalViolations > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-red-400">
              {pressureData.totalViolations} Escalation Violation{pressureData.totalViolations !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {pressureData.escalationValidations.map((validation, index) => (
              <div key={index} className="text-sm">
                <span className={`font-semibold ${getSeverityColor(validation.severity)}`}>
                  @{validation.position}%:
                </span>{' '}
                <span className="text-gray-300">{validation.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="mx-auto"
          style={{ minWidth: chartWidth }}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value) => {
            const y = padding.top + graphHeight - (value / 100) * graphHeight;
            return (
              <g key={`grid-${value}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#9CA3AF"
                  fontSize="12"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Story position markers */}
          {[0, 25, 50, 75, 100].map((value) => {
            const x = padding.left + (value / 100) * graphWidth;
            return (
              <text
                key={`pos-${value}`}
                x={x}
                y={chartHeight - 10}
                fill="#9CA3AF"
                fontSize="12"
                textAnchor="middle"
              >
                {value}%
              </text>
            );
          })}

          {/* Checkpoints */}
          {pressureData.checkpoints.map((checkpoint) => {
            const x = padding.left + (checkpoint.storyPosition / 100) * graphWidth;
            return (
              <g key={checkpoint.id}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={chartHeight - padding.bottom}
                  stroke={PRESSURE_THREAD_COLORS[checkpoint.thread]}
                  strokeWidth="2"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
                <circle
                  cx={x}
                  cy={padding.top + 10}
                  r="4"
                  fill={PRESSURE_THREAD_COLORS[checkpoint.thread]}
                  className={onCheckpointClick ? 'cursor-pointer hover:r-6' : ''}
                  onClick={() => onCheckpointClick?.(checkpoint.id)}
                />
              </g>
            );
          })}

          {/* Pressure lines */}
          {pressureData.threads.map((thread) => {
            const points = threadDataMap.get(thread) || [];
            const path = generatePath(points);
            const color = PRESSURE_THREAD_COLORS[thread];

            return (
              <g key={thread}>
                {/* Line */}
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Violation markers */}
                {points
                  .filter((p) => p.hasViolation)
                  .map((point, index) => {
                    const x = padding.left + (point.storyPosition / 100) * graphWidth;
                    const y = padding.top + graphHeight - (point.pressureLevel / 100) * graphHeight;
                    return (
                      <g key={`violation-${thread}-${index}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          fill="#EF4444"
                          stroke="#FEE2E2"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y + 3}
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          !
                        </text>
                      </g>
                    );
                  })}

                {/* Data point markers */}
                {points.map((point, index) => {
                  const x = padding.left + (point.storyPosition / 100) * graphWidth;
                  const y = padding.top + graphHeight - (point.pressureLevel / 100) * graphHeight;
                  return (
                    <circle
                      key={`point-${thread}-${index}`}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={color}
                      opacity={point.hasViolation ? 0 : 0.8}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Axes labels */}
          <text
            x={chartWidth / 2}
            y={chartHeight - 5}
            fill="#9CA3AF"
            fontSize="14"
            textAnchor="middle"
            fontWeight="bold"
          >
            Story Position
          </text>
          <text
            x={15}
            y={chartHeight / 2}
            fill="#9CA3AF"
            fontSize="14"
            textAnchor="middle"
            fontWeight="bold"
            transform={`rotate(-90, 15, ${chartHeight / 2})`}
          >
            Pressure Level
          </text>
        </svg>
      </div>

      {/* Thread Legend */}
      <div className="mb-6">
        <div className="border-t border-b border-gray-700 py-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Plot Threads
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {pressureData.threads.map((thread) => (
            <div key={thread} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: PRESSURE_THREAD_COLORS[thread] }}
              />
              <span className="text-sm text-gray-300">
                {PRESSURE_THREAD_NAMES[thread]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Checkpoints List */}
      <div className="mb-4">
        <div className="border-t border-b border-gray-700 py-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Major Pressure Moments
          </h3>
        </div>
        <div className="space-y-2">
          {pressureData.checkpoints
            .sort((a, b) => a.storyPosition - b.storyPosition)
            .map((checkpoint) => (
              <div
                key={checkpoint.id}
                className={`p-3 bg-gray-800 rounded-lg border-l-4 ${
                  onCheckpointClick ? 'cursor-pointer hover:bg-gray-750 transition-colors' : ''
                }`}
                style={{ borderLeftColor: PRESSURE_THREAD_COLORS[checkpoint.thread] }}
                onClick={() => onCheckpointClick?.(checkpoint.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-300">
                    {checkpoint.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    @{checkpoint.storyPosition}%
                  </span>
                </div>
                <p className="text-xs text-gray-400">{checkpoint.description}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {pressureData.lastUpdated.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          Red markers (!) indicate pressure violations requiring justification
        </p>
      </div>
    </div>
  );
};
