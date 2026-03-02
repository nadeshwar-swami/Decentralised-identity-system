import React, { createContext, useContext, useEffect, useState } from 'react'
import { PeraWalletConnect } from '@perawallet/connect'
import toast from 'react-hot-toast'

// Create Pera Wallet instance globally (outside component)
const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: true,
  chainId: 416002, // TestNet
})

const WalletContext = createContext()

/**
 * WalletProvider component - wraps app with Pera Wallet integration
 * Uses @perawallet/connect for direct Pera Wallet connection (no wrapper library)
 */
export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  // Reconnect to existing session on mount
  useEffect(() => {
    const reconnect = async () => {
      try {
        const accounts = await peraWallet.reconnectSession()
        
        if (peraWallet.isConnected && accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsConnected(true)
          localStorage.setItem('walletAddress', accounts[0])
          localStorage.setItem('walletConnected', 'true')
          console.log('✓ Wallet reconnected:', accounts[0])
        }
      } catch (err) {
        console.log('No previous session to reconnect:', err.message)
      }
    }

    reconnect()
  }, [])

  // Setup disconnect event listener
  useEffect(() => {
    const handleDisconnect = () => {
      console.log('Wallet disconnected')
      setIsConnected(false)
      setWalletAddress('')
      localStorage.removeItem('walletAddress')
      localStorage.removeItem('walletConnected')
    }

    try {
      if (peraWallet.connector) {
        peraWallet.connector.on('disconnect', handleDisconnect)
      }
    } catch (err) {
      console.error('Error setting up disconnect listener:', err)
    }

    return () => {
      try {
        if (peraWallet.connector) {
          peraWallet.connector.off('disconnect', handleDisconnect)
        }
      } catch (err) {
        console.error('Error removing disconnect listener:', err)
      }
    }
  }, [])

  /**
   * Connect wallet - opens Pera Wallet connection modal
   */
  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      const accounts = await peraWallet.connect()
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setIsConnected(true)
        localStorage.setItem('walletAddress', address)
        localStorage.setItem('walletConnected', 'true')
        
        // Setup disconnect listener after connection
        if (peraWallet.connector) {
          peraWallet.connector.on('disconnect', () => {
            setIsConnected(false)
            setWalletAddress('')
            localStorage.removeItem('walletAddress')
            localStorage.removeItem('walletConnected')
          })
        }
        
        toast.success(`Connected: ${address.substring(0, 8)}...`)
        console.log('✓ Wallet connected:', address)
      }
    } catch (err) {
      // User closed modal - don't show error
      if (err?.data?.type !== 'CONNECT_MODAL_CLOSED') {
        console.error('Connection error:', err)
        toast.error(`Connection failed: ${err.message}`)
      }
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }

  /**
   * Disconnect wallet
   */
  const disconnectWallet = async () => {
    try {
      await peraWallet.disconnect()
      setIsConnected(false)
      setWalletAddress('')
      localStorage.removeItem('walletAddress')
      localStorage.removeItem('walletConnected')
      toast.success('Wallet disconnected')
      console.log('✓ Wallet disconnected')
    } catch (err) {
      console.error('Disconnect error:', err)
      toast.error('Failed to disconnect wallet')
    }
  }

  /**
   * Sign transaction(s) with Pera Wallet
   * @param {SignerTransaction[][]} txGroups - Transaction groups to sign
   * @returns {Promise<Uint8Array[]>} Signed transactions
   */
  const signTransaction = async (txGroups) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      if (!Array.isArray(txGroups) || !Array.isArray(txGroups[0])) {
        throw new Error('txGroups must be SignerTransaction[][] format')
      }

      const signedTxns = await peraWallet.signTransaction(txGroups)
      console.log('✓ Transaction signed successfully')
      return signedTxns
    } catch (err) {
      console.error('Transaction signing failed:', err)
      
      if (err?.data?.type !== 'SIGN_TXN_CANCELLED') {
        toast.error(`Transaction signing failed: ${err.message}`)
      }
      throw err
    }
  }

  const value = {
    walletAddress,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    signTransaction,
    peraWallet, // Export instance for direct use if needed
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

/**
 * Hook to use wallet context
 * @returns {Object} Wallet context with connection methods
 */
export const useWalletContext = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider')
  }
  return context
}
