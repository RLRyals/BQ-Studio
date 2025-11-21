#!/bin/bash
# SessionStart.sh - Runs at the start of each Claude Code session
# This hook sets up the environment for working with GitHub issues via API

echo "=== BQ Studio Session Initialization ==="
echo ""

# Check for GitHub authentication tokens
# Primary: GITHUB_AUTH_TOKEN (classic PAT: ghp_...)
# Fallback: GIT_TOKEN (fine-grained PAT: github_pat_...)
if [ -n "$GITHUB_AUTH_TOKEN" ]; then
    export GITHUB_AUTH_TOKEN
    echo "✓ GITHUB_AUTH_TOKEN configured (${#GITHUB_AUTH_TOKEN} chars)"
    TOKEN_TO_USE="$GITHUB_AUTH_TOKEN"
elif [ -n "$GIT_TOKEN" ]; then
    export GIT_TOKEN
    export GITHUB_AUTH_TOKEN="$GIT_TOKEN"  # Use as fallback
    echo "✓ GIT_TOKEN configured as fallback (${#GIT_TOKEN} chars)"
    TOKEN_TO_USE="$GIT_TOKEN"
else
    echo "⚠ Warning: No GitHub token found in environment"
    echo "  GitHub API access will be unavailable"
    echo "  Set GITHUB_AUTH_TOKEN or GIT_TOKEN to enable API access"
    echo ""
    echo "  Required permissions: repo, read:org, workflow"
    echo "  See: .claude/docs/github-api-guide.md"
    TOKEN_TO_USE=""
fi

# Test GitHub API connectivity if token is available
if [ -n "$TOKEN_TO_USE" ]; then
    echo ""
    echo "Testing GitHub API connectivity..."

    # Test API access (suppress detailed output)
    API_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: token $TOKEN_TO_USE" \
        -H "User-Agent: BQ-Studio-Claude" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/RLRyals/BQ-Studio" 2>/dev/null)

    HTTP_CODE=$(echo "$API_RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ GitHub API access verified (repo: RLRyals/BQ-Studio)"
        echo "✓ Claude Code can programmatically access issues and PRs"
    elif [ "$HTTP_CODE" = "401" ]; then
        echo "✗ GitHub API authentication failed (401 Unauthorized)"
        echo "  Token may be expired or invalid"
        echo "  Generate new token at: https://github.com/settings/tokens"
    elif [ "$HTTP_CODE" = "404" ]; then
        echo "⚠ Repository not found or insufficient permissions"
        echo "  Ensure token has 'repo' scope enabled"
    else
        echo "⚠ GitHub API test returned HTTP $HTTP_CODE"
        echo "  API access may be limited or unavailable"
    fi
fi

# Configure git credential helper if token is available
if [ -n "$GITHUB_AUTH_TOKEN" ]; then
    git config --global credential.helper store 2>/dev/null || true
fi

echo ""
echo "=== Session Ready ==="
echo "Repository: RLRyals/BQ-Studio"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
echo "API Guide: .claude/docs/github-api-guide.md"
echo ""
