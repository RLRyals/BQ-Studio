# BQ-Studio → FictionLab Integration Plan

**Date Created:** 2025-12-12
**Status:** Planning Phase
**Goal:** Transform BQ-Studio from a standalone Electron app into a plugin-based workflow system within FictionLab

---

## Executive Summary

BQ-Studio is both a **workflow system** (series planning → chapter writing) and a collection of **specialized plugins** (agents, genre packs, knowledge trackers). This document outlines how to decompose BQ-Studio into FictionLab-compatible plugins and workflows.

### Core Concept
- **BQ-Studio Workflow** = FictionLab workflow executing BQ-Studio plugin actions
- **BQ-Studio Agents** = Plugin-provided workflow steps (actions)
- **Genre Packs** = Plugin-provided configuration and rules
- **Knowledge Tracking** = Plugin services accessible to all workflow steps

---

## Part 1: Architecture Analysis

### FictionLab Plugin System Capabilities

**Plugin Infrastructure:**
- Plugin discovery and loading from `{userData}/plugins/{pluginId}/`
- Manifest-based validation (`plugin.json`)
- Permission-based security model
- Isolated plugin contexts with service injection
- Lifecycle management (load → activate → deactivate → reload)

**Available Services to Plugins:**
1. **Database** - PostgreSQL with isolated schemas per plugin
2. **MCP** - Call tools on registered MCP servers
3. **FileSystem** - Sandboxed file operations
4. **Docker** - Container management (if permitted)
5. **Environment** - App version, paths, variables
6. **UI** - Menu items, notifications, dialogs, views
7. **IPC** - Main ↔ Renderer communication
8. **Config** - Persistent key-value storage (JSON)
9. **Logger** - Prefixed logging

**Workflow Engine Capabilities:**
- Sequential step execution
- Variable substitution (`{{step-id.variable}}`)
- JSONPath output mapping for extracting values
- Conditional step execution
- Transaction logging and audit trail
- Statistics tracking (run count, success rate, timing)

**Plugin Types Supported:**
- `execution-engine` - Core processing logic (BQ-Studio fits here)
- `client` - UI/interaction plugins
- `reporting` - Analytics and dashboards
- `utility` - Helper functions
- `integration` - External service connectors

---

### BQ-Studio Core Components

**Workflow System:**
- Workflow orchestrator with stage dependencies
- State machine for stage lifecycle
- Validation gates between stages
- Snapshot/resume capabilities

**Agent Orchestration:**
- Multi-job queue with configurable concurrency
- Claude Code CLI execution
- Real-time output streaming
- Token usage tracking
- Retry logic with exponential backoff

**Key Services:**
- **AIService** - Multi-provider AI requests (Anthropic + OpenAI)
- **EventBus** - Event-driven communication
- **FileService** - Template processing and export (DOCX/PDF)
- **WorkspaceService** - Project configuration management
- **GenrePackService** - Genre-specific rules and templates

**Agent System:**
- Specialized agents defined as Markdown with YAML frontmatter
- Agent roles: series-architect, bailey-first-drafter, edna-editor, etc.
- Autonomy levels and guardrails
- Cross-agent skill invocation

**Genre Pack System:**
- NPE Physics (Narrative Physics Engine) - behavioral, pacing, plot rules
- Beat sheets, style guides, validation rules
- Character behavioral palettes (V1-V4)
- Relationship architecture patterns

**Content Processing Flow:**
1. Series Planning (multi-book structure)
2. Book Planning (beat sheets, chapter breakdown)
3. Chapter Planning (scene-by-scene beats)
4. Scene Writing (prose generation with knowledge tracking)
5. Review & Validation (consistency, authenticity, pacing)
6. Iteration & Export

---

## Part 2: Integration Strategy

### Approach: Hybrid Plugin + Workflow Architecture

BQ-Studio will be decomposed into:

1. **Core BQ-Studio Plugin** (`execution-engine` type)
   - Provides workflow actions for each agent
   - Manages genre packs
   - Handles knowledge tracking (MCP integration)
   - Provides AI service abstraction
   - Exports file formats (DOCX, PDF)

