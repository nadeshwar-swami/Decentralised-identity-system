import { Navigate } from 'react-router-dom'
import { useRoleContext } from '../context/RoleContext'

/**
 * ProtectedRoute - route guard based on required role
 * @param {string} requiredRole - Role required to access this route
 * @param {ReactNode} children - Components to render if authorized
 */
export const ProtectedRoute = ({ requiredRole, children }) => {
  const { currentRole } = useRoleContext()

  if (currentRole !== requiredRole) {
    // Redirect to landing if role doesn't match
    return <Navigate to="/" replace />
  }

  return children
}
