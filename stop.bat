@echo off
echo ==========================================
echo  Stopping LifeOS (Frontend + Backend)... 
echo ==========================================

echo.
echo Stopping Node.exe processes and port 3000 server...
taskkill /F /IM node.exe /T 2>nul

echo.
echo [SUCCESS] LifeOS stopped successfully!
