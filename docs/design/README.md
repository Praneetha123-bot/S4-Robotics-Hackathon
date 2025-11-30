# 🎨 Design Documentation - PlantUML Diagrams

## S4 Remote Robot Management System - Fitfest25 Hackathon

This folder contains all system design diagrams in PlantUML format.

---

## 📋 Available Diagrams

### 1. **Architecture Diagram** (`architecture.puml`)
**Type**: Component Diagram  
**Purpose**: High-level system architecture showing all components and their interactions

**Components**:
- Webots Simulation Environment (Robot, Controller, World, Sensors)
- Cloud Backend (Express Server, WebSocket Server, Message Router, Utils)
- Cloud Frontend (Vite Server, React App, WebSocket Client, UI Components)

**Connections**:
- Telemetry flow: Robot → Backend → Frontend
- Command flow: Frontend → Backend → Robot

**How to view**:
```bash
# Online: https://www.plantuml.com/plantuml/uml/
# Or use VS Code PlantUML extension
# Or command line: plantuml architecture.puml
```

---

### 2. **Sequence Diagram - Telemetry Flow** (`sequence-telemetry.puml`)
**Type**: Sequence Diagram  
**Purpose**: Shows the complete telemetry streaming workflow from robot to frontend

**Flow**:
1. Robot reads sensors (GPS, Compass)
2. Calculates speed and battery level
3. Builds JSON telemetry message
4. Sends via WebSocket to backend
5. Backend broadcasts to all frontend clients
6. Frontend updates UI (telemetry panel, path view, logs)

**Timing**: Every 200-300ms (configurable)

**Error Handling**: Includes auto-reconnection on connection failure

---

### 3. **Sequence Diagram - Command Flow** (`sequence-command.puml`)
**Type**: Sequence Diagram  
**Purpose**: Shows the complete command execution workflow from user to robot

**Flow**:
1. User clicks button or presses keyboard
2. Frontend sends command via WebSocket
3. Backend routes command to robot
4. Robot parses command and applies movement
5. Webots updates physics
6. Robot sends updated telemetry back

**Special Cases**:
- Forward/Backward: Continuous movement
- Left/Right: 90° turn + forward with debouncing
- Stop: Halt movement, reset state

---

### 4. **State Machine - Command Debouncing** (`state-machine-debouncing.puml`)
**Type**: State Machine Diagram  
**Purpose**: Shows how command debouncing prevents continuous rotation

**States**:
- **Idle**: last_executed_command = "stop"
- **Forward/Backward**: Continuous movement
- **Left/Right Processing**: Decision point based on last_executed_command
- **Turn + Forward**: Execute 90° turn once
- **Forward Only**: Continue forward without re-rotating

**Logic**:
- Turn executes only when `last_executed_command != current_command`
- Holding button continues forward without re-rotating
- Releasing and pressing again triggers new turn

---

### 5. **State Machine - WebSocket Connection** (`state-machine-websocket.puml`)
**Type**: State Machine Diagram  
**Purpose**: Shows WebSocket connection lifecycle with auto-reconnection

**States**:
- **Disconnected**: No connection (🔴 Red)
- **Connecting**: Attempting connection (🟡 Yellow)
- **Connected**: Active connection (🟢 Green)
- **Error**: Connection failed
- **Auto-Reconnect Wait**: 2-second delay before retry

**Transitions**:
- Clean disconnect: Connected → Disconnected
- Network failure: Connected → Error → Wait → Connecting
- Timeout: Connecting → Error

---

### 6. **Control Flow - Robot Controller** (`control-flow-robot.puml`)
**Type**: Activity Diagram  
**Purpose**: Detailed control flow of the Python robot controller

**Phases**:
1. **Initialization**: Setup Supervisor API, sensors, WebSocket
2. **Main Loop**: Execute every 64ms timestep
3. **Command Processing**: Parse and apply movement
4. **Sensor Reading**: Get GPS, Compass data
5. **Telemetry Building**: Format JSON message
6. **WebSocket Communication**: Send/receive messages

**Decision Points**:
- Command type routing (forward/backward/left/right/stop)
- Debouncing check (first press vs holding)
- Telemetry sending (every 3 cycles)
- Battery level validation

---

### 7. **Data Flow Diagram** (`data-flow.puml`)
**Type**: Data Flow Diagram (DFD)  
**Purpose**: Shows data movement through the system

**Level 0 (Context)**:
- User → S4 System → Webots
- Shows external entities and system boundary

**Level 1 (Detailed)**:
- **Processes** (7):
  1. Capture User Input
  2. Manage WebSocket Communication
  3. Route Messages
  4. Control Robot Movement
  5. Collect Sensor Data
  6. Build Telemetry
  7. Visualize Data

- **Data Stores** (5):
  - D1: Command Queue
  - D2: Telemetry History
  - D3: Path History (last 500 points)
  - D4: Log Entries (last 100)
  - D5: Robot State

**Data Flows**: Shows all data movements between processes and stores

---

### 8. **Sequence Diagram - System Startup** (`sequence-startup.puml`)
**Type**: Sequence Diagram  
**Purpose**: Complete system initialization sequence

