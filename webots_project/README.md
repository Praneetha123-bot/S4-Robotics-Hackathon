# Webots Robot Simulation - S4 System

## 🤖 Overview

This directory contains the Webots simulation environment for the S4 Remote Robot Management System. It includes:

- World file with TurtleBot3 robot
- Python controller for WebSocket communication
- Sensor reading and motor control logic

---

## 📁 Directory Structure

```
webots_project/
├── worlds/
│   └── robot_world.wbt          # Webots world file
├── controllers/
│   └── robot_controller/
│       └── controller.py         # Python robot controller
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites

1. **Webots R2023b or later** installed
   - Download from: https://cyberbotics.com/#download

2. **Python 3.10+** with pip

3. **Python Dependencies:**
   ```powershell
   pip install websocket-client
   ```

### Running the Simulation

1. **Start the Backend Server First**
   ```powershell
   cd ../backend
   npm start
   ```

2. **Open Webots**
   - Launch Webots application
   - File → Open World
   - Navigate to: `webots_project/worlds/robot_world.wbt`

3. **Run Simulation**
   - Click the Play button (▶️)
   - The controller will automatically connect to the backend
   - Check console for connection messages

---

## 🎮 Robot Controller Details

### Functionality

The `controller.py` implements:

1. **WebSocket Connection** to backend server
2. **Sensor Reading:**
   - GPS position (x, y)
   - Compass heading (theta)
   - Motor speeds
3. **Telemetry Transmission** (every 200-300ms)
4. **Command Reception** from backend
5. **Motor Control** based on commands

### Telemetry Data

Sent every 200-300ms:

```json
{
  "type": "telemetry",
  "pose": {
    "x": 1.234,
    "y": 0.567,
    "theta": 0.785
  },
  "speed": 0.3,
  "battery": 92.5,
  "cycle": 103,
  "timestamp": 1701234567890
}
```

### Control Commands

Supported commands:

| Command | Action | Motor Speeds |
|---------|--------|--------------|
| `forward` | Move forward | Left: 2.0, Right: 2.0 |
| `backward` | Move backward | Left: -2.0, Right: -2.0 |
| `left` | Turn left | Left: -1.0, Right: 1.0 |
| `right` | Turn right | Left: 1.0, Right: -1.0 |
| `stop` | Stop all motors | Left: 0.0, Right: 0.0 |

---

## 🔧 Configuration

### Backend URL

Edit `controller.py` to change backend connection:

```python
BACKEND_URL = "ws://localhost:3000"
```

### Telemetry Interval

Adjust update frequency:

```python
TELEMETRY_INTERVAL = 0.2  # seconds (200ms)
```

### Motor Speed Limits

Modify motor speeds in the command handler:

```python
MOTOR_SPEEDS = {
    'forward': (2.0, 2.0),
    'backward': (-2.0, -2.0),
    'left': (-1.0, 1.0),
    'right': (1.0, -1.0),
    'stop': (0.0, 0.0)
}
```

---

## 🌍 World File Details

### Environment

- **Ground:** Gray plane (10m x 10m)
- **Lighting:** Directional light from above
- **Gravity:** Standard Earth gravity (9.81 m/s²)

### Robot

- **Model:** TurtleBot3 Burger
- **Position:** Center of world (0, 0, 0.08)
- **Sensors:**
  - GPS (for position)
  - Compass (for orientation)
  - Distance sensors (available but not used in this version)
- **Actuators:**
  - Left wheel motor
  - Right wheel motor

---

## 🧪 Testing

### Test Connection

1. Start backend server
2. Run Webots simulation
3. Check Webots console for:
   ```
   ✓ Connected to backend at ws://localhost:3000
   ✓ Sending telemetry...
   ```

### Test Movement

1. Open frontend dashboard
2. Click control buttons
3. Observe robot movement in Webots 3D view
4. Check console for received commands

### Verify Telemetry

Backend should show incoming messages:
```
📥 Telemetry from robot: x=1.23, y=0.45, θ=0.78
```

---

## 🐛 Troubleshooting

### "Connection refused"

**Problem:** Controller can't connect to backend

**Solutions:**
1. Ensure backend is running first
2. Check `BACKEND_URL` matches backend address
3. Verify no firewall blocking port 3000
4. Try: `curl http://localhost:3000/status`

### "No module named 'websocket'"

**Problem:** websocket-client not installed

**Solution:**
```powershell
pip install websocket-client
```

### Robot not moving

**Problem:** Commands received but robot doesn't move

**Solutions:**
1. Verify simulation is running (not paused)
2. Check motor device initialization in controller
3. Ensure physics mode is enabled
4. Check Webots console for errors

### GPS returns NaN values

**Problem:** Position shows "NaN" in console

**Solutions:**
1. Wait a few timesteps for GPS initialization
2. Check GPS device is properly enabled
3. Verify GPS node exists in robot definition

---

## 📝 Code Structure

### Main Loop

```python
while robot.step(timestep) != -1:
    # Read sensors
    position = gps.getValues()
    heading = compass.getValues()
    
    # Calculate telemetry
    telemetry = create_telemetry(position, heading)
    
    # Send to backend
    ws.send(json.dumps(telemetry))
    
    # Check for commands
    if ws.available():
        command = json.loads(ws.recv())
        apply_command(command)
    
    # Update cycle counter
    cycle_counter += 1
```

### Battery Simulation

Battery drains based on motor activity:
```python
battery -= 0.01 * abs(motor_speed_avg) * timestep / 1000
battery = max(0, min(100, battery))
```

---

## 🔄 Sensor Update Rates

| Sensor | Update Rate | Purpose |
|--------|-------------|---------|
| GPS | 64 ms | Position (x, y, z) |
| Compass | 64 ms | Orientation (theta) |
| Motors | 64 ms | Speed feedback |

---

## 🎯 Future Enhancements

- [ ] Add camera feed transmission
- [ ] Implement obstacle detection with distance sensors
- [ ] Add IMU data (acceleration, gyroscope)
- [ ] Battery charging simulation
- [ ] Multiple robot support
- [ ] Collision detection
- [ ] Path recording and playback

---

## 📚 References

- [Webots Documentation](https://cyberbotics.com/doc/guide/index)
- [TurtleBot3 Specification](https://emanual.robotis.com/docs/en/platform/turtlebot3/overview/)
- [websocket-client Library](https://github.com/websocket-client/websocket-client)

---

## 🎓 Learning Resources

### Webots Tutorials
- https://cyberbotics.com/doc/guide/tutorials
- https://cyberbotics.com/doc/guide/tutorial-1-your-first-simulation-in-webots

### Python Controller API
- https://cyberbotics.com/doc/reference/robot
- https://cyberbotics.com/doc/reference/motor
- https://cyberbotics.com/doc/reference/gps

---

**Ready to simulate!** 🚀
