# Function Flow Diagrams - S4 System

## Fitfest25 Hackathon

---

## 📊 1. System Startup Flow

```mermaid
sequenceDiagram
    participant User
    participant Backend
    participant Frontend
    participant Webots
    participant Robot

    User->>Backend: npm start
    activate Backend
    Backend->>Backend: Initialize WebSocket Server (port 3000)
    Backend-->>User: ✅ Server running on ws://localhost:3000

    User->>Frontend: npm run dev
    activate Frontend
    Frontend->>Frontend: Start Vite dev server
    Frontend-->>User: ✅ Frontend running on http://localhost:5173

    User->>Webots: Launch robot_world_humanoid.wbt
    activate Webots
    Webots->>Robot: Initialize robot controller
    activate Robot
    Robot->>Robot: Load Python controller
    Robot->>Backend: Connect WebSocket to ws://localhost:3000
    Backend-->>Robot: ✅ Connection accepted
    Robot-->>Webots: ✅ Controller initialized

    Frontend->>Backend: Connect WebSocket
    Backend-->>Frontend: ✅ Connection accepted
    Frontend-->>User: ✅ Dashboard ready

    deactivate Backend
    deactivate Frontend
    deactivate Webots
    deactivate Robot
```

---

## 📡 2. Telemetry Flow (Robot → Frontend)

```mermaid
flowchart LR
    A[Robot Controller] -->|Every 200-300ms| B{Get Robot State}
    B --> C[Read GPS Position]
    B --> D[Read Compass Orientation]
    B --> E[Calculate Speed]
    B --> F[Check Battery Level]
    
    C --> G[Build Telemetry JSON]
    D --> G
    E --> G
    F --> G
    
    G --> H{WebSocket<br/>Connected?}
    H -->|Yes| I[Send to Backend<br/>ws://localhost:3000]
    H -->|No| J[Log Error]
    
    I --> K[Backend WS Router]
    K --> L{Broadcast to<br/>All Clients}
    L --> M[Frontend WebSocket Client]
    
    M --> N[Update React State]
    N --> O[Render Telemetry Panel]
    N --> P[Update Path View]
    N --> Q[Add to Logs]
    
    J --> R[Retry Connection]
    R --> H
```

---

## 🎮 3. Command Flow (Frontend → Robot)

```mermaid
flowchart TD
    A[User Action] -->|Click Button| B{Control Panel}
    A -->|Press Key| B
    
    B --> C{Keyboard Enabled?}
    C -->|Yes| D[Capture Command]
    C -->|No| E[Disabled]
    
    D --> F{Valid Command?}
    F -->|forward/backward<br/>left/right/stop| G[Build Command JSON]
    F -->|Invalid| H[Ignore]
    
    G --> I[Send to Backend<br/>via WebSocket]
    
    I --> J[Backend WS Router]
    J --> K{Route Command}
    K -->|Type: cmd| L[Forward to Robot]
    
    L --> M[Robot Controller]
    M --> N{Parse Command}
    
    N -->|forward| O[Move Forward<br/>x += cos θ × speed<br/>y += sin θ × speed]
    N -->|backward| P[Move Backward<br/>x -= cos θ × speed<br/>y -= sin θ × speed]
    N -->|left| Q[Turn Left 90°<br/>θ += π/2<br/>then move forward]
    N -->|right| R[Turn Right 90°<br/>θ -= π/2<br/>then move forward]
    N -->|stop| S[Stop Movement]
    
    O --> T[Apply Movement]
    P --> T
    Q --> T
    R --> T
    S --> T
    
    T --> U[Update Robot Position<br/>in Webots]
    U --> V[Send Telemetry Update]
```

---

