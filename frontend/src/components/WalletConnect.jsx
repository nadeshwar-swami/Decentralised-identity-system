import { Lock, LogOut, Loader2 } from 'lucide-react'
import { useWalletContext } from '../context/WalletContext'
import toast from 'react-hot-toast'

/**
 * WalletConnect component - handles wallet connection UI with Pera Wallet
 */
export const WalletConnect = ({ onConnect, onDisconnect }) => {
  const { walletAddress, isConnected, isConnecting, connectWallet, disconnectWallet } = useWalletContext()

  const truncateAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const handleConnect = async () => {
    try {
      await connectWallet()
      onConnect?.()
    } catch (err) {
      console.error('Failed to connect wallet:', err)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
      onDisconnect?.()
    } catch (err) {
      console.error('Failed to disconnect:', err)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="btn-primary flex items-center gap-2 hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Lock size={16} />
              Connect Wallet
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            {truncateAddress(walletAddress)}
          </div>
          <button
            onClick={handleDisconnect}
            className="btn-secondary text-sm flex items-center gap-1 hover:bg-gray-300 transition-colors"
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