2. **BQ-Studio Agent Plugins** (optional modular approach)
   - Each major agent as a separate plugin
   - Allows independent updates and customization
   - Smaller, focused responsibilities

3. **BQ-Studio Workflow Definitions** (stored in FictionLab database)
   - Series Planning Workflow
   - Book Planning Workflow
   - Chapter Writing Workflow
   - Review & Validation Workflow

4. **Genre Pack Plugins** (future enhancement)
   - Each genre as a plugin with custom physics
   - Allows community genre contributions

---

## Part 3: Plugin Architecture Design

### Option A: Monolithic BQ-Studio Plugin (Recommended for Phase 1)

**Structure:**
```
plugins/
└── bq-studio/
    ├── plugin.json                      # Main manifest
    ├── src/
    │   ├── index.ts                     # Plugin entry point
    │   ├── agents/                      # Agent implementations
    │   │   ├── SeriesArchitect.ts
    │   │   ├── BaileyFirstDrafter.ts
    │   │   ├── EdnaEditor.ts
    │   │   ├── DetectiveLogan.ts
    │   │   ├── ProfessorMiraWorldbuilding.ts
    │   │   └── MirandaShowrunner.ts
    │   ├── services/
    │   │   ├── AIService.ts             # Multi-provider AI
    │   │   ├── GenrePackService.ts      # Genre pack loading
    │   │   ├── KnowledgeTracker.ts      # Character knowledge via MCP
    │   │   ├── FileExporter.ts          # DOCX/PDF export
    │   │   └── TemplateEngine.ts        # Template processing
    │   ├── workflow-actions/
    │   │   ├── SeriesPlanningAction.ts
    │   │   ├── BookPlanningAction.ts
    │   │   ├── ChapterPlanningAction.ts
    │   │   ├── SceneWritingAction.ts
    │   │   └── ValidationAction.ts
    │   └── ui/
    │       ├── WorkflowDashboard.tsx    # React component
    │       ├── GenrePackBrowser.tsx
    │       └── KnowledgeViewer.tsx
    ├── genre-packs/                     # Bundled genre packs
    │   ├── urban-fantasy/
    │   ├── police-procedural/
    │   └── cozy-mystery/
    └── README.md
```

**plugin.json:**
```json
{
  "id": "bq-studio",
  "name": "BQ Studio - AI Writing Workflow",
  "version": "1.0.0",
  "description": "Complete fiction writing workflow with AI agents, genre packs, and knowledge tracking",
  "author": "BQ Studio Team",
  "pluginType": "execution-engine",
  "fictionLabVersion": "^1.0.0",

  "entry": {
    "main": "dist/index.js",
    "renderer": "dist/ui/index.js"
  },

  "permissions": {
    "database": ["bq_studio"],
    "mcp": [
      "workflow-manager",
      "character-planning-server",
      "core-continuity-server",
      "scene-server",
      "book-planning-server",
      "series-planning-server"
    ],
    "fileSystem": true,
    "network": true,
    "childProcesses": true,
    "clipboard": true,
    "dialogs": true
  },

  "dependencies": {
    "mcpServers": [
      "workflow-manager@^1.0.0",
      "character-planning-server@^1.0.0"
    ]
  },

  "ui": {
    "mainView": "WorkflowDashboard",
    "menuItems": [
      {
        "id": "bq-studio-menu",
        "label": "BQ Studio",
        "submenu": [
          {
            "label": "New Series",
            "action": "new-series"
          },
          {
            "label": "Continue Writing",
            "action": "continue-writing"
          },
          {
            "label": "Genre Packs",
            "action": "open-genre-packs"
          },
          {
            "label": "Knowledge Viewer",
            "action": "open-knowledge-viewer"
          }
        ]
      }
    ],
    "dashboardWidget": "BQStudioWidget",
    "settingsPanel": "BQStudioSettings"
  },

  "workflowActions": [
    {
      "id": "series-planning",
      "name": "Plan Series Structure",
      "description": "Uses Series Architect agent to plan multi-book series",
      "agent": "series-architect"
    },
    {
      "id": "book-planning",
      "name": "Plan Book Outline",
      "description": "Creates detailed book outline with chapters and beats",
      "agent": "book-planner"
    },
    {
      "id": "chapter-planning",
      "name": "Plan Chapter Scenes",
      "description": "Breaks down chapter into scene-by-scene beats",
      "agent": "chapter-planner"
    },
    {
      "id": "scene-writing",
      "name": "Write Scene Prose",
      "description": "Converts scene outline to prose with knowledge tracking",
      "agent": "bailey-first-drafter"
    },
    {
      "id": "validation",
      "name": "Validate Content",
      "description": "Checks consistency, authenticity, and quality",
      "agent": "edna-editor"
    },
    {
      "id": "export",
      "name": "Export Manuscript",
      "description": "Exports to DOCX or PDF with formatting",
      "agent": "exporter"
    }
  ]
}
```

