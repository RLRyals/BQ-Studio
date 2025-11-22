import React from 'react';
import { TensionAxisGraph } from './TensionAxisGraph';
import { TensionGraphLegend } from './TensionGraphLegend';
import type { TensionGraphConfig } from './types';

interface TensionGraphWidgetProps {
  config?: TensionGraphConfig;
}

export const TensionGraphWidget: React.FC<TensionGraphWidgetProps> = ({ config }) => {
  return (
    <div className="tension-graph-widget w-full h-full p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Story Tension Axis</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph - takes 2/3 of space on large screens */}
        <div className="lg:col-span-2">
          <TensionAxisGraph config={config} />
        </div>

        {/* Legend - takes 1/3 of space on large screens */}
        <div className="lg:col-span-1">
          <TensionGraphLegend />
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">About Tension Axis</h4>
        <p className="text-xs text-gray-400 leading-relaxed">
          The tension axis is a powerful story modeling tool that visualizes how tension rises and
          falls throughout your narrative. Unlike traditional three-act structure diagrams, you can
          track multiple tension lines simultaneously - main plot, subplots, emotional arcs, and more.
          This helps you maintain pacing balance and ensure your story has a satisfying rhythm of
          tension and release.
        </p>
      </div>
    </div>
  );
};
