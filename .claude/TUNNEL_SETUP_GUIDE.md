# MCP Tunnel Setup Guide for Claude Code Web

This guide helps you expose your local Docker MCP servers to Claude Code Web via Cloudflare Tunnel or ngrok.

---

## Context Optimization Strategy

Instead of loading all 9 MCP servers at once (which fills context), you can use **phase-specific configurations**:

- **mcp-planning.json** - For series/book/chapter planning (5 servers)
- **mcp-writing.json** - For scene writing (3 servers)
- **mcp-review.json** - For QA and review (4 servers)
- **mcp-web.json** - All servers (9 servers) - use sparingly

Claude Code Web will upload your chosen config when you start a session.

---

## Option A: Cloudflare Tunnel (Recommended - FREE)

### Step 1: Install Cloudflare Tunnel

**macOS:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

**Windows:**
Download from: https://github.com/cloudflare/cloudflared/releases

### Step 2: Authenticate

```bash
cloudflared tunnel login
```

This opens your browser to authenticate with Cloudflare.

### Step 3: Create a Tunnel

```bash
cloudflared tunnel create mcp-writing-servers
```

This creates a tunnel and saves credentials to `~/.cloudflared/TUNNEL_ID.json`

### Step 4: Create DNS Records

For each server, create a DNS CNAME record pointing to your tunnel:

```bash
cloudflared tunnel route dns mcp-writing-servers mcp-author.YOUR_DOMAIN.com
cloudflared tunnel route dns mcp-writing-servers mcp-series.YOUR_DOMAIN.com
cloudflared tunnel route dns mcp-writing-servers mcp-book.YOUR_DOMAIN.com
cloudflared tunnel route dns mcp-writing-servers mcp-chapter.YOUR_DOMAIN.com
cloudflared tunnel route dns mcp-writing-servers mcp-character.YOUR_DOMAIN.com
cloudflared tunnel route dns mcp-writing-servers mcp-scene.YOUR_DOMAIN.com
cloudflared tunnel route dns mcp-writing-servers mcp-continuity.YOUR_DOMAIN.com
cloudflared tunnel route dns mcp-writing-servers mcp-review.YOUR_DOMAIN.com
cloudflared tunnel route dns mcp-writing-servers mcp-reporting.YOUR_DOMAIN.com
```

**Note:** You need a domain registered with Cloudflare. Free domains work!

### Step 5: Update Configuration File

Edit `cloudflare-tunnel-config.yml` and replace:
- `YOUR_USERNAME` with your actual username
- `YOUR_TUNNEL_ID` with the tunnel ID from step 3
- `YOUR_DOMAIN.com` with your actual domain

### Step 6: Update MCP JSON Files

In `mcp-planning.json`, `mcp-writing.json`, `mcp-review.json`, and `mcp-web.json`:

Replace `YOUR_DOMAIN.com` with your actual domain.

### Step 7: Start the Tunnel

```bash
cloudflared tunnel --config ~/.cloudflare-tunnel-config.yml run mcp-writing-servers
```

**Or run as a service:**
```bash
cloudflared service install
```

### Step 8: Verify

Test each endpoint:
```bash
curl https://mcp-author.YOUR_DOMAIN.com/health
curl https://mcp-series.YOUR_DOMAIN.com/health
# etc...
```

---

## Option B: ngrok (Requires Paid Plan for 9 Tunnels)

### Step 1: Install ngrok

**macOS:**
```bash
brew install ngrok/ngrok/ngrok
```

**Linux/Windows:**
Download from: https://ngrok.com/download

### Step 2: Authenticate

