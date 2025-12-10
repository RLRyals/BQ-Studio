# BQ-Studio Workspace

Welcome to your BQ-Studio workspace! This is your personal creative space where all your series planning, writing, and customizations are stored.

## Workspace Structure

```
BQ-Studio-Workspace/
├── series-planning/        # Your series planning documents
│   ├── {series-name}/
│   │   ├── series-framework.md
│   │   ├── book-dossiers/
│   │   ├── characters/
│   │   └── worldbuilding/
│   └── ...
├── genre-packs/           # Your custom genre packs (override BQ-Studio defaults)
│   └── my-custom-genre/
├── templates/             # Your custom templates
├── exports/               # DOCX, PDF exports
└── README.md             # This file
```

## What Goes Here?

**✅ Include in this workspace:**
- Series planning documents
- Character profiles and voice guides
- World-building bibles
- Custom genre packs
- Custom templates
- Book outlines and dossiers

**❌ Don't put here:**
- BQ-Studio plugin code (that's in the BQ-Studio repository)
- FictionLab configuration
- Database files

## Customizing Genre Packs

BQ-Studio comes with genre packs like "Urban Fantasy Police Procedural" and "Gothic Romance Horror". To customize one:

1. Copy the genre pack from BQ-Studio to your workspace `genre-packs/` folder
2. Edit the files in your workspace copy
3. BQ-Studio will automatically use your customized version

Your customizations won't be affected when BQ-Studio updates!

## Version Control with Git

{{#if gitEnabled}}
This workspace is initialized as a Git repository. You can:

- **Save versions**: Commit your work to track changes over time
- **Backup remotely**: Push to GitHub, GitLab, or other Git hosting (set as private!)
- **Work across devices**: Clone your workspace to multiple computers

### Quick Git Guide for Writers

Think of Git as "save points" for your work:

- **Commit**: Create a save point with your current work
- **Push**: Send your save points to the cloud (backup)
- **Pull**: Download save points from the cloud (sync)

Use the BQ-Studio UI (Settings → Version Control) to manage commits and syncing. You never need to use the command line!
{{else}}
This workspace is not using Git version control. You can:

- Enable Git later through Settings → Workspace
- Use your own backup solution (Dropbox, Google Drive, etc.)
- Manually copy files for backup

**Note**: If using cloud sync (Dropbox/OneDrive), avoid also using Git to prevent conflicts.
{{/if}}

## Getting BQ-Studio Updates

BQ-Studio plugin updates are managed by FictionLab automatically. Your workspace stays separate and won't be affected by updates.

When BQ-Studio updates:
- ✅ Your work in this workspace is safe
- ✅ New features become available
- ✅ Genre pack updates are available (you choose whether to merge)
- ✅ No conflicts with your files

## Best Practices

1. **Regular saves**: If using Git, commit your work regularly
2. **Remote backup**: Push to a private GitHub/GitLab repository
3. **Descriptive names**: Use clear series and character names
4. **Genre pack customization**: Copy plugin genre packs before editing
5. **Exports**: The `exports/` folder is for generated DOCX/PDF files

## Need Help?

- **BQ-Studio Documentation**: See `docs/workspace-setup.md` in the BQ-Studio plugin
- **Git Guide**: See `docs/git-integration.md` for detailed Git instructions
- **Support**: Check the BQ-Studio GitHub repository for issues and discussions

---

**Workspace created**: {{createdDate}}
**BQ-Studio version**: {{bqStudioVersion}}
