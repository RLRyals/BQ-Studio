import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TensionLine, TensionPoint } from '../components/charts/types';
import { mcpClient } from '../services/mcpClient';

interface TensionGraphState {
  lines: TensionLine[];
  selectedLineId: string | null;
  isLoadingFromMCP: boolean;
  mcpDataSource: { bookId: string | null };

  // Actions
  addLine: (line: TensionLine) => void;
  removeLine: (lineId: string) => void;
  updateLine: (lineId: string, updates: Partial<TensionLine>) => void;

  addPoint: (lineId: string, point: TensionPoint) => void;
  removePoint: (lineId: string, pointId: string) => void;
  updatePoint: (lineId: string, pointId: string, updates: Partial<TensionPoint>) => void;

  setSelectedLine: (lineId: string | null) => void;
  toggleLineVisibility: (lineId: string) => void;

  // MCP Integration
  loadFromMCP: (bookId: string) => Promise<void>;
  setMCPLoading: (loading: boolean) => void;

  reset: () => void;
}

const defaultLines: TensionLine[] = [
  {
    id: 'main-tension',
    name: 'Main Plot Tension',
    color: '#3b82f6', // blue-500
    visible: true,
    points: [
      { id: '1', x: 0, y: 20, label: 'Opening' },
      { id: '2', x: 25, y: 40, label: 'Inciting Incident' },
      { id: '3', x: 50, y: 60, label: 'Midpoint' },
      { id: '4', x: 75, y: 80, label: 'Crisis' },
      { id: '5', x: 90, y: 95, label: 'Climax' },
      { id: '6', x: 100, y: 30, label: 'Resolution' },
    ],
  },
  {
    id: 'romance-tension',
    name: 'Romance Subplot',
    color: '#ec4899', // pink-500
    visible: true,
    points: [
      { id: '1', x: 0, y: 10 },
      { id: '2', x: 20, y: 30 },
      { id: '3', x: 40, y: 25 },
      { id: '4', x: 60, y: 50 },
      { id: '5', x: 80, y: 70 },
      { id: '6', x: 100, y: 85 },
    ],
  },
];

export const useTensionGraphStore = create<TensionGraphState>()(
  persist(
    (set) => ({
      lines: defaultLines,
      selectedLineId: 'main-tension',
      isLoadingFromMCP: false,
      mcpDataSource: { bookId: null },

      addLine: (line: TensionLine) =>
        set((state: TensionGraphState) => ({
          lines: [...state.lines, line],
        })),

      removeLine: (lineId: string) =>
        set((state: TensionGraphState) => ({
          lines: state.lines.filter((l: TensionLine) => l.id !== lineId),
          selectedLineId: state.selectedLineId === lineId ? null : state.selectedLineId,
        })),

      updateLine: (lineId: string, updates: Partial<TensionLine>) =>
        set((state: TensionGraphState) => ({
          lines: state.lines.map((l: TensionLine) =>
            l.id === lineId ? { ...l, ...updates } : l
          ),
        })),

      addPoint: (lineId: string, point: TensionPoint) =>
        set((state: TensionGraphState) => ({
          lines: state.lines.map((l: TensionLine) =>
            l.id === lineId
              ? { ...l, points: [...l.points, point].sort((a, b) => a.x - b.x) }
              : l
          ),
        })),

      removePoint: (lineId: string, pointId: string) =>
        set((state: TensionGraphState) => ({
          lines: state.lines.map((l: TensionLine) =>
            l.id === lineId
              ? { ...l, points: l.points.filter((p: TensionPoint) => p.id !== pointId) }
              : l
          ),
        })),

      updatePoint: (lineId: string, pointId: string, updates: Partial<TensionPoint>) =>
        set((state: TensionGraphState) => ({
          lines: state.lines.map((l: TensionLine) =>
            l.id === lineId
              ? {
                  ...l,
                  points: l.points.map((p: TensionPoint) =>
                    p.id === pointId ? { ...p, ...updates } : p
                  ),
                }
              : l
          ),
        })),

      setSelectedLine: (lineId: string | null) =>
        set({ selectedLineId: lineId }),

      toggleLineVisibility: (lineId: string) =>
        set((state: TensionGraphState) => ({
          lines: state.lines.map((l: TensionLine) =>
            l.id === lineId ? { ...l, visible: !l.visible } : l
          ),
        })),

      loadFromMCP: async (bookId: string) => {
        set({ isLoadingFromMCP: true });
        try {
          // Fetch plot threads and tension data from MCP
          const threadsData = await mcpClient.getPlotThreads(bookId);
          const tensionData = await mcpClient.getTensionData(bookId);

          // Transform MCP data into TensionLine format
          // Note: The exact structure depends on MCP response format
          // This is a placeholder that should be adjusted based on actual MCP response
          const lines: TensionLine[] = (threadsData as any)?.threads?.map((thread: any, index: number) => ({
            id: thread.id || `thread-${index}`,
            name: thread.name || `Plot Thread ${index + 1}`,
            color: thread.color || ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'][index % 5],
            visible: true,
            points: (tensionData as any)?.points
              ?.filter((p: any) => p.threadId === thread.id)
              ?.map((p: any) => ({
                id: p.id || `point-${p.x}`,
                x: p.storyPosition || p.x || 0,
                y: p.tensionLevel || p.y || 0,
                label: p.label,
              })) || [],
          })) || defaultLines;

          set({
            lines,
            mcpDataSource: { bookId },
            selectedLineId: lines[0]?.id || null,
          });
        } catch (error) {
          console.error('Failed to load tension data from MCP:', error);
          // Keep existing data on error
        } finally {
          set({ isLoadingFromMCP: false });
        }
      },

      setMCPLoading: (loading: boolean) =>
        set({ isLoadingFromMCP: loading }),

      reset: () =>
        set({
          lines: defaultLines,
          selectedLineId: 'main-tension',
          isLoadingFromMCP: false,
          mcpDataSource: { bookId: null },
        }),
    }),
    {
      name: 'tension-graph-storage',
    }
  )
);