---

### Option B: Modular Multi-Plugin Architecture (Phase 2+)

Each major component as a separate plugin:

```
plugins/
├── bq-studio-core/                  # Core infrastructure
├── bq-studio-series-architect/      # Series planning agent
├── bq-studio-bailey-drafter/        # Scene writing agent
├── bq-studio-edna-editor/           # Editing agent
├── bq-studio-genre-urban-fantasy/   # Genre pack as plugin
├── bq-studio-genre-cozy-mystery/    # Genre pack as plugin
└── bq-studio-knowledge-tracker/     # Knowledge management
```

**Benefits:**
- Independent versioning
- Community contributions (custom agents/genre packs)
- Smaller download sizes
- Modular permissions

**Challenges:**
- More complex dependency management
- Inter-plugin communication overhead
- More manifests to maintain

**Recommendation:** Start with Option A, evolve to Option B as needed.

---

## Part 4: Workflow Definitions

### Workflow 1: Series Planning Workflow

**Stored in FictionLab database as:**
```json
{
  "id": "bq-studio-series-planning",
  "name": "BQ Studio - Series Planning",
  "description": "Plan a complete multi-book series with AI assistance",
  "steps": [
    {
      "id": "gather-input",
      "name": "Gather Series Requirements",
      "pluginId": "bq-studio",
      "action": "gather-series-input",
      "config": {
        "requiredFields": ["genre", "seriesLength", "mainConcept"]
      },
      "outputMapping": {
        "genre": "$.genre",
        "seriesLength": "$.seriesLength",
        "concept": "$.mainConcept"
      }
    },
    {
      "id": "load-genre-pack",
      "name": "Load Genre Pack",
      "pluginId": "bq-studio",
      "action": "load-genre-pack",
      "config": {
        "genre": "{{gather-input.genre}}"
      },
      "outputMapping": {
        "genrePack": "$"
      }
    },
    {
      "id": "architect-series",
      "name": "Architect Series Structure",
      "pluginId": "bq-studio",
      "action": "series-planning",
      "config": {
        "genre": "{{gather-input.genre}}",
        "concept": "{{gather-input.concept}}",
        "bookCount": "{{gather-input.seriesLength}}",
        "genrePack": "{{load-genre-pack.genrePack}}"
      },
      "outputMapping": {
        "seriesId": "$.seriesId",
        "seriesPlan": "$.plan"
      }
    },
    {
      "id": "validate-series",
      "name": "Validate Series Plan",
      "pluginId": "bq-studio",
      "action": "validation",
      "config": {
        "validationType": "series",
        "seriesId": "{{architect-series.seriesId}}",
        "genrePack": "{{load-genre-pack.genrePack}}"
      },
      "condition": "{{architect-series.seriesPlan}} !== null"
    },
    {
      "id": "store-to-mcp",
      "name": "Store to MCP Servers",
      "pluginId": "bq-studio",
      "action": "sync-to-mcp",
      "config": {
        "mcpServer": "series-planning-server",
        "seriesId": "{{architect-series.seriesId}}",
        "data": "{{architect-series.seriesPlan}}"
      }
    }
  ]
}
```

