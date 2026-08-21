export interface Customer {
  id: string
  name: string
  phone: string
  orders: number
  spend: number
  status: 'Active' | 'Inactive' | 'VIP'
}