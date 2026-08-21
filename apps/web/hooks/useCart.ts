'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface CartItem {
  id: string
  quantity: number
  compatibilityStatus: 'compatible' | 'incompatible' | 'unknown'
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    images: string[]
    sku: string
    category: { name: string }
    compatibility: any[]
  }
  vehicle: {
    id: string
    vrn: string
    make: string
    model: string
    year: number
  } | null
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  itemCount: number
}

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get<Cart>('/cart'),
    retry: false,
  })
}

export function useAddToCart() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      productId: string
      vehicleId?: string
      quantity?: number
    }) =>
      api.post('/cart/items', {
        quantity: 1,
        ...data,
      }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string
      quantity: number
    }) =>
      api.patch(`/cart/items/${itemId}`, {
        quantity,
      }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) =>
      api.delete(`/cart/items/${itemId}`),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useLinkVehicleToItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemId,
      vehicleId,
    }: {
      itemId: string
      vehicleId: string | null
    }) =>
      api.patch(`/cart/items/${itemId}/vehicle`, {
        vehicleId,
      }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}