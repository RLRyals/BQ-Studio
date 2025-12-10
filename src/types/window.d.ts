// Type definitions for the window object extended by preload script

export interface ElectronAPI {
  platform: string;
  send: (channel: string, data?: unknown) => void;
  receive: (channel: string, func: (...args: unknown[]) => void) => void;
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
}

export interface AppVersion {
  node: string;
  chrome: string;
  electron: string;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    appVersion: AppVersion;
  }
}

// This export is needed to make this a module
export {};
