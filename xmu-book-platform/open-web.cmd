@echo off
setlocal
cd /d "%~dp0"

start "XMU-Book-Dev" cmd /k "npm.cmd run dev"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"

endlocal
