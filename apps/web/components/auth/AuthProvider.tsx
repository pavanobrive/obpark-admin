'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { refreshSession } from '@/lib/auth.api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setHydrated } = useAuthStore()

  useEffect(() => {
    // If the store already rehydrated with an active session, ensure hydrated is set
    setHydrated(true)

    refreshSession()
      .then((res) => {
        if (res?.user && res?.accessToken) {
          setAuth(res.user, res.accessToken)
        }
      })
      .catch(() => {
        // Only clear auth if we don't even have an access token stored
        const currentToken = useAuthStore.getState().accessToken
        if (!currentToken) {
          clearAuth()
        }
      })
      .finally(() => {
        setHydrated(true)
      })
  }, [setAuth, clearAuth, setHydrated])

  return <>{children}</>
}