---

### Workflow 2: Chapter Writing Workflow

```json
{
  "id": "bq-studio-chapter-writing",
  "name": "BQ Studio - Chapter Writing",
  "description": "Write a complete chapter with scene-by-scene generation",
  "steps": [
    {
      "id": "load-chapter-plan",
      "name": "Load Chapter Plan",
      "pluginId": "bq-studio",
      "action": "load-chapter-plan",
      "config": {
        "chapterId": "{{workflow.chapterId}}"
      },
      "outputMapping": {
        "scenes": "$.scenes",
        "povCharacter": "$.povCharacter"
      }
    },
    {
      "id": "load-character-knowledge",
      "name": "Load Character Knowledge State",
      "pluginId": "bq-studio",
      "action": "load-knowledge",
      "config": {
        "mcpServer": "character-planning-server",
        "characterId": "{{load-chapter-plan.povCharacter}}",
        "timepoint": "{{load-chapter-plan.chapterStart}}"
      },
      "outputMapping": {
        "knowledgeState": "$"
      }
    },
    {
      "id": "write-scenes",
      "name": "Write All Scenes",
      "pluginId": "bq-studio",
      "action": "scene-writing",
      "config": {
        "scenes": "{{load-chapter-plan.scenes}}",
        "characterKnowledge": "{{load-character-knowledge.knowledgeState}}",
        "agent": "bailey-first-drafter"
      },
      "outputMapping": {
        "sceneTexts": "$.scenes",
        "knowledgeGains": "$.knowledgeUpdates"
      }
    },
    {
      "id": "update-knowledge-state",
      "name": "Update Character Knowledge",
      "pluginId": "bq-studio",
      "action": "update-knowledge",
      "config": {
        "mcpServer": "character-planning-server",
        "knowledgeGains": "{{write-scenes.knowledgeGains}}"
      }
    },
    {
      "id": "validate-chapter",
      "name": "Validate Chapter",
      "pluginId": "bq-studio",
      "action": "validation",
      "config": {
        "validationType": "chapter",
        "chapterId": "{{workflow.chapterId}}",
        "checkKnowledgeConsistency": true,
        "checkGenreCompliance": true
      }
    },
    {
      "id": "export-chapter",
      "name": "Export Chapter",
      "pluginId": "bq-studio",
      "action": "export",
      "config": {
        "chapterId": "{{workflow.chapterId}}",
        "format": "docx"
      },
      "condition": "{{validate-chapter.passed}} === true"
    }
  ]
}
```

---

## Part 5: Implementation Plan

### Phase 1: Core Plugin Infrastructure (Week 1-2)

**Tasks:**
1. Create `bq-studio` plugin directory in FictionLab
2. Implement plugin manifest (`plugin.json`)
3. Create plugin entry point (`src/index.ts`)
4. Implement `PluginContext` integration:
   - Database service access
   - MCP server communication
   - File system operations
   - UI registration (menu items, views)
5. Set up build system (TypeScript compilation)
6. Test plugin loading and activation

**Deliverables:**
- [ ] Plugin skeleton that loads successfully
- [ ] Database schema created (`bq_studio`)
- [ ] Menu items appear in FictionLab
- [ ] Basic logging works

---

### Phase 2: Agent Migration (Week 3-4)

**Tasks:**
1. Port agent definitions to TypeScript classes
2. Implement agent base class with common functionality:
   ```typescript
   abstract class BQStudioAgent {
     constructor(protected context: PluginContext) {}
     abstract execute(input: any): Promise<any>;

     protected async callAI(prompt: string, model: string): Promise<string> {
       // Use FictionLab AI service or direct API
     }

     protected async loadGenrePack(genre: string): Promise<GenrePack> {
       // Load from plugin data directory
     }

     protected async trackKnowledge(update: KnowledgeUpdate): Promise<void> {
       // Call MCP server via context.services.mcp
     }
   }
   ```
