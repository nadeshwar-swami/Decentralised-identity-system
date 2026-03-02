/**
 * Logo Component - D branding logo
 */
export const Logo = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle for contrast */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
      
      {/* D shape - modern geometric style */}
      <path
        d="M 30 20 L 55 20 C 70 20 80 30 80 50 C 80 70 70 80 55 80 L 30 80 Z"
        fill="url(#gradient)"
        stroke="rgba(99, 102, 241, 0.3)"
        strokeWidth="1"
      />
      
      {/* Inner cutout for D shape */}
      <path
        d="M 42 32 L 55 32 C 65 32 72 40 72 50 C 72 60 65 68 55 68 L 42 68 Z"
        fill="#0A0A0F"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
