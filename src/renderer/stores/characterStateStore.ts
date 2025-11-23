import { create } from 'zustand';
import type {
  CharacterStateData,
  CharacterTimeline,
  CharacterVersionLabel,
  BehavioralPalette,
  ContextState,
} from '../components/npe/types';

interface CharacterStateState {
  characterStateData: CharacterStateData | null;
  isLoading: boolean;

  // Actions
  setCharacterStateData: (data: CharacterStateData) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Mock data for development - will be replaced with MCP data in Phase 4
const mockCharacterStateData: CharacterStateData = {
  timelines: [
    {
      characterId: 'char-1',
      characterName: 'Sarah Chen',
      color: '#3b82f6', // blue
      versions: [
        {
          version: 'V1' as CharacterVersionLabel,
          storyPosition: 0,
          label: 'Beginning',
          activeBehaviors: ['anxiety', 'curiosity'] as BehavioralPalette[],
          contextState: 'baseline' as ContextState,
          wounds: [
            {
              woundName: 'Abandonment',
              healingProgress: 0,
              active: true,
            },
          ],
          transitionTrigger: undefined,
        },
        {
          version: 'V2' as CharacterVersionLabel,
          storyPosition: 35,
          label: 'First Turning Point',
          activeBehaviors: ['fear', 'anger', 'anxiety'] as BehavioralPalette[],
          contextState: 'mild-stress' as ContextState,
          wounds: [
            {
              woundName: 'Abandonment',
              healingProgress: 15,
              active: true,
            },
          ],
          transitionTrigger: 'Discovers her mentor has been lying to her',
        },
        {
          version: 'V3' as CharacterVersionLabel,
          storyPosition: 75,
          label: 'Climax',
          activeBehaviors: ['anger', 'grief', 'shame'] as BehavioralPalette[],
          contextState: 'extreme-stress' as ContextState,
          wounds: [
            {
              woundName: 'Abandonment',
              healingProgress: 60,
              active: true,
            },
          ],
          transitionTrigger: 'Forced to confront the truth about her past',
        },
        {
          version: 'V4' as CharacterVersionLabel,
          storyPosition: 95,
          label: 'Resolution',
          activeBehaviors: ['joy', 'curiosity'] as BehavioralPalette[],
          contextState: 'baseline' as ContextState,
          wounds: [
            {
              woundName: 'Abandonment',
              healingProgress: 85,
              active: false,
            },
          ],
          transitionTrigger: 'Makes peace with her mentor and chooses forgiveness',
        },
      ],
    },
    {
      characterId: 'char-2',
      characterName: 'Marcus Stone',
      color: '#10b981', // green
      versions: [
        {
          version: 'V1' as CharacterVersionLabel,
          storyPosition: 0,
          label: 'Beginning',
          activeBehaviors: ['contempt', 'anger'] as BehavioralPalette[],
          contextState: 'mild-stress' as ContextState,
          wounds: [
            {
              woundName: 'Betrayal',
              healingProgress: 0,
              active: true,
            },
            {
              woundName: 'Loss of control',
              healingProgress: 0,
              active: true,
            },
          ],
          transitionTrigger: undefined,
        },
        {
          version: 'V2' as CharacterVersionLabel,
          storyPosition: 40,
          label: 'Midpoint',
          activeBehaviors: ['fear', 'shame', 'anger'] as BehavioralPalette[],
          contextState: 'moderate-stress' as ContextState,
          wounds: [
            {
              woundName: 'Betrayal',
              healingProgress: 25,
              active: true,
            },
            {
              woundName: 'Loss of control',
              healingProgress: 10,
              active: true,
            },
          ],
          transitionTrigger: 'His past mistakes come back to haunt him',
        },
        {
          version: 'V3' as CharacterVersionLabel,
          storyPosition: 80,
          label: 'Dark Night',
          activeBehaviors: ['grief', 'shame', 'fear'] as BehavioralPalette[],
          contextState: 'extreme-stress' as ContextState,
          wounds: [
            {
              woundName: 'Betrayal',
              healingProgress: 45,
              active: true,
            },
            {
              woundName: 'Loss of control',
              healingProgress: 30,
              active: true,
            },
          ],
          transitionTrigger: 'Loses everything he thought he was fighting for',
        },
        {
          version: 'V4' as CharacterVersionLabel,
          storyPosition: 98,
          label: 'New Beginning',
          activeBehaviors: ['curiosity', 'attraction'] as BehavioralPalette[],
          contextState: 'baseline' as ContextState,
          wounds: [
            {
              woundName: 'Betrayal',
              healingProgress: 90,
              active: false,
            },
            {
              woundName: 'Loss of control',
              healingProgress: 70,
              active: false,
            },
          ],
          transitionTrigger: 'Realizes true strength comes from vulnerability',
        },
      ],
    },
  ],
  lastUpdated: new Date(),
  context: {
    bookId: 'book-1',
    bookTitle: 'The Fractured Mirror',
  },
};

export const useCharacterStateStore = create<CharacterStateState>()((set) => ({
  characterStateData: mockCharacterStateData,
  isLoading: false,

  setCharacterStateData: (data: CharacterStateData) =>
    set({ characterStateData: data }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  reset: () =>
    set({
      characterStateData: mockCharacterStateData,
      isLoading: false,
    }),
}));
