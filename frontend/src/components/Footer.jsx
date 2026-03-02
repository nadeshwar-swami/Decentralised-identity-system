import { Globe } from 'lucide-react'
import { Logo } from './Logo'

/**
 * Footer component - app footer with links and info
 */
export const Footer = () => {
  return (
    <footer className="bg-black/50 border-t border-white/5 mt-auto backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Logo size={32} className="text-indigo-400" />
              <h3 className="font-bold text-white font-display">Campus DID</h3>
            </div>
            <p className="text-sm text-secondary leading-relaxed">
              Professional identity and credential workflows for students, institutions, and campus services.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white font-display mb-3">Workspaces</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-secondary hover:text-indigo-400 transition-colors">Home</a></li>
              <li><a href="/student" className="text-secondary hover:text-indigo-400 transition-colors">Student Workspace</a></li>
              <li><a href="/admin" className="text-secondary hover:text-indigo-400 transition-colors">Issuance Workspace</a></li>
              <li><a href="/service" className="text-secondary hover:text-indigo-400 transition-colors">Verification Workspace</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white font-display mb-3">Standards</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://developer.algorand.org" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-cyan-400 transition-colors inline-flex items-center gap-1">
                  Algorand Docs <Globe size={14} />
                </a>
              </li>
              <li>
                <a href="https://www.w3.org/TR/did-core/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-cyan-400 transition-colors inline-flex items-center gap-1">
                  W3C DID Core <Globe size={14} />
                </a>
              </li>
              <li>
                <a href="https://www.w3.org/TR/vc-data-model/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-cyan-400 transition-colors inline-flex items-center gap-1">
                  W3C VC Data Model <Globe size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-6 text-sm text-secondary flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p>Campus DID MVP • Algorand TestNet</p>
          <p className="text-xs text-muted">Built for secure desktop-first campus identity UX</p>
        </div>
      </div>
    </footer>
  )
}
