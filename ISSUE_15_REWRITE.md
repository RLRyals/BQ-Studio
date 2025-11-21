# Issue #15 (REWRITTEN): Series Architect Plugin - MCP Integration & UI

**Labels:** `plugin`, `series-architect`, `priority-high`, `mcp-integration`
**Effort Estimate:** 4-6 hours
**Epic:** #2 - Series Architect Plugin

---

## 🎯 Overview

Create the **Series Architect plugin** for BQ Studio that connects to the **existing MCP server infrastructure** and provides a UI for visualizing and managing series planning data created via Claude Code Writing Team Agents.

**IMPORTANT:** This issue focuses on **integration and UI**, not rebuilding existing functionality. The data layer (9 MCP servers) and templates (beat sheets, etc.) already exist in `series-architect-2/` and the MCP infrastructure.

---

## 📋 Prerequisites

Before starting this issue, ensure:

- ✅ **Issue #5** is complete and tested (Electron + React + TypeScript setup)
- ✅ **MCP servers are running** (via Docker locally or Cloudflare tunnels)
- ✅ You have both required tokens configured:
  - `ANTHROPIC_API_KEY` - For AI Service (direct Anthropic API calls)
  - `MCP_AUTH_TOKEN` - For authenticating with MCP servers
- ✅ You understand the three-layer architecture:
  - **Layer 1:** Sub-Agents (WHO) - Writing Team (Miranda, Bailey, etc.)
  - **Layer 2:** Skills (HOW) - Workflows (series-planning, book-planning, etc.)
  - **Layer 3:** MCPs (WHAT) - Data Storage (9 servers)

---

## 🏗️ Architecture Context

### Existing Infrastructure

**MCP Servers (Already Running):**
- `author-server` (port 3009) - Author profiles
- `series-planning-server` (port 3002) - Series structure & arcs
- `book-planning-server` (port 3001) - Book outlines & cases
- `chapter-planning-server` (port 3003) - Chapter sequences
- `character-planning-server` (port 3004) - Character knowledge states
- `scene-server` (port 3005) - Scene prose & status
- `core-continuity-server` (port 3006) - World rules & magic systems
- `review-server` (port 3007) - QA & issue tracking
- `reporting-server` (port 3008) - Analytics & metrics

**Existing Templates (Reference):**
- 10 beat sheet frameworks in `series-architect-2/beat_sheet_library/`
- 15 production templates in `series-architect-2/templates/`
- 140+ cliché name detection library
- 40+ Universal Fantasy Taxonomy

**Core Services Available:**
- `PluginManager` - Plugin lifecycle
- `AIService` - Direct Anthropic/OpenAI calls (separate from MCPs)
- `DatabaseService` - Local SQLite (for app metadata, not writing data)
- `FileService` - Templates & exports
- `WorkflowEngine` - Stage-based workflows
- `EventBus` - Cross-plugin communication

---

## 🎯 Primary Tasks

### 1. Create Plugin Structure

Establish the plugin directory and core files:

```
src/plugins/series-architect/
├── plugin.json                 # Plugin manifest
├── index.ts                    # Entry point (plugin class)
├── README.md                   # Documentation
│
├── services/
│   ├── MCPClient.ts           # MCP server communication wrapper
│   └── SeriesArchitectService.ts  # Business logic layer
│
├── ui/
│   ├── SeriesArchitectView.tsx    # Main plugin view
│   ├── components/
│   │   ├── SeriesOverview.tsx     # Series dashboard
│   │   ├── BookList.tsx           # Book management
│   │   ├── BeatSheetSelector.tsx  # Beat sheet library UI
│   │   └── ExportPanel.tsx        # Export controls
│   └── DashboardWidget.tsx    # Dashboard summary widget
│
├── workflows/
│   └── SeriesWorkflow.ts      # 6-stage workflow definition
│
└── types/
    └── index.ts               # TypeScript types
```

