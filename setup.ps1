# ============================================================
# S4 Remote Robot Management System - Automatic Setup Script
# ============================================================
# This script automatically checks and installs all required dependencies
# Author: Fitfest25 Hackathon Team
# Date: December 1, 2025

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  S4 Remote Robot Management System - Auto Setup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Function to get version
function Get-Version {
    param([string]$Command, [string]$VersionArg = "--version")
    try {
        $version = & $Command $VersionArg 2>&1 | Select-Object -First 1
        return $version
    } catch {
        return "Unknown"
    }
}

# Check and Install Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = Get-Version "node" "-v"
    Write-Host "  ✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js is NOT installed!" -ForegroundColor Red
    Write-Host "  → Installing Node.js (LTS)..." -ForegroundColor Yellow
    
    # Download and install Node.js
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    
    try {
        Write-Host "  → Downloading from nodejs.org..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
        Write-Host "  → Running installer..." -ForegroundColor Cyan
        Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart" -Wait
        Write-Host "  ✓ Node.js installed successfully!" -ForegroundColor Green
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } catch {
        Write-Host "  ✗ Failed to install Node.js automatically" -ForegroundColor Red
        Write-Host "  → Please download manually from: https://nodejs.org/" -ForegroundColor Yellow
        Write-Host "  → Press any key to continue..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

Write-Host ""

# Check npm
Write-Host "[2/5] Checking npm..." -ForegroundColor Yellow
if (Test-Command "npm") {
    $npmVersion = Get-Version "npm" "-v"
    Write-Host "  ✓ npm is installed: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ npm is NOT installed (should come with Node.js)!" -ForegroundColor Red
}

Write-Host ""

# Check Python
Write-Host "[3/5] Checking Python..." -ForegroundColor Yellow
if (Test-Command "python") {
    $pythonVersion = Get-Version "python" "--version"
    Write-Host "  ✓ Python is installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Python is NOT installed!" -ForegroundColor Red
    Write-Host "  → Installing Python 3.11..." -ForegroundColor Yellow
    
    # Download and install Python
    $pythonInstaller = "$env:TEMP\python-installer.exe"
    $pythonUrl = "https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe"
    
    try {
        Write-Host "  → Downloading from python.org..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonInstaller -UseBasicParsing
        Write-Host "  → Running installer..." -ForegroundColor Cyan
        Start-Process $pythonInstaller -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
        Write-Host "  ✓ Python installed successfully!" -ForegroundColor Green
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } catch {
        Write-Host "  ✗ Failed to install Python automatically" -ForegroundColor Red
        Write-Host "  → Please download manually from: https://www.python.org/" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check Webots
Write-Host "[4/5] Checking Webots..." -ForegroundColor Yellow
$webotsPaths = @(
    "C:\Program Files\Webots\msys64\mingw64\bin\webots.exe",
    "C:\Webot\Webots\msys64\mingw64\bin\webots.exe",
    "C:\Webots\msys64\mingw64\bin\webots.exe"
)

$webotsFound = $false
foreach ($path in $webotsPaths) {
    if (Test-Path $path) {
        Write-Host "  ✓ Webots found at: $path" -ForegroundColor Green
        $webotsFound = $true
        break
    }
}

if (-not $webotsFound) {
    Write-Host "  ✗ Webots is NOT installed!" -ForegroundColor Red
    Write-Host "  → Please download Webots R2023b or later from:" -ForegroundColor Yellow
    Write-Host "     https://cyberbotics.com/#download" -ForegroundColor Cyan
    Write-Host "  → Webots is required for robot simulation" -ForegroundColor Yellow
}

Write-Host ""

# Install Backend Dependencies
Write-Host "[5/5] Installing Backend Dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\package.json") {
    Set-Location backend
    Write-Host "  → Running npm install in backend..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Backend dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Backend npm install failed!" -ForegroundColor Red
    }
    Set-Location ..
} else {
    Write-Host "  ✗ backend/package.json not found!" -ForegroundColor Red
}

Write-Host ""

# Install Frontend Dependencies
Write-Host "[5/5] Installing Frontend Dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\package.json") {
    Set-Location frontend
    Write-Host "  → Running npm install in frontend..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Frontend dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Frontend npm install failed!" -ForegroundColor Red
    }
    Set-Location ..
} else {
    Write-Host "  ✗ frontend/package.json not found!" -ForegroundColor Red
}

Write-Host ""

# Install Python Dependencies
Write-Host "[5/5] Installing Python Dependencies..." -ForegroundColor Yellow
if (Test-Command "pip") {
    Write-Host "  → Installing websocket-client..." -ForegroundColor Cyan
    pip install websocket-client==1.9.0 --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Python dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Python pip install failed!" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ pip not found (should come with Python)!" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start Backend:  cd backend && npm start" -ForegroundColor White
Write-Host "  2. Start Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  3. Launch Webots:  Open robot_world_humanoid.wbt" -ForegroundColor White
Write-Host ""
Write-Host "Or use the quick start script:" -ForegroundColor Yellow
Write-Host "  .\start-system.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
