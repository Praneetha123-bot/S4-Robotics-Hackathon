# Complete Setup Guide - S4 System

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Webots R2023b or later** installed
  - Download: https://cyberbotics.com/#download
  - ~500 MB download, ~2 GB installed
  - Supports: Windows 10/11, macOS 10.15+, Ubuntu 20.04+

- [ ] **Python 3.10 or later**
  - Check: `python --version`
  - Download: https://www.python.org/downloads/

- [ ] **Node.js 18 or later**
  - Check: `node --version`
  - Download: https://nodejs.org/

- [ ] **npm 9 or later**
  - Check: `npm --version`
  - Comes with Node.js

- [ ] **Git** (optional, for cloning)
  - Check: `git --version`

---

## 🚀 Step-by-Step Setup

### Step 1: Install Python Dependencies

Open PowerShell and navigate to the project:

```powershell
cd "c:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25"
```

Install Python WebSocket client:

```powershell
pip install websocket-client
```

**Expected output:**
```
Successfully installed websocket-client-1.x.x
```

**Verify installation:**
```powershell
python -c "import websocket; print('✓ websocket-client installed')"
```

---

### Step 2: Install Backend Dependencies

Navigate to backend folder:

```powershell
cd backend
```

Install Node.js packages:

```powershell
npm install
```

**Expected output:**
```
added 50 packages, and audited 51 packages in 3s
```

**Verify installation:**
```powershell
npm list
```

Should show:
- ws@8.14.2
- express@4.18.2

---

### Step 3: Install Frontend Dependencies

Navigate to frontend folder:

```powershell
cd ..\frontend
```

Install React and dependencies:

```powershell
npm install
```

**Expected output:**
```
added 200+ packages, and audited 300+ packages in 10s
```

This installs:
- React 18.2
- Vite 5.0
- Tailwind CSS 3.3
- All dev dependencies

**Verify installation:**
```powershell
npm list react
```

---

## ▶️ Running the System

### Order Matters!

Always start components in this order:
1. Backend server (must be first)
2. Frontend dashboard
3. Webots simulation

---

### Step 1: Start Backend Server

Open **Terminal 1** (PowerShell):

```powershell
cd "c:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25\backend"
npm start
```

**Success indicators:**
```
🚀 S4 BACKEND SERVER STARTED
📡 WebSocket Server: ws://localhost:3000
🌐 HTTP Server: http://localhost:3000
✅ Ready to accept connections...
```

**Keep this terminal open!**

---

### Step 2: Start Frontend Dashboard

Open **Terminal 2** (PowerShell):

```powershell
cd "c:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25\frontend"
npm run dev
```

**Success indicators:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

**Open browser to `http://localhost:5173`**

You should see:
- Dashboard loads
- Connection status shows "Connecting..." then "Disconnected" (waiting for robot)

**Keep this terminal open!**

---

### Step 3: Launch Webots Simulation

1. **Open Webots application**

2. **Load the world:**
   - File → Open World
   - Navigate to: `c:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25\webots_project\worlds\robot_world.wbt`
   - Click "Open"

3. **Start simulation:**
   - Click Play button (▶️) in toolbar
   - Or press `Ctrl+2`

**Success indicators in Webots console:**
```
🤖 S4 WEBOTS ROBOT CONTROLLER
⏱️  Timestep: 64 ms
✅ Motors initialized
✅ Sensors initialized (GPS, Compass)
🔄 Connecting to ws://localhost:3000...
✅ Connected to backend at ws://localhost:3000
🚀 Starting main control loop...
📊 Cycle 0 | Pos: (0.00, 0.00) | θ: 0.000 | Speed: 0.00 m/s | Battery: 100.0% | Cmd: stop
```

**Success indicators in backend terminal (Terminal 1):**
```
✅ Client connected: client_1 from ::1
📊 Total connections: 1
🤖 Client client_1 identified as ROBOT
```

**Success indicators in frontend dashboard:**
- Connection status turns GREEN
- Telemetry panel shows live data
- Path visualization shows robot position
- Logs show "Connected" message

---

## ✅ Verification Checklist

### Backend Verification

In Terminal 1, you should see:
- [x] Server started on port 3000
- [x] Robot connected (client identified as ROBOT)
- [x] Frontend connected (client identified as FRONTEND)
- [x] Telemetry messages flowing every ~200ms

### Frontend Verification

In browser at `http://localhost:5173`:
- [x] Connection status is GREEN
- [x] Telemetry panel shows position, speed, battery
- [x] Path visualization shows robot at (0, 0)
- [x] Control buttons are enabled
- [x] Logs show connection messages

