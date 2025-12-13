# BQ Studio Marketplace

Community marketplace for FictionLab workflows, plugins, and skills for AI-powered fiction writing.

## 📦 What's Here

### Workflows
Pre-built workflow JSON files that you can import into FictionLab to automate your writing process.

### Plugins
FictionLab plugins that extend functionality (installation instructions included).

### Skills
Claude Code skill files (`.md`) for specialized writing tasks.

---

## 🚀 Quick Start

### 1. Install FictionLab
Get FictionLab from: [github.com/your-org/MCP-Electron-App](https://github.com)

### 2. Install the Claude Code Executor Plugin

**Copy the plugin:**
```bash
# On Mac/Linux
cp -r plugins/claude-code-executor ~/.config/fictionlab/plugins/

# On Windows
xcopy /E /I plugins\claude-code-executor %APPDATA%\fictionlab\plugins\claude-code-executor
```

**Build it:**
```bash
cd ~/.config/fictionlab/plugins/claude-code-executor
npm install
npm run build
```

**Restart FictionLab** - the plugin will be auto-discovered.

### 3. Install Skills

**Copy skills to your `.claude` directory:**
```bash
# On Mac/Linux
cp skills/*.md ~/.claude/skills/

# On Windows
xcopy /Y skills\*.md %USERPROFILE%\.claude\skills\
```

Create the directory if it doesn't exist:
```bash
mkdir -p ~/.claude/skills  # Mac/Linux
mkdir %USERPROFILE%\.claude\skills  # Windows
```

### 4. Import Workflows

1. Open FictionLab
2. Go to **Workflows** → **Import Workflow**
3. Select a workflow JSON file from `workflows/`
4. Click **Import**

---

## 📚 Available Workflows

### Book Planning Workflow
**File:** `workflows/book-planning-workflow.json`

7-phase structured workflow for planning individual books within a series:
- Phase 1: Book Foundation
- Phase 2: Beat Sheet Selection
- Phase 3: Act Structure Development
- Phase 4: Case-of-the-Week Planning
- Phase 5: Series Arc Integration
- Phase 6: Character Development Milestones
- Phase 7: Validation & Review

**Requirements:**
- Plugin: `claude-code-executor`
- Skill: `book-planning-skill.md`
- MCPs: `book-planning-server`, `series-planning-server`, `character-planning-server`

**Usage:**
1. Import the workflow
2. Create or select a series
3. Run the workflow, provide:
   - Series ID
   - Book number (1, 2, 3, etc.)
4. Follow phase-by-phase prompts

---

### Series Planning Workflow
**File:** `workflows/series-planning-workflow.json`

5-phase workflow for architecting multi-book series:
- Phase 1: Series Foundation
- Phase 2: Arc Structure
- Phase 3: Book Sequence
- Phase 4: Character Journeys
- Phase 5: World Consistency

**Requirements:**
- Plugin: `claude-code-executor`
- Skill: `series-planning-skill.md`
- MCPs: `series-planning-server`, `character-planning-server`

---

### Chapter Planning Workflow
**File:** `workflows/chapter-planning-workflow.json`

7-phase workflow for detailed chapter structure:
- Phase 1: Chapter Context
- Phase 2: Scene Breakdown
- Phase 3: Pacing Design
- Phase 4: Tension Curve
- Phase 5: Character Beats
- Phase 6: Dialogue Planning
- Phase 7: Final Review

**Requirements:**
- Plugin: `claude-code-executor`
- Skill: `chapter-planning-skill.md`
- MCPs: `book-planning-server`, `character-planning-server`

---

### Scene Writing Workflow
**File:** `workflows/scene-writing-workflow.json`

4-phase workflow for prose generation:
- Phase 1: Scene Setup
- Phase 2: Draft Generation
- Phase 3: Polish & Revision
- Phase 4: Final Review

**Requirements:**
- Plugin: `claude-code-executor`
- Skill: `scene-writing-skill.md`
- MCPs: `workflow-manager`

---

## 🔌 Available Plugins

### Claude Code Executor
**Directory:** `plugins/claude-code-executor/`

Core plugin that executes Claude Code skills in headless mode.

**Actions:**
- `execute-skill` - Run a skill with optional phase
- `check-status` - Check execution status
- `cancel` - Cancel running execution

**See:** `plugins/claude-code-executor/README.md` for full documentation

---

## 📝 Available Skills

All skills are in the `skills/` directory. Copy them to `~/.claude/skills/` to use.

### book-planning-skill.md
7-phase book planning for series fiction

### series-planning-skill.md
5-phase multi-book series architecture

### chapter-planning-skill.md
7-phase detailed chapter structure

### scene-writing-skill.md
4-phase prose generation and polish

---

## 🛠️ Creating Custom Workflows

Workflows are JSON files that define a sequence of steps calling plugin actions.

**Basic Structure:**
```json
{
  "id": "my-workflow-v1",
  "name": "My Custom Workflow",
  "description": "What this workflow does",
  "version": "1.0.0",
  "variables": [
    {
      "id": "my_var",
      "name": "My Variable",
      "type": "string",
      "required": true
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "name": "First Step",
      "pluginId": "claude-code-executor",
      "action": "execute-skill",
      "config": {
        "skillPath": ".claude/skills/my-skill.md",
        "myVar": "{{my_var}}"
      },
      "outputMapping": {
        "result_id": "$.result.id"
      }
    },
    {
      "id": "step-2",
      "name": "Second Step",
      "pluginId": "claude-code-executor",
      "action": "execute-skill",
      "config": {
        "skillPath": ".claude/skills/my-skill.md",
        "phase": 2,
        "previousResult": "{{step-1.result_id}}"
      },
      "dependencies": ["step-1"]
    }
  ]
}
```

**Variable Substitution:**
- Input variables: `{{variable_name}}`
- Previous step outputs: `{{step-id.output_name}}`

**JSONPath Output Mapping:**
Extract specific values from step results:
```json
"outputMapping": {
  "book_id": "$.result.book_id",
  "files": "$.result.outputs[0]"
}
```

---

## 📤 Contributing

Want to share your workflows, plugins, or skills?

1. Fork this repo
2. Add your contribution to the appropriate directory
3. Update this README
4. Submit a pull request

**Guidelines:**
- Include clear documentation
- Test workflows end-to-end before submitting
- Follow existing naming conventions
- Add example usage in README

---

## 🐛 Troubleshooting

**Workflow import fails:**
- Check JSON syntax (use [jsonlint.com](https://jsonlint.com))
- Verify all required plugins are installed
- Check FictionLab logs for error details

**Plugin not loading:**
- Make sure it's in the correct directory (`~/.config/fictionlab/plugins/`)
- Run `npm run build` in the plugin directory
- Check `plugin.json` is valid
- Restart FictionLab

**Skill not found:**
- Skills must be in `~/.claude/skills/` directory
- Check filename matches exactly (case-sensitive on Mac/Linux)
- Verify Claude Code CLI can find them: `claude-code list-skills`

**MCP server errors:**
- Ensure required MCP servers are running
- Check MCP server configuration in FictionLab settings
- Review MCP server logs

---

## 📄 License

Individual components may have different licenses - check each directory for details.

Workflows and skills: MIT License
Plugins: See individual plugin directories

---

## 🔗 Links

- **FictionLab**: [github.com/your-org/MCP-Electron-App](https://github.com)
- **Claude Code**: [claude.com/claude-code](https://claude.com/claude-code)
- **Discord Community**: [Your Discord invite]
- **Documentation**: [Full docs link]

---

**Happy Writing! ✍️**
