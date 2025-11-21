# BQ Studio - Revised Roadmap & Issue Strategy

**Date:** 2025-11-21
**Status:** Clarified - CCWeb is temporary detour, not permanent pivot

---

## What Actually Happened

### Original Plan (Still Valid!)
Build Electron desktop app with:
- Electron + React + TypeScript UI
- **Postgres database** (not SQLite - MCPs use Postgres)
- Plugin architecture for extensibility
- Core services (AI, Database, File, Workflow, Event Bus)
- Series Architect, Penname Manager, Manuscript Writer plugins

### Temporary Detour (Next 3 Days)
- Use Claude Code Web to maximize **use-or-lose credits**
- Build Writing Team Agents (9 agents) + Agent Skills (5 skills)
- Connect to MCPs via Cloudflare tunnels
- Validate workflows and gather requirements

### Post-Weekend Integration (The Real Goal)
- **Return to Electron app development**
- **Keep Writing Team Agents and Skills** - they become the "brain"
- Connect Electron UI to Writing Team + MCPs
- Assess if CCWeb + tunnels remain useful or retire them

---

## Issue Status Revision

### ❌ DO NOT CLOSE Issues #5-25

All original issues remain valid! They're just **on hold** during the CCWeb detour.

---

## Issue Updates Needed

### Issue #8: Implement Database Service
**Status:** ✅ Completed but needs update
**Current:** Uses SQLite (better-sqlite3)
**Required:** Change to **Postgres** to match MCPs

**Action After Weekend:**
```
Update Database Service to use Postgres:
- Replace better-sqlite3 with pg or node-postgres
- Update migration system for Postgres syntax
- Maintain same DatabaseService interface
- Connect to same Postgres instance as MCPs
```

**Why:** Your MCPs already use Postgres. Electron app should share that database.

---

### Issues #6-11: Core Services
**Status:** ✅ Completed, ready for integration
**Action:** No changes needed yet, but will integrate with Writing Team

**Integration Strategy:**
- **AI Service** → Can invoke Writing Team Agents programmatically
- **Database Service** → Connect to Postgres (same as MCPs)
- **File Service** → Used by Writing Team for exports
- **Workflow Engine** → Orchestrates Agent Skills from UI
- **Event Bus** → Coordinates between UI, agents, and MCPs
- **Plugin Manager** → Loads plugins that use Writing Team

---

### Issues #15-21: Series Architect Plugin
**Status:** Waiting for Electron app
**New Strategy:** Plugin becomes UI wrapper around Agent Skills

**Architecture:**
```
┌─────────────────────────────────────────┐
│  Electron UI (React)                    │
│  Series Architect Plugin                │
│  - Planning view                        │
│  - Character editor                     │
│  - Chapter organizer                    │
└─────────────────────────────────────────┘
                ↓ invokes
┌─────────────────────────────────────────┐
│  Writing Team Agents (.claude/agents/)  │
│  Miranda, Bailey, Tessa, etc.           │
└─────────────────────────────────────────┘
                ↓ uses
┌─────────────────────────────────────────┐
│  Agent Skills (.claude/skills/)         │
│  series-planning, chapter-planning, etc.│
└─────────────────────────────────────────┘
                ↓ calls
┌─────────────────────────────────────────┐
│  MCP Servers (Postgres)                 │
│  9 servers for data persistence         │
└─────────────────────────────────────────┘
```

**What this means:**
- Electron UI provides visual interface
- User clicks "Plan Chapter" button
- Plugin invokes `chapter-planning-skill` via AI Service
- Skill coordinates Writing Team Agents
- Agents call MCP servers for data
- Results display in Electron UI

**Best of both worlds!**

---

## Next 3 Days: CCWeb Sprint Strategy

### Goal: Maximize Free Credits by Building & Testing Writing Team

#### Day 1 (Today) - Validation ✅
- [x] Writing Team Agents created (9 agents)
- [x] Agent Skills created (5 skills)
- [x] MCP configurations created
- [x] Cloudflare tunnel automation
- [ ] **Test one complete workflow** (series planning → book → chapter → scene)

