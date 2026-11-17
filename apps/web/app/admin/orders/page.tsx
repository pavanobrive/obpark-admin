'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
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
  Download,
  BarChart3,
  Table as TableIcon,
} from 'lucide-react'
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  GridReadyEvent,
} from 'ag-grid-community'
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react'
import { microgrammaBold } from '@/lib/fonts'
import { Header } from '@/components/admin/layout/Header'
import { OrderOverview } from '@/components/admin/orders/OrderOverview'

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule])

// Custom AG Grid theme matching OBPARK branding
const obparkGridTheme = themeQuartz.withParams({
  accentColor: '#074139',
  headerBackgroundColor: '#F0FDF4',
  headerTextColor: '#374151',
  headerFontWeight: 600,
  headerFontSize: 11.5,
  fontSize: 11.5,
  borderColor: '#E5E7EB',
  borderRadius: 12,
  browserColorScheme: 'light',
  rowHoverColor: '#F9FAFB',
  selectedRowBackgroundColor: '#ECFDF5',
  rowHeight: 52,
  headerHeight: 36,
})

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
  const [mainTab, setMainTab] = useState<'overview' | 'table'>('overview')
  const [activeTab, setActiveTab] = useState('All order')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFloatingFilters, setShowFloatingFilters] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const gridRef = useRef<AgGridReact<AdminOrder>>(null)

  const handleSwitchToTable = (statusFilter?: string) => {
    setMainTab('table')
    if (statusFilter) {
      const mappedTab = STATUS_TO_TAB[statusFilter] || (TABS.includes(statusFilter) ? statusFilter : 'All order')
      setActiveTab(mappedTab)
    }
  }

  const { data: dash } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<{ totalOrders: number; pendingOrders: number }>('/admin/dashboard'),
  })

  const { data: counts } = useQuery({
    queryKey: ['admin', 'orders', 'counts'],
    queryFn: () => api.get<{ newOrders: number; completed: number; canceled: number }>('/admin/orders/counts'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () =>
      api.get<{ orders: AdminOrder[]; total: number }>(
        `/admin/orders?limit=1000`,
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

  const filteredOrders = useMemo(() => {
    return (data?.orders ?? []).filter((o) => {
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
  }, [data?.orders, activeTab, searchQuery])

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `obpark_orders_${new Date().toISOString().slice(0, 10)}.csv`,
    })
  }, [])

  // Cell Renderers with strict Y-axis vertical centering
  const OrderNumberCellRenderer = useCallback((props: CustomCellRendererProps<AdminOrder>) => {
    const o = props.data
    if (!o) return null
    const text = o.orderNumber || `#${o.id.slice(-6).toUpperCase()}`
    return (
      <div className="flex items-center w-full h-full font-mono font-bold text-sm text-gray-800">
        {text}
      </div>
    )
  }, [])

  const CustomerProductCellRenderer = useCallback((props: CustomCellRendererProps<AdminOrder>) => {
    const order = props.data
    if (!order) return null
    const firstItem = order.items?.[0]?.productName ?? 'Standard Package'
    const moreItems = order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''

    return (
      <div className="flex items-center gap-2.5 w-full h-full py-1">
        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-[0.6875rem] text-gray-500 font-bold">
          PKG
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center leading-tight">
          <p className="text-gray-900 font-semibold text-sm truncate" title={firstItem + moreItems}>
            {firstItem}
            {moreItems && <span className="text-xs text-gray-400 font-normal">{moreItems}</span>}
          </p>
          {order.customerName && (
            <p className="text-xs text-gray-500 truncate mt-0.5" title={order.customerName}>
              {order.customerName}
            </p>
          )}
        </div>
      </div>
    )
  }, [])

  const AddressCellRenderer = useCallback((props: CustomCellRendererProps<AdminOrder>) => {
    const order = props.data
    if (!order) return null
    const addr = formatDeliveryAddress(order.shippingAddress)
    return (
      <div className="flex items-center w-full h-full text-sm text-gray-600 truncate" title={addr}>
        {addr}
      </div>
    )
  }, [])

  const DateCellRenderer = useCallback((props: CustomCellRendererProps<AdminOrder>) => {
    const o = props.data
    if (!o) return null
    const d = new Date(o.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    return (
      <div className="flex items-center w-full h-full text-gray-600 text-sm font-mono">
        {d}
      </div>
    )
  }, [])

  const PriceCellRenderer = useCallback((props: CustomCellRendererProps<AdminOrder>) => {
    const o = props.data
    if (!o) return null
    const num = Number(o.total || o.totalAmount || 0)
    return (
      <div className="flex items-center w-full h-full text-gray-900 font-bold text-sm font-mono">
        ₹{num.toLocaleString('en-IN')}
      </div>
    )
  }, [])

  const PaymentCellRenderer = useCallback((props: CustomCellRendererProps<AdminOrder>) => {
    const order = props.data
    if (!order) return null
    const isPaid =
      order.payment?.status === 'SUCCESS' ||
      order.paymentStatus === 'SUCCESS' ||
      ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)

    return (
      <div className="flex items-center w-full h-full">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isPaid
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-rose-500'}`}
          />
          {isPaid ? 'Paid' : 'Unpaid'}
        </span>
      </div>
    )
  }, [])

  const StatusActionCellRenderer = useCallback(
    (props: CustomCellRendererProps<AdminOrder>) => {
      const order = props.data
      if (!order) return null
      const isUpdating = updatingOrderId === order.id

      if (isUpdating) {
        return (
          <div className="flex items-center w-full h-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#074139]" />
              Updating...
            </span>
          </div>
        )
      }

      return (
        <div className="flex items-center w-full h-full">
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
              className={`appearance-none cursor-pointer text-xs font-bold px-3 py-1.5 pr-7 rounded-full border shadow-xs transition-all outline-none focus:ring-2 focus:ring-[#074139]/30 disabled:opacity-50 ${STATUS_BADGE_STYLE[order.status] ??
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
        </div>
      )
    },
    [updatingOrderId, updateStatusMutation]
  )

  const colDefs = useMemo<ColDef<AdminOrder>[]>(() => {
    return [
      {
        headerName: 'No',
        width: 60,
        valueGetter: (params) => (params.node?.rowIndex != null ? params.node.rowIndex + 1 : ''),
        cellClass: 'flex items-center text-gray-500 text-xs font-mono',
        sortable: false,
        filter: false,
      },
      {
        headerName: 'Order Number',
        field: 'orderNumber',
        flex: 1.1,
        minWidth: 125,
        cellRenderer: OrderNumberCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Customer / Product',
        field: 'customerName',
        flex: 1.8,
        minWidth: 180,
        cellRenderer: CustomerProductCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Delivery Address',
        field: 'shippingAddress',
        flex: 1.6,
        minWidth: 160,
        cellRenderer: AddressCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Date',
        field: 'createdAt',
        flex: 1,
        minWidth: 105,
        cellRenderer: DateCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agDateColumnFilter',
      },
      {
        headerName: 'Price',
        field: 'total',
        flex: 1,
        minWidth: 105,
        cellRenderer: PriceCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Payment',
        field: 'paymentStatus',
        flex: 1,
        minWidth: 105,
        cellRenderer: PaymentCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Status (Update)',
        field: 'status',
        width: 175,
        pinned: 'right',
        cellRenderer: StatusActionCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
    ]
  }, [
    OrderNumberCellRenderer,
    CustomerProductCellRenderer,
    AddressCellRenderer,
    DateCellRenderer,
    PriceCellRenderer,
    PaymentCellRenderer,
    StatusActionCellRenderer,
  ])

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: showFloatingFilters,
      cellClass: 'flex items-center',
    }),
    [showFloatingFilters]
  )

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
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border animate-in slide-in-from-bottom duration-200 ${toast.type === 'success'
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

      <div className="p-4 sm:p-6 space-y-6">
        {/* Page Top Header & Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`${microgrammaBold.className} text-[1.375rem] font-bold text-gray-800`}>
              Orders Management
            </h2>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Analyze monthly order volumes, fulfillment velocity, and manage live customer orders
            </p>
          </div>

          {/* Two-Tab Switcher */}
          <div className="flex items-center bg-gray-200/70 p-1 rounded-xl text-xs font-semibold shadow-inner self-start sm:self-auto">
            <button
              onClick={() => setMainTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                mainTab === 'overview'
                  ? 'bg-white text-[#074139] shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Orders Overview</span>
            </button>

            <button
              onClick={() => setMainTab('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                mainTab === 'table'
                  ? 'bg-white text-[#074139] shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TableIcon className="h-4 w-4" />
              <span>Orders Table</span>
              <span
                className={`text-[0.625rem] px-2 py-0.5 rounded-full font-bold ${
                  mainTab === 'table'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-300/80 text-gray-700'
                }`}
              >
                {isLoading ? '—' : (data?.total ?? data?.orders?.length ?? 0)}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: Orders Overview */}
        {mainTab === 'overview' && (
          <div className="animate-in fade-in duration-200">
            <OrderOverview
              orders={data?.orders ?? []}
              isLoading={isLoading}
              onSwitchToTable={handleSwitchToTable}
            />
          </div>
        )}

        {/* TAB 2: Orders Table */}
        {mainTab === 'table' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((k) => (
                <div key={k.label} className="bg-white border rounded-xl p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <p className={`${microgrammaBold.className} text-[1.125rem] font-semibold text-gray-700`}>
                      {k.label}
                    </p>
                    <MoreVertical className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-800">{k.value}</p>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1">Last 7 days</p>
                </div>
              ))}
            </div>

            {/* Filter tabs + search row */}
            <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
              {/* Scoped CSS enforcing vertical Y-axis centering */}
              <style>{`
                .ag-grid-orders .ag-cell {
                  display: flex !important;
                  align-items: center !important;
                }
                .ag-grid-orders .ag-cell-wrapper {
                  display: flex !important;
                  align-items: center !important;
                  height: 100% !important;
                  width: 100% !important;
                }
                .ag-grid-orders .ag-cell-value {
                  display: flex !important;
                  align-items: center !important;
                  height: 100% !important;
                  width: 100% !important;
                }
                .ag-grid-orders .ag-react-container {
                  display: flex !important;
                  align-items: center !important;
                  height: 100% !important;
                  width: 100% !important;
                }
                .ag-grid-orders .ag-header-cell-label {
                  display: flex !important;
                  align-items: center !important;
                  height: 100% !important;
                }
              `}</style>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex bg-gray-50 rounded-lg p-1 text-sm overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab)
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
                      placeholder="Search order ID, item, buyer..."
                      className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-48 sm:w-60 focus:bg-white focus:border-[#074139] transition-all"
                    />
                  </div>

                  <button
                    onClick={() => setShowFloatingFilters((prev) => !prev)}
                    className={`p-2 rounded-lg border text-gray-500 hover:bg-gray-50 transition-colors ${
                      showFloatingFilters ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : ''
                    }`}
                    title="Toggle column filters"
                    type="button"
                  >
                    <Filter className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleExportCsv}
                    disabled={!filteredOrders.length}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    title="Export orders to CSV"
                    type="button"
                  >
                    <Download className="h-3.5 w-3.5" />
                    CSV
                  </button>
                </div>
              </div>

              {/* AG Grid */}
              <div
                className="ag-grid-orders w-full rounded-xl overflow-hidden border border-gray-200"
                style={{ height: '540px' }}
              >
                <style jsx global>{`
                  .ag-grid-orders .ag-cell,
                  .ag-grid-orders .ag-cell-wrapper,
                  .ag-grid-orders .ag-cell-value,
                  .ag-grid-orders .ag-react-container,
                  .ag-grid-orders .ag-header-cell-label {
                    display: flex !important;
                    align-items: center !important;
                    height: 100% !important;
                  }
                `}</style>
                <AgGridReact<AdminOrder>
                  ref={gridRef}
                  theme={obparkGridTheme}
                  rowData={filteredOrders}
                  columnDefs={colDefs}
                  defaultColDef={defaultColDef}
                  quickFilterText={searchQuery}
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 20, 50, 100]}
                  rowHeight={52}
                  headerHeight={36}
                  loading={isLoading}
                  animateRows={true}
                  enableCellTextSelection={true}
                  overlayNoRowsTemplate="<div class='p-8 text-center text-gray-400 text-sm'>No orders found</div>"
                  overlayLoadingTemplate="<div class='p-8 text-center text-emerald-800 text-sm font-medium'>Loading orders...</div>"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
