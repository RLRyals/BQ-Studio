import React, { useState, useCallback } from 'react';
import { useCausalityChainStore } from '../../stores/causalityChainStore';
import type { CausalityNode, CausalityLink } from './types';

interface CausalityChainGraphProps {
  width?: number;
  height?: number;
}

export const CausalityChainGraph: React.FC<CausalityChainGraphProps> = ({
  width = 900,
  height = 500,
}) => {
  const { chainData, isLoading, selectedNodeId, setSelectedNode } =
    useCausalityChainStore();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  // Get node color based on type
  const getNodeColor = (type: CausalityNode['type']): string => {
    switch (type) {
      case 'decision':
        return '#3b82f6'; // Blue
      case 'consequence':
        return '#10b981'; // Green
      case 'violation':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  // Get link stroke color and style based on type
  const getLinkStyle = (type: CausalityLink['type']) => {
    switch (type) {
      case 'direct':
        return { stroke: '#10b981', strokeDasharray: 'none' }; // Solid green
      case 'delayed':
        return { stroke: '#fbbf24', strokeDasharray: '8 4' }; // Dashed yellow
      case 'broken':
        return { stroke: '#ef4444', strokeDasharray: '4 4' }; // Dotted red
      default:
        return { stroke: '#6b7280', strokeDasharray: 'none' }; // Solid gray
    }
  };

  // Calculate arrow path between two nodes
  const calculateArrowPath = (
    source: CausalityNode,
    target: CausalityNode
  ): string => {
    const startX = source.x;
    const startY = source.y;
    const endX = target.x;
    const endY = target.y;

    // Use a curved path for better visualization
    const midX = (startX + endX) / 2;
    const curveOffset = Math.abs(endY - startY) * 0.3;

    return `M ${startX},${startY} Q ${midX},${startY - curveOffset} ${midX},${(startY + endY) / 2} T ${endX},${endY}`;
  };

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNode(selectedNodeId === nodeId ? null : nodeId);
    },
    [selectedNodeId, setSelectedNode]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="text-gray-400">Loading causality chain data...</div>
      </div>
    );
  }

  if (!chainData || chainData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="text-gray-400">No causality chain data available</div>
      </div>
    );
  }

  const { nodes, links } = chainData;
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const hoveredNode = nodes.find((n) => n.id === hoveredNodeId);

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">
          Causality Chain Visualizer
        </h2>
        <p className="text-sm text-gray-400">
          Interactive flow diagram showing cause-and-effect relationships
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Node Types
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-300">Character Decision</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-300">
                  Consequence (Character Action)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-300">
                  Violation (No Agency)
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Arrow Types
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <svg width="24" height="2">
                  <line
                    x1="0"
                    y1="1"
                    x2="24"
                    y2="1"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                </svg>
                <span className="text-xs text-gray-300">Direct Causality</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="24" height="2">
                  <line
                    x1="0"
                    y1="1"
                    x2="24"
                    y2="1"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                </svg>
                <span className="text-xs text-gray-300">Delayed Causality</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="24" height="2">
                  <line
                    x1="0"
                    y1="1"
                    x2="24"
                    y2="1"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                </svg>
                <span className="text-xs text-gray-300">Broken Chain</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="bg-gray-950 rounded-lg p-4 border border-gray-700">
        <svg width={width} height={height} className="overflow-visible">
          {/* Render links first (so they appear behind nodes) */}
          <g className="links">
            {links.map((link) => {
              const source = nodes.find((n) => n.id === link.sourceId);
              const target = nodes.find((n) => n.id === link.targetId);

              if (!source || !target) return null;

              const linkStyle = getLinkStyle(link.type);
              const isHovered = hoveredLinkId === link.id;
              const isConnectedToSelected =
                selectedNodeId === link.sourceId || selectedNodeId === link.targetId;

              return (
                <g key={link.id}>
                  {/* Arrow path */}
                  <path
                    d={calculateArrowPath(source, target)}
                    fill="none"
                    stroke={linkStyle.stroke}
                    strokeWidth={isHovered ? 3 : 2}
                    strokeDasharray={linkStyle.strokeDasharray}
                    opacity={isConnectedToSelected || isHovered ? 1 : 0.4}
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredLinkId(link.id)}
                    onMouseLeave={() => setHoveredLinkId(null)}
                    markerEnd="url(#arrowhead)"
                  />

                  {/* Arrow marker for broken chains (X instead of arrow) */}
                  {link.type === 'broken' && (
                    <g>
                      <line
                        x1={target.x - 8}
                        y1={target.y - 8}
                        x2={target.x + 8}
                        y2={target.y + 8}
                        stroke="#ef4444"
                        strokeWidth="3"
                      />
                      <line
                        x1={target.x - 8}
                        y1={target.y + 8}
                        x2={target.x + 8}
                        y2={target.y - 8}
                        stroke="#ef4444"
                        strokeWidth="3"
                      />
                    </g>
                  )}

                  {/* Link label on hover */}
                  {isHovered && link.label && (
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 10}
                      textAnchor="middle"
                      fill="#f9fafb"
                      fontSize="11"
                      fontWeight="500"
                      className="pointer-events-none"
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
            </marker>
          </defs>

          {/* Render nodes */}
          <g className="nodes">
            {nodes.map((node) => {
              const nodeColor = getNodeColor(node.type);
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const radius = isHovered ? 28 : isSelected ? 26 : 24;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-all"
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={nodeColor}
                    stroke={isSelected ? '#fff' : '#1f2937'}
                    strokeWidth={isSelected ? 3 : 2}
                    opacity={isHovered || isSelected ? 1 : 0.85}
                  />

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + 45}
                    textAnchor="middle"
                    fill="#d1d5db"
                    fontSize="12"
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {node.label.length > 20
                      ? node.label.substring(0, 20) + '...'
                      : node.label}
                  </text>

                  {/* Character name (if available) */}
                  {node.characterName && (
                    <text
                      x={node.x}
                      y={node.y + 60}
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="10"
                      className="pointer-events-none"
                    >
                      {node.characterName}
                    </text>
                  )}

                  {/* Violation indicator */}
                  {node.type === 'violation' && (
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="16"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      !
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Node details panel */}
      {(selectedNode || hoveredNode) && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">
              {(selectedNode || hoveredNode)!.label}
            </h3>
            <span
              className="px-2 py-1 text-xs font-medium rounded"
              style={{
                backgroundColor: getNodeColor((selectedNode || hoveredNode)!.type),
                color: '#fff',
              }}
            >
              {(selectedNode || hoveredNode)!.type.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            {(selectedNode || hoveredNode)!.description}
          </p>
          {(selectedNode || hoveredNode)!.characterName && (
            <div className="text-xs text-gray-400">
              <span className="font-semibold">Character:</span>{' '}
              {(selectedNode || hoveredNode)!.characterName}
            </div>
          )}
          {(selectedNode || hoveredNode)!.chapterId && (
            <div className="text-xs text-gray-400">
              <span className="font-semibold">Chapter:</span>{' '}
              {(selectedNode || hoveredNode)!.chapterId}
            </div>
          )}
          {selectedNode && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Click the node again to deselect, or click another node for details
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
          Interactive Features
        </h4>
        <div className="space-y-1 text-xs text-gray-500">
          <p>• Click nodes to view detailed information</p>
          <p>• Hover over arrows to see relationship labels</p>
          <p>• Red violation nodes indicate effects without character agency</p>
          <p>• Filters by character/chapter/plot thread coming in Phase 4</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {chainData.lastUpdated.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
