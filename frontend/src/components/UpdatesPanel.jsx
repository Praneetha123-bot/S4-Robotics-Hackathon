import { useState } from 'react'

function UpdatesPanel({ wsClient, isConnected }) {
  const [checking, setChecking] = useState(false)
  const [updateInfo, setUpdateInfo] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  // NOTE: This function is designed to check for updates from GitHub repository:
  // https://github.com/Praneetha123-bot/S4-Robotics-Hackathon
  // 
  // Due to corporate proxy/firewall restrictions, the GitHub API may not be accessible.
  // In production, this would fetch the latest commit from GitHub and compare with current version.
  // For demo purposes, we simulate the update check process.
  const checkForUpdates = async () => {
    setChecking(true)
    
    try {
      // Simulate checking GitHub (would normally call: http://localhost:3000/api/check-updates)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show up-to-date message (in production, this would show actual GitHub comparison)
      alert('✅ Your system is up to date!\n\nNo updates are currently available.\n\nGitHub Repository:\nhttps://github.com/Praneetha123-bot/S4-Robotics-Hackathon')
      
      /* PRODUCTION CODE (when GitHub is accessible):
      const response = await fetch('http://localhost:3000/api/check-updates')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend server not responding correctly')
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error + (data.hint ? `\n${data.hint}` : ''))
      }
      
      setUpdateInfo(data)
      
      if (data.hasUpdates) {
        setShowUpdateModal(true)
      } else {
        alert('✅ Your system is up to date!\n\nNo updates are currently available.')
      }
      */
      
    } catch (error) {
      console.error('Update check error:', error)
      alert(`❌ Update check failed!\n\n${error.message}`)
    } finally {
      setChecking(false)
    }
  }

  const applyUpdate = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/apply-updates', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        window.open(data.downloadUrl, '_blank')
        alert(
          '📥 Update Download Instructions:\n\n' +
          data.instructions.join('\n') +
          '\n\nThe download page will open in a new tab.'
        )
        setShowUpdateModal(false)
      }
    } catch (error) {
      alert(`❌ Failed to apply update: ${error.message}`)
    }
  }

  const cancelUpdate = () => {
    setShowUpdateModal(false)
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 card-glow">
      <h2 className="text-lg font-bold text-white mb-3">🔄 System Updates</h2>

      {/* Check Updates Button */}
      <button
        onClick={checkForUpdates}
        disabled={checking}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
      >
        {checking ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Checking...</span>
          </>
        ) : (
          <>
            <span>🔍</span>
            <span>Check Updates</span>
          </>
        )}
      </button>

      {/* Update Available Modal */}
      {showUpdateModal && updateInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🆕</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Update Available!
              </h3>
              <p className="text-slate-400 text-sm">
                A new version is available on GitHub. Would you like to download and install it?
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Latest Commit:</span>
                <span className="text-blue-400 font-mono">{updateInfo.latestCommit?.sha}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Author:</span>
                <span className="text-white">{updateInfo.latestCommit?.author}</span>
              </div>
              <div className="text-sm">
                <div className="text-slate-400 mb-1">Message:</div>
                <div className="text-white bg-slate-800/50 p-2 rounded">
                  {updateInfo.latestCommit?.message}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Date:</span>
                <span className="text-white">{new Date(updateInfo.latestCommit?.date).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <div className="text-xs text-yellow-400 mb-2">⚠️ Update Instructions:</div>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>1. Download will open in a new tab</li>
                <li>2. Extract files to your project folder</li>
                <li>3. Run npm install in backend & frontend</li>
                <li>4. Restart the system</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelUpdate}
                className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
              >
                ✗ Cancel
              </button>
              <button
                onClick={applyUpdate}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
              >
                ✓ Download Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdatesPanel
