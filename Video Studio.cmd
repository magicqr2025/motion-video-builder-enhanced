@echo off
rem Starts MagicBolt Video Studio (http://localhost:4321)
rem If it crashes (for example the PC runs out of memory) it restarts by itself; close this window to stop it.
cd /d "%~dp0studio"
if not exist node_modules call npm install --loglevel=error
node server/index.mjs
:again
if %errorlevel%==0 goto :eof
echo.
echo   Video Studio stopped (exit code %errorlevel%). Restarting in 5 seconds... close this window to stop.
timeout /t 5 /nobreak >nul
node server/index.mjs --no-open
goto again
