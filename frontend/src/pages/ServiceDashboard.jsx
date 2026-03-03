import React, { useEffect, useState } from 'react'
import { VerifyPanel } from '../components/VerifyPanel'
import { CheckCircle, Clock, Shield, Loader2, Star, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * ServiceDashboard - campus service verification
 * Feature 8 implementation: Service verification and trust management
 */
export const ServiceDashboard = () => {
  const SERVICE_STORAGE_KEY = 'campus_did_service_id'
  const [activeTab, setActiveTab] = useState('register') // register, verify, stats
  const [verification, setVerification] = useState(null)
  const [serviceId, setServiceId] = useState(null)
  const [serviceName, setServiceName] = useState('')
  const [serviceType, setServiceType] = useState('employer')
  const [contactEmail, setContactEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [presentationId, setPresentationId] = useState('')
  const [verifyingPresentation, setVerifyingPresentation] = useState(false)
  const [verificationStats, setVerificationStats] = useState(null)
  const [studentDid, setStudentDid] = useState('')
  const [requestingAccess, setRequestingAccess] = useState(false)
  const [generatedShareLink, setGeneratedShareLink] = useState('')

  const handleRegisterService = async (e) => {
    e.preventDefault()

    if (!serviceName || !contactEmail) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/services/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName,
          serviceType,
          contactEmail,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to register service')
      }

      setServiceId(data.data.serviceId)
      localStorage.setItem(SERVICE_STORAGE_KEY, data.data.serviceId)
      toast.success('Service registered successfully!')
      setActiveTab('verify')

      // Fetch service stats
      fetchServiceStats(data.data.serviceId)
    } catch (err) {
      console.error('Error registering service:', err)
      toast.error(err.message || 'Failed to register service')
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceStats = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/services/${id}`
      )
      const data = await response.json()
      if (data.success) {
        setVerificationStats(data.data)
        setServiceName(data.data.serviceName || '')
        setServiceType(data.data.serviceType || 'employer')
        setContactEmail(data.data.contactEmail || '')
      } else {
        localStorage.removeItem(SERVICE_STORAGE_KEY)
        setServiceId(null)
        setActiveTab('register')
      }
    } catch (err) {
      console.error('Error fetching service stats:', err)
      localStorage.removeItem(SERVICE_STORAGE_KEY)
      setServiceId(null)
      setActiveTab('register')
    }
  }

  useEffect(() => {
    const savedServiceId = localStorage.getItem(SERVICE_STORAGE_KEY)
    if (!savedServiceId) {
      return
    }

    setServiceId(savedServiceId)
    setActiveTab('verify')
    fetchServiceStats(savedServiceId)
  }, [])

  const handleVerifyPresentation = async () => {
    if (!serviceId || !presentationId.trim()) {
      toast.error('Please enter a presentation ID')
      return
    }

    try {
      setVerifyingPresentation(true)

      // Mock student DID for this demo
      const appId = import.meta.env.VITE_APP_ID || '756415000'
      const studentDID = `did:algo:app:${appId}:student_${Math.random().toString(36).substring(7)}`

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/services/${serviceId}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            presentationId,
            studentDID,
            credentialIds: ['cred_1', 'cred_2'],
            verificationPurpose: 'employment',
          }),
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to verify presentation')
      }

      setVerification(data.data)
      setPresentationId('')
      toast.success('Presentation verified successfully!')
    } catch (err) {
      console.error('Error verifying presentation:', err)
      toast.error(err.message || 'Failed to verify presentation')
    } finally {
      setVerifyingPresentation(false)
    }
  }

  const handleRequestAccessFromDid = async () => {
    if (!serviceId || !studentDid.trim()) {
      toast.error('Please enter a student DID')
      return
    }

    try {
      setRequestingAccess(true)

      // Extract wallet from DID (did:algo:app:APP_ID:WALLET)
      const didParts = studentDid.split(':')
      const walletAddress = didParts[didParts.length - 1]

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/selective-disclosure/request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentDid: studentDid,
            studentWallet: walletAddress,
            serviceId: serviceId,
            serviceName: serviceName,
            requestedData: ['did', 'credentials'],
          }),
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create access request')
      }

      const requestId = data.data.requestId
      const shareLink = `${window.location.origin}/share?requestId=${requestId}&serviceId=${serviceId}`
      
      toast.success('Access request created!')
      setGeneratedShareLink(shareLink)
      
      setStudentDid('')
    } catch (err) {
      console.error('Error requesting access:', err)
      toast.error(err.message || 'Failed to create access request')
    } finally {
      setRequestingAccess(false)
    }
  }

  return (
    <div className="page-bg page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Verification</h1>
          <p className="page-subtitle">Register your service and verify student credentials with trust scoring.</p>
        </div>
        {serviceId && (
          <div className="badge-info">
            <CheckCircle size={14} /> Service Active
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      {serviceId && (
        <div className="mb-6 flex gap-2 border-b border-white/10">
          {['verify', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-indigo-400 text-indigo-300'
                  : 'border-transparent text-secondary hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {!serviceId ? (
        // Service Registration
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield size={28} className="text-indigo-400" />
              Register Your Service
            </h2>

            <form onSubmit={handleRegisterService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g., Tech Corp, Global Employer LLC"
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="input-field w-full bg-white/5 border-white/10 text-white"
                >
                  <option value="employer" className="bg-[#16161F] text-white">Employer</option>
                  <option value="library" className="bg-[#16161F] text-white">Library</option>
                  <option value="hostel" className="bg-[#16161F] text-white">Hostel</option>
                  <option value="events" className="bg-[#16161F] text-white">Events</option>
                  <option value="other" className="bg-[#16161F] text-white">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="service@example.com"
                  className="input-field w-full"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Registering...' : 'Register Service'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <p className="text-sm text-indigo-300">
                By registering, you agree to verify only authorized student credentials and maintain
                privacy standards.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Service Dashboard
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'verify' && (
              <>
                {/* Verification Stats */}
                {verificationStats && (
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="card">
                      <p className="text-sm text-muted">Total Verifications</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {verificationStats.verificationStatistics.total}
                      </p>
                    </div>
                    <div className="card">
                      <p className="text-sm text-muted">Success Rate</p>
                      <p className="text-3xl font-bold text-emerald-400 mt-2">
                        {verificationStats.verificationStatistics.successRate}%
                      </p>
                    </div>
                    <div className="card">
                      <p className="text-sm text-secondary">Avg Trust Score</p>
                      <p className="text-3xl font-bold text-indigo-400 mt-2">
                        {verificationStats.verificationStatistics.averageTrustScore}/100
                      </p>
                    </div>
                  </div>
                )}

                {/* Presentation Verification */}
                <div className="card">
                  <h3 className="text-lg font-bold text-white mb-4">Verify Student Presentation</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Presentation ID
                      </label>
                      <input
                        type="text"
                        value={presentationId}
                        onChange={(e) => setPresentationId(e.target.value)}
                        placeholder="Paste presentation ID here"
                        className="input-field w-full"
                      />
                      <p className="text-xs text-muted mt-2">
                        The student will provide their presentation ID when applying
                      </p>
                    </div>

                    <button
                      onClick={handleVerifyPresentation}
                      disabled={verifyingPresentation || !presentationId}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {verifyingPresentation && <Loader2 size={18} className="animate-spin" />}
                      {verifyingPresentation ? 'Verifying...' : 'Verify Presentation'}
                    </button>
                  </div>
                </div>

                {/* DID Scanner & Selective Disclosure */}
                <div className="card bg-indigo-500/10 border-indigo-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">Student DID</h3>
                  <p className="text-sm text-secondary mb-4">
                    Request the student's DID to access their credentials. They will choose what to share with you.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Student DID
                      </label>
                      <input
                        type="text"
                        value={studentDid}
                        onChange={(e) => setStudentDid(e.target.value)}
                        placeholder="did:algo:app:756415000:WALLET_ADDRESS or just wallet address"
                        className="input-field w-full"
                      />
                      <p className="text-xs text-muted mt-2">
                        Scan QR code or paste the student's DID/wallet address
                      </p>
                    </div>

                    <button
                      onClick={handleRequestAccessFromDid}
                      disabled={requestingAccess || !studentDid}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {requestingAccess && <Loader2 size={18} className="animate-spin" />}
                      {requestingAccess ? 'Creating Request...' : 'Request Access'}
                    </button>

                    {generatedShareLink && (
                      <div className="bg-white/5 rounded p-3 border border-white/10 space-y-2">
                        <p className="text-xs text-muted">Share Link</p>
                        <input
                          type="text"
                          readOnly
                          value={generatedShareLink}
                          className="input-field w-full font-mono text-xs"
                        />
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(generatedShareLink)
                              toast.success('Link copied')
                            } catch (err) {
                              toast.error('Failed to copy link')
                            }
                          }}
                          className="btn-secondary w-full"
                        >
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Result */}
                {verification && (
                  <div className="panel-card bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle className="text-emerald-400 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-300">
                          ✓ Verification Successful
                        </h3>
                        <p className="text-sm text-emerald-300/80 mt-1">
                          Verified on {new Date(verification.verificationRecord?.verification?.performedAt || new Date()).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded p-4 space-y-3 border border-white/10">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted uppercase font-semibold">Student DID</p>
                          <p className="font-mono text-xs break-all text-white mt-1">
                            {verification.studentDID}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted uppercase font-semibold">Presentation ID</p>
                          <p className="font-mono text-xs break-all text-white mt-1">
                            {verification.presentationId}
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        <div>
                          <p className="text-xs text-muted uppercase font-semibold">Trust Score</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="text-2xl font-bold text-indigo-400">{verification.trustScore}</div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < Math.round(verification.trustScore / 20) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted uppercase font-semibold">Credentials</p>
                          <p className="text-2xl font-bold text-white mt-2">{verification.credentialCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted uppercase font-semibold">Status</p>
                          <p className={`text-2xl font-bold mt-2 ${verification.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                            {verification.isValid ? '✓ Valid' : '✗ Invalid'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'stats' && verificationStats && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Verification Statistics
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <p className="text-sm text-muted">Total Verifications</p>
                      <p className="text-3xl font-bold text-indigo-300 mt-2">
                        {verificationStats.verificationStatistics.total}
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <p className="text-sm text-muted">Valid Verifications</p>
                      <p className="text-3xl font-bold text-emerald-400 mt-2">
                        {verificationStats.verificationStatistics.valid}
                      </p>
                    </div>
                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <p className="text-sm text-muted">Success Rate</p>
                      <p className="text-3xl font-bold text-amber-400 mt-2">
                        {verificationStats.verificationStatistics.successRate}%
                      </p>
                    </div>
                    <div className="p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
                      <p className="text-sm text-muted">Avg Trust Score</p>
                      <p className="text-3xl font-bold text-violet-400 mt-2">
                        {verificationStats.verificationStatistics.averageTrustScore}/100
                      </p>
                    </div>
                  </div>
                </div>

                {verificationStats.recentVerifications && (
                  <div className="card">
                    <h3 className="font-bold text-white mb-4">Recent Verifications</h3>
                    <div className="space-y-2">
                      {verificationStats.recentVerifications.map((v) => (
                        <div key={v.verificationId} className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-mono text-secondary">{v.studentDID}</p>
                              <p className="text-xs text-muted mt-1">
                                {new Date(v.performedAt).toLocaleString()}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-indigo-400">Score: {v.trustScore}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Info */}
            <div className="card">
              <h3 className="font-bold text-white mb-4">🏢 Service Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted uppercase font-semibold">Service</p>
                  <p className="font-bold text-white mt-1">{serviceName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase font-semibold">Type</p>
                  <p className="font-bold text-white mt-1 capitalize">{serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase font-semibold">Service ID</p>
                  <p className="font-mono text-xs text-secondary break-all mt-1">{serviceId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase font-semibold">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <p className="font-bold text-emerald-400">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="panel-card-soft bg-indigo-500/10 border-indigo-500/20">
              <h3 className="font-semibold text-indigo-300 mb-3">Verification Flow</h3>
              <ol className="space-y-2 text-xs text-indigo-300/80">
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0">1.</span>
                  <span>Student creates a presentation</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0">2.</span>
                  <span>Shares presentation ID</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0">3.</span>
                  <span>Paste ID above</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0">4.</span>
                  <span>Click "Verify"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0">5.</span>
                  <span>Review trust score</span>
                </li>
              </ol>
            </div>

            {/* Network Info */}
            <div className="card">
              <h3 className="font-semibold text-white mb-3">Network</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Network</span>
                  <span className="font-bold text-white">Algorand TestNet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">App ID</span>
                  <span className="font-mono text-xs text-white">756415000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
