# 🧪 S4 Robot Management System - Complete Test Procedure

## Fitfest25 Hackathon - Testing Guide

---

## 📋 Table of Contents

1. [Pre-Test Checklist](#pre-test-checklist)
2. [System Startup Procedure](#system-startup-procedure)
3. [Connection Testing](#connection-testing)
4. [Control System Testing](#control-system-testing)
5. [Telemetry Testing](#telemetry-testing)
6. [Updates & Permissions Testing](#updates--permissions-testing)
7. [Performance Testing](#performance-testing)
8. [Troubleshooting Tests](#troubleshooting-tests)
9. [Shutdown Procedure](#shutdown-procedure)

---

## ✅ Pre-Test Checklist

### Required Software Installed:
- [ ] **Webots** R2023b or later (Installed at: `C:\Webot\Webots\`)
- [ ] **Python** 3.9+ with `websocket-client` library
- [ ] **Node.js** 18.0+ installed
- [ ] **Chrome/Edge Browser** (latest version)

### Verify Installations:
```powershell
# Check Python version
python --version

# Check Node.js version
node --version

# Check npm version
npm --version

# Verify websocket-client installed
pip show websocket-client
```

**Expected Results:**
- Python 3.9.0 or higher
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- websocket-client 1.9.0 installed

---

## 🚀 System Startup Procedure

### Step 1: Start Backend Server

**Terminal 1:**
```powershell
# Navigate to backend directory
cd "C:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25\backend"

# Start the server
npm start
```

**Expected Output:**
```
============================================================
🚀 S4 BACKEND SERVER STARTED
============================================================
📡 WebSocket Server: ws://localhost:3000
🌐 HTTP Server: http://localhost:3000
⏰ Started at: [Current Date/Time]
============================================================

✅ Ready to accept connections...
```

**✅ TEST PASSED IF:**
- Server starts without errors
- Port 3000 is available
- You see "Ready to accept connections..."

**❌ TEST FAILED IF:**
- Port 3000 already in use
- npm modules not installed
- Any error messages appear

**Fix:** Run `npm install` in backend folder if modules missing

---

### Step 2: Start Frontend Dashboard

**Terminal 2:**
```powershell
# Navigate to frontend directory
cd "C:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25\frontend"

# Start the development server
npm run dev
```

**Expected Output:**
```
VITE v5.4.21  ready in 378 ms

➜  Local:   http://localhost:5173/
➜  Network: http://[IP]:5173/
➜  press h + enter to show help
```

**✅ TEST PASSED IF:**
- Vite server starts successfully
- Available on localhost:5173
- No compilation errors

**❌ TEST FAILED IF:**
- Port 5173 in use (will use 5174, 5175, etc.)
- Dependencies not installed
- Build errors

**Fix:** Run `npm install` in frontend folder if modules missing

---

### Step 3: Open Dashboard in Browser

1. **Open browser** (Chrome/Edge recommended)
2. **Navigate to:** `http://localhost:5173` (or the port shown in Terminal 2)
3. **Observe the dashboard interface**

**Expected UI Elements:**
- ✅ **Header** with "S4 Robot Dashboard" title
- ✅ **Connection Status** showing "Disconnected" (yellow/gray)
- ✅ **Telemetry Panel** showing "Waiting for robot data..."
- ✅ **Control Panel** with 5 buttons (Forward, Backward, Left, Right, Stop)
- ✅ **Path Visualization** with empty grid
- ✅ **System Updates Panel** with version info
- ✅ **Logs Panel** showing connection attempt

**✅ TEST PASSED IF:** All UI elements visible and properly styled

---

### Step 4: Start Webots Simulation

1. **Open Webots application:**
   ```powershell
   # Launch Webots with world file
   & "C:\Webot\Webots\msys64\mingw64\bin\webots.exe" "C:\Users\EXH2KOR\Desktop\Robotics-Hackathon - Fitfest25\webots_project\worlds\robot_world.wbt"
   ```

2. **Wait for Webots to load** (10-30 seconds)

**Expected Webots Window:**
- ✅ 3D simulation environment visible
- ✅ Gray floor (10m × 10m)
- ✅ Blue robot in center
- ✅ Directional lighting
- ✅ Sky background

**✅ TEST PASSED IF:** Webots loads without errors

---

### Step 5: Start Robot Controller

1. **In Webots:** Click the **Play button (▶️)** in the toolbar

**Expected Console Output in Webots:**
```
============================================================
🤖 S4 WEBOTS ROBOT CONTROLLER
============================================================
⏱️  Timestep: 64 ms
✅ Motors initialized
✅ Sensors initialized (GPS, Compass)
🔄 Connecting to ws://localhost:3000...
✅ Connected to backend at ws://localhost:3000
🚀 Starting main control loop...
------------------------------------------------------------
📊 Cycle    0 | Pos: ( -0.00,   0.00) | θ:  0.000 | Speed: 0.00 m/s | Battery: 100.0% | Cmd: stop
```

**Expected Backend Terminal Output:**
```
✅ Client connected: client_3 from ::1
📊 Total connections: 1
🤖 Client client_3 identified as ROBOT
```

**Expected Dashboard Changes:**
- Connection Status changes to **"Connected"** (green)
- Telemetry Panel shows live data
- Position displays (0.00, 0.00)
- Battery shows 100.0%
- Robot count in header shows "1"

**✅ TEST PASSED IF:**
- All three components connected
- No error messages
- Telemetry updating every 200-300ms

---

## 🔌 Connection Testing

### Test 1: Verify Three-Way Connection

**Check Backend Terminal:**
```
Should show:
- ✅ Client identified as ROBOT
- ✅ Client identified as FRONTEND (if dashboard opened)
- 📊 Total connections: 2
```

**Check Dashboard:**
- Header shows "Connected" in green
- Robot count shows "1"

**Check Webots Console:**
- "✅ Connected to backend at ws://localhost:3000"

**✅ TEST PASSED IF:** All three components report connection

---

### Test 2: Heartbeat Mechanism

1. **Wait 30 seconds** without interaction
2. **Check Backend Terminal** for heartbeat messages

**Expected:** Connections remain stable, no disconnections

**✅ TEST PASSED IF:** No disconnection after 30+ seconds

---

### Test 3: Reconnection Test

1. **Stop backend server** (Ctrl+C in Terminal 1)
2. **Observe Dashboard:** Should show "Disconnected"
3. **Restart backend:** `npm start`
4. **Wait 5-10 seconds**

**Expected:** Dashboard automatically reconnects with exponential backoff

**✅ TEST PASSED IF:** Dashboard reconnects without manual refresh

---

## 🎮 Control System Testing

### Test 4: Button Controls

**Test Each Button Individually:**

#### Forward Button Test:
1. Click **Forward** button in Control Panel
2. **Observe Webots:** Robot should move forward
3. **Check Dashboard:**
   - Position X/Y values changing
   - Speed shows ~0.07 m/s
   - Path trail appears (green line)
   - Logs show "📤 Sent command: forward"
4. **Check Webots Console:**
   ```
   📥 Received command: forward
   📊 Cycle [N] | Pos: (X, Y) | Speed: 0.07 m/s | Cmd: forward
   ```

**✅ TEST PASSED IF:**
- Robot moves forward in Webots
- Telemetry updates in real-time
- Position coordinates change
- Path visualization shows trail

---

#### Backward Button Test:
1. Click **Backward** button
2. **Observe:** Robot moves backward in Webots

**✅ TEST PASSED IF:** Robot moves backward, telemetry updates

---

#### Left Turn Test:
1. Click **Left** button
2. **Observe:** Robot rotates counter-clockwise
3. **Check:** Heading (θ) value changes

**✅ TEST PASSED IF:** Robot turns left, theta changes

---

#### Right Turn Test:
1. Click **Right** button
2. **Observe:** Robot rotates clockwise

**✅ TEST PASSED IF:** Robot turns right, theta changes

---

#### Stop Button Test:
1. Click **Stop** button (red)
2. **Observe:** Robot stops all movement
3. **Check:** Speed returns to 0.00 m/s

**✅ TEST PASSED IF:** Robot stops immediately

---

### Test 5: Keyboard Controls

**Enable Keyboard:** Ensure "⌨️ ON" button is active in Control Panel

#### Test W Key (Forward):
1. Press and hold **W** key
2. Release after 2 seconds

**✅ TEST PASSED IF:** Robot moves forward while key held

---

#### Test S Key (Backward):
1. Press **S** key
2. Release

**✅ TEST PASSED IF:** Robot moves backward

---

#### Test A Key (Left):
1. Press **A** key
2. Release

**✅ TEST PASSED IF:** Robot turns left

---

#### Test D Key (Right):
1. Press **D** key
2. Release

**✅ TEST PASSED IF:** Robot turns right

---

#### Test Space Bar (Stop):
1. Press **Forward** button to start movement
2. Press **Space bar**

**✅ TEST PASSED IF:** Robot stops immediately

---

#### Test Arrow Keys:
- Press **↑ (Up Arrow)** → Robot moves forward
- Press **↓ (Down Arrow)** → Robot moves backward
- Press **← (Left Arrow)** → Robot turns left
- Press **→ (Right Arrow)** → Robot turns right

**✅ TEST PASSED IF:** All arrow keys work same as WASD

---

### Test 6: Keyboard Toggle

1. Click **⌨️ ON** button to disable keyboard
2. Press **W** key
3. **Expected:** Nothing happens
4. Click **⌨️ OFF** button to re-enable
5. Press **W** key
6. **Expected:** Robot moves

**✅ TEST PASSED IF:** Keyboard can be toggled on/off

---

## 📊 Telemetry Testing

### Test 7: Position Tracking

1. **Record initial position** (e.g., 0.00, 0.00)
2. Move robot **forward for 5 seconds**
3. Click **Stop**
4. **Check:** Y coordinate should have changed (positive direction)

**✅ TEST PASSED IF:** Position updates accurately in real-time

---

### Test 8: Speed Measurement

1. Click **Forward**
2. **Check Telemetry Panel:**
   - Speed should show ~0.07 m/s within 1 second
3. Click **Stop**
4. **Check:** Speed returns to 0.00 m/s

**✅ TEST PASSED IF:** Speed values are accurate

---

### Test 9: Heading (Theta) Tracking

1. Click **Right** for 2 seconds
2. **Observe:** Theta value increases (0 → 1.5 → 3.14 → ...)
3. Click **Left** for 2 seconds
4. **Observe:** Theta value decreases

**✅ TEST PASSED IF:** Theta changes correspond to rotation

---

### Test 10: Battery Drain

1. **Note initial battery:** 100.0%
2. Move robot **continuously for 30 seconds**
3. **Check battery level**

**Expected:** Battery should decrease to ~99.7% (drains 0.008%/sec when moving)

**✅ TEST PASSED IF:** Battery drains gradually during movement

---

### Test 11: Cycle Counter

1. **Observe Cycle count** in Telemetry Panel
2. **Wait 10 seconds**
3. **Calculate:** Cycles should increase by ~156 (64ms timestep)

**Expected Formula:** Cycles = (Time in ms) / 64

**✅ TEST PASSED IF:** Cycle counter increments continuously

---

### Test 12: Health Status

**Test Different Battery Levels:**

- **100% - 80%:** Health shows "Excellent" (green)
- **80% - 50%:** Health shows "Good" (blue)
- **50% - 20%:** Health shows "Fair" (yellow)
- **< 20%:** Health shows "Critical" (red)

**Note:** To test low battery, modify `battery_level` in robot controller

**✅ TEST PASSED IF:** Health status color changes based on battery

---

## 🖼️ Path Visualization Testing

### Test 13: Path Drawing

1. **Clear existing path** (reload page if needed)
2. Move robot in a **square pattern:**
   - Forward 2 seconds
   - Right 1.5 seconds (90° turn)
   - Forward 2 seconds
   - Right 1.5 seconds
   - Forward 2 seconds
   - Right 1.5 seconds
   - Forward 2 seconds
3. **Observe Path View panel**

**Expected:** Green trail showing square path

**✅ TEST PASSED IF:** Path accurately represents robot movement

---

### Test 14: Auto-Scaling

1. Move robot **far from origin** (e.g., 5 meters forward)
2. **Check Path View:** Should auto-zoom to fit entire path

**✅ TEST PASSED IF:** Viewport adjusts to show full path

---

### Test 15: Current Position Marker

1. **Observe green robot marker** on path visualization
2. Move robot
3. **Check:** Marker position updates in real-time

**✅ TEST PASSED IF:** Green marker tracks robot position

---

## 🔄 Updates & Permissions Testing

### Test 16: Version Display

1. **Locate System Updates Panel**
2. **Check Current Versions section:**
   - Frontend: v1.0.0
   - Backend: v1.0.0
   - Robot: v1.0.0

**✅ TEST PASSED IF:** All versions display correctly

---

### Test 17: Permission Request

1. Click **"🔐 Request Control"** button
2. **Expected:** Modal popup appears with permission details
3. **Observe Modal Content:**
   - Security icon (🔐)
   - Title: "Control Permission Required"
   - List of permissions
   - GRANT and DENY buttons

**✅ TEST PASSED IF:** Modal displays properly

---

### Test 18: Grant Permission

1. In permission modal, click **"✓ Grant Access"**
2. **Expected:**
   - Modal closes
   - Permission badge changes to "GRANTED" (green)
   - Update History shows "✓ Control permission GRANTED"

**✅ TEST PASSED IF:** Permission granted successfully

---

### Test 19: Push Configuration

1. **Ensure permission is GRANTED**
2. Click **"⚙️ Push Config"** button
3. **Expected:**
   - Update History shows "📤 Configuration update sent to robot"
   - Backend console shows: `⚙️ Configuration update from client_X`

**✅ TEST PASSED IF:** Config message sent to robot

---

### Test 20: Check Updates

1. Click **"🔍 Check Updates"** button
2. **Expected:**
   - Update History shows "Checking for updates..."
   - After 1-2 seconds: "System is up to date"
   - Last checked timestamp updates

**✅ TEST PASSED IF:** Update check completes successfully

---

### Test 21: Revoke Permission

1. Click **"🚫 Revoke Access"** button
2. **Expected:**
   - Permission badge changes to "PROMPT" (yellow)
   - Update History shows "Control permission revoked"
3. Try clicking **"⚙️ Push Config"**
4. **Expected:** Button is disabled or shows error

**✅ TEST PASSED IF:** Permission can be revoked

---

### Test 22: Deny Permission

1. **Revoke permission first** (if granted)
2. Click **"🔐 Request Control"**
3. In modal, click **"✗ Deny"**
4. **Expected:**
   - Permission badge shows "DENIED" (red)
   - Update History shows "✗ Control permission DENIED"

**✅ TEST PASSED IF:** Permission can be denied

---

## 📝 Logs Panel Testing

### Test 23: Log Entries

1. **Perform various actions** (move robot, send commands)
2. **Check Logs Panel**

**Expected Log Types:**
- 📤 Command sent messages (blue)
- ✓ Command acknowledgments (green)
- 📊 Telemetry updates (gray)
- ❌ Errors (red)
- ⚠️ Warnings (yellow)

**✅ TEST PASSED IF:** All actions logged with timestamps

---

### Test 24: Log Scrolling

1. **Generate 50+ log entries** (move robot continuously)
2. **Scroll through logs**
3. **Check:** Oldest entries at top, newest at bottom

**✅ TEST PASSED IF:** Logs scrollable and ordered correctly

---

### Test 25: Log Retention

1. **Generate 250+ log entries**
2. **Check:** Only last 200 logs retained

**✅ TEST PASSED IF:** Log buffer limits to 200 entries

---

## ⚡ Performance Testing

### Test 26: Telemetry Rate

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Filter:** WS (WebSocket)
4. **Observe message rate**

**Expected:** Telemetry messages every 200-300ms (3-5 per second)

**✅ TEST PASSED IF:** Telemetry rate is consistent

---

### Test 27: Command Latency

1. Click **Forward** button
2. **Measure time** until robot starts moving in Webots

**Expected Latency:** < 200ms

**✅ TEST PASSED IF:** Response is immediate (< 200ms)

---

### Test 28: UI Responsiveness

1. Move robot **continuously for 1 minute**
2. **Check UI:**
   - No lag in telemetry updates
   - Control buttons remain responsive
   - Path visualization smooth
   - No browser freezing

**✅ TEST PASSED IF:** UI remains responsive throughout

---

### Test 29: Memory Usage

1. **Open Task Manager** (Ctrl+Shift+Esc)
2. **Find browser process**
3. **Note initial memory**
4. Run system **for 5 minutes**
5. **Check memory again**

**Expected:** Memory increase < 100MB

**✅ TEST PASSED IF:** No significant memory leak

---

### Test 30: Multiple Control Commands

1. **Rapidly press** different control buttons
2. **Expected:**
   - Robot responds to each command
   - No commands lost
   - System remains stable

**✅ TEST PASSED IF:** All commands processed correctly

---

## 🔧 Troubleshooting Tests

### Test 31: Backend Restart

1. **Stop backend** (Ctrl+C)
2. **Keep Webots and Dashboard running**
3. **Restart backend:** `npm start`
4. **Wait 10 seconds**

**Expected:** Both robot and dashboard reconnect automatically

**✅ TEST PASSED IF:** Auto-reconnection works

---

### Test 32: Frontend Reload

1. **In browser, press F5** (reload page)
2. **Expected:**
   - Dashboard reconnects to backend
   - Telemetry resumes
   - Path history clears (new session)

**✅ TEST PASSED IF:** Dashboard reconnects after reload

---

### Test 33: Webots Restart

1. **Stop Webots simulation** (click Stop ⏹️)
2. **Check Dashboard:** Shows disconnected robot
3. **Click Play in Webots**
4. **Expected:** Robot reconnects, telemetry resumes

**✅ TEST PASSED IF:** Robot reconnects successfully

---

### Test 34: Port Conflict

1. **Start backend on port 3000**
2. **Try starting second backend instance**
3. **Expected:** Error message "Port 3000 already in use"

**✅ TEST PASSED IF:** Clear error message displayed

---

### Test 35: Network Disconnection

1. **Unplug ethernet** or **disable WiFi** (if using network)
2. **Expected:**
   - Dashboard shows "Disconnected"
   - Logs show connection error
3. **Reconnect network**
4. **Expected:** Auto-reconnection within 30 seconds

**✅ TEST PASSED IF:** Handles network interruption gracefully

---

## 🌐 Browser Compatibility Testing

### Test 36: Chrome

**Repeat all core tests in Google Chrome**

**✅ TEST PASSED IF:** All features work correctly

---

### Test 37: Microsoft Edge

**Repeat all core tests in Microsoft Edge**

**✅ TEST PASSED IF:** All features work correctly

---

### Test 38: Firefox

**Repeat basic tests in Firefox** (WebSocket, controls, telemetry)

**✅ TEST PASSED IF:** Core features work

---

## 📱 Mobile Responsiveness Testing

### Test 39: Mobile View

1. **Open browser DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M)
3. **Select "iPhone 12 Pro"** or similar
4. **Test:**
   - Layout stacks vertically
   - Buttons remain clickable
   - Text readable
   - No horizontal scroll

**✅ TEST PASSED IF:** Mobile layout works properly

---

### Test 40: Tablet View

1. **In DevTools, select "iPad Air"**
2. **Verify:** Responsive grid layout adapts

**✅ TEST PASSED IF:** Tablet layout displays correctly

---

## 🛑 Shutdown Procedure

### Step 1: Stop Robot Controller
1. **In Webots, click Stop button (⏹️)**
2. **Expected:** Robot stops, connection closes

---

### Step 2: Close Webots
1. **Close Webots application**
2. **Expected:** Clean exit

---

### Step 3: Stop Frontend
1. **In Terminal 2, press Ctrl+C**
2. **Expected:** Vite server stops

---

### Step 4: Stop Backend
1. **In Terminal 1, press Ctrl+C**
2. **Expected:** Server shuts down gracefully

---

### Step 5: Close Browser
1. **Close browser tab/window**

---

## 📊 Test Results Summary Template

Use this template to document your test results:

```
============================================================
S4 ROBOT MANAGEMENT SYSTEM - TEST RESULTS
============================================================
Test Date: [Date]
Tested By: [Name]
Environment: Windows 11 / Webots R2023b / Node.js 18.x

STARTUP TESTS:
[✅/❌] Backend Server Startup
[✅/❌] Frontend Dashboard Startup
[✅/❌] Webots Simulation Startup
[✅/❌] Robot Controller Connection

CONNECTION TESTS:
[✅/❌] Three-Way Connection
[✅/❌] Heartbeat Mechanism
[✅/❌] Auto-Reconnection

CONTROL TESTS:
[✅/❌] Forward Button
[✅/❌] Backward Button
[✅/❌] Left Button
[✅/❌] Right Button
[✅/❌] Stop Button
[✅/❌] WASD Keys
[✅/❌] Arrow Keys
[✅/❌] Keyboard Toggle

TELEMETRY TESTS:
[✅/❌] Position Tracking
[✅/❌] Speed Measurement
[✅/❌] Heading Tracking
[✅/❌] Battery Drain
[✅/❌] Cycle Counter
[✅/❌] Health Status

PATH VISUALIZATION TESTS:
[✅/❌] Path Drawing
[✅/❌] Auto-Scaling
[✅/❌] Current Position Marker

UPDATES & PERMISSIONS TESTS:
[✅/❌] Version Display
[✅/❌] Permission Request
[✅/❌] Grant Permission
[✅/❌] Push Configuration
[✅/❌] Check Updates
[✅/❌] Revoke Permission
[✅/❌] Deny Permission

LOGS PANEL TESTS:
[✅/❌] Log Entries
[✅/❌] Log Scrolling
[✅/❌] Log Retention

PERFORMANCE TESTS:
[✅/❌] Telemetry Rate
[✅/❌] Command Latency
[✅/❌] UI Responsiveness
[✅/❌] Memory Usage
[✅/❌] Multiple Commands

TROUBLESHOOTING TESTS:
[✅/❌] Backend Restart
[✅/❌] Frontend Reload
[✅/❌] Webots Restart
[✅/❌] Port Conflict
[✅/❌] Network Disconnection

BROWSER COMPATIBILITY:
[✅/❌] Chrome
[✅/❌] Edge
[✅/❌] Firefox

MOBILE RESPONSIVENESS:
[✅/❌] Mobile View
[✅/❌] Tablet View

============================================================
TOTAL TESTS PASSED: ____ / 40
OVERALL RESULT: [✅ PASS / ❌ FAIL]
============================================================

NOTES:
- [Any issues encountered]
- [Performance observations]
- [Recommendations]
============================================================
```

---

## 🎯 Critical Test Paths

### Minimum Viable Test (5 minutes):
1. ✅ Start all three components
2. ✅ Verify connection (green status)
3. ✅ Test Forward button
4. ✅ Test Stop button
5. ✅ Verify telemetry updates

---

### Standard Test (15 minutes):
- All Minimum Viable Tests
- All 5 control buttons
- Keyboard controls (WASD)
- Path visualization
- Permission system
- Backend reconnection

---

### Comprehensive Test (45 minutes):
- All 40 tests in this document

---

## 📞 Support & Troubleshooting

If tests fail, refer to:
- `README.md` - Setup instructions
- `SETUP_GUIDE.md` - Detailed configuration
- `MESSAGE_PROTOCOL.md` - WebSocket protocol
- `TROUBLESHOOTING.md` - Common issues (if exists)

---

## ✅ Acceptance Criteria

**System is considered PASSED if:**
- ✅ All 3 components start without errors
- ✅ WebSocket connections establish automatically
- ✅ All 5 control buttons work correctly
- ✅ Telemetry updates in real-time
- ✅ Path visualization renders correctly
- ✅ Permission system functional
- ✅ Auto-reconnection works
- ✅ No memory leaks or performance issues
- ✅ At least 38/40 tests pass

---

**Test Procedure Version:** 1.0.0  
**Last Updated:** November 29, 2025  
**Status:** Ready for Testing ✅
