import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useTransactionSummary() {
  return useQuery({
    queryKey: ['admin', 'transactions', 'summary'],
    queryFn: () => api.get<{ totalRevenue: number; completed: number; pending: number; failed: number }>('/admin/transactions/summary'),
  })
}

export function useTransactions() {
  return useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: () => api.get<{ transactions: any[]; total: number }>('/admin/transactions'),
  })
}