import { useState, useEffect } from 'react'

function Controls({ onCommand, disabled }) {
  const [activeButton, setActiveButton] = useState(null)
  const [keyboardEnabled, setKeyboardEnabled] = useState(true)

  useEffect(() => {
    if (!keyboardEnabled) return

    const handleKeyDown = (e) => {
      if (disabled) return

      let command = null
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          command = 'forward'
          break
        case 's':
        case 'arrowdown':
          command = 'backward'
          break
        case 'a':
        case 'arrowleft':
          command = 'left'
          break
        case 'd':
        case 'arrowright':
          command = 'right'
          break
        case ' ':
          e.preventDefault()
          command = 'stop'
          break
        default:
          return
      }

      if (command && command !== activeButton) {
        setActiveButton(command)
        onCommand(command)
      }
    }

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase()
      if (['w', 's', 'a', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setActiveButton(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onCommand, disabled, activeButton, keyboardEnabled])

  const handleButtonClick = (command) => {
    if (disabled) return
    setActiveButton(command)
    onCommand(command)
    
    // Auto-release after 100ms
    setTimeout(() => {
      setActiveButton(null)
    }, 100)
  }

  const buttonClass = (command) => {
    const base = "font-bold text-white rounded-xl transition-all duration-150 shadow-lg select-none touch-none"
    const active = activeButton === command ? "brightness-90" : "hover:brightness-110"
    const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:brightness-90"
    
    return `${base} ${active} ${disabledClass}`
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">🎮 Tele-Operation</h2>
        <button
          onClick={() => setKeyboardEnabled(!keyboardEnabled)}
          className={`text-xs px-3 py-1 rounded select-none ${
            keyboardEnabled ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          ⌨️ Keyboard: {keyboardEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {disabled && (
        <div className="mb-4 bg-yellow-900 border border-yellow-700 rounded p-3">
          <p className="text-yellow-300 text-sm">⚠️ Not connected to robot</p>
        </div>
      )}

      {/* Control Grid - Fixed height to prevent layout shift */}
      <div className="grid grid-cols-3 gap-3 mb-4 min-h-[200px]">
        {/* Empty */}
        <div></div>
        
        {/* Forward */}
        <button
          onClick={() => handleButtonClick('forward')}
          onMouseDown={(e) => e.preventDefault()}
          disabled={disabled}
          className={`${buttonClass('forward')} bg-blue-600 p-4 text-2xl flex flex-col items-center justify-center`}
        >
          <div>↑</div>
          <div className="text-xs">Forward</div>
          {keyboardEnabled && <div className="text-xs opacity-70">W / ↑</div>}
        </button>
        
        {/* Empty */}
        <div></div>
        
        {/* Left */}
        <button
          onClick={() => handleButtonClick('left')}
          onMouseDown={(e) => e.preventDefault()}
          disabled={disabled}
          className={`${buttonClass('left')} bg-purple-600 p-4 text-2xl flex flex-col items-center justify-center`}
        >
          <div>←</div>
          <div className="text-xs">Left</div>
          {keyboardEnabled && <div className="text-xs opacity-70">A / ←</div>}
        </button>
        
        {/* Stop */}
        <button
          onClick={() => handleButtonClick('stop')}
          onMouseDown={(e) => e.preventDefault()}
          disabled={disabled}
          className={`${buttonClass('stop')} bg-red-600 p-4 text-2xl flex flex-col items-center justify-center`}
        >
          <div>■</div>
          <div className="text-xs">STOP</div>
          {keyboardEnabled && <div className="text-xs opacity-70">SPACE</div>}
        </button>
        
        {/* Right */}
        <button
          onClick={() => handleButtonClick('right')}
          onMouseDown={(e) => e.preventDefault()}
          disabled={disabled}
          className={`${buttonClass('right')} bg-purple-600 p-4 text-2xl flex flex-col items-center justify-center`}
        >
          <div>→</div>
          <div className="text-xs">Right</div>
          {keyboardEnabled && <div className="text-xs opacity-70">D / →</div>}
        </button>
        
        {/* Empty */}
        <div></div>
        
        {/* Backward */}
        <button
          onClick={() => handleButtonClick('backward')}
          onMouseDown={(e) => e.preventDefault()}
          disabled={disabled}
          className={`${buttonClass('backward')} bg-blue-600 p-4 text-2xl flex flex-col items-center justify-center`}
        >
          <div>↓</div>
          <div className="text-xs">Backward</div>
          {keyboardEnabled && <div className="text-xs opacity-70">S / ↓</div>}
        </button>
        
        {/* Empty */}
        <div></div>
      </div>

      {/* Active Command Indicator - Fixed height to prevent layout shift */}
      <div className="bg-gray-700 rounded p-2 text-center min-h-[60px] flex flex-col items-center justify-center">
        {activeButton ? (
          <>
            <div className="text-sm text-gray-400">Active Command</div>
            <div className="text-lg font-bold text-green-400 uppercase">
              {activeButton}
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500">Ready</div>
        )}
      </div>

      {/* Instructions */}
      {keyboardEnabled && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          💡 Use keyboard controls: W/A/S/D or Arrow keys
        </div>
      )}
    </div>
  )
}

export default Controls
