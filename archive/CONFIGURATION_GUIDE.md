# BQ-Studio Configuration Guide
**Last Updated:** 2025-12-07  
**Version:** 1.0 - Claude Code First Target

---

## Quick Start: Claude Code in Antigravity IDE

### Prerequisites
✅ FictionLab installed and running  
✅ Docker containers active (check with `docker ps`)  
✅ Workflow Manager MCP running on port 3012  
✅ stdio-adapter.js created in MCP-Writing-Servers

### Step 1: Ensure FictionLab is Running

**FictionLab handles all infrastructure automatically!**

Simply open FictionLab - it will:
- ✅ Start Docker Desktop if needed
- ✅ Launch all MCP servers (including Workflow Manager on port 3012)
- ✅ Set up the database
- ✅ Configure all connections

**How to verify everything is ready:**
1. Open FictionLab
2. Look at the dashboard - all services should show as "Running" (green status)
3. If anything shows as "Offline", click the "Start/Restart System" button in FictionLab

**That's it!** No command-line needed. FictionLab does everything for you.

### Step 2: Configure Claude Code MCP

**For Antigravity IDE:**

1. Open your workspace settings
2. Locate the MCP configuration section
3. Add the Workflow Manager configuration:

```json
{
  "mcpServers": {
    "workflow-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "fictionlab-mcp-servers",
        "node",
        "/app/src/mcps/workflow-manager-server/stdio-adapter.js"
      ]
    }
  }
}
```

**Alternative: Manual Configuration File**

If your IDE uses a separate config file, create or edit:
- Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

### Step 3: Restart Your IDE

Completely close and restart Antigravity to load the new MCP configuration.

### Step 4: Test the Connection

In Claude Code, ask:

```
Can you list the available MCP tools?
```

**Expected:** You should see 20+ workflow management tools including:
- `create_workflow`
- `get_workflow_state`
- `advance_to_phase`
- `complete_current_phase`
- `record_production_metric`
- etc.

### Step 5: Start Using the Workflow

Reference the market-driven planning skill:

```
I want to use the market-driven planning skill to develop a romantasy series.
My concept is: [Your concept here]
```

Claude Code will orchestrate the 12-phase workflow using the Workflow Manager MCP.

---

## Slash Commands (Conceptual)

While working with Claude Code, you can use natural language that maps to workflow phases:

| User Intent | What Happens | MCP Tools Used |
|-------------|--------------|----------------|
| "Start a new workflow for my series" | Creates workflow instance | `create_workflow` |
| "What's my current workflow status?" | Shows current phase and progress | `get_workflow_state` |
| "Complete this phase and move to next" | Advances workflow | `complete_current_phase` |
| "Run market research for romantasy" | Executes Phase 2 | `execute_phase` (phase 2) |
| "Show my writing metrics" | Displays production stats | `get_workflow_metrics` |
| "What's my writing velocity?" | Calculates words/day | `get_workflow_velocity` |

---

## Configuration for Other Platforms

### Claude Desktop

**Config File Location:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "workflow-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "fictionlab-mcp-servers",
        "node",
        "/app/src/mcps/workflow-manager-server/stdio-adapter.js"
      ]
    }
  }
}
```

**Restart:** Completely quit and restart Claude Desktop

---

### TypingMind (via MCP Connector)

**Connection Method:** HTTP via MCP Connector bridge

**Endpoint:** `http://localhost:50880`

**Steps:**
1. Verify MCP Connector is running: `curl http://localhost:50880/health`
2. In TypingMind settings, add custom MCP endpoint
3. Point to: `http://localhost:50880/mcp/workflow-manager`

**Note:** Specific TypingMind configuration depends on their MCP integration implementation (coming soon)

---

### Future Clients

BQ-Studio supports three connection methods:

#### 1. stdio (Docker Exec) - For AI Clients
```bash
docker exec -i fictionlab-mcp-servers node /app/src/mcps/workflow-manager-server/stdio-adapter.js
```

**Best for:** Claude Code, Claude Desktop, AI-driven workflows

#### 2. HTTP/SSE (Direct) - For Custom Apps
```
http://localhost:3012
```

**Best for:** Custom applications, direct integration, BQ-Studio Electron app (future)

#### 3. MCP Connector (Bridge) - For Web Apps
```
http://localhost:50880
```

**Best for:** TypingMind, web-based clients, browser extensions

---

## Troubleshooting

### Issue: "Cannot connect to MCP server"

**Solution:**
1. Verify FictionLab is running: `docker ps`
2. Check Workflow Manager health: `curl http://localhost:3012/health`
3. Verify stdio-adapter.js exists: `docker exec fictionlab-mcp-servers ls -la /app/src/mcps/workflow-manager-server/stdio-adapter.js`
4. Check Docker logs: `docker logs fictionlab-mcp-servers --tail 50`

### Issue: "stdio-adapter.js not found"

**Solution:**
Use FictionLab's built-in update feature:
1. Open FictionLab
2. Click the "Update MCP Writing Servers" button in the dashboard
3. FictionLab will automatically rebuild the container with the new stdio-adapter.js file
4. Wait for the update to complete (FictionLab will show progress)

