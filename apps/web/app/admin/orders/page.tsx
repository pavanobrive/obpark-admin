'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Plus,
  MoreVertical,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import { Header } from '@/components/admin/layout/Header'

interface AdminOrder {
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
  items: { productName: string; quantity: number }[]
  payment?: { status: string } | null
  paymentStatus?: string
}

function formatDeliveryAddress(raw: any): string {
  if (!raw) return '—'
  let addr = raw
  if (typeof raw === 'string') {
    try {
      addr = JSON.parse(raw)
    } catch {
      return raw
    }
  }
  const parts = [
    addr.streetAddress || addr.addressLine1 || addr.line1 || addr.address,
    addr.city,
    addr.state,
    addr.zipCode || addr.postalCode || addr.pincode,
  ].filter(Boolean)
  return parts.join(', ') || 'Address not specified'
}

const TABS = ['All order', 'Completed', 'Pending', 'Canceled']

const STATUS_TO_TAB: Record<string, string> = {
  DELIVERED: 'Completed',
  CONFIRMED: 'Completed',
  PROCESSING: 'Completed',
  SHIPPED: 'Completed',
  PENDING: 'Pending',
  CANCELLED: 'Canceled',
  REFUNDED: 'Canceled',
}

const STATUS_OPTIONS = [
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING', label: 'Pending' },
]

