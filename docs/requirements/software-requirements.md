# Software Requirements Specification (SRS)

## S4 Remote Robot Management System - Fitfest25 Hackathon

**Version**: 1.0  
**Date**: December 1, 2025  
**Project**: S4 Remote Robot Management System

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for the S4 Remote Robot Management System, a cloud-based platform for remote robot control and monitoring using Webots simulation.

### 1.2 Scope
The system enables real-time teleoperation, telemetry monitoring, and path visualization of a virtual robot through a web-based dashboard with WebSocket communication.

### 1.3 Definitions and Acronyms
- **S4**: System 4 - Remote Management Layer
- **WS**: WebSocket
- **GPS**: Global Positioning System (simulated)
- **UI**: User Interface
- **API**: Application Programming Interface
- **SRS**: Software Requirements Specification

---

## 2. Functional Requirements

### FR-1: Robot Telemetry Streaming

**FR-1.1 Position Reporting**
- **Description**: The robot shall report its position (x, y, θ) in real-time
- **Input**: Robot GPS and Compass sensors
- **Output**: JSON telemetry message with pose data
- **Frequency**: Every 200-300ms
- **Accuracy**: ±0.001m for position, ±0.001 rad for orientation
- **Priority**: High

**FR-1.2 Speed Monitoring**
- **Description**: The system shall calculate and report robot speed
- **Input**: Position changes over time
- **Output**: Linear velocity in m/s
- **Calculation**: `speed = distance / time_delta`
- **Priority**: Medium

**FR-1.3 Battery Monitoring**
- **Description**: The system shall simulate and report battery level
- **Input**: Robot activity and commands
- **Output**: Battery percentage (0-100%)
- **Drain Rate**:
  - Forward/Backward: -0.002% per cycle
  - Left/Right (turning): -0.003% per cycle
  - Idle: -0.0005% per cycle
- **Priority**: High

**FR-1.4 System Health Status**
- **Description**: The system shall compute overall health status
- **Input**: Battery level, speed, activity
- **Output**: Health status (Excellent/Good/Fair/Critical)
- **Logic**:
  - Excellent: battery > 80% AND speed < 0.5 m/s
  - Good: battery > 50%
  - Fair: battery > 20%
  - Critical: battery ≤ 20%
- **Priority**: Medium

### FR-2: Robot Tele-operation

**FR-2.1 Forward Movement**
- **Description**: The robot shall move forward in its facing direction
- **Input**: "forward" command from frontend
- **Output**: Position update (x, y) based on facing angle θ
- **Kinematics**: 
  - `new_x = x + cos(θ) × 0.02`
  - `new_y = y + sin(θ) × 0.02`
- **Speed**: 0.02 m/step
- **Priority**: High

**FR-2.2 Backward Movement**
- **Description**: The robot shall move backward opposite to facing direction
- **Input**: "backward" command from frontend
- **Output**: Position update (x, y)
- **Kinematics**: 
  - `new_x = x - cos(θ) × 0.02`
  - `new_y = y - sin(θ) × 0.02`
- **Speed**: 0.02 m/step
- **Priority**: High

**FR-2.3 Left Turn Navigation**
- **Description**: The robot shall turn 90° counter-clockwise and move forward
- **Input**: "left" command from frontend
- **Output**: Orientation update + position update
- **Behavior**:
  - **First press**: Turn 90° left (θ += π/2), then move forward
  - **Hold**: Continue forward without re-rotating
  - **Release + press again**: Execute another 90° turn
- **Turn Angle**: π/2 radians (90 degrees)
- **Priority**: High

**FR-2.4 Right Turn Navigation**
- **Description**: The robot shall turn 90° clockwise and move forward
- **Input**: "right" command from frontend
- **Output**: Orientation update + position update
- **Behavior**:
  - **First press**: Turn 90° right (θ -= π/2), then move forward
  - **Hold**: Continue forward without re-rotating
  - **Release + press again**: Execute another 90° turn
