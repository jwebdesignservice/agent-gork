Write-Host "Stopping Agent Gork bot..." -ForegroundColor Red
taskkill /F /IM node.exe 2>$null
taskkill /F /IM tsx.exe 2>$null
Write-Host "Bot stopped." -ForegroundColor Green
