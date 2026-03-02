import React, { useEffect, useState } from 'react'
import { useWalletContext } from '../context/WalletContext'
import { Loader2, CheckCircle, AlertCircle, ShieldCheck, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * AdminDashboard - admin credential issuance
 */
export const AdminDashboard = () => {
  const { walletAddress, isConnected } = useWalletContext()

  const [studentAddress, setStudentAddress] = useState('')
  const [credentialType, setCredentialType] = useState('STUDENT_ENROLLED')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [pendingDIDs, setPendingDIDs] = useState([])
  const [loadingPendingDIDs, setLoadingPendingDIDs] = useState(false)
  const [verifyingWallet, setVerifyingWallet] = useState('')

  const credentialTypes = [
    { value: 'STUDENT_ENROLLED', label: 'Student Enrolled' },
    { value: 'LIBRARY_ACCESS', label: 'Library Access' },
    { value: 'HOSTEL_RESIDENT', label: 'Hostel Resident' },
    { value: 'EVENT_PASS', label: 'Event Pass' },
  ]

  const fetchPendingDIDs = async () => {
    try {
      setLoadingPendingDIDs(true)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/credentials/admin/pending-dids`)
      const data = await response.json()

      if (data.success) {
        setPendingDIDs(data.data?.dids || [])
      } else {
        setPendingDIDs([])
      }
    } catch (err) {
      console.error('Error fetching pending DIDs:', err)
      setPendingDIDs([])
    } finally {
      setLoadingPendingDIDs(false)
    }
  }

  const handleVerifyDID = async (studentWalletAddress) => {
    try {
      setVerifyingWallet(studentWalletAddress)

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/credentials/admin/verify-did`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: studentWalletAddress,
          adminWallet: walletAddress,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to verify DID')
      }

      toast.success('Student DID verified successfully')
      fetchPendingDIDs()
    } catch (err) {
      console.error('Error verifying DID:', err)
      toast.error(err.message || 'Failed to verify DID')
    } finally {
      setVerifyingWallet('')
    }
  }

  useEffect(() => {
    if (isConnected) {
      fetchPendingDIDs()
    }
  }, [isConnected, walletAddress])

  const handleIssueCredential = async (e) => {
    e.preventDefault()

    if (!studentAddress.trim()) {
      toast.error('Please enter a student wallet address')
      return
    }

    try {
      setLoading(true)
      setResult(null)
      toast.loading('Issuing credential...')

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/credentials/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAddress,
          credentialType,
          issuerAddress: walletAddress,
        }),
      })

      const data = await response.json()
      toast.dismiss()

      if (data.success) {
        setResult({ success: true, data: data.data })
        toast.success('Credential issued successfully!')
        setStudentAddress('')
      } else {
        setResult({ success: false, error: data.error })
        toast.error(data.error || 'Failed to issue credential')
      }
    } catch (err) {
      console.error('Error issuing credential:', err)
      setResult({ success: false, error: err.message })
      toast.dismiss()
      toast.error('Error issuing credential')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="page-bg page-shell">
        <div className="card bg-orange-500/10 border-orange-500/20 text-center">
          <AlertCircle className="inline-block text-orange-400 mb-3" size={28} />
          <p className="text-orange-300 font-semibold">Connect your wallet to access issuance controls</p>
          <p className="text-sm text-orange-400/80 mt-2">Only authorized administrator wallets can issue credentials.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-bg page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Credential Issuance</h1>
          <p className="page-subtitle">Issue verifiable credentials with institutional governance controls.</p>
        </div>
        <div className="badge-info">
          <ShieldCheck size={14} /> Admin Workspace
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <form onSubmit={handleIssueCredential} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Student Wallet Address</label>
                <input
                  type="text"
                  value={studentAddress}
                  onChange={(e) => setStudentAddress(e.target.value)}
                  placeholder="Enter student Algorand wallet address"
                  className="input-field text-sm mono"
                  disabled={loading}
                />
                <p className="text-xs text-muted mt-2">Student must have a registered DID and completed profile.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Credential Type</label>
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  className="input-field bg-[#16161F] text-white"
                  disabled={loading}
                >
                  {credentialTypes.map((type) => (
                    <option className="bg-[#16161F] text-white" key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Issuing...' : 'Issue Credential'}
              </button>
            </form>
          </div>

          {result && (
            <div className={`card ${result.success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="text-emerald-400 flex-shrink-0 mt-1" size={20} />
                ) : (
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-3 ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>
                    {result.success ? 'Credential issued successfully' : 'Credential issuance failed'}
                  </h3>
                  {result.success && result.data && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-secondary text-xs font-semibold">Asset ID</p>
                        <p className="font-mono font-bold text-white mt-1">{result.data.assetId}</p>
                      </div>
                      <div>
                        <p className="text-secondary text-xs font-semibold">Transaction ID</p>
                        <a
                          href={`https://testnet.explorer.perawallet.app/tx/${result.data.txnId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-cyan-400 hover:text-cyan-300 text-xs break-all block mt-1"
                        >
                          {result.data.txnId}
                        </a>
                      </div>
                    </div>
                  )}
                  {!result.success && <p className="text-red-400 text-sm">{result.error}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Pending Student DIDs</h2>
              <button
                onClick={fetchPendingDIDs}
                className="text-xs text-indigo-400 hover:text-indigo-300"
                disabled={loadingPendingDIDs}
              >
                {loadingPendingDIDs ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {loadingPendingDIDs ? (
              <p className="text-sm text-secondary">Loading pending DIDs...</p>
            ) : pendingDIDs.length === 0 ? (
              <p className="text-sm text-muted">No pending DID requests right now.</p>
            ) : (
              <div className="space-y-3">
                {pendingDIDs.map((didRecord) => (
                  <div key={didRecord.walletAddress} className="p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {didRecord.fullName || didRecord.displayName || 'Student'}
                        </p>
                        <p className="text-xs text-secondary font-mono truncate mt-1">
                          {didRecord.walletAddress}
                        </p>
                        <p className="text-xs text-muted truncate mt-1">{didRecord.did}</p>
                      </div>
                      <button
                        onClick={() => handleVerifyDID(didRecord.walletAddress)}
                        disabled={verifyingWallet === didRecord.walletAddress}
                        className="btn-secondary text-sm"
                      >
                        {verifyingWallet === didRecord.walletAddress ? 'Verifying...' : 'Verify DID'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Wallet size={16} /> Issuer Wallet
            </h3>
            <p className="font-mono text-xs bg-white/5 p-3 rounded-lg break-all border border-white/10">{walletAddress}</p>
            <p className="mt-3 text-xs text-secondary">Role: <span className="font-semibold text-purple-400">Administrator</span></p>
          </div>

          <div className="panel-card-soft bg-indigo-500/10 border-indigo-500/20">
            <h3 className="font-semibold text-indigo-300 mb-3">Issuance flow</h3>
            <ol className="space-y-2 text-sm text-indigo-300/80">
              <li>1. Confirm student wallet address.</li>
              <li>2. Select credential type.</li>
              <li>3. Submit issuance transaction.</li>
              <li>4. Share transaction reference if needed.</li>
            </ol>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3">Credential catalog</h3>
            <div className="space-y-2">
              {credentialTypes.map((type) => (
                <div key={type.value} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="font-medium text-white text-sm">{type.label}</p>
                  <p className="text-xs text-muted mt-1">Standard validity: 1 year</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
