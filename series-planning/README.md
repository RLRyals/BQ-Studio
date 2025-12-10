# Series Planning Directory

**Note**: This directory contains development and testing data for BQ-Studio and is not tracked in version control.

## For BQ-Studio Users

Your actual series planning work should be in your **BQ-Studio Workspace**, not in this directory.

When you first run BQ-Studio, you'll be prompted to set up a workspace location (default: `~/Documents/BQ-Studio-Workspace/`). All your series planning documents, character profiles, and working files will be stored there.

### Why Separate Workspaces?

- **Plugin updates**: BQ-Studio can update without affecting your work
- **Private backups**: Your workspace can be a private Git repository
- **Clean separation**: Plugin code stays separate from your creative content
- **Portability**: Move your workspace between computers easily

## For BQ-Studio Developers

This directory is for testing and development purposes only. Any content here is:

- ✅ Safe to delete
- ✅ Ignored by Git (see .gitignore)
- ✅ Not distributed with BQ-Studio
- ❌ Not suitable for production use

Use this directory to test workspace features during development, but remember that users will never see this content - they'll work in their own configured workspace.
