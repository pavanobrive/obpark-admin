// apps/web/app/admin/analytics/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Header } from '@/components/admin/layout/Header'
import { microgrammaBold } from '@/lib/fonts'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, ShoppingBag, Ticket, CreditCard, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalUsers: number
  recentOrders: any[]
}

interface Coupon {
  id: string
  isActive: boolean
  usedCount: number
  expiresAt?: string
}

const WEEKLY_REPORT = [
  { day: 'Sun', value: 16000 }, { day: 'Mon', value: 27000 }, { day: 'Tue', value: 27000 },
  { day: 'Wed', value: 14000 }, { day: 'Thu', value: 22000 }, { day: 'Fri', value: 30000 }, { day: 'Sat', value: 30000 },
]

// TODO: replace with real status breakdown once GET /admin/orders returns aggregated counts per status
const ORDER_STATUS_BREAKDOWN = [
  { name: 'Delivered', value: 62, color: '#22c55e' },
  { name: 'Pending', value: 18, color: '#f59e0b' },
  { name: 'Processing', value: 12, color: '#3b82f6' },
  { name: 'Cancelled', value: 8, color: '#ef4444' },
]

export default function AnalyticsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Real — same endpoint Dashboard uses
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<DashboardStats>('/admin/dashboard'),
  })

  // Real — same endpoint Products page uses
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin', 'products', 'top'],
    queryFn: () => api.get<{ products: any[] }>('/admin/products?limit=5'),
  })

  // Real — same endpoint Coupons page uses
  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => api.get<Coupon[]>('/coupons'),
  })

  const activeCoupons = coupons?.filter((c) => c.isActive && (!c.expiresAt || new Date(c.expiresAt) > new Date())).length ?? 0
  const totalRedemptions = coupons?.reduce((sum, c) => sum + c.usedCount, 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
  title="Analytics"
  onMenuClick={() => setDrawerOpen(true)}
/>

      <div className="p-6 space-y-6">
        

        {/* Top-level KPI rollup — real data, same source as Dashboard/Coupons pages */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`, icon: TrendingUp, bg: 'bg-green-50', color: 'text-green-600', loading: statsLoading },
            { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, bg: 'bg-blue-50', color: 'text-blue-600', loading: statsLoading },
            { label: 'Active Coupons', value: activeCoupons, icon: Ticket, bg: 'bg-purple-50', color: 'text-purple-600', loading: couponsLoading },
            { label: 'Coupon Redemptions', value: totalRedemptions, icon: CreditCard, bg: 'bg-amber-50', color: 'text-amber-600', loading: couponsLoading },
          ].map((k) => (
            <div key={k.label} className="bg-white border rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{k.loading ? '—' : k.value}</p>
              <p className={`${microgrammaBold.className} text-[16px] text-[#074891]-500 mt-1`}>{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue trend — placeholder chart, same as Dashboard's until day-by-day endpoint exists */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Revenue Trend</h2>
              <Link href="/admin/orders" className="text-xs text-blue-500 flex items-center gap-1">
                View Orders <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={WEEKLY_REPORT}>
                <defs>
                  <linearGradient id="analyticsRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A2F1DF" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#A2F1DF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#analyticsRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order status breakdown — placeholder until aggregated counts exist */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className={`${microgrammaBold.className} font-semibold text-[16px] text-gray-800`}>Order Status</h2>
              <Link href="/admin/orders" className="text-xs text-blue-500 flex items-center gap-1">
                View <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={ORDER_STATUS_BREAKDOWN} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={2}>
                  {ORDER_STATUS_BREAKDOWN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ORDER_STATUS_BREAKDOWN.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-600">{s.name} ({s.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: Top products (real) + Coupon performance (real) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Top Products</h2>
              <Link href="/admin/products" className="text-xs text-blue-500 flex items-center gap-1">
                View Products <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {productsLoading ? (
                [...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)
              ) : !productsData?.products?.length ? (
                <p className="text-sm text-gray-400 text-center py-6">No products yet</p>
              ) : (
                productsData.products.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                    </div>
                    <p className="text-sm font-bold">₹{Number(p.basePrice).toLocaleString('en-IN')}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Coupon Performance</h2>
              <Link href="/admin/coupons" className="text-xs text-blue-500 flex items-center gap-1">
                View Coupons <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {couponsLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : !coupons?.length ? (
              <p className="text-sm text-gray-400 text-center py-6">No coupons created yet</p>
            ) : (
              <div className="space-y-3">
                {coupons.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-mono font-bold text-gray-800">{c.code}</p>
                      <p className="text-xs text-gray-400">{c.usedCount} redemption{c.usedCount !== 1 ? 's' : ''}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}