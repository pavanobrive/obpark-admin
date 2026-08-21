'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Users, Ticket, FolderTree,
  CreditCard, Star, PlusCircle, ImageIcon, PackageSearch,
  MessageSquareText, Settings, LogOut,
} from 'lucide-react'
import { useLogout } from '@/hooks/useAuth'
import { microgrammaBold } from '@/lib/fonts'

const NAV_GROUPS = [
  {
    label: 'Main menu',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/orders', label: 'Order Management', icon: ShoppingCart },
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/coupons', label: 'Coupon Code', icon: Ticket },
      { href: '/admin/categories', label: 'Categories', icon: FolderTree },
      { href: '/admin/transactions', label: 'Transaction', icon: CreditCard },
      { href: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
      
    ],
  },
  {
    label: 'Product',
    items: [
      { href: '/admin/products/add', label: 'Add Products', icon: PlusCircle },
      { href: '/admin/products/media', label: 'Product Media', icon: ImageIcon },
      { href: '/admin/products', label: 'Product List', icon: PackageSearch, exact: true },
      { href: '/admin/products/reviews', label: 'Product Reviews', icon: MessageSquareText },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/admin/adminrole', label: 'Admin Role', icon: Star },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const logout = useLogout()

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="px-6 py-5 border-b">
        <Link href="/" className={`font-bold text-lg ${microgrammaBold.className}`} style={{ color: '#074139' }}>
          Obrive
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className={`px-3 mb-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide ${microgrammaBold.className}`}>
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${microgrammaBold.className} ${
  active ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
}`}
                    style={active ? { backgroundColor: '#074139' } : {}}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${microgrammaBold.className}`}
        >
          <LogOut className={`${microgrammaBold.className} h-4 w-4 shrink-0`} />
          Logout
        </button>
      </div>
    </div>
  )
}