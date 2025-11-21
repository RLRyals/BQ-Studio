# BQ Studio - Infrastructure Dependencies

**Last Updated:** 2025-11-21

---

## Overview

BQ Studio is a **client application** that depends on infrastructure provided by the **MCP-Electron-App** repository. This document explains the relationship between the two repositories and how to set up the development environment.

---

## Repository Relationship

```
┌─────────────────────────────────────────────────────────┐
│  RYALS\MCP-Electron-App                                 │
│  Infrastructure Provider                                │
│                                                         │
│  Docker Compose Services:                              │
│  ┌─────────────────────────────────────────┐          │
│  │ Postgres Database                       │          │
│  │ - Stores all writing data               │          │
│  │ - Series, books, chapters, characters   │          │
│  │ - Scenes, continuity data, reviews      │          │
│  └─────────────────────────────────────────┘          │
│  ┌─────────────────────────────────────────┐          │
│  │ PgBouncer Connection Pooler             │          │
│  │ - Port 6432                             │          │
│  │ - Manages Postgres connections          │          │
│  └─────────────────────────────────────────┘          │
│  ┌─────────────────────────────────────────┐          │
│  │ 9 MCP Writing Servers                   │          │
│  │ - Ports 3000-3008                       │          │
│  │ - HTTP APIs for writing workflows       │          │
│  │ - Connected to Postgres                 │          │
│  └─────────────────────────────────────────┘          │
│  ┌─────────────────────────────────────────┐          │
│  │ Typing Mind Website                     │          │
│  │ - General AI chat interface             │          │
│  │ - MCP connector included                │          │
│  └─────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
                           ↓
              Provides infrastructure to
                           ↓
┌─────────────────────────────────────────────────────────┐
│  RYALS\BQ-Studio                                        │
│  Client Application                                     │
│                                                         │
│  Electron + React App:                                 │
│  ┌─────────────────────────────────────────┐          │
│  │ Series Architect Plugin                 │          │
│  │ - Visual UI for series planning         │          │
│  │ - Chapter/scene organizer               │          │
│  │ - Character editor                      │          │
│  └─────────────────────────────────────────┘          │
│  ┌─────────────────────────────────────────┐          │
│  │ Writing Team Integration                │          │
│  │ - 9 AI agents (Miranda, Bailey, etc.)   │          │
│  │ - 5 Agent Skills (workflows)            │          │
│  │ - Chat interface with agents            │          │
│  └─────────────────────────────────────────┘          │
│  ┌─────────────────────────────────────────┐          │
│  │ MCP Client                              │          │
│  │ - Connects to MCP-Electron-App servers  │          │
│  │ - Local or tunnel mode                  │          │
│  └─────────────────────────────────────────┘          │
│  ┌─────────────────────────────────────────┐          │
│  │ Database Client                         │          │
│  │ - Connects to shared Postgres via       │          │
│  │   PgBouncer (port 6432)                 │          │
│  └─────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## What Each Repository Does

### MCP-Electron-App (Infrastructure Provider)

**Purpose:** Provides shared infrastructure for all writing tools

**Responsibilities:**
- Run Postgres database in Docker
- Run PgBouncer connection pooler
- Host 9 MCP Writing Servers
- Host Typing Mind website
- Provide MCP connector for Typing Mind
- Manage database schema and migrations
- Handle authentication and authorization

**Technologies:**
- Docker Compose
- Postgres 15+
- PgBouncer
- Node.js MCP servers
- Typing Mind

**Ports:**
- 5432: Postgres (internal Docker network)
- 6432: PgBouncer (exposed for connections)
- 3000-3008: MCP servers
- 3001: Typing Mind website

---

### BQ-Studio (Client Application)

**Purpose:** Provide specialized UI for series planning and manuscript writing

**Responsibilities:**
- Electron desktop app with React UI
- Visual workflow for series/book/chapter/scene planning
- Character editor and organizer
- Writing Team agent coordination
- Invoke Agent Skills from UI
- Display MCP server data
- User authentication and session management

**Technologies:**
- Electron
- React + TypeScript
- Zustand (state management)
- Tailwind CSS
- pg (Postgres client)

**Dependencies:**
- Requires MCP-Electron-App running
- Connects to shared Postgres via PgBouncer
- Connects to MCP servers (local or tunnels)
- Shares data with Typing Mind

---

## Development Setup

### Prerequisites

1. **MCP-Electron-App repository cloned and running**
   ```bash
   cd RYALS/MCP-Electron-App
   # Start infrastructure
   npm start
   # OR
   docker-compose up
   ```

2. **Verify infrastructure is running:**
   ```bash
   # Check Postgres via PgBouncer
   psql -h localhost -p 6432 -U your_user -d bq_studio

   # Check MCP servers
   curl http://localhost:3000/health  # author-server
   curl http://localhost:3001/health  # series-planning-server
   curl http://localhost:3002/health  # book-planning-server
   # etc for ports 3003-3008
   ```

3. **Get connection details from MCP-Electron-App:**
   - Copy `MCP-Electron-App/.env` values
   - Note DATABASE_URL
   - Note MCP_AUTH_TOKEN
   - Note Postgres credentials

---

### BQ-Studio Setup

1. **Clone BQ-Studio repository:**
   ```bash
   cd RYALS
   git clone https://github.com/RLRyals/BQ-Studio.git
   cd BQ-Studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   # Copy example file
   cp .env.example .env

   # Edit .env with values from MCP-Electron-App
   nano .env
   ```

4. **Required .env values:**
   ```bash
   # From MCP-Electron-App/.env
   DATABASE_URL=postgresql://user:pass@localhost:6432/bq_studio
   MCP_AUTH_TOKEN=your_mcp_auth_token

   # MCP server URLs (local development)
   MCP_AUTHOR_SERVER_URL=http://localhost:3000
   MCP_SERIES_PLANNING_SERVER_URL=http://localhost:3001
   # ... etc for all 9 servers

   # Your AI API keys
   ANTHROPIC_API_KEY=your_key
   OPENAI_API_KEY=your_key
   ```

5. **Start BQ Studio:**
   ```bash
   npm run dev
   ```

---

## Connection Modes

### Mode 1: Local Development (Default)

**When to use:** Developing on same machine as MCP-Electron-App

**Configuration:**
```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:6432/bq_studio
MCP_AUTHOR_SERVER_URL=http://localhost:3000
MCP_SERIES_PLANNING_SERVER_URL=http://localhost:3001
# etc...
```

**Pros:**
- ✅ Fast (no network latency)
- ✅ Simple setup
- ✅ No tunnels needed

**Cons:**
- ⚠️ Both repos must run on same machine

---

### Mode 2: Cloudflare Tunnels (Remote/CCWeb)

**When to use:**
- Using Claude Code Web
- Remote development
- Testing from different machine

**Configuration:**
```bash
# Start tunnels in MCP-Electron-App
cd RYALS/MCP-Electron-App
./start-cloudflare-tunnels.sh

