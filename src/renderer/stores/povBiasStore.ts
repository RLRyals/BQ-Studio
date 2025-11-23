import { create } from 'zustand';
import type {
  POVBiasData,
  ScenePOVState,
  BiasLevel,
} from '../components/npe/types';

interface POVBiasState {
  povBiasData: POVBiasData | null;
  isLoading: boolean;

  // Actions
  setPOVBiasData: (data: POVBiasData) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Mock data for development - will be replaced with MCP data in Phase 4
const mockPOVBiasData: POVBiasData = {
  scenes: [
    {
      sceneId: 'scene-1',
      sceneTitle: 'The Office Confrontation',
      povCharacter: 'Sarah Chen',
      biasLevel: 'strongly-biased' as BiasLevel,
      isSubjective: true,
      misreadings: [
        {
          event: "Marcus's silence during the meeting",
          povInterpretation: 'He is plotting against me, deliberately undermining my authority',
          actualReality: 'He was processing the revelation about the project timeline',
          severity: 'moderate',
        },
      ],
      selectiveAttention: {
        noticed: [
          "Marcus's clenched jaw",
          'The way he avoided eye contact',
          'His terse responses',
        ],
        ignored: [
          'The concern in his voice when asking about her wellbeing',
          'His defensive posture suggesting vulnerability',
          'The project folder he brought with detailed notes',
        ],
        significance:
          'Sarah is filtering everything through her abandonment wound, seeing threats where none exist',
      },
      operatingSystemReveals: [
        {
          worldviewElement: 'Everyone eventually leaves',
          howItShapesPerception: 'Interprets normal professional distance as imminent betrayal',
          example: 'Reads his silence as proof he is planning to quit the team',
        },
      ],
      validationNotes: 'Strong POV bias present. Sarah is an unreliable narrator in this scene.',
    },
    {
      sceneId: 'scene-2',
      sceneTitle: 'Late Night Discovery',
      povCharacter: 'Sarah Chen',
      biasLevel: 'mildly-biased' as BiasLevel,
      isSubjective: true,
      misreadings: [
        {
          event: 'Finding the old project files',
          povInterpretation: 'This proves everyone knew but kept me in the dark',
          actualReality: 'The files were archived and forgotten by most of the team',
          severity: 'minor',
        },
      ],
      selectiveAttention: {
        noticed: [
          'Her name was missing from several key documents',
          'Dates that showed meetings happened without her',
          'Email chains she was not included in',
        ],
        ignored: [
          'Most of these meetings were before she joined the team',
          'Her name appears on later revisions',
          'The email chains were about routine logistics',
        ],
        significance: 'Still filtering through wound, but beginning to question her assumptions',
      },
      operatingSystemReveals: [
        {
          worldviewElement: 'I am always the outsider',
          howItShapesPerception: 'Sees exclusion even in chronologically impossible scenarios',
          example: 'Feels hurt by meetings that happened before her employment',
        },
      ],
      validationNotes: 'POV starting to self-correct. Character growth visible.',
    },
    {
      sceneId: 'scene-3',
      sceneTitle: 'The Revelation',
      povCharacter: 'Marcus Stone',
      biasLevel: 'strongly-biased' as BiasLevel,
      isSubjective: true,
      misreadings: [
        {
          event: "Sarah's emotional response",
          povInterpretation: 'She is being irrational and unprofessional',
          actualReality: 'She is having a valid emotional response to perceived betrayal',
          severity: 'critical',
        },
        {
          event: 'The team meeting dynamics',
          povInterpretation: 'Everyone is handling this maturely except Sarah',
          actualReality: 'Others are uncomfortable but hiding it; Sarah is the only one being honest',
          severity: 'moderate',
        },
      ],
      selectiveAttention: {
        noticed: [
          "Sarah's raised voice",
          'Her accusations',
          'The way she stormed out',
        ],
        ignored: [
          'The tremor in her hands',
          'The fact that she came back to apologize',
          'Her valid points about communication breakdown',
        ],
        significance:
          "Marcus's control wound makes him judge emotional expression as weakness",
      },
      operatingSystemReveals: [
        {
          worldviewElement: 'Emotions are dangerous and must be controlled',
          howItShapesPerception: 'Dismisses valid feelings as unprofessional outbursts',
          example: "Cannot see that Sarah's reaction comes from real hurt",
        },
        {
          worldviewElement: 'Vulnerability equals failure',
          howItShapesPerception: 'Mistakes emotional honesty for lack of competence',
          example: 'Judges Sarah as unable to handle pressure when she is actually being brave',
        },
      ],
      validationNotes: 'Unreliable narrator. Marcus is completely missing the emotional truth of the scene.',
    },
    {
      sceneId: 'scene-4',
      sceneTitle: 'The Bridge',
      povCharacter: 'Sarah Chen',
      biasLevel: 'mildly-biased' as BiasLevel,
      isSubjective: true,
      misreadings: [],
      selectiveAttention: {
        noticed: [
          'The sincerity in Marcus voice',
          'His admission of his own mistakes',
          'The vulnerability he is showing',
        ],
        ignored: [
          'Some of his defensive justifications',
          'The fact that he is still controlling the narrative',
        ],
        significance: 'Sarah is healing but still has blind spots',
      },
      operatingSystemReveals: [
        {
          worldviewElement: 'Maybe I can trust again',
          howItShapesPerception: 'Starting to see people as complex rather than just threats',
          example: 'Can hold both his mistakes and his good intentions simultaneously',
        },
      ],
      validationNotes: 'Healthy POV bias. Character has grown but retains authentic perspective.',
    },
    {
      sceneId: 'scene-5',
      sceneTitle: 'Resolution',
      povCharacter: 'Marcus Stone',
      biasLevel: 'mildly-biased' as BiasLevel,
      isSubjective: true,
      misreadings: [],
      selectiveAttention: {
        noticed: [
          "Sarah's strength in forgiving",
          'The courage it takes to be vulnerable',
          'His own need to let go of control',
        ],
        ignored: [
          'Some of the remaining power dynamics',
          'His tendency to intellectualize',
        ],
        significance: 'Marcus is learning but still has work to do',
      },
      operatingSystemReveals: [
        {
          worldviewElement: 'Strength includes softness',
          howItShapesPerception: 'Beginning to value emotional truth alongside logic',
          example: 'Respects Sarah for her emotional honesty rather than judging it',
        },
      ],
      validationNotes: 'Character growth evident. POV becoming more reliable while maintaining authenticity.',
    },
  ],
  overallSubjectivity: 72,
  totalMisreadings: 4,
  criticalMisreadings: 1,
  lastUpdated: new Date(),
  context: {
    bookId: 'book-1',
    bookTitle: 'The Fractured Mirror',
    chapterId: 'chapter-5',
    chapterTitle: 'Chapter 5: Fractures',
  },
};

export const usePOVBiasStore = create<POVBiasState>()((set) => ({
  povBiasData: mockPOVBiasData,
  isLoading: false,

  setPOVBiasData: (data: POVBiasData) => set({ povBiasData: data }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  reset: () =>
    set({
      povBiasData: mockPOVBiasData,
      isLoading: false,
    }),
}));
