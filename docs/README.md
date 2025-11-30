# 📚 Documentation - S4 Remote Robot Management System

## Overview

This directory contains comprehensive documentation for the S4 system, organized into two main categories:

---

## 📋 Requirements

System specifications, setup instructions, and testing procedures.

### [system-requirements.md](requirements/system-requirements.md)
**Purpose**: Hardware and software requirements  
**Contents**:
- Software versions (Webots, Python, Node.js)
- Hardware specifications (CPU, RAM, Storage)
- Network requirements and ports
- Dependencies and libraries
- OS compatibility matrix
- Performance expectations

**Use when**: Setting up a new development environment

### [software-requirements.md](requirements/software-requirements.md)
**Purpose**: Functional and non-functional requirements (SRS)  
**Contents**:
- Functional Requirements (FR-1 to FR-5)
  - Telemetry streaming, Robot control, WebSocket communication
  - Frontend dashboard, System management
- Non-Functional Requirements (NFR-1 to NFR-8)
  - Performance, Reliability, Usability
  - Maintainability, Scalability, Portability
  - Security, Standards compliance
- Requirements traceability matrix
- Acceptance criteria

**Use when**: Understanding system specifications and constraints

### [setup-guide.md](requirements/setup-guide.md)
**Purpose**: Step-by-step installation instructions  
**Contents**:
- Prerequisites checklist
- Installation procedures for all components
- Configuration steps
- Verification commands
- Common setup issues

**Use when**: Installing the system for the first time

### [test-procedure.md](requirements/test-procedure.md)
**Purpose**: Comprehensive testing checklist  
**Contents**:
- Pre-test checklist
- System startup procedure
- Connection testing
- Control system testing
- Telemetry validation
- Performance testing
- Troubleshooting tests

**Use when**: Validating system functionality before demo

---

## 🎨 Design

System architecture, diagrams, and technical specifications.

### [architecture.puml](design/architecture.puml)
**Type**: PlantUML Component Diagram  
**Purpose**: System architecture and block diagrams  
**Contents**:
- Webots simulation environment components
- Backend server components (Express, WebSocket, Router)
- Frontend React application components
- WebSocket connections and data flows
- Component interactions and dependencies

**Use when**: Understanding overall system design

### [sequence-telemetry.puml](design/sequence-telemetry.puml)
**Type**: PlantUML Sequence Diagram  
**Purpose**: Telemetry streaming workflow  
**Contents**:
- Robot sensor reading flow
- Telemetry message building
- WebSocket broadcasting
- Frontend UI updates
- Error handling and reconnection

**Use when**: Understanding telemetry data flow

### [sequence-command.puml](design/sequence-command.puml)
**Type**: PlantUML Sequence Diagram  
**Purpose**: Command execution workflow  
**Contents**:
- User interaction (button/keyboard)
- WebSocket command routing
- Robot controller command processing
- Movement kinematics application
- Left/Right turn debouncing logic

**Use when**: Understanding robot control flow

### [state-machine-debouncing.puml](design/state-machine-debouncing.puml)
**Type**: PlantUML State Machine Diagram  
**Purpose**: Command debouncing state machine  
**Contents**:
- Idle, Forward, Backward states
- Left/Right turn decision logic
- Command execution conditions
- State transitions and guards

**Use when**: Understanding turn debouncing algorithm

### [state-machine-websocket.puml](design/state-machine-websocket.puml)
**Type**: PlantUML State Machine Diagram  
**Purpose**: WebSocket connection lifecycle  
**Contents**:
- Disconnected, Connecting, Connected, Error states
- Auto-reconnection logic
- State transitions and events
- Error handling and recovery

**Use when**: Understanding connection management

### [control-flow-robot.puml](design/control-flow-robot.puml)
**Type**: PlantUML Activity Diagram  
**Purpose**: Robot controller control flow  
**Contents**:
- Initialization sequence
- Main control loop
- Command processing logic
- Movement calculations
- Telemetry generation

**Use when**: Understanding robot controller implementation

### [data-flow.puml](design/data-flow.puml)
**Type**: PlantUML Data Flow Diagram (DFD)  
**Purpose**: Data movement through system  
**Contents**:
- Level 0: Context diagram
- Level 1: Detailed processes (7) and data stores (5)
- Data flows between components
- Command queue, telemetry history, path history

