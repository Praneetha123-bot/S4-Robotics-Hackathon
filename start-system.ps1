# ============================================================
# S4 Remote Robot Management System - Quick Start Script
# ============================================================
# This script starts all system components automatically

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  S4 Remote Robot Management System - Starting..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Kill any existing node/webots processes
Write-Host "→ Stopping existing processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "webots-bin" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend
Write-Host "→ Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; Write-Host '🚀 Backend Server' -ForegroundColor Cyan; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "→ Starting Frontend Dashboard..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; Write-Host '🌐 Frontend Dashboard' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Webots
Write-Host "→ Launching Webots Simulation..." -ForegroundColor Green
$webotsPaths = @(
    "C:\Program Files\Webots\msys64\mingw64\bin\webots.exe",
    "C:\Webot\Webots\msys64\mingw64\bin\webots.exe",
    "C:\Webots\msys64\mingw64\bin\webots.exe"
)

$webotsExe = $null
foreach ($path in $webotsPaths) {
    if (Test-Path $path) {
        $webotsExe = $path
        break
    }
}

if ($webotsExe) {
    $worldFile = "$projectRoot\webots_project\worlds\robot_world_humanoid.wbt"
    if (Test-Path $worldFile) {
        Start-Process $webotsExe -ArgumentList "`"$worldFile`""
        Write-Host "✓ Webots launched!" -ForegroundColor Green
    } else {
        Write-Host "✗ World file not found: $worldFile" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Webots not found! Please install from https://cyberbotics.com" -ForegroundColor Red
}

Start-Sleep -Seconds 5

# Open Browser
Write-Host "→ Opening Dashboard in Browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  System Started Successfully!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dashboard: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop services." -ForegroundColor Yellow
Write-Host ""
