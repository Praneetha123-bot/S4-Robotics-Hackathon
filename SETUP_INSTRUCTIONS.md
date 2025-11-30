# S4 Remote Robot Management System - Setup & Start Scripts

## 🚀 Quick Start Guide

### Option 1: Automatic Setup + Start (Recommended for First Time)

Run this command in PowerShell (as Administrator):

```powershell
.\setup.ps1
```

This script will:
- ✅ Check if Node.js is installed (auto-install if missing)
- ✅ Check if Python is installed (auto-install if missing)
- ✅ Check if npm is available
- ✅ Verify Webots installation
- ✅ Install all backend dependencies (`npm install`)
- ✅ Install all frontend dependencies (`npm install`)
- ✅ Install Python dependencies (`websocket-client`)

### Option 2: Quick Start (After Setup)

Run this command in PowerShell:

```powershell
.\start-system.ps1
```

This script will:
- 🚀 Start Backend Server (port 3000)
- 🌐 Start Frontend Dashboard (port 5173)
- 🤖 Launch Webots Simulation
- 🌍 Open browser to http://localhost:5173

---

## 📋 Manual Setup (Alternative)

If automatic setup fails, follow these steps:

### 1. Install Node.js
Download and install from: https://nodejs.org/
- Recommended: v18.0 or later

### 2. Install Python
Download and install from: https://www.python.org/
- Recommended: v3.9 or later
- ⚠️ Check "Add Python to PATH" during installation

### 3. Install Webots
Download and install from: https://cyberbotics.com/#download
- Recommended: R2023b or later (R2025a preferred)

### 4. Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

**Python:**
```powershell
pip install websocket-client==1.9.0
```

### 5. Start Services Manually

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

**Terminal 3 - Webots:**
- Open Webots application
- File → Open World
- Select: `webots_project/worlds/robot_world_humanoid.wbt`

**Browser:**
- Navigate to: http://localhost:5173

---

## 🛠️ Troubleshooting

### Node.js/npm not found after installation
```powershell
# Restart PowerShell or refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### Python not found after installation
- Restart your computer
- Or manually add Python to PATH:
  - Control Panel → System → Advanced → Environment Variables
  - Add: `C:\Users\<YourUser>\AppData\Local\Programs\Python\Python311`

### Port already in use
```powershell
# Stop existing processes
Stop-Process -Name node -Force
Stop-Process -Name webots-bin -Force
```

### npm install fails
```powershell
# Clear npm cache and retry
npm cache clean --force
npm install
```

---

## 📁 Script Files

- **`setup.ps1`** - Automatic dependency installer
- **`start-system.ps1`** - One-click system launcher

Both scripts must be run from the project root directory!

---

## ✅ Verification

After running `setup.ps1`, verify installations:

```powershell
node --version    # Should show v18.x or higher
npm --version     # Should show v9.x or higher
python --version  # Should show Python 3.9.x or higher
pip --version     # Should show pip version
```

---

## 🎯 System Requirements

- **OS:** Windows 10/11
- **RAM:** 8 GB minimum
- **Storage:** 5 GB free space
- **CPU:** Intel i5 or equivalent
- **Internet:** Required for initial setup only
