import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useWalletContext } from '../context/WalletContext'
import { CheckCircle, AlertCircle, Loader2, Shield, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * SelectiveDisclosureRequest - Student view for handling service data requests
 * Allows students to selectively share their DID and credentials with services
 */
export const SelectiveDisclosureRequest = () => {
  const { walletAddress, isConnected } = useWalletContext()
  const location = useLocation()
  
  const [loading, setLoading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [credentials, setCredentials] = useState([])
  const [didDocument, setDidDocument] = useState(null)
  const [selectedFields, setSelectedFields] = useState({})
  const [serviceInfo, setServiceInfo] = useState(null)
  const [requestId, setRequestId] = useState(null)
  const [shared, setShared] = useState(false)
  const [showAllFields, setShowAllFields] = useState({})

  // Get request info from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const id = params.get('requestId')
    const serviceId = params.get('serviceId')
    
    if (id) setRequestId(id)
    if (serviceId) {
      fetchServiceInfo(serviceId)
    }
  }, [location])

  // Fetch credentials and DID
  useEffect(() => {
    if (!isConnected || !walletAddress) return
    
    fetchCredentialsAndDID()
  }, [walletAddress, isConnected])

  const fetchCredentialsAndDID = async () => {
    try {
      setLoading(true)
      
      // Fetch credentials
      const credRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/credentials/${walletAddress}`
      )
      if (credRes.ok) {
        const data = await credRes.json()
        setCredentials(data.data?.credentials || [])
        
        // Initialize selected fields
        const initial = {}
        if (data.data?.credentials) {
          data.data.credentials.forEach((cred, idx) => {
            initial[idx] = !!cred.metadata // Share by default if metadata exists
          })
        }
        setSelectedFields(initial)
      }
      
      // Fetch DID
      const didRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/did/${walletAddress}`
      )
      if (didRes.ok) {
        const data = await didRes.json()
        setDidDocument(data.data?.didDocument)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Failed to load your credentials')
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceInfo = async (serviceId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/services/${serviceId}`
      )
      if (response.ok) {
        const data = await response.json()
        setServiceInfo(data.data)
      }
    } catch (err) {
      console.error('Error fetching service:', err)
    }
  }

  const toggleField = (credentialIndex) => {
    setSelectedFields(prev => ({
      ...prev,
      [credentialIndex]: !prev[credentialIndex]
    }))
  }

  const toggleShowFields = (credentialIndex) => {
    setShowAllFields(prev => ({
      ...prev,
      [credentialIndex]: !prev[credentialIndex]
    }))
  }

  const handleShareData = async () => {
    const selectedCredentials = credentials
      .map((cred, idx) => selectedFields[idx] ? cred : null)
      .filter(Boolean)

    if (selectedCredentials.length === 0) {
      toast.error('Please select at least one credential to share')
      return
    }

    try {
      setSharing(true)

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/selective-disclosure/share`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentWallet: walletAddress,
            studentDid: didDocument?.id,
            credentialIds: selectedCredentials.map(c => c.id),
            requestId: requestId,
            serviceId: serviceInfo?.id,
          }),
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to share data')
      }

      setShared(true)
      toast.success('Data shared successfully with service!')
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        if (requestId) {
          window.location.href = `/?verificationId=${data.data.verificationId}`
        }
      }, 2000)
    } catch (err) {
      console.error('Error sharing data:', err)
      toast.error(err.message || 'Failed to share data')
    } finally {
      setSharing(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="page-bg page-shell">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <AlertCircle className="text-amber-400 mb-3" size={24} />
            <h2 className="text-xl font-bold text-amber-300 mb-2">Connect Your Wallet</h2>
            <p className="text-amber-300/80">Please connect your wallet to view and share your credentials with services.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-bg page-shell flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-400 mb-4 mx-auto" size={40} />
          <p className="text-secondary">Loading your credentials...</p>
        </div>
      </div>
    )
  }

  if (shared) {
    return (
      <div className="page-bg page-shell">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
            <div className="flex items-start gap-4">
              <CheckCircle className="text-emerald-400 flex-shrink-0 mt-1" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-emerald-300 mb-2">Data Shared Successfully</h2>
                <p className="text-emerald-300/80">Your selected credentials have been securely shared with the service.</p>
                <p className="text-sm text-emerald-400 mt-3 font-mono">{walletAddress}</p>
                <p className="text-xs text-secondary mt-4">Redirecting...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-bg page-shell">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Share Your Credentials</h1>
          <p className="text-secondary">Review what you're sharing and select which credentials to provide</p>
        </div>

        {/* Service Info */}
        {serviceInfo && (
          <div className="card bg-indigo-500/10 border-indigo-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted uppercase font-semibold">Service Requesting Access</p>
                <h2 className="text-2xl font-bold text-white mt-2">{serviceInfo.serviceName}</h2>
                <p className="text-secondary mt-2">{serviceInfo.contactEmail}</p>
              </div>
              <Shield className="text-indigo-400 flex-shrink-0" size={32} />
            </div>
          </div>
        )}

        {/* Your DID */}
        {didDocument && (
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-cyan-400" />
              Your Decentralized Identity
            </h3>
            <div className="bg-white/5 p-4 rounded border border-white/10">
              <p className="text-xs text-muted uppercase mb-2">Your DID</p>
              <p className="font-mono text-sm text-cyan-300 break-all">{didDocument.id}</p>
            </div>
            <p className="text-xs text-secondary mt-3">
              This is your unique decentralized identifier. The service will always see this to verify your identity.
            </p>
          </div>
        )}

        {/* Credentials Selection */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Select Credentials to Share</h3>
          
          {credentials.length === 0 ? (
            <div className="p-4 bg-white/5 rounded border border-white/10 text-center">
              <p className="text-secondary">No credentials yet. Ask your administrator to issue credentials.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {credentials.map((credential, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border transition ${
                    selectedFields[idx]
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFields[idx] || false}
                        onChange={() => toggleField(idx)}
                        className="mt-1 w-5 h-5 accent-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-white">{credential.type || credential.name || 'Credential'}</p>
                        <p className="text-xs text-muted mt-1">
                          Issued: {new Date(credential.issuanceDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {selectedFields[idx] && (
                      <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                    )}
                  </div>

                  {/* Credential Preview */}
                  {selectedFields[idx] && (
                    <div className="bg-white/5 p-3 rounded mt-3 border border-white/10">
                      <button
                        onClick={() => toggleShowFields(idx)}
                        className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-2 mb-3"
                      >
                        {showAllFields[idx] ? (
                          <>
                            <EyeOff size={14} /> Hide Fields
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> Show Fields
                          </>
                        )}
                      </button>

                      {showAllFields[idx] && (
                        <div className="space-y-2 text-xs">
                          {Object.entries(credential.metadata || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted capitalize">{key}:</span>
                              <span className="text-white font-mono">{String(value).substring(0, 40)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-cyan-500/10 rounded border border-cyan-500/20">
            <p className="text-sm text-cyan-300">
              [Note] You control which credentials are shared. The service only receives what you select here.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleShareData}
            disabled={sharing || credentials.length === 0 || Object.values(selectedFields).every(v => !v)}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {sharing && <Loader2 size={18} className="animate-spin" />}
            {sharing ? 'Sharing...' : 'Share Selected Credentials'}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="card bg-white/5 border-white/10">
          <p className="text-xs text-muted leading-relaxed">
            [PRIVACY] Your data is encrypted and transmitted securely. The service cannot access credentials you don't explicitly share. 
            You can revoke access at any time from your Student Dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
