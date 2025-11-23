import { create } from 'zustand';
import type {
  CausalityChainData,
  CausalityNode,
  CausalityLink,
} from '../components/npe/types';

interface CausalityChainState {
  chainData: CausalityChainData | null;
  isLoading: boolean;
  selectedNodeId: string | null;

  // Actions
  setChainData: (data: CausalityChainData) => void;
  setLoading: (loading: boolean) => void;
  setSelectedNode: (nodeId: string | null) => void;
  updateFilters: (filters: Partial<CausalityChainData['filters']>) => void;
  reset: () => void;
}

// Mock data for development - will be replaced with MCP data in Phase 4
const mockChainData: CausalityChainData = {
  nodes: [
    // Chapter 3 - Decision point
    {
      id: 'node-1',
      type: 'decision',
      label: 'Trust the stranger',
      description: 'Sarah decides to trust the mysterious stranger despite her instincts',
      characterId: 'char-sarah',
      characterName: 'Sarah',
      chapterId: 'ch-3',
      sceneId: 'scene-3-2',
      x: 100,
      y: 250,
    },
    // Direct consequence
    {
      id: 'node-2',
      type: 'consequence',
      label: 'Gains key information',
      description: 'The stranger reveals crucial information about the conspiracy',
      characterId: 'char-sarah',
      characterName: 'Sarah',
      chapterId: 'ch-3',
      sceneId: 'scene-3-4',
      x: 250,
      y: 150,
    },
    // Delayed consequence
    {
      id: 'node-3',
      type: 'consequence',
      label: 'Tracked by enemies',
      description: 'The stranger was being followed, leading enemies to Sarah',
      characterId: 'char-sarah',
      characterName: 'Sarah',
      chapterId: 'ch-5',
      sceneId: 'scene-5-1',
      x: 250,
      y: 350,
    },
    // Chapter 5 - Another decision
    {
      id: 'node-4',
      type: 'decision',
      label: 'Confronts her partner',
      description: 'Sarah confronts Marcus about his suspicious behavior',
      characterId: 'char-sarah',
      characterName: 'Sarah',
      chapterId: 'ch-5',
      sceneId: 'scene-5-3',
      x: 400,
      y: 150,
    },
    // Violation - effect without character agency
    {
      id: 'node-5',
      type: 'violation',
      label: 'NPE Violation: Deus Ex Machina',
      description: 'The police arrive just in time, but Sarah never called them',
      chapterId: 'ch-5',
      sceneId: 'scene-5-5',
      x: 400,
      y: 350,
    },
    // Consequence from confrontation
    {
      id: 'node-6',
      type: 'consequence',
      label: 'Marcus reveals truth',
      description: 'Marcus confesses he has been protecting Sarah all along',
      characterId: 'char-marcus',
      characterName: 'Marcus',
      chapterId: 'ch-5',
      sceneId: 'scene-5-4',
      x: 550,
      y: 150,
    },
    // Chapter 7 - Decision based on Marcus's revelation
    {
      id: 'node-7',
      type: 'decision',
      label: 'Trusts Marcus plan',
      description: 'Sarah decides to follow Marcus\'s plan to expose the conspiracy',
      characterId: 'char-sarah',
      characterName: 'Sarah',
      chapterId: 'ch-7',
      sceneId: 'scene-7-2',
      x: 700,
      y: 250,
    },
  ],
  links: [
    // Direct causality - decision to consequence
    {
      id: 'link-1',
      sourceId: 'node-1',
      targetId: 'node-2',
      type: 'direct',
      label: 'Immediately after',
      strength: 90,
    },
    // Delayed causality - decision to later consequence
    {
      id: 'link-2',
      sourceId: 'node-1',
      targetId: 'node-3',
      type: 'delayed',
      label: '2 chapters later',
      strength: 75,
    },
    // Direct causality - consequence to new decision
    {
      id: 'link-3',
      sourceId: 'node-2',
      targetId: 'node-4',
      type: 'direct',
      label: 'Motivated by new info',
      strength: 85,
    },
    // Broken causality - no clear cause
    {
      id: 'link-4',
      sourceId: 'node-3',
      targetId: 'node-5',
      type: 'broken',
      label: 'No character action',
      strength: 20,
    },
    // Direct causality - decision to consequence
    {
      id: 'link-5',
      sourceId: 'node-4',
      targetId: 'node-6',
      type: 'direct',
      label: 'Direct result',
      strength: 95,
    },
    // Direct causality - consequence to decision
    {
      id: 'link-6',
      sourceId: 'node-6',
      targetId: 'node-7',
      type: 'direct',
      label: 'Based on truth',
      strength: 90,
    },
  ],
  filters: {
    characterIds: [],
    chapterIds: [],
    plotThreads: [],
  },
  lastUpdated: new Date(),
};

export const useCausalityChainStore = create<CausalityChainState>()((set) => ({
  chainData: mockChainData,
  isLoading: false,
  selectedNodeId: null,

  setChainData: (data: CausalityChainData) => set({ chainData: data }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setSelectedNode: (nodeId: string | null) => set({ selectedNodeId: nodeId }),

  updateFilters: (filters: Partial<CausalityChainData['filters']>) =>
    set((state) => ({
      chainData: state.chainData
        ? {
            ...state.chainData,
            filters: { ...state.chainData.filters, ...filters },
          }
        : null,
    })),

  reset: () =>
    set({
      chainData: mockChainData,
      isLoading: false,
      selectedNodeId: null,
    }),
}));
