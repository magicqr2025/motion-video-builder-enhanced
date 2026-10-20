@echo off
rem Starts MagicBolt Video Studio (http://localhost:4321)
cd /d "%~dp0studio"
if not exist node_modules call npm install --loglevel=error
node server/index.mjs
