@echo off
setlocal
cd /d "%~dp0"
set "PULSO_NODE=%ProgramFiles%\nodejs\node.exe"
if not exist "%PULSO_NODE%" set "PULSO_NODE=%~dp0.tools\node-v24.22.1-win-x64\node.exe"
if not exist "%PULSO_NODE%" goto missing
"%PULSO_NODE%" scripts\local-server.mjs %*
if errorlevel 1 goto failed
if "%~1"=="--stop" exit /b 0
start "" "http://localhost:8081/"
exit /b 0
:missing
echo Falta Node.js. Consulte docs\GUIA_WINDOWS.md.
:failed
pause
exit /b 1