#### Day 2 (Tomorrow) - Testing & Refinement
- [ ] Test all 5 Agent Skills with real content
- [ ] Document pain points and failure modes
- [ ] Refine agent prompts based on testing
- [ ] Validate MCP permission-based operations
- [ ] Test character knowledge tracking (Tessa agent)
- [ ] Create example session transcript

#### Day 3 (Weekend) - Documentation & Requirements
- [ ] Document what worked well
- [ ] Document what needs improvement
- [ ] Write integration requirements for Electron app
- [ ] Create "Writing Team Integration Spec" for post-weekend work
- [ ] Finalize agent prompt improvements
- [ ] Plan Electron UI mockups that leverage Writing Team

**Output:** Validated Writing Team ready to integrate into Electron app

---

## Post-Weekend: Electron + Writing Team Integration

### Phase 1: Core Framework (Week 1)
**Resume Issues #5, #12-13:**

1. **Issue #5: Set up Electron + React + TypeScript**
   - Use existing package.json as starting point
   - Add Writing Team agent invocation capabilities
   - Connect to local Postgres (not SQLite)

2. **Issue #12: Create Dashboard Layout**
   - Dashboard shows: Active projects, recent work, quick actions
   - "Plan New Series" button → invokes series-planning-skill
   - Recent chapters/scenes feed from MCP servers

3. **Issue #13: Create Workspace Layout**
   - Left sidebar: Project tree (series → books → chapters → scenes)
   - Center panel: Content editor
   - Right sidebar: Writing Team chat interface
   - Bottom panel: Agent activity log

**Key Addition:** Chat interface where user can talk to Writing Team like in CCWeb

---

### Phase 2: Writing Team Integration (Week 2)
**New Issues to Create:**

#### Issue #26: Integrate Writing Team Agents into AI Service
**Description:**
```
Update AIService.ts to support Writing Team agent invocation:

- Add `invokeAgent(agentName, prompt)` method
- Map agent names to .claude/agents/*.md files
- Stream agent responses to UI
- Log agent interactions to Event Bus
- Handle agent coordination (Miranda → Bailey → Tessa flow)

Integration points:
- Agent responses appear in right sidebar chat
- User can invoke specific agents or let system choose
- Agents can trigger UI updates (e.g., "Chapter saved to database")

Files to update:
- src/core/ai-service/AIService.ts
- src/core/ai-service/AgentCoordinator.ts (new)
```

---

#### Issue #27: Integrate Agent Skills into Workflow Engine
**Description:**
```
Connect Agent Skills to Workflow Engine:

- Each Agent Skill becomes a workflow stage
- UI buttons trigger skill invocation
- Skills execute via AI Service
- Progress shown in UI with status updates
- Results saved to Postgres via MCPs

Example workflow:
1. User clicks "Plan Chapter 5"
2. WorkflowEngine invokes chapter-planning-skill
3. Skill coordinates Miranda → Dr. Viktor → Detective Logan
4. Each agent's work streams to UI chat
5. Final chapter plan saves to chapter-planning-server MCP
6. UI updates chapter tree with new plan

Files to update:
- src/core/workflow-engine/WorkflowEngine.ts
- src/core/workflow-engine/SkillAdapter.ts (new)
```

---

#### Issue #28: Connect Database Service to Postgres
**Description:**
```
Update Database Service from SQLite to Postgres:

- Replace better-sqlite3 with pg
- Update migration system for Postgres syntax
- Connect to same Postgres instance as MCPs
- Update schema to match MCP server expectations
- Maintain existing DatabaseService interface

Configuration:
- Read Postgres connection from environment
- Support local development (Docker) and production
- Connection pooling for performance

Files to update:
- src/core/database-service/DatabaseService.ts
- src/core/database-service/migrations/*.sql (update syntax)
- package.json (remove better-sqlite3, add pg)
```

---

