# BQ Studio ↔ FictionLab Integration

**Last Updated:** 2025-11-21
**FictionLab Repository:** https://github.com/RLRyals/MCP-Electron-App

---

## Overview

BQ Studio is a **specialized writing application** that depends on **FictionLab** for all infrastructure. This document clarifies the relationship and integration points.

---

## What is FictionLab?

**FictionLab** is an AI-powered writing laboratory - a desktop Electron application that provides shared infrastructure for multiple writing tools.

**Repository:** https://github.com/RLRyals/MCP-Electron-App
**Installation:** Windows Start Menu → FictionLab
**Technology:** Electron + React + TypeScript + Docker

### What FictionLab Provides

**Infrastructure Layer:**
```
FictionLab Desktop App
├── PostgreSQL Database (Docker)
├── PgBouncer Connection Pooler (port 6432)
├── 9 MCP Writing Servers (ports 3001-3009)
│   ├── author-server (3001)
│   ├── series-planning-server (3002)
│   ├── book-planning-server (3003)
│   ├── chapter-planning-server (3004)
│   ├── character-planning-server (3005)
│   ├── scene-server (3006)
│   ├── core-continuity-server (3007)
│   ├── review-server (3008)
│   └── reporting-server (3009)
├── Database Admin Interface (port 3010)
├── Typing Mind (web-based AI chat)
└── Claude Desktop Integration
```

**Key Features:**
- ✅ One-click installation (no terminal required)
- ✅ Automated Docker management
- ✅ System health dashboard
- ✅ Automatic environment configuration
- ✅ Update notifications
- ✅ Works on Windows, macOS, Linux

---

## What is BQ Studio?

**BQ Studio** is a **specialized UI application** for series planning and manuscript writing workflows.

**Repository:** https://github.com/RLRyals/BQ-Studio
**Status:** In development
**Technology:** Electron + React + TypeScript

### What BQ Studio Provides

**Specialized Writing Tools:**
```
BQ Studio Desktop App
├── Series Architect Plugin
│   ├── Visual series planning interface
│   ├── Book/chapter/scene organizer
│   ├── Beat sheet selector
│   └── Character relationship mapper
├── Writing Team Integration
│   ├── 9 AI agents (Miranda, Bailey, Tessa, etc.)
│   ├── 5 Agent Skills (phase-based workflows)
│   └── Chat interface with agents
├── Manuscript Writer Plugin
│   ├── Chapter-by-chapter writing
│   ├── Scene editor with AI assistance
│   └── Continuity tracking
└── Penname Manager Plugin
    ├── Multi-author identity management
    └── Voice profile tracking
```

**Key Features:**
- ✅ Visual workflow for series planning
- ✅ Writing Team agents coordination
- ✅ Integration with FictionLab's data
- ✅ Specialized UI for writing workflows

---

## Relationship Between Apps

```
┌────────────────────────────────────────────────┐
│  FictionLab (Infrastructure Provider)          │
│  https://github.com/RLRyals/MCP-Electron-App   │
│                                                │
│  Provides:                                     │
│  • Postgres database                           │
│  • 9 MCP servers (API layer)                   │
│  • PgBouncer (connection pooling)              │
│  • Typing Mind (general AI chat)               │
│  • Database admin interface                    │
└────────────────────────────────────────────────┘
                        ↓
            Shared infrastructure
                        ↓
┌────────────────────────────────────────────────┐
│  BQ Studio (Specialized Client)                │
│  https://github.com/RLRyals/BQ-Studio          │
│                                                │
│  Consumes:                                     │
│  • FictionLab's Postgres (via PgBouncer)       │
│  • FictionLab's MCP servers                    │
│  • Shared series/character/scene data          │
│                                                │
│  Adds:                                         │
│  • Specialized series planning UI              │
│  • Writing Team AI agents                      │
│  • Manuscript writing workflows                │
└────────────────────────────────────────────────┘
```

**Analogy:**
- **FictionLab** = Database server + API backend (like AWS RDS + Lambda)
- **BQ Studio** = Frontend application (like a React admin dashboard)

---

## Why Two Separate Apps?

### Separation of Concerns

**FictionLab's Job:**
- Manage infrastructure (Postgres, Docker, MCP servers)
- Be stable and always-running
- Support multiple client applications
- Provide general-purpose AI chat (Typing Mind)
- Handle database administration

**BQ Studio's Job:**
- Provide specialized writing workflows
- Focus on series planning and manuscript writing
- Implement Writing Team agents
- Offer visual UI for complex workflows
- Be lightweight and fast

### Benefits of This Architecture

**For Development:**
- ✅ FictionLab is mature and stable (already working)
- ✅ BQ Studio can be developed without touching infrastructure
- ✅ Clear separation makes debugging easier
- ✅ Can update BQ Studio without breaking FictionLab

