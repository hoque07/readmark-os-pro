@echo off
setlocal
cd /d "%~dp0"
where code.cmd >nul 2>nul
if errorlevel 1 (
  echo VS Code's command-line launcher was not found.
  echo Open VS Code, choose File ^> Open Folder, and select:
  echo %~dp0
  pause
  exit /b 1
)
start "" code.cmd -n "%~dp0"
endlocal
