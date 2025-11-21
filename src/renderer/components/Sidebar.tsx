import React from 'react';
import { Home, FolderOpen, Settings, Package, Users, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (path: string) => void;
}

const defaultNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/projects' },
  { id: 'plugins', label: 'Plugins', icon: Package, path: '/plugins' },
  { id: 'pennames', label: 'Pennames', icon: Users, path: '/pennames' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar({ activeItem = 'dashboard', onNavigate }: SidebarProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <aside className="w-64 h-screen bg-slate-900 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-900 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-800 dark:border-slate-900">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          BQ Studio
        </h1>
        <p className="text-xs text-slate-400 mt-1">Publishing House ERP</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {defaultNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 dark:hover:bg-slate-900'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-purple-500 text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-slate-800 dark:border-slate-900">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 dark:hover:bg-slate-900 transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5" />
              <span className="font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              <span className="font-medium">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-slate-800 dark:border-slate-900">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            BQ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">BQ Studio</p>
            <p className="text-xs text-slate-400 truncate">Version 0.1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
