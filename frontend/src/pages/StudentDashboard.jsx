import React, { useState, useCallback } from 'react'
import { useWalletContext } from '../context/WalletContext'
import { CredentialCard } from '../components/CredentialCard'
import { SelectiveDisclosure } from '../components/SelectiveDisclosure'
import { StudentProfileForm } from '../components/StudentProfileForm'
import { Award, Loader2, AlertCircle, FileText, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import algosdk from 'algosdk'

const lastInitialFetchByWallet = new Map()
const INITIAL_FETCH_DEDUPE_WINDOW_MS = 1500

/**
 * StudentDashboard - student's identity and credential management
 * Feature 6: Student Credentials UI
 */
export const StudentDashboard = () => {
  const { walletAddress, isConnected, signTransaction } = useWalletContext()

  const [credentials, setCredentials] = useState([])
  const [didDocument, setDidDocument] = useState(null)
  const [loading, setLoading] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [showDIDDetails, setShowDIDDetails] = useState(false)
  const [studentProfile, setStudentProfile] = useState(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  // Define fetch functions first (before useEffect)
  const fetchCredentials = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/credentials/${walletAddress}`
      )

      if (!response.ok) {
        setCredentials([])
        return
      }

      const data = await response.json()
      if (data.success && data.data) {
        // Backend returns data.data.credentials as array
        setCredentials(data.data.credentials || [])
      } else {
        setCredentials([])
      }
    } catch (err) {
      console.error('Error fetching credentials:', err)
      setCredentials([])
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  const fetchDIDDocument = useCallback(async () => {
    try {
      // First check localStorage
      const storageKey = `did_${walletAddress}`
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        setDidDocument(JSON.parse(cached))
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/did/${walletAddress}`
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()
      if (data.success && data.data) {
        setDidDocument(data.data)
      }
    } catch (err) {
      console.error('Error fetching DID:', err)
    }
  }, [walletAddress])

  // useEffect AFTER function definitions
  React.useEffect(() => {
    if (!isConnected || !walletAddress) {
      return
    }

    const now = Date.now()
    const lastFetchAt = lastInitialFetchByWallet.get(walletAddress) || 0

    if (now - lastFetchAt < INITIAL_FETCH_DEDUPE_WINDOW_MS) {
      return
    }

    lastInitialFetchByWallet.set(walletAddress, now)
    fetchCredentials()
    fetchDIDDocument()
  }, [walletAddress, isConnected, fetchCredentials, fetchDIDDocument])

  // Load student profile from localStorage
  React.useEffect(() => {
    if (!walletAddress) {
      setStudentProfile(null)
      return
    }

    const storageKey = `student_profile_${walletAddress}`
    const storedProfile = localStorage.getItem(storageKey)
    if (storedProfile) {
      try {
        setStudentProfile(JSON.parse(storedProfile))
      } catch {
        setStudentProfile(null)
      }
    } else {
      // Prompt user to complete profile if not already done
      setProfileModalOpen(true)
    }
  }, [walletAddress])

  const handleRegisterIdentity = async () => {
    if (!walletAddress) {
      toast.error('Please connect wallet first')
      return
    }

    try {
      setRegistering(true)
      toast.loading('Creating DID document...', { id: 'did-registration' })

      // Step 1: Create DID document and get unsigned transaction
      const createResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/did/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: walletAddress,
            displayName: 'Student Identity',
          }),
        }
      )

      const createData = await createResponse.json()
      if (!createData.success) {
        throw new Error(createData.message || 'Failed to create DID')
      }

      // Step 2: Decode the unsigned transaction bytes
      toast.loading('Preparing transaction for signing...', { id: 'did-registration' })
      const txnBytes = Buffer.from(createData.data.transaction.txnBytes, 'base64')
      const txn = algosdk.decodeUnsignedTransaction(txnBytes)

      // Step 3: Sign transaction with Pera Wallet
      toast.loading('Please sign the transaction in your wallet...', { id: 'did-registration' })
      
      const singleTxnGroup = [{ txn, signers: [walletAddress] }]
      const signedTxn = await signTransaction([singleTxnGroup])

      // Step 4: Submit signed transaction to blockchain
      toast.loading('Submitting to Algorand blockchain...', { id: 'did-registration' })
      
      const registerResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/did/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: walletAddress,
            signedTxn: Buffer.from(signedTxn[0]).toString('base64'),
            ipfsHash: createData.data.ipfsHash,
            didDocument: createData.data.didDocument,
          }),
        }
      )

      const registerData = await registerResponse.json()
      if (!registerData.success) {
        throw new Error(registerData.error || 'Failed to register DID on blockchain')
      }

      // Step 5: Save to state and localStorage ONLY after blockchain confirmation
      toast.loading('Waiting for blockchain confirmation...', { id: 'did-registration' })
      
      const didData = {
        did: createData.data.did,
        ipfsHash: createData.data.ipfsHash,
        didDocument: createData.data.didDocument,
        transactionId: registerData.data.transactionId,
        confirmedRound: registerData.data.confirmedRound,
        explorerUrl: registerData.data.explorerUrl,
      }
      
      setDidDocument(didData)
      
      // Persist to localStorage
      const storageKey = `did_${walletAddress}`
      localStorage.setItem(storageKey, JSON.stringify(didData))

      // Store DID on backend for credential issuance
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/credentials/student/did`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            did: createData.data.did,
            displayName: 'Student Identity',
            ipfsHash: createData.data.ipfsHash,
          }),
        })
      } catch (storageErr) {
        console.warn('Optional: Failed to store DID on backend:', storageErr)
        // Not critical - DID is in localStorage
      }

      toast.success(
        `DID registered on-chain! TX: ${registerData.data.transactionId.substring(0, 8)}...`,
        { id: 'did-registration', duration: 5000 }
      )
    } catch (err) {
      console.error('Error registering identity:', err)
      
      // Handle user rejection gracefully
      if (err.message && err.message.includes('cancelled')) {
        toast.error('Transaction cancelled by user', { id: 'did-registration' })
      } else {
        toast.error(err.message || 'Failed to register identity', { id: 'did-registration' })
      }
    } finally {
      setRegistering(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="page-bg page-shell">
        <div className="card bg-orange-500/10 border-orange-500/20">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-orange-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-orange-300 text-lg mb-1">Connect Your Wallet</h3>
              <p className="text-orange-300/80">
                Click the "Connect Wallet" button in the top right to connect Pera Wallet and access your identity dashboard.
              </p>
              <p className="text-sm text-orange-400/80 mt-2">
                Make sure you have Pera Wallet installed and are on the Algorand TestNet.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-bg page-shell">
      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20">
          <div className="card rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-6 right-6 text-secondary hover:text-white text-2xl leading-none z-20"
              title="Close"
            >
              ×
            </button>
            <div className="p-8">
              <StudentProfileForm
                walletAddress={walletAddress}
                initialData={studentProfile || undefined}
                isLocked={credentials.length > 0}
                onSave={(profileData) => {
                  setStudentProfile(profileData)
                  setProfileModalOpen(false)
                  toast.success('Profile saved successfully!')
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">My Identity</h1>
          <p className="page-subtitle">Manage your DID, profile data, and verifiable credentials.</p>
        </div>
        <div className="badge-info">
          <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Student Workspace
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* DID Registration */}
          {!didDocument ? (
            <>
              {!studentProfile ? (
                <div className="card bg-amber-500/10 border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-amber-400 flex-shrink-0 mt-1" size={24} />
                    <div className="flex-1">
                      <h2 className="font-semibold text-amber-300 mb-2">Complete Your Profile First</h2>
                      <p className="text-amber-300/80 text-sm mb-3">
                        We need your academic information to issue credentials and verify your identity. Please complete your profile to proceed.
                      </p>
                      <button
                        onClick={() => setProfileModalOpen(true)}
                        className="btn-secondary text-sm"
                      >
                        Complete Profile
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="panel-card bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-indigo-300 mb-2">
                        Register Your Decentralized Identity
                      </h2>
                      <p className="text-indigo-300/80 text-sm mb-4">
                        Create a W3C-compliant DID anchored on Algorand TestNet. Your identity document will be stored on IPFS and referenced on-chain.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRegisterIdentity}
                    disabled={registering}
                    className="btn-primary flex items-center gap-2"
                  >
                        {registering && <Loader2 size={16} className="animate-spin" />}
                    {registering ? 'Registering...' : 'Register My Identity'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="panel-card border-emerald-500/20 bg-emerald-500/10">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">✓</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-emerald-300">DID Successfully Registered</h2>
                  <p className="text-sm text-emerald-300/80 mt-1 font-mono break-all bg-white/5 px-3 py-2 rounded mt-2 border border-white/10">
                    {didDocument?.did}
                  </p>
                </div>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-emerald-300 hover:text-emerald-200 p-2 bg-white/5 rounded">
                  📄 View DID Document
                </summary>
                <pre className="mt-3 bg-white/5 p-3 rounded text-xs overflow-x-auto border border-white/10 line-clamp-20">
                  {JSON.stringify(didDocument?.didDocument, null, 2)}
                </pre>
                <div className="mt-2 space-y-2">
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${didDocument?.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                  >
                    View on IPFS Gateway
                    <ExternalLink size={14} />
                  </a>
                  {didDocument?.explorerUrl && (
                    <>
                      <span className="text-white/20 mx-2">|</span>
                      <a
                        href={didDocument.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                      >
                        View on Algorand Explorer
                        <ExternalLink size={14} />
                      </a>
                    </>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Student Profile */}
          {studentProfile && (
            <div className="panel-card border-indigo-500/20 bg-indigo-500/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-indigo-300 mb-2">Your Academic Profile</h2>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-indigo-400 font-medium">Full Name</p>
                      <p className="text-white">{studentProfile.fullName}</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-medium">Student ID</p>
                      <p className="text-white">{studentProfile.studentId}</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-medium">Department</p>
                      <p className="text-white">{studentProfile.department}</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-medium">Year of Study</p>
                      <p className="text-white">{studentProfile.yearOfStudy}</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-medium">Email</p>
                      <p className="text-white">{studentProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-medium">Mobile</p>
                      <p className="text-white">{studentProfile.mobileNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(true)}
                disabled={credentials.length > 0}
                className={`${
                  credentials.length > 0
                    ? 'btn-secondary text-sm opacity-50 cursor-not-allowed'
                    : 'btn-secondary text-sm'
                }`}
              >
                {credentials.length > 0 ? '[LOCKED] Profile Locked' : 'Edit Profile'}
              </button>
            </div>
          )}

          {/* Credentials List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">My Credentials</h2>
              {credentials.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-semibold border border-indigo-500/20">
                  <Award size={16} />
                  {credentials.length}
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="card text-center">
                <Loader2 className="animate-spin mx-auto text-indigo-400" size={32} />
                <p className="text-secondary mt-3">Loading credentials...</p>
              </div>
            ) : credentials.length === 0 ? (
              <div className="card text-center text-muted">
                <Award size={48} className="mx-auto text-secondary mb-3" />
                <p className="text-lg font-medium">No credentials yet</p>
                <p className="text-sm mt-1">
                  {didDocument 
                    ? 'Credentials will appear here once issued by administrators'
                    : 'Register your identity first to receive credentials'}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {credentials.map((credential) => (
                  <CredentialCard 
                    key={credential.credentialId} 
                    credential={credential} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Info */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <span>Wallet</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted text-xs uppercase tracking-wide">Address</p>
                <p className="font-mono text-xs bg-white/5 p-2 rounded break-all mt-1 border border-white/10">
                  {walletAddress}
                </p>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-muted text-xs uppercase tracking-wide">Network</p>
                <p className="text-sm font-medium text-cyan-400 mt-1">
                  Algorand TestNet
                </p>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-muted text-xs uppercase tracking-wide">Status</p>
                <p className="text-sm font-medium text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Connected
                </p>
              </div>
            </div>
          </div>

          {/* Share Credentials */}
          {credentials.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                Share Credentials
              </h3>
              <p className="text-sm text-secondary mb-4">
                Selectively disclose your credentials to campus services
              </p>
              <SelectiveDisclosure credentials={credentials} />
            </div>
          )}

          {/* Quick Stats */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <span>Quick Stats</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">Total Credentials</span>
                <span className="font-bold text-2xl text-indigo-400">{credentials.length}</span>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">Identity</span>
                <span className={`text-lg ${didDocument ? 'text-emerald-400' : 'text-muted'}`}>
                  {didDocument ? '✓ Registered' : 'Not Registered'}
                </span>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">Status</span>
                <span className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