- **Turn Angle**: -π/2 radians (-90 degrees)
- **Priority**: High

**FR-2.5 Stop Command**
- **Description**: The robot shall halt all movement
- **Input**: "stop" command from frontend
- **Output**: Zero velocity, maintain current position
- **Idle Power**: Minimal battery drain (0.0005% per cycle)
- **Priority**: High

**FR-2.6 Command Debouncing**
- **Description**: The system shall prevent continuous rotation on held buttons
- **Input**: Current command + last executed command
- **Logic**: Execute turn only when `last_executed_command != current_command`
- **State Tracking**: Maintain `last_executed_command` variable
- **Priority**: High

### FR-3: WebSocket Communication

**FR-3.1 Backend WebSocket Server**
- **Description**: The backend shall provide a WebSocket server
- **Protocol**: RFC 6455 (WebSocket)
- **Port**: 3000 (configurable)
- **Endpoint**: `ws://localhost:3000`
- **Connections**: Support multiple simultaneous clients
- **Priority**: Critical

**FR-3.2 Message Routing**
- **Description**: The backend shall route messages between robot and frontend
- **Input**: WebSocket messages with "type" field
- **Routing Logic**:
  - `type: "telemetry"` → Broadcast to all frontend clients
  - `type: "cmd"` → Forward to robot controller
  - `type: "connected"` → Broadcast connection status
  - `type: "ack"` → Send acknowledgment to sender
- **Priority**: Critical

**FR-3.3 Auto-Reconnection**
- **Description**: Clients shall automatically reconnect on disconnect
- **Retry Interval**: 2 seconds
- **Max Retries**: Infinite
- **Exponential Backoff**: No (fixed 2s interval)
- **Priority**: High

**FR-3.4 Message Format Validation**
- **Description**: The system shall validate message formats
- **Validation**: Check for required "type" field
- **Error Handling**: Log invalid messages, do not crash
- **Priority**: Medium

### FR-4: Frontend Dashboard

**FR-4.1 Connection Status Display**
- **Description**: The UI shall display WebSocket connection status
- **States**:
  - 🟢 Connected: WebSocket open and active
  - 🟡 Connecting: Attempting connection
  - 🔴 Disconnected: No connection
- **Visual**: Color-coded indicator with text
- **Priority**: High

**FR-4.2 Telemetry Panel**
- **Description**: The UI shall display real-time telemetry in cards
- **Components**:
  - Position Card: X, Y, θ values
  - Speed Card: m/s with progress bar
  - Battery Card: % with color-coded bar (green/yellow/red)
  - Health Card: Status text with color
- **Update Rate**: Real-time (on telemetry message)
- **Layout**: Horizontal grid (4 cards)
- **Priority**: High

**FR-4.3 Tele-operation Controls**
- **Description**: The UI shall provide control buttons and keyboard shortcuts
- **Button Controls**:
  - ⬆️ Forward button
  - ⬇️ Backward button
  - ⬅️ Left button
  - ➡️ Right button
  - ⏹️ Stop button
- **Keyboard Shortcuts**:
  - W/↑: Forward
  - S/↓: Backward
  - A/←: Left
  - D/→: Right
  - Space: Stop
- **Visual Feedback**: Button highlight on press
- **Priority**: Critical

**FR-4.4 Path Visualization**
- **Description**: The UI shall display robot path on 2D canvas
- **Canvas Size**: 500×500px (auto-scaling)
- **Elements**:
  - Grid background (50×50px)
  - Center cross (origin marker)
  - Start point (green dot)
  - Current position (blue dot)
  - Direction arrow (yellow)
  - Path trail (blue line)
- **History**: Last 500 position points
- **Auto-scaling**: Viewport adjusts to path bounds
- **Priority**: High

