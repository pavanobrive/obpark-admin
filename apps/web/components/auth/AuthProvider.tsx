'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

interface AuthResponse {
  user: { id: string; email: string; name: string; role: 'CUSTOMER' | 'ADMIN' }
  accessToken: string
  refreshToken: string
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setHydrated, refreshToken } = useAuthStore()

  useEffect(() => {
    // No refresh token in memory — nothing to restore, mark hydrated immediately
    if (!refreshToken) {
      setHydrated(true)
      return
    }

    // Try to get a new access token using the refresh token in memory
    api.post<AuthResponse>('/auth/refresh', { refreshToken })
      .then((res) => {
        setAuth(res.user, res.accessToken, res.refreshToken)
      })
      .catch(() => {
        clearAuth()
      })
      .finally(() => {
        setHydrated(true)
      })
  }, [])

  return <>{children}</>
}