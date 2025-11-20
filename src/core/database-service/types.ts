/**
 * Database Types for BQ Studio
 * Type-safe interfaces for all database models and operations
 */

// ============================================================================
// Core Database Models
// ============================================================================

export interface Project {
  id: number;
  name: string;
  type: string; // 'series', 'manuscript', 'penname', etc.
  description?: string;
  metadata?: Record<string, any>;
  penname_id?: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived' | 'deleted';
}

export interface ProjectInput {
  name: string;
  type: string;
  description?: string;
  metadata?: Record<string, any>;
  penname_id?: number;
  status?: 'active' | 'archived' | 'deleted';
}

export interface Penname {
  id: number;
  name: string;
  real_name?: string;
  bio?: string;
  brand_guidelines?: string;
  voice_profile?: string;
  social_links?: Record<string, string>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface PennameInput {
  name: string;
  real_name?: string;
  bio?: string;
  brand_guidelines?: string;
  voice_profile?: string;
  social_links?: Record<string, string>;
  metadata?: Record<string, any>;
  is_active?: boolean;
}

export interface Workflow {
  id: number;
  project_id: number;
  workflow_type: string;
  current_stage: string;
  stages_data: WorkflowStageDefinition[];
  state?: Record<string, any>;
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface WorkflowInput {
  project_id: number;
  workflow_type: string;
  current_stage: string;
  stages_data: WorkflowStageDefinition[];
  state?: Record<string, any>;
  progress?: number;
}

export interface WorkflowStageDefinition {
  name: string;
  order: number;
  description?: string;
  validation?: string;
}

export interface WorkflowStage {
  id: number;
  workflow_id: number;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  data?: Record<string, any>;
  validation_result?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
}

export interface WorkflowStageInput {
  workflow_id: number;
  stage_name: string;
  stage_order: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
  data?: Record<string, any>;
  validation_result?: Record<string, any>;
}

export interface File {
  id: number;
  project_id?: number;
  workflow_id?: number;
  name: string;
  path: string;
  file_type: string;
  size?: number;
  content?: string;
  content_hash?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FileInput {
  project_id?: number;
  workflow_id?: number;
  name: string;
  path: string;
  file_type: string;
  size?: number;
  content?: string;
  content_hash?: string;
  metadata?: Record<string, any>;
}

export interface AIInteraction {
  id: number;
  project_id?: number;
  workflow_id?: number;
  provider: 'anthropic' | 'openai' | string;
  model: string;
  prompt: string;
  response?: string;
  tokens_input?: number;
  tokens_output?: number;
  tokens_total?: number;
  cost_usd?: number;
  duration_ms?: number;
  status: 'success' | 'error' | 'timeout';
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AIInteractionInput {
  project_id?: number;
  workflow_id?: number;
  provider: string;
  model: string;
  prompt: string;
  response?: string;
  tokens_input?: number;
  tokens_output?: number;
  tokens_total?: number;
  cost_usd?: number;
  duration_ms?: number;
  status?: 'success' | 'error' | 'timeout';
  error_message?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// System Models
// ============================================================================

export interface Migration {
  id: number;
  version: string;
  name: string;
  applied_at: string;
}

export interface PluginSchema {
  id: number;
  plugin_id: string;
  plugin_name: string;
  schema_version: string;
  tables: string[];
  applied_at: string;
  updated_at: string;
}

export interface PluginSchemaInput {
  plugin_id: string;
  plugin_name: string;
  schema_version: string;
  tables: string[];
}

export interface Setting {
  id: number;
  key: string;
  value: string; // JSON string
  category: string;
  updated_at: string;
}

export interface SettingInput {
  key: string;
  value: string;
  category?: string;
}

// ============================================================================
// Query Builder Types
// ============================================================================

export interface QueryCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN';
  value: any;
}

export interface QueryOptions {
  where?: QueryCondition[];
  orderBy?: { field: string; direction: 'ASC' | 'DESC' }[];
  limit?: number;
  offset?: number;
}

export interface InsertOptions {
  returnId?: boolean;
}

export interface UpdateOptions {
  where: QueryCondition[];
}

export interface DeleteOptions {
  where: QueryCondition[];
}

// ============================================================================
// Database Service Types
// ============================================================================

export interface DatabaseConfig {
  filename: string; // Path to SQLite database file
  verbose?: boolean; // Enable verbose logging
  readonly?: boolean; // Open database in read-only mode
  fileMustExist?: boolean; // Throw error if database doesn't exist
  timeout?: number; // Busy timeout in milliseconds
}

export interface MigrationResult {
  success: boolean;
  version: string;
  message: string;
  error?: Error;
}

export interface BackupOptions {
  destination: string;
  includePluginData?: boolean;
}

export interface RestoreOptions {
  source: string;
  overwrite?: boolean;
}

// ============================================================================
// Transaction Types
// ============================================================================

export type TransactionFunction<T> = () => T;

export interface TransactionOptions {
  immediate?: boolean; // Use IMMEDIATE transaction
}

// ============================================================================
// Plugin Extension Types
// ============================================================================

export interface PluginSchemaExtension {
  pluginId: string;
  pluginName: string;
  version: string;
  sql: string; // SQL statements to execute
  tables: string[]; // Table names created by this plugin
}

// ============================================================================
// Utility Types
// ============================================================================

export type TableName =
  | 'projects'
  | 'pennames'
  | 'workflows'
  | 'workflow_stages'
  | 'files'
  | 'ai_interactions'
  | 'migrations'
  | 'plugin_schemas'
  | 'settings';

export type ModelMap = {
  projects: Project;
  pennames: Penname;
  workflows: Workflow;
  workflow_stages: WorkflowStage;
  files: File;
  ai_interactions: AIInteraction;
  migrations: Migration;
  plugin_schemas: PluginSchema;
  settings: Setting;
};

export type InputMap = {
  projects: ProjectInput;
  pennames: PennameInput;
  workflows: WorkflowInput;
  workflow_stages: WorkflowStageInput;
  files: FileInput;
  ai_interactions: AIInteractionInput;
  plugin_schemas: PluginSchemaInput;
  settings: SettingInput;
};