**For Users:**
- ✅ FictionLab runs 24/7 in background (Start Menu)
- ✅ BQ Studio launches when needed for writing work
- ✅ Both apps share same data (characters, scenes, etc.)
- ✅ Can use Typing Mind for quick questions
- ✅ Can use BQ Studio for structured series planning

**For Future:**
- ✅ Other specialized apps can connect to FictionLab
- ✅ Mobile app could connect to FictionLab's MCP servers
- ✅ Web app could connect via Cloudflare tunnels
- ✅ Team collaboration (multiple BQ Studio instances → one FictionLab)

---

## Technical Integration

### How BQ Studio Connects to FictionLab

**1. Database Connection (Postgres via PgBouncer)**
```typescript
// BQ Studio's DatabaseService
const connection = await pg.connect({
  connectionString: process.env.DATABASE_URL,
  // Example: postgresql://user:pass@localhost:6432/fictionlab
});
```

**2. MCP Server Communication**
```typescript
// BQ Studio's MCPClient
const response = await fetch('http://localhost:3002/create_series', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN}`,
  },
  body: JSON.stringify({ title: 'My Series', genre: 'Fantasy' }),
});
```

**3. Agent Skills → MCP Servers**
```typescript
// series-planning-skill invokes series-planning-server
const seriesId = await mcpClient.request('series-planning-server', 'create_series', {
  title: 'Dark Romantasy Series',
  books: 5,
  genre: 'dark_romantasy',
});
```

### Shared Data Model

Both apps access the same Postgres tables:

```sql
-- Managed by FictionLab, accessed by BQ Studio
fictionlab.authors
fictionlab.series
fictionlab.books
fictionlab.chapters
fictionlab.characters
fictionlab.scenes
fictionlab.continuity_issues
fictionlab.reviews
fictionlab.reports
```

**Schema ownership:** FictionLab owns schema, BQ Studio reads/writes
**Migration strategy:** FictionLab runs migrations, BQ Studio follows schema
**Data sharing:** Both apps see same data in real-time

---

## Development Workflow

### Setting Up for BQ Studio Development

**Step 1: Ensure FictionLab is Running**
```bash
# Launch FictionLab from Windows Start Menu
# OR if developing FictionLab:
cd RYALS/MCP-Electron-App
npm start
```

**Step 2: Verify Infrastructure**
```bash
# Check Postgres via PgBouncer
psql -h localhost -p 6432 -U your_user -d fictionlab

# Check MCP servers
curl http://localhost:3001/health  # author-server
curl http://localhost:3002/health  # series-planning-server
# ... etc through 3009

# Check DB Admin
open http://localhost:3010
```

**Step 3: Configure BQ Studio**
```bash
cd RYALS/BQ-Studio
cp .env.example .env

# Edit .env with FictionLab connection details
nano .env
```

**Step 4: Start BQ Studio**
```bash
npm run dev
```

### Parallel Development (This Weekend)

**Both apps run simultaneously:**

**Terminal 1 - FictionLab**
```bash
cd RYALS/MCP-Electron-App
npm start
# Infrastructure running on ports 6432, 3001-3009, 3010
```

**Terminal 2 - BQ Studio**
```bash
cd RYALS/BQ-Studio
npm run dev
# Client app connecting to FictionLab's ports
```

**Both apps share:**
- Same Postgres database
- Same MCP servers
- Same character/scene data

---

## Deployment Scenarios

### Single User (Current)
```
PC Desktop:
├── FictionLab (installed, Start Menu)
├── BQ Studio (installed, Start Menu)
└── Both connect to localhost
```

### Team Collaboration (Future)
```
Server/Cloud:
└── FictionLab (Docker containers)
    ├── Postgres
    ├── MCP servers
    └── Exposed via VPN or tunnels

Developer Workstations:
├── BQ Studio (connects remotely)
└── Connects to server's MCP endpoints
```

### Cloud Deployment (Future)
```
AWS/Azure:
├── RDS Postgres (managed database)
├── ECS/AKS containers (MCP servers)
└── Load balancer

