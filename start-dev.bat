@echo off
REM =====================================================
REM ZENNARA Development Server Startup Script
REM Starts both PHP and Vite dev servers
REM =====================================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   ZENNARA Development Environment
echo ========================================
echo.

REM Check if .env.backend exists, create if missing
if not exist ".env.backend" (
    echo WARNING: .env.backend not found
    echo Creating from template...
    if exist ".env.backend.example" (
        copy ".env.backend.example" ".env.backend" >nul
        echo [OK] Created .env.backend
        echo.
        echo IMPORTANT: Edit .env.backend with your Gmail credentials:
        echo   1. notepad .env.backend
        echo   2. Update SMTP_USER and SMTP_PASS
        echo   3. Save and close
        echo.
        pause
    ) else (
        echo ERROR: .env.backend.example not found!
        pause
        exit /b 1
    )
)

echo Checking prerequisites...
echo.

php --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] PHP not found in PATH
    echo Please install PHP 7.4+ from https://www.php.net/downloads
    echo And add it to your system PATH
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('php --version ^| findstr /r "^PHP"') do set PHP_VERSION=%%i
echo [OK] PHP %PHP_VERSION% found

node --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Node.js not found in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
for /f %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

npm --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] npm not found!
    pause
    exit /b 1
)
echo [OK] npm found

echo.
echo ========================================
echo   Creating startup scripts...
echo ========================================
echo.

REM Create PHP server startup script
(
    echo @echo off
    echo title PHP Development Server - ZENNARA
    echo color 0A
    echo cls
    echo echo.
    echo echo ========================================
    echo echo PHP Development Server - ZENNARA
    echo echo ========================================
    echo echo.
    echo echo Starting PHP server on http://localhost:8000
    echo echo.
    echo cd /d "%CD%"
    echo php -S localhost:8000 -t .
    echo pause
) > "start-php.bat"

REM Create Vite server startup script
(
    echo @echo off
    echo title Vite Development Server - ZENNARA
    echo color 0B
    echo cls
    echo echo.
    echo echo ========================================
    echo echo Vite Development Server - ZENNARA
    echo echo ========================================
    echo echo.
    echo echo Starting Vite dev server on http://localhost:3000
    echo echo This may take 15-30 seconds...
    echo echo.
    echo cd /d "%CD%"
    echo npm run dev
    echo pause
) > "start-vite.bat"

echo [OK] start-php.bat created
echo [OK] start-vite.bat created

echo.
echo ========================================
echo   READY TO START!
echo ========================================
echo.
echo Two new terminal windows will open:
echo   1. PHP Server (localhost:8000)
echo   2. Vite/React Dev Server (localhost:3000)
echo.
echo.
echo Opening Terminal 1: PHP Server...
start "PHP Server" cmd /k "cd /d "%CD%" && call start-php.bat"

timeout /t 3

echo Opening Terminal 2: Vite Dev Server...
start "Vite Server" cmd /k "cd /d "%CD%" && call start-vite.bat"

echo.
echo ========================================
echo.
echo Browser will open automatically at:
echo   http://localhost:3000
echo.
echo Key URLs:
echo   Frontend:        http://localhost:3000
echo   Contact Form:    http://localhost:3000/contact
echo   Admin Panel:     http://localhost:3000/backend/admin.php
echo   Analytics:       http://localhost:3000/backend/analytics.php
echo.
echo To STOP servers: Press Ctrl+C in each terminal
echo.
echo ========================================
echo.

pause
