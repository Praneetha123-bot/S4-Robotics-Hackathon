# WebSocket Message Protocol - S4 System

## 📡 Message Format Overview

All messages are JSON-formatted strings sent over WebSocket connections.

### Base Structure

```json
{
  "type": "message_type",
  ...other fields
}
```

The `type` field determines how the message is processed and routed.

---

## 📤 Message Types

### 1. Telemetry (Robot → Backend → Frontend)

Sent by: **Webots Robot Controller**  
Received by: **Frontend Dashboard**  
Frequency: **Every 200-300ms** (configurable)

#### Format

```json
{
  "type": "telemetry",
  "pose": {
    "x": 1.234,
    "y": 0.567,
    "theta": 0.785
  },
  "speed": 0.312,
  "battery": 92.5,
  "cycle": 103,
  "timestamp": 1701234567890
}
```

#### Field Descriptions

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `type` | string | - | Always "telemetry" |
| `pose.x` | float | meters | Robot X position in world frame |
| `pose.y` | float | meters | Robot Y position in world frame |
| `pose.theta` | float | radians | Robot heading angle (-π to π) |
| `speed` | float | m/s | Linear speed magnitude |
| `battery` | float | % | Battery level (0-100) |
| `cycle` | integer | - | Telemetry message counter |
| `timestamp` | long | ms | Unix timestamp in milliseconds |

#### Example Values

```json
{
  "type": "telemetry",
  "pose": {
    "x": 2.456,
    "y": -1.123,
    "theta": 1.571
  },
  "speed": 0.285,
  "battery": 87.3,
  "cycle": 523,
  "timestamp": 1732896000000
}
```

#### Value Ranges

- `pose.x`: -∞ to +∞ (typically -10 to +10 in demo world)
- `pose.y`: -∞ to +∞ (typically -10 to +10 in demo world)
- `pose.theta`: -π to +π (-3.14159 to +3.14159)
- `speed`: 0.0 to ~0.5 m/s
- `battery`: 0.0 to 100.0
- `cycle`: 0 to ∞
- `timestamp`: Unix epoch in milliseconds

---

### 2. Command (Frontend → Backend → Robot)

Sent by: **Frontend Dashboard**  
Received by: **Webots Robot Controller**  
Frequency: **On user action**

#### Format

```json
{
  "type": "cmd",
  "cmd": "forward"
}
```

#### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always "cmd" |
| `cmd` | string | Command name (see below) |

#### Valid Commands

| Command | Action | Movement Type | Result |
|---------|--------|---------------|--------|
| `forward` | Move straight forward | Linear (in facing direction) | 0.02 m/step |
| `backward` | Move straight backward | Linear (opposite facing) | 0.02 m/step |
| `left` | Turn 90° left + move forward | Instant 90° turn + Linear | Robot faces left and moves |
| `right` | Turn 90° right + move forward | Instant 90° turn + Linear | Robot faces right and moves |
| `stop` | Stop all movement | None | 0 |

#### Examples

```json
// Move forward
{
  "type": "cmd",
  "cmd": "forward"
}

// Turn left
{
  "type": "cmd",
  "cmd": "left"
}

// Emergency stop
{
  "type": "cmd",
  "cmd": "stop"
}
```

---

### 3. Connection (Backend → Client)

Sent by: **Backend Server**  
Received by: **Any Client (on connection)**  
Frequency: **Once on connection**

#### Format

```json
{
  "type": "connected",
  "clientId": "client_1",
  "message": "Connected to S4 Backend Server"
}
```

#### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always "connected" |
| `clientId` | string | Unique client identifier |
| `message` | string | Welcome message |

---

### 4. Acknowledgment (Backend → Frontend)

Sent by: **Backend Server**  
Received by: **Frontend Dashboard**  
Frequency: **After each command**

#### Format

```json
{
  "type": "ack",
  "originalCommand": "forward",
  "forwarded": 1
}
```

#### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always "ack" |
| `originalCommand` | string | The command that was acknowledged |
| `forwarded` | integer | Number of robots that received the command |

---

### 5. Error (Backend → Client)