### Webots Verification

In Webots:
- [x] Simulation is running (timer advancing)
- [x] Robot is visible in 3D view
- [x] Console shows telemetry cycles
- [x] No error messages in console

---

## 🎮 Testing the System

### Test 1: Send a Command

1. In frontend dashboard, click **"Forward"** button
2. Observe:
   - Frontend log: "📤 Sent command: forward"
   - Backend Terminal 1: "📤 Command from client_X: forward"
   - Webots console: "📥 Received command: forward"
   - Robot moves forward in 3D view
   - Telemetry updates with new position

### Test 2: Keyboard Controls

1. Make sure keyboard controls are ON (⌨️ button)
2. Press `W` key
3. Robot should move forward
4. Press `S` key
5. Robot should move backward
6. Press `SPACE` key
7. Robot should stop

### Test 3: Path Visualization

1. Send multiple commands to move robot
2. Watch path visualization update in real-time
3. Path should show blue trail
4. Current position shows as blue dot with yellow arrow

### Test 4: Battery Drain

1. Move robot continuously
2. Watch battery percentage decrease in telemetry panel
3. Battery bar should show color change (green → yellow → red)

---

## 🔄 Stopping the System

### Graceful Shutdown

**Step 1: Stop Webots**
- Click Stop button (⏸️) in Webots
- Or close Webots application

**Step 2: Stop Frontend**
- Go to Terminal 2
- Press `Ctrl+C`
- Confirm if prompted

**Step 3: Stop Backend**
- Go to Terminal 1
- Press `Ctrl+C`
- Backend will close all connections gracefully

**Expected backend shutdown output:**
```
🛑 Shutting down server...
✅ Server closed gracefully
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "websocket-client not found"

**Error in Webots console:**
```
ModuleNotFoundError: No module named 'websocket'
```

**Solution:**
```powershell
pip install websocket-client
```

If using multiple Python versions:
```powershell
python -m pip install websocket-client
```

---

### Issue 2: "Port 3000 already in use"

**Error in backend:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution 1: Kill the process**
```powershell
# Find PID
netstat -ano | findstr :3000

# Kill process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

**Solution 2: Change port**

Edit `backend/server.js`:
```javascript
const PORT = 3001; // Changed from 3000
```

Also update `webots_project/controllers/robot_controller/controller.py`:
```python
BACKEND_URL = "ws://localhost:3001"
```

And `frontend/src/utils/websocket.js`:
```javascript
const WS_URL = 'ws://localhost:3001';
```

---

### Issue 3: Frontend shows "Disconnected"

**Symptoms:**
- Dashboard loads but shows red "Disconnected"
- No telemetry data

**Solutions:**

1. **Check backend is running**
   ```powershell
   curl http://localhost:3000/status
   ```
   Should return JSON with status.

2. **Check browser console (F12)**
   Look for WebSocket errors.

3. **Verify URL**
   In `frontend/src/utils/websocket.js`, ensure:
   ```javascript
   const WS_URL = 'ws://localhost:3000';
   ```

4. **Clear browser cache**
   - Press `Ctrl+Shift+Delete`
   - Clear cache and reload

---

### Issue 4: Robot not moving in Webots

**Symptoms:**
- Commands sent from frontend
- Backend forwards commands
- But robot doesn't move

**Solutions:**

1. **Check simulation is running**
   - Click Play button (▶️)
   - Verify timer is advancing

2. **Check controller is active**
   - In Webots, right-click robot
   - Edit → View Robot Window
   - Should show controller is running

3. **Check motors initialized**
   - Look in Webots console for:
   ```
   ✅ Motors initialized
   ```

4. **Restart controller**
   - In Webots: Simulation → Revert
   - Click Play again

---

### Issue 5: Webots can't open world file

**Error:**
```
Cannot open world file
```

**Solutions:**

1. **Check file path**
   Ensure path is correct:
   ```
   c:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25\webots_project\worlds\robot_world.wbt
   ```

2. **Check file exists**
   ```powershell
   Test-Path "c:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25\webots_project\worlds\robot_world.wbt"
   ```
   Should return `True`

3. **Use File → Open World in Webots**
   Don't double-click the .wbt file, open through Webots menu.

---

### Issue 6: High CPU usage

**Symptoms:**
- Computer fan loud
- System slow

**Solutions:**

1. **Limit Webots rendering**
   - In Webots: Tools → Preferences
   - Rendering → Disable shadows
   - Set lower graphics quality