3. Implement each agent:
   - SeriesArchitect
   - BaileyFirstDrafter
   - EdnaEditor
   - DetectiveLogan
   - ProfessorMiraWorldbuilding
4. Create workflow actions that invoke agents
5. Test each agent in isolation

**Deliverables:**
- [ ] All agents ported to TypeScript
- [ ] Agents callable via workflow actions
- [ ] Agent outputs properly structured for workflow consumption

---

### Phase 3: Workflow Integration (Week 5-6)

**Tasks:**
1. Create workflow definitions in FictionLab database
2. Implement workflow action handlers in plugin:
   ```typescript
   class BQStudioPlugin implements FictionLabPlugin {
     async onActivate(context: PluginContext) {
       // Register workflow actions
       context.workflow.registerAction('series-planning', async (config) => {
         const agent = new SeriesArchitect(context);
         return await agent.execute(config);
       });

       context.workflow.registerAction('scene-writing', async (config) => {
         const agent = new BaileyFirstDrafter(context);
         return await agent.execute(config);
       });

       // ... register all actions
     }
   }
   ```
3. Implement variable substitution for workflow context
4. Test end-to-end workflow execution
5. Add error handling and retry logic

**Deliverables:**
- [ ] Series Planning Workflow functional
- [ ] Chapter Writing Workflow functional
- [ ] Workflow progress visible in UI
- [ ] Error states handled gracefully

---

### Phase 4: Genre Pack System (Week 7)

**Tasks:**
1. Port genre pack manifests to plugin data directory
2. Implement GenrePackService:
   - Load genre pack from filesystem
   - Parse NPE physics rules
   - Provide beat sheets and templates
3. Integrate genre pack into workflow actions
4. Create Genre Pack Browser UI component
5. Test multiple genre packs

**Deliverables:**
- [ ] Genre packs loadable by plugin
- [ ] Genre-specific rules applied during writing
- [ ] UI for browsing and selecting genre packs

---

### Phase 5: Knowledge Tracking (Week 8)

**Tasks:**
1. Implement MCP server communication for knowledge tracking
2. Create KnowledgeTracker service:
   ```typescript
   class KnowledgeTracker {
     async getCharacterKnowledge(
       characterId: string,
       timepoint: string
     ): Promise<KnowledgeState> {
       return await this.context.services.mcp.callTool(
         'character-planning-server',
         'get-knowledge-state',
         { characterId, timepoint }
       );
     }

     async recordKnowledgeGain(
       characterId: string,
       fact: string,
       sceneId: string
     ): Promise<void> {
       await this.context.services.mcp.callTool(
         'character-planning-server',
         'record-knowledge',
         { characterId, fact, sceneId, timestamp: Date.now() }
       );
     }
   }
   ```
3. Integrate knowledge tracking into scene writing
4. Create Knowledge Viewer UI component
5. Test knowledge consistency validation

**Deliverables:**
- [ ] Character knowledge tracked across scenes
- [ ] MCP servers receive knowledge updates
- [ ] Knowledge Viewer shows character knowledge state
- [ ] Validation catches knowledge inconsistencies

---

### Phase 6: File Export (Week 9)

**Tasks:**
1. Port DOCX/PDF export functionality
2. Implement FileExporter service:
   - Template processing
   - Format conversion
   - Styling and layout
3. Integrate export into workflow
4. Test export formats
5. Add export configuration options

**Deliverables:**
- [ ] DOCX export functional
- [ ] PDF export functional
- [ ] Export formatting matches BQ-Studio original
- [ ] Export accessible from workflow and menu

---

### Phase 7: UI Components (Week 10)

**Tasks:**
1. Create React UI components:
   - WorkflowDashboard - Main workflow control center
   - GenrePackBrowser - Browse and select genre packs
   - KnowledgeViewer - View character knowledge state
   - ValidationResults - Show validation errors