Sent by: **Backend Server**  
Received by: **Any Client**  
Frequency: **On error**

#### Format

```json
{
  "type": "error",
  "message": "Invalid message format"
}
```

#### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always "error" |
| `message` | string | Error description |

---

## 🔄 Message Flow Examples

### Example 1: Robot Sends Telemetry

```
Step 1: Robot reads sensors
{
  GPS: x=1.2, y=0.4, z=0.08
  Compass: north=[0.866, 0, 0.5]
  Motors: left=2.0, right=2.0
  Battery: 95.2%
}

Step 2: Robot creates telemetry message
{
  "type": "telemetry",
  "pose": {"x": 1.2, "y": 0.4, "theta": 0.524},
  "speed": 0.3,
  "battery": 95.2,
  "cycle": 42,
  "timestamp": 1732896042000
}

Step 3: Robot sends via WebSocket
ws.send(JSON.stringify(telemetry))

Step 4: Backend receives and broadcasts
- Logs telemetry
- Stores in history
- Forwards to all frontend clients

Step 5: Frontend receives and displays
- Updates telemetry panel
- Adds to path visualization
- Logs event
```

---

### Example 2: User Sends Command

```
Step 1: User clicks "Forward" button

Step 2: Frontend creates command message
{
  "type": "cmd",
  "cmd": "forward"
}

Step 3: Frontend sends via WebSocket
wsClient.sendCommand('forward')

Step 4: Backend receives
- Logs command
- Routes to robot clients

Step 5: Backend sends to robot
{
  "type": "cmd",
  "cmd": "forward"
}

Step 6: Backend sends acknowledgment to frontend
{
  "type": "ack",
  "originalCommand": "forward",
  "forwarded": 1
}

Step 7: Robot receives command
- Parses JSON
- Sets motor velocities: left=2.0, right=2.0
- Robot moves forward

Step 8: Robot sends updated telemetry
(see Example 1)
```

---

## 📊 Message Statistics

### Typical Message Rates

| Message Type | Rate | Bandwidth |
|--------------|------|-----------|
| Telemetry | 4-5 Hz | ~400 bytes/s |
| Command | On-demand | ~50 bytes/event |
| Acknowledgment | On-demand | ~60 bytes/event |
| Connection | Once | ~80 bytes |

### Total Bandwidth Estimate

- **1 robot + 1 frontend**: ~1 KB/s
- **1 robot + 10 frontends**: ~5 KB/s
- **10 robots + 10 frontends**: ~50 KB/s

Negligible bandwidth usage.

---

## 🔧 Implementation Details

### Python (Webots Controller)

#### Sending Telemetry

```python
import json
import websocket

# Create telemetry
telemetry = {
    "type": "telemetry",
    "pose": {"x": x, "y": y, "theta": theta},
    "speed": speed,
    "battery": battery,
    "cycle": cycle,
    "timestamp": int(time.time() * 1000)
}

# Send via WebSocket
ws.send(json.dumps(telemetry))
```

#### Receiving Commands

```python
# Receive message
message = ws.recv()
data = json.loads(message)

# Process command
if data.get('type') == 'cmd':
    cmd = data.get('cmd')
    if cmd == 'forward':
        left_motor.setVelocity(2.0)
        right_motor.setVelocity(2.0)
```

---

### JavaScript (Frontend)

#### Receiving Telemetry

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'telemetry') {
    // Update UI
    setTelemetry(data);
    
    // Add to path
    addPathPoint(data.pose);
    
    // Log
    console.log('Telemetry:', data);
  }
};
```

#### Sending Commands

```javascript
function sendCommand(cmd) {
  const message = {
    type: 'cmd',
    cmd: cmd
  };
  
  ws.send(JSON.stringify(message));
}

// Usage
sendCommand('forward');
```

---

### Node.js (Backend)

#### Routing Messages

```javascript
ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  switch (message.type) {
    case 'telemetry':
      // Forward to frontend clients
      broadcastToFrontends(message);
      break;
    
    case 'cmd':
      // Forward to robot clients
      forwardToRobots(message);
      // Send acknowledgment
      sendAck(ws, message.cmd);
      break;
  }
});
```

---

## ✅ Message Validation

### Frontend Validation

Before sending command:

```javascript
const VALID_COMMANDS = ['forward', 'backward', 'left', 'right', 'stop'];

