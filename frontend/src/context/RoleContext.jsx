import React, { createContext, useContext, useState, useEffect } from 'react'

const RoleContext = createContext()

export const RoleProvider = ({ children }) => {
  // Load role from localStorage, default to 'student'
  const [currentRole, setCurrentRole] = useState(() => {
    const savedRole = localStorage.getItem('campus-did-role')
    return savedRole && ['student', 'admin', 'service'].includes(savedRole) 
      ? savedRole 
      : 'student'
  })

  // Persist role to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('campus-did-role', currentRole)
  }, [currentRole])

  const switchRole = (role) => {
    if (!['student', 'admin', 'service'].includes(role)) {
      throw new Error('Invalid role')
    }
    setCurrentRole(role)
  }

  const value = {
    currentRole,
    switchRole,
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export const useRoleContext = () => {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRoleContext must be used within RoleProvider')
  }
  return context
}
