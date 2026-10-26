import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface CreateProductPayload {
  productId?: string
  productName: string
  name?: string // alias
  productHeading?: string
  brand?: string
  productDescription?: string
  description?: string // alias
  longDescription?: string
  productFeatures?: string[] | string
  productCost: number
  basePrice?: number // alias
  price?: number
  platformCharges?: number
  discountCoupon?: string
  currencySymbol?: string
  hsnCode?: string
  taxCode?: string
  gst?: number
  gstRate?: number
  imagePath?: string
  images: string[]
  galleryImages?: string[]
  discountText?: string
  categoryId: string
  shippingInformation?: string
  attributes?: any
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductPayload) => api.post('/admin/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}
