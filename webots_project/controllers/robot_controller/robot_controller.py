"""
S4 Remote Robot Management System - Robot Supervisor Controller
===================================================================

This controller uses Supervisor capabilities to directly move the robot
by changing its translation and rotation fields.

Robot-Relative Kinematics:
- Forward/Backward: Move in direction of theta (facing angle)
- Left/Right: **Instant 90° turn + move forward** in new direction
- Movement equations:
  * Forward:  x += cos(θ) * speed, y += sin(θ) * speed
  * Backward: x -= cos(θ) * speed, y -= sin(θ) * speed
  * Left:     θ_new = θ + π/2, then x += cos(θ_new) * speed, y += sin(θ_new) * speed
  * Right:    θ_new = θ - π/2, then x += cos(θ_new) * speed, y += sin(θ_new) * speed

Features:
- Direct position and orientation control (no wheels needed)
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
BATTERY_DRAIN_RATE = 0.008  # % per second when moving

# ============================================
# GLOBAL VARIABLES
# ============================================

battery_level = 100.0
cycle_counter = 0
current_command = "stop"
last_executed_command = "stop"
ws_connection = None
connected = False

# Movement speeds (meters/radians per step) - robot-relative
MOVEMENT_SPEED = 0.02     # Universal linear speed for forward/backward
TURN_ANGLE = math.pi / 2  # 90 degrees turn for left/right

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

def normalize_theta(theta):
    """Normalize theta to range [-π, π]."""
    while theta > math.pi:
        theta -= 2 * math.pi
    while theta < -math.pi:
        theta += 2 * math.pi
    return theta


def get_current_yaw(robot_node):
    """Extract rotation angle (theta/yaw) from the robot's rotation field."""
    current_rot = robot_node.getOrientation()
    # Rotation matrix is 3x3: [R11, R12, R13, R21, R22, R23, R31, R32, R33]
    # For rotation around Z-axis: theta = atan2(R21, R11)
    theta = math.atan2(current_rot[3], current_rot[0])
    return normalize_theta(theta)


def get_heading(compass):
    """Calculate heading angle (theta) from compass values and normalize."""
    north = compass.getValues()
    rad = math.atan2(north[0], north[2])
    return normalize_theta(rad)


def update_battery(is_moving, timestep):
    """Simulate battery drain based on movement."""
    global battery_level
    if is_moving:
        drain = BATTERY_DRAIN_RATE * (timestep / 1000.0)
        battery_level -= drain
        battery_level = max(0.0, min(100.0, battery_level))


def move_forward(pos, theta, speed):
    """Move forward in direction of theta."""
    return [
        pos[0] + math.cos(theta) * speed,
        pos[1] + math.sin(theta) * speed,
        pos[2]
    ]


def move_backward(pos, theta, speed):
    """Move backward opposite to theta."""
    return [
        pos[0] - math.cos(theta) * speed,
        pos[1] - math.sin(theta) * speed,
        pos[2]
    ]


def rotate_left(theta, speed):
    """Rotate counter-clockwise (positive yaw)."""
    return normalize_theta(theta + speed)


def rotate_right(theta, speed):
    """Rotate clockwise (negative yaw)."""
    return normalize_theta(theta - speed)


