import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalUsers: number
  recentOrders: any[]
}

export interface AdminProduct {
  id: string
  name: string
  slug: string
  sku: string
  basePrice: number
  stock: number
  isActive: boolean
  category: { id: string; name: string }
  compatibility: any[]
}

export interface AdminOrder {
  id: string
  status: string
  total: number
  createdAt: string
  user: { name: string; email: string }
  items: { productName: string; quantity: number; total: number }[]
  address: { city: string; state: string }
  payment: { status: string }
}

export interface Coupon {
  id: string
  code: string
  description?: string
  discountType: 'FLAT' | 'PERCENTAGE'
  discountValue: number
  minOrderValue?: number
  maxUses?: number
  usedCount: number
  isActive: boolean
  expiresAt?: string
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<DashboardStats>('/admin/dashboard'),
  })
}

export function useAdminProducts(filters: Record<string, string> = {}) {
  const params = new URLSearchParams(filters).toString()
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => api.get<{ products: AdminProduct[]; total: number }>(`/admin/products?${params}`),
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/admin/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/admin/products/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useArchiveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}

export function useAdminOrders(filters: Record<string, string> = {}) {
  const params = new URLSearchParams(filters).toString()
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => api.get<{ orders: AdminOrder[]; total: number }>(`/admin/orders?${params}`),
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.patch(`/admin/orders/${orderId}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  })
}

export function useCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => api.get<Coupon[]>('/coupons'),
  })
}

export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/coupons', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
}

export function useToggleCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/coupons/${id}/toggle`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
}