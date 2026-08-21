import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  children?: Category[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  basePrice: number
  images: string[]
  stock: number
  compatibility: { make: string; model: string; yearFrom: number; yearTo: number }[]
  category: Category
  compatibilityStatus?: 'compatible' | 'incompatible' | 'unknown'
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
    queryFn: () => api.get<ProductsResponse>(`/products?${params.toString()}`),
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get<Product[]>('/products/featured'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useProduct(slug: string, vrn?: string) {
  return useQuery({
    queryKey: ['product', slug, vrn],
    queryFn: () => api.get<Product>(`/products/${slug}${vrn ? `?vrn=${vrn}` : ''}`),
    enabled: !!slug,
  })
}