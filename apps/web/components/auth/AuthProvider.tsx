'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { refreshSession } from '@/lib/auth.api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setHydrated } = useAuthStore()

  useEffect(() => {
    refreshSession()
      .then((res) => {
        setAuth(res.user, res.accessToken)
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