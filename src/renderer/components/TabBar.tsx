import React, { useRef, useEffect } from 'react';
import { X, Home, FileText, Book, Settings } from 'lucide-react';
import { Tab } from '../stores/workspaceStore';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder?: (startIndex: number, endIndex: number) => void;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  FileText,
  Book,
  Settings,
};

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose }: TabBarProps) {
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active tab when it changes
  useEffect(() => {
    if (activeTabId && tabBarRef.current) {
      const activeTabElement = tabBarRef.current.querySelector(
        `[data-tab-id="${activeTabId}"]`
      ) as HTMLElement;
      if (activeTabElement) {
        activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTabId]);

  return (
    <div
      ref={tabBarRef}
      className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const Icon = tab.icon ? iconMap[tab.icon] : FileText;

        return (
          <div
            key={tab.id}
            data-tab-id={tab.id}
            className={`
              group flex items-center gap-2 px-4 py-2 min-w-max border-r border-slate-200 dark:border-slate-800 cursor-pointer transition-colors
              ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-medium'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }
            `}
            onClick={() => onTabClick(tab.id)}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="text-sm">{tab.title}</span>
            {tab.closeable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="ml-1 p-0.5 rounded hover:bg-slate-300 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
