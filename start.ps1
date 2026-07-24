# LifeOS Start Script (PowerShell)
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting LifeOS (Frontend + Backend)... " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Stop any existing process on port 3000 to avoid file locks & port conflicts
$port = 3000
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $pidToKill = $conn.OwningProcess
        if ($pidToKill) {
            Write-Host "Clearing existing process PID $pidToKill on port $port..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    }
}

# 2. Sync database schema
Write-Host "`n[1/2] Syncing database schema..." -ForegroundColor Yellow
npx prisma db push --skip-generate

# 3. Launch Next.js Dev Server
Write-Host "`n[2/2] Launching LifeOS dev server on http://localhost:3000..." -ForegroundColor Green
npm run dev
