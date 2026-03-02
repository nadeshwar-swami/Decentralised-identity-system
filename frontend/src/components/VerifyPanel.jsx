import React, { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

/**
 * VerifyPanel component - for verifying credentials
 */
export const VerifyPanel = ({ onVerify }) => {
  const [proofInput, setProofInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleVerify = async () => {
    try {
      setLoading(true)
      setResult(null)
      // Call backend verification endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify/presentation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vpBase64: proofInput }),
      })
      const data = await response.json()
      setResult(data)
      onVerify?.(data)
    } catch (err) {
      console.error('Error verifying:', err)
      setResult({
        success: false,
        error: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <label className="block text-sm font-medium mb-2">Paste Proof Code</label>
        <textarea
          value={proofInput}
          onChange={(e) => setProofInput(e.target.value)}
          placeholder="Paste the shared proof code here..."
          className="input-field h-32 font-mono text-xs"
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={!proofInput.trim() || loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Verifying...' : 'Verify Identity'}
      </button>

      {result && (
        <div className={`card ${result.success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="text-emerald-400 flex-shrink-0 mt-1" size={20} />
            ) : (
              <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>
                {result.success ? 'Verification Successful' : 'Verification Failed'}
              </h4>
              <p className="text-sm mt-1 text-secondary">
                {result.error || 'All credentials verified successfully'}
              </p>
              {result.data && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="font-mono text-xs bg-white/5 px-2 py-1 rounded border border-white/10 break-all text-white">
                    {result.data.holderDID}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
