---
description: Quick setup for new developers working on BQ Studio
---

Welcome to BQ Studio! Here's what you need to know:

## Project Overview
BQ Studio is a modular, plugin-based desktop application for managing AI-powered publishing operations. You're building an ERP system for small publishers managing multiple AI-powered author pennames.

## Technology Stack
- Electron + React + TypeScript
- Zustand (state management)
- Tailwind CSS (styling)
- SQLite (database)
- Vite (build tool)

## Key Files to Read
1. **readme.md** - Project vision and overview
2. **.claude/settings.json** - Project conventions and architecture
3. **.claude/docs/architecture.md** - System architecture details
4. **.claude/docs/plugin-guide.md** - Plugin development guide
5. **series-architect-2/** - Reference implementation of first plugin

## Environment Setup
### GitHub API Access Configuration
This project uses GitHub's REST API for programmatic access to issues and pull requests. Claude Code can directly access the GitHub API using tokens from environment variables.

#### Available Environment Variables
- **`GITHUB_AUTH_TOKEN`** - Primary token for GitHub API access (classic PAT format: `ghp_...`)
- **`GIT_TOKEN`** - Alternative token (fine-grained PAT format: `github_pat_...`)

#### API Access Pattern
Claude Code accesses the GitHub API directly using HTTPS requests:

```javascript
// Example: List open issues
const options = {
  hostname: 'api.github.com',
  path: '/repos/RLRyals/BQ-Studio/issues?state=open',
  method: 'GET',
  headers: {
    'Authorization': `token ${process.env.GITHUB_AUTH_TOKEN}`,
    'User-Agent': 'BQ-Studio-Claude',
    'Accept': 'application/vnd.github.v3+json'
  }
};
```

#### Common GitHub API Operations
Claude can perform these operations programmatically:
- **List Issues**: `GET /repos/{owner}/{repo}/issues?state=open`
- **Get Issue**: `GET /repos/{owner}/{repo}/issues/{issue_number}`
- **Create Issue**: `POST /repos/{owner}/{repo}/issues`
- **Update Issue**: `PATCH /repos/{owner}/{repo}/issues/{issue_number}`
- **Close Issue**: `PATCH /repos/{owner}/{repo}/issues/{issue_number}` with `{"state": "closed"}`
- **Add Comment**: `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`
- **Add Labels**: `POST /repos/{owner}/{repo}/issues/{issue_number}/labels`

#### Token Requirements
For full API access, tokens need these permissions:
- **repo** - Full repository access (required for issues, PRs)
- **read:org** - Read organization data
- **workflow** - Update GitHub Actions workflows

#### SessionStart Hook
The `.claude/hooks/SessionStart.sh` validates token presence, exports it for use during the session, and tests API connectivity on startup.

#### Detailed API Documentation
For comprehensive information on GitHub API operations, request formats, and examples, see:
**[GitHub API Guide](.claude/docs/github-api-guide.md)**

### Quick Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code

## Architecture Key Points
- **Plugin-based**: Each major feature is a plugin (series-architect, manuscript-writer, etc.)
- **Local-first**: SQLite database, no required cloud sync
- **AI-powered**: Heavy use of Claude/OpenAI APIs
- **Workflow-driven**: Stage-based workflows with validation

## Current Status
- Core framework: In planning
- First plugin: Series Architect (reference implementation exists in series-architect-2/)
- See GitHub issues for current work items

## Before Starting Work
1. Read the architecture doc
2. Check your assigned GitHub issue
3. Create feature branch: `feature/{issue-number}-{description}`
4. Ask questions if anything is unclear!

Good luck! 🚀
