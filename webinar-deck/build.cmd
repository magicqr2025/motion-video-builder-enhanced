@echo off
rem Rebuilds both decks after editing anything in src\
rem   index.html = bright design (deck.js)     night.html = City Lights design (night.js)
cd /d "%~dp0"
set ESB=..\magicbolt-reel\node_modules\.bin\esbuild
set OPT=--bundle --minify --format=iife --alias:three=..\magicbolt-reel\node_modules\three\build\three.module.js
call %ESB% src\main.js %OPT% --outfile=deck.js
call %ESB% src\night.js %OPT% --outfile=night.js
