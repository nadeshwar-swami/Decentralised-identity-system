import React, { useState, useEffect } from 'react'
import { Search, ExternalLink, FileJson, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * DID Resolution Page - Public testnet DID resolver
 * Allows anyone to resolve DIDs registered on Algorand TestNet
 */
export const ResolveDID = () => {
  const [didInput, setDidInput] = useState('')
  const [walletInput, setWalletInput] = useState('')
  const [resolvedData, setResolvedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const didParam = params.get('did')
    const walletParam = params.get('wallet')
    
    if (didParam) {
      setDidInput(didParam)
      handleResolveFromDID(didParam)
    } else if (walletParam) {
      setWalletInput(walletParam)
      handleResolveFromWallet(walletParam)
    }
  }, [])

  const extractWalletFromDID = (did) => {
    // Format: did:algo:app:APP_ID:WALLET_ADDRESS
    const parts = did.split(':')
    if (parts.length === 5 && parts[0] === 'did' && parts[1] === 'algo' && parts[2] === 'app') {
      return parts[4]
    }
    return null
  }

  const handleResolveFromDID = async (did) => {
    const wallet = extractWalletFromDID(did || didInput)
    if (!wallet) {
      toast.error('Invalid DID format. Expected: did:algo:app:APP_ID:WALLET')
      return
    }
    await resolveDID(wallet)
  }

  const handleResolveFromWallet = async (wallet) => {
    await resolveDID(wallet || walletInput)
  }

  const resolveDID = async (walletAddress) => {
    if (!walletAddress || walletAddress.length !== 58) {
      toast.error('Invalid Algorand wallet address (must be 58 characters)')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResolvedData(null)

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/did/${walletAddress}`
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'DID not found')
      }

      setResolvedData(data.data)
      
      // Update URL with wallet param
      const newUrl = new URL(window.location)
      newUrl.searchParams.set('wallet', walletAddress)
      window.history.pushState({}, '', newUrl)
      
      toast.success('DID resolved successfully!')
    } catch (err) {
      console.error('Resolution error:', err)
      setError(err.message || 'Failed to resolve DID')
      toast.error(err.message || 'Failed to resolve DID')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const shareableURL = resolvedData 
    ? `${window.location.origin}/resolve?wallet=${resolvedData.didDocument?.id?.split(':')[4] || walletInput}`
    : ''

  return (
    <div className="page-bg page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">DID Resolver</h1>
          <p className="page-subtitle">
            Resolve Decentralized Identifiers on Algorand TestNet
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Search size={24} className="text-indigo-400" />
            Resolve by DID or Wallet Address
          </h2>

          <div className="space-y-4">
            {/* DID Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full DID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={didInput}
                  onChange={(e) => setDidInput(e.target.value)}
                  placeholder="did:algo:app:756415000:WALLET_ADDRESS..."
                  className="input-field flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleResolveFromDID()}
                />
                <button
                  onClick={() => handleResolveFromDID()}
                  disabled={loading || !didInput}
                  className="btn-primary"
                >
                  Resolve
                </button>
              </div>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="text-muted text-sm">OR</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Wallet Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Wallet Address (58 characters)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="GTSZHH4VGF7ZHTY2TR5KZQ3TWECELNV7HLMXTZ2OXYB5BLM23CSXHM74EY"
                  className="input-field flex-1 font-mono text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleResolveFromWallet()}
                />
                <button
                  onClick={() => handleResolveFromWallet()}
                  disabled={loading || !walletInput}
                  className="btn-primary"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="mt-6 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <p className="text-xs text-indigo-300 font-semibold mb-2">Example DID Format:</p>
            <p className="text-xs font-mono text-indigo-300/80 break-all">
              did:algo:app:756415000:FVAPL2RSBVYK7IMOUYRKW2HRC34622TWTQKT3GARPDZIUG3QKRPNMEVJX4
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card bg-red-500/10 border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-red-300 mb-1">Resolution Failed</h3>
                <p className="text-red-300/80 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resolved DID Display */}
        {resolvedData && (
          <div className="space-y-4">
            {/* Success Banner */}
            <div className="card bg-emerald-500/10 border-emerald-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-emerald-400 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-300 mb-1">DID Resolved Successfully</h3>
                  <p className="text-emerald-300/80 text-sm">
                    Registered on {new Date(resolvedData.registeredAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* DID Information */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4">DID Information</h3>
              
              <div className="space-y-4">
                {/* DID */}
                <div>
                  <label className="block text-xs text-muted uppercase font-semibold mb-2">
                    DID Identifier
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-white/5 rounded border border-white/10 text-sm font-mono text-white break-all">
                      {resolvedData.did}
                    </code>
                    <button
                      onClick={() => copyToClipboard(resolvedData.did, 'DID')}
                      className="btn-secondary flex-shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* IPFS Hash */}
                {resolvedData.ipfsHash && (
                  <div>
                    <label className="block text-xs text-muted uppercase font-semibold mb-2">
                      IPFS Hash
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-3 bg-white/5 rounded border border-white/10 text-sm font-mono text-white break-all">
                        {resolvedData.ipfsHash}
                      </code>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${resolvedData.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary flex-shrink-0"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Transaction */}
                {resolvedData.transactionId && (
                  <div>
                    <label className="block text-xs text-muted uppercase font-semibold mb-2">
                      Blockchain Transaction
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-3 bg-white/5 rounded border border-white/10 text-sm font-mono text-white break-all">
                        {resolvedData.transactionId}
                      </code>
                      <a
                        href={`https://lora.algokit.io/testnet/transaction/${resolvedData.transactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary flex-shrink-0"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Shareable URL */}
                <div>
                  <label className="block text-xs text-muted uppercase font-semibold mb-2">
                    Shareable Resolution URL
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-white/5 rounded border border-white/10 text-sm font-mono text-white break-all">
                      {shareableURL}
                    </code>
                    <button
                      onClick={() => copyToClipboard(shareableURL, 'URL')}
                      className="btn-secondary flex-shrink-0"
                    >
                      <LinkIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* DID Document */}
            {resolvedData.didDocument && (
              <div className="card">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileJson size={20} className="text-indigo-400" />
                  W3C DID Document
                </h3>
                
                <div className="bg-[#0A0A0F] rounded-lg border border-white/10 p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-white">
                    {JSON.stringify(resolvedData.didDocument, null, 2)}
                  </pre>
                </div>

                <button
                  onClick={() => copyToClipboard(JSON.stringify(resolvedData.didDocument, null, 2), 'DID Document')}
                  className="btn-secondary w-full mt-4"
                >
                  Copy DID Document JSON
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="card bg-blue-500/10 border-blue-500/20">
          <h3 className="font-semibold text-blue-300 mb-3">About This Resolver</h3>
          <div className="space-y-2 text-sm text-blue-300/80">
            <p>
              This is a public DID resolver for the Campus DID system running on <strong>Algorand TestNet</strong>.
            </p>
            <p>
              All DIDs are registered on-chain and can be independently verified using the transaction ID on 
              <a href="https://lora.algokit.io/testnet" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                Lora TestNet
              </a>.
            </p>
            <p className="pt-2 border-t border-blue-500/20">
              <strong>Network:</strong> Algorand TestNet<br />
              <strong>App ID:</strong> 756415000<br />
              <strong>Standard:</strong> W3C DID Core v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
