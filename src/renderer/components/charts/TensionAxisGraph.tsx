import React, { useRef, useState, useCallback } from 'react';
import { useTensionGraphStore } from '../../stores/tensionGraphStore';
import type { TensionPoint, TensionGraphConfig } from './types';

interface TensionAxisGraphProps {
  config?: TensionGraphConfig;
}

export const TensionAxisGraph: React.FC<TensionAxisGraphProps> = ({ config = {} }) => {
  const {
    width = 800,
    height = 500,
    xAxisLabel = 'Story Progress',
    yAxisLabel = 'Tension Level',
    showGrid = true,
    enableDrag = true,
    enableAddPoints = true,
    enableDeletePoints = true,
  } = config;

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    lineId: string | null;
    pointId: string | null;
  }>({
    isDragging: false,
    lineId: null,
    pointId: null,
  });

  const [hoveredPoint, setHoveredPoint] = useState<{
    lineId: string;
    pointId: string;
  } | null>(null);

  const { lines, selectedLineId, updatePoint, addPoint, removePoint, setSelectedLine } =
    useTensionGraphStore();

  // Graph dimensions with padding for axes
  const padding = { top: 20, right: 40, bottom: 60, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Convert percentage to pixel coordinates
  const xScale = (percent: number) => padding.left + (percent / 100) * graphWidth;
  const yScale = (percent: number) => padding.top + graphHeight - (percent / 100) * graphHeight;

  // Convert pixel coordinates to percentage
  const xInverse = (pixel: number) => {
    const percent = ((pixel - padding.left) / graphWidth) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  const yInverse = (pixel: number) => {
    const percent = ((graphHeight - (pixel - padding.top)) / graphHeight) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  // Generate smooth curve path through points
  const generatePath = (points: TensionPoint[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      const p = points[0];
      return `M ${xScale(p.x)},${yScale(p.y)}`;
    }

    // Sort points by x position
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);

    let path = `M ${xScale(sortedPoints[0].x)},${yScale(sortedPoints[0].y)}`;

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const current = sortedPoints[i];
      const next = sortedPoints[i + 1];

      const currentX = xScale(current.x);
      const currentY = yScale(current.y);
      const nextX = xScale(next.x);
      const nextY = yScale(next.y);

      // Use quadratic bezier curves for smooth transitions
      const controlX = (currentX + nextX) / 2;
      const controlY = (currentY + nextY) / 2;

      path += ` Q ${controlX},${currentY} ${controlX},${controlY}`;
      path += ` Q ${controlX},${nextY} ${nextX},${nextY}`;
    }

    return path;
  };

  // Handle mouse down on a point to start dragging
  const handlePointMouseDown = useCallback(
    (lineId: string, pointId: string, e: React.MouseEvent) => {
      if (!enableDrag) return;
      e.stopPropagation();
      setDragState({
        isDragging: true,
        lineId,
        pointId,
      });
    },
    [enableDrag]
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!dragState.isDragging || !dragState.lineId || !dragState.pointId) return;

      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = xInverse(mouseX);
      const newY = yInverse(mouseY);

      updatePoint(dragState.lineId, dragState.pointId, { x: newX, y: newY });
    },
    [dragState, updatePoint, xInverse, yInverse]
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      lineId: null,
      pointId: null,
    });
  }, []);

  // Handle double-click on graph to add a new point
  const handleGraphDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!enableAddPoints || !selectedLineId) return;

      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Check if click is within graph bounds
      if (
        mouseX < padding.left ||
        mouseX > width - padding.right ||
        mouseY < padding.top ||
        mouseY > height - padding.bottom
      ) {
        return;
      }

      const newX = xInverse(mouseX);
      const newY = yInverse(mouseY);

      const newPoint: TensionPoint = {
        id: `point-${Date.now()}`,
        x: newX,
        y: newY,
      };

      addPoint(selectedLineId, newPoint);
    },
    [enableAddPoints, selectedLineId, addPoint, xInverse, yInverse, padding, width, height]
  );

  // Handle right-click on point to delete
  const handlePointRightClick = useCallback(
    (lineId: string, pointId: string, e: React.MouseEvent) => {
      if (!enableDeletePoints) return;
      e.preventDefault();
      e.stopPropagation();

      const line = lines.find((l) => l.id === lineId);
      if (line && line.points.length > 2) {
        // Keep at least 2 points
        removePoint(lineId, pointId);
      }
    },
    [enableDeletePoints, lines, removePoint]
  );

  return (
    <div className="tension-graph-container">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-900 rounded-lg"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleGraphDoubleClick}
      >
        {/* Grid lines */}
        {showGrid && (
          <g className="grid">
            {[0, 25, 50, 75, 100].map((percent) => (
              <React.Fragment key={`grid-${percent}`}>
                {/* Vertical grid lines */}
                <line
                  x1={xScale(percent)}
                  y1={padding.top}
                  x2={xScale(percent)}
                  y2={height - padding.bottom}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {/* Horizontal grid lines */}
                <line
                  x1={padding.left}
                  y1={yScale(percent)}
                  x2={width - padding.right}
                  y2={yScale(percent)}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </React.Fragment>
            ))}
          </g>
        )}

        {/* Axes */}
        <g className="axes">
          {/* X-axis */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="2"
          />
          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* X-axis label */}
          <text
            x={padding.left + graphWidth / 2}
            y={height - 10}
            textAnchor="middle"
            fill="#d1d5db"
            fontSize="14"
            fontWeight="500"
          >
            {xAxisLabel}
          </text>

          {/* Y-axis label */}
          <text
            x={15}
            y={padding.top + graphHeight / 2}
            textAnchor="middle"
            fill="#d1d5db"
            fontSize="14"
            fontWeight="500"
            transform={`rotate(-90, 15, ${padding.top + graphHeight / 2})`}
          >
            {yAxisLabel}
          </text>

          {/* X-axis tick labels */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <text
              key={`x-tick-${percent}`}
              x={xScale(percent)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="12"
            >
              {percent}%
            </text>
          ))}

          {/* Y-axis tick labels */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <text
              key={`y-tick-${percent}`}
              x={padding.left - 10}
              y={yScale(percent)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#9ca3af"
              fontSize="12"
            >
              {percent}%
            </text>
          ))}
        </g>

        {/* Tension lines */}
        {lines
          .filter((line) => line.visible)
          .map((line) => (
            <g key={line.id} className="tension-line">
              {/* Line path */}
              <path
                d={generatePath(line.points)}
                stroke={line.color}
                strokeWidth={line.id === selectedLineId ? 3 : 2}
                fill="none"
                opacity={line.id === selectedLineId ? 1 : 0.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {line.points.map((point) => {
                const isHovered =
                  hoveredPoint?.lineId === line.id && hoveredPoint?.pointId === point.id;
                const isSelected = line.id === selectedLineId;

                return (
                  <g key={point.id}>
                    {/* Point circle */}
                    <circle
                      cx={xScale(point.x)}
                      cy={yScale(point.y)}
                      r={isHovered ? 8 : isSelected ? 6 : 5}
                      fill={line.color}
                      stroke="#1f2937"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                      onMouseDown={(e) => handlePointMouseDown(line.id, point.id, e)}
                      onMouseEnter={() => setHoveredPoint({ lineId: line.id, pointId: point.id })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onContextMenu={(e) => handlePointRightClick(line.id, point.id, e)}
                      style={{ cursor: enableDrag ? 'grab' : 'pointer' }}
                    />

                    {/* Point label */}
                    {point.label && (isHovered || isSelected) && (
                      <text
                        x={xScale(point.x)}
                        y={yScale(point.y) - 15}
                        textAnchor="middle"
                        fill="#f9fafb"
                        fontSize="12"
                        fontWeight="500"
                        className="pointer-events-none"
                      >
                        {point.label}
                      </text>
                    )}

                    {/* Coordinates tooltip on hover */}
                    {isHovered && (
                      <text
                        x={xScale(point.x)}
                        y={yScale(point.y) + 25}
                        textAnchor="middle"
                        fill="#9ca3af"
                        fontSize="10"
                        className="pointer-events-none"
                      >
                        ({point.x.toFixed(0)}%, {point.y.toFixed(0)}%)
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
      </svg>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-400 space-y-1">
        <p>• Drag points to adjust tension levels</p>
        <p>• Double-click on the graph to add new points</p>
        <p>• Right-click on a point to delete it</p>
        <p>• Select a line in the legend to add points to it</p>
      </div>
    </div>
  );
};
