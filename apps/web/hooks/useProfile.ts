import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AdminProfile } from '@/components/admin/adminrole/types'

// Real — maps to your existing GET /me from Week 1 plan
export function useProfile() {
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: () => api.get<AdminProfile>('/me'),
  })
}

// Real — maps to your existing PATCH /profile from Week 1 plan
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AdminProfile>) => api.patch('/profile', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profile'] }),
  })
}

// TODO: no change-password endpoint confirmed yet — check AuthModule for a PATCH /auth/password or similar
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.patch('/auth/password', data),
  })
}