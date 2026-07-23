# LifeOS Stop Script (PowerShell)
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Stopping LifeOS (Frontend + Backend)... " -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Cyan

# Find any process listening on port 3000
$port = 3000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    foreach ($conn in $connections) {
        $pidToKill = $conn.OwningProcess
        if ($pidToKill) {
            Write-Host "Stopping process PID $pidToKill on port $port..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    }
}

# Terminate node processes running Next.js dev server
Write-Host "Stopping Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe /T 2>$null

Write-Host "`n✓ LifeOS stopped successfully!" -ForegroundColor Green
