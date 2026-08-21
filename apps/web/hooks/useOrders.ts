'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Address {
  id: string
  label: string
  line1: string
  line2?: string
  city: string
 state: string
  pincode: string
  isDefault: boolean
}

export interface OrderItem {
  id: string
  productName: string
  productSku: string
  unitPrice: number
  quantity: number
  total: number
}

export interface Order {
  id: string
  status: string
  subtotal: number
  discount: number
  total: number
  createdAt: string
  items: OrderItem[]
  address: Address
  payment: {
    status: string
    razorpayPaymentId?: string
  }
}

export function useSavedAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get<Address[]>('/orders/addresses/saved'),
  })
}

export function useSaveAddress() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (
      data: Omit<Address, 'id' | 'isDefault'>
    ) => api.post('/orders/addresses/saved', data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: {
      savedAddressId?: string
      oneTimeAddress?: Omit<
        Address,
        'id' | 'label' | 'isDefault'
      >
      notes?: string
    }) =>
      api.post<{
        order: Order
        razorpayOrderId: string
        amount: number
        currency: string
        mockPaymentId?: string
      }>('/orders', data),
  })
}

export function useConfirmPayment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      razorpayOrderId: string
      razorpayPaymentId: string
    }) =>
      api.post('/orders/confirm-payment', data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get<Order[]>('/orders'),
  })
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => api.get<Order>(`/orders/${orderId}`),
    enabled: !!orderId,
  })
}