#### Issue #29: Add MCP Server Communication Layer
**Description:**
```
Create MCP client in Electron app:

- Electron main process connects to MCP servers
- IPC bridge between renderer and MCP servers
- Handle authentication (MCP_AUTH_TOKEN)
- Connection management (reconnect on failure)
- Request queuing and retry logic

Architecture:
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ React UI     │  IPC    │ Electron     │  HTTP   │ MCP Servers  │
│ (Renderer)   │ <-----> │ Main Process │ <-----> │ (Docker)     │
└──────────────┘         └──────────────┘         └──────────────┘

New files:
- src/main/mcp/MCPClient.ts
- src/main/mcp/MCPBridge.ts
- src/renderer/hooks/useMCPQuery.ts
```

---

#### Issue #30: Build Series Architect Plugin UI
**Description:**
```
Create Series Architect plugin with UI:

- Series overview dashboard
- Book planning workspace
- Chapter planner with beat sheets
- Scene editor with Writing Team chat
- Export pipeline UI

Features:
- Click "Plan Series" → invokes series-planning-skill
- Chat with Miranda for guidance
- Character editor invokes Dr. Viktor agent
- Scene drafts by Bailey appear in real-time
- Tessa runs continuity checks on demand

Plugin structure:
src/plugins/series-architect/
├── plugin.json
├── views/
│   ├── SeriesOverview.tsx
│   ├── BookPlanner.tsx
│   ├── ChapterPlanner.tsx
│   └── SceneEditor.tsx
├── components/
│   └── WritingTeamChat.tsx
└── hooks/
    └── useAgentSkill.ts
```

---

### Phase 3: Testing & Polish (Week 3)
**Resume Issue #14:**

Update scope to cover:
- Agent Skills integration testing
- MCP server connectivity tests
- UI component tests
- E2E workflow tests (series planning → manuscript export)

---

## Database Architecture Decision

### ✅ Postgres (Your Choice)
**Pros:**
- ✅ MCPs already use Postgres
- ✅ Single source of truth
- ✅ Better for concurrent access
- ✅ More powerful queries
- ✅ Better JSON support

**Cons:**
- ⚠️ Requires Postgres running (Docker)
- ⚠️ Slightly more complex setup

**Recommendation:** Stick with Postgres. Your MCPs use it, so Electron app should too.

---

## Cloudflare Tunnels: Reassessment Criteria

### After Free Credits End, Ask:

1. **Do you still use CCWeb frequently?**
   - If YES → Keep tunnels for remote access
   - If NO → Remove tunnels, MCP servers only accessible via Electron app

2. **Do Writing Team Agents work better in CCWeb or Electron?**
   - If CCWeb → Keep tunnels, Electron app calls CCWeb agents
   - If Electron → Remove tunnels, agents invoked locally via AI Service

3. **Do you collaborate with others remotely?**
   - If YES → Keep tunnels for team access
   - If NO → Local Electron app sufficient

**Likely outcome:** Remove tunnels, keep Writing Team agents as prompts that Electron app invokes.

---

## File Structure After Integration

```
bq-studio/
├── src/
│   ├── main/                    # Electron main process
│   │   └── mcp/                 # MCP client (new)
│   ├── renderer/                # React UI
│   │   └── components/
│   │       └── WritingTeamChat.tsx  # Chat with agents (new)
│   ├── core/                    # Core services
│   │   ├── plugin-manager/      # ✅ Keep
│   │   ├── ai-service/          # ✅ Keep + update for agents
│   │   ├── database-service/    # ✅ Keep + change to Postgres
│   │   ├── file-service/        # ✅ Keep
│   │   ├── workflow-engine/     # ✅ Keep + integrate skills
│   │   └── event-bus/           # ✅ Keep
│   └── plugins/
│       └── series-architect/    # Uses Writing Team
│
├── .claude/                     # Claude Code config (keep!)
│   ├── agents/                  # ✅ Keep - used by Electron
│   │   ├── miranda-showrunner.md
│   │   ├── bailey-first-drafter.md
│   │   └── ... (9 agents)
│   ├── skills/                  # ✅ Keep - used by Electron
│   │   ├── series-planning-skill.md
│   │   └── ... (5 skills)
│   ├── mcp.json                 # ✅ Keep - local MCP config
│   ├── mcp-web.json             # ⚠️ Reassess after credits
│   ├── WRITING_TEAM_INTEGRATION_GUIDE.md  # ✅ Keep + update
│   └── TUNNEL_SETUP_GUIDE.md    # ⚠️ May remove
│
├── start-cloudflare-tunnels.sh  # ⚠️ May remove
└── docker-compose.yml           # Postgres + MCP servers
```