### 2. Implement MCP Client Integration

**Create `services/MCPClient.ts`:**
- HTTP client for MCP server communication
- Authentication using `MCP_AUTH_TOKEN`
- Support both localhost (Docker) and Cloudflare tunnel URLs
- Error handling and retry logic
- Type-safe request/response wrappers

**Example Methods:**
```typescript
class MCPClient {
  // Series operations
  async getSeries(seriesId: string): Promise<Series>
  async listSeries(authorId: string): Promise<Series[]>

  // Book operations
  async getBook(bookId: string): Promise<Book>
  async listBooks(seriesId: string): Promise<Book[]>

  // Chapter operations
  async getChapter(chapterId: string): Promise<Chapter>
  async listChapters(bookId: string): Promise<Chapter[]>

  // Character knowledge
  async getCharacterKnowledge(characterId: string, timestamp: string): Promise<KnowledgeState>

  // World rules
  async getWorldRules(seriesId: string): Promise<WorldRule[]>

  // Beat sheets (reference from series-architect-2)
  async getBeatSheets(): Promise<BeatSheet[]>
}
```

**Environment Configuration:**
- Read from `.env`:
  - `MCP_AUTH_TOKEN` - For MCP authentication
  - `MCP_*_SERVER_URL` - Server URLs (9 different servers)
  - `ANTHROPIC_API_KEY` - For optional AI features in UI
- Support switching between localhost and Cloudflare URLs
- Validate connection on plugin activation

### 3. Create Plugin Manifest

**`plugin.json`:**
```json
{
  "id": "series-architect",
  "name": "Series Architect",
  "version": "1.0.0",
  "description": "Multi-book series planning with AI-powered workflows and MCP integration",
  "author": "BQ Studio Team",
  "icon": "book-open",
  "entry": "index.ts",
  "dependencies": [],
  "permissions": [
    "mcp:read",
    "mcp:write",
    "ai:invoke",
    "files:export"
  ],
  "ui": {
    "mainView": "SeriesArchitectView",
    "sidebarIcon": "book-open",
    "dashboardWidget": "DashboardWidget"
  },
  "config": {
    "mcpServers": {
      "author": "${MCP_AUTHOR_SERVER_URL}",
      "seriesPlanning": "${MCP_SERIES_PLANNING_SERVER_URL}",
      "bookPlanning": "${MCP_BOOK_PLANNING_SERVER_URL}",
      "chapterPlanning": "${MCP_CHAPTER_PLANNING_SERVER_URL}",
      "characterPlanning": "${MCP_CHARACTER_PLANNING_SERVER_URL}",
      "scene": "${MCP_SCENE_SERVER_URL}",
      "coreContinuity": "${MCP_CORE_CONTINUITY_SERVER_URL}",
      "review": "${MCP_REVIEW_SERVER_URL}",
      "reporting": "${MCP_REPORTING_SERVER_URL}"
    },
    "mcpAuth": "${MCP_AUTH_TOKEN}"
  }
}
```

### 4. Implement Plugin Entry Point

