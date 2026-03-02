import React from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * ErrorBoundary - catch and display React errors gracefully
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.state = { hasError: true, error, errorInfo }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen page-bg flex items-center justify-center p-4">
          <div className="max-w-lg w-full card rounded-lg p-8 border-2 border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-400" size={32} />
              <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            </div>
            
            <p className="text-secondary mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-white hover:text-secondary">
                  Error details
                </summary>
                <pre className="mt-2 text-xs bg-white/5 p-3 rounded overflow-auto max-h-40 text-red-400 border border-white/10">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
