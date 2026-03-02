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
    <div className="hidden md:flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10 backdrop-blur">
      {['student', 'admin', 'service'].map((role) => {
        const Icon = roleIcons[role]
        return (
          <button
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
              currentRole === role
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-300 border border-transparent'
            }`}
            title={`Switch to ${role} role`}
          >
            <Icon size={15} />
            <span className="hidden lg:inline">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
          </button>
        )
      })}
    </div>
  )
}
