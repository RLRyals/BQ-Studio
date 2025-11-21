# Windows Setup Guide for Claude Code Web

Quick setup guide for using your AI Writing Team with Claude Code Web on Windows PC.

---

## Prerequisites

- ✅ Docker Desktop for Windows (running mcp-writing-servers container)
- ✅ Your BQ-Studio repo connected to Claude Code Web via GitHub
- ✅ Windows PowerShell (comes with Windows)

---

## Step 1: Install Cloudflared (One-Time Setup)

### Option A: Using winget (Recommended)

Open PowerShell as Administrator and run:

```powershell
winget install --id Cloudflare.cloudflared
```

### Option B: Manual Download

1. Download from: https://github.com/cloudflare/cloudflared/releases/latest
2. Get: `cloudflared-windows-amd64.exe`
3. Rename to: `cloudflared.exe`
4. Move to: `C:\Windows\System32\` (or add to PATH)

### Verify Installation

```powershell
cloudflared --version
```

---

## Step 2: Start Your Docker Container

Open your Electron MCP app or run:

```powershell
docker start mcp-writing-servers
```

Verify it's running:

```powershell
docker ps
```

You should see `mcp-writing-servers` in the list.

---

## Step 3: Start Cloudflare Tunnels

Open PowerShell and navigate to your BQ-Studio directory:

```powershell
cd C:\path\to\BQ-Studio
.\start-cloudflare-tunnels.ps1
```

**What happens:**
1. ✅ Checks if Docker container is running
2. ✅ Starts all 9 Cloudflare tunnels
3. ✅ Extracts auto-generated `*.trycloudflare.com` URLs
4. ✅ Updates all 4 MCP config files with real URLs
5. ✅ Stays running until you press Ctrl+C

**Output will show:**
```
🚀 Starting Cloudflare Tunnels for MCP Writing Servers...
✅ Docker container is running

🔗 Starting tunnels...
  Starting tunnel for author (port 3009)...
  Starting tunnel for series-planning (port 3002)...
  ...

📋 Extracting tunnel URLs...
  ✅ author: https://abc-xyz-123.trycloudflare.com
  ✅ series-planning: https://def-uvw-456.trycloudflare.com
  ...

✅ Generated .claude\mcp-planning.json
✅ Generated .claude\mcp-writing.json
✅ Generated .claude\mcp-review.json
✅ Generated .claude\mcp-web.json

🎉 All tunnels are running!
Press Ctrl+C to stop tunnels...
```

**⚠️ Keep this PowerShell window open!** Closing it stops the tunnels.

---

## Step 4: Configure Claude Code Web

### 4.1: Open Your Repo

1. Go to: **https://code.claude.com**
2. Your BQ-Studio repo should already be connected via GitHub
3. Open the repository

All your `.claude/` files are automatically available:
- ✅ 9 Writing Team agents in `.claude/agents/`
- ✅ 5 Agent skills in `.claude/skills/`
- ✅ Updated MCP configs in `.claude/`

### 4.2: Configure MCP Servers

1. In Claude Code Web, go to **Settings** (gear icon)
2. Navigate to **MCP Servers**
3. Click **"Add MCP Configuration"** or **"Upload Configuration"**

4. **Choose which config to upload based on what you're doing:**

   **For Series/Book/Chapter Planning:**
   - Upload: `.claude/mcp-planning.json`
   - Loads 5 servers: author, series-planning, book-planning, chapter-planning, character-planning
   - **Saves ~60% context**

   **For Scene Writing:**
   - Upload: `.claude/mcp-writing.json`
   - Loads 3 servers: scene, character-planning, core-continuity
   - **Saves ~70% context**

   **For Continuity Review:**
   - Upload: `.claude/mcp-review.json`
   - Loads 4 servers: core-continuity, review, reporting, character-planning
   - **Saves ~55% context**

   **For Everything (use sparingly):**
   - Upload: `.claude/mcp-web.json`
   - Loads all 9 servers
   - Most context usage

5. Click **Save** or **Apply**

### 4.3: Verify Connection

In Claude Code Web, type:

```
List available MCP tools
```

You should see tools from your active MCP servers.

---

## Step 5: Use Your Writing Team!

Now you can invoke your Writing Team agents:

```
Miranda, let's plan my Urban Fantasy Police Procedural series.
5 books, female detective protagonist named Alex Martinez,
slow-burn romance with her mentor.
```

Miranda will:
- Automatically invoke the `series-planning` skill
- Query your MCP servers (using the IDs automatically)
- Coordinate with other team members (Detective Logan, Professor Mira, Dr. Viktor)
- Ask for permission before creating MCP entries
- Guide you through series planning in plain English

**You never see or manage IDs - the skills handle everything!**

---

## Switching Between Work Phases

As you move between planning, writing, and reviewing:

### Currently Planning → Now Writing

1. **Stop** the current Claude Code session
2. Go to **Settings → MCP Servers**
3. **Replace** `mcp-planning.json` with `mcp-writing.json`
4. **Start new session**
5. Invoke: `Bailey, let's write the opening scene of Chapter 1`

