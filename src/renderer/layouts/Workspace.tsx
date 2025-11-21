import React, { useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TabBar } from '../components/TabBar';
import { PluginView } from '../components/PluginView';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkspaceProps {
  onNavigate?: (path: string) => void;
}

export function Workspace({ onNavigate }: WorkspaceProps) {
  const {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    reorderTabs,
    closeOtherTabs,
    closeAllTabs,
  } = useWorkspaceStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ctrl+Tab or Ctrl+PageDown - Next tab
      if (
        (event.ctrlKey && event.key === 'Tab' && !event.shiftKey) ||
        (event.ctrlKey && event.key === 'PageDown')
      ) {
        event.preventDefault();
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
      }

      // Ctrl+Shift+Tab or Ctrl+PageUp - Previous tab
      if (
        (event.ctrlKey && event.key === 'Tab' && event.shiftKey) ||
        (event.ctrlKey && event.key === 'PageUp')
      ) {
        event.preventDefault();
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        setActiveTab(tabs[prevIndex].id);
      }

      // Ctrl+W - Close active tab
      if (event.ctrlKey && event.key === 'w') {
        event.preventDefault();
        const tab = tabs.find((t) => t.id === activeTabId);
        if (tab?.closeable) {
          removeTab(activeTabId!);
        }
      }

      // Ctrl+Shift+T - Reopen last closed tab (placeholder for now)
      if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        // TODO: Implement reopen last closed tab
        console.log('Reopen last closed tab');
      }

      // Ctrl+1-9 - Switch to tab by index
      if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const index = parseInt(event.key) - 1;
        if (tabs[index]) {
          setActiveTab(tabs[index].id);
        }
      }
    },
    [tabs, activeTabId, setActiveTab, removeTab]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Navigation helper to open new tabs
  const handleNavigate = (path: string) => {
    // Map paths to tab configurations
    const pathToTabMap: Record<string, { id: string; title: string; icon: string }> = {
      '/projects': { id: 'projects', title: 'Projects', icon: 'FileText' },
      '/plugins': { id: 'plugins', title: 'Plugins', icon: 'Book' },
      '/pennames': { id: 'pennames', title: 'Pennames', icon: 'Users' },
      '/settings': { id: 'settings', title: 'Settings', icon: 'Settings' },
    };

    const tabConfig = pathToTabMap[path];
    if (tabConfig) {
      addTab({
        ...tabConfig,
        viewId: tabConfig.id,
        closeable: true,
      });
    }

    onNavigate?.(path);
  };

  // Navigate to previous/next tab
  const navigateToPreviousTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const navigateToNextTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar activeItem="dashboard" onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar with Navigation Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={navigateToPreviousTab}
            disabled={tabs.findIndex((t) => t.id === activeTabId) === 0}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous tab (Ctrl+Shift+Tab)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={navigateToNextTab}
            disabled={tabs.findIndex((t) => t.id === activeTabId) === tabs.length - 1}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next tab (Ctrl+Tab)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Tab Bar */}
          <div className="flex-1 overflow-hidden">
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={setActiveTab}
              onTabClose={removeTab}
              onTabReorder={reorderTabs}
            />
          </div>

          {/* Tab Actions Menu */}
          <div className="flex items-center gap-1 px-2">
            <button
              onClick={() => activeTabId && closeOtherTabs(activeTabId)}
              className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
              title="Close other tabs"
            >
              Close Others
            </button>
            <button
              onClick={closeAllTabs}
              className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
              title="Close all closeable tabs"
            >
              Close All
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {activeTab && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-sm">
            <span className="text-slate-400">/</span>
            {activeTab.pluginId && (
              <>
                <span className="text-purple-600 dark:text-purple-400">{activeTab.pluginId}</span>
                <span className="text-slate-400">/</span>
              </>
            )}
            <span className="text-slate-900 dark:text-slate-100 font-medium">
              {activeTab.title}
            </span>
          </div>
        )}

        {/* Active View */}
        <div className="flex-1 overflow-hidden">
          {activeTab ? (
            <PluginView tab={activeTab} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-600 dark:text-slate-400">No active tab</p>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Helper */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-500">
          <span className="font-medium">Keyboard Shortcuts:</span> Ctrl+Tab (Next) • Ctrl+Shift+Tab
          (Previous) • Ctrl+W (Close) • Ctrl+1-9 (Switch to tab)
        </div>
      </div>
    </div>
  );
}
