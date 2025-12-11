/**
 * Agent Execution Store (Zustand)
 * State management for agent execution UI
 */

import { create } from 'zustand';
import type {
  ExecutionJob,
  ExecutionQueue,
  AgentExecutionEvent,
  ClaudeSession,
} from '../../core/agent-orchestration/types';

interface AgentExecutionState {
  // Queue state
  queue: ExecutionQueue | null;

  // Selected job for detail view
  selectedJobId: string | null;
  selectedJob: ExecutionJob | null;

  // Authentication state
  session: ClaudeSession | null;
  isAuthenticated: boolean;

  // Usage stats
  usageSummary: {
    totalTokens: number;
    monthlyUsage: number;
    usagePercentage: number;
  };

  // Actions
  setQueue: (queue: ExecutionQueue) => void;
  setSelectedJob: (jobId: string | null) => void;
  setSession: (session: ClaudeSession | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUsageSummary: (summary: { totalTokens: number; monthlyUsage: number; usagePercentage: number }) => void;
  handleEvent: (event: AgentExecutionEvent) => void;

  // API methods
  loadQueueStatus: () => Promise<void>;
  loadJob: (jobId: string) => Promise<void>;
  loadSession: () => Promise<void>;
  loadUsageSummary: () => Promise<void>;
  createJob: (seriesId: number, seriesName: string, skillName: string, userPrompt: string) => Promise<string>;
  pauseJob: (jobId: string) => Promise<void>;
  resumeJob: (jobId: string) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  authenticate: (sessionToken: string, userId: string, tier: 'pro' | 'max', expiresAt?: Date) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAgentExecutionStore = create<AgentExecutionState>((set, get) => ({
  // Initial state
  queue: null,
  selectedJobId: null,
  selectedJob: null,
  session: null,
  isAuthenticated: false,
  usageSummary: {
    totalTokens: 0,
    monthlyUsage: 0,
    usagePercentage: 0,
  },

  // Setters
  setQueue: (queue) => set({ queue }),

  setSelectedJob: (jobId) => {
    set({ selectedJobId: jobId });
    if (jobId) {
      get().loadJob(jobId);
    } else {
      set({ selectedJob: null });
    }
  },

  setSession: (session) => set({ session }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setUsageSummary: (summary) => set({ usageSummary: summary }),

  // Event handler
  handleEvent: (event) => {
    const state = get();

    switch (event.type) {
      case 'job-queued':
      case 'job-started':
      case 'job-paused':
      case 'job-resumed':
      case 'job-cancelled':
      case 'job-completed':
      case 'job-failed':
        // Reload queue status
        state.loadQueueStatus();

        // Update selected job if it's the one that changed
        if (state.selectedJobId === event.jobId) {
          state.loadJob(event.jobId);
        }
        break;

      case 'phase-progress':
      case 'tokens-used':
      case 'log':
        // Update selected job if it's the one that changed
        if (state.selectedJobId === event.jobId) {
          state.loadJob(event.jobId);
        }

        // Update usage summary on token usage
        if (event.type === 'tokens-used') {
          state.loadUsageSummary();
        }
        break;
    }
  },

  // API methods
  loadQueueStatus: async () => {
    try {
      const queue = await window.electron.ipcRenderer.invoke('agent-execution:get-queue-status');
      set({ queue });
    } catch (error) {
      console.error('Failed to load queue status:', error);
    }
  },

  loadJob: async (jobId: string) => {
    try {
      const job = await window.electron.ipcRenderer.invoke('agent-execution:get-job', jobId);
      if (job && get().selectedJobId === jobId) {
        set({ selectedJob: job });
      }
    } catch (error) {
      console.error('Failed to load job:', error);
    }
  },

  loadSession: async () => {
    try {
      const [session, isAuthenticated] = await Promise.all([
        window.electron.ipcRenderer.invoke('agent-execution:get-session-info'),
        window.electron.ipcRenderer.invoke('agent-execution:is-authenticated'),
      ]);

      set({ session, isAuthenticated });
    } catch (error) {
      console.error('Failed to load session:', error);
      set({ session: null, isAuthenticated: false });
    }
  },

  loadUsageSummary: async () => {
    try {
      const summary = await window.electron.ipcRenderer.invoke('agent-execution:get-usage-summary');
      set({ usageSummary: summary });
    } catch (error) {
      console.error('Failed to load usage summary:', error);
    }
  },

  createJob: async (seriesId: number, seriesName: string, skillName: string, userPrompt: string) => {
    try {
      const jobId = await window.electron.ipcRenderer.invoke('agent-execution:create-job', {
        seriesId,
        seriesName,
        skillName,
        userPrompt,
      });

      // Reload queue
      await get().loadQueueStatus();

      return jobId;
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  },

  pauseJob: async (jobId: string) => {
    try {
      await window.electron.ipcRenderer.invoke('agent-execution:pause-job', jobId);
      await get().loadQueueStatus();
    } catch (error) {
      console.error('Failed to pause job:', error);
      throw error;
    }
  },

  resumeJob: async (jobId: string) => {
    try {
      await window.electron.ipcRenderer.invoke('agent-execution:resume-job', jobId);
      await get().loadQueueStatus();
    } catch (error) {
      console.error('Failed to resume job:', error);
      throw error;
    }
  },

  cancelJob: async (jobId: string) => {
    try {
      await window.electron.ipcRenderer.invoke('agent-execution:cancel-job', jobId);
      await get().loadQueueStatus();
    } catch (error) {
      console.error('Failed to cancel job:', error);
      throw error;
    }
  },

  authenticate: async (sessionToken: string, userId: string, tier: 'pro' | 'max', expiresAt?: Date) => {
    try {
      await window.electron.ipcRenderer.invoke('agent-execution:authenticate', {
        sessionToken,
        userId,
        subscriptionTier: tier,
        expiresAt: expiresAt?.toISOString(),
      });

      await get().loadSession();
    } catch (error) {
      console.error('Failed to authenticate:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await window.electron.ipcRenderer.invoke('agent-execution:logout');
      set({ session: null, isAuthenticated: false });
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  },
}));

// Setup event listener
if (typeof window !== 'undefined' && window.electron) {
  window.electron.ipcRenderer.on('agent-execution:event', (_event, data: AgentExecutionEvent) => {
    useAgentExecutionStore.getState().handleEvent(data);
  });
}
