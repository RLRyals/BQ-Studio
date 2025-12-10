# BQ-Studio Workspace Setup Guide

Welcome to BQ-Studio! This guide will help you set up and manage your workspace.

## What is a Workspace?

Your BQ-Studio **workspace** is a dedicated folder on your computer where all your creative work is stored. Think of it as your personal writing studio - completely separate from the BQ-Studio application code.

### What's in Your Workspace?

```
BQ-Studio-Workspace/
├── series-planning/        # Your series planning documents
│   └── my-series/
│       ├── series-framework.md
│       ├── book-1-dossier.md
│       ├── characters/
│       └── worldbuilding/
├── genre-packs/           # Your custom genre packs
│   └── my-custom-genre/
├── templates/             # Your custom templates
└── exports/               # DOCX and PDF exports
```

## First-Time Setup

When you first launch BQ-Studio, you'll see the Workspace Setup Wizard. Follow these steps:

### Step 1: Welcome

The wizard explains what a workspace is and why it's separate from BQ-Studio code.

**Click "Next"** to continue.

### Step 2: Choose Location

**Default Location:** `~/Documents/BQ-Studio-Workspace`

This is recommended for most users. The workspace will be:
- Easy to find
- Easy to back up
- Safe from accidental deletion

**Custom Location:**
- Click "Browse..." to choose a different folder
- You can select any folder you have write access to
- **Avoid:** Cloud-synced folders (Dropbox, OneDrive) if you plan to use Git

**Click "Next"** when ready.

### Step 3: Git Setup (Optional)

Git is a version control system that:
- Creates "save points" for your work (commits)
- Lets you sync across multiple devices
- Provides cloud backup via GitHub/GitLab

**Check the box** if you want Git enabled. Otherwise, leave it unchecked.

**Click "Create Workspace"** to finish.

### Step 4: Complete

Your workspace is ready! Click "Get Started" to begin writing.

## Managing Your Workspace

### Changing Workspace Location

If you need to move your workspace:

1. Go to **Settings → Workspace**
2. Click **"Change"** next to the current location
3. Select a new folder (or choose existing workspace)
4. BQ-Studio will update the configuration

**Important:** This doesn't move your files - just tells BQ-Studio where to look. If you want to move files, do it manually in File Explorer, then update the location in BQ-Studio.

### Repairing Workspace Structure

If your workspace is missing folders, click **"Repair Structure"** in Settings → Workspace. This recreates the standard folder structure without touching your existing files.

### Backing Up Your Workspace

**Option 1: Manual Backup**
- Copy the entire workspace folder to a USB drive or external hard drive
- Compress it into a ZIP file for storage

**Option 2: Git Backup (if enabled)**
- Connect to a private GitHub or GitLab repository
- Commit your changes regularly
- Push to sync to the cloud

## Multiple Workspaces

Currently, BQ-Studio supports one workspace at a time. If you need multiple workspaces (for different projects):

1. Create separate folders for each project
2. Use **Settings → Workspace → Change** to switch between them
3. BQ-Studio remembers which workspace you're using

**Future:** Multi-workspace management will make this easier.

## Workspace and Git

### Do I Need Git?

**Git is optional.** You can use BQ-Studio without it.

**Use Git if you:**
- Want version history (undo changes from weeks ago)
- Work on multiple computers
- Want cloud backup
- Collaborate with others (co-author, editor)

**Skip Git if you:**
- Prefer manual backups (USB drives, cloud folders)
- Only work on one computer
- Find Git confusing (you can enable it later)

### Using Git with Your Workspace

See [Git Integration Guide](git-integration.md) for detailed instructions.

## Troubleshooting

### "Workspace not accessible"

**Cause:** Workspace folder was moved, deleted, or permissions changed.

**Solution:**
1. Check if the folder still exists
2. If moved, update location in Settings → Workspace
3. If deleted, create new workspace or restore from backup
4. If permission error, fix folder permissions in your OS

### "Workspace structure invalid"

**Cause:** Required folders are missing.

**Solution:** Click "Repair Structure" in Settings → Workspace.

### "Cannot write to workspace"

**Cause:** Folder is read-only or you don't have write permission.

**Solution:**
1. Check folder permissions (right-click → Properties → Security)
2. Choose a different workspace location if needed

## Best Practices

1. **Back up regularly** - Even if using Git, maintain separate backups
2. **Don't edit directly** - Use BQ-Studio to create/modify files when possible
3. **Keep it organized** - Use clear series/character names
4. **One workspace per project** - Helps keep things organized
5. **Don't use cloud sync + Git** - Pick one to avoid conflicts

## Getting Help

- **Check Settings** - Settings → Workspace shows current configuration
- **Review README** - Your workspace includes a README with helpful info
- **BQ-Studio Issues** - Report problems at https://github.com/RLRyals/BQ-Studio/issues
