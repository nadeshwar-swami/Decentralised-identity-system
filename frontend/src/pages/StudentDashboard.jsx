import React, { useState, useCallback } from 'react'
import { useWalletContext } from '../context/WalletContext'
import { CredentialCard } from '../components/CredentialCard'
import { SelectiveDisclosure } from '../components/SelectiveDisclosure'
import { Award, Loader2, AlertCircle, FileText, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * StudentDashboard - student's identity and credential management
 * Feature 6: Student Credentials UI
 */
export const StudentDashboard = () => {
  const { walletAddress, isConnected } = useWalletContext()

  const [credentials, setCredentials] = useState([])
  const [didDocument, setDidDocument] = useState(null)
  const [loading, setLoading] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [showDIDDetails, setShowDIDDetails] = useState(false)

  // Define fetch functions first (before useEffect)
  const fetchCredentials = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/credentials/${walletAddress}`
      )

      if (!response.ok) {
        setCredentials([])
        return
      }

      const data = await response.json()
      if (data.success && data.data) {
        // Backend returns data.data.credentials as array
        setCredentials(data.data.credentials || [])
      } else {
        setCredentials([])
      }
    } catch (err) {
      console.error('Error fetching credentials:', err)
      setCredentials([])
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  const fetchDIDDocument = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/did/${walletAddress}`
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()
      if (data.success && data.data) {
        setDidDocument(data.data)
      }
    } catch (err) {
      console.error('Error fetching DID:', err)
    }
  }, [walletAddress])

  // useEffect AFTER function definitions
  React.useEffect(() => {
    if (isConnected && walletAddress) {
      fetchCredentials()
      fetchDIDDocument()
    }
  }, [walletAddress, isConnected, fetchCredentials, fetchDIDDocument])

  const handleRegisterIdentity = async () => {
    if (!walletAddress) {
      toast.error('Please connect wallet first')
      return
    }

    try {
      setRegistering(true)

      // Create DID
      const createResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/did/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: walletAddress,
            displayName: 'Student Identity',
          }),
        }
      )

      const createData = await createResponse.json()
      if (!createData.success) {
        throw new Error(createData.message || 'Failed to create DID')
      }

      const studentDID = createData.data.did

      // For now, skip on-chain registration (would require wallet signing)
      // In production, user would sign the transaction and send back the signedTxn
      
      toast.success('DID created successfully!')
      fetchDIDDocument()
    } catch (err) {
      console.error('Error registering identity:', err)
      toast.error(err.message || 'Failed to register identity')
    } finally {
      setRegistering(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="card bg-blue-50 border-blue-200 border-2">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 text-lg mb-1">Connect Your Wallet</h3>
              <p className="text-blue-800">
                Click the "Connect Wallet" button in the top right to connect Pera Wallet and access your identity dashboard.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Make sure you have Pera Wallet installed and are on the Algorand TestNet.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Identity</h1>
        <p className="text-gray-600">Manage your DID and verifiable credentials</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* DID Registration */}
          {!didDocument ? (
            <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-blue-900 mb-2">
                    Register Your Decentralized Identity
                  </h2>
                  <p className="text-blue-800 text-sm mb-4">
                    Create a W3C-compliant DID anchored on Algorand TestNet. Your identity document will be stored on IPFS and referenced on-chain.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRegisterIdentity}
                disabled={registering}
                className="btn-primary flex items-center gap-2"
              >
                {registering && <Loader2 size={16} className="animate-spin" />}
                {registering ? 'Registering...' : 'Register My Identity'}
              </button>
            </div>
          ) : (
            <div className="card border-green-200 bg-green-50">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">✓</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-green-900">DID Successfully Registered</h2>
                  <p className="text-sm text-green-800 mt-1 font-mono break-all bg-white px-3 py-2 rounded mt-2 border border-green-200">
                    {didDocument?.did}
                  </p>
                </div>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-green-900 hover:text-green-700 p-2 bg-white rounded">
                  📄 View DID Document
                </summary>
                <pre className="mt-3 bg-white p-3 rounded text-xs overflow-x-auto border border-green-200 line-clamp-20">
                  {JSON.stringify(didDocument?.didDocument, null, 2)}
                </pre>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${didDocument?.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-700 font-medium mt-2 inline-flex items-center gap-1"
                >
                  View on IPFS Gateway
                  <ExternalLink size={14} />
                </a>
              </details>
            </div>
          )}

          {/* Credentials List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Credentials</h2>
              {credentials.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  <Award size={16} />
                  {credentials.length}
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="card text-center">
                <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
                <p className="text-gray-600 mt-3">Loading credentials...</p>
              </div>
            ) : credentials.length === 0 ? (
              <div className="card text-center text-gray-500">
                <Award size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-lg font-medium">No credentials yet</p>
                <p className="text-sm mt-1">
                  {didDocument 
                    ? 'Credentials will appear here once issued by administrators'
                    : 'Register your identity first to receive credentials'}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {credentials.map((credential) => (
                  <CredentialCard 
                    key={credential.credentialId} 
                    credential={credential} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💼</span> Wallet
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Address</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all mt-1 border border-gray-200">
                  {walletAddress}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-500 text-xs uppercase tracking-wide">Network</p>
                <p className="text-sm font-medium text-blue-600 mt-1">
                  🌍 Algorand TestNet
                </p>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-500 text-xs uppercase tracking-wide">Status</p>
                <p className="text-sm font-medium text-green-600 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Connected
                </p>
              </div>
            </div>
          </div>

          {/* Share Credentials */}
          {credentials.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🔒</span> Share Credentials
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Selectively disclose your credentials to campus services
              </p>
              <SelectiveDisclosure credentials={credentials} />
            </div>
          )}

          {/* Quick Stats */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📊</span> Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Credentials</span>
                <span className="font-bold text-2xl text-blue-600">{credentials.length}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Identity</span>
                <span className={`text-lg ${didDocument ? 'text-green-600' : 'text-gray-400'}`}>
                  {didDocument ? '✓ Registered' : 'Not Registered'}
                </span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Status</span>
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
