'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { MoreVertical, Search, ChevronRight, Plus, Bell, Sun, Filter } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { microgrammaBold } from '@/lib/fonts'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalUsers: number
  recentOrders: any[]
}

function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<DashboardStats>('/admin/dashboard'),
  })
}

const WEEKLY_REPORT = [
  { day: 'Sun', value: 16000 }, { day: 'Mon', value: 27000 }, { day: 'Tue', value: 27000 },
  { day: 'Wed', value: 14000 }, { day: 'Thu', value: 22000 }, { day: 'Fri', value: 30000 }, { day: 'Sat', value: 30000 },
]

const TRANSACTIONS = [
  { no: 1, id: '#6545', date: '01 Oct | 11:29 am', status: 'Paid', amount: '₹649' },
  { no: 2, id: '#5412', date: '01 Oct | 11:29 am', status: 'Pending', amount: '₹5,570' },
  { no: 3, id: '#6622', date: '01 Oct | 11:29 am', status: 'Paid', amount: '₹1,560' },
  { no: 4, id: '#6462', date: '01 Oct | 11:29 am', status: 'Paid', amount: '₹2,650' },
  { no: 5, id: '#6462', date: '01 Oct | 11:29 am', status: 'Paid', amount: '₹2,650' },
]

const BEST_SELLING = [
  { name: 'Engine Oil Filter', orders: 104, status: 'Stock', price: '₹349.00' },
  { name: 'Brake Pad Set', orders: 56, status: 'Stock out', price: '₹899.00' },
  { name: 'Car Battery 12V', orders: 266, status: 'Stock', price: '₹4,999.00' },
  { name: 'LED Headlight Bulb', orders: 506, status: 'Stock', price: '₹799.00' },
]

const COUNTRIES = [
  { flag: 'TS', name: 'Telangana', value: '30k', change: '25.8%', up: true },
  { flag: 'MH', name: 'Maharashtra', value: '30k', change: '15.8%', up: false },
  { flag: 'KA', name: 'Karnataka', value: '25k', change: '35.8%', up: true },
]

const CATEGORIES = [
  { name: 'Engine Parts' },
  { name: 'Brakes & Suspension' },
  { name: 'Electrical' },
]

const QUICK_PRODUCTS = [
  { name: 'Air Filter', price: '₹399.00' },
  { name: 'Wiper Blade Set', price: '₹549.00' },
  { name: 'Spark Plug (Set of 4)', price: '₹699.00' },
]