**`index.ts`:**
```typescript
import { Plugin, PluginContext } from '@/core/plugin-manager';
import { MCPClient } from './services/MCPClient';
import { SeriesArchitectView } from './ui/SeriesArchitectView';
import { DashboardWidget } from './ui/DashboardWidget';

export default class SeriesArchitectPlugin implements Plugin {
  id = 'series-architect';
  name = 'Series Architect';
  version = '1.0.0';

  private mcpClient?: MCPClient;
  private context?: PluginContext;

  async onActivate(context: PluginContext): Promise<void> {
    this.context = context;

    // Initialize MCP client with auth token
    const mcpAuthToken = process.env.MCP_AUTH_TOKEN;
    if (!mcpAuthToken) {
      throw new Error('MCP_AUTH_TOKEN not configured');
    }

    this.mcpClient = new MCPClient({
      authToken: mcpAuthToken,
      servers: {
        author: process.env.MCP_AUTHOR_SERVER_URL,
        seriesPlanning: process.env.MCP_SERIES_PLANNING_SERVER_URL,
        // ... other servers
      }
    });

    // Test connection
    await this.mcpClient.healthCheck();

    context.log('info', 'Series Architect plugin activated');
  }

  async onDeactivate(): Promise<void> {
    // Cleanup
    this.mcpClient = undefined;
    this.context = undefined;
  }

  ui = {
    mainView: SeriesArchitectView,
    dashboardWidget: DashboardWidget
  };

  // Public API for other plugins
  api = {
    getSeries: async (seriesId: string) => {
      return this.mcpClient?.getSeries(seriesId);
    },
    listSeries: async (authorId: string) => {
      return this.mcpClient?.listSeries(authorId);
    }
  };
}
```

### 5. Create Basic UI Components

**`ui/SeriesArchitectView.tsx`:**
- Display list of series from MCP
- Show series overview (title, books, status)
- Quick stats (word count, completion %)
- Navigation to detailed views
- Export buttons

**`ui/DashboardWidget.tsx`:**
- Recent series activity
- Current active series
- Quick actions (open series, start new)
- Word count progress

**Design Guidelines:**
- Use Tailwind CSS (already configured)
- Follow existing Dashboard/Workspace design patterns
- Use Lucide React icons
- Support dark mode (via `themeStore`)
- Responsive design

### 6. Reference Existing Templates

**DO NOT recreate templates** - Reference from `series-architect-2/`:

```typescript
// services/TemplateService.ts
export class TemplateService {
  // Load beat sheets from existing library
  static getBeatSheets(): BeatSheet[] {
    // Reference: series-architect-2/beat_sheet_library/
    return [
      { id: 'three-act', name: 'Three Act Structure', ... },
      { id: 'romance', name: 'Romance Beat Sheet', ... },
      // ... 10 total frameworks
    ];
  }

  // Load templates from existing collection
  static getTemplates(): Template[] {
    // Reference: series-architect-2/templates/
    return [
      { id: 'character-profile', path: '01_character_profile.md', ... },
      { id: 'world-building', path: '02_world_building.md', ... },
      // ... 15 total templates
    ];
  }
}
```

---

## ✅ Acceptance Criteria

### Plugin Infrastructure
- [ ] Plugin directory structure created at `src/plugins/series-architect/`
- [ ] Valid `plugin.json` with MCP configuration
- [ ] Plugin entry point (`index.ts`) implements Plugin interface
- [ ] Plugin loads successfully in PluginManager
- [ ] Plugin appears in BQ Studio plugin list
- [ ] Plugin can be activated/deactivated

### MCP Integration
- [ ] `MCPClient` service created with authentication
- [ ] Successfully connects to all 9 MCP servers
- [ ] Reads series data from `series-planning-server`
- [ ] Reads book data from `book-planning-server`
- [ ] Handles both localhost and Cloudflare tunnel URLs
- [ ] Proper error handling for MCP connection failures
- [ ] Token authentication working (`MCP_AUTH_TOKEN`)

### UI Components
- [ ] Main view displays series list from MCP
- [ ] Dashboard widget shows recent activity
- [ ] UI follows existing BQ Studio design patterns
- [ ] Dark mode support
- [ ] No console errors

### Documentation
- [ ] README.md with setup instructions
- [ ] Environment variable documentation (two tokens explained)
- [ ] MCP server connection guide
- [ ] Usage examples

### Testing
- [ ] Plugin loads without errors
- [ ] Can connect to MCP servers
- [ ] Can fetch and display series data
- [ ] UI renders correctly
- [ ] Can switch between light/dark mode

---

## 🔧 Technical Notes

### Two Token System

