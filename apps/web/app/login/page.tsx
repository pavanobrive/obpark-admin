'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useLogin } from '@/hooks/useAuth'
import { microgrammaBold } from '@/lib/fonts'

const WAYPOINTS = [
  { label: 'Commerce', offset: '78%' },
  { label: 'Parking', offset: '48%' },
  { label: 'Mobility', offset: '18%' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    login.mutate({ email: email.trim(), password })
  }

  return (
    <div className="min-h-screen flex bg-white">
      <style>{`
        @keyframes obrive-dash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -120; }
        }
        @keyframes obrive-travel {
          0%   { offset-distance: 0%; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes obrive-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .obrive-road-line { animation: obrive-dash 3.2s linear infinite; }
        .obrive-travel-dot {
          offset-path: path('M 140 460 C 140 300, 160 180, 200 20');
          animation: obrive-travel 4.5s ease-in-out infinite;
        }
        .obrive-waypoint { animation: obrive-fade-up 0.7s ease-out backwards; }
        @media (prefers-reduced-motion: reduce) {
          .obrive-road-line, .obrive-travel-dot, .obrive-waypoint { animation: none !important; }
        }
      `}</style>

      {/* Left — brand panel */}
      <div
        className="hidden lg:flex lg:w-[46%] relative flex-col justify-between overflow-hidden px-12 py-10"
        style={{ background: '#95D0CC' }}
      >
        <div className="flex items-center gap-3">
  <img
    src="/icon.svg"
    alt="Obrive"
    className="h-12 w-12 object-contain"
  />

  <div>
    <h1 className={`${microgrammaBold.className} text-2xl font-bold text-[#05302a] tracking-wide`}>
      OBRIVE
    </h1>
    <p className="text-xs text-[#05302a]/70 mt-1 tracking-wide">
      Admin Panel
    </p>
  </div>
</div>

        {/* Signature: perspective route with waypoints for the three product pillars */}
        <div className="relative flex-1 my-8">
          <svg
            viewBox="0 0 400 480"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="roadFade" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0%" stopColor="#05302a" stopOpacity="0" />
  <stop offset="15%" stopColor="#05302a" stopOpacity="0.45" />
  <stop offset="100%" stopColor="#05302a" stopOpacity="0.8" />
</linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* road shoulders, converging */}
            <path d="M 40 480 L 195 10" stroke="#05302a" strokeOpacity="0.25" strokeWidth="2" fill="none" />
            <path d="M 260 480 L 210 10" stroke="#05302a" strokeOpacity="0.25" strokeWidth="2" fill="none" />

            {/* animated dashed centerline */}
            <path
              d="M 140 460 C 140 300, 160 180, 200 20"
              stroke="url(#roadFade)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="14 10"
              fill="none"
              className="obrive-road-line"
            />

            {/* traveling glow dot representing a live vehicle */}
            <circle r="5" fill="#05302a" filter="url(#glow)" className="obrive-travel-dot" />
          </svg>

          {/* waypoint labels — real product pillars, not decorative numbers */}
          <div className="relative h-full flex flex-col justify-between py-4 pl-[58%]">
            {WAYPOINTS.map((w, i) => (
              <div
                key={w.label}
                className="obrive-waypoint flex items-center gap-2"
                style={{ animationDelay: `${0.15 + i * 0.15}s` }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#05302a]" />
                <span className={`${microgrammaBold.className} text-[13px] text-[#05302a] tracking-wide`}>
                  {w.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-[#05302a]/80 leading-relaxed max-w-xs">
            Smart vehicle commerce, parking and mobility — run from one dashboard.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#05302a]/70">
            <span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#05302a] opacity-40" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#05302a]" />
</span>
            All systems operational
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only brand mark */}
          <div className="lg:hidden mb-8 flex flex-col items-center">
  <img
    src="/icon.svg"
    alt="Obrive"
    className="h-16 w-16 object-contain mb-3"
  />

  <h1
    className={`${microgrammaBold.className} text-xl font-bold`}
    style={{ color: '#074139' }}
  >
    OBRIVE
  </h1>

  <p className="text-xs text-gray-400 mt-1">
    Admin Panel
  </p>
</div>

          <h2 className={`${microgrammaBold.className} text-[22px] font-semibold text-gray-800`}>
            Sign in
          </h2>
          <p className="text-sm text-gray-400 mt-1 mb-8">
            Enter your credentials to access the admin panel.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-xs font-medium text-gray-500 mb-1.5 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@obpark.in"
                autoFocus
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-[#074139] focus:ring-2 focus:ring-[#074139]/15"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-medium text-gray-500 block">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors focus:border-[#074139] focus:ring-2 focus:ring-[#074139]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {login.isError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <p className="text-xs text-red-600">
                  {(login.error as Error)?.message || "That email and password don't match. Try again."}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending || !email.trim() || !password}
              className={`${microgrammaBold.className} w-full py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity`}
              style={{ backgroundColor: '#074139' }}
            >
              {login.isPending ? (
                'Signing in…'
              ) : (
                <>
                  Sign in <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-gray-300 text-center mt-10">
            Obrive Admin · Restricted access
          </p>
        </div>
      </div>
    </div>
  )
}