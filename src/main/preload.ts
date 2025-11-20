import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Platform information
  platform: process.platform,

  // IPC communication
  send: (channel: string, data?: unknown) => {
    // Whitelist channels
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  receive: (channel: string, func: (...args: unknown[]) => void) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  invoke: async (channel: string, data?: unknown) => {
    const validChannels = [
      'plugin:list',
      'plugin:load',
      'ai:request',
      'db:query',
      'file:read',
      'file:write',
    ];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },
});

// Expose app version
contextBridge.exposeInMainWorld('appVersion', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron,
});
