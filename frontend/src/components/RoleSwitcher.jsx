import { useNavigate } from 'react-router-dom'
import { User, Shield, Briefcase } from 'lucide-react'
import { useRoleContext } from '../context/RoleContext'

/**
 * RoleSwitcher component - switch between student, admin, service roles
 * Automatically navigates to the appropriate dashboard on role change
 */
export const RoleSwitcher = () => {
  const { currentRole, switchRole } = useRoleContext()
  const navigate = useNavigate()

  const roleIcons = {
    student: User,
    admin: Shield,
    service: Briefcase,
  }

  const handleRoleSwitch = (role) => {
    switchRole(role)
    navigate(`/${role}`)
  }

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {['student', 'admin', 'service'].map((role) => {
        const Icon = roleIcons[role]
        return (
          <button
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              currentRole === role
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
            }`}
            title={`Switch to ${role} role`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
          </button>
        )
      })}
    </div>
  )
}
