import {
  LayoutDashboard, ShoppingCart, Users, Ticket, FolderTree,
  CreditCard, PlusCircle, ImageIcon, PackageSearch,
  MessageSquareText, Star, Settings,
} from 'lucide-react'

export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Order Management', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupon Code', icon: Ticket },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/transactions', label: 'Transaction', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
  { href: '/admin/products/add', label: 'Add Products', icon: PlusCircle },
  { href: '/admin/products/media', label: 'Product Media', icon: ImageIcon },
  { href: '/admin/products', label: 'Product List', icon: PackageSearch, exact: true },
  { href: '/admin/products/reviews', label: 'Product Reviews', icon: MessageSquareText },
  { href: '/admin/adminrole', label: 'Admin Role', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]