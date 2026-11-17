import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Category {
  id: string
  categoryName: string
  name: string // alias
  slug: string
  shortDescription?: string
  description?: string // alias
  cardImage?: string // 1. Shop page category card
  bannerImage?: string // 2. Category page hero banner
  sliderImage?: string // 3. Carousel slider ("Everything Your Car Needs")
  imagePath?: string
  imageUrl?: string // alias
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateCategoryPayload {
  categoryName?: string
  name?: string
  slug?: string
  shortDescription?: string
  description?: string
  cardImage?: string
  bannerImage?: string
  sliderImage?: string
  imagePath?: string
  imageUrl?: string
}

export interface UpdateCategoryPayload {
  categoryName?: string
  name?: string
  slug?: string
  shortDescription?: string
  description?: string
  cardImage?: string
  bannerImage?: string
  sliderImage?: string
  imagePath?: string
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
    mutationFn: (data: CreateCategoryPayload) => api.post<Category>('/admin/categories', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      api.patch<Category>(`/admin/categories/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/admin/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
