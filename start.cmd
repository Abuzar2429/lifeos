@echo off
echo ==========================================
echo  Starting LifeOS (Frontend + Backend)... 
echo ==========================================

echo.
echo [1/2] Syncing database schema & Prisma client...
call npx prisma db push
call npx prisma generate

echo.
echo [2/2] Launching LifeOS dev server on http://localhost:3000...
call npm run dev
