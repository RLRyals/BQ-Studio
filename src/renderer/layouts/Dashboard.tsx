import React, { useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { Sidebar } from '../components/Sidebar';
import { Widget } from '../components/Widget';
import { QuickActions } from '../components/QuickActions';
import { TensionGraphWidget } from '../components/charts/TensionGraphWidget';
import { NPEComplianceScorecard } from '../components/npe';
import { Clock, TrendingUp, FileText, Book, Activity, CheckCircle2 } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface DashboardProps {
  onNavigate?: (path: string) => void;
}

// Sample data for widgets
const recentProjects = [
  { id: 1, title: 'Dark Romance Series', updated: '2 hours ago', status: 'In Progress' },
  { id: 2, title: 'Fantasy Epic Book 1', updated: '1 day ago', status: 'Completed' },
  { id: 3, title: 'Mystery Thriller', updated: '3 days ago', status: 'In Progress' },
];

const statistics = [
  { label: 'Total Projects', value: '12', trend: '+2' },
  { label: 'Words Written', value: '45.2K', trend: '+8.3K' },
  { label: 'Chapters', value: '156', trend: '+12' },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  // Default layout configuration for widgets
  const [layout] = useState<Layout[]>([
    { i: 'quick-actions', x: 0, y: 0, w: 12, h: 2, minH: 2, minW: 6 },
    { i: 'recent-projects', x: 0, y: 2, w: 8, h: 4, minH: 3, minW: 4 },
    { i: 'statistics', x: 8, y: 2, w: 4, h: 4, minH: 3, minW: 3 },
    { i: 'npe-compliance', x: 0, y: 6, w: 5, h: 7, minH: 6, minW: 4 },
    { i: 'tension-graph', x: 5, y: 6, w: 7, h: 7, minH: 5, minW: 6 },
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar activeItem="dashboard" onNavigate={onNavigate} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Welcome back!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Here's what's happening with your projects today.
            </p>
          </div>

          {/* Widget Grid */}
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={80}
            width={1200}
            isResizable={true}
            isDraggable={true}
            margin={[16, 16]}
            containerPadding={[0, 0]}
          >
            {/* Quick Actions Widget */}
            <div key="quick-actions">
              <Widget id="quick-actions" title="Quick Actions" icon={Clock}>
                <QuickActions />
              </Widget>
            </div>

            {/* Recent Projects Widget */}
            <div key="recent-projects">
              <Widget id="recent-projects" title="Recent Projects" icon={Book}>
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {project.title}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {project.updated}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'Completed'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                  View all projects →
                </button>
              </Widget>
            </div>

            {/* Statistics Widget */}
            <div key="statistics">
              <Widget id="statistics" title="Statistics" icon={TrendingUp}>
                <div className="space-y-4">
                  {statistics.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                        <span className="text-sm font-medium">{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Widget>
            </div>

            {/* NPE Compliance Scorecard Widget */}
            <div key="npe-compliance">
              <Widget id="npe-compliance" title="NPE Compliance" icon={CheckCircle2}>
                <NPEComplianceScorecard
                  onCategoryClick={(category) => {
                    console.log('Category clicked:', category);
                    // TODO: Navigate to detailed violations view
                  }}
                />
              </Widget>
            </div>

            {/* Tension Graph Widget */}
            <div key="tension-graph">
              <Widget id="tension-graph" title="Tension Axis" icon={Activity}>
                <TensionGraphWidget
                  config={{
                    width: 600,
                    height: 400,
                    showGrid: true,
                    enableDrag: true,
                    enableAddPoints: true,
                    enableDeletePoints: true,
                  }}
                />
              </Widget>
            </div>
          </GridLayout>
        </div>
      </main>
    </div>
  );
}
