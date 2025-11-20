-- BQ Studio Database Schema
-- SQLite database for managing projects, pennames, workflows, files, and AI interactions

-- ============================================================================
-- Core Tables
-- ============================================================================

-- Projects table: Stores all user projects (series, manuscripts, etc.)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'series', 'manuscript', 'penname', etc.
    description TEXT,
    metadata JSON, -- Flexible JSON storage for project-specific data
    penname_id INTEGER, -- Optional reference to penname
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active', -- 'active', 'archived', 'deleted'
    FOREIGN KEY (penname_id) REFERENCES pennames(id) ON DELETE SET NULL
);

-- Pennames table: Author pen names with branding and voice profiles
CREATE TABLE IF NOT EXISTS pennames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    real_name TEXT,
    bio TEXT,
    brand_guidelines TEXT, -- Markdown/text for brand guidelines
    voice_profile TEXT, -- Voice characteristics for AI generation
    social_links JSON, -- Social media profile links
    metadata JSON, -- Additional flexible data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Workflows table: Workflow definitions and instances
CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    workflow_type TEXT NOT NULL, -- 'series-architect', 'manuscript-writer', etc.
    current_stage TEXT NOT NULL, -- Current stage identifier
    stages_data JSON NOT NULL, -- Array of stage definitions
    state JSON, -- Current workflow state/context
    progress INTEGER DEFAULT 0, -- Percentage complete (0-100)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Workflow stages table: Individual stage completion tracking
CREATE TABLE IF NOT EXISTS workflow_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_id INTEGER NOT NULL,
    stage_name TEXT NOT NULL,
    stage_order INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
    data JSON, -- Stage-specific data
    validation_result JSON, -- Validation results
    started_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Files table: File metadata and content tracking
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    workflow_id INTEGER,
    name TEXT NOT NULL,
    path TEXT NOT NULL, -- Relative path from project root
    file_type TEXT NOT NULL, -- 'markdown', 'docx', 'pdf', 'json', etc.
    size INTEGER, -- File size in bytes
    content TEXT, -- For text files, can be stored directly
    content_hash TEXT, -- SHA256 hash for change detection
    metadata JSON, -- File-specific metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL
);

-- AI interactions table: Log all AI API calls for debugging and cost tracking
CREATE TABLE IF NOT EXISTS ai_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    workflow_id INTEGER,
    provider TEXT NOT NULL, -- 'anthropic', 'openai', etc.
    model TEXT NOT NULL, -- 'claude-3-opus', 'gpt-4', etc.
    prompt TEXT NOT NULL,
    response TEXT,
    tokens_input INTEGER,
    tokens_output INTEGER,
    tokens_total INTEGER,
    cost_usd REAL, -- Estimated cost in USD
    duration_ms INTEGER, -- Request duration in milliseconds
    status TEXT DEFAULT 'success', -- 'success', 'error', 'timeout'
    error_message TEXT,
    metadata JSON, -- Additional context (temperature, max_tokens, etc.)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- ============================================================================
-- System Tables
-- ============================================================================

-- Migrations table: Track applied database migrations
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Plugin schemas table: Track plugin-specific schema extensions
CREATE TABLE IF NOT EXISTS plugin_schemas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plugin_id TEXT NOT NULL UNIQUE, -- Plugin identifier
    plugin_name TEXT NOT NULL,
    schema_version TEXT NOT NULL,
    tables JSON NOT NULL, -- Array of table names created by plugin
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings table: Application and user settings
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL, -- JSON string
    category TEXT DEFAULT 'general', -- 'general', 'ai', 'plugins', etc.
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_penname ON projects(penname_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at);

-- Workflows indexes
CREATE INDEX IF NOT EXISTS idx_workflows_project ON workflows(project_id);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_stage ON workflows(current_stage);

-- Workflow stages indexes
CREATE INDEX IF NOT EXISTS idx_workflow_stages_workflow ON workflow_stages(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_status ON workflow_stages(status);

-- Files indexes
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_workflow ON files(workflow_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);

-- AI interactions indexes
CREATE INDEX IF NOT EXISTS idx_ai_project ON ai_interactions(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflow ON ai_interactions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_ai_provider ON ai_interactions(provider);
CREATE INDEX IF NOT EXISTS idx_ai_created ON ai_interactions(created_at);

-- Pennames indexes
CREATE INDEX IF NOT EXISTS idx_pennames_active ON pennames(is_active);

-- ============================================================================
-- Triggers for Updated_at Timestamps
-- ============================================================================

-- Projects update trigger
CREATE TRIGGER IF NOT EXISTS update_projects_timestamp
AFTER UPDATE ON projects
BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Pennames update trigger
CREATE TRIGGER IF NOT EXISTS update_pennames_timestamp
AFTER UPDATE ON pennames
BEGIN
    UPDATE pennames SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Workflows update trigger
CREATE TRIGGER IF NOT EXISTS update_workflows_timestamp
AFTER UPDATE ON workflows
BEGIN
    UPDATE workflows SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Files update trigger
CREATE TRIGGER IF NOT EXISTS update_files_timestamp
AFTER UPDATE ON files
BEGIN
    UPDATE files SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Settings update trigger
CREATE TRIGGER IF NOT EXISTS update_settings_timestamp
AFTER UPDATE ON settings
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Plugin schemas update trigger
CREATE TRIGGER IF NOT EXISTS update_plugin_schemas_timestamp
AFTER UPDATE ON plugin_schemas
BEGIN
    UPDATE plugin_schemas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
