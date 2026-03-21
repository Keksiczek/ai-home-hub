@echo off
REM install.bat – Install AI Home Hub as a Windows service via Docker Compose
REM
REM Prerequisites:
REM   - Docker Desktop for Windows installed and running
REM   - Run this script as Administrator
REM
REM This script:
REM   1. Verifies Docker is available
REM   2. Creates the data directory
REM   3. Starts docker compose prod
REM   4. Optionally creates a scheduled task to start on boot

setlocal EnableDelayedExpansion

echo === AI Home Hub - Windows Install ===
echo.

REM Check Docker
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker is not installed or not in PATH.
    echo Please install Docker Desktop for Windows first.
    pause
    exit /b 1
)

docker compose version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: docker compose not available.
    echo Please update Docker Desktop.
    pause
    exit /b 1
)

REM Navigate to repo root (two levels up from files\windows\)
cd /d "%~dp0..\.."
set "REPO_ROOT=%CD%"
echo Repo root: %REPO_ROOT%

REM Create data directory
if not exist "%REPO_ROOT%\data" mkdir "%REPO_ROOT%\data"

REM Copy .env.prod if not exists
if not exist "%REPO_ROOT%\.env.prod" (
    if exist "%REPO_ROOT%\.env.prod.example" (
        echo Creating .env.prod from example...
        copy "%REPO_ROOT%\.env.prod.example" "%REPO_ROOT%\.env.prod"
        echo   Edit .env.prod to customize settings.
    )
)

REM Start Docker Compose
echo.
echo Starting Docker Compose (prod)...
docker compose -f docker-compose.prod.yml up -d --build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker Compose failed to start.
    pause
    exit /b 1
)

REM Create scheduled task for auto-start on boot
echo.
set /p CREATE_TASK="Create scheduled task for auto-start on boot? (y/n): "
if /i "%CREATE_TASK%"=="y" (
    schtasks /create /tn "AIHomeHub" /tr "docker compose -f \"%REPO_ROOT%\docker-compose.prod.yml\" up -d" /sc onstart /ru System /f
    if %ERRORLEVEL% equ 0 (
        echo Scheduled task 'AIHomeHub' created successfully.
    ) else (
        echo WARNING: Could not create scheduled task. Run this script as Administrator.
    )
)

echo.
echo === Install complete ===
echo   App:    http://localhost:8000
echo   Stop:   docker compose -f docker-compose.prod.yml down
echo   Logs:   docker compose -f docker-compose.prod.yml logs -f
echo.
pause
