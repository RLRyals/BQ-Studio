# BQ Studio Architecture

## Overview
BQ Studio is a modular, plugin-based desktop application for managing AI-powered publishing operations.

## Technology Stack
- **Framework**: Electron (cross-platform desktop)
- **Frontend**: React 18+ with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Database**: SQLite (local-first)
- **AI Integration**: Anthropic SDK, OpenAI SDK
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

## Directory Structure
```
bq-studio/
├── src/
│   ├── main/                   # Electron main process
│   │   ├── app.ts             # Main entry point
│   │   ├── ipc/               # IPC handlers
│   │   └── services/          # Core services (Node.js)
│   │
│   ├── renderer/              # React frontend
│   │   ├── App.tsx           # Root component
│   │   ├── components/       # Shared UI components
│   │   ├── layouts/          # Dashboard, workspace layouts
│   │   ├── hooks/            # Custom React hooks
│   │   └── stores/           # Zustand stores
│   │
│   ├── core/                  # Core framework (shared)
│   │   ├── plugin-manager/   # Plugin loader
│   │   ├── event-bus/        # Event system
│   │   ├── data-store/       # Persistence layer
│   │   ├── ai-service/       # AI orchestration
│   │   ├── file-service/     # File operations
│   │   └── workflow-engine/  # Stage-based workflows
│   │
│   ├── plugins/              # Plugin directory
│   │   ├── series-architect/ # First plugin (5-book series planner)
│   │   ├── manuscript-writer/
│   │   └── penname-manager/
│   │
│   └── types/                # Shared TypeScript types
│
├── database/
│   ├── schema.sql            # Core database schema
│   └── migrations/           # Version migrations
│
├── .claude/                  # Claude Code configuration
│   ├── settings.json         # Project settings
│   ├── docs/                 # Documentation
│   └── commands/             # Slash commands
│
└── series-architect-2/       # Reference implementation
```

## Core Services

### PluginManager
- Discovers and loads plugins from `src/plugins/`
- Validates plugin manifests (`plugin.json`)
- Manages plugin lifecycle (install, activate, deactivate)
- Provides plugin sandboxing

### AIService
- Multi-provider support (Anthropic Claude, OpenAI)
- Token usage tracking and cost management
- Streaming responses
- Context management
- Prompt templates

### DatabaseService
- SQLite wrapper with migrations
- Type-safe queries
- Transaction support
- Plugin schema extensions

### FileService
- Template management
- File import/export
- Directory management
- Multi-format exports (MD, DOCX, PDF, EPUB)

### WorkflowEngine
- Stage-based workflow orchestration
- Progress tracking
- Validation checkpoints
- Resume capability

### EventBus
- Plugin-to-plugin communication
- Event subscription/emission
- Typed events

## Plugin Architecture

### Plugin Manifest (plugin.json)
```json
{
  "id": "plugin-name",
  "name": "Display Name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Author name",
  "icon": "icon-name",
  "entry": "index.ts",
  "dependencies": ["other-plugin-id"],
  "ui": {
    "mainView": "ComponentName",
    "sidebarIcon": "icon-name",
    "dashboardWidget": "WidgetComponentName"
  },
  "data": {
    "schemas": ["table1", "table2"]
  }
}
```

### Plugin Structure
```
src/plugins/my-plugin/
├── plugin.json           # Manifest
├── index.ts             # Entry point
├── ui/                  # React components
│   ├── MainView.tsx
│   └── Widget.tsx
├── services/            # Business logic
│   └── MyService.ts
├── workflows/           # Workflow definitions
│   └── MyWorkflow.ts
├── schemas/             # Database schemas
│   └── schema.sql
└── templates/           # Document templates
    └── template.md
```

### Plugin API
Plugins have access to:
- `core.ai` - AI service
- `core.db` - Database service
- `core.files` - File service
- `core.events` - Event bus
- `core.workflow` - Workflow engine

## Data Flow

1. **User Action** → UI Component
2. **Component** → Store/Service
3. **Service** → Core Service (AI, DB, Files)
4. **Core Service** → External API or Database
5. **Response** → Store → UI Update
6. **Cross-Plugin** → EventBus → Other Plugin

## Workflow System

Workflows are linear, stage-based processes:
1. Each stage has validation requirements
2. Stages emit events on completion
3. Progress saved to database
4. Resume capability via session state

Example (Series Architect):
- Stage 1: Intake & Assessment
- Stage 2: Research Phase
- Stage 3: Series Framework
- Stage 4: Story Dossier Selection
- Stage 5: Book-Level Development
- Stage 6: Output Generation

## Security Considerations

- API keys stored in encrypted storage
- Plugin sandboxing (no file system access outside workspace)
- User consent for external API calls
- Rate limiting on AI requests
- Local-first data (no cloud sync unless explicitly enabled)

## Performance

- Lazy load plugins
- Virtual scrolling for large lists
- Debounced AI requests
- SQLite with indexes
- Background processing for heavy tasks

## Testing Strategy

- Unit tests: Vitest
- Component tests: React Testing Library
- E2E tests: Playwright
- Plugin tests: Isolated test environment
- CI/CD: GitHub Actions

## Development Workflow

1. Create feature branch: `feature/{issue-number}-{description}`
2. Implement with tests
3. Run linter and type checks
4. Create pull request
5. CI runs tests
6. Review and merge
7. Deploy via GitHub releases

## Plugin Development Guide

See [plugin-guide.md](plugin-guide.md) for detailed plugin development instructions.
