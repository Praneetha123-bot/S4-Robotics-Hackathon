import { useState, useEffect } from 'react'
import wsClient from './utils/websocket'
import ConnectionStatus from './components/ConnectionStatus'
import TelemetryPanel from './components/TelemetryPanel'
import Controls from './components/Controls'
import PathView from './components/PathView'
import Logs from './components/Logs'
import UpdatesPanel from './components/UpdatesPanel'

function App() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [telemetry, setTelemetry] = useState(null)
  const [pathHistory, setPathHistory] = useState([])
  const [logs, setLogs] = useState([])

  useEffect(() => {
    // Connect to WebSocket server
    wsClient.connect()

    // Listen for status changes
    const handleStatus = (status) => {
      setConnectionStatus(status)
      addLog(`Connection status: ${status}`)
    }

    // Listen for messages
    const handleMessage = (data) => {
      if (data.type === 'telemetry') {
        setTelemetry(data)
        
        // Add to path history
        setPathHistory(prev => {
          const newPath = [...prev, {
            x: data.pose.x,
            y: data.pose.y,
            theta: data.pose.theta,
            timestamp: data.timestamp
          }]
          // Keep last 500 points
          return newPath.slice(-500)
        })

        // Add to logs (less frequent)
        if (data.cycle % 20 === 0) {
          addLog(`Position: (${data.pose.x.toFixed(2)}, ${data.pose.y.toFixed(2)}) | Battery: ${data.battery.toFixed(1)}%`)
        }
      } else if (data.type === 'connected') {
        addLog(`✅ ${data.message}`)
      } else if (data.type === 'ack') {
        addLog(`✓ Command acknowledged: ${data.originalCommand}`)
      }
    }

    // Listen for errors
    const handleError = (error) => {
      addLog(`❌ Error: ${error.message || 'Unknown error'}`)
    }

    // Register listeners
    wsClient.on('status', handleStatus)
    wsClient.on('message', handleMessage)
    wsClient.on('error', handleError)

    // Cleanup
    return () => {
      wsClient.off('status', handleStatus)
      wsClient.off('message', handleMessage)
      wsClient.off('error', handleError)
    }
  }, [])

  const addLog = (message) => {
    setLogs(prev => {
      const newLog = {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleTimeString()
      }
      return [newLog, ...prev].slice(0, 100) // Keep last 100 logs
    })
  }

  const handleCommand = (command) => {
    wsClient.sendCommand(command)
    addLog(`Sent command: ${command}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-x-hidden">
      <div className="container mx-auto p-6 max-w-screen-2xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-2">
            🤖 S4 Robot Control Center
          </h1>
          <p className="text-gray-300">Remote Robot Management System</p>
          <div className="mt-4">
            <ConnectionStatus status={connectionStatus} />
          </div>
        </header>

        {/* Main Layout */}
        <div className="space-y-6">
          
          {/* TOP ROW: Tele-Operation, Robot Path, Live Logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            
            {/* 1. Tele-Operation Panel (Left - Wider for better button spacing) */}
            <div className="lg:col-span-4 md:col-span-1">
              <Controls 
                onCommand={handleCommand} 
                disabled={connectionStatus !== 'connected'} 
              />
            </div>

            {/* 2. Robot Path Panel (Center - Main focus) */}
            <div className="lg:col-span-5 md:col-span-1">
              <PathView 
                pathHistory={pathHistory} 
                currentPose={telemetry?.pose} 
              />
            </div>

            {/* 3. Live Logs Panel (Right - Compact) */}
            <div className="lg:col-span-3 md:col-span-2">
              <Logs logs={logs} />
            </div>
          </div>

          {/* SECOND ROW: Live Telemetry (Large) + System Updates (Small Corner) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-9">
              <TelemetryPanel telemetry={telemetry} />
            </div>
            <div className="lg:col-span-3">
              <UpdatesPanel 
                wsClient={wsClient}
                isConnected={connectionStatus === 'connected'}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-400 text-sm pb-4">
          <p>🚀 S4 Remote Robot Management System</p>
          <p>React + WebSocket + Webots</p>
        </footer>
      </div>
    </div>
  )
}

export default App