Users:
├── BQ Studio desktop app
└── Connects to cloud MCP endpoints
```

---

## Current Status

### FictionLab Status
**Status:** ✅ **Production-ready**
- Installed as desktop app (Start Menu)
- Provides all infrastructure
- Postgres + MCP servers running
- Used daily by developer

**Repository:** https://github.com/RLRyals/MCP-Electron-App

### BQ Studio Status
**Status:** 🔨 **In Active Development**
- Writing Team Agents created (9 agents) ✅
- Agent Skills created (5 skills) ✅
- MCP configurations created ✅
- Cloudflare tunnel automation ✅
- Infrastructure documentation complete ✅
- **Next:** Start Electron app (Issue #5) 🔨
- **Next:** Create UI layouts (Issues #12-13) 🔨
- **Next:** Integrate Writing Team into UI 🔨

**Repository:** https://github.com/RLRyals/BQ-Studio

---

## Key Differences from Initial Plan

### Original Concept
- BQ Studio would manage its own infrastructure
- SQLite database in BQ Studio
- MCP servers launched by BQ Studio
- Self-contained application

### Actual Implementation
- BQ Studio is client app only
- FictionLab provides all infrastructure
- Postgres database (not SQLite)
- MCP servers run in FictionLab
- Lightweight, focused application

### Why This is Better
✅ **Separation of concerns** - Infrastructure vs UI
✅ **Reusability** - Other apps can use FictionLab
✅ **Stability** - FictionLab is mature, BQ Studio can iterate
✅ **Performance** - PgBouncer connection pooling
✅ **Maintainability** - Clear boundaries between systems

---

## Environment Configuration

### FictionLab Configuration
**Location:** `RYALS/MCP-Electron-App/.env`

```bash
# Postgres configuration
POSTGRES_PASSWORD=<generated_securely>
POSTGRES_USER=fictionlab
POSTGRES_DB=fictionlab

# MCP server authentication
MCP_AUTH_TOKEN=<shared_secret>

# Ports (managed by Docker Compose)
PGBOUNCER_PORT=6432
# MCP servers: 3001-3009
# DB Admin: 3010
```

### BQ Studio Configuration
**Location:** `RYALS/BQ-Studio/.env`

```bash
# Copy from FictionLab
DATABASE_URL=postgresql://fictionlab:password@localhost:6432/fictionlab
MCP_AUTH_TOKEN=<same_as_fictionlab>

# MCP server URLs
MCP_AUTHOR_SERVER_URL=http://localhost:3001
MCP_SERIES_PLANNING_SERVER_URL=http://localhost:3002
# ... etc through 3009
MCP_DB_ADMIN_URL=http://localhost:3010

# BQ Studio's own keys
ANTHROPIC_API_KEY=<for_writing_team>
OPENAI_API_KEY=<optional>
```

**Important:** BQ Studio's `.env` values must match FictionLab's configuration

---

## Troubleshooting

### BQ Studio can't connect to FictionLab

**Check 1: Is FictionLab running?**
```bash
# Check if Electron app is running
ps aux | grep FictionLab
# OR check from Start Menu
```

**Check 2: Are MCP servers accessible?**
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
# All should return 200 OK
```

**Check 3: Is Postgres accessible?**
```bash
psql -h localhost -p 6432 -U fictionlab -d fictionlab
```

**Check 4: Do credentials match?**
```bash
# Compare tokens
cat RYALS/BQ-Studio/.env | grep MCP_AUTH_TOKEN
cat RYALS/MCP-Electron-App/.env | grep MCP_AUTH_TOKEN
# Should be identical
```

### Data not syncing between apps

**Possible causes:**
- Different database connection strings
- Caching in one app
- Schema mismatch
- Transaction not committed

**Solution:**
```bash
# Check both apps connect to same database
psql -h localhost -p 6432 -U fictionlab -d fictionlab
\dt  # List tables
SELECT * FROM series;  # Verify data
```

---

## Resources

### Repositories
- **FictionLab:** https://github.com/RLRyals/MCP-Electron-App
- **BQ Studio:** https://github.com/RLRyals/BQ-Studio

### Documentation
- **BQ Studio Architecture:** `.claude/docs/architecture.md`
- **Writing Team Guide:** `.claude/WRITING_TEAM_INTEGRATION_GUIDE.md`
- **Infrastructure Details:** `INFRASTRUCTURE.md`
- **Development Roadmap:** `REVISED_ROADMAP.md`

### Key Files
- **BQ Studio env:** `.env.example` (template)
- **FictionLab env:** (in MCP-Electron-App repository)
- **MCP configs:** `.claude/mcp*.json`

---

## Summary

**The Big Picture:**
- **FictionLab** = The infrastructure (like AWS backend)
- **BQ Studio** = The specialized app (like web frontend)
- **Both together** = Complete writing system

**Development Strategy:**
- FictionLab is stable and running (✅ done)
- BQ Studio being built this weekend (🔨 in progress)
- Writing Team agents already created (✅ done)
- Integration coming next week (📋 planned)

**Architecture Benefits:**
- Clean separation of concerns
- Reusable infrastructure
- Easy to maintain and extend
- Multiple clients possible
- Team collaboration ready

**Current Focus:**
- Test Writing Team in Claude Code Web
- Start Electron app development
- Create UI layouts
- Integrate agents into UI
- Connect to FictionLab's infrastructure

---

**Last Updated:** 2025-11-21
**FictionLab Version:** Production (installed)
**BQ Studio Version:** In Development
