import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { WalletProvider, useWalletContext } from './context/WalletContext'
import { RoleProvider } from './context/RoleContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Landing } from './pages/Landing'
import { StudentDashboard } from './pages/StudentDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { ServiceDashboard } from './pages/ServiceDashboard'
import { ResolveDID } from './pages/ResolveDID'
import './index.css'

/**
 * AppContent - main app routes and layout
 */
const AppContent = () => {
  const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWalletContext()

  const handleDisconnect = () => {
    disconnectWallet()
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover" style={{ backgroundImage: 'linear-gradient(to bottom, #0A0A0F, #0A0A0F)' }}>
      <Navbar
        onDisconnect={handleDisconnect}
      />

      <main className="flex-1 page-bg">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/resolve" element={<ResolveDID />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/service" element={<ServiceDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#16161F',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: '#F1F5F9',
            borderRadius: '12px',
            fontFamily: 'Inter',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#16161F',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#16161F',
            },
          },
        }}
      />
    </div>
  )
}

/**
 * App - root component with providers
 * Wrapped with @txnlab/use-wallet WalletProvider for Pera Wallet integration
 */
function App() {
  return (
    <Router>
      <WalletProvider>
        <RoleProvider>
          <AppContent />
        </RoleProvider>
      </WalletProvider>
    </Router>
  )
}

export default App
