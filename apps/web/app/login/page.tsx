'use client'

import { useState } from 'react'
import { useLogin } from '@/hooks/useAuth'
import { microgrammaBold } from '@/lib/fonts'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    login.mutate({ email: email.trim(), password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className={`${microgrammaBold.className} text-2xl font-bold`} style={{ color: '#074139' }}>
            Obrive
          </h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-md">
          <h2 className={`${microgrammaBold.className} text-lg font-semibold text-gray-800 mb-4`}>
            Sign in
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@obpark.in"
                autoFocus
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-gray-400"
              />
            </div>

            {login.isError && (
              <p className="text-xs text-red-500">
                {(login.error as Error)?.message || 'Login failed. Check your credentials.'}
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending || !email.trim() || !password}
              className={`${microgrammaBold.className} w-full py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-50`}
              style={{ backgroundColor: '#074139' }}
            >
              {login.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}