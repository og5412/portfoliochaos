@echo off
setlocal
cd /d "%~dp0"
title Jiawei Liu - Portfolio Preview
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "%~dp0preview.py"
  exit /b
)
where py >nul 2>nul
if not errorlevel 1 (
  py -3 "%~dp0preview.py"
  exit /b
)
where python >nul 2>nul
if not errorlevel 1 (
  python "%~dp0preview.py"
  exit /b
)
echo Python 3 is required for the local 3D preview. A hosted website does not need Python.
pause
