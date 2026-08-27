import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

interface AuthResponse {
  user: { id: string; email: string; name: string; role: 'CUSTOMER' | 'ADMIN' }
  accessToken: string
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<AuthResponse>('/auth/login', data),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken)
      router.push('/admin')
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const router = useRouter()

  return async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore network errors on logout, clear local state regardless
    }
    clearAuth()
    router.push('/login')
  }
}