**`ANTHROPIC_API_KEY`:**
- Used by: `AIService` in core
- Purpose: Direct API calls to Anthropic (for UI features like "suggest title")
- Stored: Electron encrypted storage
- Scope: App-wide AI features

**`MCP_AUTH_TOKEN`:**
- Used by: MCP client connections
- Purpose: Authenticate with MCP servers
- Stored: `.env` file (not committed)
- Scope: MCP server communication only
- Must match token configured in MCP servers

### MCP vs AI Service

```typescript
// AIService - Direct Anthropic calls for UI features
const suggestion = await context.core.ai.complete({
  provider: 'anthropic',
  prompt: 'Suggest a title for this chapter...'
});

// MCP Client - Read/write structured planning data
const series = await mcpClient.getSeries(seriesId);
const books = await mcpClient.listBooks(seriesId);
```

### Local vs Remote MCP Access

```typescript
// Development (Docker localhost)
MCP_SERIES_PLANNING_SERVER_URL=http://localhost:3002

// Production or Claude Code Web (Cloudflare)
MCP_SERIES_PLANNING_SERVER_URL=https://arms-freebsd-interesting-science.trycloudflare.com
```

---

## 📚 Reference Materials

**Architecture Documentation:**
- `.claude/docs/architecture.md` - BQ Studio architecture
- `.claude/docs/plugin-guide.md` - Plugin development guide
- `.claude/WRITING_TEAM_INTEGRATION_GUIDE.md` - Agent/Skill/MCP architecture

**Existing Code:**
- `series-architect-2/` - Reference implementation, templates, beat sheets
- `src/plugins/example-plugin/` - Plugin structure example
- `src/core/plugin-manager/` - Plugin API
- `.env.example` - Environment configuration

**MCP Servers:**
- Local: `http://localhost:3001-3009`
- Cloudflare URLs: See `.claude/mcp-writing.json`
- Admin UI: `http://localhost:3010` (when running)

---

## 🚫 Out of Scope

This issue does **NOT** include:

- ❌ Reimplementing MCP servers (already exist)
- ❌ Recreating templates or beat sheets (reference existing)
- ❌ Building the 6-stage workflow UI (future issue #16-21)
- ❌ Scene writing interface (Manuscript Writer plugin #24-25)
- ❌ Character knowledge editor (future enhancement)
- ❌ Full CRUD operations (read-only for now)

**Focus:** Get the plugin structure working with basic MCP integration and display capabilities.

---

## 🎯 Success Metrics

When this issue is complete:
1. Plugin shows up in BQ Studio
2. Connects to MCP servers successfully
3. Displays series data created via Claude Code agents
4. Dashboard widget shows activity
5. No authentication errors
6. Works with both token types configured

---

## 📝 Next Steps (Future Issues)

After #15 is complete:
- **#16**: Port Beat Sheet Library UI
- **#17**: Port Template System UI
- **#18**: Implement Stage 1 (Intake) workflow
- **#19-21**: Implement remaining stages
- **#22**: Add write capabilities to MCP

---

## 💡 Tips for Implementation

1. **Start with MCP connection** - Get authentication working first
2. **Test with existing data** - Use series created via Claude Code agents
3. **Reference example-plugin** - Follow existing patterns
4. **Use environment variables** - Don't hardcode URLs or tokens
5. **Handle errors gracefully** - MCP servers might not be running
6. **Keep it simple** - Read-only display for v1
7. **Document both tokens** - Many will be confused about the two-token system

---

## ❓ Questions to Resolve Before Starting

- [ ] Should we support offline mode (cached data)?
- [ ] Should MCP client be a core service or plugin-specific?
- [ ] Do we need a health check UI for MCP servers?
- [ ] Should we add MCP connection status to dashboard?

---

**Related Issues:** #2 (Epic), #5 (Electron setup), #16-21 (Stage implementations)
**Blockers:** Issue #5 must be complete and tested
**Estimated Time:** 4-6 hours
