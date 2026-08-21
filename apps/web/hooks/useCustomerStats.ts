import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface CustomerStats {
  totalCustomers: number
  newCustomers: number
}

export function useCustomerStats() {
  return useQuery({
    queryKey: ['admin', 'customers', 'stats'],
    queryFn: () => api.get<CustomerStats>('/admin/customers/stats'),
  })
}