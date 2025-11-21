#!/bin/bash
# SessionStart.sh - Runs at the start of each Claude Code session
# This hook sets up the environment for working with GitHub issues

# Export GitHub authentication token if not already set
# This allows the gh CLI and API calls to authenticate properly
if [ -z "$GITHUB_AUTH_TOKEN" ]; then
    echo "Warning: GITHUB_AUTH_TOKEN is not set. GitHub API calls may fail."
    echo "Please set GITHUB_AUTH_TOKEN in your environment or CI/CD configuration."
else
    export GITHUB_AUTH_TOKEN
    echo "✓ GitHub authentication configured"
fi

# Optionally configure git if needed
if [ -n "$GITHUB_AUTH_TOKEN" ]; then
    # Set git to use the token for HTTPS operations
    git config --global credential.helper store 2>/dev/null || true
fi

echo "✓ Session initialized for BQ Studio development"
