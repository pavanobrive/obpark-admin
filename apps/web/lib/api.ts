import { useAuthStore } from '@/store/auth.store'

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3055').replace(/\/$/, '')

let refreshPromise: Promise<any> | null = null

async function getRefreshedSession() {
  if (!refreshPromise) {
    const { refreshSession } = await import('./auth.api')
    refreshPromise = refreshSession()
      .then((session) => {
        if (!session?.user || !session?.accessToken) {
          throw new Error('Invalid refresh response')
        }
        useAuthStore.getState().setAuth(session.user, session.accessToken)
        return session
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const token = useAuthStore.getState().accessToken
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  const res = await fetch(`${BASE_URL}${cleanEndpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (
    res.status === 401 &&
    retryOnUnauthorized &&
    !cleanEndpoint.startsWith('/auth/')
  ) {
    try {
      await getRefreshedSession()
      return request<T>(endpoint, options, false)
    } catch {
      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        const currentPath = window.location.pathname + window.location.search
        window.location.href = `/login?session_expired=true&next=${encodeURIComponent(currentPath)}`
      }
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return res.json()
}

export const api = {
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      ...(body !== undefined && { body: JSON.stringify(body) }),
    }),
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}
