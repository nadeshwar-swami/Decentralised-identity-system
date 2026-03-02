import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRoleContext } from '../context/RoleContext'
import { useWalletContext } from '../context/WalletContext'
import { RoleSwitcher } from './RoleSwitcher'
import { WalletConnect } from './WalletConnect'
import { Home, User, Shield, Briefcase } from 'lucide-react'

/**
 * Navbar component - main navigation with wallet connect
 * Shows role switcher, wallet status, and connection controls
 */
export const Navbar = ({ onDisconnect }) => {
  const { walletAddress, isConnected } = useWalletContext()
  const { currentRole } = useRoleContext()
  const location = useLocation()

  const navLinks = {
    student: [
      { path: '/student', label: 'Dashboard', icon: User },
    ],
    admin: [
      { path: '/admin', label: 'Issue Credentials', icon: Shield },
    ],
    service: [
      { path: '/service', label: 'Verify Credentials', icon: Briefcase },
    ],
  }

  const currentNavLinks = navLinks[currentRole] || []
  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🔒</span>
              <h1 className="text-xl font-bold text-gray-900">Campus DID</h1>
            </Link>

            {/* Role-based navigation links */}
            <div className="hidden md:flex items-center gap-2">
              {currentNavLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <RoleSwitcher />
            <WalletConnect
              walletAddress={walletAddress}
              isConnected={isConnected}
              onDisconnect={onDisconnect}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
