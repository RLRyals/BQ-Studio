import { create } from 'zustand';
import type { NPEComplianceData, NPECategoryScore, NPECategory } from '../components/npe/types';

interface NPEComplianceState {
  complianceData: NPEComplianceData | null;
  isLoading: boolean;

  // Actions
  setComplianceData: (data: NPEComplianceData) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Mock data for development - will be replaced with MCP data in Phase 4
const mockComplianceData: NPEComplianceData = {
  overallScore: 86,
  categories: [
    {
      category: 'plot-mechanics' as NPECategory,
      displayName: 'Plot Mechanics',
      score: 85,
      violations: 3,
      criticalCount: 0,
      warningCount: 2,
      minorCount: 1,
    },
    {
      category: 'character-logic' as NPECategory,
      displayName: 'Character Logic',
      score: 100,
      violations: 0,
      criticalCount: 0,
      warningCount: 0,
      minorCount: 0,
    },
    {
      category: 'scene-architecture' as NPECategory,
      displayName: 'Scene Architecture',
      score: 72,
      violations: 5,
      criticalCount: 1,
      warningCount: 3,
      minorCount: 1,
    },
    {
      category: 'dialogue-physics' as NPECategory,
      displayName: 'Dialogue Physics',
      score: 91,
      violations: 2,
      criticalCount: 0,
      warningCount: 1,
      minorCount: 1,
    },
    {
      category: 'pacing' as NPECategory,
      displayName: 'Pacing',
      score: 83,
      violations: 3,
      criticalCount: 0,
      warningCount: 2,
      minorCount: 1,
    },
    {
      category: 'pov-physics' as NPECategory,
      displayName: 'POV Physics',
      score: 88,
      violations: 2,
      criticalCount: 0,
      warningCount: 1,
      minorCount: 1,
    },
    {
      category: 'transitions' as NPECategory,
      displayName: 'Transitions',
      score: 86,
      violations: 2,
      criticalCount: 0,
      warningCount: 1,
      minorCount: 1,
    },
    {
      category: 'information-economy' as NPECategory,
      displayName: 'Information Economy',
      score: 75,
      violations: 4,
      criticalCount: 0,
      warningCount: 3,
      minorCount: 1,
    },
    {
      category: 'stakes-pressure' as NPECategory,
      displayName: 'Stakes/Pressure',
      score: 82,
      violations: 3,
      criticalCount: 0,
      warningCount: 2,
      minorCount: 1,
    },
    {
      category: 'offstage-narrative' as NPECategory,
      displayName: 'Offstage Narrative',
      score: 95,
      violations: 1,
      criticalCount: 0,
      warningCount: 0,
      minorCount: 1,
    },
  ],
  totalViolations: 25,
  criticalViolations: 1,
  warningViolations: 15,
  minorViolations: 9,
  lastUpdated: new Date(),
  context: {
    bookId: 'book-1',
    bookTitle: 'Book 1',
    chapterId: 'chapter-5',
    chapterTitle: 'Chapter 5',
  },
};

export const useNPEComplianceStore = create<NPEComplianceState>()((set) => ({
  complianceData: mockComplianceData,
  isLoading: false,

  setComplianceData: (data: NPEComplianceData) =>
    set({ complianceData: data }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  reset: () =>
    set({
      complianceData: mockComplianceData,
      isLoading: false,
    }),
}));