## 🔄 4. Command Debouncing Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: last_executed_command = "stop"
    
    Idle --> CheckCommand: Receive Command
    
    CheckCommand --> ForwardContinuous: cmd == "forward"
    CheckCommand --> BackwardContinuous: cmd == "backward"
    CheckCommand --> CheckLeft: cmd == "left"
    CheckCommand --> CheckRight: cmd == "right"
    CheckCommand --> Idle: cmd == "stop"
    
    CheckLeft --> TurnLeft: last_executed_command != "left"
    CheckLeft --> ForwardOnly: last_executed_command == "left"
    
    CheckRight --> TurnRight: last_executed_command != "right"
    CheckRight --> ForwardOnly: last_executed_command == "right"
    
    TurnLeft --> ForwardAfterTurn: θ += π/2<br/>last_executed_command = "left"
    TurnRight --> ForwardAfterTurn: θ -= π/2<br/>last_executed_command = "right"
    
    ForwardContinuous --> CheckCommand: last_executed_command = "forward"
    BackwardContinuous --> CheckCommand: last_executed_command = "backward"
    ForwardOnly --> CheckCommand: Continue forward movement
    ForwardAfterTurn --> CheckCommand: Move forward in new direction
    
    CheckCommand --> [*]: Controller cycle complete
```

---

## 🔌 5. WebSocket Connection Management

```mermaid
flowchart TD
    A[Application Start] --> B[WebSocket Client Init]
    
    B --> C{Attempt Connection<br/>ws://localhost:3000}
    
    C -->|Success| D[Connection Established]
    C -->|Fail| E[Connection Failed]
    
    D --> F[Set Status: connected]
    D --> G[Register Event Listeners]
    
    G --> H[onMessage]
    G --> I[onError]
    G --> J[onClose]
    
    H --> K{Parse Message Type}
    K -->|telemetry| L[Update Dashboard]
    K -->|ack| M[Show Confirmation]
    K -->|connected| N[Log Success]
    
    I --> O[Handle Error]
    O --> P[Set Status: error]
    P --> Q{Retry?}
    
    J --> R[Handle Disconnection]
    R --> S[Set Status: disconnected]
    S --> Q
    
    Q -->|Yes| T[Wait 2 seconds]
    Q -->|No| U[Stop]
    
    T --> C
    
    E --> V[Set Status: disconnected]
    V --> W{Auto Reconnect?}
    W -->|Yes| T
    W -->|No| U
```

---

## 🧮 6. Movement Kinematics Flow

```mermaid
flowchart TB
    A[Receive Movement Command] --> B{Get Current State}
    
    B --> C[Read Position x, y]
    B --> D[Read Orientation θ]
    
    C --> E{Command Type}
    D --> E
    
    E -->|forward| F[Calculate Forward<br/>new_x = x + cos θ × 0.02<br/>new_y = y + sin θ × 0.02<br/>new_θ = θ]
    
    E -->|backward| G[Calculate Backward<br/>new_x = x - cos θ × 0.02<br/>new_y = y - sin θ × 0.02<br/>new_θ = θ]
    
    E -->|left| H{First Left Press?}
    H -->|Yes| I[Turn 90° Left<br/>new_θ = θ + π/2<br/>then calculate forward]
    H -->|No| J[Just Forward<br/>new_x = x + cos θ × 0.02<br/>new_y = y + sin θ × 0.02]
    
    E -->|right| K{First Right Press?}
    K -->|Yes| L[Turn 90° Right<br/>new_θ = θ - π/2<br/>then calculate forward]
    K -->|No| M[Just Forward<br/>new_x = x + cos θ × 0.02<br/>new_y = y + sin θ × 0.02]
    
    F --> N[Apply New Position]
    G --> N
    I --> N
    J --> N
    L --> N
    M --> N
    
    N --> O[robot.translation.setSFVec3f]
    N --> P[robot.rotation.setSFRotation]
    
    O --> Q[Update Complete]
    P --> Q
    
    Q --> R[Send Telemetry Update]
```

---

## 🖼️ 7. Frontend Rendering Flow

```mermaid
flowchart LR
    A[WebSocket Message] --> B{Message Handler}
    
    B --> C[Update React State]
    C --> D[setTelemetry]
    C --> E[setPathHistory]
    C --> F[setLogs]
    
    D --> G[Render Telemetry Panel]
    G --> H[Position X, Y, θ]
    G --> I[Speed m/s]
    G --> J[Battery %]
    G --> K[Health Status]
    
    E --> L[Render Path View]
    L --> M[Calculate Bounds]
    M --> N[Transform Coordinates]
    N --> O[Draw SVG Path]
    O --> P[Draw Robot Icon]
    P --> Q[Draw Direction Arrow]
    
    F --> R[Render Logs Panel]
    R --> S[Add New Log Entry]
    S --> T[Auto-scroll to Bottom]
    T --> U[Apply Color Coding]
    
    U --> V[UI Update Complete]
    Q --> V
    K --> V
```

---

## 🔋 8. Battery Drain Simulation

```mermaid
flowchart TD
    A[Controller Cycle Start] --> B{Get Current Command}
    
    B --> C{Command Active?}
    
    C -->|forward/backward| D[Drain: 0.002% per cycle]
    C -->|left/right| E[Drain: 0.003% per cycle<br/>turning + movement]
    C -->|stop| F[Drain: 0.0005% per cycle<br/>idle power]
    
    D --> G[Calculate New Battery]
    E --> G
    F --> G
    
    G --> H{Battery Level}
    H -->|> 0%| I[Update battery_level]
    H -->|<= 0%| J[Set battery_level = 0]
    
    I --> K[Include in Telemetry]
    J --> L[Robot Low Battery State]
    
    K --> M[Send to Frontend]
    L --> M
    
    M --> N{Frontend Display}
    N -->|> 60%| O[Green Progress Bar]
    N -->|30-60%| P[Yellow Progress Bar]
    N -->|< 30%| Q[Red Progress Bar + Warning]
```

---

## 🎯 9. Path Visualization Algorithm

```mermaid
flowchart TB
    A[Receive Position Update] --> B[Add to pathHistory Array]
    
    B --> C{Array Length > 500?}
    C -->|Yes| D[Slice to keep last 500 points]
    C -->|No| E[Keep All Points]
    
    D --> F[Calculate Bounds]
    E --> F
    
    F --> G[Find min/max X and Y]
    G --> H[Add 10% padding]
    
    H --> I[Transform World → SVG Coordinates]
    I --> J[Scale to 500x500 canvas]
    
    J --> K[Generate SVG Path String]
    K --> L["M x1 y1 L x2 y2 L x3 y3..."]
    
    L --> M[Render Components]
    M --> N[Draw Background Grid]
    M --> O[Draw Center Cross]
    M --> P[Draw Origin Marker]
    M --> Q[Draw Path Trail]
    M --> R[Draw Start Point Green]
    M --> S[Draw Current Robot Blue]
    M --> T[Draw Direction Arrow Yellow]
    
    T --> U[Display Stats]
    U --> V[Path Points Count]
    U --> W[Bounds X Min/Max]
    U --> X[Bounds Y Min/Max]
```

---

## 📦 10. System Shutdown Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Robot
    participant Webots

    User->>Frontend: Close Browser Tab
    Frontend->>Backend: WebSocket Close
    Backend->>Backend: Remove Client from List
    Backend-->>User: Frontend disconnected

    User->>Backend: Ctrl+C (Stop Server)
    Backend->>Robot: WebSocket Close
    Backend->>Backend: Clean up connections
    Backend-->>User: ✅ Server stopped

    User->>Webots: Close Simulation
    Webots->>Robot: Stop Controller
    Robot->>Robot: Clean up resources
    Robot->>Backend: Disconnect WebSocket (if still running)
    Robot-->>Webots: ✅ Controller stopped
    Webots-->>User: ✅ Simulation closed

    Note over User,Webots: All components shut down cleanly
```

---

**Last Updated**: December 1, 2025  
**Project**: S4 Remote Robot Management System  
**Event**: Fitfest25 Hackathon