**No command-line needed!** FictionLab handles the rebuild for you.

### Issue: "No MCP tools showing in Claude Code"

**Solution:**
1. Verify MCP configuration is in the correct location
2. Check JSON syntax (use a JSON validator)
3. Restart IDE completely (not just reload window)
4. Check IDE console for MCP connection errors

### Issue: "Database connection failed"

**Solution:**
1. Verify PostgreSQL is running: `docker ps --filter "name=postgres"`
2. Check database migrations: Look in FictionLab dashboard
3. Verify environment variables in FictionLab

---

## Monitoring Workflow Progress

### Option 1: HTML Dashboard (Visual - Recommended)

**Location:** `c:\github\BQ-Studio\workflow-dashboard.html`

**How to use:**
1. Open the file in your web browser (double-click it)
2. Select your series from the dropdown
3. Watch the progress automatically update every 10 seconds

**Features:**
- 📊 Visual phase progress with color coding
- 📚 Series selection dropdown - switch between multiple series
- 🔄 Auto-refresh every 10 seconds (no manual refresh needed!)
- 📈 Current series info (author, phase, status)
- 🎯 Status indicators (Not Started, In Progress, Waiting Approval, Completed)

**No FictionLab dashboard integration needed** - this is a standalone HTML file you can keep open while working!

### Option 2: Claude Code (Interactive)

Ask Claude in your IDE:
```
What's my current workflow status?
Show me my writing metrics for this week.
What phase am I on?
```

### Option 3: FictionLab Dashboard

Check the FictionLab dashboard for:
- MCP server status
- Database health
- Docker container status

---

## What BQ-Studio Does (Claude Code Target)

### It's NOT:
❌ A separate UI application (that comes later)  
❌ A button-clicking interface  
❌ A visual editor

### It IS:
✅ A **skill/knowledge package** for Claude Code  
✅ A **workflow orchestration layer** via MCP  
✅ A **data model** for pennames and series  
✅ An **integration bridge** between Claude and FictionLab's MCPs

### How It Works:

1. **You work in Claude Code** (Antigravity IDE)
2. **Claude reads the skill file** (`.claude/skills/market-driven-planning-skill.md`)
3. **Claude orchestrates the workflow** using Workflow Manager MCP tools
4. **Progress is tracked** in PostgreSQL database
5. **You monitor progress** via HTML dashboard or Claude Code queries

---

## The 12-Phase Workflow

| Phase | Name | What Happens | Duration |
|-------|------|--------------|----------|
| 0 | Premise Development | Initial concept creation | 15-30 min |
| 1 | Genre Pack Management | Select/create genre templates | 15-20 min |
| 2 | Market Research | Analyze trends, comp titles | 30-40 min |
| 3 | Series Architect | Design 5-book structure | 45-60 min |
| 4 | NPE Validation | Validate against story physics | 20-30 min |
| 5 | Commercial Validation | Final viability scoring | 30-40 min |
| 6 | Writing Team Review | AI team preparation | 15-20 min |
| 7 | User Approval | You review and approve | Variable |
| 8 | MCP Commit | Commit plan to database | 5 min |
| 9 | Chapter Planning | Detailed chapter outlines | 60-90 min |
| 10 | Scene Validation | Validate individual scenes | 20-30 min |
| 11 | Writing Execution | AI-assisted writing | Variable |
| 12 | Book Production Loop | Books 2-5 production | Variable |

**Total Time (Phases 0-8):** ~3-4 hours  
**Total Time (Complete Book 1):** ~8-12 hours

---

## Next Steps After Configuration

1. ✅ **Verify connection** - Test MCP tools are available
2. ✅ **Open dashboard** - Monitor progress visually
3. ✅ **Start workflow** - Use market-driven planning skill
4. ✅ **Track metrics** - Monitor writing velocity and progress
5. ✅ **Iterate** - Complete phases, get approvals, write books

---

## Support and Documentation

**Key Files:**
- Skill Definition: `c:\github\BQ-Studio\.claude\skills\market-driven-planning-skill.md`
- Workflow Dashboard: `c:\github\BQ-Studio\workflow-dashboard.html`
- Integration Status: `c:\github\BQ-Studio\INTEGRATION_STATUS.md`
- System Architecture: `c:\github\BQ-Studio\SYSTEM_ARCHITECTURE_MAP.md`

**Health Endpoints:**
- Workflow Manager: `http://localhost:3012/health`
- MCP Connector: `http://localhost:50880/health`
- PostgreSQL: `localhost:5432` (via FictionLab dashboard)

**Docker Commands:**
```powershell
# Check all FictionLab containers
docker ps --filter "name=fictionlab"

# View Workflow Manager logs
docker logs fictionlab-mcp-servers --tail 100 -f

# Restart containers
docker-compose restart

# Rebuild MCP servers
docker-compose up -d --build mcp-servers
```

---

**Ready to start?** Open Claude Code and say:

```
I want to use the market-driven planning skill to develop a [genre] series.
My concept is: [your concept]
```

Let Claude orchestrate the entire workflow! 🚀
