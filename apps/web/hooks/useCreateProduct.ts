import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface CreateProductPayload {
  name: string
  slug: string
  description?: string
  basePrice: number
  sku: string
  stock: number
  categoryId: string
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductPayload) => api.post('/admin/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}