**FR-4.5 Live Logs Panel**
- **Description**: The UI shall display timestamped event logs
- **Features**:
  - Scrollable container (max 450px height)
  - Auto-scroll to latest entry
  - Color-coded messages (green/red/yellow/blue/white)
  - Timestamp for each entry
- **Capacity**: Keep last 100 log entries
- **Priority**: Medium

**FR-4.6 Responsive Layout**
- **Description**: The UI shall adapt to different screen sizes
- **Desktop (≥1024px)**: 3-column grid (4-5-3 ratio)
- **Tablet (768-1023px)**: 2-column grid
- **Mobile (<768px)**: Single column stack
- **Priority**: Medium

### FR-5: System Management

**FR-5.1 Health Check Endpoint**
- **Description**: The backend shall provide a health check endpoint
- **Endpoint**: `GET /status`
- **Response**: JSON with status, connections, uptime
- **Example**:
  ```json
  {
    "status": "ok",
    "connections": 2,
    "uptime": 123.45
  }
  ```
- **Priority**: Low

**FR-5.2 Graceful Shutdown**
- **Description**: All components shall shut down cleanly
- **Robot**: Close WebSocket, release resources
- **Backend**: Close all connections, stop server
- **Frontend**: Disconnect WebSocket, cleanup state
- **Priority**: Medium

**FR-5.3 Error Logging**
- **Description**: The system shall log errors to console
- **Robot**: Python print statements
- **Backend**: console.log/console.error
- **Frontend**: console.log/console.error
- **Format**: Timestamp + component + message
- **Priority**: Low

---

## 3. Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1 Telemetry Latency**
- **Requirement**: End-to-end telemetry latency < 100ms
- **Measurement**: Time from robot send to frontend display
- **Target**: 50-80ms typical
- **Priority**: High

**NFR-1.2 Command Response Time**
- **Requirement**: Robot responds to commands within 200ms
- **Measurement**: Time from button press to robot movement
- **Target**: 100-150ms typical
- **Priority**: High

**NFR-1.3 Frontend Rendering**
- **Requirement**: UI maintains 60 FPS during updates
- **Measurement**: Browser performance profiler
- **Target**: No frame drops on telemetry updates
- **Priority**: Medium

**NFR-1.4 WebSocket Message Throughput**
- **Requirement**: Backend handles ≥ 100 messages/second
- **Measurement**: Load testing with multiple clients
- **Target**: 200+ messages/second
- **Priority**: Medium

**NFR-1.5 Memory Usage**
- **Requirement**: 
  - Backend: < 100 MB RAM
  - Frontend: < 200 MB RAM
  - Robot Controller: < 50 MB RAM
- **Measurement**: Task Manager / Process Monitor
- **Priority**: Low

**NFR-1.6 CPU Usage**
- **Requirement**:
  - Backend: < 10% CPU (idle), < 20% (active)
  - Frontend: < 15% CPU
  - Webots: < 30% CPU
- **Measurement**: Task Manager / Process Monitor
- **Priority**: Low

### NFR-2: Reliability

**NFR-2.1 Uptime**
- **Requirement**: Backend uptime > 99% during demo
- **Measurement**: Continuous operation time
- **Target**: No crashes during 1-hour demo
- **Priority**: High

**NFR-2.2 Connection Resilience**
- **Requirement**: Auto-reconnect on network interruption
- **Behavior**: Automatic retry every 2 seconds
- **Recovery Time**: < 5 seconds after network restored
- **Priority**: High

**NFR-2.3 Error Recovery**
- **Requirement**: System continues operating after non-critical errors
- **Behavior**: Log error, continue execution
- **No Crash**: Invalid messages, connection drops
- **Priority**: High

**NFR-2.4 Data Consistency**
- **Requirement**: Telemetry data remains consistent across clients
- **Behavior**: All connected frontends see same data
- **Tolerance**: ±1 message delay acceptable
- **Priority**: Medium

### NFR-3: Usability

