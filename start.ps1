# LifeOS Start Script (PowerShell)
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting LifeOS (Frontend + Backend)... " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Sync database schema & generate Prisma client
Write-Host "`n[1/2] Syncing database schema & Prisma client..." -ForegroundColor Yellow
npx prisma db push
npx prisma generate

# 2. Launch Next.js Dev Server
Write-Host "`n[2/2] Launching LifeOS dev server on http://localhost:3000..." -ForegroundColor Green
npm run dev
