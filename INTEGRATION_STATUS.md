# FictionLab + BQ-Studio Integration Status
**Last Updated:** 2025-12-07  
**Purpose:** State document for continuing integration work in a new chat

---

## System Architecture

### FictionLab (Core Product) - COMPLETE ✅

**What it is:**
- Electron app that manages Docker infrastructure
- Runs PostgreSQL database + PgBouncer
- Hosts 12 MCP servers (ports 3001-3012)
- Provides dashboard for system monitoring
- Connects to TypingMind and Claude Desktop

**Key Features:**
- ✅ Auto-starts Docker Desktop when not running
- ✅ Force rebuilds Docker image on update (ensures Dockerfile changes take effect)
- ✅ Repository manager (can clone external repos like BQ-Studio)
- ✅ Database migrations system
- ✅ Environment configuration wizard

**Ports:**
- 5432: PostgreSQL
- 6432: PgBouncer
- 3001-3010: Core MCP servers
- 3011: NPE Server
- 3012: Workflow Manager Server
- 50880: MCP Connector (bridge for TypingMind)
- 3000: TypingMind web UI

**Key Files:**
- `docker-compose.yml` - Port mappings and service definitions
- `src/main/mcp-system.ts` - Docker management, auto-start logic
- `src/main/updater.ts` - Update logic, force rebuild
- `src/main/database-migrator.ts` - Migration runner

---

### MCP-Writing-Servers (Backend) - COMPLETE ✅

**What it is:**
- Docker container with 12 MCP servers
- All servers use shared PostgreSQL database
- Runs on Node.js with HTTP/SSE transport

**Servers:**
1. Port 3001: Book Planning
2. Port 3002: Series Planning
3. Port 3003: Chapter Planning
4. Port 3004: Character Planning
5. Port 3005: Scene
6. Port 3006: Core Continuity
7. Port 3007: Review
8. Port 3008: Reporting
9. Port 3009: Author
10. Port 3010: Database Admin
11. Port 3011: NPE (Narrative Physics Engine)
12. Port 3012: Workflow Manager ⭐ NEW

**Workflow Manager MCP (Port 3012):**
- ✅ Fully implemented (20+ tools)
- ✅ Database schema (9 tables via migration 027)
- ✅ Server loads on startup
- ✅ Health endpoint works: `http://localhost:3012/health`
- ✅ Uses SSE (Server-Sent Events) protocol

**Key Files:**
- `Dockerfile` - Exposes all ports including 3011, 3012
- `src/http-sse-server.js` - Loads all MCP servers
- `src/mcps/workflow-manager-server/index.js` - Workflow Manager implementation
- `migrations/027_workflow_manager.sql` - Database schema
- `migrations/023_npe_tables.sql` - NPE schema (fixed)

---

### BQ-Studio (Plugin) - PARTIAL 🔶

**What it is:**
- Electron app for novel writing UI
- Plugin architecture for extensibility
- Designed to connect to FictionLab's MCP servers

**Current Status:**
- ✅ Standalone Electron app exists
- ✅ Series Architect reference implementation
- ✅ `.claude/skills/market-driven-planning-skill.md` defined
- ✅ `src/services/WorkflowManagerClient.ts` created
- ❌ NOT integrated with FictionLab
- ❌ NOT tested with Workflow Manager MCP

**Key Files:**
- `.claude/skills/market-driven-planning-skill.md` - AI skill for Claude Code
- `src/services/WorkflowManagerClient.ts` - MCP client (needs revision)
- `src/core/workflow-engine/Workflow.ts` - Local workflow state management
- `series-architect-2/` - Reference implementation

**Issue Discovered:**
- `WorkflowManagerClient.ts` uses REST API approach
- MCP servers use SSE (Server-Sent Events) protocol
- Client needs to be rewritten OR use MCP Connector bridge

---

## Integration Status

