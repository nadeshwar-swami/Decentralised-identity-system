import { useNavigate } from 'react-router-dom'
import { useRoleContext } from '../context/RoleContext'
import { User, Shield, Briefcase } from 'lucide-react'

/**
 * Landing page - intro with role cards
 */
export const Landing = () => {
  const navigate = useNavigate()
  const { switchRole } = useRoleContext()

  const handleRoleSelect = (role) => {
    switchRole(role)
    navigate(`/${role}`)
  }

  const roles = [
    {
      id: 'student',
      title: 'Student',
      icon: User,
      description: 'Create your DID and manage your credentials',
      color: 'bg-blue-50 border-blue-200 text-blue-600',
    },
    {
      id: 'admin',
      title: 'Administrator',
      icon: Shield,
      description: 'Issue verifiable credentials to students',
      color: 'bg-purple-50 border-purple-200 text-purple-600',
    },
    {
      id: 'service',
      title: 'Campus Service',
      icon: Briefcase,
      description: 'Verify student credentials',
      color: 'bg-green-50 border-green-200 text-green-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Campus DID</h1>
          <p className="text-xl text-gray-600">
            Decentralized Identity for Your Campus Ecosystem
          </p>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            A blockchain-based identity system where students control their credentials, universities issue verifiable claims, and services verify authenticity—all on Algorand TestNet.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {roles.map(({ id, title, icon: Icon, description, color }, index) => (
            <div
              key={id}
              className={`card border-2 ${color} hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105 fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleRoleSelect(id)}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-lg mb-4 ${color}`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
              <button className="btn-primary w-full mt-6">
                Enter as {title}
              </button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">1️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Your DID</h3>
              <p className="text-gray-600 text-sm">
                Students register their decentralized identity anchored on Algorand
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">2️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Receive Credentials</h3>
              <p className="text-gray-600 text-sm">
                Universities issue verifiable credential NFTs with on-chain proof
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">3️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Selectively</h3>
              <p className="text-gray-600 text-sm">
                Students control which credentials to share with each service
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>🌍 Built on Algorand TestNet | ✓ W3C Standards Compliant</p>
          <p className="mt-2">Network: https://testnet-api.algonode.cloud</p>
        </div>
      </div>
    </div>
  )
}
