# BQ Studio

> AI-Powered Publishing House ERP with Plugin Architecture

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## Overview

BQ Studio is a modular, plugin-based desktop application designed to manage AI-powered publishing operations for small publishers running multiple AI-powered author pennames.

### What It Does

- **Series Planning** - Plan 5-book series with AI-powered story development (Series Architect plugin)
- **Manuscript Writing** - AI-assisted chapter-by-chapter writing
- **Penname Management** - Manage multiple author identities with voice profiles
- **Publishing Workflow** - From ideation to published book
- **Business Operations** - Track royalties, manage rights, analyze trends

### Technology Stack

- **Electron** - Cross-platform desktop (Windows, Mac, Linux)
- **React + TypeScript** - Modern UI with type safety
- **SQLite** - Local-first database
- **Zustand** - State management
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool

---

## Quick Start

### For Developers

```bash
# Clone repository
git clone https://github.com/RLRyals/BQ-Studio.git
cd BQ-Studio

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### For Claude Code Agents

```bash
# Read project setup
/setup

# Check available issues
# Visit: https://github.com/RLRyals/BQ-Studio/issues

# Pick an issue and create feature branch
git checkout -b feature/{issue-number}-{description}
```

---

## Project Structure

```
bq-studio/
├── src/
│   ├── main/              # Electron main process
│   ├── renderer/          # React frontend
│   ├── core/              # Core services
│   │   ├── plugin-manager/
│   │   ├── ai-service/
│   │   ├── database-service/
│   │   ├── file-service/
│   │   ├── workflow-engine/
│   │   └── event-bus/
│   ├── plugins/           # Plugin directory
│   │   ├── series-architect/
│   │   ├── manuscript-writer/
│   │   └── penname-manager/
│   └── types/             # Shared TypeScript types
│
├── .claude/               # Claude Code configuration
│   ├── settings.json      # Project settings
│   ├── docs/             # Architecture docs
│   └── commands/         # Slash commands
│
├── series-architect-2/    # Reference implementation
└── database/             # Database schemas
```

---

## Core Architecture

### Plugin System

BQ Studio is built on a plugin architecture. Each major feature is a self-contained plugin that integrates with the core framework.

**Core Services (available to all plugins):**
- **AI Service** - Multi-provider AI orchestration (Claude, GPT)
- **Database Service** - SQLite persistence
- **File Service** - File operations, templates, exports
- **Workflow Engine** - Stage-based workflows
- **Event Bus** - Plugin communication

**Example Plugin:**
```typescript
export default class MyPlugin implements Plugin {
  id = 'my-plugin';
  name = 'My Plugin';

  async onActivate(context: PluginContext) {
    // Access core services
    const ai = context.core.ai;
    const db = context.core.db;
    // ...
  }
}
```

See [.claude/docs/plugin-guide.md](.claude/docs/plugin-guide.md) for complete guide.

---

## Current Status

### Phase 1: Core Framework (In Progress)

**Epic Issues:**
- [#1 Core Framework Infrastructure](https://github.com/RLRyals/BQ-Studio/issues/1)
- [#2 Series Architect Plugin](https://github.com/RLRyals/BQ-Studio/issues/2)
- [#3 Penname Manager Plugin](https://github.com/RLRyals/BQ-Studio/issues/3)
- [#4 Manuscript Writer Plugin](https://github.com/RLRyals/BQ-Studio/issues/4)

**Next Steps:**
1. Set up Electron + React project (#5)
2. Implement core services (#6-11)
3. Build UI framework (#12-13)
4. Port Series Architect plugin (#15-21)

---

## Planned Plugins

### Phase 1: Content Creation
1. ✅ **Series Architect** - 5-book series planning (reference: series-architect-2/)
2. 🔨 **Manuscript Writer** - AI-assisted writing
3. 🔨 **Penname Manager** - Author identity management

### Phase 2: Production & Publishing
4. **Formatting Pipeline** - EPUB, MOBI, print-ready PDF
5. **ISBN Manager** - Track and assign ISBNs
6. **Publishing Dashboard** - KDP, IngramSpark integration
7. **Metadata Manager** - BISAC codes, keywords

### Phase 3: Marketing & Sales
8. **Marketing Planner** - Launch campaigns, ads
9. **Newsletter Manager** - Email automation
10. **Social Media Scheduler** - Content calendar
11. **Review Tracker** - Monitor reviews

### Phase 4: Business Operations
12. **Financial Tracker** - Royalties, P&L
13. **Rights Manager** - Audio, translation rights
14. **Analytics Hub** - Sales trends, reporting

---

## Documentation

- **[Architecture Overview](.claude/docs/architecture.md)** - System design and structure
- **[Plugin Development Guide](.claude/docs/plugin-guide.md)** - How to create plugins
- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow
- **[Setup Command](.claude/commands/setup.md)** - Quick onboarding

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Good First Issues:**
- [#5 Set up Electron + React + TypeScript project](https://github.com/RLRyals/BQ-Studio/issues/5)
- [#15 Create Series Architect plugin structure](https://github.com/RLRyals/BQ-Studio/issues/15)

**Development Workflow:**
1. Pick an issue
2. Create feature branch: `feature/{issue-number}-{description}`
3. Develop with tests
4. Create pull request
5. CI validates and merges

---

## Reference Implementation

The **Series Architect** plugin (our first and flagship plugin) has a complete reference implementation in `series-architect-2/`:

- 6-stage workflow for book series planning
- 10 beat sheet frameworks
- 15 production-ready templates
- AI-powered story development
- Export to multiple formats

This serves as the template for all future plugins.

---

## License

MIT License - See [LICENSE](LICENSE) file

---

## Support

- **Issues:** [GitHub Issues](https://github.com/RLRyals/BQ-Studio/issues)
- **Discussions:** [GitHub Discussions](https://github.com/RLRyals/BQ-Studio/discussions)
- **Documentation:** [.claude/docs/](.claude/docs/)

---

**Built with ❤️ for indie publishers and AI-powered content creators** 