---

## Updated Issue Priorities

### Next 3 Days (CCWeb Sprint)
**Focus:** Test and refine Writing Team
- No GitHub issue updates needed
- Use free credits to validate agents and skills
- Document learnings for Electron integration

### After Weekend (Electron Integration)
**Week 1:** Resume Electron app foundation
- Issue #5: Set up Electron + React + TypeScript
- Issue #12: Create Dashboard Layout
- Issue #13: Create Workspace Layout

**Week 2:** Integrate Writing Team
- Issue #26 (new): Integrate Writing Team Agents into AI Service
- Issue #27 (new): Integrate Agent Skills into Workflow Engine
- Issue #28 (new): Connect Database Service to Postgres
- Issue #29 (new): Add MCP Server Communication Layer

**Week 3:** Build Series Architect Plugin
- Issue #30 (new): Build Series Architect Plugin UI
- Issue #14: Set up Testing Infrastructure (updated scope)

**Week 4:** Remaining plugins
- Issue #22-23: Penname Manager Plugin
- Issue #24-25: Manuscript Writer Plugin

---

## Key Decisions Documented

### ✅ Database: Postgres
- Matches MCPs
- Single source of truth
- Update Issue #8 after weekend

### ✅ Writing Team: Keep Forever
- Agents (.claude/agents/) are the "brain"
- Skills (.claude/skills/) are the workflows
- Work in both CCWeb and Electron
- Electron UI invokes them programmatically

### ⏳ Cloudflare Tunnels: Reassess After Credits
- Useful for next 3 days
- May remove after CCWeb usage drops
- Decision point: After free credits end

### ✅ Architecture: Hybrid
- Electron provides UI and local app experience
- Writing Team provides AI intelligence
- MCP servers provide data persistence
- Best of all approaches

---

## Success Metrics

### Next 3 Days
- [ ] Complete at least 1 full series planning workflow in CCWeb
- [ ] Test all 5 Agent Skills with real content
- [ ] Document 10+ learnings for Electron integration
- [ ] Refine agent prompts based on testing

### After Weekend (Week 1)
- [ ] Electron app launches with basic UI
- [ ] Dashboard shows MCP server connection status
- [ ] Can invoke Writing Team agents from UI chat

### Week 2
- [ ] Agent Skills execute from Electron UI
- [ ] Postgres database connected
- [ ] MCP servers accessible from Electron

### Week 3
- [ ] Series Architect plugin functional
- [ ] Can plan series → book → chapter → scene entirely in Electron
- [ ] Writing Team chat works in UI

---

## Summary

### What Changed
- **Nothing!** Electron app is still the goal
- CCWeb is a **3-day sprint** to maximize free credits
- Writing Team is a **permanent addition** that works in both contexts

### What Stays
- All original issues (#5-25) remain valid
- All completed core services (#6-11) will be used
- Postgres replaces SQLite (Issue #8 needs update)

### What's New
- 9 Writing Team Agents (the "brain")
- 5 Agent Skills (the workflows)
- MCP server integration
- Hybrid architecture: Electron UI + Writing Team intelligence

### Next Actions
1. **Next 3 days:** Use CCWeb to test Writing Team extensively
2. **After weekend:** Resume Electron app development
3. **Week 2:** Integrate Writing Team into Electron
4. **Week 3:** Build Series Architect plugin with UI

---

**This is the real roadmap.** 🎯

The Writing Team you built this week becomes the intelligence layer that powers the Electron app's UI. Nothing was wasted - you're building the "brain" now, and you'll build the "body" (UI) after the weekend.

Smart use of free credits! 💡
