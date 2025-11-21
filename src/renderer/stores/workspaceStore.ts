import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tab {
  id: string;
  title: string;
  pluginId?: string;
  viewId?: string;
  icon?: string;
  closeable: boolean;
  metadata?: Record<string, unknown>;
}

interface WorkspaceState {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  reorderTabs: (startIndex: number, endIndex: number) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      tabs: [
        {
          id: 'home',
          title: 'Home',
          viewId: 'home',
          icon: 'Home',
          closeable: false,
        },
      ],
      activeTabId: 'home',

      addTab: (tab) =>
        set((state) => {
          // Check if tab already exists
          const existingTab = state.tabs.find((t) => t.id === tab.id);
          if (existingTab) {
            return { activeTabId: tab.id };
          }
          return {
            tabs: [...state.tabs, tab],
            activeTabId: tab.id,
          };
        }),

      removeTab: (tabId) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === tabId);
          if (!tab?.closeable) return state;

          const newTabs = state.tabs.filter((t) => t.id !== tabId);
          let newActiveTabId = state.activeTabId;

          // If removing active tab, switch to another tab
          if (state.activeTabId === tabId) {
            const currentIndex = state.tabs.findIndex((t) => t.id === tabId);
            newActiveTabId =
              newTabs[currentIndex]?.id || newTabs[currentIndex - 1]?.id || newTabs[0]?.id || null;
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveTabId,
          };
        }),

      setActiveTab: (tabId) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === tabId);
          if (!tab) return state;
          return { activeTabId: tabId };
        }),

      updateTab: (tabId, updates) =>
        set((state) => ({
          tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab)),
        })),

      reorderTabs: (startIndex, endIndex) =>
        set((state) => {
          const newTabs = Array.from(state.tabs);
          const [removed] = newTabs.splice(startIndex, 1);
          newTabs.splice(endIndex, 0, removed);
          return { tabs: newTabs };
        }),

      closeAllTabs: () =>
        set((state) => {
          const nonCloseableTabs = state.tabs.filter((t) => !t.closeable);
          return {
            tabs: nonCloseableTabs,
            activeTabId: nonCloseableTabs[0]?.id || null,
          };
        }),

      closeOtherTabs: (tabId) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === tabId);
          if (!tab) return state;

          const newTabs = state.tabs.filter((t) => t.id === tabId || !t.closeable);
          return {
            tabs: newTabs,
            activeTabId: tabId,
          };
        }),
    }),
    {
      name: 'bq-studio-workspace',
    }
  )
);
