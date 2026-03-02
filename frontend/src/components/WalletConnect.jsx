import { Lock, LogOut, Loader2 } from 'lucide-react'
import { useWalletContext } from '../context/WalletContext'
import toast from 'react-hot-toast'

/**
 * WalletConnect component - handles wallet connection UI with Pera Wallet
 */
export const WalletConnect = ({ onDisconnect }) => {
  const { walletAddress, isConnected, isConnecting, connectWallet, disconnectWallet } = useWalletContext()

  const truncateAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const handleConnect = async () => {
    // Prevent double-click/multiple attempts
    if (isConnecting || isConnected) return
    
    try {
      await connectWallet()
      // No callback needed - wallet is already connected
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
          className="gradient-primary text-white border border-indigo-500/20 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-semibold text-emerald-400 mono">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-custom"></span>
            {truncateAddress(walletAddress)}
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-white/5 border border-white/10 text-slate-300 hover:text-slate-200 hover:bg-white/10 text-sm flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-all"
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
