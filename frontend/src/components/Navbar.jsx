import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWalletContext } from '../context/WalletContext'
import { WalletConnect } from './WalletConnect'
import { Logo } from './Logo'
import { User, Shield, Briefcase, Search } from 'lucide-react'

/**
 * Navbar component - main navigation with wallet connect
 * Shows role switcher, wallet status, and connection controls
 */
export const Navbar = ({ onDisconnect }) => {
  const { walletAddress, isConnected } = useWalletContext()
  const location = useLocation()

  const navLinks = {
    student: [{ path: '/student', label: 'Student', icon: User }],
    admin: [{ path: '/admin', label: 'Admin', icon: Shield }],
    service: [{ path: '/service', label: 'Service', icon: Briefcase }],
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <Logo size={48} className="text-indigo-400" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white leading-tight font-display">Campus DID</h1>
                <p className="text-xs text-cyan-400">Algorand TestNet</p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {/* Public link - always visible */}
              <Link
                to="/resolve"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/resolve')
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Search size={16} />
                Resolve DID
              </Link>

              {/* Role-specific links */}
              {Object.values(navLinks).flat().map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive(path)
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
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
