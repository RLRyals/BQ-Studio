# Quick Start Guide - BQ Studio for FictionLab

Get up and running with AI-powered writing workflows in 10 minutes.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Claude Pro or Max subscription (for Claude Code)
- [ ] Git installed
- [ ] Windows/Mac/Linux

---

## Step 1: Install Claude Code CLI (2 min)

```bash
npm install -g @anthropic-ai/claude-code
```

Verify installation:
```bash
claude-code --version
```

---

## Step 2: Install FictionLab (5 min)

```bash
# Clone FictionLab
git clone https://github.com/your-org/MCP-Electron-App
cd MCP-Electron-App

# Install dependencies
npm install

# Start FictionLab
npm run dev
```

---

## Step 3: Install the Plugin (2 min)

**Download BQ Studio marketplace:**
```bash
git clone https://github.com/RLRyals/BQ-Studio
```

**Copy plugin to FictionLab:**

On Mac/Linux:
```bash
cp -r BQ-Studio/marketplace/plugins/claude-code-executor ~/.config/fictionlab/plugins/
cd ~/.config/fictionlab/plugins/claude-code-executor
npm install
npm run build
```

On Windows:
```cmd
xcopy /E /I BQ-Studio\marketplace\plugins\claude-code-executor %APPDATA%\fictionlab\plugins\claude-code-executor
cd %APPDATA%\fictionlab\plugins\claude-code-executor
npm install
npm run build
```

**Restart FictionLab** - plugin loads automatically.

---

## Step 4: Install Skills (1 min)

**Copy skills to Claude directory:**

On Mac/Linux:
```bash
mkdir -p ~/.claude/skills
cp BQ-Studio/marketplace/skills/*.md ~/.claude/skills/
```

On Windows:
```cmd
mkdir %USERPROFILE%\.claude\skills
copy BQ-Studio\marketplace\skills\*.md %USERPROFILE%\.claude\skills\
```

Verify:
```bash
claude-code list-skills
```

You should see:
- book-planning-skill
- series-planning-skill
- chapter-planning-skill
- scene-writing-skill

---

## Step 5: Import Your First Workflow (30 sec)

1. Open FictionLab
2. Go to **Workflows** menu → **Import Workflow**
3. Browse to `BQ-Studio/marketplace/workflows/book-planning-workflow.json`
4. Click **Import**

You should see: "Book Planning Workflow" in your workflows list.

---

## Step 6: Run Your First Workflow! (Let's go!)

1. In FictionLab, click **Workflows**
2. Select **"Book Planning Workflow"**
3. Click **Run Workflow**
4. Enter variables:
   - **Series ID**: `my-series-001`
   - **Book Number**: `1`
5. Click **Start**

**What Happens:**
- Phase 1 executes (Book Foundation)
- Claude Code skill runs
- Creates planning documents
- Outputs passed to Phase 2
- Phase 2 executes (Beat Sheet Selection)
- ... continues through all 7 phases

**Total Time:** ~30-60 minutes (depending on complexity)

---

## 🎉 You're Done!

You now have:
- ✅ FictionLab running
- ✅ Claude Code Executor plugin installed
- ✅ Skills ready to use
- ✅ Book Planning workflow imported
- ✅ First workflow execution complete!

---

## What's Next?

### Import More Workflows:
- `series-planning-workflow.json` - Plan multi-book series
- `chapter-planning-workflow.json` - Structure chapters
- `scene-writing-workflow.json` - Generate prose

### Customize Workflows:
1. Open workflow JSON in text editor
2. Modify steps, variables, or configurations
3. Re-import to FictionLab
4. Run customized workflow

### Create Custom Workflows:
See `marketplace/README.md` for workflow JSON syntax

---

## Troubleshooting

**Plugin not loading?**
- Check: `~/.config/fictionlab/plugins/claude-code-executor/plugin.json` exists
- Run: `npm run build` in plugin directory
- Restart FictionLab

**Skill not found?**
- Check: `~/.claude/skills/book-planning-skill.md` exists
- Run: `claude-code list-skills` to verify
- Skills are case-sensitive (use exact filenames)

**Workflow import fails?**
- Validate JSON: https://jsonlint.com
- Check FictionLab logs (Help → View Logs)
- Ensure plugin is activated

**Claude Code not found?**
- Run: `claude-code --version`
- If not found: `npm install -g @anthropic-ai/claude-code`
- Set custom path in plugin settings if needed

---

## Need Help?

- 📖 **Full Docs**: `marketplace/README.md`
- 🐛 **Issues**: GitHub Issues
- 💬 **Discord**: [Your Discord Link]
- 📧 **Email**: support@bqstudio.com

---

**Happy Writing! ✍️**
