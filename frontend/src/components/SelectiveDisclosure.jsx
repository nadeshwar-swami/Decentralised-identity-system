import React, { useState, useEffect } from 'react'
import { Loader2, LockKeyhole, Trash2, RefreshCw } from 'lucide-react'
import { useWalletContext } from '../context/WalletContext'
import toast from 'react-hot-toast'

/**
 * SelectiveDisclosure component - for credential sharing with privacy controls
 * Feature 7: Selective Disclosure with backend verification
 */
export const SelectiveDisclosure = ({ credentials = [], onProofGenerated }) => {
  const { walletAddress } = useWalletContext()

  const [selectedCredentials, setSelectedCredentials] = useState([])
  const [selectedService, setSelectedService] = useState('general')
  const [loading, setLoading] = useState(false)
  const [proof, setProof] = useState(null)
  const [showProof, setShowProof] = useState(false)
  const [presentations, setPresentations] = useState([])
  const [loadingPresentations, setLoadingPresentations] = useState(false)
  const [showPresentations, setShowPresentations] = useState(false)

  // Fetch existing presentations on mount
  useEffect(() => {
    if (walletAddress && credentials.length > 0) {
      fetchPresentations()
    }
  }, [walletAddress, credentials.length])

  const fetchPresentations = async () => {
    try {
      setLoadingPresentations(true)
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/credentials/presentations/${walletAddress}`
      )
      const data = await response.json()
      if (data.success) {
        setPresentations(data.data.presentations || [])
      }
    } catch (err) {
      console.error('Error fetching presentations:', err)
    } finally {
      setLoadingPresentations(false)
    }
  }

  const toggleCredential = (credentialId) => {
    setSelectedCredentials((prev) =>
      prev.includes(credentialId)
        ? prev.filter((id) => id !== credentialId)
        : [...prev, credentialId]
    )
  }

  const generateProof = async () => {
    if (selectedCredentials.length === 0) {
      toast.error('Please select at least one credential')
      return
    }

    try {
      setLoading(true)

      // Get the student DID from credentials
      const selectedCreds = credentials.filter((c) => selectedCredentials.includes(c.credentialId))
      const studentDID = selectedCreds[0]?.studentDID || `did:algo:test:${walletAddress}`

      console.log('Creating presentation with:', {
        studentDID,
        studentWallet: walletAddress,
        credentialIds: selectedCredentials,
        service: selectedService,
      })

      // Call backend to create presentation
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/credentials/presentations/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentDID,
            studentWallet: walletAddress,
            credentialIds: selectedCredentials,
            service: selectedService,
            expiresInHours: 24,
          }),
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create presentation')
      }

      setProof(data.data)
      setShowProof(true)
      onProofGenerated?.(data.data)
      toast.success('Proof generated successfully!')

      // Refresh presentations list
      setTimeout(() => fetchPresentations(), 1000)
    } catch (err) {
      console.error('Error generating proof:', err)
      toast.error(err.message || 'Failed to generate proof')
    } finally {
      setLoading(false)
    }
  }

  const revokePresentation = async (presentationId) => {
    if (!window.confirm('Are you sure you want to revoke this presentation?')) {
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/credentials/presentations/${presentationId}/revoke`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to revoke presentation')
      }

      toast.success('Presentation revoked')
      fetchPresentations()
    } catch (err) {
      console.error('Error revoking presentation:', err)
      toast.error(err.message || 'Failed to revoke presentation')
    }
  }

  if (!credentials || credentials.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <LockKeyhole size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm">No credentials to share</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Credential Selection Form */}
      <div className="space-y-3">
        <div className="card">
          <h3 className="font-semibold mb-4 text-gray-900">Select Credentials to Share</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {credentials.map((credential) => (
              <label
                key={credential.credentialId}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer transition border border-transparent hover:border-gray-200"
              >
                <input
                  type="checkbox"
                  checked={selectedCredentials.includes(credential.credentialId)}
                  onChange={() => toggleCredential(credential.credentialId)}
                  className="w-4 h-4 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {credential.program || credential.credentialType}
                  </p>
                  <p className="text-xs text-gray-500">
                    {credential.credentialType}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Service Selection */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-900 mb-2">Share With</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="input-field w-full"
          >
            <option value="general">General Service</option>
            <option value="library">Library Access</option>
            <option value="hostel">Hostel Management</option>
            <option value="events">Event Registration</option>
            <option value="employer">Potential Employer</option>
          </select>
        </div>

        {/* Generate Proof Button */}
        <button
          onClick={generateProof}
          disabled={selectedCredentials.length === 0 || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Generating...' : `Generate Proof (${selectedCredentials.length})`}
        </button>
      </div>

      {/* Proof Display */}
      {proof && showProof && (
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">✓</span>
            <div className="flex-1">
              <p className="font-semibold text-green-900">Proof Generated Successfully</p>
              <p className="text-xs text-green-700 mt-1 font-mono break-all">
                {proof.presentationId}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Valid until {new Date(proof.expiresAt).toLocaleString()}
              </p>
            </div>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-green-700 hover:text-green-900 p-2 -mx-2 -my-1 hover:bg-white/50 rounded transition">
              📋 View Proof Details
            </summary>
            <div className="mt-3 p-3 bg-white rounded border border-green-200">
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-gray-600 font-medium">Presentation ID:</p>
                  <p className="font-mono text-gray-900 truncate">{proof.presentationId}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Service:</p>
                  <p className="font-semibold text-gray-900 italic">{proof.service}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Shared Credentials:</p>
                  <p className="font-mono text-gray-900">{proof.credentialCount}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Created At:</p>
                  <p className="font-mono text-gray-900">{new Date(proof.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Expires At:</p>
                  <p className="font-mono text-gray-900">{new Date(proof.expiresAt).toLocaleString()}</p>
                </div>
              </div>
              {proof.presentation && (
                <pre className="mt-3 p-2 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto max-h-48 overflow-y-auto">
                  {JSON.stringify(proof.presentation, null, 2)}
                </pre>
              )}
            </div>
          </details>

          <button
            onClick={() => setShowProof(false)}
            className="mt-3 text-sm font-medium text-green-600 hover:text-green-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Presentations History */}
      {presentations.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Proof History</h3>
            <button
              onClick={fetchPresentations}
              disabled={loadingPresentations}
              className="p-2 hover:bg-gray-100 rounded transition"
              title="Refresh"
            >
              <RefreshCw size={16} className={loadingPresentations ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {presentations.map((pres) => (
              <div key={pres.presentationId} className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {pres.service.charAt(0).toUpperCase() + pres.service.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                      {pres.presentationId}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>{pres.credentialCount} credential{pres.credentialCount !== 1 ? 's' : ''}</span>
                      <span>{new Date(pres.createdAt).toLocaleDateString()}</span>
                      {pres.isExpired && <span className="text-red-600 font-medium">Expired</span>}
                      {pres.isRevoked && <span className="text-red-600 font-medium">Revoked</span>}
                    </div>
                  </div>
                  {!pres.isRevoked && !pres.isExpired && (
                    <button
                      onClick={() => revokePresentation(pres.presentationId)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded transition ml-2"
                      title="Revoke proof"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded border border-gray-200 flex gap-2">
        <LockKeyhole size={14} className="flex-shrink-0 mt-0.5" />
        <p>
          Only the credentials you select will be shared. You can revoke access anytime by revoking the proof.
          Proofs expire after 24 hours.
        </p>
      </div>
    </div>
  )
}
