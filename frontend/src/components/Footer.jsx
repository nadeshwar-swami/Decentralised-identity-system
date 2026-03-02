import { Github, Twitter, Globe } from 'lucide-react'

/**
 * Footer component - app footer with links and info
 */
export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔒</span>
              <h3 className="font-bold text-gray-900">Campus DID</h3>
            </div>
            <p className="text-sm text-gray-600">
              Decentralized identity system for campus ecosystems, built on Algorand TestNet.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/student" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Student Dashboard
                </a>
              </li>
              <li>
                <a href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Admin Portal
                </a>
              </li>
              <li>
                <a href="/service" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Service Verification
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://developer.algorand.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  Algorand Docs
                  <Globe size={14} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.w3.org/TR/did-core/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  W3C DID Spec
                  <Globe size={14} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.w3.org/TR/vc-data-model/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  W3C VC Spec
                  <Globe size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
          <p>
            Campus DID MVP • Built with React, Algorand, and W3C Standards • Algorand TestNet
          </p>
          <p className="mt-1 text-xs text-gray-500">
            App ID: 756415000 • For educational and demonstration purposes
          </p>
        </div>
      </div>
    </footer>
  )
}