2. Register UI components with FictionLab
3. Implement IPC handlers for UI ↔ main communication
4. Style components to match FictionLab design system
5. Test UI interactions

**Deliverables:**
- [ ] All UI components functional
- [ ] Components accessible from menu
- [ ] Real-time updates during workflow execution
- [ ] Responsive and styled

---

### Phase 8: Testing & Refinement (Week 11-12)

**Tasks:**
1. End-to-end testing:
   - New series creation
   - Complete book writing
   - Multiple genre packs
   - Error scenarios
2. Performance optimization:
   - Workflow execution speed
   - Database query optimization
   - MCP communication efficiency
3. Documentation:
   - Plugin API documentation
   - Workflow guides
   - Agent customization guide
4. Bug fixes and polish

**Deliverables:**
- [ ] All workflows tested end-to-end
- [ ] Performance acceptable (< 5s per scene)
- [ ] Documentation complete
- [ ] Known bugs resolved

---

## Part 6: Technical Details

### Database Schema (PostgreSQL)

**Isolated schema:** `bq_studio`

**Tables:**
```sql
-- Series tracking
CREATE TABLE bq_studio.series (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  book_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Book tracking
CREATE TABLE bq_studio.books (
  id UUID PRIMARY KEY,
  series_id UUID REFERENCES bq_studio.series(id),
  book_number INTEGER NOT NULL,
  title TEXT,
  outline JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chapter tracking
CREATE TABLE bq_studio.chapters (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES bq_studio.books(id),
  chapter_number INTEGER NOT NULL,
  title TEXT,
  scenes JSONB,
  content TEXT,
  word_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Genre pack usage
CREATE TABLE bq_studio.genre_pack_usage (
  series_id UUID REFERENCES bq_studio.series(id),
  genre_pack_id TEXT NOT NULL,
  version TEXT NOT NULL,
  loaded_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (series_id, genre_pack_id)
);

-- Validation results
CREATE TABLE bq_studio.validation_results (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'series', 'book', 'chapter'
  entity_id UUID NOT NULL,
  validation_type TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  issues JSONB,
  validated_at TIMESTAMP DEFAULT NOW()
);
```

---

### MCP Server Integration

**Required MCP Servers:**
1. **workflow-manager** (port 3012)
   - Tools: `get-workflow-state`, `update-workflow-state`
   - Purpose: Track series/book/chapter state

2. **character-planning-server**
   - Tools: `get-knowledge-state`, `record-knowledge`, `query-knowledge`
   - Purpose: Character knowledge tracking

3. **core-continuity-server**
   - Tools: `get-world-rules`, `validate-consistency`
   - Purpose: World rule consistency

4. **scene-server**
   - Tools: `get-scene-metadata`, `update-scene`
   - Purpose: Scene metadata management

**Plugin MCP Communication:**
```typescript
// Example: Get character knowledge
const knowledge = await context.services.mcp.callTool(
  'character-planning-server',
  'get-knowledge-state',
  {
    characterId: 'char-001',
    timepoint: 'chapter-5-end'
  }
);

// Example: Update workflow state
await context.services.mcp.callTool(
  'workflow-manager',
  'update-workflow-state',
  {
    seriesId: 'series-001',
    currentBook: 2,
    currentChapter: 5,
    status: 'in_progress'
  }
);
```

---

### Workflow Action Interface

**Standardized Action Signature:**
```typescript
interface WorkflowAction {
  (config: Record<string, any>, context: WorkflowContext): Promise<ActionResult>;
}

interface ActionResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

interface WorkflowContext {
  workflowId: string;
  runId: string;
  variables: Record<string, any>;
  stepOutputs: Record<string, any>;
}
```

