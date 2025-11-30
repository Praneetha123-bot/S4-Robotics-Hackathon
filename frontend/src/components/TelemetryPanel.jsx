import { useEffect, useState } from 'react'

function TelemetryPanel({ telemetry }) {
  const [prevBattery, setPrevBattery] = useState(100)

  useEffect(() => {
    if (telemetry?.battery) {
      setPrevBattery(telemetry.battery)
    }
  }, [telemetry])

  if (!telemetry) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 card-glow">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Live Telemetry
        </h2>
        <div className="text-center py-8">
          <div className="animate-pulse-slow text-slate-400 text-lg">
            Waiting for robot data...
          </div>
        </div>
      </div>
    )
  }

  const { pose, speed, battery, cycle } = telemetry

  const getBatteryColor = () => {
    if (battery > 60) return 'bg-green-500'
    if (battery > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getHealthStatus = () => {
    if (battery > 80 && speed < 0.5) return { text: 'Excellent', color: 'text-green-400' }
    if (battery > 50) return { text: 'Good', color: 'text-blue-400' }
    if (battery > 20) return { text: 'Fair', color: 'text-yellow-400' }
    return { text: 'Critical', color: 'text-red-400' }
  }

  const health = getHealthStatus()

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 card-glow">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="mr-2">📊</span>
        Live Telemetry
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Position */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Position (m)</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">X</div>
              <div className="text-lg font-mono font-bold text-blue-400">
                {pose.x.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Y</div>
              <div className="text-lg font-mono font-bold text-blue-400">
                {pose.y.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">θ (rad)</div>
              <div className="text-lg font-mono font-bold text-purple-400">
                {pose.theta.toFixed(3)}
              </div>
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Speed</div>
          <div className="flex items-end space-x-2">
            <div className="text-2xl font-bold text-cyan-400">
              {speed.toFixed(3)}
            </div>
            <div className="text-slate-500 mb-1">m/s</div>
          </div>
          <div className="mt-2 bg-slate-600/30 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(speed / 0.5 * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Battery */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-slate-400">Battery</div>
            <div className="text-xs text-slate-500">
              {battery > prevBattery ? '↑' : battery < prevBattery ? '↓' : '→'}
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-2xl font-bold ${battery > 30 ? 'text-green-400' : 'text-red-400'}`}>
              {battery.toFixed(1)}
            </div>
            <div className="text-slate-500 mb-1">%</div>
          </div>
          <div className="mt-2 bg-slate-600/30 rounded-full h-3 overflow-hidden">
            <div 
              className={`${getBatteryColor()} h-full transition-all duration-300`}
              style={{ width: `${battery}%` }}
            ></div>
          </div>
        </div>

        {/* Health */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">System Health</div>
          <div className={`text-2xl font-bold ${health.color}`}>
            {health.text}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Cycle: {cycle}
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-4 text-xs text-slate-500 text-center">
        Last update: {new Date(telemetry.timestamp).toLocaleTimeString()}
      </div>
    </div>
  )
}

export default TelemetryPanel
