/**
 * FictionLab Plugin API Type Definitions
 *
 * Type declarations for BQ-Studio plugin to interface with FictionLab host.
 * These types match the implementation in FictionLab's plugin system.
 */

declare module '@fictionlab/plugin-api' {
  import { IpcMainInvokeEvent } from 'electron';
  import { Pool, PoolClient } from 'pg';

  // ========================================
  // Plugin Interface
  // ========================================

  export interface FictionLabPlugin {
    readonly id: string;
    readonly name: string;
    readonly version: string;

    onActivate(context: PluginContext): Promise<void>;
    onDeactivate(): Promise<void>;
    onConfigChange?(config: Record<string, any>): Promise<void>;
  }

  // ========================================
  // Plugin Context
  // ========================================

  export interface PluginContext {
    services: PluginServices;
    workspace: WorkspaceInfo;
    ipc: PluginIPC;
    ui: PluginUI;
    plugin: PluginMetadata;
    config: PluginConfigStorage;
    logger: PluginLogger;
  }

  // ========================================
  // Services
  // ========================================

  export interface PluginServices {
    database: FictionLabDatabase;
    mcp: MCPConnectionManager;
    fileSystem: FileSystemService;
    docker?: DockerService;
    environment: EnvironmentService;
  }

  export interface FictionLabDatabase {
    query<T = any>(sql: string, params?: any[]): Promise<T>;
    transaction(callback: (client: PoolClient) => Promise<void>): Promise<void>;
    pool: Pool;
    createPluginSchema(): Promise<void>;
    getPluginSchema(): string;
  }

  export interface MCPConnectionManager {
    getEndpoint(serverId: string): string | null;
    callTool<T = any>(serverId: string, toolName: string, args: Record<string, any>): Promise<T>;
    isServerRunning(serverId: string): Promise<boolean>;
    listServers(): Promise<string[]>;
    getServerInfo(serverId: string): Promise<MCPServerInfo | null>;
  }

  export interface MCPServerInfo {
    id: string;
    name: string;
    endpoint: string;
    status: 'running' | 'stopped' | 'error';
    tools?: Array<{
      name: string;
      description?: string;
      inputSchema?: any;
    }>;
  }

  export interface FileSystemService {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    mkdir(path: string, recursive?: boolean): Promise<void>;
    readdir(path: string): Promise<string[]>;
    delete(path: string, recursive?: boolean): Promise<void>;
    stat(path: string): Promise<FileStats>;
  }

  export interface FileStats {
    isFile: boolean;
    isDirectory: boolean;
    size: number;
    created: Date;
    modified: Date;
  }

  export interface DockerService {
    listContainers(all?: boolean): Promise<DockerContainer[]>;
    getContainerLogs(containerId: string, tail?: number): Promise<string>;
    isAvailable(): Promise<boolean>;
  }

  export interface DockerContainer {
    id: string;
    name: string;
    image: string;
    status: string;
    state: 'running' | 'stopped' | 'paused' | 'exited';
    ports?: Array<{ internal: number; external?: number }>;
  }

  export interface EnvironmentService {
    get(key: string): string | undefined;
    getUserDataPath(): string;
    getAppVersion(): string;
    isDevelopment(): boolean;
  }

  // ========================================
  // Workspace
  // ========================================

  export interface WorkspaceInfo {
    root: string;
    config: Record<string, any>;
    getPluginDataPath(): string;
  }

  // ========================================
  // IPC
  // ========================================

  export interface PluginIPC {
    handle(channel: string, handler: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any> | any): void;
    send(channel: string, ...args: any[]): void;
    removeHandler(channel: string): void;
    getChannelName(channel: string): string;
  }

  // ========================================
  // UI
  // ========================================

  export interface PluginUI {
    registerMenuItem(item: MenuItem): void;
    removeMenuItem(itemId: string): void;
    showView(viewId: string): void;
    showNotification(notification: Notification): void;
    showDialog(options: DialogOptions): Promise<DialogResult>;
    updateStatusBarItem(itemId: string, content: string): void;
  }

