# BQ Studio - Session Start Instructions

## GitHub Issue Management

**IMPORTANT:** This repository has a custom GitHub issue management system. When the user asks you to create GitHub issues, you MUST use the following tools:

### Available Tools for GitHub Issues

1. **GitHub API Guide**: `.claude/docs/github-api-guide.md`
   - Comprehensive documentation for using GitHub REST API
   - Includes authentication, rate limiting, and all API operations
   - Use this as reference when working with GitHub issues programmatically

2. **Issue Creation Script**: `scripts/create-github-issues.js`
   - Node.js script for bulk creating GitHub issues from JSON
   - Reads from `.github-issues/issues.json`
   - Automatically handles epics and sub-issues linking
   - Uses `GITHUB_AUTH_TOKEN` environment variable (already configured)
   - Run with: `node scripts/create-github-issues.js`

### GitHub CLI Status

The `gh` CLI is **NOT AVAILABLE** in this environment. When working with GitHub issues:

- ✓ **DO USE**: Direct GitHub REST API calls via `curl` or Node.js `https` module
- ✓ **DO USE**: The `scripts/create-github-issues.js` script for bulk issue creation
- ✓ **DO REFERENCE**: `.claude/docs/github-api-guide.md` for API patterns
- ✗ **DO NOT USE**: `gh` commands (they will fail)

### Authentication

GitHub API authentication is pre-configured via environment variables:
- `GITHUB_AUTH_TOKEN`: Primary token (classic PAT format: `ghp_...`)
- `GIT_TOKEN`: Fallback token (fine-grained PAT format: `github_pat_...`)

The SessionStart.sh hook validates these tokens at session start.

### Examples

**Creating a single issue via API:**
```bash
curl -X POST \
  -H "Authorization: token $GITHUB_AUTH_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -d '{"title":"Issue title","body":"Description","labels":["bug"]}' \
  "https://api.github.com/repos/RLRyals/BQ-Studio/issues"
```

**Creating multiple issues:**
1. Prepare JSON file at `.github-issues/issues.json` with structure:
   ```json
   {
     "epics": [{"title": "...", "body": "...", "labels": ["epic"]}],
     "issues": [{"title": "...", "body": "...", "labels": ["..."], "epic": "Epic Title"}]
   }
   ```
2. Run: `node scripts/create-github-issues.js`

### Quick Reference

When user asks to create GitHub issues:
1. Read `.claude/docs/github-api-guide.md` to understand API patterns
2. Check if bulk creation is needed (use `scripts/create-github-issues.js`)
3. For single issues, use direct API calls with `curl` or Node.js
4. Never attempt to use `gh` CLI commands

Repository: `RLRyals/BQ-Studio`
