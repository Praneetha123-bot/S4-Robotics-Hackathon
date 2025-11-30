/**
 * WebSocket Message Router
 * =========================
 * 
 * Handles routing of messages between different client types:
 * - Robot clients (sending telemetry)
 * - Frontend clients (sending commands, receiving telemetry)
 * 
 * Features:
 * - Message type detection and routing
 * - Telemetry logging and history
 * - Command forwarding
 * - Statistics tracking
 */

// ============================================
// DATA STORAGE
// ============================================

const telemetryHistory = [];
const TELEMETRY_LOG_LIMIT = 1000;

let stats = {
  telemetryCount: 0,
  commandCount: 0,
  lastTelemetry: null,
  lastCommand: null,
  startTime: Date.now()
};

// ============================================
// MESSAGE ROUTING
// ============================================

/**
 * Route incoming message to appropriate clients
 * @param {WebSocket} senderWs - Sender's WebSocket connection
 * @param {Object} message - Parsed message object
 * @param {Set} allClients - Set of all connected clients
 * @param {Map} clientsMap - Map of client metadata
 */
function routeMessage(senderWs, message, allClients, clientsMap) {
  const messageType = message.type;
  const senderInfo = clientsMap.get(senderWs);
  
  switch (messageType) {
    case 'telemetry':
      handleTelemetry(senderWs, message, allClients, clientsMap);
      break;
    
    case 'cmd':
      handleCommand(senderWs, message, allClients, clientsMap);
      break;
    
    case 'version_request':
      handleVersionRequest(senderWs, clientsMap);
      break;
    
    case 'permission_granted':
    case 'permission_denied':
      handlePermissionUpdate(senderWs, message, clientsMap);
      break;
    
    case 'apply_update':
      handleApplyUpdate(senderWs, message, allClients, clientsMap);
      break;
    
    case 'config':
      handleConfigUpdate(senderWs, message, allClients, clientsMap);
      break;
    
    default:
      console.log(`⚠️  Unknown message type: ${messageType} from ${senderInfo?.id}`);
  }
}

// ============================================
// TELEMETRY HANDLING
// ============================================

/**
 * Handle telemetry messages from robot
 * - Log telemetry
 * - Store in history
 * - Broadcast to all frontend clients
 */
function handleTelemetry(senderWs, telemetry, allClients, clientsMap) {
  const senderInfo = clientsMap.get(senderWs);
  
  // Log telemetry
  stats.telemetryCount++;
  stats.lastTelemetry = telemetry;
  
  // Store in history
  telemetryHistory.push({
    ...telemetry,
    receivedAt: Date.now()
  });
  
  // Limit history size
  if (telemetryHistory.length > TELEMETRY_LOG_LIMIT) {
    telemetryHistory.shift();
  }
  
  // Log every 100 messages
  if (stats.telemetryCount % 100 === 0) {
    console.log(`📊 Telemetry stats: ${stats.telemetryCount} messages received`);
  }
  
  // Broadcast to all frontend clients
  let broadcastCount = 0;
  allClients.forEach((client) => {
    const clientInfo = clientsMap.get(client);
    
    // Send to frontend clients only (not back to robot)
    if (client !== senderWs && 
        client.readyState === 1 && // WebSocket.OPEN
        clientInfo?.type === 'frontend') {
      try {
        client.send(JSON.stringify(telemetry));
        broadcastCount++;
      } catch (error) {
        console.error(`❌ Error broadcasting to ${clientInfo?.id}:`, error.message);
      }
    }
  });
  
  // Log detailed info every 50 messages
  if (stats.telemetryCount % 50 === 0) {
    const pose = telemetry.pose || {};
    console.log(`📥 Telemetry #${stats.telemetryCount}: ` +
                `pos=(${pose.x?.toFixed(2)}, ${pose.y?.toFixed(2)}) ` +
                `θ=${pose.theta?.toFixed(3)} ` +
                `battery=${telemetry.battery?.toFixed(1)}% ` +
                `→ ${broadcastCount} frontend(s)`);
  }
}

// ============================================
// COMMAND HANDLING
// ============================================

/**
 * Handle command messages from frontend
 * - Log command
 * - Forward to robot clients
 */
function handleCommand(senderWs, command, allClients, clientsMap) {
  const senderInfo = clientsMap.get(senderWs);
  
  // Log command
  stats.commandCount++;
  stats.lastCommand = command;
  
  console.log(`📤 Command from ${senderInfo?.id}: ${command.cmd}`);
  
  // Forward to all robot clients
  let forwardCount = 0;
  allClients.forEach((client) => {
    const clientInfo = clientsMap.get(client);
    
    // Send to robot clients only
    if (client !== senderWs && 
        client.readyState === 1 && // WebSocket.OPEN
        clientInfo?.type === 'robot') {
      try {
        client.send(JSON.stringify(command));
        forwardCount++;
      } catch (error) {
        console.error(`❌ Error forwarding to ${clientInfo?.id}:`, error.message);
      }
    }
  });
  
  console.log(`   → Forwarded to ${forwardCount} robot(s)`);
  
  // Send acknowledgment back to sender
  try {
    senderWs.send(JSON.stringify({
      type: 'ack',
      originalCommand: command.cmd,
      forwarded: forwardCount
    }));
  } catch (error) {
    console.error(`❌ Error sending ack to ${senderInfo?.id}:`, error.message);
  }
}

