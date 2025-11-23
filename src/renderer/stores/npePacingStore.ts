import { create } from 'zustand';
import type {
  NPEPacingData,
  ScenePacing,
  EnergyModulation,
  PacingIssue,
  PacingRecommendation,
} from '../components/npe/types';

interface NPEPacingState {
  pacingData: NPEPacingData | null;
  isLoading: boolean;

  // Actions
  setPacingData: (data: NPEPacingData) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Mock data for development - will be replaced with MCP data in Phase 4
const mockPacingData: NPEPacingData = {
  scenes: [
    {
      sceneId: 'scene-1',
      sceneName: 'Opening - Morning Coffee',
      sceneNumber: 1,
      wordCount: 850,
      type: 'micro',
      timeTreatment: 'expand',
      energyLevel: 35,
    },
    {
      sceneId: 'scene-2',
      sceneName: 'Confrontation at Office',
      sceneNumber: 2,
      wordCount: 2400,
      type: 'medium',
      timeTreatment: 'compress',
      energyLevel: 75,
    },
    {
      sceneId: 'scene-3',
      sceneName: 'Quiet Reflection',
      sceneNumber: 3,
      wordCount: 950,
      type: 'micro',
      timeTreatment: 'expand',
      energyLevel: 25,
    },
    {
      sceneId: 'scene-4',
      sceneName: 'The Discovery',
      sceneNumber: 4,
      wordCount: 1800,
      type: 'medium',
      timeTreatment: 'neutral',
      energyLevel: 60,
    },
    {
      sceneId: 'scene-5',
      sceneName: 'Preparation',
      sceneNumber: 5,
      wordCount: 1100,
      type: 'micro',
      timeTreatment: 'compress',
      energyLevel: 50,
    },
    {
      sceneId: 'scene-6',
      sceneName: 'The Showdown',
      sceneNumber: 6,
      wordCount: 4200,
      type: 'centerpiece',
      timeTreatment: 'expand',
      energyLevel: 95,
    },
    {
      sceneId: 'scene-7',
      sceneName: 'Aftermath',
      sceneNumber: 7,
      wordCount: 900,
      type: 'micro',
      timeTreatment: 'neutral',
      energyLevel: 40,
    },
    {
      sceneId: 'scene-8',
      sceneName: 'New Plan',
      sceneNumber: 8,
      wordCount: 1600,
      type: 'medium',
      timeTreatment: 'compress',
      energyLevel: 65,
    },
    {
      sceneId: 'scene-9',
      sceneName: 'Unexpected Turn',
      sceneNumber: 9,
      wordCount: 2100,
      type: 'medium',
      timeTreatment: 'expand',
      energyLevel: 80,
    },
    {
      sceneId: 'scene-10',
      sceneName: 'Resolution',
      sceneNumber: 10,
      wordCount: 1200,
      type: 'micro',
      timeTreatment: 'neutral',
      energyLevel: 45,
    },
  ] as ScenePacing[],
  energyModulation: [
    { sceneNumber: 1, tension: 30, volume: 20, conflict: 25 },
    { sceneNumber: 2, tension: 75, volume: 80, conflict: 85 },
    { sceneNumber: 3, tension: 20, volume: 15, conflict: 10 },
    { sceneNumber: 4, tension: 60, volume: 50, conflict: 55 },
    { sceneNumber: 5, tension: 45, volume: 40, conflict: 50 },
    { sceneNumber: 6, tension: 95, volume: 90, conflict: 95 },
    { sceneNumber: 7, tension: 35, volume: 30, conflict: 20 },
    { sceneNumber: 8, tension: 65, volume: 60, conflict: 70 },
    { sceneNumber: 9, tension: 80, volume: 75, conflict: 80 },
    { sceneNumber: 10, tension: 40, volume: 35, conflict: 30 },
  ] as EnergyModulation[],
  issues: [
    {
      id: 'issue-1',
      type: 'monotony',
      severity: 'warning',
      description: 'Scenes 1, 3, 5, 7, and 10 are all similar length (850-1200 words)',
      affectedScenes: [1, 3, 5, 7, 10],
    },
    {
      id: 'issue-2',
      type: 'imbalance',
      severity: 'minor',
      description: 'Only one centerpiece scene - consider adding another major moment',
      affectedScenes: [6],
    },
  ] as PacingIssue[],
  recommendations: [
    {
      id: 'rec-1',
      sceneNumber: 3,
      recommendation: 'Consider expanding this quiet moment',
      reasoning:
        'After the intense confrontation in scene 2, readers need more breathing room. Expand from 950 to 1400-1600 words to let the emotional impact settle.',
    },
    {
      id: 'rec-2',
      sceneNumber: 5,
      recommendation: 'Compress this preparation scene',
      reasoning:
        'This scene currently drags before the major showdown. Cut to 600-800 words to maintain momentum toward scene 6.',
    },
    {
      id: 'rec-3',
      sceneNumber: 8,
      recommendation: 'Vary the energy pattern',
      reasoning:
        'The energy levels show a predictable up-down pattern. Consider making this scene quieter (energy 45-50) to create more dynamic variation.',
    },
  ] as PacingRecommendation[],
  lastUpdated: new Date(),
  context: {
    bookId: 'book-1',
    bookTitle: 'Book 1',
    chapterId: 'chapter-5',
    chapterTitle: 'Chapter 5',
  },
};

export const useNPEPacingStore = create<NPEPacingState>()((set) => ({
  pacingData: mockPacingData,
  isLoading: false,

  setPacingData: (data: NPEPacingData) => set({ pacingData: data }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  reset: () =>
    set({
      pacingData: mockPacingData,
      isLoading: false,
    }),
}));
