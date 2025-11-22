/**
 * Types for the Tension Axis Graph component
 */

export interface TensionPoint {
  id: string;
  x: number; // Position along the story (0-100%)
  y: number; // Tension level (0-100%)
  label?: string;
  color?: string;
}

export interface TensionLine {
  id: string;
  name: string;
  points: TensionPoint[];
  color: string;
  visible: boolean;
}

export interface TensionGraphConfig {
  width?: number;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  enableDrag?: boolean;
  enableAddPoints?: boolean;
  enableDeletePoints?: boolean;
}

export interface DragState {
  isDragging: boolean;
  lineId: string | null;
  pointId: string | null;
  startX: number;
  startY: number;
}
