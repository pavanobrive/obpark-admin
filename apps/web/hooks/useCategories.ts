import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      name: string
      slug: string
      description?: string
      imageUrl?: string
    }) => api.post('/admin/categories', data),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['categories'],
      })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/admin/categories/${id}`),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['categories'],
      })
    },
  })
}