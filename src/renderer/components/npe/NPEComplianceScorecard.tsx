import React from 'react';
import { useNPEComplianceStore } from '../../stores/npeComplianceStore';
import type { NPECategoryScore } from './types';

interface NPEComplianceScorecardProps {
  onCategoryClick?: (category: string) => void;
}

export const NPEComplianceScorecard: React.FC<NPEComplianceScorecardProps> = ({
  onCategoryClick,
}) => {
  const { complianceData, isLoading } = useNPEComplianceStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading NPE compliance data...</div>
      </div>
    );
  }

  if (!complianceData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No NPE compliance data available</div>
      </div>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (score: number): string => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderProgressBar = (category: NPECategoryScore) => {
    const barColor = getProgressBarColor(category.score);
    const scoreColor = getScoreColor(category.score);

    return (
      <div
        key={category.category}
        className="mb-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
        onClick={() => onCategoryClick?.(category.category)}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm font-medium">
              {category.displayName}:
            </span>
            {category.violations > 0 && (
              <span className="text-xs text-gray-500">
                ({category.violations} issue{category.violations !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          <span className={`text-sm font-semibold ${scoreColor}`}>
            {category.score}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`${barColor} h-2.5 rounded-full transition-all duration-300`}
            style={{ width: `${category.score}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          NPE Compliance Scorecard
        </h2>
        {complianceData.context && (
          <p className="text-sm text-gray-400">
            {complianceData.context.bookTitle}
            {complianceData.context.chapterTitle && `, ${complianceData.context.chapterTitle}`}
          </p>
        )}
      </div>

      {/* Overall Score */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border-2 border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-gray-300">
            Overall NPE Score:
          </span>
          <span className={`text-3xl font-bold ${getScoreColor(complianceData.overallScore)}`}>
            {complianceData.overallScore}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`${getProgressBarColor(complianceData.overallScore)} h-4 rounded-full transition-all duration-300`}
            style={{ width: `${complianceData.overallScore}%` }}
          />
        </div>
      </div>

      {/* Category Scores */}
      <div className="mb-6">
        <div className="border-t border-b border-gray-700 py-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Category Breakdown
          </h3>
        </div>
        {complianceData.categories.map((category) => renderProgressBar(category))}
      </div>

      {/* Violation Summary */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Violation Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">
              {complianceData.totalViolations}
            </div>
            <div className="text-xs text-gray-400">Total Issues</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-400">
                {complianceData.criticalViolations}
              </span>
              <span className="text-xs text-red-400">❌</span>
            </div>
            <div className="text-xs text-gray-400">Critical</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-400">
                {complianceData.warningViolations}
              </span>
              <span className="text-xs text-yellow-400">⚠️</span>
            </div>
            <div className="text-xs text-gray-400">Warnings</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-400">
                {complianceData.minorViolations}
              </span>
              <span className="text-xs text-blue-400">ℹ️</span>
            </div>
            <div className="text-xs text-gray-400">Minor</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {complianceData.lastUpdated.toLocaleString()}
        </p>
        {onCategoryClick && (
          <p className="text-xs text-gray-500 text-center mt-1">
            Click on any category to see detailed violations
          </p>
        )}
      </div>
    </div>
  );
};
