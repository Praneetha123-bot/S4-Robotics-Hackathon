# 🤖 S4 Remote Robot Management System

## Fitfest25 Hackathon - Production-Ready Solution

### Project Overview

A complete **S4 Remote Robot Management System** featuring:

- 🎮 **Webots Virtual Robot Simulation** (Python Supervisor Controller)
- ☁️ **Cloud Backend** (Node.js + Express + WebSocket)
- 🌐 **Cloud Frontend** (React 18 + Vite + Tailwind CSS)
- 🔄 **Real-time Bi-directional Communication** (WebSocket RFC 6455)

This production-ready solution demonstrates a fully integrated remote robot management system with real-time telemetry streaming, tele-operation controls, path visualization, and autonomous monitoring.

---

## 🎯 System Capabilities

### ✅ Core Features
- ✨ **Real-time Telemetry**: Position (x, y, θ), speed, battery, health status
- 🎮 **Tele-operation**: Forward/Backward/Left/Right/Stop with keyboard & buttons
- 📍 **Path Visualization**: Auto-scaling 2D canvas with direction indicators
- 📜 **Live Logging**: Timestamped event stream with auto-scroll
- 🔌 **Auto-reconnection**: Resilient WebSocket with automatic retry
- 📊 **System Monitoring**: Connection status, performance metrics
- 🔋 **Battery Simulation**: Realistic power consumption modeling

### 🚀 Advanced Capabilities
- **Robot-Relative Movement**: Moves in facing direction, not world axes
- **90° Turn Navigation**: LEFT/RIGHT execute instant 90° turns + forward movement
- **Command Debouncing**: Prevents continuous rotation when holding buttons
- **Responsive UI**: Mobile-friendly grid layout (3-column desktop, stacked mobile)
- **WebSocket Broadcasting**: Supports multiple simultaneous clients

---

## 📁 Project Structure

```
Robotics-Hackathon - Fitfest25/
│
├── README.md (👈 You are here)
│
├── docs/                                    # 📚 Documentation
│   ├── requirements/
│   │   ├── system-requirements.md          # Hardware/Software specs
│   │   ├── setup-guide.md                  # Installation instructions
│   │   └── test-procedure.md               # Testing checklist
│   └── design/
│       ├── architecture.md                 # System diagrams (Mermaid)
│       ├── function-flow.md                # Flow diagrams & sequences
│       └── message-protocol.md             # WebSocket message formats
│
├── webots_project/                         # 🤖 Webots Simulation
│   ├── worlds/
│   │   ├── robot_world_humanoid.wbt        # Main world (ACTIVE)
│   │   └── robot_world_clean.wbt           # Simplified world
│   ├── controllers/
│   │   └── robot_controller/
│   │       └── robot_controller.py         # Python Supervisor controller
│   └── README.md
│
├── backend/                                # ☁️ Node.js Backend
│   ├── server.js                           # Express + WebSocket server
│   ├── ws-router.js                        # Message routing logic
│   ├── utils/
│   │   └── kinematics.js                   # Movement calculations
│   ├── package.json
│   └── README.md
│
└── frontend/                               # 🌐 React Frontend
    ├── src/
    │   ├── App.jsx                         # Main application
    │   ├── main.jsx                        # React entry point
    │   ├── components/
    │   │   ├── TelemetryPanel.jsx          # Live telemetry display
    │   │   ├── Controls.jsx                # Tele-operation controls
    │   │   ├── PathView.jsx                # 2D path visualization
    │   │   ├── Logs.jsx                    # Event logging panel
    │   │   ├── ConnectionStatus.jsx        # WebSocket status
    │   │   └── UpdatesPanel.jsx            # Firmware/config updates
    │   └── utils/
    │       └── websocket.js                # WebSocket client wrapper
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Webots R2023b+** (Download from https://cyberbotics.com)
- **Python 3.10+**
- **Node.js 18+**
- **npm or yarn**

### Installation Steps

#### 1. Install Webots
Download and install Webots from the official website:
```
https://cyberbotics.com/#download
```

#### 2. Setup Backend

```powershell
cd backend
npm install
```

#### 3. Setup Frontend

```powershell
cd frontend
npm install
```

---

## 🎮 Running the System

### Step 1: Start the Backend Server

```powershell
cd backend
npm start
```

The backend will start on `http://localhost:3000` with WebSocket server on port 3000.

**Expected Output:**
```
🚀 WebSocket Server running on ws://localhost:3000
📡 HTTP Server running on http://localhost:3000
```

### Step 2: Start the Frontend Dashboard

Open a new terminal:

```powershell
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy).

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to `http://localhost:5173`

### Step 3: Launch Webots Simulation

**Using Webots GUI:**
1. Open **Webots** application
2. Navigate to: **File → Open World**
3. Browse to: `webots_project/worlds/robot_world_humanoid.wbt`
4. Click **Play** button (▶️) to start simulation

**Using Command Line (Windows):**
```powershell
Start-Process "C:\Webot\Webots\msys64\mingw64\bin\webots.exe" -ArgumentList "C:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25\webots_project\worlds\robot_world_humanoid.wbt"
```

The robot controller will automatically:
- Connect to backend at `ws://localhost:3000`
- Initialize Supervisor controller
- Start sending telemetry every 200-300ms
- Listen for tele-operation commands

**Expected Console Output:**
```
INFO: 'robot_controller' controller started
✅ Connected to backend: ws://localhost:3000
🤖 Robot controller initialized
📡 Sending telemetry...
```

---

## 🎮 Using the Dashboard

### 1. **Connection Status** (Top Center)
- 🟢 **Connected**: All systems operational
- 🟡 **Connecting**: Attempting to establish connection
- 🔴 **Disconnected**: No connection to backend

