import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  basePrice: number
  images: string[]
  stock: number
  compatibility: {
    make: string
    model: string
    yearFrom: number
    yearTo: number
  }[]
  category?: Category
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

export function useProducts(
  filters: Record<string, string | number | undefined> = {}
) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  return useQuery({
    queryKey: ['products', filters],
    queryFn: () =>
      api.get<ProductsResponse>(
        `/products?${params.toString()}`
      ),
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get<Product[]>('/products/featured'),
  })
}

export function useProduct(slug: string, vrn?: string) {
  return useQuery({
    queryKey: ['product', slug, vrn],
    queryFn: () =>
      api.get<Product>(
        `/products/${slug}${vrn ? `?vrn=${vrn}` : ''}`
      ),
    enabled: !!slug,
  })
}