### What Works ✅
1. **FictionLab → Docker:** Manages containers perfectly
2. **FictionLab → PostgreSQL:** Database running, migrations applied
3. **FictionLab → MCP Servers:** All 12 servers running
4. **Port 3012:** Accessible, health check passes
5. **Workflow Manager:** Loaded and ready

### What Doesn't Work ❌
1. **BQ-Studio → Workflow Manager:** Client uses wrong protocol
2. **Claude Code → Workflow Manager:** Not configured yet
3. **End-to-End Workflow:** Not tested

---

## Connection Methods

### Method 1: Claude Code via stdio (Recommended for AI)
**How it works:**
- Claude Code connects to MCP via `docker exec` (stdio)
- No HTTP/SSE needed
- Uses `.claude/skills/market-driven-planning-skill.md`

**Status:** ✅ Completed

**Configuration needed:**
```json
// In Claude Code's MCP config
{
  "mcpServers": {
    "workflow-manager": {
      "command": "docker",
      "args": ["exec", "-i", "fictionlab-mcp-servers", "node", "/app/src/mcps/workflow-manager-server/stdio-adapter.js"]
    }
  }
}
```

**Solution:** ✅ `stdio-adapter.js` created at `c:\github\MCP-Writing-Servers\src\mcps\workflow-manager-server\stdio-adapter.js`

---

### Method 2: BQ-Studio via MCP Connector (Recommended for UI)
**How it works:**
- BQ-Studio → MCP Connector (port 50880) → MCP Servers
- MCP Connector bridges HTTP to MCP protocol
- Already running in FictionLab

**Status:** Not implemented

**What's needed:**
- Rewrite `WorkflowManagerClient.ts` to use MCP Connector
- Or use existing MCP Connector client library

---

### Method 3: BQ-Studio via Direct SSE (Complex)
**How it works:**
- BQ-Studio → Direct SSE connection → Workflow Manager (port 3012)
- Implements full MCP SSE protocol

**Status:** Not implemented

**What's needed:**
- Complete SSE client implementation
- Message framing, JSON-RPC handling
- Not recommended (too complex)

---

## Deployment Options

### Option A: BQ-Studio as Standalone App
**Pros:**
- User runs BQ-Studio separately from FictionLab
- Simpler to develop and test
- Clear separation of concerns

**Cons:**
- User manages two apps
- No unified dashboard

**Status:** Current state

---

### Option B: BQ-Studio as FictionLab Plugin
**Pros:**
- FictionLab clones and manages BQ-Studio
- Unified dashboard
- Single app for user

**Cons:**
- More complex integration
- FictionLab needs plugin UI

**Status:** Not implemented

**What's needed:**
- FictionLab plugin manager UI
- BQ-Studio launch integration
- Status monitoring in FictionLab dashboard

---

## Next Steps (Decision Points)

### 1. Choose Connection Method
**Question:** How should BQ-Studio connect to Workflow Manager?
- **Option A:** Via MCP Connector (port 50880) - Easier
- **Option B:** Direct SSE (port 3012) - More complex
- **Option C:** Only via Claude Code (stdio) - AI-only

### 2. Choose Deployment Model
**Question:** How should BQ-Studio be deployed?
- **Option A:** Standalone app (current)
- **Option B:** FictionLab plugin (future)

### 3. Define Use Cases
**Question:** Who uses BQ-Studio and how?
- **Use Case 1:** AI agent (Claude Code) orchestrates workflow
- **Use Case 2:** User clicks buttons in BQ-Studio UI
- **Use Case 3:** Both (AI + UI)

### 4. Scope the Plugin
**Question:** What should BQ-Studio actually do?
- **Minimal:** Just UI for viewing workflow status
- **Medium:** UI for triggering workflows + viewing status
- **Full:** Complete novel writing IDE with AI integration

---

## Technical Debt

### FictionLab
- ✅ All major issues resolved
- ✅ Docker auto-start working
- ✅ Force rebuild on update working

### MCP-Writing-Servers
- ✅ All servers implemented
- ✅ Workflow Manager complete
- ✅ stdio adapter for Claude Code created

