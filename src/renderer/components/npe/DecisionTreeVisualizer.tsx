import React, { useState, useCallback } from 'react';
import { useDecisionTreeStore } from '../../stores/decisionTreeStore';
import type { DecisionNode, DecisionAlternative, AlignmentIndicator } from './types';

interface DecisionTreeVisualizerProps {
  width?: number;
  height?: number;
}

export const DecisionTreeVisualizer: React.FC<DecisionTreeVisualizerProps> = ({
  width = 900,
  height = 600,
}) => {
  const { treeData, isLoading, selectedDecisionId, setSelectedDecision, toggleWhatIfMode } =
    useDecisionTreeStore();

  const [expandedDecisionId, setExpandedDecisionId] = useState<string | null>(null);
  const [hoveredAlternativeId, setHoveredAlternativeId] = useState<string | null>(null);

  // Get alignment color based on value
  const getAlignmentColor = (alignment: number): string => {
    if (alignment >= 70) return '#10b981'; // Strong alignment - green
    if (alignment >= 40) return '#3b82f6'; // Moderate alignment - blue
    if (alignment >= 0) return '#6b7280'; // Weak alignment - gray
    if (alignment >= -40) return '#f59e0b'; // Weak conflict - yellow
    if (alignment >= -70) return '#f97316'; // Moderate conflict - orange
    return '#ef4444'; // Strong conflict - red
  };

  // Get alignment type icon
  const getAlignmentIcon = (type: AlignmentIndicator['type']): string => {
    switch (type) {
      case 'goal':
        return '🎯';
      case 'fear':
        return '😰';
      case 'wound':
        return '💔';
      case 'value':
        return '⭐';
      default:
        return '•';
    }
  };

  // Calculate tree layout positions
  const calculateTreeLayout = (decision: DecisionNode, index: number) => {
    const baseY = 100 + index * 200;
    const baseX = 100;
    const branchSpacing = 200;

    return {
      decisionX: baseX,
      decisionY: baseY,
      alternatives: decision.alternatives.map((alt, altIndex) => ({
        x: baseX + branchSpacing,
        y: baseY - 60 + altIndex * 60,
      })),
    };
  };

  // Handle decision click
  const handleDecisionClick = useCallback(
    (decisionId: string) => {
      setSelectedDecision(selectedDecisionId === decisionId ? null : decisionId);
      setExpandedDecisionId(expandedDecisionId === decisionId ? null : decisionId);
    },
    [selectedDecisionId, expandedDecisionId, setSelectedDecision]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="text-gray-400">Loading decision tree data...</div>
      </div>
    );
  }

  if (!treeData || treeData.decisions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="text-gray-400">No decision tree data available</div>
      </div>
    );
  }

  const { decisions, whatIfMode } = treeData;

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Decision Tree Visualizer
            </h2>
            <p className="text-sm text-gray-400">
              Character decisions with plausible alternatives
            </p>
          </div>
          <button
            onClick={toggleWhatIfMode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              whatIfMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {whatIfMode ? '🔮 What If Mode: ON' : 'What If Mode: OFF'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
          Alignment Indicators
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🎯</span>
            <span className="text-xs text-gray-300">Goal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">😰</span>
            <span className="text-xs text-gray-300">Fear</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💔</span>
            <span className="text-xs text-gray-300">Wound</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <span className="text-xs text-gray-300">Value</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Alignment:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-500">Strong</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-500">Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-gray-500">Weak</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-500">Conflict</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-500">Strong Conflict</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Cards */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {decisions.map((decision, decisionIndex) => {
          const isExpanded = expandedDecisionId === decision.id;
          const isSelected = selectedDecisionId === decision.id;
          const chosenAlternative = decision.alternatives.find((alt) => alt.chosen);

          return (
            <div
              key={decision.id}
              className={`bg-gray-800 rounded-lg border-2 transition-all ${
                isSelected ? 'border-blue-500' : 'border-gray-700'
              }`}
            >
              {/* Decision Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-750 transition-colors"
                onClick={() => handleDecisionClick(decision.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">
                        {decision.decisionPoint}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                        {decision.characterName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{decision.context}</p>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>

                {/* Chosen alternative preview */}
                {chosenAlternative && !isExpanded && (
                  <div className="mt-3 p-2 bg-gray-900 rounded border border-green-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-400">
                        Chosen: {chosenAlternative.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 ml-4">
                      {chosenAlternative.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Expanded alternatives */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {decision.alternatives.map((alternative) => {
                    const isHovered = hoveredAlternativeId === alternative.id;

                    return (
                      <div
                        key={alternative.id}
                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          alternative.chosen
                            ? 'bg-green-900/20 border-green-500/50'
                            : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                        }`}
                        onMouseEnter={() => setHoveredAlternativeId(alternative.id)}
                        onMouseLeave={() => setHoveredAlternativeId(null)}
                      >
                        {/* Alternative header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {alternative.chosen && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                              <h4 className="font-medium text-white">
                                {alternative.label}
                              </h4>
                              <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                                {alternative.plausibility}% plausible
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {alternative.description}
                            </p>
                          </div>
                        </div>

                        {/* Alignment indicators */}
                        <div className="mt-3 space-y-2">
                          <h5 className="text-xs font-semibold text-gray-500 uppercase">
                            Character Alignment
                          </h5>
                          {alternative.alignments.map((alignment, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm">
                                {getAlignmentIcon(alignment.type)}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-300">
                                    {alignment.name}
                                  </span>
                                  <span
                                    className="text-xs font-bold"
                                    style={{
                                      color: getAlignmentColor(alignment.alignment),
                                    }}
                                  >
                                    {alignment.alignment > 0 ? '+' : ''}
                                    {alignment.alignment}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full transition-all"
                                    style={{
                                      width: `${Math.abs(alignment.alignment)}%`,
                                      backgroundColor: getAlignmentColor(
                                        alignment.alignment
                                      ),
                                    }}
                                  />
                                </div>
                                {isHovered && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {alignment.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Consequence preview */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            {alternative.chosen
                              ? 'Actual Consequence'
                              : whatIfMode
                                ? 'What If...'
                                : 'Consequence Preview'}
                          </h5>
                          <p className="text-sm text-gray-400">
                            {alternative.consequencePreview}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Actual consequence (if available) */}
                  {decision.actualConsequence && (
                    <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <h5 className="text-xs font-semibold text-blue-400 uppercase mb-1">
                        Actual Story Consequence
                      </h5>
                      <p className="text-sm text-gray-300">
                        {decision.actualConsequence}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
          Interactive Features
        </h4>
        <div className="space-y-1 text-xs text-gray-500">
          <p>• Click decision cards to expand and view all alternatives</p>
          <p>• Hover over alternatives to see alignment details</p>
          <p>• Toggle "What If Mode" to explore roads not taken</p>
          <p>
            • Alignment bars show how choices align with character goals, fears, wounds,
            and values
          </p>
          <p>• Green indicators mark the chosen path in the story</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {treeData.lastUpdated.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
