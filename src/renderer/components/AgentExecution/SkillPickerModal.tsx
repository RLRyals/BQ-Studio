/**
 * Skill Picker Modal
 * Helps users choose the right agent skill with detailed descriptions and recommendations
 */

import React, { useState } from 'react';

export interface SkillInfo {
  name: string;
  displayName: string;
  description: string;
  phases: string[];
  estimatedDuration: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  recommended: boolean;
  whenToUse: string[];
  outputs: string[];
  tokenEstimate: string;
}

interface SkillPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (skillName: string) => void;
  selectedSkill?: string;
}

const SKILLS: SkillInfo[] = [
  {
    name: 'Market-Driven Planning',
    displayName: 'Market-Driven Planning',
    description:
      'Complete series planning from concept to validated 5-book structure. Analyzes market trends, identifies genre pack, designs character arcs, and validates commercial viability.',
    phases: [
      'Genre Identification',
      'Market Research',
      'Genre Pack Selection',
      'Series Architecture',
      'Book Planning',
      'Commercial Validation',
      'Handoff Documentation',
    ],
    estimatedDuration: '3-4 hours',
    complexity: 'advanced',
    recommended: true,
    whenToUse: [
      'Starting a new series from scratch',
      'You have a high-level concept but need market validation',
      'You want to ensure commercial viability before writing',
      'You need a complete 5-book series structure',
    ],
    outputs: [
      'Market research report with trending tropes',
      'Selected genre pack with reader expectations',
      'Series bible with character arcs and world building',
      '5-book plot structure with escalation',
      'Commercial viability score and recommendations',
    ],
    tokenEstimate: '~45K tokens',
  },
  {
    name: 'Series Planning',
    displayName: 'Series Planning',
    description:
      'Plan a multi-book series structure with character arcs, world building, and plot progression. Assumes genre and market research already done.',
    phases: [
      'Series Concept Analysis',
      'Character Arc Planning',
      'World Building',
      'Plot Structure',
      'Documentation',
    ],
    estimatedDuration: '1-2 hours',
    complexity: 'intermediate',
    recommended: false,
    whenToUse: [
      'You already know your genre and target audience',
      'You need to plan character arcs across multiple books',
      'You want to build a consistent world and magic system',
      'You have a validated concept and need structure',
    ],
    outputs: [
      'Series outline with major plot points',
      'Character arc progression across books',
      'World building bible with consistency rules',
      'Book-by-book synopsis',
    ],
    tokenEstimate: '~25K tokens',
  },
  {
    name: 'Book Planning',
    displayName: 'Book Planning',
    description:
      'Plan a single book with chapter breakdown and scene structure. Perfect for planning one book at a time within an existing series.',
    phases: ['Story Structure', 'Chapter Breakdown', 'Scene Planning', 'Documentation'],
    estimatedDuration: '1-2 hours',
    complexity: 'intermediate',
    recommended: false,
    whenToUse: [
      'You have a series structure and need to plan the next book',
      'You want detailed chapter-by-chapter breakdown',
      'You need scene-level planning before writing',
      'You're working within an established world',
    ],
    outputs: [
      'Three-act structure with major beats',
      'Chapter-by-chapter outline',
      'Scene list with POV and objectives',
      'Subplot tracking',
    ],
    tokenEstimate: '~15K tokens',
  },
  {
    name: 'Chapter Planning',
    displayName: 'Chapter Planning',
    description:
      'Plan individual chapters with scene beats and character objectives. Use when you have a book outline and need granular planning.',
    phases: ['Scene List', 'Beat Planning', 'Documentation'],
    estimatedDuration: '30-60 minutes',
    complexity: 'beginner',
    recommended: false,
    whenToUse: [
      'You have a book outline and need chapter details',
      'You want to plan before writing each chapter',
      'You need to ensure chapter pacing and structure',
      'You're ready to write but want guidance',
    ],
    outputs: [
      'Scene-by-scene breakdown',
      'Character objectives and obstacles',
      'Emotional beats and tension points',
      'Cliffhanger/hook planning',
    ],
    tokenEstimate: '~8K tokens',
  },
  {
    name: 'Scene Writing',
    displayName: 'Scene Writing',
    description:
      'Write individual scenes with proper pacing, dialogue, and description. The actual prose generation step.',
    phases: ['Scene Draft', 'Review'],
    estimatedDuration: '15-30 minutes per scene',
    complexity: 'beginner',
    recommended: false,
    whenToUse: [
      'You have chapter/scene plans ready',
      'You want AI assistance with prose generation',
      'You need dialogue or description help',
      "You're ready to produce actual manuscript pages",
    ],
    outputs: [
      'Scene prose draft',
      'Dialogue with character voice',
      'Sensory descriptions',
      'Pacing and tension',
    ],
    tokenEstimate: '~5K tokens per scene',
  },
];

export const SkillPickerModal: React.FC<SkillPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedSkill,
}) => {
  const [activeSkill, setActiveSkill] = useState<SkillInfo | null>(
    SKILLS.find((s) => s.name === selectedSkill) || SKILLS[0]
  );

  if (!isOpen) return null;

  const handleSelect = () => {
    if (activeSkill) {
      onSelect(activeSkill.name);
      onClose();
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Choose Your Agent Skill
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select the right skill for your current writing stage
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Skill List */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-auto">
            <div className="p-4 space-y-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => setActiveSkill(skill)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    activeSkill?.name === skill.name
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`font-semibold ${
                        activeSkill?.name === skill.name
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {skill.displayName}
                    </h3>
                    {skill.recommended && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {skill.estimatedDuration} • {skill.phases.length} phases
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getComplexityColor(
                      skill.complexity
                    )}`}
                  >
                    {skill.complexity}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Skill Details */}
          {activeSkill && (
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Title and Complexity */}
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activeSkill.displayName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getComplexityColor(
                        activeSkill.complexity
                      )}`}
                    >
                      {activeSkill.complexity}
                    </span>
                    {activeSkill.recommended && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        ⭐ Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{activeSkill.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Estimated Duration
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeSkill.estimatedDuration}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Number of Phases
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeSkill.phases.length}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Token Estimate
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeSkill.tokenEstimate}
                    </div>
                  </div>
                </div>

                {/* Phases */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Execution Phases
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {activeSkill.phases.map((phase, index) => (
                      <div
                        key={phase}
                        className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900/50 rounded p-2"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{phase}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* When to Use */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    When to Use This Skill
                  </h4>
                  <ul className="space-y-2">
                    {activeSkill.whenToUse.map((reason, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
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
                        <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outputs */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    What You'll Get
                  </h4>
                  <ul className="space-y-2">
                    {activeSkill.outputs.map((output, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <svg
                          className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{output}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {activeSkill && (
              <span>
                Selected: <strong className="text-gray-900 dark:text-white">{activeSkill.displayName}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!activeSkill}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
            >
              Select This Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
