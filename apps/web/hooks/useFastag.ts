import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface FastagBalance {
  vrn: string
  bank: string
  balance: number
  status: string
  tagId: string
  vehicle: { id: string; make: string; model: string; vrn: string }
}

export interface RechargeOrder {
  orderId: string
  amount: number
  currency: string
  vrn: string
  mockPaymentId?: string
}

export function useFastagBalance(vrn: string | null) {
  return useQuery({
    queryKey: ['fastag', 'balance', vrn],
    queryFn: () => api.post<FastagBalance>('/fastag/lookup', { vrn }),
    enabled: !!vrn,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

export function useInitiateRecharge() {
  return useMutation({
    mutationFn: ({ vrn, amount }: { vrn: string; amount: number }) =>
      api.post<RechargeOrder>('/fastag/recharge', { vrn, amount }),
  })
}

export function useConfirmRecharge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      razorpayOrderId,
      razorpayPaymentId,
    }: {
      razorpayOrderId: string
      razorpayPaymentId: string
    }) => api.post('/fastag/confirm', { razorpayOrderId, razorpayPaymentId }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['fastag', 'balance'] })
    },
  })
}

export function useFastagHistory() {
  return useQuery({
    queryKey: ['fastag', 'history'],
    queryFn: () => api.get<any[]>('/fastag/history'),
  })
}