  export interface MenuItem {
    id: string;
    label: string;
    click?: () => void;
    submenu?: MenuItem[];
    accelerator?: string;
    role?: string;
    type?: 'normal' | 'separator' | 'checkbox' | 'radio';
    enabled?: boolean;
    visible?: boolean;
  }

  export interface Notification {
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    title?: string;
    duration?: number;
    actions?: Array<{
      label: string;
      action: () => void;
    }>;
  }

  export interface DialogOptions {
    type: 'info' | 'warning' | 'error' | 'question';
    title: string;
    message: string;
    detail?: string;
    buttons?: string[];
    defaultId?: number;
    cancelId?: number;
  }

  export interface DialogResult {
    response: number;
    checkboxChecked?: boolean;
  }

  // ========================================
  // Plugin Metadata
  // ========================================

  export interface PluginMetadata {
    id: string;
    version: string;
    dataPath: string;
    installPath: string;
    manifest: PluginManifest;
  }

  export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    fictionLabVersion: string;
    pluginType: 'execution-engine' | 'client' | 'reporting' | 'utility' | 'integration';
    entry: {
      main: string;
      renderer?: string;
    };
    permissions: PluginPermissions;
    dependencies?: {
      mcpServers?: Array<string | { id: string; version: string }>;
      plugins?: Array<string | { id: string; version: string }>;
      fictionlabApi?: string;
    };
    ui?: PluginUIConfig;
    mcpIntegration?: {
      [serverId: string]: {
        required: boolean;
        endpoint?: string;
      };
    };
    configSchema?: {
      [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'array' | 'object';
        default?: any;
        description?: string;
        required?: boolean;
      };
    };
  }

  export interface PluginPermissions {
    database?: boolean | string[];
    mcp?: string[];
    fileSystem?: boolean | 'readonly';
    network?: boolean;
    childProcesses?: boolean;
    docker?: boolean;
    clipboard?: boolean;
    dialogs?: boolean;
  }

  export interface PluginUIConfig {
    mainView?: string;
    menuItems?: Array<{
      label: string;
      submenu?: Array<string | { label: string; accelerator?: string; action: string }>;
    }>;
    sidebarWidget?: string;
    settingsPanel?: string;
    statusBarItems?: Array<{
      id: string;
      position: 'left' | 'right';
      priority?: number;
    }>;
  }

  // ========================================
  // Configuration Storage
  // ========================================

  export interface PluginConfigStorage {
    get<T = any>(key: string, defaultValue?: T): T;
    set(key: string, value: any): Promise<void>;
    has(key: string): boolean;
    delete(key: string): Promise<void>;
    all(): Record<string, any>;
    clear(): Promise<void>;
  }

  // ========================================
  // Logger
  // ========================================

  export interface PluginLogger {
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
  }

  // ========================================
  // Errors
  // ========================================

  export enum PluginErrorType {
    MANIFEST_INVALID = 'MANIFEST_INVALID',
    MANIFEST_NOT_FOUND = 'MANIFEST_NOT_FOUND',
    ENTRY_POINT_NOT_FOUND = 'ENTRY_POINT_NOT_FOUND',
    ENTRY_POINT_INVALID = 'ENTRY_POINT_INVALID',
    ACTIVATION_FAILED = 'ACTIVATION_FAILED',
    DEACTIVATION_FAILED = 'DEACTIVATION_FAILED',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    DEPENDENCY_MISSING = 'DEPENDENCY_MISSING',
    VERSION_MISMATCH = 'VERSION_MISMATCH',
    ALREADY_LOADED = 'ALREADY_LOADED',
    NOT_LOADED = 'NOT_LOADED',
  }

  export class PluginError extends Error {
    constructor(
      type: PluginErrorType,
      pluginId: string,
      message: string,
      details?: any
    );

    readonly type: PluginErrorType;
    readonly pluginId: string;
    readonly details?: any;
  }
}
