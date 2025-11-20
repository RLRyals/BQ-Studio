import React, { useState, useEffect } from 'react';

export function App() {
  const [platform, setPlatform] = useState<string>('unknown');

  useEffect(() => {
    // Get platform info from preload script
    if (window.electron) {
      setPlatform(window.electron.platform);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            BQ Studio
          </h1>
          <p className="text-xl text-purple-200">
            AI-Powered Publishing House ERP
          </p>
        </div>

        {/* Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto border border-purple-500/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-green-400 font-semibold">Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Platform:</span>
              <span className="text-purple-300 font-mono">{platform}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Version:</span>
              <span className="text-purple-300 font-mono">0.1.0</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto border border-purple-500/30">
          <p className="text-purple-100 leading-relaxed">
            Welcome to BQ Studio! The application is running successfully.
            This is a basic starter screen that will be replaced with the
            full dashboard and plugin system.
          </p>
        </div>

        {/* Version Info */}
        {window.appVersion && (
          <div className="text-sm text-slate-500 space-y-1">
            <p>Electron: {window.appVersion.electron}</p>
            <p>Chromium: {window.appVersion.chrome}</p>
            <p>Node: {window.appVersion.node}</p>
          </div>
        )}
      </div>
    </div>
  );
}
