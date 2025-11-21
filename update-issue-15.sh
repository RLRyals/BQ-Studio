#!/bin/bash
# Script to update GitHub Issue #15 with rewritten content

echo "Updating GitHub Issue #15..."

gh issue edit 15 \
  --title "[Series Architect] Create Plugin Structure with MCP Integration" \
  --body-file ISSUE_15_REWRITE.md

if [ $? -eq 0 ]; then
  echo "✅ Issue #15 updated successfully!"
  echo "View at: https://github.com/RLRyals/BQ-Studio/issues/15"
else
  echo "❌ Failed to update issue. Please check your GitHub authentication."
  echo "Run: gh auth login"
fi
