/**
 * Agent Execution Dashboard
 * Main UI for managing agent skill executions across multiple series
 */

import React, { useEffect, useState } from 'react';
import { useAgentExecutionStore } from '../../stores/agentExecutionStore';
import { NewExecutionPanel } from './NewExecutionPanel';
import { QueuePanel } from './QueuePanel';
import { CLISetupPrompt } from './CLISetupPrompt';
import { ExecutionDetailView } from './ExecutionDetailView';

export const AgentExecutionDashboard: React.FC = () => {
  const { isAuthenticated, selectedJobId, loadQueueStatus, loadSession, loadUsageSummary } =
    useAgentExecutionStore();

  const [cliSetupComplete, setCLISetupComplete] = useState(false);

  // Load initial data
  useEffect(() => {
    loadSession();
    loadQueueStatus();
    loadUsageSummary();

    // Refresh queue every 5 seconds
    const interval = setInterval(() => {
      loadQueueStatus();
      loadUsageSummary();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Show CLI setup prompt if not installed
  if (!cliSetupComplete) {
    return <CLISetupPrompt onComplete={() => setCLISetupComplete(true)} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please authenticate with your Claude Pro or Max subscription to use agent execution.
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Authenticate with Claude
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agent Execution
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage headless Claude Code skill executions across your series
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <UsageIndicator />
            <SessionInfo />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <NewExecutionPanel />
        <QueuePanel />
      </main>

      {/* Execution Detail Modal */}
      {selectedJobId && <ExecutionDetailView />}
    </div>
  );
};

/**
 * Usage Indicator Component
 */
const UsageIndicator: React.FC = () => {
  const { usageSummary, session } = useAgentExecutionStore();

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="text-right">
        <div className="text-xs text-gray-500 dark:text-gray-400">Monthly Usage</div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {usageSummary.monthlyUsage.toLocaleString()} tokens
        </div>
      </div>
      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${getUsageColor(usageSummary.usagePercentage)}`}
          style={{ width: `${Math.min(usageSummary.usagePercentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {usageSummary.usagePercentage.toFixed(1)}%
      </div>
    </div>
  );
};

/**
 * Session Info Component
 */
const SessionInfo: React.FC = () => {
  const { session, logout } = useAgentExecutionStore();

  if (!session) return null;

  return (
    <div className="flex items-center space-x-3">
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {session.userId}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          Claude {session.subscriptionTier}
        </div>
      </div>
      <button
        onClick={logout}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};
