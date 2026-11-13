@echo off
setlocal
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -m services.fidelity.run --check --demo --reference %*
) else (
  python -m services.fidelity.run --check --demo %*
)
exit /b %errorlevel%