### BQ-Studio
- ❌ WorkflowManagerClient uses wrong protocol
- ❌ No integration with FictionLab
- ❌ No end-to-end testing

---

## Files Modified in This Session

### FictionLab (MCP-Electron-App)
1. `docker-compose.yml` - Added ports 3011, 3012
2. `src/main/mcp-system.ts` - Added `startDockerDesktop()` function
3. `src/main/updater.ts` - Added container cleanup after build

### MCP-Writing-Servers
1. `Dockerfile` - Exposed ports 3011, 3012
2. `docker-compose.yml` - Mapped ports 3011, 3012
3. `src/http-sse-server.js` - Added Workflow Manager server loading
4. `migrations/023_npe_tables.sql` - Fixed missing character_id column
5. `migrations/027_workflow_manager.sql` - Created (9 tables)
6. `src/mcps/workflow-manager-server/index.js` - Implemented (20+ tools)
7. `src/mcps/workflow-manager-server/stdio-adapter.js` - ✅ NEW: Created for Claude Code integration

### BQ-Studio
1. `src/services/WorkflowManagerClient.ts` - Created (needs revision)
2. `scripts/test-workflow-connection.ts` - Created (health check works)
3. `workflow-dashboard.html` - ✅ NEW: Visual progress dashboard with configuration instructions
4. `CONFIGURATION_GUIDE.md` - ✅ NEW: Complete setup guide for all platforms
5. `INTEGRATION_STATUS.md` - Updated with stdio adapter completion

---

## Current State Summary

**FictionLab Core:** ✅ Production ready
- All infrastructure working
- All MCP servers running
- Port 3012 accessible

**Workflow Manager MCP:** ✅ Implementation complete
- Server running
- Database ready
- Health check passes

**BQ-Studio Integration:** 🔶 Needs architecture decision
- Client code exists but wrong protocol
- Need to decide: MCP Connector vs Direct SSE vs Claude Code only
- Need to define scope and use cases

---

## Questions for Next Chat

1. **Primary Use Case:** Is BQ-Studio primarily for AI (Claude Code) or for human users clicking buttons?

2. **Connection Method:** Should BQ-Studio use MCP Connector (easier) or direct SSE (harder)?

3. **Deployment Model:** Standalone app or FictionLab plugin?

4. **Scope:** What features should BQ-Studio actually have?

5. **Timeline:** What's the MVP? What can wait?

---

## Resources

### Documentation
- [WORKFLOW_MANAGER_MCP.md](file:///c:/github/MCP-Writing-Servers/WORKFLOW_MANAGER_MCP.md) - Complete design
- [SYSTEM_ARCHITECTURE_MAP.md](file:///c:/github/BQ-Studio/SYSTEM_ARCHITECTURE_MAP.md) - 12-phase workflow
- [market-driven-planning-skill.md](file:///c:/github/BQ-Studio/.claude/skills/market-driven-planning-skill.md) - AI skill

### Key Endpoints
- Health: `http://localhost:3012/health` ✅ Works
- MCP Connector: `http://localhost:50880` ✅ Running
- PostgreSQL: `localhost:5432` ✅ Running
- PgBouncer: `localhost:6432` ✅ Running

### Test Commands
```bash
# Health check
curl http://localhost:3012/health

# Check container
docker ps --filter "name=fictionlab-mcp-servers"

# Check ports
docker port fictionlab-mcp-servers

# Check logs
docker logs fictionlab-mcp-servers --tail 50

# Test BQ-Studio connection (currently fails on MCP calls)
cd c:\github\BQ-Studio
npx tsx scripts/test-workflow-connection.ts
```

---

## Token Usage Note
This chat reached 126K tokens. Starting a new chat for big picture discussion is recommended.

---

**Ready for new chat to discuss:**
- BQ-Studio plugin goals and scope
- Architecture decisions
- Integration approach
- MVP definition
