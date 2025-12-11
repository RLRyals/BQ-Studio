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
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },

  // Expose ipcRenderer with limited methods for agent execution
  ipcRenderer: {
    on: (channel: string, func: (...args: unknown[]) => void) => {
      const validChannels = ['agent-execution:event'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, func);
      }
    },
    removeListener: (channel: string, func: (...args: unknown[]) => void) => {
      const validChannels = ['agent-execution:event'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
  },

  invoke: async (channel: string, ...args: unknown[]) => {
    const validChannels = [
      'plugin:list',
      'plugin:load',
      'ai:request',
      'db:query',
      'file:read',
      'file:write',
      // Workspace operations
      'workspace:getPath',
      'workspace:getConfig',
      'workspace:getDefaultPath',
      'workspace:selectFolder',
      'workspace:isFirstRun',
      'workspace:initialize',
      'workspace:validate',
      'workspace:setPath',
      'workspace:getStructure',
      'workspace:repair',
      'workspace:updateGitConfig',
      'workspace:isGitEnabled',
      'workspace:getGitRemoteUrl',
      // Git operations
      'git:isRepository',
      'git:status',
      'git:commit',
      'git:push',
      'git:pull',
      'git:addRemote',
      'git:setRemoteUrl',
      'git:getRemoteUrl',
      'git:removeRemote',
      'git:getCurrentBranch',
      'git:getLog',
      'git:hasUncommittedChanges',
      // Genre pack operations
      'genrepack:list',
      'genrepack:load',
      'genrepack:getFile',
      'genrepack:copy',
      'genrepack:checkUpdates',
      'genrepack:invalidateCache',
      // Agent execution operations
      'agent-execution:start',
      'agent-execution:pause',
      'agent-execution:resume',
      'agent-execution:cancel',
      'agent-execution:getQueue',
      'agent-execution:getJobDetails',
      'agent-execution:checkCLI',
      'agent-execution:installCLI',
      'agent-execution:getCLIPath',
    ];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args);
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
