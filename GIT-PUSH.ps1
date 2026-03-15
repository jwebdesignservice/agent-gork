# Git push script for Agent Gork bot
Write-Host "Agent Gork - Git Push Setup" -ForegroundColor Cyan
Write-Host "============================================================"

# Navigate to bot directory
Set-Location $PSScriptRoot

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host ""
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git initialized" -ForegroundColor Green
}

# Check .gitignore exists
if (-not (Test-Path ".gitignore")) {
    Write-Host "ERROR: .gitignore missing! Creating it..." -ForegroundColor Red
    @"
node_modules/
.env
.bot-state.json
*.log
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
}

Write-Host ""
Write-Host "Checking for sensitive files..." -ForegroundColor Yellow

# Verify .env is in .gitignore
if (Test-Path ".env") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -notmatch "\.env") {
        Write-Host "WARNING: .env not in .gitignore!" -ForegroundColor Red
        Write-Host "Adding .env to .gitignore..." -ForegroundColor Yellow
        Add-Content ".gitignore" ".env"
    }
}

Write-Host "Sensitive files protected" -ForegroundColor Green

# Add all files
Write-Host ""
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .

# Show status
Write-Host ""
Write-Host "Git status:" -ForegroundColor Cyan
git status --short

# Commit
$commitMessage = "Save point: Agent Gork v1 - Grok API integration"
Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
Write-Host "Message: $commitMessage" -ForegroundColor Gray
git commit -m "$commitMessage"

Write-Host ""
Write-Host "============================================================"
Write-Host "Local commit complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps to push to GitHub:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create a new repo on GitHub:" -ForegroundColor Yellow
Write-Host "   https://github.com/new" -ForegroundColor Gray
Write-Host "   Name: agent-gork-bot" -ForegroundColor Gray
Write-Host "   (Keep it PRIVATE)" -ForegroundColor Red
Write-Host ""
Write-Host "2. Run these commands:" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git remote add origin https://github.com/jwebdesignservice/agent-gork-bot.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: Repo must be PRIVATE" -ForegroundColor Red
