-- Claude Code Executor Plugin Schema
-- Schema: plugin_claude_code_executor
-- Purpose: Stores plugin-specific data for Claude Code execution tracking

CREATE SCHEMA IF NOT EXISTS plugin_claude_code_executor;

-- ========================================
-- Claude Sessions Table
-- ========================================
-- Tracks Claude Code CLI sessions for resume capability
CREATE TABLE IF NOT EXISTS plugin_claude_code_executor.claude_sessions (
  id VARCHAR(255) PRIMARY KEY,
  skill_name VARCHAR(255) NOT NULL,
  workspace_directory TEXT NOT NULL,
  session_token TEXT,
  current_phase INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_claude_sessions_skill ON plugin_claude_code_executor.claude_sessions(skill_name);
CREATE INDEX idx_claude_sessions_status ON plugin_claude_code_executor.claude_sessions(status);

-- ========================================
-- Token Usage Table
-- ========================================
-- Tracks Claude token consumption per execution
CREATE TABLE IF NOT EXISTS plugin_claude_code_executor.token_usage (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES plugin_claude_code_executor.claude_sessions(id) ON DELETE CASCADE,
  phase_number INTEGER,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10, 4),
  model_name VARCHAR(100),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_token_usage_session ON plugin_claude_code_executor.token_usage(session_id);
CREATE INDEX idx_token_usage_date ON plugin_claude_code_executor.token_usage(recorded_at);

-- ========================================
-- Execution Jobs Table
-- ========================================
-- Tracks job queue state and retry logic
CREATE TABLE IF NOT EXISTS plugin_claude_code_executor.execution_jobs (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES plugin_claude_code_executor.claude_sessions(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  phase_number INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  input_data JSONB,
  output_data JSONB,
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_execution_jobs_status ON plugin_claude_code_executor.execution_jobs(status);
CREATE INDEX idx_execution_jobs_session ON plugin_claude_code_executor.execution_jobs(session_id);
CREATE INDEX idx_execution_jobs_scheduled ON plugin_claude_code_executor.execution_jobs(scheduled_at);

-- ========================================
-- Job Logs Table
-- ========================================
-- Stores execution logs for debugging and monitoring
CREATE TABLE IF NOT EXISTS plugin_claude_code_executor.job_logs (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(255) REFERENCES plugin_claude_code_executor.execution_jobs(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_logs_job ON plugin_claude_code_executor.job_logs(job_id);
CREATE INDEX idx_job_logs_level ON plugin_claude_code_executor.job_logs(level);
CREATE INDEX idx_job_logs_created ON plugin_claude_code_executor.job_logs(created_at);

-- ========================================
-- Grants (if needed for FictionLab user)
-- ========================================
-- GRANT USAGE ON SCHEMA plugin_claude_code_executor TO fictionlab_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA plugin_claude_code_executor TO fictionlab_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA plugin_claude_code_executor TO fictionlab_user;
