# Updating MCP Tunnel URLs

Cloudflare tunnel URLs change each time you restart the tunnels. Use these scripts to automatically update your MCP configuration files.

## Quick Reference

### Method 1: From Running Tunnels (Recommended)
If you started tunnels with `./start-cloudflare-tunnels.sh`:

```bash
./update-mcp-urls.sh
```

This reads the tunnel URLs from `~/.mcp-tunnel-logs/` and updates all MCP config files.

### Method 2: From Tunnel Output
If your tunnels output URL information in this format:
```
SUCCESS: series-planning : https://arms-freebsd-interesting-science.trycloudflare.com
SUCCESS: reporting : https://demand-grammar-debug-finite.trycloudflare.com
...
```

**Option A: From a file**
```bash
./update-mcp-from-output.sh < tunnel-urls.txt
```

**Option B: Pipe directly**
```bash
your-tunnel-script | ./update-mcp-from-output.sh
```

**Option C: Copy/paste interactively**
```bash
./update-mcp-from-output.sh
# Paste your tunnel output
# Press Ctrl+D when done
```

## What Gets Updated

All scripts update these 4 MCP configuration files:

1. **`.claude/mcp-writing.json`** - All 9 servers (for Writing Team)
2. **`.claude/mcp-planning.json`** - 5 planning servers only
3. **`.claude/mcp-review.json`** - 4 review servers only
4. **`.claude/mcp-web.json`** - All 9 servers (legacy)

## Required Servers

All 9 MCP servers must be running:
- `author` (port 3009)
- `series-planning` (port 3002)
- `book-planning` (port 3001)
- `chapter-planning` (port 3003)
- `character-planning` (port 3004)
- `scene` (port 3005)
- `core-continuity` (port 3006)
- `review` (port 3007)
- `reporting` (port 3008)

## Troubleshooting

### "No tunnel logs found"
- Run `./start-cloudflare-tunnels.sh` first to start tunnels
- Or use `update-mcp-from-output.sh` instead

### "Missing URL for [server]"
- Check that all 9 MCP servers are running
- Verify docker container: `docker ps | grep mcp-writing-servers`
- Check tunnel processes: `ps aux | grep cloudflared`

### "Access denied" when testing
- This is normal! HTTP 403 means tunnels are secured correctly
- MCP clients will authenticate properly when connecting

## After Updating

Restart your Claude Code session or reload the MCP configuration to pick up the new URLs.