**NFR-3.1 Learning Curve**
- **Requirement**: New users operate system within 5 minutes
- **Measurement**: User testing with no prior knowledge
- **Target**: 2-3 minutes typical
- **Priority**: Medium

**NFR-3.2 Visual Clarity**
- **Requirement**: UI elements clearly labeled and color-coded
- **Contrast Ratio**: ≥ 4.5:1 for text (WCAG AA)
- **Font Size**: ≥ 14px for body text
- **Priority**: Medium

**NFR-3.3 Control Responsiveness**
- **Requirement**: Visual feedback on button press < 50ms
- **Measurement**: CSS transition time
- **Target**: Immediate visual response
- **Priority**: High

**NFR-3.4 Error Messages**
- **Requirement**: Clear, actionable error messages
- **Format**: "Error: [description] - [suggested action]"
- **Example**: "Connection failed - Check backend is running"
- **Priority**: Medium

### NFR-4: Maintainability

**NFR-4.1 Code Documentation**
- **Requirement**: All functions documented with comments
- **Format**: JSDoc for JavaScript, Docstrings for Python
- **Coverage**: ≥ 80% of functions
- **Priority**: Medium

**NFR-4.2 Code Style**
- **Requirement**: Consistent code formatting
- **JavaScript**: ES6+ syntax, semicolons, 2-space indent
- **Python**: PEP 8 compliance, 4-space indent
- **React**: Functional components, hooks
- **Priority**: Low

**NFR-4.3 Modular Architecture**
- **Requirement**: Clear separation of concerns
- **Structure**: 3-tier (Simulation, Backend, Frontend)
- **Coupling**: Loose coupling via WebSocket interface
- **Priority**: High

**NFR-4.4 Configuration Management**
- **Requirement**: Key parameters externally configurable
- **Examples**: WebSocket URL, port, telemetry interval
- **Method**: Constants at top of files
- **Priority**: Medium

### NFR-5: Scalability

**NFR-5.1 Multiple Clients**
- **Requirement**: Support ≥ 10 simultaneous frontend clients
- **Measurement**: Connect 10 browsers, verify all receive telemetry
- **Target**: 20+ clients
- **Priority**: Medium

**NFR-5.2 Path History Limit**
- **Requirement**: Frontend stores last 500 path points
- **Behavior**: Auto-trim older points
- **Memory Impact**: ~40 KB per client
- **Priority**: Low

**NFR-5.3 Log Capacity**
- **Requirement**: Keep last 100 log entries
- **Behavior**: FIFO queue, oldest logs removed
- **Memory Impact**: ~10 KB per client
- **Priority**: Low

### NFR-6: Portability

**NFR-6.1 Operating System Support**
- **Requirement**: Run on Windows, macOS, Linux
- **Tested On**: Windows 11 (primary)
- **Cross-Platform**: Node.js, Python, Browser
- **Priority**: Medium

**NFR-6.2 Browser Compatibility**
- **Requirement**: Support modern browsers
- **Supported**: Chrome 90+, Edge 90+, Firefox 88+, Safari 14+
- **WebSocket**: Native browser API (no polyfills)
- **Priority**: High

**NFR-6.3 Webots Version**
- **Requirement**: Compatible with Webots R2023b+
- **Tested On**: Webots R2025a
- **API**: Supervisor API (stable)
- **Priority**: High

### NFR-7: Security

**NFR-7.1 Local Network Only**
- **Requirement**: System designed for localhost communication
- **Scope**: No authentication/encryption required for demo
- **Production Note**: Requires HTTPS/WSS for internet deployment
- **Priority**: Low (demo)

**NFR-7.2 Input Validation**
- **Requirement**: Validate command types before execution
- **Valid Commands**: forward, backward, left, right, stop
- **Invalid Handling**: Ignore, log warning
- **Priority**: Medium

**NFR-7.3 No Data Persistence**
- **Requirement**: No sensitive data stored to disk
- **Behavior**: All data in memory only
- **Privacy**: No telemetry logging to files
- **Priority**: Low

