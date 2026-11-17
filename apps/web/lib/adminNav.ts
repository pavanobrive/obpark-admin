import {
  LayoutDashboard, ShoppingCart, Users, Ticket, FolderTree,
  CreditCard, PlusCircle, ImageIcon, PackageSearch,
  MessageSquareText, ShieldCheck, Settings, TrendingUp,
} from 'lucide-react'

export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Order Management', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupon Code', icon: Ticket },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/transactions', label: 'Transaction', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/products/add', label: 'Add Products', icon: PlusCircle },
  // { href: '/admin/products/media', label: 'Product Media', icon: ImageIcon }, // Hidden for now: to be converted to Banners & Promotional Media
  { href: '/admin/products', label: 'Product List', icon: PackageSearch, exact: true },
  { href: '/admin/products/reviews', label: 'Product Reviews', icon: MessageSquareText },
  { href: '/admin/adminrole', label: 'Admin Role', icon: ShieldCheck },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]
