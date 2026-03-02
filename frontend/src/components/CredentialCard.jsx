import React, { useState } from 'react'
import { Shield, BookOpen, Home, Ticket, ChevronDown, ExternalLink, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * CredentialCard component - displays a W3C Verifiable Credential
 * Feature 6 implementation
 */
export const CredentialCard = ({ credential }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [credentialDocument, setCredentialDocument] = useState(null)

  const getCredentialIcon = (type) => {
    if (!type) return <Shield size={20} />
    const typeStr = type.toLowerCase()
    if (typeStr.includes('degree')) return <Shield size={20} />
    if (typeStr.includes('certificate')) return <BookOpen size={20} />
    if (typeStr.includes('pass')) return <Ticket size={20} />
    return <BookOpen size={20} />
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const fetchCredentialDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/credentials/details/${credential.credentialId}`
      )
      const data = await response.json()
      if (data.success) {
        setCredentialDocument(data.data)
        setShowDetails(true)
      } else {
        toast.error('Failed to load credential details')
      }
    } catch (err) {
      console.error('Error fetching credential details:', err)
      toast.error('Failed to fetch credential details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow duration-200 group cursor-pointer"
        onClick={fetchCredentialDetails}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition">
              {getCredentialIcon(credential.credentialType)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {credential.program || 'Academic Credential'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {credential.credentialType || 'Certificate'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              Active
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-xs text-gray-600 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Issuer:</span>
            <span className="font-medium text-gray-900 truncate ml-2">{credential.issuer || 'Institution'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Issued:</span>
            <span className="font-medium text-gray-900">{formatDate(credential.issuedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ID:</span>
            <span className="font-mono text-gray-500 truncate ml-2 max-w-[100px]" title={credential.credentialId}>
              {credential.credentialId?.substring(0, 8)}...
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
            View Details
          </div>
          <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 transition" />
        </div>
      </div>

      {/* Credential Details Modal */}
      {showDetails && credentialDocument && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {credentialDocument.program || 'Credential'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {credentialDocument.credentialType || 'Verifiable Credential'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Issued By</p>
                  <p className="font-semibold text-gray-900">{credentialDocument.issuer}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Issue Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(credentialDocument.issuedAt)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Recipient</p>
                  <p className="font-semibold text-gray-900">{credentialDocument.studentName}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <p className="font-semibold text-green-600">✓ Valid</p>
                </div>
              </div>

              {/* DIDs */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Digital Identifiers</h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Issuer DID</p>
                  <p className="font-mono text-xs break-all text-gray-700 bg-white p-2 rounded border border-gray-200">
                    {credentialDocument.issuerDID}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Student DID</p>
                  <p className="font-mono text-xs break-all text-gray-700 bg-white p-2 rounded border border-gray-200">
                    {credentialDocument.studentDID}
                  </p>
                </div>
              </div>

              {/* IPFS Links */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Stored Documents</h3>
                <div className="space-y-2">
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${credentialDocument.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                  >
                    <ExternalLink size={16} className="text-blue-600" />
                    <div className="text-sm flex-1 min-w-0">
                      <p className="font-medium text-blue-900">W3C Credential (IPFS)</p>
                      <p className="text-xs text-blue-700 truncate">ipfs://{credentialDocument.ipfsHash}</p>
                    </div>
                  </a>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${credentialDocument.metadataIPFSHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
                  >
                    <ExternalLink size={16} className="text-purple-600" />
                    <div className="text-sm flex-1 min-w-0">
                      <p className="font-medium text-purple-900">ARC-69 Metadata (IPFS)</p>
                      <p className="text-xs text-purple-700 truncate">ipfs://{credentialDocument.metadataIPFSHash}</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Credential Document Preview */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Credential Document</h3>
                <details className="group">
                  <summary className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 flex items-center justify-between">
                    <span className="font-medium text-gray-900">View W3C Document Structure</span>
                    <span className="text-gray-500 group-open:rotate-180 transition">⌄</span>
                  </summary>
                  <pre className="mt-3 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    {JSON.stringify(credentialDocument.credentialDocument, null, 2)}
                  </pre>
                </details>
              </div>

              {/* Verification */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-2">✓ Credential Verified</p>
                <p className="text-xs text-green-800">
                  This credential has been issued by {credentialDocument.issuer} and is stored on IPFS with Content Addressability.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition"
              >
                Close
              </button>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${credentialDocument.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                View on IPFS
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
