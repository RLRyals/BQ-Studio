/**
 * Token Usage Panel
 * Displays token usage statistics for an execution job
 */

import React from 'react';
import type { ExecutionJob } from '../../../core/agent-orchestration/types';

interface TokenUsagePanelProps {
  job: ExecutionJob;
}

export const TokenUsagePanel: React.FC<TokenUsagePanelProps> = ({ job }) => {
  const { tokensUsed } = job;
  const totalTokens = tokensUsed.total;
  const inputTokens = tokensUsed.input;
  const outputTokens = tokensUsed.output;

  // Calculate percentages for visualization
  const inputPercentage =
    totalTokens > 0 ? (inputTokens / totalTokens) * 100 : 0;
  const outputPercentage =
    totalTokens > 0 ? (outputTokens / totalTokens) * 100 : 0;

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Estimate cost (approximate - Claude Pro/Max subscription based)
  // These are just for reference, actual billing is through subscription
  const estimatedInputCost = (inputTokens / 1000000) * 3.0; // $3 per 1M tokens (example)
  const estimatedOutputCost = (outputTokens / 1000000) * 15.0; // $15 per 1M tokens (example)
  const totalEstimatedCost = estimatedInputCost + estimatedOutputCost;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Token Usage
      </h3>

      {/* Total Tokens */}
      <div className="mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(totalTokens)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Tokens Used
          </div>
        </div>
      </div>

      {/* Token Breakdown */}
      <div className="space-y-4 mb-6">
        {/* Input Tokens */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Input Tokens
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatNumber(inputTokens)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${inputPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {inputPercentage.toFixed(1)}% of total
          </div>
        </div>

        {/* Output Tokens */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Output Tokens
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatNumber(outputTokens)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${outputPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {outputPercentage.toFixed(1)}% of total
          </div>
        </div>
      </div>

      {/* Estimated Cost (Reference Only) */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-2 mb-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Estimated API Cost (Reference)
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                Your actual billing is through your Claude Pro/Max subscription.
              </div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                ${totalEstimatedCost.toFixed(4)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Input: ${estimatedInputCost.toFixed(4)} • Output: $
                {estimatedOutputCost.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Efficiency Metrics */}
      {job.status === 'completed' && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Efficiency Metrics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Input/Output Ratio
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {outputTokens > 0
                  ? (inputTokens / outputTokens).toFixed(2)
                  : '0.00'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Avg. Tokens/Minute
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {job.startedAt && job.completedAt
                  ? formatNumber(
                      Math.round(
                        totalTokens /
                          ((new Date(job.completedAt).getTime() -
                            new Date(job.startedAt).getTime()) /
                            60000)
                      )
                    )
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