def apply_movement(robot_node, command, timestep):
    """
    Apply robot-relative movement (linear or angular).
    
    Movement is relative to robot's facing direction (theta):
    - forward: moves linearly in facing direction (continuous)
    - backward: moves linearly opposite to facing (continuous)
    - left: turns 90° left once per command press
    - right: turns 90° right once per command press
    
    LEFT/RIGHT only execute once per button press to avoid spinning.
    """
    global last_executed_command
    
    if command == "stop":
        last_executed_command = "stop"
        return False
    
    # Get current state
    current_pos = robot_node.getPosition()
    current_theta = get_current_yaw(robot_node)
    
    # Debug: Print movement details every 20 commands
    global cycle_counter
    log_debug = cycle_counter % 20 == 0
    
    if log_debug:
        print(f"🔍 Movement: cmd={command}, theta={current_theta:.3f} rad ({math.degrees(current_theta):.1f}°), pos=({current_pos[0]:.2f}, {current_pos[1]:.2f})")
    
    moved = False
    
    # Apply Linear Movement (continuous - executes every cycle)
    if command == "forward":
        new_pos = move_forward(current_pos, current_theta, MOVEMENT_SPEED)
        robot_node.getField('translation').setSFVec3f(new_pos)
        moved = True
        last_executed_command = "forward"
        if log_debug:
            print(f"   → Forward: Δx={new_pos[0]-current_pos[0]:.4f}, Δy={new_pos[1]-current_pos[1]:.4f}")
            
    elif command == "backward":
        new_pos = move_backward(current_pos, current_theta, MOVEMENT_SPEED)
        robot_node.getField('translation').setSFVec3f(new_pos)
        moved = True
        last_executed_command = "backward"
        if log_debug:
            print(f"   → Backward: Δx={new_pos[0]-current_pos[0]:.4f}, Δy={new_pos[1]-current_pos[1]:.4f}")
            
    # Apply Turn + Forward Movement (ONCE per command change)
    elif command == "left":
        # Only execute if this is a NEW left command
        if last_executed_command != "left":
            # Turn 90° left (counter-clockwise) and move forward
            new_theta = normalize_theta(current_theta + TURN_ANGLE)  # +90°
            robot_node.getField('rotation').setSFRotation([0, 0, 1, new_theta])
            # Move forward in the NEW direction
            new_pos = move_forward(current_pos, new_theta, MOVEMENT_SPEED)
            robot_node.getField('translation').setSFVec3f(new_pos)
            moved = True
            last_executed_command = "left"
            print(f"✨ Turn 90° Left + Forward: θ_new={new_theta:.3f} rad ({math.degrees(new_theta):.1f}°)")
        # If already executed left, just move forward
        else:
            new_pos = move_forward(current_pos, current_theta, MOVEMENT_SPEED)
            robot_node.getField('translation').setSFVec3f(new_pos)
            moved = True
            
    elif command == "right":
        # Only execute if this is a NEW right command
        if last_executed_command != "right":
            # Turn 90° right (clockwise) and move forward
            new_theta = normalize_theta(current_theta - TURN_ANGLE)  # -90°
            robot_node.getField('rotation').setSFRotation([0, 0, 1, new_theta])
            # Move forward in the NEW direction
            new_pos = move_forward(current_pos, new_theta, MOVEMENT_SPEED)
            robot_node.getField('translation').setSFVec3f(new_pos)
            moved = True
            last_executed_command = "right"
            print(f"✨ Turn 90° Right + Forward: θ_new={new_theta:.3f} rad ({math.degrees(new_theta):.1f}°)")
        # If already executed right, just move forward
        else:
            new_pos = move_forward(current_pos, current_theta, MOVEMENT_SPEED)
            robot_node.getField('translation').setSFVec3f(new_pos)
            moved = True

    return moved


def create_telemetry(position, heading, is_moving):
    """
    Create telemetry JSON message with normalized theta.
    
    Telemetry includes:
    - pose: {x, y, theta} where theta is normalized to [-π, π]
    - speed: current movement speed
    - battery: battery level percentage
    - cycle: cycle counter
    - timestamp: milliseconds since epoch
    """
    global battery_level, cycle_counter
    
    # Speed is set based on movement type
    if current_command in ["forward", "backward"]:
        speed = 0.1  # Linear movement
    elif current_command in ["left", "right"]:
        speed = 0.05  # Rotational movement
    else:
        speed = 0.0
    
    # Ensure theta is normalized before sending
    normalized_heading = normalize_theta(heading)
    
    telemetry = {
        "type": "telemetry",
        "pose": {
            "x": round(position[0], 3),
            "y": round(position[1], 3),
            "theta": round(normalized_heading, 4)
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
    print("🤖 S4 ROBOT SUPERVISOR CONTROLLER (Rotation-Based)")
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
        # Use robot's actual rotation field for heading
        heading = get_current_yaw(robot_node)
        
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
                speed_value = telemetry['speed']
                print(f"📊 Cycle {cycle_counter:4d} | "
                      f"Pos: ({position[0]:6.2f}, {position[1]:6.2f}) | "
                      f"θ: {heading:6.3f} rad ({math.degrees(heading):6.1f}°) | "
                      f"Speed: {speed_value:4.2f} | "
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
