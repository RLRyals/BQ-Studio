/**
 * Workspace Configuration Store
 * Zustand store for workspace (file system) configuration state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkspaceConfig, WorkspaceValidationState } from '../../types/workspace';

interface WorkspaceConfigState {
  // Configuration
  config: WorkspaceConfig | null;
  isFirstRun: boolean;

  // Validation state
  isValid: boolean;
  validationState: WorkspaceValidationState;
  validationError?: string;

  // UI state
  isSetupWizardOpen: boolean;
  isLoading: boolean;

  // Actions
  setConfig: (config: WorkspaceConfig | null) => void;
  setIsFirstRun: (isFirstRun: boolean) => void;
  setValidationState: (state: WorkspaceValidationState, error?: string) => void;
  setSetupWizardOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useWorkspaceConfigStore = create<WorkspaceConfigState>()(
  persist(
    (set) => ({
      // Initial state
      config: null,
      isFirstRun: true,
      isValid: false,
      validationState: WorkspaceValidationState.NOT_CONFIGURED,
      isSetupWizardOpen: false,
      isLoading: false,

      // Actions
      setConfig: (config) =>
        set({
          config,
          isValid: config !== null,
          validationState: config
            ? WorkspaceValidationState.VALID
            : WorkspaceValidationState.NOT_CONFIGURED,
        }),

      setIsFirstRun: (isFirstRun) => set({ isFirstRun }),

      setValidationState: (validationState, validationError) =>
        set({
          validationState,
          validationError,
          isValid: validationState === WorkspaceValidationState.VALID,
        }),

      setSetupWizardOpen: (isSetupWizardOpen) => set({ isSetupWizardOpen }),

      setLoading: (isLoading) => set({ isLoading }),

      reset: () =>
        set({
          config: null,
          isFirstRun: true,
          isValid: false,
          validationState: WorkspaceValidationState.NOT_CONFIGURED,
          validationError: undefined,
          isSetupWizardOpen: false,
          isLoading: false,
        }),
    }),
    {
      name: 'bq-studio-workspace-config',
      // Only persist config, not UI state
      partialize: (state) => ({
        config: state.config,
      }),
    }
  )
);
