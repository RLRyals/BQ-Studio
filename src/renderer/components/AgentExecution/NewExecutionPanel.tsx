/**
 * New Execution Panel
 * UI for creating new agent skill executions
 */

import React, { useState } from 'react';
import { useAgentExecutionStore } from '../../stores/agentExecutionStore';
import { SkillPickerModal } from './SkillPickerModal';

// Available skills (from .claude/skills/)
const AVAILABLE_SKILLS = [
  {
    name: 'market-driven-planning-skill',
    displayName: 'Market-Driven Planning',
    description:
      'Complete market-driven series planning from trend research to validated series architecture',
    estimatedTime: '3-4 hours',
    estimatedCost: '$2-5 (API users only)',
    phases: 7,
    recommended: true,
  },
  {
    name: 'series-planning-skill',
    displayName: 'Series Planning',
    description: 'Create 5-book series structure with character arcs and escalation patterns',
    estimatedTime: '1-2 hours',
    estimatedCost: '$1-2',
    phases: 5,
    recommended: false,
  },
  {
    name: 'book-planning-skill',
    displayName: 'Book Planning',
    description: 'Detailed chapter-by-chapter plan for a single book using genre beat sheets',
    estimatedTime: '1-2 hours',
    estimatedCost: '$0.50-1.50',
    phases: 4,
    recommended: false,
  },
  {
    name: 'chapter-planning-skill',
    displayName: 'Chapter Planning',
    description: 'Scene-level planning for individual chapters with continuity tracking',
    estimatedTime: '30-60 min',
    estimatedCost: '$0.20-0.50',
    phases: 3,
    recommended: false,
  },
  {
    name: 'scene-writing-skill',
    displayName: 'Scene Writing',
    description: 'Write individual scenes with Bailey using NPE methodology and genre style guides',
    estimatedTime: '15-30 min/scene',
    estimatedCost: '$0.10-0.30',
    phases: 2,
    recommended: false,
  },
];

export const NewExecutionPanel: React.FC = () => {
  const { createJob } = useAgentExecutionStore();

  const [seriesId, setSeriesId] = useState<number>(1); // TODO: Load from series list
  const [seriesName, setSeriesName] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string>('Market-Driven Planning');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userPrompt.trim() || !seriesName.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createJob(seriesId, seriesName, selectedSkill, userPrompt);

      // Reset form
      setUserPrompt('');
      alert('Execution job created successfully!');
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create execution job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          New Execution
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Series Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Series Name
              </label>
              <input
                type="text"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                placeholder="e.g., The Clockwork Directive"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skill
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={selectedSkill}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowSkillPicker(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors whitespace-nowrap"
                >
                  Choose Skill
                </button>
              </div>
            </div>
          </div>

          {/* Skill Info Preview */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                {selectedSkill}
              </h3>
              <button
                type="button"
                onClick={() => setShowSkillPicker(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn more about skills →
              </button>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Click "Choose Skill" to view detailed information and recommendations
            </p>
          </div>

        {/* Concept Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Concept / Prompt
          </label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="What if a vampire detective has to solve her own murder because she doesn't remember being turned?"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your story concept or instructions for the agent
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setUserPrompt('');
              setSeriesName('');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !userPrompt.trim() || !seriesName.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Starting...' : 'Start Execution'}
          </button>
        </div>
      </form>
    </div>

      {/* Skill Picker Modal */}
      <SkillPickerModal
        isOpen={showSkillPicker}
        onClose={() => setShowSkillPicker(false)}
        onSelect={(skillName) => setSelectedSkill(skillName)}
        selectedSkill={selectedSkill}
      />
    </>
  );
};
