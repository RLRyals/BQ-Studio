# Git Integration for Writers

This guide explains how to use Git with BQ-Studio - no command line needed!

## What is Git?

Git is like having infinite "save points" for your writing. Think of it as:

- **Commit** = Save point (snapshot of your work at a moment in time)
- **Remote** = Cloud storage (GitHub, GitLab, etc.)
- **Push** = Upload your save points to the cloud
- **Pull** = Download save points from the cloud

## Enabling Git

### During Workspace Setup

When creating your workspace, check **"Initialize Git repository"** to enable Git from the start.

### After Setup

If you skipped Git initially:

1. Go to **Settings → Workspace**
2. Click **"Enable Git"** in the Version Control section
3. Your workspace is now a Git repository

## Connecting to a Remote Repository

To back up your workspace to the cloud:

### Step 1: Create a Repository

**GitHub:**
1. Go to https://github.com/new
2. Name it (e.g., "my-bq-studio-workspace")
3. **Make it Private** (keep your work private!)
4. Click "Create repository"
5. Copy the repository URL (ends with `.git`)

**GitLab:**
1. Go to https://gitlab.com/projects/new
2. Follow similar steps
3. Make sure it's Private

### Step 2: Connect in BQ-Studio

1. Go to **Settings → Workspace → Git Configuration**
2. Paste the repository URL in **"Remote Repository URL"**
3. Click **"Update"**

Done! Your workspace is now connected to the cloud.

## Using Git in BQ-Studio

All Git operations are available in the BQ-Studio UI. No command line needed!

### Viewing Git Status

Look at the **Git Status Indicator** in your interface. It shows:
- **Branch name** (usually "main")
- **Uncommitted changes** (yellow badge with number)
- **Ahead/Behind** (commits not pushed/pulled)
- **Up to date** (green checkmark)

### Committing Changes

When you see uncommitted changes:

1. Click the **yellow badge** with the number
2. Review the files that changed
3. Write a clear commit message (e.g., "Updated character profiles for Book 2")
4. Click **"Commit"**

**Commit Message Tips:**
- Be descriptive ("Added worldbuilding rules" not "Updates")
- Use present tense ("Add character voice guide")
- One sentence is usually enough

### Pushing to Remote

After committing, you'll see an **"ahead"** indicator if you haven't pushed yet.

1. Click the **blue "up arrow"** badge
2. Confirm the push
3. Your work is now backed up to the cloud!

**When to Push:**
- End of each writing session
- After major milestones
- Before switching computers

### Pulling from Remote

If you work on multiple computers, pull before starting work:

1. Go to **Settings → Workspace → Git Configuration**
2. Click the **Pull** button (or it happens automatically)
3. Your workspace is now up to date

## Git Workflow for Writers

### Single Computer Workflow

```
Write → Commit → Push (end of session)
```

**Example:**
1. Write for 2 hours
2. Click commit badge, write "Drafted Chapter 3 scenes"
3. Click push badge
4. Done!

### Multi-Computer Workflow

```
Pull (start) → Write → Commit → Push (end)
```

**Example:**
1. Start on Laptop: Pull first (get latest)
2. Write for 2 hours
3. Commit and push
4. Switch to Desktop: Pull first
5. Continue writing
6. Commit and push
7. Back to Laptop: Pull first (and repeat)

## Understanding the Git UI

### Git Status Indicator

Located in your interface, shows real-time status:

| Indicator | Meaning | Action |
|-----------|---------|--------|
| Branch icon + "main" | Current branch | Info only |
| Yellow badge (5) | 5 uncommitted changes | Click to commit |
| Blue up arrow (2) | 2 commits ahead (not pushed) | Click to push |
| Orange down arrow (1) | 1 commit behind (not pulled) | Pull from settings |
| Green checkmark | Everything up to date | Nothing to do! |

### Commit Dialog

Shows you exactly what changed:

- **M** (yellow) = Modified file
- **A** (green) = Added new file
- **D** (red) = Deleted file
- **?** (blue) = Untracked file (new, not in Git yet)

## Common Questions

### How often should I commit?

**Recommended:**
- After completing a scene or chapter
- After major edits
- At the end of each writing session
- Before trying something experimental

**Too often:** After every sentence (creates noise)
**Not often enough:** Once per month (hard to track changes)

### What should I commit?

**Do commit:**
- Series planning documents
- Character profiles
- World-building notes
- Book outlines
- Drafts and revisions

**Don't commit:**
- Temporary files
- Personal notes you don't want to back up
- Exports (DOCX/PDF) - these are auto-generated

(Your workspace `.gitignore` handles most of this automatically)

### Can I undo a commit?

Yes, but it's advanced. For now:
- **Prevention:** Review files before committing
- **Workaround:** Make a new commit that reverses the changes

**Future:** BQ-Studio will add "revert commit" feature.

### What if I forget to pull before writing?

You might create a **merge conflict** (both versions changed the same file).

**Prevention:** Always pull before starting work on a different computer.

**If it happens:** Git will alert you. You'll need to manually choose which version to keep. (Future versions of BQ-Studio will help with this.)

### Can I work offline?

Yes! Git works offline. You can:
- Commit as normal (saves locally)
- Push when you're back online

### Do I need to learn Git commands?

No! BQ-Studio handles all Git operations through the UI. You'll never need the command line.

## Troubleshooting

### "Failed to push"

**Causes:**
- Not connected to internet
- Authentication failed
- Remote was updated (you're behind)

**Solutions:**
1. Check internet connection
2. Verify repository URL in Settings
3. Try pulling first, then push

### "Authentication failed"

**Cause:** Git can't access your GitHub/GitLab account.

**Solution:**
1. Use HTTPS URL (not SSH)
2. GitHub: Create a Personal Access Token
3. GitLab: Use your password or create token
4. Update URL in Settings

### "Merge conflict"

**Cause:** Same file edited on two computers without pulling first.

**Solution:** (Advanced - ask for help or check Git documentation)

## Best Practices

1. **Commit messages matter** - Write clear, descriptive messages
2. **Pull before writing** - Always sync before starting work
3. **Push after sessions** - Back up your work regularly
4. **Private repositories** - Keep your work private
5. **One workspace = one repo** - Don't share repos between projects

## Git + Cloud Sync Warning

**Don't use Git with Dropbox/OneDrive/iCloud!**

Conflicts will occur because:
- Git and cloud sync both try to manage files
- Can cause repository corruption
- Choose one:
  - **Git** for version control (recommended)
  - **Cloud sync** for simple backup (disable Git)

## Advanced: Branches

Branches let you experiment without affecting your main work.

**Example:** Try a different plot direction without losing your original.

**Currently:** Advanced users only (requires understanding Git)
**Future:** BQ-Studio will add branch management UI

## Getting Help

- **Git Status Issues** - Check Settings → Workspace → Git Configuration
- **Can't Push/Pull** - Verify repository URL and internet connection
- **BQ-Studio Issues** - https://github.com/RLRyals/BQ-Studio/issues
- **Learn Git** - https://try.github.io (for advanced users)
