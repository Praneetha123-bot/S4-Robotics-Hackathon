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

# Refresh PATH to detect newly installed software
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

if (Test-Command "node") {
    $nodeVersion = Get-Version "node" "-v"
    Write-Host "  [OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  [X] Node.js is NOT installed!" -ForegroundColor Red
    Write-Host "  --> Attempting to install Node.js via winget..." -ForegroundColor Yellow
    
    if (Test-Command "winget") {
        try {
            winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
            
            # Refresh PATH after installation
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            if (Test-Command "node") {
                $nodeVersion = Get-Version "node" "-v"
                Write-Host "  [OK] Node.js installed successfully: $nodeVersion" -ForegroundColor Green
            } else {
                Write-Host "  [!] Node.js installed but not in PATH. Please restart PowerShell." -ForegroundColor Yellow
                Write-Host "  --> After restart, run this setup script again." -ForegroundColor Cyan
                Write-Host ""
                Write-Host "  Press any key to exit..." -ForegroundColor Yellow
                $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
                exit 1
            }
        } catch {
            Write-Host "  [X] Automatic installation failed!" -ForegroundColor Red
            Write-Host ""
            Write-Host "  PLEASE INSTALL NODE.JS MANUALLY:" -ForegroundColor Yellow
            Write-Host "  1. Download from: https://nodejs.org/en/download" -ForegroundColor Cyan
            Write-Host "  2. Choose 'Windows Installer (.msi)' for 64-bit" -ForegroundColor Cyan
            Write-Host "  3. Run the installer with default settings" -ForegroundColor Cyan
            Write-Host "  4. Restart PowerShell after installation" -ForegroundColor Cyan
            Write-Host "  5. Run this setup script again" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  Press any key to exit..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
            exit 1
        }
    } else {
        Write-Host "  [X] winget not found. Cannot auto-install." -ForegroundColor Red
        Write-Host ""
        Write-Host "  PLEASE INSTALL NODE.JS MANUALLY:" -ForegroundColor Yellow
        Write-Host "  1. Download from: https://nodejs.org/en/download" -ForegroundColor Cyan
        Write-Host "  2. Choose 'Windows Installer (.msi)' for 64-bit" -ForegroundColor Cyan
        Write-Host "  3. Run the installer with default settings" -ForegroundColor Cyan
        Write-Host "  4. Restart PowerShell after installation" -ForegroundColor Cyan
        Write-Host "  5. Run this setup script again" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Press any key to exit..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit 1
    }
}

Write-Host ""

# Check npm
Write-Host "[2/5] Checking npm..." -ForegroundColor Yellow
if (Test-Command "npm") {
    $npmVersion = Get-Version "npm" "-v"
    Write-Host "  [OK] npm is installed: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "  [X] npm is NOT installed (should come with Node.js)!" -ForegroundColor Red
    Write-Host "  --> npm is included with Node.js. Please install Node.js first." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check Python
Write-Host "[3/5] Checking Python..." -ForegroundColor Yellow
if (Test-Command "python") {
    $pythonVersion = Get-Version "python" "--version"
    Write-Host "  [OK] Python is installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  [X] Python is NOT installed!" -ForegroundColor Red
    Write-Host "  --> Installing Python 3.11..." -ForegroundColor Yellow
    
    # Download and install Python
    $pythonInstaller = "$env:TEMP\python-installer.exe"
    $pythonUrl = "https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe"
    
    try {
        Write-Host "  --> Downloading from python.org..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonInstaller -UseBasicParsing
        Write-Host "  --> Running installer..." -ForegroundColor Cyan
        Start-Process $pythonInstaller -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
        Write-Host "  [OK] Python installed successfully!" -ForegroundColor Green
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } catch {
        Write-Host "  [X] Failed to install Python automatically" -ForegroundColor Red
        Write-Host "  --> Please download manually from: https://www.python.org/" -ForegroundColor Yellow
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
        Write-Host "  [OK] Webots found at: $path" -ForegroundColor Green
        $webotsFound = $true
        break
    }
}

if (-not $webotsFound) {
    Write-Host "  [X] Webots is NOT installed!" -ForegroundColor Red
    Write-Host "  --> Please download Webots R2023b or later from:" -ForegroundColor Yellow
    Write-Host "     https://cyberbotics.com/#download" -ForegroundColor Cyan
    Write-Host "  --> Webots is required for robot simulation" -ForegroundColor Yellow
}

Write-Host ""

# Install Backend Dependencies
Write-Host "[5/5] Installing Backend Dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\package.json") {
    Set-Location backend
    Write-Host "  --> Running npm install in backend..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Backend dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  [X] Backend npm install failed!" -ForegroundColor Red
    }
    Set-Location ..
} else {
    Write-Host "  [X] backend/package.json not found!" -ForegroundColor Red
}

Write-Host ""

# Install Frontend Dependencies
Write-Host "[5/5] Installing Frontend Dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\package.json") {
    Set-Location frontend
    Write-Host "  --> Running npm install in frontend..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Frontend dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  [X] Frontend npm install failed!" -ForegroundColor Red
    }
    Set-Location ..
} else {
    Write-Host "  [X] frontend/package.json not found!" -ForegroundColor Red
}

Write-Host ""

# Install Python Dependencies
Write-Host "[5/5] Installing Python Dependencies..." -ForegroundColor Yellow
if (Test-Command "pip") {
    Write-Host "  --> Installing websocket-client..." -ForegroundColor Cyan
    pip install websocket-client==1.9.0 --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Python dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  [X] Python pip install failed!" -ForegroundColor Red
    }
} else {
    Write-Host "  [X] pip not found (should come with Python)!" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start Backend:  cd backend; npm start" -ForegroundColor White
Write-Host "  2. Start Frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host "  3. Launch Webots:  Open robot_world_humanoid.wbt" -ForegroundColor White
Write-Host ""
Write-Host "Or use the quick start script:" -ForegroundColor Yellow
Write-Host "  .\start-system.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
