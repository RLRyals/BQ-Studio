import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Create root and render app
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log app version info in development
if (process.env.NODE_ENV === 'development') {
  console.log('BQ Studio - Development Mode');
  if (window.appVersion) {
    console.log('Versions:', window.appVersion);
  }
}