const BAR_DATA = [3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 7, 9, 8, 10, 9, 8, 7, 8, 9, 10, 8, 7, 6, 8, 9, 7, 8]

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin', 'products', 'top'],
    queryFn: () => api.get<{ products: any[] }>('/admin/products?limit=4'),
  })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className={`${microgrammaBold.className} text-[24px] font-bold text-gray-800`}>Dashboard</h1>
        <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search data, users, or reports"
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center">
            <Search className="h-4 w-4 text-gray-500" />
          </button>
          <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center">
            <Bell className="h-4 w-4 text-gray-500" />
          </button>
          <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center">
            <Sun className="h-4 w-4 text-gray-500" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gray-300" />
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Total Sales */}
          <div className="bg-white border rounded-xl p-5">
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
              <span className="text-xs text-green-500 font-medium">Sales ↑ 10.4%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Previous 7days <span className="text-blue-500">(₹235)</span></p>
            <div className="mt-4 flex justify-end">
              <button className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</button>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white border rounded-xl p-5">
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
              <span className="text-xs text-green-500 font-medium">order ↑ 14.4%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Previous 7days <span className="text-blue-500">(7.6k)</span></p>
            <div className="mt-4 flex justify-end">
              <button className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</button>
            </div>
          </div>

          {/* Pending & Cancelled */}
          <div className="bg-white border rounded-xl p-5">
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
                <p className="text-xs text-gray-400">user 204</p>
              </div>
              <div className="border-l pl-4">
                <p className={`${microgrammaBold.className} text-xs text-gray-400`}>Canceled</p>
                <p className="text-xl font-bold text-red-500">94</p>
                <p className="text-xs text-red-400">↓ 14.4%</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</button>
            </div>
          </div>
        </div>

        {/* Middle Row: Chart + Live Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Weekly Report Chart */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Report for this week</h2>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 text-xs">
                  <button className={'' + microgrammaBold.className + ' px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200'}>This week</button>
                  <button className={'' + microgrammaBold.className + ' px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-50 border border-gray-200'}>Last week</button>
                </div>
                <MoreVertical className="h-4 w-4 text-gray-300" />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 mb-4 border-b pb-4">
              {[
                { value: '52k', label: 'Customers' },
                { value: '3.5k', label: 'Total Products' },
                { value: '2.5k', label: 'Stock Products' },
                { value: '0.5k', label: 'Out of Stock' },
                { value: '₹' + ((stats?.totalRevenue ?? 250000) / 1000).toFixed(0) + 'k', label: 'Revenue' },
              ].map((s, i) => (
                <div key={i} className={`${i === 0 ? 'border-b-2 border-green-500 pb-1' : ''}`}>
                  <p className="text-[16px] font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={WEEKLY_REPORT}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A2F1DF" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#A2F1DF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} tickFormatter={(v) => `${v / 1000}0k`} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Live Users + Sales by State */}
          <div className="bg-white border rounded-xl p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs text-purple-600 font-medium">Users in last 30 minutes</p>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-1">21.5K</p>
            <p className="text-xs text-gray-400 mt-3 mb-2">Users per minute</p>

            {/* Bar chart placeholder */}
            <div className="flex items-end gap-0.5 h-12 mb-4">
              {BAR_DATA.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ height: `${h * 10}%`, backgroundColor: '#22c55e', opacity: 0.7 + (i % 3) * 0.1 }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700">Sales by State</p>
              <p className="text-xs font-semibold text-gray-700">Sales</p>
            </div>

            <div className="space-y-3">
              {COUNTRIES.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">{c.flag}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">{c.value}</p>
                    <p className="text-[10px] text-gray-400">{c.name}</p>
                    <div className="h-1 bg-blue-500 rounded mt-1" style={{ width: '60%' }} />
                  </div>
                  <span className={`text-xs font-medium ${c.up ? 'text-green-500' : 'text-red-500'}`}>
                    {c.up ? '↑' : '↓'} {c.change}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2 rounded-full border border-blue-200 text-xs text-blue-500 hover:bg-gray-50">
              View Insight
            </button>
          </div>
        </div>

        {/* Bottom Row: Transaction + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Transaction Table */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6">
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
                  <th className="pb-2 font-normal">Id Customer</th>
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
                        <td key={j} className="py-2">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : stats?.recentOrders?.length ? (
                  stats.recentOrders.map((order: any, i: number) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 text-gray-500">{i + 1}.</td>
                      <td className="py-3 text-gray-700">#{order.id.slice(-4)}</td>
                      <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} | {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
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
                  TRANSACTIONS.map((t) => (
                    <tr key={t.no} className="border-b last:border-0">
                      <td className="py-3 text-gray-500">{t.no}.</td>
                      <td className="py-3 text-gray-700">{t.id}</td>
                      <td className="py-3 text-gray-500">{t.date}</td>
                      <td className="py-3">
                        <span className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${t.status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span className="text-xs">{t.status}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">{t.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>

            <div className="flex justify-end mt-4">
              <button className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</button>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white border rounded-xl p-5">
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
                ['Engine Oil Filter', 'Brake Pad Set', 'Car Battery 12V', 'LED Headlight Bulb'].map((name, i) => (
                  <div key={i} className="flex items-center gap-3 border-b pb-3 last:border-0">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{name}</p>
                      <p className="text-[10px] text-gray-400">Item: #FXZ-4567</p>
                    </div>
                    <p className="text-xs font-bold">₹{[349, 899, 4999, 799][i]}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Last Row: Best Selling + Add New Product */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Best Selling Product */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6">
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
                {BEST_SELLING.map((p, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                        <span className="text-xs font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{p.orders}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'Stock' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={p.status === 'Stock' ? 'text-green-600' : 'text-red-500'}>{p.status}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-gray-800">{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="flex justify-end mt-4">
              <button className="text-xs px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">Details</button>
            </div>
          </div>

          {/* Add New Product */}
          <div className="bg-white border rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Add New Product</h2>
              <button className="text-xs text-blue-500 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add New
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Categories</p>
            <div className="space-y-2 mb-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gray-100" />
                    <span className="text-xs font-medium">{cat.name}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </div>
              ))}
            </div>
            <button className="text-xs text-blue-500 w-full text-center mb-4">See more</button>

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
            <button className="text-xs text-blue-500 w-full text-center mt-3">See more</button>
          </div>
        </div>

      </div>
    </div>
  )
}