@echo off
echo ========================================
echo WebSocket Chat & Video Call Setup
echo ========================================
echo.

echo Step 1: Installing frontend dependencies...
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend dependencies installation failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Server dependencies installation failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Run 'start-server.bat' in one terminal
echo 2. Run 'npm run dev' in another terminal
echo 3. Open http://localhost:5173/chat in your browser
echo.
pause
