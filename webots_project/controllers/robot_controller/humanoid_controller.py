"""
S4 Remote Robot Management System - Humanoid Supervisor Controller
===================================================================

This controller uses Supervisor capabilities to directly move the robot
by changing its translation field, providing precise movement control.

Features:
- Direct position control (no wheels needed)
- WebSocket connection to backend
- Periodic telemetry transmission
- Command reception and movement control
- Simulated battery drain

Author: Fitfest25 Hackathon Team
Date: 2025
"""

import json
import time
import math
from controller import Supervisor
import websocket
import threading

# ============================================
# CONFIGURATION
# ============================================

BACKEND_URL = "ws://localhost:3000"
TELEMETRY_INTERVAL = 0.2  # seconds (200ms)
MOVE_SPEED = 0.5  # meters per timestep
BATTERY_DRAIN_RATE = 0.008  # % per second when moving

# ============================================
# GLOBAL VARIABLES
# ============================================

battery_level = 100.0
cycle_counter = 0
current_command = "stop"
ws_connection = None
connected = False

# Movement speeds (meters per step)
FORWARD_SPEED = 0.02
BACKWARD_SPEED = 0.02
LEFT_SPEED = 0.02
RIGHT_SPEED = 0.02

# ============================================
# WEBSOCKET HANDLERS
# ============================================

def on_message(ws, message):
    """Handle incoming WebSocket messages (commands from backend)."""
    global current_command
    try:
        data = json.loads(message)
        if data.get('type') == 'cmd':
            cmd = data.get('cmd', 'stop')
            current_command = cmd
            print(f"📥 Received command: {cmd}")
            
            # Send acknowledgment
            ack = {
                "type": "ack",
                "command": cmd,
                "status": "received"
            }
            ws.send(json.dumps(ack))
    except Exception as e:
        print(f"❌ Error processing message: {e}")


def on_error(ws, error):
    """Handle WebSocket errors."""
    print(f"❌ WebSocket error: {error}")


def on_close(ws, close_status_code, close_msg):
    """Handle WebSocket connection close."""
    global connected
    connected = False
    print(f"🔌 WebSocket connection closed (code: {close_status_code})")


def on_open(ws):
    """Handle WebSocket connection open."""
    global connected
    connected = True
    print(f"✅ Connected to backend at {BACKEND_URL}")


def connect_websocket():
    """Establish WebSocket connection to backend."""
    global ws_connection
    try:
        print(f"🔄 Connecting to {BACKEND_URL}...")
        ws_connection = websocket.WebSocketApp(
            BACKEND_URL,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
            on_open=on_open
        )
        
        # Run WebSocket in a separate thread
        ws_thread = threading.Thread(target=ws_connection.run_forever)
        ws_thread.daemon = True
        ws_thread.start()
        
        # Wait for connection
        time.sleep(1)
        return True
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        return False


# ============================================
# ROBOT CONTROL FUNCTIONS
# ============================================

def get_heading(compass):
    """Calculate heading angle (theta) from compass values."""
    north = compass.getValues()
    # Calculate angle in radians
    rad = math.atan2(north[0], north[2])
    return round(rad, 4)


def update_battery(is_moving, timestep):
    """Simulate battery drain based on movement."""
    global battery_level
    if is_moving:
        drain = BATTERY_DRAIN_RATE * (timestep / 1000.0)
        battery_level -= drain
        battery_level = max(0.0, min(100.0, battery_level))


def apply_movement(robot_node, command, timestep):
    """Apply movement by updating robot's translation field."""
    if command == "stop":
        return False
    
    # Get current position
    current_pos = robot_node.getPosition()
    new_pos = list(current_pos)
    
    # Calculate movement based on command
    if command == "forward":
        new_pos[0] += FORWARD_SPEED  # Move in +X direction
    elif command == "backward":
        new_pos[0] -= BACKWARD_SPEED  # Move in -X direction
    elif command == "left":
        new_pos[1] += LEFT_SPEED  # Move in +Y direction (strafe left)
    elif command == "right":
        new_pos[1] -= RIGHT_SPEED  # Move in -Y direction (strafe right)
    
    # Update robot position
    robot_node.getField('translation').setSFVec3f(new_pos)
    return True


def create_telemetry(position, heading, is_moving):
    """Create telemetry JSON message."""
    global battery_level, cycle_counter
    
    speed = 0.1 if is_moving else 0.0
    
    telemetry = {
        "type": "telemetry",
        "pose": {
            "x": round(position[0], 3),
            "y": round(position[1], 3),
            "theta": heading
        },
        "speed": speed,
        "battery": round(battery_level, 1),
        "cycle": cycle_counter,
        "timestamp": int(time.time() * 1000)
    }
    return telemetry


def send_telemetry(telemetry):
    """Send telemetry to backend via WebSocket."""
    global ws_connection, connected
    if connected and ws_connection:
        try:
            ws_connection.send(json.dumps(telemetry))
        except Exception as e:
            print(f"❌ Failed to send telemetry: {e}")
            connected = False


# ============================================
# MAIN CONTROLLER
# ============================================

def main():
    """Main robot controller loop."""
    global cycle_counter, current_command
    
    print("=" * 60)
    print("🤖 S4 HUMANOID ROBOT SUPERVISOR CONTROLLER")
    print("=" * 60)
    
    # Initialize supervisor
    supervisor = Supervisor()
    timestep = int(supervisor.getBasicTimeStep())
    print(f"⏱️  Timestep: {timestep} ms")
    
    # Get robot node
    robot_node = supervisor.getSelf()
    print("✅ Robot node acquired")
    
    # Initialize sensors
    gps = supervisor.getDevice('gps')
    gps.enable(timestep)
    compass = supervisor.getDevice('compass')
    compass.enable(timestep)
    print("✅ Sensors initialized (GPS, Compass)")
    
    # Connect to backend
    if not connect_websocket():
        print("⚠️  Starting without backend connection")
    
    print("\n🚀 Starting main control loop...")
    print("-" * 60)
    
    last_telemetry_time = 0
    
    # Main control loop
    while supervisor.step(timestep) != -1:
        current_time = supervisor.getTime()
        
        # Read sensors
        position = gps.getValues()
        heading = get_heading(compass)
        
        # Apply current command to robot
        is_moving = apply_movement(robot_node, current_command, timestep)
        
        # Update battery
        update_battery(is_moving, timestep)
        
        # Send telemetry at specified interval
        if current_time - last_telemetry_time >= TELEMETRY_INTERVAL:
            telemetry = create_telemetry(position, heading, is_moving)
            send_telemetry(telemetry)
            
            # Print status every 20 cycles
            if cycle_counter % 20 == 0:
                speed_str = "0.10" if is_moving else "0.00"
                print(f"📊 Cycle {cycle_counter:4d} | "
                      f"Pos: ({position[0]:6.2f}, {position[1]:6.2f}) | "
                      f"θ: {heading:6.3f} | "
                      f"Speed: {speed_str} m/s | "
                      f"Battery: {battery_level:5.1f}% | "
                      f"Cmd: {current_command}")
            
            cycle_counter += 1
            last_telemetry_time = current_time
        
        # Check if battery is critical
        if battery_level < 10.0 and cycle_counter % 50 == 0:
            print("⚠️  WARNING: Battery level critical!")
        
        # Attempt reconnection if disconnected
        if not connected and cycle_counter % 100 == 0:
            print("🔄 Attempting to reconnect...")
            connect_websocket()
    
    print("\n🛑 Controller stopped")


# ============================================
# ENTRY POINT
# ============================================

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
