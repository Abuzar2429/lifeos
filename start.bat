@echo off
echo ==========================================
echo  Starting LifeOS (Frontend + Backend)... 
echo ==========================================

powershell -ExecutionPolicy Bypass -File ./stop.ps1 >nul 2>&1

echo.
echo [1/2] Syncing database schema...
call npx prisma db push --skip-generate

echo.
echo [2/2] Launching LifeOS dev server on http://localhost:3000...
call npm run dev
