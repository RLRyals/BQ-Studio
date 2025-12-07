# Contributing to BQ Studio

Welcome! This guide will help you get started contributing to BQ Studio.

## For Claude Code Agents

### Quick Start

1. **Read project context:**
   ```bash
   # Use the /setup slash command
   /setup
   ```

2. **Check available issues:**
   - Visit https://github.com/RLRyals/BQ-Studio/issues
   - Look for issues labeled `good-first-issue` for easier entry points
   - Check Epic issues (#1-4) for high-level context

3. **Key files to read before starting:**
   - `readme.md` - Project vision
   - `.claude/settings.json` - Project conventions
   - `.claude/docs/architecture.md` - System architecture
   - `.claude/docs/plugin-guide.md` - Plugin development guide

### Development Workflow

1. **Pick an issue:**
   - Comment on the issue to claim it
   - Create a feature branch: `feature/{issue-number}-{brief-description}`
   - Example: `feature/5-electron-setup`

2. **Development:**
   ```bash
   npm install           # Install dependencies
   npm run dev          # Start development server
   npm test             # Run tests
   npm run lint         # Check code quality
   ```

3. **Before committing:**
   - Ensure tests pass: `npm test`
   - Check types: `npm run type-check`
   - Lint code: `npm run lint:fix`
   - Format code: `npm run format`

4. **Commit:**
   - Use conventional commits format
   - Examples:
     - `feat(core): implement plugin manager`
     - `fix(ui): resolve dashboard layout issue`
     - `docs: update plugin guide`
     - `test: add tests for AI service`

5. **Create Pull Request:**
   - Reference the issue: "Closes #5"
   - Describe what changed and why
   - Include screenshots for UI changes
   - Ensure CI passes

## Project Structure

```
bq-studio/
├── src/
│   ├── main/           # Electron main process (Node.js)
│   ├── renderer/       # React frontend (Browser)
│   ├── core/           # Core services (Shared)
│   ├── plugins/        # Plugin directory
│   └── types/          # TypeScript types
├── .claude/            # Claude Code configuration
│   ├── settings.json   # Project settings
│   ├── docs/          # Documentation
│   └── commands/      # Slash commands
├── database/          # Database schemas
└── scripts/           # Build and utility scripts
```

## Technology Stack

- **Electron** - Desktop app framework
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **SQLite** - Local database (better-sqlite3)
- **Vite** - Build tool
- **Vitest** - Testing framework

## Coding Standards

### TypeScript

- Use strict mode
- Prefer functional components with hooks
- Use named exports (not default exports for most files)
- Define types explicitly, avoid `any`

```typescript
// Good
export interface Plugin {
  id: string;
  name: string;
}

export function loadPlugin(plugin: Plugin): void {
  // ...
}

// Avoid
export default function loadPlugin(plugin: any) {
  // ...
}
```

### React Components

- Use functional components
- Use hooks for state and effects
- Props should be typed with interfaces

```typescript
interface MyComponentProps {
  title: string;
  onSave: () => void;
}

export function MyComponent({ title, onSave }: MyComponentProps) {
  const [value, setValue] = useState('');

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onSave}>Save</button>
    </div>
  );
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Hooks: `useCamelCase.ts` (e.g., `usePlugin.ts`)
- Types: `PascalCase.types.ts` (e.g., `Plugin.types.ts`)

### Testing

- Write tests for all services
- Test components with React Testing Library
- Aim for >80% coverage

```typescript
import { describe, it, expect } from 'vitest';

describe('PluginManager', () => {
  it('should load plugins from directory', () => {
    const manager = new PluginManager();
    const plugins = manager.loadPlugins();
    expect(plugins.length).toBeGreaterThan(0);
  });
});
```

## Plugin Development

See [.claude/docs/plugin-guide.md](.claude/docs/plugin-guide.md) for complete plugin development guide.

### Quick Plugin Template

```typescript
// src/plugins/my-plugin/index.ts
import { Plugin, PluginContext } from '@/core/plugin-manager';

export default class MyPlugin implements Plugin {
  id = 'my-plugin';
  name = 'My Plugin';
  version = '1.0.0';

  async onActivate(context: PluginContext) {
    // Initialize plugin
  }

  async onDeactivate() {
    // Cleanup
  }
}
```

## Issue Labels

- `epic` - Large feature spanning multiple issues
- `core` - Core framework work
- `plugin` - Plugin-specific work
- `ui` - UI/UX work
- `ai` - AI integration work
- `database` - Database work
- `testing` - Testing infrastructure
- `priority-high` - Critical path items
- `priority-medium` - Important but not blocking
- `priority-low` - Nice to have
- `good-first-issue` - Good for newcomers

## Epic Issues

1. **Epic: Core Framework Infrastructure (#1)**
   - Foundation for entire app
   - Electron, React, TypeScript setup
   - Core services (AI, Database, File, Workflow, Events)
   - UI framework (Dashboard, Workspace)

2. **Epic: Series Architect Plugin (#2)**
   - Port existing series-architect-2/ skill
   - 6-stage workflow for book series planning
   - Beat sheets and templates
   - Export pipeline

3. **Epic: Penname Manager Plugin (#3)**
   - Manage multiple author pennames
   - Voice profiles for AI consistency
   - Brand guidelines

4. **Epic: Manuscript Writer Plugin (#4)**
   - AI-assisted chapter writing
   - Import from Series Architect
   - Real-time word count

## Communication

- **Questions?** Ask in issue comments
- **Blocked?** Comment on the issue or create a discussion
- **Ideas?** Create a new issue with proposal

## Tips for Success

1. **Read the architecture doc first** - Understand the plugin system
2. **Look at reference implementation** - series-architect-2/ shows patterns
3. **Start small** - Pick a `good-first-issue` to learn the codebase
4. **Test as you go** - Don't wait until the end
5. **Ask questions** - Better to clarify than assume

## CI/CD

GitHub Actions runs on every PR:
- Type checking
- Linting
- Tests
- Build verification

All checks must pass before merging.

## Resources

- [Architecture Overview](.claude/docs/architecture.md)
- [Plugin Development Guide](.claude/docs/plugin-guide.md)
- [GitHub Issues](https://github.com/RLRyals/BQ-Studio/issues)
- [Project Board](https://github.com/RLRyals/BQ-Studio/projects)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Ready to start?** Pick an issue and dive in! 🚀