**Example Implementation:**
```typescript
async function seriesPlanningAction(
  config: { genre: string; concept: string; bookCount: number },
  context: WorkflowContext
): Promise<ActionResult> {
  try {
    const agent = new SeriesArchitect(pluginContext);
    const plan = await agent.execute({
      genre: config.genre,
      concept: config.concept,
      bookCount: config.bookCount
    });

    // Store to database
    const seriesId = await storeSeriesPlan(plan);

    // Sync to MCP
    await syncToMCP(seriesId, plan);

    return {
      success: true,
      data: {
        seriesId,
        plan
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        code: 'SERIES_PLANNING_FAILED',
        details: error
      }
    };
  }
}
```

---

### UI Component Registration

**React Component Example:**
```typescript
// src/ui/WorkflowDashboard.tsx
import React from 'react';

export const WorkflowDashboard: React.FC = () => {
  const [workflows, setWorkflows] = React.useState([]);

  React.useEffect(() => {
    // Listen for workflow updates via IPC
    window.electronAPI.on('workflow-update', (event, data) => {
      setWorkflows(prev => updateWorkflow(prev, data));
    });
  }, []);

  return (
    <div className="bq-studio-dashboard">
      <h1>BQ Studio Workflows</h1>
      {workflows.map(workflow => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </div>
  );
};
```

**Registration in Plugin:**
```typescript
// src/index.ts
async onActivate(context: PluginContext) {
  // Register UI view
  context.ui.registerView({
    id: 'workflow-dashboard',
    name: 'Workflow Dashboard',
    component: 'WorkflowDashboard',
    icon: 'dashboard'
  });

  // Register menu item
  context.ui.registerMenuItem({
    id: 'open-dashboard',
    label: 'Open Workflow Dashboard',
    action: () => {
      context.ui.showView('workflow-dashboard');
    }
  });
}
```

---

## Part 7: Migration Checklist

### Pre-Migration
- [ ] FictionLab plugin system fully functional
- [ ] MCP servers running and accessible
- [ ] Development environment set up
- [ ] Test FictionLab instance available

### Core Plugin
- [ ] Plugin directory structure created
- [ ] `plugin.json` manifest complete
- [ ] Entry point (`index.ts`) implemented
- [ ] Build system configured (TypeScript → JavaScript)
- [ ] Plugin loads successfully in FictionLab

### Services
- [ ] AIService ported
- [ ] GenrePackService ported
- [ ] KnowledgeTracker implemented
- [ ] FileExporter ported
- [ ] TemplateEngine ported

### Agents
- [ ] SeriesArchitect ported
- [ ] BaileyFirstDrafter ported
- [ ] EdnaEditor ported
- [ ] DetectiveLogan ported
- [ ] ProfessorMiraWorldbuilding ported
- [ ] MirandaShowrunner ported

### Workflow Actions
- [ ] `series-planning` action registered
- [ ] `book-planning` action registered
- [ ] `chapter-planning` action registered
- [ ] `scene-writing` action registered
- [ ] `validation` action registered
- [ ] `export` action registered

### Workflow Definitions
- [ ] Series Planning Workflow created in database
- [ ] Book Planning Workflow created
- [ ] Chapter Writing Workflow created
- [ ] Review & Validation Workflow created

### UI Components
- [ ] WorkflowDashboard component
- [ ] GenrePackBrowser component
- [ ] KnowledgeViewer component
- [ ] ValidationResults component
- [ ] All components registered with FictionLab

### Database
- [ ] Schema `bq_studio` created
- [ ] All tables created
- [ ] Indexes optimized
- [ ] Migration scripts ready

### MCP Integration
- [ ] All required MCP servers running
- [ ] MCP tool calls functional
- [ ] Knowledge tracking working
- [ ] Workflow state synchronization working

### Testing
- [ ] Unit tests for agents
- [ ] Integration tests for workflows
- [ ] End-to-end test: Create series
- [ ] End-to-end test: Write chapter
- [ ] End-to-end test: Export manuscript
- [ ] Performance tests (workflow execution speed)

### Documentation
- [ ] Plugin README
- [ ] Workflow guides
- [ ] Agent customization guide
- [ ] Genre pack format documentation
- [ ] API documentation for plugin developers

