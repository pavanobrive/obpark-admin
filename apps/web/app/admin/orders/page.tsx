'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Plus, MoreVertical, Search, Filter, ArrowUpDown, MoreHorizontal, FileText, Trash2 } from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import { Header } from '@/components/admin/layout/Header'

interface AdminOrder {
  id: string
  status: string
  total: number
  createdAt: string
  user: { name: string; email: string }
  items: { productName: string; quantity: number }[]
  payment: { status: string } | null
}

const TABS = ['All order', 'Completed', 'Pending', 'Canceled']
const STATUS_TO_TAB: Record<string, string> = {
  DELIVERED: 'Completed', CONFIRMED: 'Completed', PROCESSING: 'Completed', SHIPPED: 'Completed',
  PENDING: 'Pending',
  CANCELLED: 'Canceled', REFUNDED: 'Canceled',
}
const STATUS_STYLE: Record<string, string> = {
  DELIVERED: 'text-green-600', CONFIRMED: 'text-green-600', PROCESSING: 'text-blue-600', SHIPPED: 'text-gray-600',
  PENDING: 'text-amber-600', CANCELLED: 'text-red-600', REFUNDED: 'text-gray-500',
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('All order')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 10

  const { data: dash } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<{ totalOrders: number; pendingOrders: number }>('/admin/dashboard'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () => api.get<{ orders: AdminOrder[]; total: number }>(`/admin/orders?limit=${limit}&offset=${(page - 1) * limit}`),
  })

  const filteredOrders = data?.orders?.filter((o) =>
    activeTab === 'All order' ? true : STATUS_TO_TAB[o.status] === activeTab
  ) ?? []

  const totalPages = Math.ceil((data?.total ?? 0) / limit)

  // TODO: needs dedicated backend counts — currently only total + pending exist
  const kpis = [
    { label: 'Total Orders', value: dash?.totalOrders ?? '—', trend: '↑ 14.4%', up: true },
    { label: 'New Orders', value: '—', trend: 'needs backend', up: null },
    { label: 'Completed Orders', value: '—', trend: 'needs backend', up: null },
    { label: 'Canceled Orders', value: '—', trend: 'needs backend', up: null },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
  title="Order Management"
  onMenuClick={() => setDrawerOpen(true)}
/>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className={`${microgrammaBold.className} font-semibold text-[22px] text-gray-800`}>Order List</h2>
          <div className="flex gap-2">
            <button className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] text-white font-medium`} style={{ backgroundColor: '#074139' }}>
              <Plus className="h-4 w-4" /> Add Order
            </button>
            <button className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] border font-medium text-gray-600`}>
              More Action <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ">
          {kpis.map((k) => (
            <div key={k.label} className="bg-white border rounded-xl p-5 shadow-md">
              <div className="flex items-start justify-between">
                <p className={`${microgrammaBold.className} text-[18px] font-semibold text-gray-700`}>{k.label}</p>
                <MoreVertical className="h-4 w-4 text-gray-300" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-800">{k.value}</p>
                <span className={`text-xs font-medium ${k.up ? 'text-green-500' : 'text-gray-400'}`}>{k.trend}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
            </div>
          ))}
        </div>

        {/* Filter tabs + search row */}
        <div className="bg-white border rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex bg-gray-50 rounded-lg p-1 text-sm overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                  style={activeTab === tab ? { color: '#074139' } : {}}
                >
                  {tab === 'All order' ? `All order (${data?.total ?? 0})` : tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input placeholder="Search order report" className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-48" />
              </div>
              <button className="p-2 rounded-lg border text-gray-500"><Filter className="h-4 w-4" /></button>
              <button className="p-2 rounded-lg border text-gray-500"><ArrowUpDown className="h-4 w-4" /></button>
              <button className="p-2 rounded-lg border text-gray-500"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-600 bg-green-50">
                <th className="px-3 py-2.5 font-medium rounded-l-lg w-10"><input type="checkbox" /></th>
                <th className="px-3 py-2.5 font-medium">No</th>
                <th className="px-3 py-2.5 font-medium">Order Id</th>
                <th className="px-3 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 font-medium">Date</th>
                <th className="px-3 py-2.5 font-medium">Price</th>
                <th className="px-3 py-2.5 font-medium">Payment</th>
                <th className="px-3 py-2.5 font-medium rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : !filteredOrders.length ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">No orders found</td></tr>
              ) : (
                filteredOrders.map((order, i) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-3 py-3"><input type="checkbox" /></td>
                    <td className="px-3 py-3 text-gray-500">{(page - 1) * limit + i + 1}</td>
                    <td className="px-3 py-3 text-gray-700 font-medium">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                        <span className="text-gray-700">
                          {order.items?.[0]?.productName ?? 'Item'}
                          {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3 text-gray-700 font-medium">₹{Number(order.total).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${order.payment?.status === 'CAPTURED' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={order.payment?.status === 'CAPTURED' ? 'text-green-600' : 'text-red-500'}>
                          {order.payment?.status === 'CAPTURED' ? 'Paid' : 'Unpaid'}
                        </span>
                      </span>
                    </td>
                    <td className={`px-3 py-3 font-medium ${STATUS_STYLE[order.status] ?? 'text-gray-600'}`}>
                      {order.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`${microgrammaBold.className} text-[16px] font-bold text-[#074139] bg-white rounded-[5px] shadow-sm px-4 py-2 leading-none`}
            >
              ← Previous
            </button>
            <div className="flex gap-1 flex-wrap">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  style={page === i + 1 ? { backgroundColor: '#074139' } : {}}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`${microgrammaBold.className} text-[16px] font-bold text-[#074139] bg-white rounded-[5px] shadow-sm px-4 py-2 leading-none`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}