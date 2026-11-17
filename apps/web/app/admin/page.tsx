'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { MoreVertical, Search, ChevronRight, Plus, Filter } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from 'ag-grid-community'
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react'
import { microgrammaBold } from '@/lib/fonts'
import { useCategories } from '@/hooks/useCategories'
import { Header } from '@/components/admin/layout/Header'
import { MonthlyReportCard } from '@/components/admin/dashboard/MonthlyReportCard'
import Link from 'next/link'

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule])

// Custom AG Grid theme matching OBPARK branding
const obparkGridTheme = themeQuartz.withParams({
  accentColor: '#074139',
  headerBackgroundColor: '#F0FDF4',
  headerTextColor: '#374151',
  headerFontWeight: 600,
  headerFontSize: 11,
  fontSize: 11,
  borderColor: '#E5E7EB',
  borderRadius: 12,
  browserColorScheme: 'light',
  rowHoverColor: '#F9FAFB',
  selectedRowBackgroundColor: '#ECFDF5',
  rowHeight: 44,
  headerHeight: 34,
})

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

const QUICK_PRODUCTS = [
  { name: 'Air Filter', price: '₹399.00' },
  { name: 'Wiper Blade Set', price: '₹549.00' },
  { name: 'Spark Plug (Set of 4)', price: '₹699.00' },
]

const STATIC_BARS = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]