**Phases**:
1. **Backend Initialization**: npm start → Server running
2. **Frontend Initialization**: npm run dev → Dashboard ready
3. **Webots Initialization**: Load world → Start simulation
4. **Robot Controller**: Connect → Send first telemetry
5. **System Ready**: All components operational

**Timeline**: ~30 seconds from start to fully operational

---

## 🛠️ How to Use These Diagrams

### Option 1: Online Viewer
1. Go to https://www.plantuml.com/plantuml/uml/
2. Copy content from any `.puml` file
3. Paste into the text area
4. View rendered diagram

### Option 2: VS Code Extension
1. Install "PlantUML" extension by jebbs
2. Open any `.puml` file
3. Press `Alt+D` to preview
4. Or right-click → "Preview Current Diagram"

### Option 3: Command Line
```bash
# Install PlantUML
# Windows: choco install plantuml
# macOS: brew install plantuml
# Linux: apt-get install plantuml

# Generate PNG
plantuml architecture.puml

# Generate SVG
plantuml -tsvg architecture.puml

# Generate all diagrams
plantuml *.puml
```

### Option 4: Java JAR
```bash
# Download plantuml.jar
wget http://sourceforge.net/projects/plantuml/files/plantuml.jar/download

# Generate diagram
java -jar plantuml.jar architecture.puml
```

---

## 📊 Diagram Summary Table

| File | Type | Purpose | Complexity | Priority |
|------|------|---------|------------|----------|
| `architecture.puml` | Component | System overview | Medium | High |
| `sequence-telemetry.puml` | Sequence | Telemetry flow | Medium | High |
| `sequence-command.puml` | Sequence | Command flow | High | High |
| `state-machine-debouncing.puml` | State | Debouncing logic | High | High |
| `state-machine-websocket.puml` | State | Connection lifecycle | Medium | Medium |
| `control-flow-robot.puml` | Activity | Robot controller | High | High |
| `data-flow.puml` | DFD | Data movement | Medium | Medium |
| `sequence-startup.puml` | Sequence | System initialization | Medium | Low |

---

## 🎯 Diagram Usage Guide

### For Developers
**Understanding the system?**  
→ Start with `architecture.puml`

**Implementing features?**  
→ Check `control-flow-robot.puml` and `sequence-*.puml`

**Debugging issues?**  
→ Review `state-machine-*.puml` for state transitions

### For Testers
**Understanding workflows?**  
→ Study `sequence-*.puml` diagrams

**Finding edge cases?**  
→ Check `state-machine-*.puml` for state transitions

### For Judges/Reviewers
**Evaluating architecture?**  
→ Start with `architecture.puml` and `data-flow.puml`

**Assessing complexity?**  
→ Review `control-flow-robot.puml` and `state-machine-debouncing.puml`

**Understanding innovation?**  
→ Focus on `state-machine-debouncing.puml` (unique solution)

---

## 🔧 Diagram Conventions

### Colors
- **Light Blue**: Webots/Simulation components
- **Light Green**: Backend/Server components
- **Light Coral**: Frontend/UI components
- **Light Yellow**: Data stores/Databases
- **Light Cyan**: State machine states

### Symbols
- `→`: Data flow / Message
- `⇒`: Control flow
- `--`: Return flow
- `[*]`: Initial/Final state
- `<<choice>>`: Decision point
- `<<database>>`: Data store

### Notes
- Right-aligned: Implementation details
- Left-aligned: Alternative paths
- Top/Bottom: Context or summary

---

## 📝 Diagram Maintenance

### When to Update
- New feature added
- Architecture change
- Bug fix affecting flow
- Performance optimization

### How to Update
1. Edit `.puml` file
2. Regenerate diagram
3. Verify rendering
4. Update this README if needed

### Version Control
- All `.puml` files tracked in Git
- Generated images (.png, .svg) ignored
- Commit message should reference diagram changes

---

## 🆘 Troubleshooting

### Diagram Not Rendering
**Issue**: Syntax error in PlantUML

**Solutions**:
- Check for missing `@enduml`
- Verify proper indentation
- Use online validator: https://www.plantuml.com/plantuml/uml/

### Complex Diagram Too Large
**Issue**: Generated image is huge

**Solutions**:
- Split into multiple diagrams
- Simplify by removing details
- Use `skinparam dpi 150` to reduce resolution

### Text Overlapping
**Issue**: Labels overlap in rendered diagram

**Solutions**:
- Add `skinparam padding 10`
- Adjust layout direction
- Use shorter labels

---

## 📚 Additional Resources

### PlantUML Documentation
- Official Guide: https://plantuml.com/
- Sequence Diagrams: https://plantuml.com/sequence-diagram
- State Diagrams: https://plantuml.com/state-diagram
- Activity Diagrams: https://plantuml.com/activity-diagram-beta
- Component Diagrams: https://plantuml.com/component-diagram

### Tools
- VS Code Extension: https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml
- IntelliJ Plugin: https://plugins.jetbrains.com/plugin/7017-plantuml-integration
- Online Editor: https://www.plantuml.com/plantuml/uml/

---

**Last Updated**: December 1, 2025  
**Project**: S4 Remote Robot Management System  
**Event**: Fitfest25 Hackathon  
**Total Diagrams**: 8