### Currently Writing → Now Reviewing

1. **Stop** the current session
2. **Replace** with `mcp-review.json`
3. **Start new session**
4. Invoke: `Tessa, check Chapter 1 for continuity errors`

This way you only load the MCPs you need, saving context for longer conversations!

---

## Stopping the Tunnels

When you're done:

1. **Go to the PowerShell window** running the tunnels
2. **Press Ctrl+C**
3. Tunnels will automatically stop

**Next time you work:**
- Run `.\start-cloudflare-tunnels.ps1` again
- New URLs will be generated
- Config files will be updated automatically
- Re-upload the config in Claude Code Web

---

## Troubleshooting

### Error: "cloudflared is not recognized"

**Solution:** Add to PATH or reinstall with winget.

Verify with:
```powershell
cloudflared --version
```

### Error: "Docker container is not running"

**Solution:** Start your Electron MCP app or:
```powershell
docker start mcp-writing-servers
docker ps
```

### MCP tools not showing in Claude Code Web

**Solution:**

1. Check tunnels are running (PowerShell window should be open)
2. Test a tunnel manually:
   ```powershell
   curl https://your-tunnel-url.trycloudflare.com/health
   ```
3. Re-upload the MCP config in Claude Code Web settings

### PowerShell script won't run (execution policy)

**Solution:** Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try running the script again.

### Tunnels disconnect after a while

**Solution:** Cloudflare free tunnels can occasionally disconnect. If this happens:
1. Press Ctrl+C in PowerShell
2. Run `.\start-cloudflare-tunnels.ps1` again
3. Re-upload the updated config in Claude Code Web

---

## Quick Reference

### File Locations

```
BQ-Studio/
├── start-cloudflare-tunnels.ps1   (Windows script)
├── .claude/
│   ├── agents/                     (9 Writing Team members)
│   ├── skills/                     (5 phase-based workflows)
│   ├── mcp-planning.json          (Planning phase - 5 servers)
│   ├── mcp-writing.json           (Writing phase - 3 servers)
│   ├── mcp-review.json            (Review phase - 4 servers)
│   └── mcp-web.json               (All servers - 9 servers)
```

### Port Mappings

| Port | Server |
|------|--------|
| 3009 | author |
| 3002 | series-planning |
| 3001 | book-planning |
| 3003 | chapter-planning |
| 3004 | character-planning |
| 3005 | scene |
| 3006 | core-continuity |
| 3007 | review |
| 3008 | reporting |

### Common Commands

**Start tunnels:**
```powershell
cd C:\path\to\BQ-Studio
.\start-cloudflare-tunnels.ps1
```

**Stop tunnels:**
```
Ctrl+C in PowerShell window
```

**Check Docker:**
```powershell
docker ps | Select-String "mcp-writing-servers"
```

**Test tunnel:**
```powershell
curl https://your-tunnel-url.trycloudflare.com/health
```

---

## Next Steps

Once you have tunnels running and MCP configured in Claude Code Web:

1. **Start with series planning:**
   ```
   Miranda, let's plan my series
   ```

2. **Move to book planning:**
   ```
   Detective Logan, help me plan the case structure for Book 1
   ```

3. **Write scenes:**
   ```
   Bailey, write the opening scene where Alex discovers the crime scene
   ```

4. **Review for continuity:**
   ```
   Tessa, check Chapter 5 for character knowledge errors
   ```

Your Writing Team will handle all the complexity - you just tell them what you want in plain English!

---

## Support

**For Windows-specific issues:**
- Check Docker Desktop is running
- Verify cloudflared installation
- Ensure PowerShell execution policy allows scripts

**For Writing Team questions:**
- See: `.claude/WRITING_TEAM_INTEGRATION_GUIDE.md`
- Ask Miranda for coordination help
- Ask Casey for process optimization

**For tunnel issues:**
- See: `.claude/TUNNEL_SETUP_GUIDE.md` (general guide)
- This guide (Windows-specific)

---

**Ready to write your series!** 🎉