export default function DashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: stats, isLoading } = useDashboardStats()
  const { data: categories = [] } = useCategories()

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin', 'products', 'top'],
    queryFn: () => api.get<{ products: any[] }>('/admin/products?limit=4'),
  })

  // Recent Orders AG Grid Column Definitions
  const recentOrdersColDefs = useMemo<ColDef<DashboardStats['recentOrders'][0]>[]>(() => {
    return [
      {
        headerName: 'No',
        width: 55,
        valueGetter: (params) =>
          params.node?.rowIndex != null ? `${params.node.rowIndex + 1}.` : '',
        cellClass: 'flex items-center text-gray-500 text-xs font-mono',
        sortable: false,
        filter: false,
      },
      {
        headerName: 'Order ID',
        field: 'id',
        width: 100,
        cellRenderer: (props: CustomCellRendererProps) => (
          <div className="flex items-center w-full h-full">
            <span className="font-mono text-gray-800 text-sm font-semibold">
              #{props.value?.slice(-4)}
            </span>
          </div>
        ),
        cellClass: 'flex items-center',
      },
      {
        headerName: 'Order Date',
        field: 'createdAt',
        flex: 1.6,
        minWidth: 140,
        cellRenderer: (props: CustomCellRendererProps) => {
          if (!props.value) return null
          const d = new Date(props.value).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          })
          const t = new Date(props.value).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            <div className="flex items-center w-full h-full text-gray-600 text-xs font-mono">
              {d} | {t}
            </div>
          )
        },
        cellClass: 'flex items-center',
      },
      {
        headerName: 'Status',
        field: 'status',
        flex: 1.1,
        minWidth: 110,
        cellRenderer: (props: CustomCellRendererProps) => {
          const status = props.value
          const isSuccess = status === 'CONFIRMED' || status === 'DELIVERED'
          const isPending = status === 'PENDING'
          const dotColor = isSuccess
            ? 'bg-emerald-500'
            : isPending
            ? 'bg-amber-500'
            : 'bg-rose-500'

          return (
            <div className="flex items-center w-full h-full">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                <span className="text-gray-700">{status}</span>
              </span>
            </div>
          )
        },
        cellClass: 'flex items-center',
      },
      {
        headerName: 'Amount',
        field: 'total',
        flex: 1,
        minWidth: 95,
        cellRenderer: (props: CustomCellRendererProps) => (
          <div className="flex items-center justify-end w-full h-full font-bold text-gray-900 text-sm font-mono">
            ₹{Number(props.value ?? 0).toLocaleString('en-IN')}
          </div>
        ),
        cellClass: 'flex items-center justify-end',
        headerClass: 'text-right',
      },
    ]
  }, [])

  // Best Selling Products AG Grid Column Definitions
  const bestSellingColDefs = useMemo<ColDef<DashboardStats['bestSelling'][0]>[]>(() => {
    return [
      {
        headerName: 'PRODUCT',
        field: 'name',
        flex: 2,
        minWidth: 160,
        cellRenderer: (props: CustomCellRendererProps) => (
          <div className="flex items-center gap-2 w-full h-full">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0 flex items-center justify-center text-[10px] text-emerald-800 font-bold">
              {props.value ? String(props.value).slice(0, 2).toUpperCase() : 'PR'}
            </div>
            <span className="text-sm font-semibold text-gray-800 truncate" title={props.value}>
              {props.value}
            </span>
          </div>
        ),
        cellClass: 'flex items-center',
      },
      {
        headerName: 'TOTAL ORDER',
        field: 'orders',
        flex: 1,
        minWidth: 95,
        cellRenderer: (props: CustomCellRendererProps) => (
          <div className="flex items-center w-full h-full text-sm text-gray-700 font-semibold font-mono">
            {props.value}
          </div>
        ),
        cellClass: 'flex items-center',
      },
      {
        headerName: 'STATUS',
        field: 'inStock',
        flex: 1.1,
        minWidth: 105,
        cellRenderer: (props: CustomCellRendererProps) => {
          const inStock = Boolean(props.value)
          return (
            <div className="flex items-center w-full h-full">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className={inStock ? 'text-emerald-700' : 'text-rose-600'}>
                  {inStock ? 'Stock' : 'Stock out'}
                </span>
              </span>
            </div>
          )
        },
        cellClass: 'flex items-center',
      },
      {
        headerName: 'PRICE',
        field: 'price',
        flex: 1,
        minWidth: 90,
        cellRenderer: (props: CustomCellRendererProps) => (
          <div className="flex items-center justify-end w-full h-full text-sm font-bold text-gray-900 font-mono">
            ₹{Number(props.value ?? 0).toLocaleString('en-IN')}
          </div>
        ),
        cellClass: 'flex items-center justify-end',
        headerClass: 'text-right',
      },
    ]
  }, [])

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      cellClass: 'flex items-center',
    }),
    []
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" onMenuClick={() => setDrawerOpen(true)} />

      {/* Scoped CSS enforcing vertical Y-axis centering for dashboard AG Grids */}
      <style>{`
        .ag-grid-dashboard .ag-cell {
          display: flex !important;
          align-items: center !important;
        }
        .ag-grid-dashboard .ag-cell-wrapper {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .ag-grid-dashboard .ag-cell-value {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .ag-grid-dashboard .ag-react-container {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .ag-grid-dashboard .ag-header-cell-label {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
        }
      `}</style>

      <div className="p-6 space-y-6">

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className={`${microgrammaBold.className} text-[1.125rem] font-semibold text-gray-700`}>Total Sales</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Last 7 days</p>
              </div>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-800">
                ₹{isLoading ? '—' : (stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/admin/transactions" className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</Link>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className={`${microgrammaBold.className} text-[1.125rem] font-semibold text-gray-700`}>Total Orders</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Last 7 days</p>
              </div>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-800">
                {isLoading ? '—' : (stats?.totalOrders ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/admin/orders" className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</Link>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className={`${microgrammaBold.className} text-[1.125rem] font-semibold text-gray-700`}>Pending & Canceled</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Last 7 days</p>
              </div>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Pending</p>
                <p className="text-xl font-bold text-gray-800">{isLoading ? '—' : stats?.pendingOrders ?? 0}</p>
              </div>
              <div className="border-l pl-4">
                <p className="text-xs text-gray-500 font-medium">Canceled</p>
                <p className="text-xl font-bold text-red-500">{isLoading ? '—' : stats?.canceledOrders ?? 0}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/admin/orders" className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">Details</Link>
            </div>
          </div>
        </div>

        {/* Middle Row: Chart + Live Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">

          <div className="lg:col-span-2">
            <MonthlyReportCard stats={stats} statsLoading={isLoading} />
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
                      <span className="text-[0.625rem] font-bold w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        {s.state.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">₹{s.total.toLocaleString('en-IN')}</p>
                        <p className="text-[0.625rem] text-gray-400">{s.state}</p>
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

          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${microgrammaBold.className} font-semibold text-[1.125rem] text-gray-800`}>Transaction</h2>
                <Link
                  href="/admin/orders"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#074139' }}
                >
                  <Filter className="h-3.5 w-3.5" /> View All
                </Link>
              </div>

              {/* AG Grid for Recent Orders */}
              <div
                className="ag-grid-dashboard w-full rounded-xl overflow-hidden border border-gray-200"
                style={{ height: '270px' }}
              >
                <style jsx global>{`
                  .ag-grid-dashboard .ag-cell,
                  .ag-grid-dashboard .ag-cell-wrapper,
                  .ag-grid-dashboard .ag-cell-value,
                  .ag-grid-dashboard .ag-react-container,
                  .ag-grid-dashboard .ag-header-cell-label {
                    display: flex !important;
                    align-items: center !important;
                    height: 100% !important;
                  }
                `}</style>
                <AgGridReact
                  theme={obparkGridTheme}
                  rowData={stats?.recentOrders ?? []}
                  columnDefs={recentOrdersColDefs}
                  defaultColDef={defaultColDef}
                  rowHeight={44}
                  headerHeight={34}
                  loading={isLoading}
                  animateRows={true}
                  enableCellTextSelection={true}
                  overlayNoRowsTemplate="<div class='p-6 text-center text-gray-400 text-xs'>No orders yet</div>"
                  overlayLoadingTemplate="<div class='p-6 text-center text-emerald-800 text-xs font-medium'>Loading orders...</div>"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Link href="/admin/orders" className="text-xs px-4 py-1.5 rounded-full border border-blue-200 text-blue-500 hover:bg-gray-50">
                Details
              </Link>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`${microgrammaBold.className} font-semibold text-[1.125rem] text-gray-800`}>Top Products</h2>
              <Link href="/admin/products" className="text-xs text-blue-500 cursor-pointer hover:underline">All product</Link>
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
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0 flex items-center justify-center text-xs text-emerald-800 font-bold">
                      {p.name ? String(p.name).slice(0, 2).toUpperCase() : 'PR'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-[0.625rem] text-gray-400">Item: #{p.sku}</p>
                    </div>
                    <p className="text-xs font-bold font-mono">₹{Number(p.basePrice).toLocaleString('en-IN')}</p>
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

          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${microgrammaBold.className} font-semibold text-[1.125rem] text-gray-800`}>Best selling product</h2>
                <Link
                  href="/admin/products"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#074139' }}
                >
                  <Filter className="h-3.5 w-3.5" /> All Products
                </Link>
              </div>

              {/* AG Grid for Best Selling Products */}
              <div
                className="ag-grid-dashboard w-full rounded-xl overflow-hidden border border-gray-200"
                style={{ height: '270px' }}
              >
                <AgGridReact
                  theme={obparkGridTheme}
                  rowData={stats?.bestSelling ?? []}
                  columnDefs={bestSellingColDefs}
                  defaultColDef={defaultColDef}
                  rowHeight={44}
                  headerHeight={34}
                  loading={isLoading}
                  animateRows={true}
                  enableCellTextSelection={true}
                  overlayNoRowsTemplate="<div class='p-6 text-center text-gray-400 text-xs'>No products yet</div>"
                  overlayLoadingTemplate="<div class='p-6 text-center text-emerald-800 text-xs font-medium'>Loading products...</div>"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Link href="/admin/products" className="text-xs px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                Details
              </Link>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <h2 className={`${microgrammaBold.className} font-semibold text-[1.125rem] text-gray-800`}>Add New Product</h2>
              <Link href="/admin/products/add" className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                <Plus className="h-3 w-3" /> Add New
              </Link>
            </div>
            <p className="text-xs text-gray-400 mb-3">Categories</p>
            <div className="space-y-2 mb-4">
              {categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/admin/products`}
                  className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-800">
                      {cat.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium">{cat.name}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </Link>
              ))}
              {categories.length === 0 && <p className="text-xs text-gray-400">No categories yet</p>}
            </div>
            <Link href="/admin/categories" className="text-xs text-blue-500 w-full text-center mb-4 block hover:underline">See more</Link>

            <p className="text-xs text-gray-400 mb-3">Product</p>
            <div className="space-y-3">
              {QUICK_PRODUCTS.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0 flex items-center justify-center text-xs font-bold text-emerald-800">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[0.625rem] text-green-600 font-mono font-semibold">{p.price}</p>
                  </div>
                  <Link
                    href="/admin/products/add"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-white font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#074139' }}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Link>
                </div>
              ))}
            </div>
            <Link href="/admin/products" className="text-xs text-blue-500 w-full text-center mt-3 block hover:underline">See more</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
