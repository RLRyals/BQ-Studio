# PowerShell Script to start Cloudflare tunnels and generate MCP configuration
# Usage: .\start-cloudflare-tunnels.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Cloudflare Tunnels for MCP Writing Servers..." -ForegroundColor Green
Write-Host ""

# Check if cloudflared is installed
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host "❌ cloudflared is not installed." -ForegroundColor Red
    Write-Host "Install with:" -ForegroundColor Yellow
    Write-Host "  Option 1: winget install --id Cloudflare.cloudflared" -ForegroundColor Cyan
    Write-Host "  Option 2: Download from https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Cyan
    exit 1
}

# Check if Docker container is running
$dockerCheck = docker ps 2>&1 | Select-String "mcp-writing-servers"
if (-not $dockerCheck) {
    Write-Host "❌ Docker container 'mcp-writing-servers' is not running." -ForegroundColor Red
    Write-Host "Start it with your Electron app or: docker start mcp-writing-servers" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker container is running" -ForegroundColor Green
Write-Host ""

# Create logs directory
$logsDir = "$env:USERPROFILE\.mcp-tunnel-logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

# Kill any existing cloudflared processes
Write-Host "🧹 Cleaning up existing tunnels..." -ForegroundColor Yellow
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Define port mappings
$ports = @{
    "author" = 3009
    "series-planning" = 3002
    "book-planning" = 3001
    "chapter-planning" = 3003
    "character-planning" = 3004
    "scene" = 3005
    "core-continuity" = 3006
    "review" = 3007
    "reporting" = 3008
}

# Start tunnels
Write-Host "🔗 Starting tunnels..." -ForegroundColor Green
Write-Host ""

$jobs = @{}

foreach ($server in $ports.Keys) {
    $port = $ports[$server]
    $logFile = "$logsDir\tunnel-$server.log"

    Write-Host "  Starting tunnel for $server (port $port)..." -ForegroundColor Cyan

    # Start cloudflared in background
    $job = Start-Process -FilePath "cloudflared" `
        -ArgumentList "tunnel", "--url", "http://localhost:$port" `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError "$logFile.err" `
        -NoNewWindow `
        -PassThru

    $jobs[$server] = @{
        Process = $job
        LogFile = $logFile
    }

    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "⏳ Waiting for tunnels to initialize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Extract URLs from logs
Write-Host ""
Write-Host "📋 Extracting tunnel URLs..." -ForegroundColor Green
Write-Host ""

$urls = @{}

foreach ($server in $ports.Keys) {
    $logFile = $jobs[$server].LogFile

    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        if ($content -match "(https://[a-z0-9-]+\.trycloudflare\.com)") {
            $url = $Matches[1]
            $urls[$server] = $url
            Write-Host "  ✅ $server : $url" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to get URL for $server" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ Log file not found for $server" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📝 Generating MCP configuration files..." -ForegroundColor Green
Write-Host ""

# Generate mcp-planning.json
$planningConfig = @{
    mcpServers = @{
        author = @{ url = $urls["author"] }
        "series-planning" = @{ url = $urls["series-planning"] }
        "book-planning" = @{ url = $urls["book-planning"] }
        "chapter-planning" = @{ url = $urls["chapter-planning"] }
        "character-planning" = @{ url = $urls["character-planning"] }
    }
} | ConvertTo-Json -Depth 10

$planningConfig | Out-File -FilePath ".claude\mcp-planning.json" -Encoding UTF8

# Generate mcp-writing.json
$writingConfig = @{
    mcpServers = @{
        scene = @{ url = $urls["scene"] }
        "character-planning" = @{ url = $urls["character-planning"] }
        "core-continuity" = @{ url = $urls["core-continuity"] }
    }
} | ConvertTo-Json -Depth 10

$writingConfig | Out-File -FilePath ".claude\mcp-writing.json" -Encoding UTF8

# Generate mcp-review.json
$reviewConfig = @{
    mcpServers = @{
        "core-continuity" = @{ url = $urls["core-continuity"] }
        review = @{ url = $urls["review"] }
        reporting = @{ url = $urls["reporting"] }
        "character-planning" = @{ url = $urls["character-planning"] }
    }
} | ConvertTo-Json -Depth 10

$reviewConfig | Out-File -FilePath ".claude\mcp-review.json" -Encoding UTF8

# Generate mcp-web.json (all servers)
$webConfig = @{
    mcpServers = @{
        author = @{ url = $urls["author"] }
        "series-planning" = @{ url = $urls["series-planning"] }
        "book-planning" = @{ url = $urls["book-planning"] }
        "chapter-planning" = @{ url = $urls["chapter-planning"] }
        "character-planning" = @{ url = $urls["character-planning"] }
        scene = @{ url = $urls["scene"] }
        "core-continuity" = @{ url = $urls["core-continuity"] }
        review = @{ url = $urls["review"] }
        reporting = @{ url = $urls["reporting"] }
    }
} | ConvertTo-Json -Depth 10

$webConfig | Out-File -FilePath ".claude\mcp-web.json" -Encoding UTF8

Write-Host "✅ Generated .claude\mcp-planning.json" -ForegroundColor Green
Write-Host "✅ Generated .claude\mcp-writing.json" -ForegroundColor Green
Write-Host "✅ Generated .claude\mcp-review.json" -ForegroundColor Green
Write-Host "✅ Generated .claude\mcp-web.json" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 All tunnels are running!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open your BQ-Studio repo in Claude Code Web (already connected via GitHub)"
Write-Host "  2. Go to Settings → MCP Servers"
Write-Host "  3. Upload one of the generated mcp-*.json files from .claude/ folder"
Write-Host "  4. Start using your Writing Team!"
Write-Host ""
Write-Host "⚠️  Keep this window open - closing it will stop the tunnels" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛑 To stop all tunnels, press Ctrl+C" -ForegroundColor Red
Write-Host ""

# Wait for user interrupt
try {
    Write-Host "Press Ctrl+C to stop tunnels..." -ForegroundColor Yellow
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Stopping tunnels..." -ForegroundColor Yellow
    Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ All tunnels stopped" -ForegroundColor Green
}
