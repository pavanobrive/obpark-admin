export interface CustomerAddress {
  id: string
  label?: string
  type?: string
  streetAddress: string
  apartmentSuite?: string | null
  city: string
  zipCode: string
  country: string
  isDefault: boolean
}

export interface Customer {
  id: string
  userId?: string
  name: string
  email?: string
  phone: string
  city?: string
  avatar?: string | null
  orderCount: number
  totalSpend: number
  status: 'Active' | 'Inactive' | 'VIP'
  addresses?: CustomerAddress[]
  createdAt?: string | Date
}
