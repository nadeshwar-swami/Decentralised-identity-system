import React, { useState } from 'react'
import { useWalletContext } from '../context/WalletContext'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
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

  const credentialTypes = [
    { value: 'STUDENT_ENROLLED', label: '📚 Student Enrolled' },
    { value: 'LIBRARY_ACCESS', label: '📖 Library Access' },
    { value: 'HOSTEL_RESIDENT', label: '🏠 Hostel Resident' },
    { value: 'EVENT_PASS', label: '🎫 Event Pass' },
  ]

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

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/credentials/issue`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentAddress,
            credentialType,
            issuerAddress: walletAddress,
          }),
        }
      )

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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card text-center bg-blue-50 border-blue-200 border-2">
          <AlertCircle className="inline-block text-blue-600 mb-3" size={28} />
          <p className="text-blue-800 font-medium">
            Please connect your wallet to issue credentials
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Only administrators can issue verifiable credentials
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Issue Credentials</h1>
        <p className="text-gray-600">Issue verifiable credentials to students as NFTs</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <form onSubmit={handleIssueCredential} className="space-y-6">
              {/* Student Address */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Student Wallet Address
                </label>
                <input
                  type="text"
                  value={studentAddress}
                  onChange={(e) => setStudentAddress(e.target.value)}
                  placeholder="Enter student's Algorand wallet address"
                  className="input-field font-mono text-sm"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 The student must have registered their DID first
                </p>
              </div>

              {/* Credential Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Credential Type
                </label>
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  className="input-field"
                  disabled={loading}
                >
                  {credentialTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Credentials are valid for 1 year
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Issuing...' : 'Issue Credential NFT'}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div className={`card mt-6 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                ) : (
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-3 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? '✓ Credential Issued Successfully' : '✗ Failed to Issue Credential'}
                  </h3>
                  {result.success && result.data && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs font-semibold">Asset ID</p>
                        <p className="font-mono font-bold text-gray-900 mt-1">{result.data.assetId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs font-semibold">Transaction ID</p>
                        <a
                          href={`https://testnet.explorer.perawallet.app/tx/${result.data.txnId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-blue-600 hover:text-blue-700 text-xs break-all block mt-1"
                        >
                          {result.data.txnId} →
                        </a>
                      </div>
                    </div>
                  )}
                  {!result.success && (
                    <p className="text-red-700 text-sm">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Admin Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🔐</span> Admin Wallet
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Address</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all mt-1 border border-gray-200">
                  {walletAddress}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-500 text-xs uppercase tracking-wide">Role</p>
                <p className="text-sm font-bold text-purple-600 mt-1">Administrator</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">📋 How to Issue</h3>
            <ol className="space-y-2 text-sm text-blue-900">
              <li className="flex gap-2">
                <span className="font-bold">1.</span> Get student's wallet address
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span> Paste address above
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span> Select credential type
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span> Click Issue Credential
              </li>
              <li className="flex gap-2">
                <span className="font-bold">5.</span> NFT minted to student
              </li>
            </ol>
          </div>

          {/* Credential Types */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">🎓 Credential Types</h3>
            <div className="space-y-2">
              {credentialTypes.map((type) => (
                <div key={type.value} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm">{type.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Valid for 1 year</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
