import { Loader2 } from 'lucide-react'

/**
 * LoadingSpinner - reusable loading spinner component
 */
export const LoadingSpinner = ({ message = 'Loading...', size = 24 }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={size} />
        {message && <p className="text-gray-600 text-sm">{message}</p>}
      </div>
    </div>
  )
}

/**
 * LoadingOverlay - full-screen loading overlay
 */
export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-900 font-medium">{message}</p>
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
      <Loader2 className="animate-spin text-blue-600" size={16} />
      {message && <span className="text-gray-600 text-sm">{message}</span>}
    </div>
  )
}