// ============================================
// UPDATE & CONFIGURATION HANDLERS
// ============================================

/**
 * Handle version request from frontend
 */
function handleVersionRequest(senderWs, clientsMap) {
  const senderInfo = clientsMap.get(senderWs);
  console.log(`📋 Version request from ${senderInfo?.id}`);
  
  const versionInfo = {
    type: 'version_response',
    versions: {
      backend: '1.0.0',
      protocol: '1.0',
      node: process.version
    },
    timestamp: Date.now()
  };
  
  try {
    senderWs.send(JSON.stringify(versionInfo));
  } catch (error) {
    console.error(`❌ Error sending version info:`, error.message);
  }
}

/**
 * Handle permission update from frontend
 */
function handlePermissionUpdate(senderWs, message, clientsMap) {
  const senderInfo = clientsMap.get(senderWs);
  const isGranted = message.type === 'permission_granted';
  
  console.log(`🔐 Permission ${isGranted ? 'GRANTED' : 'DENIED'} by ${senderInfo?.id}`);
  
  // Update client metadata
  if (senderInfo) {
    senderInfo.hasControlPermission = isGranted;
  }
  
  // Send acknowledgment
  const ack = {
    type: 'permission_ack',
    granted: isGranted,
    timestamp: Date.now()
  };
  
  try {
    senderWs.send(JSON.stringify(ack));
  } catch (error) {
    console.error(`❌ Error sending permission ack:`, error.message);
  }
}

/**
 * Handle apply update request
 */
function handleApplyUpdate(senderWs, message, allClients, clientsMap) {
  const senderInfo = clientsMap.get(senderWs);
  const updateType = message.updateType;
  
  console.log(`🔄 Applying ${updateType} update requested by ${senderInfo?.id}`);
  
  // Forward to robot if applicable
  allClients.forEach((client) => {
    const clientInfo = clientsMap.get(client);
    if (clientInfo?.type === 'robot' && client.readyState === 1) {
      try {
        client.send(JSON.stringify({
          type: 'update',
          updateType: updateType,
          timestamp: Date.now()
        }));
        console.log(`📤 Update forwarded to robot`);
      } catch (error) {
        console.error(`❌ Error forwarding update:`, error.message);
      }
    }
  });
  
  // Send confirmation to frontend
  const confirmation = {
    type: 'update_applied',
    updateType: updateType,
    status: 'success',
    timestamp: Date.now()
  };
  
  try {
    senderWs.send(JSON.stringify(confirmation));
  } catch (error) {
    console.error(`❌ Error sending update confirmation:`, error.message);
  }
}

/**
 * Handle configuration update (forward to robot)
 */
function handleConfigUpdate(senderWs, message, allClients, clientsMap) {
  const senderInfo = clientsMap.get(senderWs);
  
  console.log(`⚙️  Configuration update from ${senderInfo?.id}:`, 
    JSON.stringify(message).substring(0, 100));
  
  // Forward to robot
  let forwardedCount = 0;
  allClients.forEach((client) => {
    const clientInfo = clientsMap.get(client);
    if (clientInfo?.type === 'robot' && client.readyState === 1) {
      try {
        client.send(JSON.stringify(message));
        forwardedCount++;
      } catch (error) {
        console.error(`❌ Error forwarding config:`, error.message);
      }
    }
  });
  
  console.log(`📤 Config forwarded to ${forwardedCount} robot(s)`);
  
  // Send acknowledgment
  const ack = {
    type: 'config_ack',
    status: forwardedCount > 0 ? 'delivered' : 'no_robot',
    timestamp: Date.now()
  };
  
  try {
    senderWs.send(JSON.stringify(ack));
  } catch (error) {
    console.error(`❌ Error sending config ack:`, error.message);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get recent telemetry history
 * @param {number} limit - Number of recent entries to return
 * @returns {Array} Array of telemetry objects
 */
function getTelemetryHistory(limit = 100) {
  const actualLimit = Math.min(limit, telemetryHistory.length);
  return telemetryHistory.slice(-actualLimit);
}

/**
 * Get server statistics
 * @returns {Object} Stats object
 */
function getStats() {
  const uptime = (Date.now() - stats.startTime) / 1000;
  
  return {
    telemetryCount: stats.telemetryCount,
    commandCount: stats.commandCount,
    uptime: uptime,
    lastTelemetry: stats.lastTelemetry,
    lastCommand: stats.lastCommand,
    telemetryHistorySize: telemetryHistory.length,
    avgTelemetryRate: stats.telemetryCount / uptime
  };
}

/**
 * Clear telemetry history
 */
function clearHistory() {
  telemetryHistory.length = 0;
  console.log('🗑️  Telemetry history cleared');
}

/**
 * Reset statistics
 */
function resetStats() {
  stats = {
    telemetryCount: 0,
    commandCount: 0,
    lastTelemetry: null,
    lastCommand: null,
    startTime: Date.now()
  };
  console.log('🔄 Statistics reset');
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  routeMessage,
  getTelemetryHistory,
  getStats,
  clearHistory,
  resetStats
};