### NFR-8: Standards Compliance

**NFR-8.1 WebSocket Protocol**
- **Requirement**: RFC 6455 compliant
- **Library**: `ws` (Node.js), native browser API
- **Priority**: High

**NFR-8.2 JSON Format**
- **Requirement**: All messages use valid JSON
- **Validation**: JSON.parse/JSON.stringify
- **Priority**: High

**NFR-8.3 HTTP REST**
- **Requirement**: Status endpoint follows REST principles
- **Method**: GET for read-only operations
- **Priority**: Low

---

## 4. Constraints

### 4.1 Technical Constraints
- Must use Webots simulation platform
- WebSocket for real-time communication
- React for frontend framework
- Node.js for backend runtime

### 4.2 Time Constraints
- Development time: Hackathon duration
- Demo preparation: 10 minutes
- Demo execution: 10 minutes

### 4.3 Resource Constraints
- Single developer/team
- Local development environment
- No cloud infrastructure budget

---

## 5. Requirements Traceability Matrix

| Requirement ID | Category | Priority | Implementation Status | Test ID |
|---------------|----------|----------|----------------------|---------|
| FR-1.1 | Telemetry | High | ✅ Complete | T-001 |
| FR-1.2 | Telemetry | Medium | ✅ Complete | T-002 |
| FR-1.3 | Telemetry | High | ✅ Complete | T-003 |
| FR-1.4 | Telemetry | Medium | ✅ Complete | T-004 |
| FR-2.1 | Control | High | ✅ Complete | T-005 |
| FR-2.2 | Control | High | ✅ Complete | T-006 |
| FR-2.3 | Control | High | ✅ Complete | T-007 |
| FR-2.4 | Control | High | ✅ Complete | T-008 |
| FR-2.5 | Control | High | ✅ Complete | T-009 |
| FR-2.6 | Control | High | ✅ Complete | T-010 |
| FR-3.1 | Communication | Critical | ✅ Complete | T-011 |
| FR-3.2 | Communication | Critical | ✅ Complete | T-012 |
| FR-3.3 | Communication | High | ✅ Complete | T-013 |
| FR-3.4 | Communication | Medium | ✅ Complete | T-014 |
| FR-4.1 | UI | High | ✅ Complete | T-015 |
| FR-4.2 | UI | High | ✅ Complete | T-016 |
| FR-4.3 | UI | Critical | ✅ Complete | T-017 |
| FR-4.4 | UI | High | ✅ Complete | T-018 |
| FR-4.5 | UI | Medium | ✅ Complete | T-019 |
| FR-4.6 | UI | Medium | ✅ Complete | T-020 |
| FR-5.1 | Management | Low | ✅ Complete | T-021 |
| FR-5.2 | Management | Medium | ✅ Complete | T-022 |
| FR-5.3 | Management | Low | ✅ Complete | T-023 |

---

## 6. Acceptance Criteria

### 6.1 Functional Acceptance
- [ ] Robot moves in all 4 directions correctly
- [ ] Telemetry updates in real-time (< 300ms)
- [ ] Commands execute within 200ms
- [ ] Path visualization displays accurate trail
- [ ] WebSocket auto-reconnects on disconnect
- [ ] All UI components responsive and functional

### 6.2 Performance Acceptance
- [ ] End-to-end latency < 100ms
- [ ] UI maintains 60 FPS
- [ ] Backend handles 10+ simultaneous clients
- [ ] No memory leaks during 1-hour operation

### 6.3 Quality Acceptance
- [ ] Zero crashes during demo
- [ ] Clear error messages on failures
- [ ] Code documented (≥80% coverage)
- [ ] Responsive layout works on mobile/tablet/desktop

---

**Document Version**: 1.0  
**Last Updated**: December 1, 2025  
**Status**: Approved for Implementation  
**Next Review**: Post-Hackathon
