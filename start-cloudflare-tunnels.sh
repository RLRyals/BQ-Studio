#!/bin/bash
# Script to start Cloudflare tunnels and generate MCP configuration
# Usage: ./start-cloudflare-tunnels.sh

set -e

echo "🚀 Starting Cloudflare Tunnels for MCP Writing Servers..."
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed."
    echo "Install with: brew install cloudflare/cloudflare/cloudflared"
    exit 1
fi

# Check if Docker container is running
if ! docker ps | grep -q mcp-writing-servers; then
    echo "❌ Docker container 'mcp-writing-servers' is not running."
    echo "Start it with your Electron app or: docker start mcp-writing-servers"
    exit 1
fi

echo "✅ Docker container is running"
echo ""

# Create logs directory
mkdir -p ~/.mcp-tunnel-logs

# Kill any existing cloudflared processes
echo "🧹 Cleaning up existing tunnels..."
pkill -f "cloudflared tunnel" || true
sleep 2

# Start tunnels
echo "🔗 Starting tunnels..."
echo ""

# Define port mappings
declare -A PORTS=(
    ["author"]=3009
    ["series-planning"]=3002
    ["book-planning"]=3001
    ["chapter-planning"]=3003
    ["character-planning"]=3004
    ["scene"]=3005
    ["core-continuity"]=3006
    ["review"]=3007
    ["reporting"]=3008
)

# Start each tunnel
for SERVER in "${!PORTS[@]}"; do
    PORT=${PORTS[$SERVER]}
    LOG_FILE=~/.mcp-tunnel-logs/tunnel-${SERVER}.log

    echo "  Starting tunnel for ${SERVER} (port ${PORT})..."
    cloudflared tunnel --url http://localhost:${PORT} > "${LOG_FILE}" 2>&1 &

    # Give it a moment to start
    sleep 2
done

echo ""
echo "⏳ Waiting for tunnels to initialize (10 seconds)..."
sleep 10

# Extract URLs from logs
echo ""
echo "📋 Extracting tunnel URLs..."
echo ""

declare -A URLS

for SERVER in "${!PORTS[@]}"; do
    LOG_FILE=~/.mcp-tunnel-logs/tunnel-${SERVER}.log
    URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" "${LOG_FILE}" | head -1)

    if [ -z "$URL" ]; then
        echo "  ❌ Failed to get URL for ${SERVER}"
    else
        URLS[$SERVER]=$URL
        echo "  ✅ ${SERVER}: ${URL}"
    fi
done

echo ""
echo "📝 Generating MCP configuration files..."
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

echo "✅ Generated .claude/mcp-planning.json"
echo "✅ Generated .claude/mcp-writing.json"
echo "✅ Generated .claude/mcp-review.json"
echo "✅ Generated .claude/mcp-web.json"

echo ""
echo "🎉 All tunnels are running!"
echo ""
echo "📌 Next Steps:"
echo "  1. Go to https://code.claude.com"
echo "  2. Upload your BQ-Studio project"
echo "  3. Upload one of the generated mcp-*.json files"
echo "  4. Start using your Writing Team!"
echo ""
echo "⚠️  Keep this terminal open - closing it will stop the tunnels"
echo ""
echo "🛑 To stop all tunnels, press Ctrl+C or run:"
echo "   pkill -f 'cloudflared tunnel'"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping tunnels...'; pkill -f 'cloudflared tunnel'; echo '✅ All tunnels stopped'; exit 0" INT TERM

echo "Press Ctrl+C to stop tunnels..."
wait