# Copy generated URLs to BQ-Studio/.env
MCP_AUTHOR_SERVER_URL=https://abc123.trycloudflare.com
MCP_SERIES_PLANNING_SERVER_URL=https://def456.trycloudflare.com
# etc...
```

**Pros:**
- ✅ Access from anywhere
- ✅ Works with Claude Code Web
- ✅ No port forwarding needed

**Cons:**
- ⚠️ Slower (network latency)
- ⚠️ Temporary URLs (regenerated on restart)
- ⚠️ Requires cloudflared installed

---

## Data Flow

### Series Planning Workflow Example

1. **User clicks "Plan New Series" in BQ Studio UI**
   ```
   BQ Studio React UI
   └→ SeriesArchitectPlugin.tsx
   ```

2. **UI invokes series-planning Agent Skill**
   ```
   AIService.invokeSkill('series-planning')
   └→ Loads .claude/skills/series-planning-skill.md
   └→ Coordinates Writing Team agents (Miranda, Dr. Viktor, etc.)
   ```

3. **Agent Skill calls MCP servers**
   ```
   MCPClient.request('series-planning-server', 'create_series', {...})
   └→ HTTP POST to http://localhost:3001/create_series
   ```

4. **MCP server writes to Postgres**
   ```
   MCP series-planning-server
   └→ INSERT INTO series (title, genre, ...) VALUES (...)
   └→ Postgres via connection pool
   ```

5. **UI updates with new series**
   ```
   MCP response → AIService → React state → UI refresh
   └→ Series appears in project tree
   ```

6. **Data accessible in both apps**
   ```
   BQ Studio UI: Visual series organizer
   Typing Mind: Chat about series via MCP connector
   Both reading from same Postgres tables
   ```

---

## Shared Database Schema

Both BQ Studio and Typing Mind access the same Postgres database.

**Tables managed by MCP servers:**
- `authors` - Pennames and author info
- `series` - Series metadata
- `books` - Individual books in series
- `chapters` - Chapters in books
- `characters` - Character profiles
- `scenes` - Scene drafts and metadata
- `continuity_issues` - Tracked by Tessa agent
- `reviews` - Review comments and ratings
- `reports` - Generated reports and exports

**Schema migration strategy:**
- MCP-Electron-App owns schema
- MCP servers include migration scripts
- BQ Studio reads schema, doesn't modify it
- Both apps coordinate on schema changes

---

## Troubleshooting

### BQ Studio can't connect to Postgres

**Check:**
```bash
# Is MCP-Electron-App running?
ps aux | grep electron

