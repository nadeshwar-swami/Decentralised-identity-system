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
            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:bg-indigo-500/30 transition">
              {getCredentialIcon(credential.credentialType)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate text-sm">
                {credential.program || 'Academic Credential'}
              </h3>
              <p className="text-xs text-muted mt-1">
                {credential.credentialType || 'Certificate'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              Active
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-xs text-secondary mb-4">
          <div className="flex justify-between">
            <span className="text-muted">Issuer:</span>
            <span className="font-medium text-white truncate ml-2">{credential.issuer || 'Institution'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Issued:</span>
            <span className="font-medium text-white">{formatDate(credential.issuedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">ID:</span>
            <span className="font-mono text-muted truncate ml-2 max-w-[100px]" title={credential.credentialId}>
              {credential.credentialId?.substring(0, 8)}...
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-indigo-400 font-medium group-hover:text-indigo-300">
            View Details
          </div>
          <ChevronDown size={16} className="text-secondary group-hover:text-white transition" />
        </div>
      </div>

      {/* Credential Details Modal */}
      {showDetails && credentialDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20" onClick={() => setShowDetails(false)}>
          <style>{`
            .credential-modal-body::-webkit-scrollbar {
              width: 4px;
            }
            .credential-modal-body::-webkit-scrollbar-thumb {
              background: rgba(99, 102, 241, 0.3);
              border-radius: 999px;
            }
          `}</style>
          <div className="card rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden" style={{ display: 'flex', flexDirection: 'column', height: 'auto', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex-shrink-0" style={{ background: 'inherit', padding: '24px 24px 16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {credentialDocument.program || 'Credential'}
                  </h2>
                  <p className="text-sm text-secondary mt-1">
                    {credentialDocument.credentialType || 'Verifiable Credential'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-secondary hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="credential-modal-body flex-1 overflow-y-auto" style={{ padding: '24px', minHeight: '0' }}>
              {/* Summary */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Issued By</p>
                  <p className="font-semibold text-white">{credentialDocument.issuer}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Issue Date</p>
                  <p className="font-semibold text-white">{formatDate(credentialDocument.issuedAt)}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Recipient</p>
                  <p className="font-semibold text-white">{credentialDocument.studentName}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Status</p>
                  <p className="font-semibold text-emerald-400">✓ Valid</p>
                </div>
              </div>

              {/* DIDs */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-white">Digital Identifiers</h3>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted uppercase tracking-wide mb-2">Issuer DID</p>
                  <p className="font-mono text-xs break-all text-white bg-white/5 p-2 rounded border border-white/10">
                    {credentialDocument.issuerDID}
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted uppercase tracking-wide mb-2">Student DID</p>
                  <p className="font-mono text-xs break-all text-white bg-white/5 p-2 rounded border border-white/10">
                    {credentialDocument.studentDID}
                  </p>
                </div>
              </div>

              {/* IPFS Links */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-white">Stored Documents</h3>
                <div className="space-y-2">
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${credentialDocument.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition"
                  >
                    <ExternalLink size={16} className="text-indigo-400" />
                    <div className="text-sm flex-1 min-w-0">
                      <p className="font-medium text-indigo-300">W3C Credential (IPFS)</p>
                      <p className="text-xs text-indigo-400/80 truncate">ipfs://{credentialDocument.ipfsHash}</p>
                    </div>
                  </a>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${credentialDocument.metadataIPFSHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg transition"
                  >
                    <ExternalLink size={16} className="text-violet-400" />
                    <div className="text-sm flex-1 min-w-0">
                      <p className="font-medium text-violet-300">ARC-69 Metadata (IPFS)</p>
                      <p className="text-xs text-violet-400/80 truncate">ipfs://{credentialDocument.metadataIPFSHash}</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Credential Document Preview */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-white">Credential Document</h3>
                <details className="group">
                  <summary className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 flex items-center justify-between border border-white/10">
                    <span className="font-medium text-white">View W3C Document Structure</span>
                    <span className="text-secondary group-open:rotate-180 transition">⌄</span>
                  </summary>
                  <pre className="mt-3 p-4 bg-white/5 text-secondary rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto border border-white/10">
                    {JSON.stringify(credentialDocument.credentialDocument, null, 2)}
                  </pre>
                </details>
              </div>

              {/* Verification */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm font-medium text-emerald-300 mb-2">✓ Credential Verified</p>
                <p className="text-xs text-emerald-400/80">
                  This credential has been issued by {credentialDocument.issuer} and is stored on IPFS with Content Addressability.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 z-10 flex-shrink-0 flex gap-3" style={{ background: 'inherit', padding: '16px 24px 24px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition border border-white/10"
              >
                Close
              </button>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${credentialDocument.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-gradient-primary hover:opacity-90 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
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
