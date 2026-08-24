import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface ProductReview {
  id: string
  productName: string
  customerName: string
  rating: number
  comment: string
  date: string
  status: 'Published' | 'Pending' | 'Rejected'
}

export function useProductReviews() {
  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => api.get<ProductReview[]>('/admin/reviews'),
  })
}

export function useApproveReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/reviews/${id}/approve`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })
}

export function useRejectReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/reviews/${id}/reject`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })
}