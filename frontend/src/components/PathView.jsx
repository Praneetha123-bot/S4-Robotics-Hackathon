import { useMemo } from 'react'

function PathView({ pathHistory, currentPose }) {
  // Calculate bounds for auto-scaling (centered on origin)
  const bounds = useMemo(() => {
    if (!pathHistory || pathHistory.length === 0) {
      return { minX: -5, maxX: 5, minY: -5, maxY: 5 }
    }

    const xs = pathHistory.map(p => p.x)
    const ys = pathHistory.map(p => p.y)
    
    // Include origin (0, 0) in bounds calculation
    const minX = Math.min(...xs, 0)
    const maxX = Math.max(...xs, 0)
    const minY = Math.min(...ys, 0)
    const maxY = Math.max(...ys, 0)
    
    // Calculate the maximum extent from origin
    const maxExtent = Math.max(
      Math.abs(minX),
      Math.abs(maxX),
      Math.abs(minY),
      Math.abs(maxY),
      2 // Minimum extent
    )
    
    // Add 20% padding
    const paddedExtent = maxExtent * 1.2
    
    // Create symmetric bounds centered on origin
    return {
      minX: -paddedExtent,
      maxX: paddedExtent,
      minY: -paddedExtent,
      maxY: paddedExtent
    }
  }, [pathHistory])

  // Transform world coordinates to SVG coordinates
  const worldToSVG = (x, y) => {
    const svgWidth = 500
    const svgHeight = 500
    
    const worldWidth = bounds.maxX - bounds.minX
    const worldHeight = bounds.maxY - bounds.minY
    
    const svgX = ((x - bounds.minX) / worldWidth) * svgWidth
    const svgY = svgHeight - ((y - bounds.minY) / worldHeight) * svgHeight
    
    return { x: svgX, y: svgY }
  }

  // Generate path string for SVG
  const pathString = useMemo(() => {
    if (!pathHistory || pathHistory.length < 2) return ''
    
    const points = pathHistory.map(p => worldToSVG(p.x, p.y))
    
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }
    
    return path
  }, [pathHistory, bounds])

  // Robot arrow (direction indicator)
  const robotArrow = useMemo(() => {
    if (!currentPose) return null
    
    const pos = worldToSVG(currentPose.x, currentPose.y)
    const theta = currentPose.theta
    
    // Arrow size
    const arrowLength = 15
    const arrowWidth = 10
    
    // Calculate arrow points
    const tipX = pos.x + Math.cos(Math.PI / 2 - theta) * arrowLength
    const tipY = pos.y - Math.sin(Math.PI / 2 - theta) * arrowLength
    
    const leftX = pos.x + Math.cos(Math.PI / 2 - theta + 2.5) * arrowWidth
    const leftY = pos.y - Math.sin(Math.PI / 2 - theta + 2.5) * arrowWidth
    
    const rightX = pos.x + Math.cos(Math.PI / 2 - theta - 2.5) * arrowWidth
    const rightY = pos.y - Math.sin(Math.PI / 2 - theta - 2.5) * arrowWidth
    
    return `M ${tipX} ${tipY} L ${leftX} ${leftY} L ${pos.x} ${pos.y} L ${rightX} ${rightY} Z`
  }, [currentPose, bounds])

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 card-glow h-full">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="mr-2">📍</span>
        Robot Path
      </h2>

      {/* SVG Canvas */}
      <div className="bg-slate-900/50 rounded-lg p-3 grid-pattern">
        <svg
          viewBox="0 0 500 500"
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(148, 163, 184, 0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="500" height="500" fill="url(#grid)" />
          
          {/* Center cross */}
          <line
            x1="250"
            y1="0"
            x2="250"
            y2="500"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="0"
            y1="250"
            x2="500"
            y2="250"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Origin marker */}
          {(() => {
            const origin = worldToSVG(0, 0)
            return (
              <g>
                <circle
                  cx={origin.x}
                  cy={origin.y}
                  r="4"
                  fill="#3B82F6"
                  opacity="0.6"
                />
                <text
                  x={origin.x + 8}
                  y={origin.y - 8}
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  (0, 0)
                </text>
              </g>
            )
          })()}
          
          {/* Path trail */}
          {pathString && (
            <path
              d={pathString}
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Gradient for path */}
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Start point */}
          {pathHistory && pathHistory.length > 0 && (() => {
            const start = worldToSVG(pathHistory[0].x, pathHistory[0].y)
            return (
              <circle
                cx={start.x}
                cy={start.y}
                r="5"
                fill="#10B981"
                stroke="#fff"
                strokeWidth="2"
              />
            )
          })()}
          
          {/* Current position (robot) */}
          {currentPose && (() => {
            const pos = worldToSVG(currentPose.x, currentPose.y)
            return (
              <g>
                {/* Glow effect */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="12"
                  fill="#3B82F6"
                  opacity="0.2"
                  className="animate-pulse"
                />
                {/* Robot body */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="8"
                  fill="#3B82F6"
                  stroke="#fff"
                  strokeWidth="2"
                />
                {/* Direction arrow */}
                {robotArrow && (
                  <path
                    d={robotArrow}
                    fill="#FBBF24"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Path Points</div>
          <div className="text-lg font-bold text-blue-400">
            {pathHistory ? pathHistory.length : 0}
          </div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Bounds X</div>
          <div className="text-sm font-mono text-slate-300">
            [{bounds.minX.toFixed(1)}, {bounds.maxX.toFixed(1)}]
          </div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Bounds Y</div>
          <div className="text-sm font-mono text-slate-300">
            [{bounds.minY.toFixed(1)}, {bounds.maxY.toFixed(1)}]
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-slate-400">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <span>Path</span>
        </div>
      </div>
    </div>
  )
}

export default PathView
