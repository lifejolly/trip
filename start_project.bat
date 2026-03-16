@echo off
setlocal

cd /d "%~dp0"

python --version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python is not installed or not in PATH.
  echo Please install Python 3 and try again.
  pause
  exit /b 1
)

echo Starting Trip website...
echo URL: http://localhost:8080
echo Press Ctrl+C to stop the server.
echo.

python -m http.server 8080

endlocal
