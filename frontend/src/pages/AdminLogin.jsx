import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletContext } from '../context/WalletContext'
import { useRoleContext } from '../context/RoleContext'
import { AlertCircle, Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * AdminLogin Page
 * Admins must connect with an authorized wallet address to access admin dashboard
 */
export const AdminLogin = () => {
  const navigate = useNavigate()
  const { walletAddress, isConnected, connectWallet } = useWalletContext()
  const { switchRole } = useRoleContext()

  const [authorizedAdmins, setAuthorizedAdmins] = useState([])
  const [verifying, setVerifying] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // List of hardcoded authorized admin wallets (should match backend AUTHORIZED_ADMINS)
  // In production, this would be fetched from backend
  const HARDCODED_ADMINS = [
    'FVAPL2RSBVYK7IMOUYRKW2HRC34622TWTQKT3GARPDZIUG3QKRPNMEVJX4', // Default test admin
  ]

  useEffect(() => {
    setAuthorizedAdmins(HARDCODED_ADMINS)
  }, [])

  useEffect(() => {
    if (isConnected && walletAddress) {
      // Check if connected wallet is authorized
      const authorized = authorizedAdmins.some(
        (admin) => admin.toUpperCase() === walletAddress.toUpperCase()
      )
      setIsAuthorized(authorized)

      if (authorized) {
        toast.success('✓ Authorized admin wallet connected!', { duration: 3000 })
      }
    }
  }, [isConnected, walletAddress, authorizedAdmins])

  const handleConnectWallet = async () => {
    try {
      setVerifying(true)
      await connectWallet()
    } catch (err) {
      toast.error('Failed to connect wallet: ' + err.message)
    } finally {
      setVerifying(false)
    }
  }

  const handleEnterAdminDashboard = () => {
    if (!isAuthorized) {
      toast.error('❌ Unauthorized wallet address. Only authorized admins can access this area.')
      return
    }
    switchRole('admin')
    navigate('/admin')
  }

  const handleGoBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-4 rounded-lg">
              <Lock size={40} className="text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600">
            Connect your authorized admin wallet to issue credentials
          </p>
        </div>

        {/* Main Card */}
        <div className="card border-2 border-purple-200 mb-6">
          {/* Status Indicator */}
          <div className="mb-6">
            {!isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <AlertCircle className="inline-block text-yellow-600 mb-2" size={24} />
                <p className="text-yellow-800 font-medium">Wallet Not Connected</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Connect your wallet to verify admin authorization
                </p>
              </div>
            ) : isAuthorized ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="inline-block text-green-600 mb-2" size={24} />
                <p className="text-green-800 font-medium">✓ Authorized Admin</p>
                <p className="text-green-700 text-sm mt-1 font-mono text-xs break-all">
                  {walletAddress}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <AlertCircle className="inline-block text-red-600 mb-2" size={24} />
                <p className="text-red-800 font-medium">⛔ Unauthorized Wallet</p>
                <p className="text-red-700 text-sm mt-1">
                  This wallet is not authorized to issue credentials
                </p>
              </div>
            )}
          </div>

          {/* Connected Wallet Info */}
          {isConnected && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Connected Wallet</p>
              <p className="font-mono text-sm break-all text-gray-900">{walletAddress}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isConnected ? (
              <button
                onClick={handleConnectWallet}
                disabled={verifying}
                className="btn-primary w-full"
              >
                {verifying ? 'Connecting...' : 'Connect Wallet for Admin'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleEnterAdminDashboard}
                  disabled={!isAuthorized}
                  className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    isAuthorized
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Lock size={18} />
                  {isAuthorized ? 'Enter Admin Dashboard' : 'Access Denied'}
                </button>
                <button
                  onClick={handleConnectWallet}
                  className="btn-secondary w-full"
                >
                  Connect Different Wallet
                </button>
              </>
            )}
          </div>
        </div>

        {/* Authorized Admins List */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm">ℹ️ Authorized Admins</h3>
          <div className="space-y-2">
            {authorizedAdmins.length > 0 ? (
              authorizedAdmins.map((admin, idx) => (
                <div key={idx} className="p-2 bg-white rounded border border-blue-100">
                  <p className="font-mono text-xs break-all text-gray-700">{admin}</p>
                </div>
              ))
            ) : (
              <p className="text-blue-800 text-sm">No authorized admins configured</p>
            )}
          </div>
          <p className="text-xs text-blue-700 mt-3">
            💡 Only wallets listed above can issue credentials. Contact a system administrator to add your wallet.
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-xs text-gray-600">
            🔒 <strong>Security:</strong> Admin access is restricted to authorized wallets only. Credential issuance requires blockchain verification.
          </p>
        </div>
      </div>
    </div>
  )
}
