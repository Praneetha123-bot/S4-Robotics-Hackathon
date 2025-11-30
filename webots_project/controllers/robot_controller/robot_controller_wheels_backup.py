"""
S4 Remote Robot Management System - Webots Controller
=======================================================

This controller manages a TurtleBot3/E-puck robot in Webots simulation
and communicates with the Node.js backend via WebSocket.

Features:
- WebSocket connection to backend
- Periodic telemetry transmission (pose, speed, battery)
- Command reception and motor control
- Simulated battery drain
- Auto-reconnection on disconnect

Author: Fitfest25 Hackathon Team
Date: 2025
"""

import json
import time
import math
from controller import Robot, Motor, GPS, Compass
import websocket
import threading

# ============================================
# CONFIGURATION
# ============================================

BACKEND_URL = "ws://localhost:3000"
TELEMETRY_INTERVAL = 0.2  # seconds (200ms)
MAX_SPEED = 10.0  # rad/s (motor max speed)
BATTERY_DRAIN_RATE = 0.008  # % per second when moving

# ============================================
# GLOBAL VARIABLES
# ============================================

battery_level = 100.0
cycle_counter = 0
current_command = "stop"
ws_connection = None
connected = False

# Motor speeds (front, back, left, right) - 4-wheel omnidirectional robot
# Front/Back wheels (axis 0 1 0): control forward/backward movement
# Left/Right wheels (axis 1 0 0): control lateral (sideways) movement
motor_speeds = {
    'forward': (8.0, 8.0, 0.0, 0.0),      # Front and back wheels move forward
    'backward': (-8.0, -8.0, 0.0, 0.0),   # Front and back wheels move backward
    'left': (0.0, 0.0, 8.0, -8.0),        # Left wheel forward, right wheel backward = move left
    'right': (0.0, 0.0, -8.0, 8.0),       # Left wheel backward, right wheel forward = move right
    'stop': (0.0, 0.0, 0.0, 0.0)
}

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
            if cmd in motor_speeds:
                current_command = cmd
                print(f"📥 Received command: {cmd}")
            else:
                print(f"⚠️  Unknown command: {cmd}")
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
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

def calculate_speed(front_motor, back_motor, left_motor, right_motor):
    """Calculate robot speed from wheel velocities."""
    front_speed = front_motor.getVelocity()
    back_speed = back_motor.getVelocity()
    left_speed = left_motor.getVelocity()
    right_speed = right_motor.getVelocity()
    avg_speed = (abs(front_speed) + abs(back_speed) + abs(left_speed) + abs(right_speed)) / 4.0
    # Convert rad/s to m/s (wheel radius 0.04m)
    linear_speed = avg_speed * 0.04
    return round(linear_speed, 3)


def get_heading(compass):
    """Calculate heading angle (theta) from compass values."""
    north = compass.getValues()
    # Calculate angle in radians
    rad = math.atan2(north[0], north[2])
    return round(rad, 4)


def update_battery(front_speed, back_speed, left_speed, right_speed, timestep):
    """Simulate battery drain based on motor activity."""
    global battery_level
    avg_speed = (abs(front_speed) + abs(back_speed) + abs(left_speed) + abs(right_speed)) / 4.0
    if avg_speed > 0.1:
        drain = BATTERY_DRAIN_RATE * (timestep / 1000.0)
        battery_level -= drain
        battery_level = max(0.0, min(100.0, battery_level))


def apply_motor_command(front_motor, back_motor, left_motor, right_motor, command):
    """Apply motor speeds based on command to 4 wheels (omnidirectional drive)."""
    speeds = motor_speeds.get(command, (0.0, 0.0, 0.0, 0.0))
    # Apply speeds: front, back, left, right
    front_motor.setVelocity(speeds[0])
    back_motor.setVelocity(speeds[1])
    left_motor.setVelocity(speeds[2])
    right_motor.setVelocity(speeds[3])


def create_telemetry(position, heading, speed):
    """Create telemetry JSON message."""
    global battery_level, cycle_counter
    
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
    print("🤖 S4 WEBOTS ROBOT CONTROLLER - 4 WHEEL OMNIDIRECTIONAL")
    print("=" * 60)
    
    # Initialize robot
    robot = Robot()
    timestep = int(robot.getBasicTimeStep())
    print(f"⏱️  Timestep: {timestep} ms")
    
    # Initialize motors (4 wheels: front, back, left, right)
    front_motor = robot.getDevice('front wheel motor')
    back_motor = robot.getDevice('back wheel motor')
    left_motor = robot.getDevice('left wheel motor')
    right_motor = robot.getDevice('right wheel motor')
    
    # Set to velocity control mode (infinite position = velocity control)
    front_motor.setPosition(float('inf'))
    back_motor.setPosition(float('inf'))
    left_motor.setPosition(float('inf'))
    right_motor.setPosition(float('inf'))
    
    # Initialize velocities to 0
    front_motor.setVelocity(0.0)
    back_motor.setVelocity(0.0)
    left_motor.setVelocity(0.0)
    right_motor.setVelocity(0.0)
    print("✅ Motors initialized (4-wheel omnidirectional)")
    
    # Initialize sensors
    gps = robot.getDevice('gps')
    gps.enable(timestep)
    compass = robot.getDevice('compass')
    compass.enable(timestep)
    print("✅ Sensors initialized (GPS, Compass)")
    
    # Connect to backend
    if not connect_websocket():
        print("⚠️  Starting without backend connection")
    
    print("\n🚀 Starting main control loop...")
    print("-" * 60)
    
    last_telemetry_time = 0
    
    # Main control loop
    while robot.step(timestep) != -1:
        current_time = robot.getTime()
        
        # Read sensors
        position = gps.getValues()
        heading = get_heading(compass)
        speed = calculate_speed(front_motor, back_motor, left_motor, right_motor)
        
        # Apply current command to motors (4 wheels)
        apply_motor_command(front_motor, back_motor, left_motor, right_motor, current_command)
        
        # Update battery
        front_speed = front_motor.getVelocity()
        back_speed = back_motor.getVelocity()
        left_speed = left_motor.getVelocity()
        right_speed = right_motor.getVelocity()
        update_battery(front_speed, back_speed, left_speed, right_speed, timestep)
        
        # Send telemetry at specified interval
        if current_time - last_telemetry_time >= TELEMETRY_INTERVAL:
            telemetry = create_telemetry(position, heading, speed)
            send_telemetry(telemetry)
            
            # Print status every 20 cycles
            if cycle_counter % 20 == 0:
                print(f"📊 Cycle {cycle_counter:4d} | "
                      f"Pos: ({position[0]:6.2f}, {position[1]:6.2f}) | "
                      f"θ: {heading:6.3f} | "
                      f"Speed: {speed:.2f} m/s | "
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
