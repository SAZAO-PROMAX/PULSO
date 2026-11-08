@echo off
setlocal
cd /d "%~dp0"
set "PULSO_NODE="
if exist "%ProgramFiles%\nodejs\node.exe" set "PULSO_NODE=%ProgramFiles%\nodejs\node.exe"
if not defined PULSO_NODE if exist ".tools\node-v24.22.1-win-x64\node.exe" set "PULSO_NODE=.tools\node-v24.22.1-win-x64\node.exe"
if not defined PULSO_NODE goto missing
"%PULSO_NODE%" scripts\dev.mjs %*
exit /b %errorlevel%
:missing
echo Instala Node.js LTS x64 para Windows e volta a abrir o terminal.
exit /b 1