# Is PgBouncer accessible?
telnet localhost 6432

# Can you connect via psql?
psql -h localhost -p 6432 -U your_user -d bq_studio

# Check .env DATABASE_URL matches MCP-Electron-App
cat .env | grep DATABASE_URL
```

---

### BQ Studio can't reach MCP servers

**Check:**
```bash
# Are MCP servers running?
curl http://localhost:3000/health
curl http://localhost:3001/health
# etc...

# Check .env MCP URLs are correct
cat .env | grep MCP_.*_SERVER_URL

# Check MCP_AUTH_TOKEN matches
cat .env | grep MCP_AUTH_TOKEN
cat ../MCP-Electron-App/.env | grep MCP_AUTH_TOKEN
```

---

### Tunnel URLs not working

**Check:**
```bash
# Is cloudflared installed?
cloudflared version

# Are tunnels running in MCP-Electron-App?
ps aux | grep cloudflared

# Regenerate tunnel URLs
cd RYALS/MCP-Electron-App
./start-cloudflare-tunnels.sh

# Copy new URLs to BQ-Studio/.env
```

---

## Production Considerations

### Both apps running simultaneously

**Typical setup:**
- MCP-Electron-App runs 24/7 as infrastructure
- BQ Studio runs when user needs specialized workflows
- Typing Mind available for quick AI chat
- All share same Postgres database

**Resource usage:**
- MCP-Electron-App: ~1GB RAM (Docker containers)
- BQ Studio: ~500MB RAM (Electron app)
- Postgres: ~200MB RAM
- Total: ~1.7GB RAM

---

### Scaling considerations

**Single user:**
- Run both apps on same machine
- Local connections (localhost)
- No tunnels needed

**Team collaboration:**
- Run MCP-Electron-App on server
- Multiple BQ Studio instances connect remotely
- Use tunnels or VPN for MCP access
- Consider authentication/authorization

**Cloud deployment:**
- Host Postgres on managed service (AWS RDS, etc.)
- Run MCP servers on containers (ECS, Cloud Run)
- Multiple BQ Studio users connect to shared infrastructure
- Consider multi-tenancy and data isolation

---

## Migration Strategy

If you need to move away from shared infrastructure:

1. **Copy relevant tables** from shared Postgres to BQ Studio's own database
2. **Update MCP server configs** to point to new database
3. **Remove dependency** on MCP-Electron-App
4. **Run MCP servers** in BQ-Studio/docker-compose.yml

**Not recommended** - shared infrastructure is cleaner and easier to maintain.

---

## Summary

**Key Points:**
- ✅ MCP-Electron-App provides infrastructure (Postgres, MCP servers)
- ✅ BQ-Studio is a client app (UI, Writing Team, workflows)
- ✅ Both share same Postgres database
- ✅ MCP servers are the data access layer
- ✅ Start MCP-Electron-App before BQ-Studio
- ✅ Connection details go in BQ-Studio/.env

**Development workflow:**
1. Start MCP-Electron-App
2. Verify Postgres + MCP servers running
3. Configure BQ-Studio/.env
4. Start BQ-Studio
5. Build features!

**Questions?**
- Check MCP-Electron-App documentation
- Verify connection settings in .env
- Test Postgres connection manually
- Test MCP server health endpoints
