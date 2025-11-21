import React, { Suspense } from 'react';
import { Tab } from '../stores/workspaceStore';

interface PluginViewProps {
  tab: Tab;
}

// Loading fallback
function LoadingView() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 dark:text-slate-400">Loading plugin view...</p>
      </div>
    </div>
  );
}

// Placeholder views for different plugin types
function HomeView() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Welcome to BQ Studio
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        This is the home view. Select a plugin from the sidebar to get started.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Series Architect
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Plan your 5-book series with AI-powered tools
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Manuscript Writer
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Write chapters with AI assistance
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Penname Manager
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage multiple author identities and voice profiles
          </p>
        </div>
      </div>
    </div>
  );
}

function PluginPlaceholderView({ tab }: { tab: Tab }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4 p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-2xl text-white font-bold">
            {tab.title.charAt(0).toUpperCase()}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{tab.title}</h3>
        <p className="text-slate-600 dark:text-slate-400">
          {tab.pluginId ? `Plugin: ${tab.pluginId}` : 'Plugin view will render here'}
        </p>
        <div className="text-sm text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded p-4 max-w-md mx-auto">
          <p className="font-mono">Tab ID: {tab.id}</p>
          {tab.viewId && <p className="font-mono">View ID: {tab.viewId}</p>}
          {tab.metadata && (
            <p className="font-mono text-xs mt-2">Metadata: {JSON.stringify(tab.metadata)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function PluginView({ tab }: PluginViewProps) {
  // Route to appropriate view based on tab configuration
  const renderView = () => {
    // Home view
    if (tab.viewId === 'home') {
      return <HomeView />;
    }

    // Plugin views will be dynamically loaded here
    // For now, show placeholder
    return <PluginPlaceholderView tab={tab} />;
  };

  return (
    <Suspense fallback={<LoadingView />}>
      <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">{renderView()}</div>
    </Suspense>
  );
}
