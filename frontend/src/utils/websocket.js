/**
 * WebSocket Client Manager
 * =========================
 * 
 * Manages WebSocket connection to backend server.
 * Provides methods for sending commands and receiving telemetry.
 * Handles auto-reconnection and connection status.
 */

const WS_URL = 'ws://localhost:3000';
const RECONNECT_INTERVAL = 3000; // 3 seconds

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.listeners = {
      message: [],
      status: [],
      error: []
    };
    this.isConnecting = false;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    console.log(`🔄 Connecting to ${WS_URL}...`);
    this.notifyStatus('connecting');

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.notifyStatus('connected');
        
        // Clear reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyMessage(data);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.notifyError(error);
      };

      this.ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed (code: ${event.code})`);
        this.isConnecting = false;
        this.notifyStatus('disconnected');
        
        // Auto-reconnect
        this.scheduleReconnect();
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.notifyStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }

    console.log(`🔄 Reconnecting in ${RECONNECT_INTERVAL / 1000} seconds...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_INTERVAL);
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send command to robot
   * @param {string} command - Command name (forward, backward, left, right, stop)
   */
  sendCommand(command) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️  Cannot send command: not connected');
      return false;
    }

    const message = {
      type: 'cmd',
      cmd: command
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log(`📤 Sent command: ${command}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending command:', error);
      return false;
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event type (message, status, error)
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event type
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Notify message listeners
   */
  notifyMessage(data) {
    this.listeners.message.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Error in message listener:', error);
      }
    });
  }

  /**
   * Notify status listeners
   */
  notifyStatus(status) {
    this.listeners.status.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('❌ Error in status listener:', error);
      }
    });
  }

  /**
   * Notify error listeners
   */
  notifyError(error) {
    this.listeners.error.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('❌ Error in error listener:', error);
      }
    });
  }

  /**
   * Get connection status
   */
  getStatus() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'disconnecting';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
export default wsClient;
