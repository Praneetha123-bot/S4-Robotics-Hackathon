import { useEffect, useState } from 'react'

function ConnectionStatus({ status }) {
  const [showDetails, setShowDetails] = useState(false)

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          text: 'Connected',
          textColor: 'text-green-400',
          icon: '✓',
          pulse: true
        }
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          text: 'Connecting...',
          textColor: 'text-yellow-400',
          icon: '↻',
          pulse: true
        }
      case 'disconnected':
        return {
          color: 'bg-red-500',
          text: 'Disconnected',
          textColor: 'text-red-400',
          icon: '✗',
          pulse: false
        }
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown',
          textColor: 'text-gray-400',
          icon: '?',
          pulse: false
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="flex items-center space-x-2 bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700/70 transition-colors">
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
          {config.pulse && (
            <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping opacity-75`}></div>
          )}
        </div>
        <span className={`font-medium ${config.textColor}`}>{config.text}</span>
        <span className="text-slate-400">{config.icon}</span>
      </div>

      {/* Tooltip */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 z-50">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`font-medium ${config.textColor}`}>{status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Server:</span>
              <span className="text-slate-300">localhost:3000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Protocol:</span>
              <span className="text-slate-300">WebSocket</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectionStatus
