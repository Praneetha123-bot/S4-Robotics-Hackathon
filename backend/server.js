/**
 * S4 Remote Robot Management System - Backend Server
 * ===================================================
 * 
 * WebSocket server that bridges communication between:
 * - Webots robot simulation (Python controller)
 * - React frontend dashboard
 * 
 * Features:
 * - Bi-directional WebSocket communication
 * - Message routing between clients
 * - Telemetry logging and history
 * - REST API for status monitoring
 * - Auto-reconnection handling
 * 
 * Author: Fitfest25 Hackathon Team
 * Date: 2025
 */

const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const { routeMessage, getTelemetryHistory, getStats } = require('./ws-router');

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 3000;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// ============================================
// EXPRESS APP SETUP
// ============================================

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// REST API Routes
app.get('/', (req, res) => {
  res.json({
    service: 'S4 Backend Server',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/status', (req, res) => {
  const stats = getStats();
  res.json({
    status: 'ok',
    connections: wss.clients.size,
    uptime: process.uptime(),
    ...stats
  });
});

app.get('/health', (req, res) => {
  res.json({ healthy: true });
});

app.get('/telemetry/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const history = getTelemetryHistory(limit);
  res.json({ history });
});

// ============================================
// WEBSOCKET SERVER SETUP
// ============================================

const wss = new WebSocket.Server({ server });

// Client tracking
const clients = new Map();
let clientIdCounter = 0;

// ============================================
// WEBSOCKET EVENT HANDLERS
// ============================================

wss.on('connection', (ws, req) => {
  const clientId = `client_${++clientIdCounter}`;
  const clientIp = req.socket.remoteAddress;
  
  // Initialize client metadata
  clients.set(ws, {
    id: clientId,
    ip: clientIp,
    connectedAt: new Date(),
    isAlive: true,
    type: 'unknown' // Will be determined by first message
  });
  
  console.log(`✅ Client connected: ${clientId} from ${clientIp}`);
  console.log(`📊 Total connections: ${wss.clients.size}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    clientId: clientId,
    message: 'Connected to S4 Backend Server'
  }));
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      const client = clients.get(ws);
      
      // Determine client type from first message
      if (client.type === 'unknown') {
        if (message.type === 'telemetry') {
          client.type = 'robot';
          console.log(`🤖 Client ${clientId} identified as ROBOT`);
        } else if (message.type === 'cmd') {
          client.type = 'frontend';
          console.log(`💻 Client ${clientId} identified as FRONTEND`);
        }
      }
      
      // Route message to appropriate clients
      routeMessage(ws, message, wss.clients, clients);
      
    } catch (error) {
      console.error(`❌ Error processing message from ${clientId}:`, error.message);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  // Handle pong responses (heartbeat)
  ws.on('pong', () => {
    const client = clients.get(ws);
    if (client) {
      client.isAlive = true;
    }
  });
  
  // Handle client disconnection
  ws.on('close', (code, reason) => {
    const client = clients.get(ws);
    console.log(`🔌 Client disconnected: ${client?.id || 'unknown'} (code: ${code})`);
    console.log(`📊 Total connections: ${wss.clients.size}`);
    clients.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    const client = clients.get(ws);
    console.error(`❌ WebSocket error for ${client?.id || 'unknown'}:`, error.message);
  });
});

// ============================================
// HEARTBEAT / KEEP-ALIVE
// ============================================

const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    const client = clients.get(ws);
    
    if (client && client.isAlive === false) {
      console.log(`💀 Terminating inactive client: ${client.id}`);
      clients.delete(ws);
      return ws.terminate();
    }
    
    if (client) {
      client.isAlive = false;
      ws.ping();
    }
  });
}, HEARTBEAT_INTERVAL);

// Cleanup on server shutdown
wss.on('close', () => {
  clearInterval(heartbeat);
});

// ============================================
// START SERVER
// ============================================

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 S4 BACKEND SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`📡 WebSocket Server: ws://localhost:${PORT}`);
  console.log(`🌐 HTTP Server: http://localhost:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n✅ Ready to accept connections...\n');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  
  wss.clients.forEach((ws) => {
    ws.close(1000, 'Server shutting down');
  });
  
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