```bash
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

### Step 3: Start All Tunnels

**With reserved domains (paid plan):**
```bash
ngrok start --all --config ~/ngrok-config.yml
```

**Without reserved domains (randomized URLs):**
```bash
# You'll need to start each tunnel individually and note the URLs
ngrok http 3009 --log stdout > ngrok-author.log &
ngrok http 3002 --log stdout > ngrok-series.log &
ngrok http 3001 --log stdout > ngrok-book.log &
# etc...
```

### Step 4: Update MCP JSON Files

Replace the URLs in `mcp-planning.json`, `mcp-writing.json`, etc. with your ngrok URLs:

```json
{
  "mcpServers": {
    "author": {
      "url": "https://abc123.ngrok.io"
    },
    "series-planning": {
      "url": "https://def456.ngrok.io"
    }
    // etc...
  }
}
```

---

## Security Considerations

### Add Authentication

Your MCP servers support `MCP_AUTH_TOKEN`. Add it to your Docker container:

```bash
docker exec mcp-writing-servers \
  sh -c 'echo "MCP_AUTH_TOKEN=your_secure_token_here" >> /app/.env'
```

Then restart the container.

In your MCP JSON files, add the auth header:

```json
{
  "mcpServers": {
    "author": {
      "url": "https://mcp-author.YOUR_DOMAIN.com",
      "headers": {
        "Authorization": "Bearer your_secure_token_here"
      }
    }
  }
}
```

### Firewall Rules

Consider adding IP restrictions in Cloudflare to only allow:
- Your home IP
- Anthropic's Claude Code Web IPs (if publicly documented)

---

## Using with Claude Code Web

### Step 1: Start Your Tunnel

Make sure either Cloudflare Tunnel or ngrok is running.

### Step 2: Verify Docker Container

```bash
docker ps | grep mcp-writing-servers
```

Should show the container running.

### Step 3: Choose Your MCP Configuration

Based on what you're working on:
- **Planning a series/book/chapter?** Use `mcp-planning.json`
- **Writing scenes?** Use `mcp-writing.json`
- **Reviewing for continuity?** Use `mcp-review.json`
- **Need everything?** Use `mcp-web.json`

### Step 4: Open Claude Code Web

Go to: https://code.claude.com

### Step 5: Upload Your Project

Upload your BQ-Studio directory (including `.claude/` folder with agents and skills)

### Step 6: Configure MCPs

In Claude Code Web settings, upload your chosen MCP configuration file.

### Step 7: Test Connection

```
List available MCP tools
```

You should see tools from your active servers.

### Step 8: Invoke Your Writing Team

```
Miranda, let's plan my series
```

---

## Troubleshooting

### Tunnel Not Connecting

**Check Docker container:**
```bash
docker ps | grep mcp-writing-servers
docker logs mcp-writing-servers
```

**Check tunnel status:**
```bash
# Cloudflare
cloudflared tunnel info mcp-writing-servers

# ngrok
curl http://localhost:4040/api/tunnels
```

### MCP Tools Not Appearing

**Test endpoint directly:**
```bash
curl https://mcp-author.YOUR_DOMAIN.com/mcp/list_tools
```

Should return JSON with tool definitions.

### Context Still Full

Make sure you're using the **phase-specific configs** (mcp-planning.json, mcp-writing.json, mcp-review.json), not mcp-web.json with all 9 servers.

---

## Cost Comparison

| Solution | Free Tier | Paid |
|----------|-----------|------|
| **Cloudflare Tunnel** | ✅ Unlimited tunnels | $0/month |
| **ngrok** | 1 tunnel, random URLs | $8/month for static domains + multiple tunnels |

**Recommendation:** Use Cloudflare Tunnel for production use with your Writing Team.

---

## Quick Reference

**Port Mappings:**
- 3009: author
- 3002: series-planning
- 3001: book-planning
- 3003: chapter-planning
- 3004: character-planning
- 3005: scene
- 3006: core-continuity
- 3007: review
- 3008: reporting

**Configuration Files:**
- `mcp-planning.json` - 5 servers (author, series, book, chapter, character)
- `mcp-writing.json` - 3 servers (scene, character, continuity)
- `mcp-review.json` - 4 servers (continuity, review, reporting, character)
- `mcp-web.json` - All 9 servers
- `mcp.json` - Local VS Code config (docker exec)

**When to Use Which:**
- Series/book/chapter planning → `mcp-planning.json`
- Scene writing → `mcp-writing.json`
- Continuity review → `mcp-review.json`
- Local VS Code → `mcp.json` (no tunnel needed)
- Claude Code Web (everything) → `mcp-web.json` (last resort)
