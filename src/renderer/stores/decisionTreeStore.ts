import { create } from 'zustand';
import type { DecisionTreeData, DecisionNode } from '../components/npe/types';

interface DecisionTreeState {
  treeData: DecisionTreeData | null;
  isLoading: boolean;
  selectedDecisionId: string | null;

  // Actions
  setTreeData: (data: DecisionTreeData) => void;
  setLoading: (loading: boolean) => void;
  setSelectedDecision: (decisionId: string | null) => void;
  toggleWhatIfMode: () => void;
  updateFilters: (filters: Partial<DecisionTreeData['filters']>) => void;
  reset: () => void;
}

// Mock data for development - will be replaced with MCP data in Phase 4
const mockDecisionTreeData: DecisionTreeData = {
  decisions: [
    {
      id: 'decision-1',
      chapterId: 'ch-3',
      sceneId: 'scene-3-2',
      characterId: 'char-sarah',
      characterName: 'Sarah',
      decisionPoint: 'Whether to trust the mysterious stranger',
      context:
        'Sarah is being followed, and a stranger offers to help her escape. She knows nothing about this person.',
      alternatives: [
        {
          id: 'alt-1-chosen',
          label: 'Trust and follow the stranger',
          description: 'Accept the help and follow the stranger to a safe location',
          plausibility: 65,
          alignments: [
            {
              type: 'goal',
              name: 'Survival',
              alignment: 80,
              description: 'Aligns with immediate need to escape danger',
            },
            {
              type: 'fear',
              name: 'Being alone',
              alignment: 70,
              description: 'Choosing help over isolation',
            },
            {
              type: 'wound',
              name: 'Past betrayal',
              alignment: -40,
              description: 'Goes against her trust issues from past betrayal',
            },
          ],
          consequencePreview: 'Gains valuable information but becomes tracked by enemies',
          chosen: true,
        },
        {
          id: 'alt-1-reject',
          label: 'Reject help and escape alone',
          description: 'Decline the stranger\'s help and find her own way out',
          plausibility: 85,
          alignments: [
            {
              type: 'wound',
              name: 'Past betrayal',
              alignment: 90,
              description: 'Strongly aligns with her trust issues',
            },
            {
              type: 'goal',
              name: 'Self-reliance',
              alignment: 85,
              description: 'Reinforces her independence',
            },
            {
              type: 'fear',
              name: 'Being alone',
              alignment: -60,
              description: 'Goes against her fear of isolation',
            },
          ],
          consequencePreview: 'Remains safe from tracking but misses crucial information',
          chosen: false,
        },
        {
          id: 'alt-1-negotiate',
          label: 'Demand information first',
          description: 'Ask the stranger to prove who they are before accepting help',
          plausibility: 75,
          alignments: [
            {
              type: 'value',
              name: 'Caution',
              alignment: 95,
              description: 'Perfectly aligns with her cautious nature',
            },
            {
              type: 'goal',
              name: 'Survival',
              alignment: 60,
              description: 'Partially supports survival but delays escape',
            },
            {
              type: 'wound',
              name: 'Past betrayal',
              alignment: 70,
              description: 'Attempts to protect herself from betrayal',
            },
          ],
          consequencePreview: 'Gains some trust but the delay allows enemies to close in',
          chosen: false,
        },
      ],
      actualConsequence:
        'Sarah gained critical information about the conspiracy but unknowingly led her enemies to her safe house two chapters later.',
      timestamp: new Date('2024-01-15T14:30:00'),
    },
    {
      id: 'decision-2',
      chapterId: 'ch-5',
      sceneId: 'scene-5-3',
      characterId: 'char-sarah',
      characterName: 'Sarah',
      decisionPoint: 'Confronting Marcus about his suspicious behavior',
      context:
        'Sarah has noticed Marcus acting strangely and finds evidence he has been investigating her. She must decide how to handle this discovery.',
      alternatives: [
        {
          id: 'alt-2-chosen',
          label: 'Direct confrontation',
          description: 'Confront Marcus directly and demand the truth',
          plausibility: 80,
          alignments: [
            {
              type: 'value',
              name: 'Honesty',
              alignment: 90,
              description: 'Strongly aligns with her value of direct communication',
            },
            {
              type: 'goal',
              name: 'Truth',
              alignment: 95,
              description: 'Directly pursues her goal of uncovering the truth',
            },
            {
              type: 'fear',
              name: 'Being deceived',
              alignment: 85,
              description: 'Addresses her fear of being manipulated',
            },
          ],
          consequencePreview: 'Marcus reveals he has been protecting her, forming an alliance',
          chosen: true,
        },
        {
          id: 'alt-2-investigate',
          label: 'Investigate secretly',
          description: 'Continue gathering evidence without alerting Marcus',
          plausibility: 70,
          alignments: [
            {
              type: 'wound',
              name: 'Past betrayal',
              alignment: 80,
              description: 'Aligns with her distrust of others',
            },
            {
              type: 'goal',
              name: 'Truth',
              alignment: 70,
              description: 'Supports truth-seeking but less directly',
            },
            {
              type: 'value',
              name: 'Honesty',
              alignment: -50,
              description: 'Conflicts with her value of direct communication',
            },
          ],
          consequencePreview: 'Discovers the truth but damages relationship with Marcus',
          chosen: false,
        },
        {
          id: 'alt-2-distance',
          label: 'Create distance',
          description: 'Pull away from Marcus and handle the situation alone',
          plausibility: 60,
          alignments: [
            {
              type: 'wound',
              name: 'Past betrayal',
              alignment: 90,
              description: 'Strongly aligns with protecting herself',
            },
            {
              type: 'fear',
              name: 'Being alone',
              alignment: -70,
              description: 'Goes against her fear of isolation',
            },
            {
              type: 'goal',
              name: 'Self-reliance',
              alignment: 85,
              description: 'Reinforces independence',
            },
          ],
          consequencePreview: 'Misses opportunity for alliance, faces danger alone',
          chosen: false,
        },
      ],
      actualConsequence:
        'Marcus confessed that he had been secretly protecting Sarah from the organization. They formed an alliance and began working together to expose the conspiracy.',
      timestamp: new Date('2024-01-15T16:45:00'),
    },
    {
      id: 'decision-3',
      chapterId: 'ch-7',
      sceneId: 'scene-7-2',
      characterId: 'char-sarah',
      characterName: 'Sarah',
      decisionPoint: 'Following Marcus\'s plan to expose the conspiracy',
      context:
        'Marcus has proposed a risky plan to expose the entire conspiracy, but it requires Sarah to trust him completely and put herself in danger.',
      alternatives: [
        {
          id: 'alt-3-chosen',
          label: 'Trust the plan completely',
          description: 'Follow Marcus\'s plan exactly as proposed',
          plausibility: 75,
          alignments: [
            {
              type: 'goal',
              name: 'Justice',
              alignment: 90,
              description: 'Strongly aligns with exposing the conspiracy',
            },
            {
              type: 'wound',
              name: 'Past betrayal',
              alignment: -60,
              description: 'Requires overcoming her trust issues',
            },
            {
              type: 'value',
              name: 'Courage',
              alignment: 85,
              description: 'Demonstrates her growing courage',
            },
          ],
          consequencePreview: 'Plan succeeds but Sarah faces maximum personal risk',
          chosen: true,
        },
        {
          id: 'alt-3-modify',
          label: 'Modify the plan',
          description: 'Suggest changes to reduce personal risk while maintaining effectiveness',
          plausibility: 85,
          alignments: [
            {
              type: 'goal',
              name: 'Justice',
              alignment: 80,
              description: 'Still pursues justice but more cautiously',
            },
            {
              type: 'value',
              name: 'Caution',
              alignment: 90,
              description: 'Aligns with her cautious nature',
            },
            {
              type: 'wound',
              name: 'Past betrayal',
              alignment: 50,
              description: 'Shows partial trust with built-in protection',
            },
          ],
          consequencePreview: 'Safer approach but conspiracy might escape partially exposed',
          chosen: false,
        },
        {
          id: 'alt-3-reject',
          label: 'Reject and go solo',
          description: 'Decline the plan and pursue her own approach to exposing the truth',
          plausibility: 40,
          alignments: [
            {
              type: 'goal',
              name: 'Self-reliance',
              alignment: 95,
              description: 'Maximizes independence',
            },
            {
              type: 'wound',
              name: 'Past betrayal',
              alignment: 85,
              description: 'Protects against potential betrayal',
            },
            {
              type: 'goal',
              name: 'Justice',
              alignment: 50,
              description: 'Still pursues justice but with lower success chance',
            },
          ],
          consequencePreview: 'Maintains independence but likely fails to expose conspiracy',
          chosen: false,
        },
      ],
      actualConsequence:
        'Sarah fully committed to Marcus\'s plan, demonstrating significant character growth in her ability to trust. The plan is currently in progress.',
      timestamp: new Date('2024-01-15T18:20:00'),
    },
  ],
  filters: {
    characterIds: [],
    chapterIds: [],
  },
  whatIfMode: false,
  lastUpdated: new Date(),
};

export const useDecisionTreeStore = create<DecisionTreeState>()((set) => ({
  treeData: mockDecisionTreeData,
  isLoading: false,
  selectedDecisionId: null,

  setTreeData: (data: DecisionTreeData) => set({ treeData: data }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setSelectedDecision: (decisionId: string | null) =>
    set({ selectedDecisionId: decisionId }),

  toggleWhatIfMode: () =>
    set((state) => ({
      treeData: state.treeData
        ? { ...state.treeData, whatIfMode: !state.treeData.whatIfMode }
        : null,
    })),

  updateFilters: (filters: Partial<DecisionTreeData['filters']>) =>
    set((state) => ({
      treeData: state.treeData
        ? {
            ...state.treeData,
            filters: { ...state.treeData.filters, ...filters },
          }
        : null,
    })),

  reset: () =>
    set({
      treeData: mockDecisionTreeData,
      isLoading: false,
      selectedDecisionId: null,
    }),
}));
