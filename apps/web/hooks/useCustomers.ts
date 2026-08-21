import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Customer } from '@/components/admin/customers/types'

export function useCustomers() {
  return useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () => api.get<Customer[]>('/admin/customers'),
  })
}