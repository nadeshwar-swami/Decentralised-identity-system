import { useNavigate } from 'react-router-dom'
import { useWalletContext } from '../context/WalletContext'
import { useRoleContext } from '../context/RoleContext'
import { User, Shield, Briefcase, Lock, FileText, Share2 } from 'lucide-react'

/**
 * Landing page - intro with role cards
 */
export const Landing = () => {
  const navigate = useNavigate()
  const { isConnected, connectWallet } = useWalletContext()
  const { switchRole } = useRoleContext()

  const handleRoleSelect = (role) => {
    if (role === 'admin') {
      // Admins must go through login portal
      navigate('/admin-login')
    } else {
      switchRole(role)
      navigate(`/${role}`)
    }
  }

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (err) {
      console.error('Wallet connection error:', err)
    }
  }

  const roles = [
    {
      id: 'student',
      title: 'Student',
      icon: User,
      description: 'Create your DID, receive credentials, and manage your academic identity',
      color: 'bg-blue-50 border-blue-200 text-blue-600',
      features: ['Create Decentralized Identity', 'Receive Verifiable Credentials', 'Control Your Data'],
    },
    {
      id: 'admin',
      title: 'Administrator',
      icon: Shield,
      description: 'Issue verifiable credentials to students (authorization required)',
      color: 'bg-purple-50 border-purple-200 text-purple-600',
      features: ['Issue Credentials', 'Manage Users', 'View Reports'],
      locked: true,
    },
    {
      id: 'service',
      title: 'Service Provider',
      icon: Briefcase,
      description: 'Verify student credentials and access shared information',
      color: 'bg-green-50 border-green-200 text-green-600',
      features: ['Verify Credentials', 'Request Information', 'Build Trust'],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <div className="text-6xl mb-6 animate-pulse">🔐</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Decentralized Identity System
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
            A blockchain-based ecosystem where students own their educational identity, 
            universities issue verifiable claims, and services verify authenticity—all on Algorand
          </p>

          {!isConnected && (
            <button
              onClick={handleConnectWallet}
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              <Lock size={20} />
              Connect Wallet to Begin
            </button>
          )}
        </div>

        {/* System Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-white hover:bg-white/20 transition">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-lg font-semibold mb-2">Self-Sovereign Identity</h3>
            <p className="text-blue-100 text-sm">
              Students create and control their own decentralized identifier (DID) on Algorand blockchain
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-white hover:bg-white/20 transition">
            <div className="text-4xl mb-3">📜</div>
            <h3 className="text-lg font-semibold mb-2">Verifiable Credentials</h3>
            <p className="text-blue-100 text-sm">
              Universities issue NFT-based credentials anchored on-chain with cryptographic proof
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-white hover:bg-white/20 transition">
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold mb-2">Selective Disclosure</h3>
            <p className="text-blue-100 text-sm">
              Students choose what to share with service providers while maintaining privacy
            </p>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {roles.map(({ id, title, icon: Icon, description, color, features, locked }, index) => (
            <div
              key={id}
              className={`relative group fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {locked && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                  🔒 Authorized Access
                </div>
              )}
              <div
                className={`card border-2 ${color} h-full flex flex-col transition-all duration-200 ${
                  locked ? 'opacity-90' : 'hover:shadow-xl hover:scale-105 cursor-pointer'
                }`}
                onClick={() => !locked && handleRoleSelect(id)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="text-gray-600 mb-4 flex-grow">{description}</p>

                {/* Features */}
                <div className="mb-6 space-y-2">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {locked ? (
                  <button
                    onClick={() => handleRoleSelect(id)}
                    className="btn-primary w-full group/btn"
                  >
                    <Lock size={16} className="group-hover/btn:rotate-0 transition" />
                    Admin Portal Login
                  </button>
                ) : (
                  <button onClick={() => handleRoleSelect(id)} className="btn-primary w-full">
                    Enter as {title}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🚀 How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Student Creates DID</h3>
              <p className="text-gray-600 text-sm">
                Student registers their decentralized identity anchored on Algorand blockchain
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Complete Profile</h3>
              <p className="text-gray-600 text-sm">
                Profile is locked after first credential is issued for data integrity
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Admin Issues Credential</h3>
              <p className="text-gray-600 text-sm">
                Authorized admin issues verifiable credential NFT with on-chain proof
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Selectively</h3>
              <p className="text-gray-600 text-sm">
                Student creates presentations and shares only required credential data
              </p>
            </div>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">✨ Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <FileText size={24} className="flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">W3C Standard Credentials</h3>
                <p className="text-blue-100 text-sm">
                  Credentials follow W3C Verifiable Credentials specification
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Lock size={24} className="flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Admin Authorization</h3>
                <p className="text-blue-100 text-sm">
                  Only authorized admin wallets can issue credentials
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Share2 size={24} className="flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Selective Disclosure</h3>
                <p className="text-blue-100 text-sm">
                  Students control what information they share
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <FileText size={24} className="flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">IPFS Storage</h3>
                <p className="text-blue-100 text-sm">
                  Credentials stored on IPFS, indexed on blockchain
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
