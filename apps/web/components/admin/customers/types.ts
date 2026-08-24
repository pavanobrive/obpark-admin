export interface Customer {
  id: string
  name: string
  phone: string
   orderCount: number
  totalSpend: number
  status: 'Active' | 'Inactive' | 'VIP'
}