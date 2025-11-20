/**
 * Example Plugin Dashboard Widget
 * This would be displayed on the main dashboard
 */

import React from 'react';

export function ExampleWidget() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">🧩</span>
        <h3 className="font-semibold text-lg">Example Plugin</h3>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Plugin system is working!
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Status:</span>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
      </div>
    </div>
  );
}
