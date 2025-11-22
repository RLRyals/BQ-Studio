import React, { useState } from 'react';
import { useTensionGraphStore } from '../../stores/tensionGraphStore';
import { Eye, EyeOff, Plus, Trash2, Edit2 } from 'lucide-react';
import type { TensionLine } from './types';

export const TensionGraphLegend: React.FC = () => {
  const {
    lines,
    selectedLineId,
    setSelectedLine,
    toggleLineVisibility,
    addLine,
    removeLine,
    updateLine,
  } = useTensionGraphStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const colors = [
    '#3b82f6', // blue
    '#ec4899', // pink
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
  ];

  const handleAddLine = () => {
    const newLine: TensionLine = {
      id: `line-${Date.now()}`,
      name: 'New Tension Line',
      color: colors[lines.length % colors.length],
      visible: true,
      points: [
        { id: '1', x: 0, y: 20 },
        { id: '2', x: 100, y: 80 },
      ],
    };
    addLine(newLine);
    setSelectedLine(newLine.id);
    setIsAdding(false);
  };

  const handleStartEdit = (line: TensionLine) => {
    setEditingId(line.id);
    setEditName(line.name);
  };

  const handleSaveEdit = (lineId: string) => {
    if (editName.trim()) {
      updateLine(lineId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleColorChange = (lineId: string, color: string) => {
    updateLine(lineId, { color });
  };

  return (
    <div className="tension-graph-legend bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Tension Lines</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          <Plus size={16} />
          Add Line
        </button>
      </div>

      <div className="space-y-2">
        {lines.map((line) => (
          <div
            key={line.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
              line.id === selectedLineId
                ? 'bg-gray-700 ring-2 ring-blue-500'
                : 'bg-gray-750 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedLine(line.id)}
          >
            {/* Color indicator */}
            <div className="relative">
              <div
                className="w-4 h-4 rounded-full border-2 border-gray-900"
                style={{ backgroundColor: line.color }}
              />
              <input
                type="color"
                value={line.color}
                onChange={(e) => handleColorChange(line.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Change color"
              />
            </div>

            {/* Line name */}
            <div className="flex-1 min-w-0">
              {editingId === line.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleSaveEdit(line.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(line.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1 bg-gray-600 text-gray-100 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <span className="text-gray-100 font-medium truncate block">
                  {line.name}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {line.points.length} point{line.points.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {/* Edit button */}
              <button
                onClick={() => handleStartEdit(line)}
                className="p-1.5 hover:bg-gray-600 rounded transition-colors"
                title="Rename line"
              >
                <Edit2 size={14} className="text-gray-400" />
              </button>

              {/* Visibility toggle */}
              <button
                onClick={() => toggleLineVisibility(line.id)}
                className="p-1.5 hover:bg-gray-600 rounded transition-colors"
                title={line.visible ? 'Hide line' : 'Show line'}
              >
                {line.visible ? (
                  <Eye size={14} className="text-gray-400" />
                ) : (
                  <EyeOff size={14} className="text-gray-500" />
                )}
              </button>

              {/* Delete button */}
              {lines.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Delete "${line.name}"?`)) {
                      removeLine(line.id);
                    }
                  }}
                  className="p-1.5 hover:bg-red-600/20 rounded transition-colors"
                  title="Delete line"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="mt-3 p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300 mb-2">Add a new tension line?</p>
          <div className="flex gap-2">
            <button
              onClick={handleAddLine}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