function sendCommand(cmd) {
  // Validate
  if (!VALID_COMMANDS.includes(cmd)) {
    console.error('Invalid command:', cmd);
    return;
  }
  
  // Check connection
  if (ws.readyState !== WebSocket.OPEN) {
    console.error('Not connected');
    return;
  }
  
  // Send
  const message = { type: 'cmd', cmd: cmd };
  ws.send(JSON.stringify(message));
}
```

### Backend Validation

On receiving message:

```javascript
function validateMessage(message) {
  // Must have type field
  if (!message.type) {
    return { valid: false, error: 'Missing type field' };
  }
  
  // Validate telemetry
  if (message.type === 'telemetry') {
    if (!message.pose || !message.battery || !message.speed) {
      return { valid: false, error: 'Missing required telemetry fields' };
    }
  }
  
  // Validate command
  if (message.type === 'cmd') {
    const validCmds = ['forward', 'backward', 'left', 'right', 'stop'];
    if (!validCmds.includes(message.cmd)) {
      return { valid: false, error: 'Invalid command' };
    }
  }
  
  return { valid: true };
}
```

---

## 🐛 Common Issues

### Issue 1: Invalid JSON

**Error:** `Unexpected token in JSON`

**Cause:** Malformed JSON string

**Solution:**
```javascript
// Always use JSON.stringify
ws.send(JSON.stringify(message));

// Never send plain objects
ws.send(message); // ❌ WRONG
```

---

### Issue 2: Missing Fields

**Error:** `Cannot read property 'x' of undefined`

**Cause:** Expected field not present

**Solution:**
```javascript
// Check before accessing
if (data.pose && data.pose.x !== undefined) {
  const x = data.pose.x;
}

// Or use optional chaining
const x = data?.pose?.x ?? 0;
```

---

### Issue 3: Type Mismatch

**Error:** Values are strings instead of numbers

**Cause:** JSON parsing issue

**Solution:**
```javascript
// Ensure proper types
const telemetry = {
  type: "telemetry",
  pose: {
    x: parseFloat(x),  // Convert to float
    y: parseFloat(y),
    theta: parseFloat(theta)
  },
  speed: parseFloat(speed),
  battery: parseFloat(battery),
  cycle: parseInt(cycle),  // Convert to int
  timestamp: Date.now()
};
```

---

## 📝 Message Logging

### Backend Logging

```javascript
// Log incoming messages
ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log(`[${new Date().toISOString()}] ${message.type}:`, message);
});
```

### Frontend Logging

```javascript
// Log in browser console
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`%c${data.type}`, 'color: blue; font-weight: bold', data);
};
```

### Webots Logging

```python
# Log in controller console
print(f"📤 Sent: {json.dumps(telemetry)}")
print(f"📥 Received: {json.dumps(command)}")
```

---

## 🔐 Security Considerations

### Current Implementation

⚠️ **No authentication or encryption**

Suitable for:
- Local development
- Localhost testing
- Trusted networks

**Not suitable for:**
- Production deployment
- Public networks
- Untrusted clients

### Future Enhancements

For production, add:

1. **Authentication**
   ```json
   {
     "type": "auth",
     "token": "jwt_token_here"
   }
   ```

2. **Encryption**
   - Use WSS (WebSocket Secure) instead of WS
   - HTTPS for web server

3. **Rate Limiting**
   - Limit commands per second
   - Prevent DoS attacks

4. **Input Validation**
   - Sanitize all inputs
   - Validate ranges
   - Check against schema

---

## 📚 References

- [WebSocket Protocol (RFC 6455)](https://datatracker.ietf.org/doc/html/rfc6455)
- [JSON Specification (RFC 8259)](https://datatracker.ietf.org/doc/html/rfc8259)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Message protocol documented! 📡**
