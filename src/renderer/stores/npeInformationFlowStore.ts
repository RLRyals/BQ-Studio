import { create } from 'zustand';
import type {
  NPEInformationFlowData,
  InformationReveal,
  CharacterKnowledge,
  InformationIssue,
} from '../components/npe/types';

interface NPEInformationFlowState {
  informationFlowData: NPEInformationFlowData | null;
  isLoading: boolean;

  // Actions
  setInformationFlowData: (data: NPEInformationFlowData) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Mock data for development - will be replaced with MCP data in Phase 4
const mockInformationFlowData: NPEInformationFlowData = {
  reveals: [
    {
      id: 'reveal-1',
      sceneNumber: 1,
      timestamp: 5,
      information: 'Sarah has been lying about her past',
      impactLevel: 'medium',
      changedBehavior: false,
      affectedCharacters: ['Reader'],
    },
    {
      id: 'reveal-2',
      sceneNumber: 2,
      timestamp: 15,
      information: "The company is hiding financial irregularities",
      impactLevel: 'high',
      changedBehavior: true,
      affectedCharacters: ['Marcus', 'Reader'],
    },
    {
      id: 'reveal-3',
      sceneNumber: 3,
      timestamp: 25,
      information: 'Marcus knows about Sarah\'s secret',
      impactLevel: 'critical',
      changedBehavior: true,
      affectedCharacters: ['Marcus', 'Sarah', 'Reader'],
    },
    {
      id: 'reveal-4',
      sceneNumber: 4,
      timestamp: 35,
      information: 'The locked room contains evidence',
      impactLevel: 'high',
      changedBehavior: true,
      affectedCharacters: ['Sarah', 'Reader'],
    },
    {
      id: 'reveal-5',
      sceneNumber: 5,
      timestamp: 45,
      information: 'David was working with the antagonist all along',
      impactLevel: 'critical',
      changedBehavior: true,
      affectedCharacters: ['Marcus', 'Sarah', 'David', 'Reader'],
    },
    {
      id: 'reveal-6',
      sceneNumber: 6,
      timestamp: 55,
      information: 'The evidence can exonerate Sarah',
      impactLevel: 'critical',
      changedBehavior: true,
      affectedCharacters: ['Sarah', 'Marcus', 'Reader'],
    },
    {
      id: 'reveal-7',
      sceneNumber: 7,
      timestamp: 65,
      information: 'Time is running out to act',
      impactLevel: 'medium',
      changedBehavior: true,
      affectedCharacters: ['Marcus', 'Sarah', 'Reader'],
    },
    {
      id: 'reveal-8',
      sceneNumber: 8,
      timestamp: 75,
      information: 'The antagonist knows they\'re coming',
      impactLevel: 'high',
      changedBehavior: true,
      affectedCharacters: ['Marcus', 'Sarah', 'Reader'],
    },
    {
      id: 'reveal-9',
      sceneNumber: 9,
      timestamp: 85,
      information: 'Sarah has a backup plan',
      impactLevel: 'high',
      changedBehavior: true,
      affectedCharacters: ['Sarah', 'Marcus', 'Reader'],
    },
    {
      id: 'reveal-10',
      sceneNumber: 10,
      timestamp: 95,
      information: 'The truth sets everyone free',
      impactLevel: 'critical',
      changedBehavior: true,
      affectedCharacters: ['Everyone', 'Reader'],
    },
  ] as InformationReveal[],
  characterKnowledge: [
    {
      characterName: 'Sarah',
      knownInformation: [
        'Her own past',
        'The evidence location',
        'Marcus is trustworthy',
        'David is a traitor',
        'The backup plan',
      ],
      unknownCriticalInfo: ['The antagonist knows their plan (until Scene 8)'],
    },
    {
      characterName: 'Marcus',
      knownInformation: [
        'Company irregularities',
        "Sarah's secret",
        'David is a traitor',
        'Time constraints',
        'The antagonist\'s awareness',
      ],
      unknownCriticalInfo: ['Sarah has a backup plan (until Scene 9)'],
    },
    {
      characterName: 'David',
      knownInformation: [
        'All character plans',
        'The antagonist\'s goals',
        'Evidence location',
        'Company secrets',
      ],
      unknownCriticalInfo: ['Sarah suspects him (until Scene 5)', 'Sarah\'s backup plan'],
    },
    {
      characterName: 'Reader',
      knownInformation: [
        'All revealed information',
        'Character motivations',
        'Hidden connections',
      ],
      unknownCriticalInfo: ['Future plot twists (by design)'],
    },
  ] as CharacterKnowledge[],
  issues: [
    {
      id: 'issue-1',
      type: 'premature-reveal',
      severity: 'warning',
      description:
        'Scene 1 reveals Sarah\'s past lies, but this information doesn\'t matter until Scene 3 when Marcus confronts her',
      revealId: 'reveal-1',
    },
    {
      id: 'issue-2',
      type: 'missing-impact',
      severity: 'minor',
      description:
        'Scene 7\'s time pressure reveal doesn\'t immediately change character behavior - they proceed with the same plan',
      revealId: 'reveal-7',
    },
  ] as InformationIssue[],
  lastUpdated: new Date(),
  context: {
    bookId: 'book-1',
    bookTitle: 'Book 1',
    chapterId: 'chapter-5',
    chapterTitle: 'Chapter 5',
  },
};

export const useNPEInformationFlowStore = create<NPEInformationFlowState>()((set) => ({
  informationFlowData: mockInformationFlowData,
  isLoading: false,

  setInformationFlowData: (data: NPEInformationFlowData) => set({ informationFlowData: data }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  reset: () =>
    set({
      informationFlowData: mockInformationFlowData,
      isLoading: false,
    }),
}));
