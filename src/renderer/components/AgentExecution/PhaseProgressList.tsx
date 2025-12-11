/**
 * Phase Progress List
 * Displays phase-by-phase progress for an execution job
 */

import React from 'react';
import type { ExecutionJob } from '../../../core/agent-orchestration/types';

interface PhaseProgressListProps {
  job: ExecutionJob;
}

// Define standard phases for each skill type
const SKILL_PHASES: Record<string, string[]> = {
  'Market-Driven Planning': [
    'Genre Identification',
    'Market Research',
    'Genre Pack Selection',
    'Series Architecture',
    'Book Planning',
    'Commercial Validation',
    'Handoff Documentation',
  ],
  'Series Planning': [
    'Series Concept Analysis',
    'Character Arc Planning',
    'World Building',
    'Plot Structure',
    'Documentation',
  ],
  'Book Planning': [
    'Story Structure',
    'Chapter Breakdown',
    'Scene Planning',
    'Documentation',
  ],
  'Chapter Planning': ['Scene List', 'Beat Planning', 'Documentation'],
  'Scene Writing': ['Scene Draft', 'Review'],
};

export const PhaseProgressList: React.FC<PhaseProgressListProps> = ({ job }) => {
  const phases = SKILL_PHASES[job.skillName] || [];
  const currentPhaseIndex = job.currentPhase
    ? phases.indexOf(job.currentPhase)
    : -1;

  const getPhaseStatus = (
    phaseIndex: number
  ): 'completed' | 'current' | 'pending' => {
    if (job.status === 'completed') {
      return 'completed';
    }
    if (phaseIndex < currentPhaseIndex) {
      return 'completed';
    }
    if (phaseIndex === currentPhaseIndex) {
      return 'current';
    }
    return 'pending';
  };

  const getPhaseIcon = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case 'current':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        );
      case 'pending':
        return (
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Phase Progress
      </h3>

      {phases.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No phase information available for this skill.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(index);
            const isCurrent = status === 'current';

            return (
              <div key={phase} className="flex items-start space-x-4">
                {/* Phase Icon */}
                <div className="flex-shrink-0 relative">
                  {getPhaseIcon(status)}
                  {index < phases.length - 1 && (
                    <div
                      className={`absolute left-1/2 top-8 w-0.5 h-8 -ml-px ${
                        status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    ></div>
                  )}
                </div>

                {/* Phase Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium ${
                      isCurrent
                        ? 'text-blue-900 dark:text-blue-300'
                        : status === 'completed'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {phase}
                  </div>
                  {isCurrent && job.status === 'running' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>In Progress</span>
                        <span>{Math.round(job.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {status === 'completed' && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overall Progress */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="font-semibold">{Math.round(job.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              job.status === 'completed'
                ? 'bg-green-600'
                : job.status === 'failed'
                ? 'bg-red-600'
                : job.status === 'paused'
                ? 'bg-yellow-600'
                : 'bg-blue-600'
            }`}
            style={{ width: `${job.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