2. **Reduce frontend update rate**
   Edit `webots_project/controllers/robot_controller/controller.py`:
   ```python
   TELEMETRY_INTERVAL = 0.5  # Changed from 0.2
   ```

---

## 🎯 Next Steps

Once system is running:

### Experiment with Commands

Try different command sequences:
```
forward → left → forward → right → stop
```

### Monitor Telemetry

Watch how values change:
- Position increases/decreases
- Speed fluctuates
- Battery drains
- Cycle counter increments

### Modify Parameters

**Change robot speed:**

Edit `controller.py`:
```python
motor_speeds = {
    'forward': (4.0, 4.0),  # Faster
    'backward': (-4.0, -4.0),
    'left': (-2.0, 2.0),
    'right': (2.0, -2.0),
    'stop': (0.0, 0.0)
}
```

**Change telemetry rate:**

Edit `controller.py`:
```python
TELEMETRY_INTERVAL = 0.1  # Send every 100ms (faster)
```

**Change battery drain:**

Edit `controller.py`:
```python
BATTERY_DRAIN_RATE = 0.02  # Drain faster
```

---

## 📊 System Health Checks

### Backend Health

```powershell
curl http://localhost:3000/health
```

Expected:
```json
{"healthy": true}
```

### Backend Status

```powershell
curl http://localhost:3000/status
```

Expected:
```json
{
  "status": "ok",
  "connections": 2,
  "uptime": 123.45,
  "telemetryCount": 1234,
  "lastTelemetry": {...}
}
```

### Test WebSocket Connection

Using PowerShell:
```powershell
# Install wscat if not already
npm install -g wscat

# Connect to backend
wscat -c ws://localhost:3000

# Send test command
{"type":"cmd","cmd":"forward"}
```

---

## 🔍 Debug Mode

### Enable Verbose Logging

**Backend:**

Edit `server.js`, add after line 1:
```javascript
process.env.DEBUG = 'true';
```

**Frontend:**

Open browser console (F12), you'll see:
- All WebSocket messages
- State updates
- Command sends

**Webots:**

Controller already has verbose logging.
To see more detail, edit `controller.py`:
```python
# Remove the modulo check
print(f"📊 Cycle {cycle_counter:4d} | ...")  # Prints every cycle
```

---

## 📝 Logs Location

### Backend Logs
- Displayed in Terminal 1
- To save to file:
  ```powershell
  npm start > backend.log 2>&1
  ```

### Frontend Logs
- Browser console (F12 → Console)
- In-app logs panel

### Webots Logs
- Webots console window
- To save: Tools → Console → Export

---

## 🎓 Understanding the Flow

### Normal Operation Flow

```
1. Backend starts → Opens port 3000
2. Frontend starts → Connects to backend
3. Webots starts → Controller connects to backend
4. Backend identifies clients (robot vs frontend)
5. Robot sends telemetry → Backend forwards to frontend
6. Frontend displays telemetry
7. User clicks command → Frontend sends to backend
8. Backend forwards to robot
9. Robot applies command → Sends updated telemetry
10. Loop continues...
```

### Message Flow Diagram

```
Frontend                Backend                 Webots
   |                       |                       |
   |-- ws connect -------->|                       |
   |<----- connected ------|                       |
   |                       |<-- ws connect --------|
   |                       |---- connected ------->|
   |                       |                       |
   |                       |<-- telemetry ---------|
   |<--- telemetry --------|                       |
   |                       |                       |
   |--- command ---------->|                       |
   |                       |---- command --------->|
   |                       |<-- telemetry ---------|
   |<--- telemetry --------|                       |
```

---

## ✨ Tips for Demo

### Before Demo

1. Start all components 5 minutes early
2. Verify all connections are green
3. Test all 5 control buttons
4. Reset robot position if needed (Simulation → Revert)
5. Clear logs for clean slate

### During Demo

1. Show connection status
2. Explain telemetry panel
3. Move robot with keyboard controls
4. Show path visualization building
5. Point out battery draining
6. Show logs updating in real-time

### Demo Script

```
"This is the S4 Remote Robot Management System.

On the left, we have live telemetry - position, speed, and battery.

In the center, you can see the robot's path being drawn in real-time.

On the right, live system logs.

Now let me control the robot... [press W]

You can see it moving forward, the path is updating,
battery is draining, and everything is logged.

[Press other keys]

All communication happens over WebSocket, 
with full bi-directional control."
```

---

**You're all set! 🚀**