const STATUS_BADGE_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100',
  DELIVERED: 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100',
  REFUNDED: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
}

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('All order')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const limit = 10

  const { data: dash } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<{ totalOrders: number; pendingOrders: number }>('/admin/dashboard'),
  })

  const { data: counts } = useQuery({
    queryKey: ['admin', 'orders', 'counts'],
    queryFn: () => api.get<{ newOrders: number; completed: number; canceled: number }>('/admin/orders/counts'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () =>
      api.get<{ orders: AdminOrder[]; total: number }>(
        `/admin/orders?limit=${limit}&offset=${(page - 1) * limit}`,
      ),
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      setUpdatingOrderId(orderId)
      return api.patch(`/admin/orders/${orderId}/status`, { status })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', 'counts'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      setToast({
        type: 'success',
        message: `Order #${variables.orderId.slice(-6).toUpperCase()} status updated to ${variables.status}`,
      })
      setTimeout(() => setToast(null), 4000)
    },
    onError: (err: any) => {
      setToast({
        type: 'error',
        message: err?.message || 'Failed to update order status',
      })
      setTimeout(() => setToast(null), 5000)
    },
    onSettled: () => {
      setUpdatingOrderId(null)
    },
  })

  const filteredOrders = (data?.orders ?? []).filter((o) => {
    const matchesTab = activeTab === 'All order' ? true : STATUS_TO_TAB[o.status] === activeTab
    if (!matchesTab) return false

    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const idMatch = o.id.toLowerCase().includes(q)
    const orderNumMatch = o.orderNumber?.toLowerCase().includes(q)
    const productMatch = o.items?.some((i) => i.productName?.toLowerCase().includes(q))
    const customerMatch =
      o.customerName?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q)
    return idMatch || orderNumMatch || productMatch || customerMatch
  })

  const totalPages = Math.ceil((data?.total ?? 0) / limit)

  const kpis = [
    { label: 'Total Orders', value: dash?.totalOrders ?? '—' },
    { label: 'New Orders', value: counts?.newOrders ?? '—' },
    { label: 'Completed Orders', value: counts?.completed ?? '—' },
    { label: 'Canceled Orders', value: counts?.canceled ?? '—' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Order Management" onMenuClick={() => setDrawerOpen(true)} />

      {/* Floating Status Notification Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
              : 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className={`${microgrammaBold.className} font-semibold text-[22px] text-gray-800`}>
            Order List
          </h2>
          <div className="flex gap-2">
            <button
              className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] text-white font-medium`}
              style={{ backgroundColor: '#074139' }}
            >
              <Plus className="h-4 w-4" /> Add Order
            </button>
            <button
              className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] border font-medium text-gray-600 bg-white`}
            >
              More Action <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <p className={`${microgrammaBold.className} text-[18px] font-semibold text-gray-700`}>
                  {k.label}
                </p>
                <MoreVertical className="h-4 w-4 text-gray-300" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-800">{k.value}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
            </div>
          ))}
        </div>

        {/* Filter tabs + search row */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex bg-gray-50 rounded-lg p-1 text-sm overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setPage(1)
                  }}
                  className={`px-4 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab ? 'bg-white shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={activeTab === tab ? { color: '#074139' } : {}}
                >
                  {tab === 'All order' ? `All order (${data?.total ?? 0})` : tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order ID, item, buyer"
                  className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-48 sm:w-60 focus:bg-white focus:border-[#074139] transition-all"
                />
              </div>
              <button className="p-2 rounded-lg border text-gray-500 hover:bg-gray-50">
                <Filter className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg border text-gray-500 hover:bg-gray-50">
                <ArrowUpDown className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg border text-gray-500 hover:bg-gray-50">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-600 bg-green-50/70 border-b">
                  <th className="px-3 py-2.5 font-medium rounded-l-lg w-10">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-3 py-2.5 font-medium">No</th>
                  <th className="px-3 py-2.5 font-medium">Order Number</th>
                  <th className="px-3 py-2.5 font-medium">Customer / Product</th>
                  <th className="px-3 py-2.5 font-medium">Delivery Address</th>
                  <th className="px-3 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 font-medium">Price</th>
                  <th className="px-3 py-2.5 font-medium">Payment</th>
                  <th className="px-3 py-2.5 font-medium rounded-r-lg">Status (Update)</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={9} className="py-3">
                        <div className="h-9 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : !filteredOrders.length ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                      No orders found matching the filter criteria
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, i) => {
                    const isPaid =
                      order.payment?.status === 'SUCCESS' ||
                      order.paymentStatus === 'SUCCESS' ||
                      ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)

                    return (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/60 transition-colors">
                        <td className="px-3 py-3">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-3 py-3 text-gray-500 text-xs">
                          {(page - 1) * limit + i + 1}
                        </td>
                        <td className="px-3 py-3 text-gray-800 font-mono font-bold text-xs whitespace-nowrap">
                          {order.orderNumber || `#${order.id.slice(-6).toUpperCase()}`}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                              PKG
                            </div>
                            <div>
                              <p className="text-gray-800 font-medium text-xs">
                                {order.items?.[0]?.productName ?? 'Standard Package'}
                                {order.items?.length > 1 ? (
                                  <span className="text-xs text-gray-400 font-normal">
                                    {` +${order.items.length - 1} more`}
                                  </span>
                                ) : (
                                  ''
                                )}
                              </p>
                              {order.customerName && (
                                <p className="text-[10px] text-gray-400">{order.customerName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600 max-w-[200px]" title={formatDeliveryAddress(order.shippingAddress)}>
                          <p className="line-clamp-2 leading-snug">
                            {formatDeliveryAddress(order.shippingAddress)}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-3 py-3 text-gray-800 font-bold text-xs whitespace-nowrap">
                          ₹{Number(order.total || order.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isPaid ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'
                              }`}
                            />
                            <span className={isPaid ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-medium'}>
                              {isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="relative inline-flex items-center">
                            {updatingOrderId === order.id ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200 animate-pulse">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#074139]" />
                                Updating...
                              </span>
                            ) : (
                              <div className="relative inline-block group">
                                <select
                                  value={order.status}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value
                                    if (nextStatus !== order.status) {
                                      updateStatusMutation.mutate({
                                        orderId: order.id,
                                        status: nextStatus,
                                      })
                                    }
                                  }}
                                  disabled={updatingOrderId !== null}
                                  className={`appearance-none cursor-pointer text-xs font-bold px-3 py-1.5 pr-7 rounded-full border shadow-xs transition-all outline-none focus:ring-2 focus:ring-[#074139]/30 disabled:opacity-50 ${
                                    STATUS_BADGE_STYLE[order.status] ??
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}
                                  title="Click to update order status"
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option
                                      key={opt.value}
                                      value={opt.value}
                                      className="bg-white text-gray-800 py-1 font-medium"
                                    >
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`${microgrammaBold.className} text-[14px] font-bold text-[#074139] bg-white border border-gray-200 rounded-[6px] shadow-xs px-4 py-2 leading-none hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              ← Previous
            </button>
            <div className="flex gap-1 flex-wrap">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === i + 1
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                  }`}
                  style={page === i + 1 ? { backgroundColor: '#074139' } : {}}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || totalPages === 0}
              className={`${microgrammaBold.className} text-[14px] font-bold text-[#074139] bg-white border border-gray-200 rounded-[6px] shadow-xs px-4 py-2 leading-none hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
