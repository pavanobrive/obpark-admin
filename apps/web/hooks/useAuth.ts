import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

interface AuthResponse {
  user: { id: string; email: string; name: string; role: 'CUSTOMER' | 'ADMIN' }
  accessToken: string
  refreshToken: string
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<AuthResponse>('/auth/login', data),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken, res.refreshToken)  // ← 3 args
      router.push('/')
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) =>
      api.post<AuthResponse>('/auth/register', data),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken, res.refreshToken)  // ← 3 args
      router.push('/')
    },
  })
}

export function useLogout() {
  const { clearAuth, refreshToken } = useAuthStore()
  const router = useRouter()

  return () => {
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {})
    }
    clearAuth()
    router.push('/login')
  }
}