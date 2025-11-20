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

## Quick Commands
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
