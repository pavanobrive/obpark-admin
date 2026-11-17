import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AdminProfile } from '@/components/admin/adminrole/types'

// Real — maps to existing GET /me
export function useProfile() {
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: () => api.get<AdminProfile>('/me'),
  })
}

// Real — maps to existing PATCH /profile
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AdminProfile>) => api.patch('/profile', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profile'] }),
  })
}

// Maps to existing PATCH /auth/password
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.patch('/auth/password', data),
  })
}
