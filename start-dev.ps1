# ZENNARA Development Server Startup - PowerShell Version
# Run: .\start-dev.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ZENNARA Development Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check .env.backend
if (-not (Test-Path ".env.backend")) {
    Write-Host "Creating .env.backend from template..." -ForegroundColor Yellow
    if (Test-Path ".env.backend.example") {
        Copy-Item ".env.backend.example" ".env.backend"
        Write-Host "[OK] .env.backend created" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Edit .env.backend with your credentials:" -ForegroundColor Yellow
        Write-Host "  1. notepad .env.backend" -ForegroundColor White
        Write-Host "  2. Update SMTP_USER and SMTP_PASS" -ForegroundColor White
        Write-Host "  3. Save and close" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to continue"
    } else {
        Write-Host "[FAIL] .env.backend.example not found!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check PHP
try {
    $php_version = php --version 2>&1 | Select-Object -First 1
    Write-Host "[OK] $php_version" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] PHP not found in PATH!" -ForegroundColor Red
    Write-Host "Install from: https://www.php.net/downloads" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js
try {
    $node_version = node --version
    Write-Host "[OK] Node.js $node_version" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Node.js not found!" -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npm_version = npm --version
    Write-Host "[OK] npm $npm_version" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] npm not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Development Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = Get-Location

# Start PHP server
Write-Host "Opening Terminal 1: PHP Server..." -ForegroundColor Yellow
$php_script = @"
cd `"$projectPath`"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PHP Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting PHP server on http://localhost:8000" -ForegroundColor Green
Write-Host ""
php -S localhost:8000 -t .
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $php_script -WindowStyle Normal -PassThru | Out-Null

Start-Sleep -Seconds 2

# Start Vite server
Write-Host "Opening Terminal 2: Vite Dev Server..." -ForegroundColor Yellow
$vite_script = @"
cd `"$projectPath`"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vite Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Vite dev server on http://localhost:3000" -ForegroundColor Green
Write-Host "This may take 15-30 seconds..." -ForegroundColor Yellow
Write-Host ""
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $vite_script -WindowStyle Normal -PassThru | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Servers Starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Browser will open automatically at:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Key URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  Contact:     http://localhost:3000/contact" -ForegroundColor White
Write-Host "  Admin:       http://localhost:3000/backend/admin.php" -ForegroundColor White
Write-Host "  Analytics:   http://localhost:3000/backend/analytics.php" -ForegroundColor White
Write-Host ""
Write-Host "To STOP: Press Ctrl+C in each terminal window" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to close this window"