**Use when**: Understanding data architecture

### [sequence-startup.puml](design/sequence-startup.puml)
**Type**: PlantUML Sequence Diagram  
**Purpose**: System initialization sequence  
**Contents**:
- Backend startup (npm start)
- Frontend startup (npm run dev)
- Webots initialization
- Robot controller connection
- Complete system ready state

**Use when**: Understanding startup procedure

### [message-protocol.md](design/message-protocol.md)
**Purpose**: WebSocket message specifications  
**Contents**:
- Message format structure
- Telemetry message schema
- Command message schema
- Acknowledgment messages
- Error messages
- Example message flows

**Use when**: Implementing or debugging communication

### [README.md](design/README.md)
**Purpose**: Design documentation index  
**Contents**:
- Complete diagram listing
- Usage instructions for PlantUML
- Diagram viewing options
- Troubleshooting guide

**Use when**: Navigating design documentation

---

## 📖 Quick Reference

### For Developers

**Setting up the system?**  
→ Start with [requirements/setup-guide.md](requirements/setup-guide.md)

**Understanding the architecture?**  
→ Read [design/architecture.md](design/architecture.md)

**Debugging message flows?**  
→ Check [design/message-protocol.md](design/message-protocol.md)

**Tracing a specific function?**  
→ See [design/function-flow.md](design/function-flow.md)

### For Testers

**Preparing for testing?**  
→ Follow [requirements/test-procedure.md](requirements/test-procedure.md)

**System not working?**  
→ Check [requirements/system-requirements.md](requirements/system-requirements.md) for compatibility

### For Judges/Reviewers

**Understanding the project?**  
→ Start with main [../README.md](../README.md), then [design/architecture.md](design/architecture.md)

**Evaluating technical depth?**  
→ Review [design/function-flow.md](design/function-flow.md) for algorithm details

**Checking completeness?**  
→ See [requirements/test-procedure.md](requirements/test-procedure.md) for validation coverage

---

## 📂 Document Organization

```
docs/
├── README.md (this file)
│
├── requirements/
│   ├── system-requirements.md    # What you need (HW/SW)
│   ├── software-requirements.md  # Functional & non-functional requirements (SRS)
│   ├── setup-guide.md            # How to install
│   └── test-procedure.md         # How to validate
│
└── design/
    ├── README.md                          # Design docs index
    ├── architecture.puml                  # System architecture (PlantUML)
    ├── sequence-telemetry.puml           # Telemetry flow (PlantUML)
    ├── sequence-command.puml             # Command flow (PlantUML)
    ├── sequence-startup.puml             # System startup (PlantUML)
    ├── state-machine-debouncing.puml     # Command debouncing (PlantUML)
    ├── state-machine-websocket.puml      # WebSocket lifecycle (PlantUML)
    ├── control-flow-robot.puml           # Robot controller flow (PlantUML)
    ├── data-flow.puml                    # Data flow diagram (PlantUML)
    └── message-protocol.md                # WebSocket specs
```

---

## 🔍 Documentation Standards

### Mermaid Diagrams
All architecture and flow diagrams use Mermaid notation for:
- Sequence diagrams (interactions)
- Flowcharts (logic flows)
- State diagrams (state machines)
- Block diagrams (system structure)

### Code Examples
All code snippets include:
- Language identifier
- Context/purpose comment
- Expected output (where applicable)

### Cross-References
Documents link to related files for easy navigation.

---

## 📝 Maintenance

### Last Updated
December 1, 2025

### Version
1.0 - Fitfest25 Hackathon Submission

### Contributors
S4 Remote Robot Management System Team

---

## 🆘 Need Help?

If you can't find what you're looking for:
1. Check the main [README.md](../README.md) in the project root
2. Review component-specific READMEs:
   - [webots_project/README.md](../webots_project/README.md)
   - [backend/README.md](../backend/README.md)
   - [frontend/README.md](../frontend/README.md)
3. Search for keywords using your IDE/editor

---

**Fitfest25 Hackathon** | **S4 Remote Robot Management System**
