#!/bin/bash
# Script to update MCP configuration files from running Cloudflare tunnels
# Usage: ./update-mcp-urls.sh

set -e

echo "📋 Updating MCP configuration from running tunnels..."
echo ""

# Check if log directory exists
if [ ! -d ~/.mcp-tunnel-logs ]; then
    echo "❌ No tunnel logs found at ~/.mcp-tunnel-logs"
    echo "Run ./start-cloudflare-tunnels.sh first to start the tunnels"
    exit 1
fi

# Extract URLs from logs
echo "🔍 Extracting tunnel URLs from logs..."
echo ""

declare -A URLS

# Define all MCP servers
SERVERS=("author" "series-planning" "book-planning" "chapter-planning" "character-planning" "scene" "core-continuity" "review" "reporting")

for SERVER in "${SERVERS[@]}"; do
    LOG_FILE=~/.mcp-tunnel-logs/tunnel-${SERVER}.log

    if [ ! -f "$LOG_FILE" ]; then
        echo "  ⚠️  No log file for ${SERVER}"
        continue
    fi

    URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" "${LOG_FILE}" | head -1)

    if [ -z "$URL" ]; then
        echo "  ❌ Failed to get URL for ${SERVER}"
    else
        URLS[$SERVER]=$URL
        echo "  SUCCESS: ${SERVER} : ${URL}"
    fi
done

echo ""

# Check if we got all URLs
MISSING=0
for SERVER in "${SERVERS[@]}"; do
    if [ -z "${URLS[$SERVER]}" ]; then
        echo "❌ Missing URL for ${SERVER}"
        MISSING=1
    fi
done

if [ $MISSING -eq 1 ]; then
    echo ""
    echo "⚠️  Some URLs are missing. Check that all tunnels are running."
    echo "Run: ps aux | grep cloudflared"
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
echo "📌 Changed tunnel URLs:"
for SERVER in "${SERVERS[@]}"; do
    echo "  ${SERVER}: ${URLS[$SERVER]}"
done
echo ""
