import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface AdminProduct {
  id: string
  productId: string
  sku?: string // alias
  productHeading?: string
  productName: string
  name: string // alias
  title?: string
  brand: string
  productDescription?: string
  description?: string // alias
  longDescription?: string
  productFeatures: string[]
  productCost: number
  basePrice: number // alias
  price: number
  platformCharges: number
  discountCoupon?: string
  currencySymbol: string
  taxCode?: string
  hsnCode?: string
  gst?: number
  gstRate?: number
  imagePath?: string
  images: string[]
  galleryImages: string[]
  discountText?: string
  productRating: number
  totalReviewsCount: number
  categoryId: string
  category: {
    id: string
    categoryName: string
    name: string // alias
    slug?: string
  }
  shippingInformation?: string
  attributes?: any
  createdAt: string
  updatedAt: string
}

export interface TaxMasterItem {
  code: string
  description: string
  type: string
  gstRate: number
}

export function useAdminProducts(search?: string, limit?: number, page?: number) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (limit) params.set('limit', String(limit))
  if (page) params.set('page', String(page))

  const qs = params.toString() ? `?${params.toString()}` : ''

  return useQuery({
    queryKey: ['admin', 'products', search, limit, page],
    queryFn: () => api.get<{ products: AdminProduct[]; total: number }>(`/admin/products${qs}`),
  })
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => api.get<AdminProduct>(`/admin/products/${id}`),
    enabled: !!id,
  })
}

export function useTaxes() {
  return useQuery({
    queryKey: ['admin', 'taxes'],
    queryFn: () => api.get<TaxMasterItem[]>('/admin/taxes'),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminProduct> }) =>
      api.patch<AdminProduct>(`/admin/products/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'product'] })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}

// Alias for backwards compatibility
export const useArchiveProduct = useDeleteProduct
