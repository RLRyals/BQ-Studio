import React from 'react';
import { Plus, FileText, Book, Zap } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  onClick: () => void;
  color: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    id: 'new-project',
    label: 'New Project',
    icon: Plus,
    description: 'Start a new series or book project',
    onClick: () => console.log('New Project'),
    color: 'purple',
  },
  {
    id: 'series-architect',
    label: 'Series Architect',
    icon: Book,
    description: 'Plan a 5-book series',
    onClick: () => console.log('Series Architect'),
    color: 'blue',
  },
  {
    id: 'manuscript-writer',
    label: 'Manuscript Writer',
    icon: FileText,
    description: 'Write chapter-by-chapter',
    onClick: () => console.log('Manuscript Writer'),
    color: 'green',
  },
  {
    id: 'quick-export',
    label: 'Quick Export',
    icon: Zap,
    description: 'Export recent work',
    onClick: () => console.log('Quick Export'),
    color: 'orange',
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    hover: 'hover:bg-purple-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    hover: 'hover:bg-blue-500/20',
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/20',
    hover: 'hover:bg-green-500/20',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
    hover: 'hover:bg-orange-500/20',
  },
};

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const colors = colorClasses[action.color] || colorClasses.purple;

        return (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`
              p-4 rounded-lg border transition-all
              ${colors.bg} ${colors.border} ${colors.hover}
              hover:shadow-lg hover:scale-105
              text-left
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${colors.text} mb-1`}>{action.label}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{action.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
