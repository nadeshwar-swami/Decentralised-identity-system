import { useNavigate } from 'react-router-dom'
import { useRoleContext } from '../context/RoleContext'
import { User, Shield, Briefcase, ArrowRight, CheckCircle2, Wallet, Award, Share2, Zap, ChevronRight } from 'lucide-react'

/**
 * Landing page - intro with role cards
 */
export const Landing = () => {
  const navigate = useNavigate()
  const { switchRole } = useRoleContext()

  const handleRoleSelect = (role) => {
    switchRole(role)
    navigate(`/${role}`)
  }

  const roles = [
    {
      id: 'student',
      title: 'Student Workspace',
      subtitle: 'Own your campus identity',
      icon: User,
      features: [
        '→ Create your DID anchored on Algorand',
        '→ Receive credential NFTs from university',
        '→ Share only what each service needs',
        '→ One wallet for library, hostel, events, exams'
      ],
      tag: 'For Students',
      accent: 'from-purple-500/20 to-indigo-500/20 border-indigo-500/30',
    },
    {
      id: 'admin',
      title: 'Issuance Workspace',
      subtitle: 'Issue tamper-proof credentials',
      icon: Shield,
      features: [
        '→ Issue verified credentials as Algorand NFTs',
        '→ Credentials logged immutably on-chain',
        '→ Manage all student credential records',
        '→ Bulk issuance for entire departments'
      ],
      tag: 'For University Admin',
      accent: 'from-violet-500/20 to-purple-500/20 border-purple-500/30',
    },
    {
      id: 'service',
      title: 'Verification Workspace',
      subtitle: 'Verify without storing',
      icon: Briefcase,
      features: [
        '→ Scan student QR code or paste proof',
        '→ Verify against Algorand blockchain',
        '→ Zero data retention — verify and forget',
        '→ Full audit trail of every verification'
      ],
      tag: 'For Campus Services',
      accent: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30',
    },
  ]

  return (
    <div className="page-bg blob-container relative min-h-screen">
      <div className="blob-1"></div>
      <div className="blob-2"></div>
      
      <div className="page-shell">
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-sm mb-6 text-sm text-cyan-300">
            <span></span>
            <span>Built on Algorand TestNet</span>
            <span className="text-cyan-500/50">•</span>
            <span>W3C DID Standard</span>
            <span className="text-cyan-500/50">•</span>
            <span>On-Chain Identity Registry</span>
            <span></span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
            <span className="text-slate-400">Decentralised Identity System</span>{' '}
            <span className="text-slate-200">for&nbsp;Campuses</span>
          </h1>
          <p className="text-lg lg:text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
            One wallet connects you to every campus service.<br />
            No passwords. No data leaks. No middlemen.
          </p>
        </div>

        <section className="card mb-8 lg:mb-10 backdrop-blur-md">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">What is Campus DID?</h2>
              <p className="text-secondary text-base leading-relaxed">
                Campus DID replaces every campus login, ID card, and paper credential with a single blockchain identity. 
                Students own their data. Universities issue tamper-proof credentials. Services verify in seconds — without storing anything.
              </p>
              <p className="text-secondary text-base leading-relaxed mt-3">
                Powered by Algorand's 4-second finality and IPFS decentralized storage.
              </p>
            </div>

            <div className="panel-card-soft">
              <h2 className="text-lg font-semibold mb-4">Why this platform</h2>
              <ul className="space-y-3 text-sm text-secondary">
                <li>Your DID is permanent — no university can revoke your identity</li>
                <li>Credentials are NFTs — provably yours, forever on-chain</li>
                <li>Selective disclosure — show only what each service needs</li>
                <li>4-second verification — faster than swiping a card</li>
                <li>W3C standard — works beyond this campus, globally</li>
                <li>Zero passwords — your wallet IS your login</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 mb-10 py-8">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold gradient-text mb-1">&lt; 4s</div>
            <div className="text-sm text-muted">Verification Speed</div>
          </div>
          <div className="hidden lg:block w-px h-16 bg-white/10"></div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold gradient-text mb-1">100%</div>
            <div className="text-sm text-muted">On-Chain Audit Trail</div>
          </div>
          <div className="hidden lg:block w-px h-16 bg-white/10"></div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold gradient-text mb-1">0</div>
            <div className="text-sm text-muted">Passwords Required</div>
          </div>
          <div className="hidden lg:block w-px h-16 bg-white/10"></div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold gradient-text mb-1">W3C</div>
            <div className="text-sm text-muted">DID Standard</div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6 mb-10">
          {roles.map(({ id, title, subtitle, icon: Icon, features, tag, accent }) => (
            <button
              key={id}
              onClick={() => handleRoleSelect(id)}
              className={`text-left card hover:shadow-lg hover:-translate-y-0.5 transition-all bg-gradient-to-br ${accent} backdrop-blur-md`}
            >
              <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                <Icon size={22} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mt-4">{title}</h3>
              <p className="text-sm text-indigo-300 mt-1">{subtitle}</p>
              <div className="mt-4 space-y-2">
                {features.map((feature, idx) => (
                  <p key={idx} className="text-sm text-secondary leading-relaxed">{feature}</p>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-muted">{tag}</span>
                <div className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  Open workspace <ArrowRight size={15} />
                </div>
              </div>
            </button>
          ))}
        </section>

        <section className="card backdrop-blur-md mb-10">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-center px-5 py-10 gap-0">
            <div className="flex flex-col items-center text-center w-40">
              <div className="w-5 h-5 mb-2 rounded-full bg-[rgba(99,102,241,0.2)] border border-[rgba(99,102,241,0.4)] text-[#A5B4FC] text-[11px] font-semibold flex items-center justify-center">1</div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)]">
                <Wallet size={28} className="text-indigo-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#E2E8F0] mb-1">Connect</h3>
              <p className="text-[13px] text-[#64748B] text-center max-w-[120px]">Link your Pera Wallet on TestNet</p>
            </div>

            <div className="w-10 shrink-0 flex items-center justify-center mb-5 text-[rgba(99,102,241,0.3)] rotate-90 md:rotate-0">
              <ChevronRight size={20} />
            </div>

            <div className="flex flex-col items-center text-center w-40">
              <div className="w-5 h-5 mb-2 rounded-full bg-[rgba(99,102,241,0.2)] border border-[rgba(99,102,241,0.4)] text-[#A5B4FC] text-[11px] font-semibold flex items-center justify-center">2</div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)]">
                <Shield size={28} className="text-violet-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#E2E8F0] mb-1">Register</h3>
              <p className="text-[13px] text-[#64748B] text-center max-w-[120px]">Anchor your DID on Algorand</p>
            </div>

            <div className="w-10 shrink-0 flex items-center justify-center mb-5 text-[rgba(99,102,241,0.3)] rotate-90 md:rotate-0">
              <ChevronRight size={20} />
            </div>

            <div className="flex flex-col items-center text-center w-40">
              <div className="w-5 h-5 mb-2 rounded-full bg-[rgba(99,102,241,0.2)] border border-[rgba(99,102,241,0.4)] text-[#A5B4FC] text-[11px] font-semibold flex items-center justify-center">3</div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)]">
                <Award size={28} className="text-purple-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#E2E8F0] mb-1">Receive</h3>
              <p className="text-[13px] text-[#64748B] text-center max-w-[120px]">Get credential NFTs</p>
            </div>

            <div className="w-10 shrink-0 flex items-center justify-center mb-5 text-[rgba(99,102,241,0.3)] rotate-90 md:rotate-0">
              <ChevronRight size={20} />
            </div>

            <div className="flex flex-col items-center text-center w-40">
              <div className="w-5 h-5 mb-2 rounded-full bg-[rgba(99,102,241,0.2)] border border-[rgba(99,102,241,0.4)] text-[#A5B4FC] text-[11px] font-semibold flex items-center justify-center">4</div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[rgba(6,182,212,0.15)] border border-[rgba(6,182,212,0.3)]">
                <Share2 size={28} className="text-cyan-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#E2E8F0] mb-1">Verify</h3>
              <p className="text-[13px] text-[#64748B] text-center max-w-[120px]">Share proof via QR</p>
            </div>
          </div>
        </section>

        <section className="text-center py-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-2">
              <Zap size={16} className="text-indigo-400" />
              Algorand TestNet
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-violet-400" />
              IPFS + Pinata Storage
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-2">
              <Shield size={16} className="text-cyan-400" />
              W3C DID + VC Standard
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
