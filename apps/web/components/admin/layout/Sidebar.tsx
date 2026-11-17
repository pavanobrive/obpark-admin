'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Users, Ticket, FolderTree,
  CreditCard, PlusCircle, ImageIcon, PackageSearch,
  MessageSquareText, ShieldCheck, Settings, LogOut, TrendingUp,
  Sparkles, ChevronRight
} from 'lucide-react'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { microgrammaBold } from '@/lib/fonts'
import Image from 'next/image'

const NAV_GROUPS = [
  {
    label: 'Main Menu',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/orders', label: 'Order Management', icon: ShoppingCart },
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/coupons', label: 'Coupon Code', icon: Ticket },
      { href: '/admin/categories', label: 'Categories', icon: FolderTree },
      { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
      { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    ],
  },
  {
    label: 'Product Catalog',
    items: [
      { href: '/admin/products/add', label: 'Add Products', icon: PlusCircle },
      // { href: '/admin/products/media', label: 'Product Media', icon: ImageIcon }, // Hidden for now: to be converted to Banners & Promotional Media
      { href: '/admin/products', label: 'Product List', icon: PackageSearch, exact: true },
      { href: '/admin/products/reviews', label: 'Product Reviews', icon: MessageSquareText },
    ],
  },
  // {
  //   label: 'Administration',
  //   items: [
  //     { href: '/admin/adminrole', label: 'Admin Role', icon: ShieldCheck },
  //     { href: '/admin/settings', label: 'Settings', icon: Settings },
  //   ],
  // },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const logout = useLogout()
  const user = useAuthStore((state) => state.user)

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A'
  const userDisplayName = user?.name || 'Administrator'
  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Super Admin'

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-gray-200/80 shadow-[1px_0_12px_rgba(0,0,0,0.02)] select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="flex h-11 w-32 items-center justify-start overflow-hidden transition-transform duration-200 group-hover:scale-[1.02]">
            <Image
              src="/ObriveLogo.png"
              alt="Obrive Logo"
              width={140}
              height={40}
              className="h-auto w-auto max-h-9 max-w-full object-contain"
              priority
            />
          </div>
        </Link>
        {/* <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.625rem] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          LIVE
        </span> */}
      </div>

      {/* Navigation Groups - scrollable with slim custom scrollbar */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3 pb-1 flex items-center justify-between">
              <p
                className={`text-xs font-bold text-gray-500 uppercase tracking-wider ${microgrammaBold.className}`}
              >
                {group.label}
              </p>
            </div>

            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={false}
                    onClick={onNavigate}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                      ? 'text-white shadow-sm shadow-[#074139]/20'
                      : 'text-gray-700 hover:text-[#074139] hover:bg-[#074139]/5'
                      }`}
                    style={active ? { background: 'linear-gradient(135deg, #074139 0%, #0d5349 100%)' } : {}}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#59D0B5]' : 'text-gray-500 group-hover:text-[#074139]'
                        }`}
                    />
                    <span className="flex-1 truncate tracking-tight">{label}</span>

                    {/* {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#59D0B5] shadow-[0_0_8px_#59D0B5]" />
                    )} */}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Mini Profile & Logout Area */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/70 shrink-0 space-y-2">
        <Link
          href="/admin/adminrole"
          onClick={onNavigate}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-gray-200/60 transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#074139] to-[#1A817F] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ring-2 ring-emerald-100">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#074139] transition-colors">
              {userDisplayName}
            </p>
            <p className="text-xs text-gray-500 font-medium truncate">{userRole}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
        </Link>

        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50/80 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
