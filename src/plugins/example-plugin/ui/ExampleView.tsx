/**
 * Example Plugin Main View
 * This would be displayed when the plugin is opened in the workspace
 */

import React, { useState } from 'react';

export function ExampleView() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Example Plugin</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-4">
          This is an example plugin demonstrating the BQ Studio plugin system.
        </p>

        <div className="mb-4">
          <p className="text-lg mb-2">Counter: {count}</p>
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Increment
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Plugin Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Access to core services (AI, Database, Files, Events, Workflow)</li>
          <li>Event-driven communication with other plugins</li>
          <li>Permission-based security model</li>
          <li>Automatic lifecycle management</li>
          <li>React UI integration</li>
        </ul>
      </div>
    </div>
  );
}
