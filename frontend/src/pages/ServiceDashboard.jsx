import React, { useState } from 'react'
import { VerifyPanel } from '../components/VerifyPanel'
import { CheckCircle, Clock, Shield, Loader2, Star, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * ServiceDashboard - campus service verification
 * Feature 8 implementation: Service verification and trust management
 */
export const ServiceDashboard = () => {
  const [activeTab, setActiveTab] = useState('register') // register, verify, history
  const [verification, setVerification] = useState(null)
  const [verificationHistory, setVerificationHistory] = useState([])
  const [serviceId, setServiceId] = useState(null)
  const [serviceName, setServiceName] = useState('')
  const [serviceType, setServiceType] = useState('employer')
  const [contactEmail, setContactEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [presentationId, setPresentationId] = useState('')
  const [verifyingPresentation, setVerifyingPresentation] = useState(false)
  const [verificationStats, setVerificationStats] = useState(null)

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
      }
    } catch (err) {
      console.error('Error fetching service stats:', err)
    }
  }

  const handleVerifyPresentation = async () => {
    if (!serviceId || !presentationId.trim()) {
      toast.error('Please enter a presentation ID')
      return
    }

    try {
      setVerifyingPresentation(true)

      // Mock student DID for this demo
      const studentDID = `did:algo:test:student_${Math.random().toString(36).substring(7)}`

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
      setVerificationHistory((prev) => [
        {
          id: data.data.verificationId,
          timestamp: data.data.verification.performedAt,
          studentDID: data.data.studentDID,
          credentialCount: data.data.credentialCount,
          isValid: data.data.isValid,
          trustScore: data.data.trustScore,
        },
        ...prev,
      ])
      setPresentationId('')
      toast.success('Presentation verified successfully!')
    } catch (err) {
      console.error('Error verifying presentation:', err)
      toast.error(err.message || 'Failed to verify presentation')
    } finally {
      setVerifyingPresentation(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Verification</h1>
        <p className="text-gray-600">Register your service and verify student credentials</p>
      </div>

      {/* Tab Navigation */}
      {serviceId && (
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {['verify', 'history', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Shield size={28} className="text-blue-600" />
              Register Your Service
            </h2>

            <form onSubmit={handleRegisterService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
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
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="employer">Employer</option>
                  <option value="library">Library</option>
                  <option value="hostel">Hostel</option>
                  <option value="events">Events</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
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

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                📋 By registering, you agree to verify only authorized student credentials and maintain
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
                      <p className="text-sm text-gray-600">Total Verifications</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {verificationStats.verificationStatistics.total}
                      </p>
                    </div>
                    <div className="card">
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {verificationStats.verificationStatistics.successRate}%
                      </p>
                    </div>
                    <div className="card">
                      <p className="text-sm text-gray-600">Avg Trust Score</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {verificationStats.verificationStatistics.averageTrustScore}/100
                      </p>
                    </div>
                  </div>
                )}

                {/* Presentation Verification */}
                <div className="card">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Verify Student Presentation</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Presentation ID
                      </label>
                      <input
                        type="text"
                        value={presentationId}
                        onChange={(e) => setPresentationId(e.target.value)}
                        placeholder="Paste presentation ID here"
                        className="input-field w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">
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

                {/* Verification Result */}
                {verification && (
                  <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          ✓ Verification Successful
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Verified on {new Date(verification.verification.performedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded p-4 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Student DID</p>
                          <p className="font-mono text-xs break-all text-gray-900 mt-1">
                            {verification.studentDID}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Presentation ID</p>
                          <p className="font-mono text-xs break-all text-gray-900 mt-1">
                            {verification.presentationId}
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Trust Score</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="text-2xl font-bold text-blue-600">{verification.trustScore}</div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < Math.round(verification.trustScore / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Credentials</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">{verification.credentialCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                          <p className={`text-2xl font-bold mt-2 ${verification.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {verification.isValid ? '✓ Valid' : '✗ Invalid'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'history' && (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Verification History</h3>

                {verificationHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No verifications yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {verificationHistory.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                record.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {record.isValid ? '✓ Valid' : '✗ Invalid'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(record.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm font-mono text-gray-600 break-all">
                              {record.studentDID}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {record.credentialCount} credential{record.credentialCount !== 1 ? 's' : ''} •
                              Trust Score: {record.trustScore}/100
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && verificationStats && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Verification Statistics
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Verifications</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {verificationStats.verificationStatistics.total}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Valid Verifications</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {verificationStats.verificationStatistics.valid}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-3xl font-bold text-yellow-600 mt-2">
                        {verificationStats.verificationStatistics.successRate}%
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Avg Trust Score</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {verificationStats.verificationStatistics.averageTrustScore}/100
                      </p>
                    </div>
                  </div>
                </div>

                {verificationStats.recentVerifications && (
                  <div className="card">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Verifications</h3>
                    <div className="space-y-2">
                      {verificationStats.recentVerifications.map((v) => (
                        <div key={v.verificationId} className="p-3 bg-gray-50 rounded border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-mono text-gray-600">{v.studentDID}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(v.performedAt).toLocaleString()}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-blue-600">Score: {v.trustScore}</span>
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
              <h3 className="font-bold text-gray-900 mb-4">🏢 Service Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Service</p>
                  <p className="font-bold text-gray-900 mt-1">{serviceName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                  <p className="font-bold text-gray-900 mt-1 capitalize">{serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Service ID</p>
                  <p className="font-mono text-xs text-gray-600 break-all mt-1">{serviceId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <p className="font-bold text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">📋 Verification Flow</h3>
              <ol className="space-y-2 text-xs text-blue-900">
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
              <h3 className="font-semibold text-gray-900 mb-3">🌍 Network</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network</span>
                  <span className="font-bold text-gray-900">Algorand TestNet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">App ID</span>
                  <span className="font-mono text-xs text-gray-900">756415000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
