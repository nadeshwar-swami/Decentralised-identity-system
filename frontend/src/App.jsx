import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { WalletProvider, useWalletContext } from './context/WalletContext'
import { RoleProvider, useRoleContext } from './context/RoleContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { StudentDashboard } from './pages/StudentDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { ServiceDashboard } from './pages/ServiceDashboard'
import './index.css'

/**
 * AppContent - main app routes and layout
 */
const AppContent = () => {
  const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWalletContext()
  const { currentRole } = useRoleContext()

  const handleDisconnect = () => {
    disconnectWallet()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        onConnect={connectWallet}
        onDisconnect={handleDisconnect}
      />

      <main className="flex-1 bg-gray-50">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service"
            element={
              <ProtectedRoute requiredRole="service">
                <ServiceDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
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
