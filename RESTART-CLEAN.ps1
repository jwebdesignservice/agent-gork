Write-Host "🛑 Killing all node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "🧹 Clearing old state (fresh start)..." -ForegroundColor Yellow
if (Test-Path ".bot-state.json") {
    Remove-Item ".bot-state.json"
    Write-Host "   Deleted .bot-state.json" -ForegroundColor Gray
}

Write-Host "`n🚀 Starting bot with duplicate prevention..." -ForegroundColor Green
npx tsx src/main.ts
