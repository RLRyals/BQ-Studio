#!/bin/bash
# Script to update MCP configuration from tunnel output
# Usage: ./update-mcp-from-output.sh < tunnel-output.txt
# Or: your-tunnel-script | ./update-mcp-from-output.sh

set -e

echo "📋 Reading tunnel URLs from input..."
echo ""

declare -A URLS

# Read from stdin or file
while IFS= read -r line; do
    # Parse lines like: SUCCESS: series-planning : https://...trycloudflare.com
    if [[ $line =~ SUCCESS:[[:space:]]*([a-z-]+)[[:space:]]*:[[:space:]]*(https://[a-z0-9-]+\.trycloudflare\.com) ]]; then
        SERVER="${BASH_REMATCH[1]}"
        URL="${BASH_REMATCH[2]}"
        URLS[$SERVER]=$URL
        echo "  ✅ ${SERVER}: ${URL}"
    fi
done

echo ""

# Check if we got all 9 URLs
SERVERS=("author" "series-planning" "book-planning" "chapter-planning" "character-planning" "scene" "core-continuity" "review" "reporting")

MISSING=0
for SERVER in "${SERVERS[@]}"; do
    if [ -z "${URLS[$SERVER]}" ]; then
        echo "❌ Missing URL for ${SERVER}"
        MISSING=1
    fi
done

if [ $MISSING -eq 1 ]; then
    echo ""
    echo "⚠️  Some URLs are missing. Expected format:"
    echo "SUCCESS: server-name : https://....trycloudflare.com"
    exit 1
fi

echo "✅ All 9 tunnel URLs found"
echo ""
echo "📝 Updating MCP configuration files..."
echo ""

# Generate mcp-planning.json
cat > .claude/mcp-planning.json <<EOF
{
  "mcpServers": {
    "author": {
      "url": "${URLS[author]}"
    },
    "series-planning": {
      "url": "${URLS[series-planning]}"
    },
    "book-planning": {
      "url": "${URLS[book-planning]}"
    },
    "chapter-planning": {
      "url": "${URLS[chapter-planning]}"
    },
    "character-planning": {
      "url": "${URLS[character-planning]}"
    }
  }
}
EOF

# Generate mcp-writing.json (all 9 servers for Writing Team)
cat > .claude/mcp-writing.json <<EOF
{
  "mcpServers": {
    "author": {
      "url": "${URLS[author]}"
    },
    "series-planning": {
      "url": "${URLS[series-planning]}"
    },
    "book-planning": {
      "url": "${URLS[book-planning]}"
    },
    "chapter-planning": {
      "url": "${URLS[chapter-planning]}"
    },
    "character-planning": {
      "url": "${URLS[character-planning]}"
    },
    "scene": {
      "url": "${URLS[scene]}"
    },
    "core-continuity": {
      "url": "${URLS[core-continuity]}"
    },
    "review": {
      "url": "${URLS[review]}"
    },
    "reporting": {
      "url": "${URLS[reporting]}"
    }
  }
}
EOF

# Generate mcp-review.json
cat > .claude/mcp-review.json <<EOF
{
  "mcpServers": {
    "core-continuity": {
      "url": "${URLS[core-continuity]}"
    },
    "review": {
      "url": "${URLS[review]}"
    },
    "reporting": {
      "url": "${URLS[reporting]}"
    },
    "character-planning": {
      "url": "${URLS[character-planning]}"
    }
  }
}
EOF

# Generate mcp-web.json (all servers)
cat > .claude/mcp-web.json <<EOF
{
  "mcpServers": {
    "author": {
      "url": "${URLS[author]}"
    },
    "series-planning": {
      "url": "${URLS[series-planning]}"
    },
    "book-planning": {
      "url": "${URLS[book-planning]}"
    },
    "chapter-planning": {
      "url": "${URLS[chapter-planning]}"
    },
    "character-planning": {
      "url": "${URLS[character-planning]}"
    },
    "scene": {
      "url": "${URLS[scene]}"
    },
    "core-continuity": {
      "url": "${URLS[core-continuity]}"
    },
    "review": {
      "url": "${URLS[review]}"
    },
    "reporting": {
      "url": "${URLS[reporting]}"
    }
  }
}
EOF

echo "✅ Updated .claude/mcp-planning.json"
echo "✅ Updated .claude/mcp-writing.json"
echo "✅ Updated .claude/mcp-review.json"
echo "✅ Updated .claude/mcp-web.json"

echo ""
echo "🎉 MCP configuration files updated successfully!"
echo ""
