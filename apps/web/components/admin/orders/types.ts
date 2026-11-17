export interface AdminOrderItem {
  productName: string
  quantity: number
  price?: number
}

export interface AdminOrder {
  id: string
  orderNumber?: string
  status: string
  total: number
  totalAmount?: number
  createdAt: string
  user?: { firstName?: string; lastName?: string; email: string }
  customerName?: string
  email?: string
  shippingAddress?: any
  items: AdminOrderItem[]
  payment?: { status: string } | null
  paymentStatus?: string
}
