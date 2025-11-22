import { create } from 'zustand';
import type { StakesPressureData } from '../components/npe/types';

interface StakesPressureState {
  pressureData: StakesPressureData | null;
  isLoading: boolean;

  // Actions
  setPressureData: (data: StakesPressureData) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Mock data for development - will be replaced with MCP data in Phase 4
const mockPressureData: StakesPressureData = {
  bookId: 'book-1',
  bookTitle: 'The Manuscript',
  threads: ['main', 'subplot-a', 'romance'],
  dataPoints: [
    // Main plot thread
    { storyPosition: 0, pressureLevel: 20, thread: 'main', hasViolation: false },
    { storyPosition: 10, pressureLevel: 35, thread: 'main', hasViolation: false },
    { storyPosition: 20, pressureLevel: 45, thread: 'main', hasViolation: false },
    { storyPosition: 25, pressureLevel: 60, thread: 'main', hasViolation: false },
    { storyPosition: 30, pressureLevel: 45, thread: 'main', hasViolation: true, violationMessage: 'Pressure drop without justification' },
    { storyPosition: 40, pressureLevel: 55, thread: 'main', hasViolation: false },
    { storyPosition: 50, pressureLevel: 70, thread: 'main', hasViolation: false },
    { storyPosition: 60, pressureLevel: 75, thread: 'main', hasViolation: false },
    { storyPosition: 70, pressureLevel: 85, thread: 'main', hasViolation: false },
    { storyPosition: 80, pressureLevel: 90, thread: 'main', hasViolation: false },
    { storyPosition: 90, pressureLevel: 95, thread: 'main', hasViolation: false },
    { storyPosition: 100, pressureLevel: 100, thread: 'main', hasViolation: false },

    // Subplot A
    { storyPosition: 5, pressureLevel: 10, thread: 'subplot-a', hasViolation: false },
    { storyPosition: 15, pressureLevel: 25, thread: 'subplot-a', hasViolation: false },
    { storyPosition: 30, pressureLevel: 40, thread: 'subplot-a', hasViolation: false },
    { storyPosition: 45, pressureLevel: 55, thread: 'subplot-a', hasViolation: false },
    { storyPosition: 60, pressureLevel: 70, thread: 'subplot-a', hasViolation: false },
    { storyPosition: 75, pressureLevel: 80, thread: 'subplot-a', hasViolation: false },
    { storyPosition: 85, pressureLevel: 85, thread: 'subplot-a', hasViolation: false },

    // Romance thread
    { storyPosition: 10, pressureLevel: 15, thread: 'romance', hasViolation: false },
    { storyPosition: 20, pressureLevel: 30, thread: 'romance', hasViolation: false },
    { storyPosition: 35, pressureLevel: 50, thread: 'romance', hasViolation: false },
    { storyPosition: 50, pressureLevel: 65, thread: 'romance', hasViolation: false },
    { storyPosition: 55, pressureLevel: 40, thread: 'romance', hasViolation: true, violationMessage: 'Escalation lacks cost or reduced options' },
    { storyPosition: 65, pressureLevel: 60, thread: 'romance', hasViolation: false },
    { storyPosition: 80, pressureLevel: 75, thread: 'romance', hasViolation: false },
    { storyPosition: 95, pressureLevel: 85, thread: 'romance', hasViolation: false },
  ],
  checkpoints: [
    {
      id: 'cp-1',
      storyPosition: 25,
      title: 'Inciting Incident',
      description: 'Protagonist discovers the conspiracy',
      thread: 'main',
    },
    {
      id: 'cp-2',
      storyPosition: 50,
      title: 'Midpoint Reversal',
      description: 'Ally betrays protagonist',
      thread: 'main',
    },
    {
      id: 'cp-3',
      storyPosition: 75,
      title: 'All is Lost',
      description: 'Evidence destroyed, deadline looms',
      thread: 'main',
    },
    {
      id: 'cp-4',
      storyPosition: 35,
      title: 'First Kiss',
      description: 'Romantic tension peaks',
      thread: 'romance',
    },
    {
      id: 'cp-5',
      storyPosition: 60,
      title: 'Subplot Resolution',
      description: 'Secondary conflict resolves',
      thread: 'subplot-a',
    },
  ],
  escalationValidations: [
    {
      position: 30,
      isValid: false,
      message: 'Pressure decreased from 60 to 45 without clear justification or story beat',
      severity: 'warning',
    },
    {
      position: 55,
      isValid: false,
      message: 'Romance pressure drop lacks emotional cost or character decision',
      severity: 'warning',
    },
  ],
  totalViolations: 2,
  lastUpdated: new Date(),
};

export const useStakesPressureStore = create<StakesPressureState>()((set) => ({
  pressureData: mockPressureData,
  isLoading: false,

  setPressureData: (data: StakesPressureData) =>
    set({ pressureData: data }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  reset: () =>
    set({
      pressureData: mockPressureData,
      isLoading: false,
    }),
}));
