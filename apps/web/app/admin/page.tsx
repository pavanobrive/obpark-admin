'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { MoreVertical, Search, ChevronRight, Plus, Filter } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { microgrammaBold } from '@/lib/fonts'
import { useCategories } from '@/hooks/useCategories'
import { Header } from '@/components/admin/layout/Header'
import Link from 'next/link'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  canceledOrders: number
  totalUsers: number
  totalProducts: number
  stockProducts: number
  outOfStockProducts: number
  recentOrders: { id: string; total: number; status: string; createdAt: string }[]
  salesByState: { state: string; total: number }[]
  bestSelling: { id: string; name: string; orders: number; inStock: boolean; price: number }[]
}

function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<DashboardStats>('/admin/dashboard'),
  })
}

function useRevenueTrend() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'revenue-trend'],
    queryFn: () => api.get<{ day: string; value: number }[]>('/admin/analytics/revenue-trend'),
  })
}

const QUICK_PRODUCTS = [
  { name: 'Air Filter', price: '₹399.00' },
  { name: 'Wiper Blade Set', price: '₹549.00' },
  { name: 'Spark Plug (Set of 4)', price: '₹699.00' },
]

const STATIC_BARS = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]

export default function DashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: stats, isLoading } = useDashboardStats()
  const { data: revenueTrend, isLoading: trendLoading } = useRevenueTrend()
  const { data: categories = [] } = useCategories()

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin', 'products', 'top'],
    queryFn: () => api.get<{ products: any[] }>('/admin/products?limit=4'),
  })

  const chartData = revenueTrend ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" onMenuClick={() => setDrawerOpen(true)} />

      <div className="p-6 space-y-6">

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className={`${microgrammaBold.className} text-[18px] font-semibold text-gray-700`}>Total Sales</p>
                <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
              </div>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-800">
                ₹{isLoading ? '—' : (stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</button>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className={`${microgrammaBold.className} text-[18px] font-semibold text-gray-700`}>Total Orders</p>
                <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
              </div>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-800">
                {isLoading ? '—' : (stats?.totalOrders ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</button>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className={`${microgrammaBold.className} text-[18px] font-semibold text-gray-700`}>Pending & Canceled</p>
                <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
              </div>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className={`${microgrammaBold.className} text-xs text-gray-400`}>Pending</p>
                <p className="text-xl font-bold text-gray-800">{isLoading ? '—' : stats?.pendingOrders ?? 0}</p>
              </div>
              <div className="border-l pl-4">
                <p className={`${microgrammaBold.className} text-xs text-gray-400`}>Canceled</p>
                <p className="text-xl font-bold text-red-500">{isLoading ? '—' : stats?.canceledOrders ?? 0}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</button>
            </div>
          </div>
        </div>

        {/* Middle Row: Chart + Live Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">

          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Report for this week</h2>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 text-xs">
                  <button className={'' + microgrammaBold.className + ' px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200'}>This week</button>
                </div>
                <MoreVertical className="h-4 w-4 text-gray-300" />
              </div>
            </div>

            <div className="flex gap-6 mb-4 border-b pb-4 overflow-x-auto">
              {[
                { value: isLoading ? '—' : (stats?.totalUsers ?? 0).toLocaleString(), label: 'Customers' },
                { value: isLoading ? '—' : (stats?.totalProducts ?? 0).toLocaleString(), label: 'Total Products' },
                { value: isLoading ? '—' : (stats?.stockProducts ?? 0).toLocaleString(), label: 'Stock Products' },
                { value: isLoading ? '—' : (stats?.outOfStockProducts ?? 0).toLocaleString(), label: 'Out of Stock' },
                { value: isLoading ? '—' : `₹${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}k`, label: 'Revenue' },
              ].map((s, i) => (
                <div key={i} className={`shrink-0 ${i === 0 ? 'border-b-2 border-green-500 pb-1' : ''}`}>
                  <p className="text-[16px] font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A2F1DF" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#A2F1DF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            {!trendLoading && chartData.every((d) => d.value === 0) && (
              <p className="text-xs text-gray-400 text-center mt-2">No paid orders in the last 7 days yet</p>
            )}
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-start justify-between">
              <p className="text-xs text-purple-600 font-medium">Live user tracking</p>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <p className="text-3xl font-bold text-gray-300 mt-1">—</p>
            <p className="text-xs text-gray-400 mt-3 mb-2">Not enabled yet</p>

            <div className="flex items-end gap-0.5 h-12 mb-4">
              {STATIC_BARS.map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-gray-200" style={{ height: `${h * 10}%` }} />
              ))}
            </div>

            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700">Sales by State</p>
              <p className="text-xs font-semibold text-gray-700">Sales</p>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <p className="text-xs text-gray-400">Loading...</p>
              ) : stats?.salesByState && stats.salesByState.length > 0 ? (
                stats.salesByState.map((s) => {
                  const max = stats.salesByState[0].total || 1
                  const widthPct = Math.max(10, Math.round((s.total / max) * 100))
                  return (
                    <div key={s.state} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        {s.state.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">₹{s.total.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-gray-400">{s.state}</p>
                        <div className="h-1 bg-blue-500 rounded mt-1" style={{ width: `${widthPct}%` }} />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-gray-400">No state-wise sales yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Transaction + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Transaction</h2>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium" style={{ backgroundColor: '#074139' }}>
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b">
                  <th className="pb-2 font-normal">No</th>
                  <th className="pb-2 font-normal">Order ID</th>
                  <th className="pb-2 font-normal">Order Date</th>
                  <th className="pb-2 font-normal">Status</th>
                  <th className="pb-2 font-normal text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="py-2"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : stats?.recentOrders?.length ? (
                  stats.recentOrders.map((order, i) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 text-gray-500">{i + 1}.</td>
                      <td className="py-3 text-gray-700">#{order.id.slice(-4)}</td>
                      <td className="py-3 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} | {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3">
                        <span className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${order.status === 'CONFIRMED' || order.status === 'DELIVERED' ? 'bg-green-500' : order.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          <span className="text-xs">{order.status}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">₹{Number(order.total).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400">No orders yet</td></tr>
                )}
              </tbody>
            </table>
            </div>

            <div className="flex justify-end mt-4">
              <button className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</button>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Top Products</h2>
              <span className="text-xs text-blue-500 cursor-pointer">All product</span>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input placeholder="Search" className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none" />
            </div>
            <div className="space-y-3">
              {productsLoading ? (
                [...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)
              ) : productsData?.products?.length ? (
                productsData.products.slice(0, 4).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400">Item: #{p.sku}</p>
                    </div>
                    <p className="text-xs font-bold">₹{Number(p.basePrice).toLocaleString('en-IN')}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">No products yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Last Row: Best Selling + Add New Product */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Best selling product</h2>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium" style={{ backgroundColor: '#074139' }}>
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 bg-green-50 rounded-lg">
                  <th className="px-3 py-2 font-medium rounded-l-lg">PRODUCT</th>
                  <th className="px-3 py-2 font-medium">TOTAL ORDER</th>
                  <th className="px-3 py-2 font-medium">STATUS</th>
                  <th className="px-3 py-2 font-medium rounded-r-lg">PRICE</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-400">Loading...</td></tr>
                ) : stats?.bestSelling?.length ? (
                  stats.bestSelling.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                          <span className="text-xs font-medium text-gray-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">{p.orders}</td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1.5 text-xs">
                          <span className={`h-1.5 w-1.5 rounded-full ${p.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={p.inStock ? 'text-green-600' : 'text-red-500'}>{p.inStock ? 'Stock' : 'Stock out'}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs font-bold text-gray-800">₹{p.price.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-400">No products yet</td></tr>
                )}
              </tbody>
            </table>
            </div>

            <div className="flex justify-end mt-4">
              <button className="text-xs px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">Details</button>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Add New Product</h2>
              <button className="text-xs text-blue-500 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add New
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Categories</p>
            <div className="space-y-2 mb-4">
              {categories.slice(0, 3).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gray-100" />
                    <span className="text-xs font-medium">{cat.name}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </div>
              ))}
              {categories.length === 0 && <p className="text-xs text-gray-400">No categories yet</p>}
            </div>
            <Link href="/admin/categories" className="text-xs text-blue-500 w-full text-center mb-4 block">See more</Link>

            <p className="text-xs text-gray-400 mb-3">Product</p>
            <div className="space-y-3">
              {QUICK_PRODUCTS.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-green-600">{p.price}</p>
                  </div>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-white font-medium" style={{ backgroundColor: '#074139' }}>
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              ))}
            </div>
             <Link href="/admin/products" className="text-xs text-blue-500 w-full text-center mt-3 block">See more</Link>
          </div>
        </div>

      </div>
    </div>
  )
}