### Deployment
- [ ] Plugin packaged for distribution
- [ ] Version tagging strategy
- [ ] Update mechanism planned
- [ ] Rollback procedure documented

---

## Part 8: Risk Mitigation

### Risk 1: Performance Degradation
**Risk:** Workflow execution slower in FictionLab than standalone BQ-Studio
**Mitigation:**
- Profile workflow execution
- Optimize database queries
- Use connection pooling for MCP
- Implement caching for genre packs
- Consider moving compute-intensive tasks to background workers

### Risk 2: MCP Server Communication Issues
**Risk:** MCP servers unreachable or slow
**Mitigation:**
- Implement retry logic with exponential backoff
- Add fallback to local storage for critical data
- Health checks before workflow execution
- Timeout configuration per MCP server
- Circuit breaker pattern for repeated failures

### Risk 3: Plugin Isolation Breaking Existing Functionality
**Risk:** Permissions/isolation prevent necessary operations
**Mitigation:**
- Request all necessary permissions in manifest
- Test permission boundaries early
- Document permission requirements
- Implement graceful degradation for optional features

### Risk 4: UI Integration Complexity
**Risk:** React components don't integrate cleanly with FictionLab
**Mitigation:**
- Use FictionLab's UI component library
- Follow FictionLab design system
- Test UI in isolation before integration
- Implement UI as progressive enhancement (core functionality works without UI)

### Risk 5: Data Migration Challenges
**Risk:** Existing BQ-Studio data incompatible with new schema
**Mitigation:**
- Create migration scripts early
- Test with real BQ-Studio data
- Support both old and new formats during transition
- Provide rollback mechanism

---

## Part 9: Success Metrics

### Functional Metrics
- [ ] All workflows execute without errors
- [ ] Scene generation time < 5 seconds per scene
- [ ] Knowledge tracking 100% accurate
- [ ] Export formatting matches original BQ-Studio

### Quality Metrics
- [ ] Test coverage > 80%
- [ ] No critical bugs in production
- [ ] Documentation completeness > 90%
- [ ] User satisfaction score > 4/5

### Performance Metrics
- [ ] Workflow execution time comparable to standalone
- [ ] MCP communication latency < 500ms per call
- [ ] Database query time < 100ms (95th percentile)
- [ ] UI responsiveness (< 100ms for interactions)

---

## Part 10: Future Enhancements

### Phase 9: Community Genre Packs (Q2 2026)
- Genre packs as separate plugins
- Community contribution system
- Genre pack marketplace
- Version management for genre packs

### Phase 10: Custom Agent Framework (Q3 2026)
- Agent SDK for custom agent creation
- Agent templates
- Agent testing framework
- Agent marketplace

### Phase 11: Collaborative Writing (Q4 2026)
- Multi-user workflow support
- Real-time collaboration
- Comment/review system
- Version control integration

### Phase 12: Advanced Analytics (Q1 2027)
- Writing statistics dashboard
- Quality metrics tracking
- Progress visualization
- Predictive analytics for completion times

---

## Conclusion

This integration plan transforms BQ-Studio from a standalone application into a powerful, modular plugin system within FictionLab. The hybrid approach (core plugin + workflow definitions) provides:

1. **Flexibility** - Workflows can be customized per user
2. **Modularity** - Agents and genre packs can evolve independently
3. **Integration** - Deep integration with FictionLab's services
4. **Extensibility** - Community can contribute agents and genre packs
5. **Maintainability** - Clear separation of concerns

**Next Steps:**
1. Review this plan with stakeholders
2. Set up development environment
3. Begin Phase 1 (Core Plugin Infrastructure)
4. Iterate based on learnings from each phase

**Timeline:** 12 weeks for Phases 1-8 (core functionality)

**Resources Required:**
- 2 senior developers (full-time)
- 1 QA engineer (half-time)
- Access to FictionLab codebase
- MCP server infrastructure

---

**Document Version:** 1.0
**Last Updated:** 2025-12-12
**Status:** Ready for Review
