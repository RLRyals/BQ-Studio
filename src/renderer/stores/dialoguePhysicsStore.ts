import { create } from 'zustand';
import type { DialoguePhysicsData, DialogueLine } from '../components/npe/types';

interface DialoguePhysicsState {
  dialogueData: DialoguePhysicsData | null;
  isLoading: boolean;

  // Actions
  setDialogueData: (data: DialoguePhysicsData) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Mock data for development - will be replaced with MCP data in Phase 4
const mockDialogueData: DialoguePhysicsData = {
  sceneId: 'scene-12',
  sceneTitle: 'Confrontation in the Library',
  lines: [
    {
      id: 'line-1',
      sceneId: 'scene-12',
      lineNumber: 1,
      character: 'Sarah',
      text: "I can't believe you did this.",
      violations: [],
      hasSubtext: true,
      severity: null,
    },
    {
      id: 'line-2',
      sceneId: 'scene-12',
      lineNumber: 2,
      character: 'Marcus',
      text: "I can't believe you did this either.",
      violations: ['echolalia'],
      hasSubtext: false,
      severity: 'warning',
    },
    {
      id: 'line-3',
      sceneId: 'scene-12',
      lineNumber: 3,
      character: 'Sarah',
      text: "We need to talk about the project.",
      violations: ['no-subtext', 'cross-purpose'],
      hasSubtext: false,
      subtextSuggestion: 'Consider adding tension: What does Sarah really want? Is she avoiding the real issue?',
      severity: 'warning',
    },
    {
      id: 'line-4',
      sceneId: 'scene-12',
      lineNumber: 4,
      character: 'Marcus',
      text: "Fine. Let's talk.",
      violations: ['no-subtext'],
      hasSubtext: false,
      subtextSuggestion: 'Add layers: Is Marcus being defensive? Does he know what she really means?',
      severity: 'minor',
    },
    {
      id: 'line-5',
      sceneId: 'scene-12',
      lineNumber: 5,
      character: 'Sarah',
      text: "You promised me you wouldn't go behind my back.",
      violations: [],
      hasSubtext: true,
      severity: null,
    },
    {
      id: 'line-6',
      sceneId: 'scene-12',
      lineNumber: 6,
      character: 'Marcus',
      text: "I did what I had to do.",
      violations: [],
      hasSubtext: true,
      severity: null,
    },
    {
      id: 'line-7',
      sceneId: 'scene-12',
      lineNumber: 7,
      character: 'Sarah',
      text: "That's not good enough.",
      violations: ['no-subtext'],
      hasSubtext: false,
      subtextSuggestion: 'Layer the emotion: Is Sarah hurt, angry, or both? What is she not saying?',
      severity: 'minor',
    },
    {
      id: 'line-8',
      sceneId: 'scene-12',
      lineNumber: 8,
      character: 'Marcus',
      text: "That's not good enough for you maybe.",
      violations: ['echolalia'],
      hasSubtext: false,
      severity: 'warning',
    },
  ],
  echolaliaCount: 2,
  noSubtextCount: 4,
  crossPurposeCount: 1,
  overallScore: 78,
  lastUpdated: new Date(),
};

export const useDialoguePhysicsStore = create<DialoguePhysicsState>()((set) => ({
  dialogueData: mockDialogueData,
  isLoading: false,

  setDialogueData: (data: DialoguePhysicsData) =>
    set({ dialogueData: data }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  reset: () =>
    set({
      dialogueData: mockDialogueData,
      isLoading: false,
    }),
}));
