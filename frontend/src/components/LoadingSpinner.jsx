import { Loader2 } from 'lucide-react'

/**
 * LoadingSpinner - reusable loading spinner component
 */
export const LoadingSpinner = ({ message = 'Loading...', size = 24 }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-indigo-400" size={size} />
        {message && <p className="text-secondary text-sm">{message}</p>}
      </div>
    </div>
  )
}

/**
 * LoadingOverlay - full-screen loading overlay
 */
export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card rounded-lg p-8 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-400" size={40} />
          <p className="text-white font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * InlineLoader - small inline loading indicator
 */
export const InlineLoader = ({ message }) => {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className="animate-spin text-indigo-400" size={16} />
      {message && <span className="text-secondary text-sm">{message}</span>}
    </div>
  )
}
