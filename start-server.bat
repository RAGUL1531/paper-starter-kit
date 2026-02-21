@echo off
echo ========================================
echo Starting WebSocket Server
echo ========================================
echo.
echo Server will run on http://localhost:3001
echo Keep this window open while using the chat
echo.

cd /d "%~dp0\server"
call npm start
