import React, { useState } from 'react';
import { TensionAxisGraph } from '../charts/TensionAxisGraph';
import { NPEComplianceScorecard } from './NPEComplianceScorecard';
import { CausalityChainGraph } from './CausalityChainGraph';
import { CharacterStateTracker } from './CharacterStateTracker';
import { DecisionTreeVisualizer } from './DecisionTreeVisualizer';
import { PacingAnalyzer } from './PacingAnalyzer';
import { InformationFlowGraph } from './InformationFlowGraph';
import { POVBiasTracker } from './POVBiasTracker';
import { DialoguePhysicsMonitor } from './DialoguePhysicsMonitor';
import { StakesPressureGauge } from './StakesPressureGauge';

interface NPEDashboardProps {
  bookId?: string;
  chapterId?: string;
  characterId?: string;
}

type ViewMode = 'grid' | 'tabs';

const NPE_WIDGETS = [
  {
    id: 'compliance',
    name: 'NPE Compliance',
    component: NPEComplianceScorecard,
    featured: true,
  },
  {
    id: 'tension',
    name: 'Tension Graph',
    component: TensionAxisGraph,
  },
  {
    id: 'causality',
    name: 'Causality Chain',
    component: CausalityChainGraph,
  },
  {
    id: 'character-state',
    name: 'Character State',
    component: CharacterStateTracker,
  },
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    component: DecisionTreeVisualizer,
  },
  {
    id: 'pacing',
    name: 'Pacing',
    component: PacingAnalyzer,
  },
  {
    id: 'information-flow',
    name: 'Information Flow',
    component: InformationFlowGraph,
  },
  {
    id: 'pov-bias',
    name: 'POV Bias',
    component: POVBiasTracker,
  },
  {
    id: 'dialogue',
    name: 'Dialogue Physics',
    component: DialoguePhysicsMonitor,
  },
  {
    id: 'stakes-pressure',
    name: 'Stakes/Pressure',
    component: StakesPressureGauge,
  },
] as const;

export const NPEDashboard: React.FC<NPEDashboardProps> = ({
  bookId,
  chapterId,
  characterId,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<string>('compliance');
  const [selectedBookId, setSelectedBookId] = useState(bookId || '');
  const [selectedChapterId, setSelectedChapterId] = useState(chapterId || '');
  const [selectedCharacterId, setSelectedCharacterId] = useState(characterId || '');

  const handleExportReport = () => {
    // TODO: Implement NPE report export
    console.log('Exporting NPE report...');
    alert('NPE Report Export - Coming Soon');
  };

  const renderWidget = (widget: typeof NPE_WIDGETS[number]) => {
    const Component = widget.component as any;
    return (
      <div
        key={widget.id}
        className={`bg-gray-800 rounded-lg p-4 ${widget.featured ? 'col-span-2' : ''}`}
      >
        <h3 className="text-lg font-semibold text-gray-100 mb-4">{widget.name}</h3>
        <Component
          bookId={selectedBookId}
          chapterId={selectedChapterId}
          characterId={selectedCharacterId}
        />
      </div>
    );
  };

  return (
    <div className="npe-dashboard w-full h-full bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-100">
            Narrative Physics Engine Dashboard
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleExportReport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Export NPE Report
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-4 items-center bg-gray-800 p-4 rounded-lg">
          <div className="flex-1">
            <label htmlFor="book-select" className="block text-sm text-gray-400 mb-1">
              Book
            </label>
            <input
              id="book-select"
              type="text"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              placeholder="Enter Book ID"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="chapter-select" className="block text-sm text-gray-400 mb-1">
              Chapter (Optional)
            </label>
            <input
              id="chapter-select"
              type="text"
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              placeholder="Enter Chapter ID"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="character-select" className="block text-sm text-gray-400 mb-1">
              Character (Optional)
            </label>
            <input
              id="character-select"
              type="text"
              value={selectedCharacterId}
              onChange={(e) => setSelectedCharacterId(e.target.value)}
              placeholder="Enter Character ID"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Grid View"
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('tabs')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'tabs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Tab View"
            >
              Tabs
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {NPE_WIDGETS.map(renderWidget)}
        </div>
      ) : (
        /* Tab Layout */
        <div className="tabs-container">
          {/* Tab Headers */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {NPE_WIDGETS.map((widget) => (
              <button
                key={widget.id}
                onClick={() => setActiveTab(widget.id)}
                className={`px-4 py-2 rounded-t-lg whitespace-nowrap transition-colors ${
                  activeTab === widget.id
                    ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {widget.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800 rounded-lg p-6">
            {NPE_WIDGETS.map((widget) => {
              if (widget.id !== activeTab) return null;
              const Component = widget.component as any;
              return (
                <div key={widget.id}>
                  <Component
                    bookId={selectedBookId}
                    chapterId={selectedChapterId}
                    characterId={selectedCharacterId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 text-sm text-gray-400 bg-gray-800 p-4 rounded-lg">
        <p className="font-semibold mb-2">About the NPE Dashboard:</p>
        <p>
          The Narrative Physics Engine (NPE) treats stories as simulations with enforced
          physics rules. This dashboard visualizes NPE compliance across 10 core categories,
          helping you maintain causality, character consistency, and narrative coherence.
        </p>
        <p className="mt-2">
          Enter a Book ID to load real data from your MCP servers, or leave blank to see
          example visualizations.
        </p>
      </div>
    </div>
  );
};
