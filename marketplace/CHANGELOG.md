# Changelog - BQ Studio Marketplace

## [1.0.0] - 2025-12-12

### 🎉 Initial Release - FictionLab Integration

Complete transformation of BQ-Studio into FictionLab plugin + workflow ecosystem.

---

### Added

#### Core Infrastructure
- **Workflow Engine Integration**: Modified FictionLab's `workflow-engine.ts` to call plugin actions via IPC
- **Claude Code Executor Plugin**: Complete plugin for executing Claude Code skills in headless mode
- **Marketplace Structure**: GitHub-based distribution for workflows, plugins, and skills

#### Workflows
- **book-planning-workflow.json** - 7-phase structured book planning workflow
  - Phase 1: Book Foundation
  - Phase 2: Beat Sheet Selection
  - Phase 3: Act Structure Development
  - Phase 4: Case-of-the-Week Planning
  - Phase 5: Series Arc Integration
  - Phase 6: Character Development Milestones
  - Phase 7: Validation & Review

#### Plugins
- **claude-code-executor v1.0.0**
  - Actions: `execute-skill`, `check-status`, `cancel`
  - Auto-detects Claude Code CLI installation
  - Spawns child processes with proper error handling
  - Returns structured results for workflow mapping
  - Supports phase-by-phase execution
  - Configurable workspace and CLI path

#### Skills
- **book-planning-skill.md** - 7-phase book planning
- **series-planning-skill.md** - 5-phase series architecture
- **chapter-planning-skill.md** - 7-phase chapter structure
- **scene-writing-skill.md** - 4-phase prose generation

#### Documentation
- **README.md** - Complete marketplace documentation
- **QUICK-START.md** - 10-minute setup guide
- **Plugin README** - Detailed plugin usage and API
- **Integration Guide** - Complete architecture overview

---

### Changed

#### From Standalone App to Plugin Ecosystem
- **Before**: BQ-Studio as standalone Electron app
- **After**: Collection of FictionLab plugins + importable workflows

#### Distribution Model
- **Before**: Install entire application
- **After**: Copy plugin, import workflows, install skills

#### Workflow Execution
- **Before**: Direct `AgentOrchestrationService.createJob()`
- **After**: FictionLab workflow engine → plugin actions → Claude Code CLI

---

### Technical Details

#### Modified Files (FictionLab)
- `src/main/workflow-engine.ts`
  - Implemented real plugin action execution
  - Added IPC handler invocation
  - Replaced mock `executeStep()` with production code

#### Created Files (FictionLab)
- `examples/claude-code-executor-plugin/plugin.json`
- `examples/claude-code-executor-plugin/index.ts`
- `examples/claude-code-executor-plugin/package.json`
- `examples/claude-code-executor-plugin/README.md`

#### Created Files (BQ-Studio Marketplace)
- `marketplace/README.md`
- `marketplace/QUICK-START.md`
- `marketplace/CHANGELOG.md`
- `marketplace/workflows/book-planning-workflow.json`
- `marketplace/plugins/claude-code-executor/` (complete plugin)
- `marketplace/skills/*.md` (4 skill files)

---

### Architecture Decisions

1. **Skills Location**: `~/.claude/skills/` (standard Claude Code location)
2. **Marketplace Distribution**: GitHub repo for downloads
3. **Plugin Installation**: Manual copy + build (marketplace in future)
4. **Workflow Format**: JSON files (importable like N8N workflows)
5. **Variable Passing**: `{{step-id.variable}}` syntax
6. **Output Mapping**: JSONPath `$.result.field` format

---

### Breaking Changes

None - this is the initial release for FictionLab integration.

**Migration from Standalone BQ-Studio:**
- Standalone app still works (no changes to BQ-Studio repo core)
- New users should use FictionLab + marketplace
- Old users can migrate by:
  1. Installing FictionLab
  2. Installing the plugin
  3. Importing workflows
  4. Reusing existing `.claude/skills/` files

---

### Dependencies

#### Required
- FictionLab >= 0.1.0
- Claude Code CLI >= 1.0.0
- Node.js >= 18.0.0

#### Optional
- MCP Servers:
  - `workflow-manager` (for series/book planning)
  - `character-planning-server` (for character development)
  - `book-planning-server` (for book structure)

---

### Known Issues

#### Plugin
- None reported (initial release)

#### Workflows
- Nested workflows not yet supported (Phase 4 feature)
- No visual workflow designer (Phase 3 feature)

#### Skills
- All skills require manual approval for MCP write operations (by design)
- Skills location must be `~/.claude/skills/` (Claude Code CLI requirement)

---

### Roadmap

#### Version 1.1.0 (Planned)
- Additional workflows:
  - `series-planning-workflow.json`
  - `chapter-planning-workflow.json`
  - `scene-writing-workflow.json`
- Enhanced error messages
- Progress indicators per phase

#### Version 1.2.0 (Planned)
- `agent-orchestration` plugin (job queue management)
- `genre-pack-manager` plugin (genre configurations)
- `skill-discovery` plugin (skill metadata parsing)

#### Version 2.0.0 (Future)
- Workflow import/export UI in FictionLab
- Visual workflow designer
- Plugin marketplace browser
- One-click installation

---

### Credits

**Development Team:**
- Claude Code integration
- FictionLab workflow engine enhancement
- Plugin architecture design
- Marketplace structure

**Testing:**
- Community alpha testers (TBD)

---

### License

- **Workflows**: MIT License
- **Plugins**: See individual plugin directories
- **Skills**: MIT License
- **Documentation**: CC BY 4.0

---

### Download

**GitHub Repository:**
https://github.com/RLRyals/BQ-Studio

**Installation:**
```bash
git clone https://github.com/RLRyals/BQ-Studio
cd BQ-Studio/marketplace
# Follow QUICK-START.md
```

**Direct Download:**
[Download v1.0.0 ZIP](https://github.com/RLRyals/BQ-Studio/releases/tag/v1.0.0)

---

**Released:** December 12, 2025
**Built with:** FictionLab, Claude Code, lots of coffee ☕
