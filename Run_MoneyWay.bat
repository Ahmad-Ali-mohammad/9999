@echo off
echo ==========================================
echo       MONEY WAY - STARTING APPLICATION
echo ==========================================
echo.
echo Starting Backend...
start cmd /k "cd backend && npm run dev"
echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"
echo.
echo Application is starting! 
echo Keep these windows open while using the app.
echo.
pause
