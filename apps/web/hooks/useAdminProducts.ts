import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface AdminProduct {
  id: string
  name: string
  slug: string
  sku: string
  basePrice: number
  stock: number
  isActive: boolean
  category: { id: string; name: string }
}

// Real — maps to your existing AdminProductService.listProducts (Doc 2)
export function useAdminProducts(search?: string) {
  return useQuery({
    queryKey: ['admin', 'products', search],
    queryFn: () => api.get<{ products: AdminProduct[]; total: number }>(
      `/admin/products${search ? `?search=${encodeURIComponent(search)}` : ''}`
    ),
  })
}

// Real — maps to AdminProductService.archiveProduct
export function useArchiveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}