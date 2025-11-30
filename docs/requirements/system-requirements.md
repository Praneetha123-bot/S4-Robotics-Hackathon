# System Requirements - S4 Remote Robot Management System

## Fitfest25 Hackathon

---

## 📋 Software Requirements

### 1. Webots Simulation Platform
- **Version**: R2023b or later (R2025a recommended)
- **Installation Path**: `C:\Webot\Webots\` (Windows) or equivalent
- **Size**: ~2 GB installed
- **Purpose**: Virtual robot simulation environment
- **Download**: https://cyberbotics.com/#download

### 2. Python
- **Version**: 3.9 or later
- **Required Libraries**:
  ```
  websocket-client==1.9.0
  ```
- **Purpose**: Robot controller and WebSocket client
- **Verification**: `python --version`

### 3. Node.js
- **Version**: 18.0 or later
- **Purpose**: Backend WebSocket server
- **Verification**: `node --version`
- **Download**: https://nodejs.org/

### 4. npm (Node Package Manager)
- **Version**: 9.0 or later
- **Purpose**: Package management for backend and frontend
- **Verification**: `npm --version`
- **Note**: Comes bundled with Node.js

### 5. Web Browser
- **Recommended**: Google Chrome or Microsoft Edge (latest version)
- **Purpose**: Access frontend dashboard
- **Minimum**: Any modern browser with WebSocket support

---

## 💻 Hardware Requirements

### Minimum Requirements:
- **CPU**: Intel Core i5 or AMD Ryzen 5 (or equivalent)
- **RAM**: 8 GB
- **Storage**: 5 GB free space
- **Graphics**: Integrated graphics card (Intel HD Graphics or better)
- **Network**: Active network connection for WebSocket communication

### Recommended Requirements:
- **CPU**: Intel Core i7 or AMD Ryzen 7 (or equivalent)
- **RAM**: 16 GB or more
- **Storage**: 10 GB free space (SSD preferred)
- **Graphics**: Dedicated GPU (NVIDIA/AMD) for better Webots rendering
- **Network**: Stable network connection

---

## 🌐 Network Requirements

### Ports Used:
- **Backend WebSocket Server**: `3000` (default)
- **Frontend Development Server**: `5173` (Vite default, may vary)
- **Webots Robot Controller**: Connects to `ws://localhost:3000`

### Network Configuration:
- Firewall must allow connections on port `3000`
- All components run on `localhost` by default
- For remote access, configure appropriate port forwarding

---

## 📦 Dependencies

### Backend (Node.js)
```json
{
  "express": "^4.18.2",
  "ws": "^8.14.2",
  "cors": "^2.8.5"
}
```

### Frontend (React)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "tailwindcss": "^3.4.1",
  "vite": "^5.4.21"
}
```

### Python Controller
```
websocket-client==1.9.0
```

---

## 🖥️ Operating System Support

### Supported Platforms:
- ✅ **Windows**: 10/11 (64-bit)
- ✅ **macOS**: 10.15 (Catalina) or later
- ✅ **Linux**: Ubuntu 20.04 LTS or later

### Tested On:
- Windows 11 Pro (primary development platform)
- Webots R2025a

---

## 🔧 Development Tools (Optional)

### Recommended IDEs:
- **VS Code**: For frontend/backend development
- **PyCharm**: For Python controller development
- **Webots IDE**: Built-in editor for robot controllers

### Useful Extensions (VS Code):
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Python extension
- Prettier - Code formatter

---

## 📊 Performance Expectations

### Backend:
- WebSocket message latency: < 50ms
- Concurrent connections: Up to 10 clients
- CPU usage: < 5% (idle), < 15% (active)
- Memory usage: ~50-100 MB

### Frontend:
- Initial load time: < 3 seconds
- Render FPS: 60 FPS
- Memory usage: ~100-200 MB
- WebSocket reconnection: Automatic

### Webots:
- Simulation speed: Real-time (1.0x)
- Physics timestep: 64ms (default)
- Controller cycle: 200-300ms
- CPU usage: 10-30% (depends on world complexity)

---

## ✅ Compatibility Matrix

| Component | Windows 10/11 | macOS 10.15+ | Ubuntu 20.04+ |
|-----------|---------------|--------------|---------------|
| Webots R2025a | ✅ | ✅ | ✅ |
| Python 3.9+ | ✅ | ✅ | ✅ |
| Node.js 18+ | ✅ | ✅ | ✅ |
| Backend Server | ✅ | ✅ | ✅ |
| Frontend Dashboard | ✅ | ✅ | ✅ |

---

## 🚀 Quick Verification

Run these commands to verify your system:

```powershell
# Check Python
python --version

# Check Node.js
node --version

# Check npm
npm --version

# Check Webots (Windows)
Test-Path "C:\Webot\Webots\msys64\mingw64\bin\webots.exe"

# Check ports
netstat -an | findstr ":3000"
```

Expected output:
```
Python 3.9.x or later
v18.x.x or later
9.x.x or later
True
(Empty or shows port in use)
```

---

## 📝 Notes

1. **Webots License**: Free for education and research
2. **Node Modules**: ~200 MB for backend + frontend combined
3. **Python Dependencies**: Lightweight, < 10 MB
4. **Cross-platform**: Same codebase works on all supported platforms
5. **Scalability**: Can be extended for multiple robots and cloud deployment

---

## 🆘 Troubleshooting

### Common Issues:

**Issue**: Webots not found  
**Solution**: Update `WEBOTS_PATH` in project files

**Issue**: Port 3000 already in use  
**Solution**: Change `PORT` in `backend/server.js`

**Issue**: Python module not found  
**Solution**: `pip install websocket-client`

**Issue**: Node modules missing  
**Solution**: Run `npm install` in backend and frontend folders

---

**Last Updated**: December 1, 2025  
**Project**: S4 Remote Robot Management System  
**Event**: Fitfest25 Hackathon
