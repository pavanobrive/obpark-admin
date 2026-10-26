import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Category {
  id: string
  categoryName?: string
  name: string
  slug: string
  shortDescription?: string
  description?: string
  imagePath?: string
  imageUrl?: string
  children?: Category[]
}

export interface Product {
  id: string
  productId?: string
  productName: string
  name?: string
  productHeading?: string
  brand?: string
  slug?: string
  productDescription?: string
  description?: string
  longDescription?: string
  productFeatures?: string[]
  productCost?: number
  basePrice?: number
  price: number
  platformCharges?: number
  discountCoupon?: string
  hsnCode?: string
  taxCode?: string
  gst?: number
  gstRate?: number
  imagePath?: string
  images: string[]
  category: Category
  shippingInformation?: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  limit: number
  offset: number
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
    staleTime: 1000 * 60 * 10,
  })
}

export function useProducts(filters: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v))
  })
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get<ProductsResponse>(`/admin/products?${params.toString()}`),
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get<Product[]>('/admin/products?limit=6'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => api.get<Product>(`/admin/products/${idOrSlug}`),
    enabled: !!idOrSlug,
  })
}
