import { useEffect, useRef } from 'react'

function Logs({ logs }) {
  const logsEndRef = useRef(null)
  const logsContainerRef = useRef(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current && logsContainerRef.current) {
      const container = logsContainerRef.current
      const isScrolledToBottom = 
        container.scrollHeight - container.clientHeight <= container.scrollTop + 50
      
      if (isScrolledToBottom) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [logs])

  const getLogIcon = (message) => {
    if (message.includes('✅')) return '✅'
    if (message.includes('❌')) return '❌'
    if (message.includes('📤')) return '📤'
    if (message.includes('📥')) return '📥'
    if (message.includes('⚠️')) return '⚠️'
    if (message.includes('Position:')) return '📍'
    if (message.includes('Battery:')) return '🔋'
    if (message.includes('Connection')) return '🔌'
    return '📝'
  }

  const getLogColor = (message) => {
    if (message.includes('✅') || message.includes('connected')) return 'text-green-400'
    if (message.includes('❌') || message.includes('error') || message.includes('failed')) return 'text-red-400'
    if (message.includes('⚠️') || message.includes('warning')) return 'text-yellow-400'
    if (message.includes('📤') || message.includes('command')) return 'text-blue-400'
    return 'text-slate-300'
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 card-glow h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="mr-2">📜</span>
          Live Logs
        </h2>
        <div className="text-sm text-slate-400">
          {logs.length} / 200
        </div>
      </div>

      {/* Logs container */}
      <div 
        ref={logsContainerRef}
        className="flex-1 bg-slate-900/50 rounded-lg p-3 overflow-y-auto"
        style={{ maxHeight: '450px', minHeight: '400px' }}
      >
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-2">📋</div>
            <div>No logs yet</div>
            <div className="text-sm mt-2">System events will appear here</div>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 text-sm font-mono hover:bg-slate-800/50 rounded px-2 py-1 transition-colors"
              >
                <span className="text-slate-500 shrink-0 w-20">
                  {log.timestamp}
                </span>
                <span className="shrink-0">
                  {getLogIcon(log.message)}
                </span>
                <span className={`flex-1 ${getLogColor(log.message)}`}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-slate-700/30 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400">Total Logs</div>
          <div className="text-lg font-bold text-slate-300">{logs.length}</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400">Latest</div>
          <div className="text-xs font-mono text-slate-300">
            {logs.length > 0 ? logs[logs.length - 1].timestamp : '--:--:--'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Logs
