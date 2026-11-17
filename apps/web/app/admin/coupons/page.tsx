'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Header } from '@/components/admin/layout/Header'
import { microgrammaBold } from '@/lib/fonts'
import { Plus, MoreVertical, Search, Filter, X, Trash2, Loader2, Download } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { dialog } from '@/lib/dialog'
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  GridReadyEvent,
} from 'ag-grid-community'
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react'

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
  borderRadius: 8,
  browserColorScheme: 'light',
  rowHoverColor: '#F9FAFB',
  selectedRowBackgroundColor: '#ECFDF5',
  rowHeight: 48,
  headerHeight: 36,
})

interface Coupon {
  id: string
  code: string
  description?: string
  discountType: 'FLAT' | 'PERCENTAGE'
  discountValue: number
  minOrderValue?: number
  maxUses?: number
  usedCount: number
  isActive: boolean
  expiresAt?: string
}

const TABS = ['All Coupons', 'Active', 'Disabled', 'Expired']

function isExpired(coupon: Coupon) {
  return !!coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
}

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState('All Coupons')
  const [search, setSearch] = useState('')
  const [showFloatingFilters, setShowFloatingFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const gridRef = useRef<AgGridReact<Coupon>>(null)
  const qc = useQueryClient()

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => api.get<Coupon[]>('/coupons'),
  })

  const createCoupon = useMutation({
    mutationFn: (data: any) => api.post('/coupons', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      setShowForm(false)
      reset()
    },
  })

  const toggleCoupon = useMutation({
    mutationFn: (id: string) => api.patch(`/coupons/${id}/toggle`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })

  const deleteCoupon = useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/coupons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })

  const handleDeleteCoupon = async (id: string, code: string) => {
    const confirmed = await dialog.confirm({
      title: 'Delete Coupon',
      message: `Are you sure you want to permanently delete coupon "${code}"? This action cannot be undone.`,
      confirmText: 'Delete Coupon',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!confirmed) return

    deleteCoupon.mutate(id, {
      onError: (err: any) => {
        dialog.alert({
          title: 'Delete Failed',
          message: err?.message || 'Failed to delete coupon.',
          variant: 'error',
        })
      },
    })
  }

  interface CouponFormValues {
    code: string
    description?: string
    discountType: 'FLAT' | 'PERCENTAGE'
    discountValue: string
    minOrderValue?: string
    maxUses?: string
    expiresAt?: string
  }

  const { register, handleSubmit, reset, watch } = useForm<CouponFormValues>({
    defaultValues: { discountType: 'FLAT' },
  })
  const discountType = watch('discountType')

  const onSubmit = (data: any) => {
    createCoupon.mutate(
      {
        ...data,
        discountValue: parseFloat(data.discountValue),
        minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : undefined,
        maxUses: data.maxUses ? parseInt(data.maxUses) : undefined,
        expiresAt: data.expiresAt || undefined,
      },
      {
        onError: (err: any) => {
          dialog.alert({
            title: 'Creation Failed',
            message: err?.message || 'Failed to create coupon. Please check that the code is unique.',
            variant: 'error',
          })
        },
      }
    )
  }

  const filtered = (coupons ?? []).filter((c) => {
    if (activeTab === 'Active' && (!c.isActive || isExpired(c))) return false
    if (activeTab === 'Disabled' && c.isActive) return false
    if (activeTab === 'Expired' && !isExpired(c)) return false
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      const matchCode = c.code.toLowerCase().includes(q)
      const matchDesc = (c.description || '').toLowerCase().includes(q)
      if (!matchCode && !matchDesc) return false
    }
    return true
  })

  const total = coupons?.length ?? 0
  const activeCount = coupons?.filter((c) => c.isActive && !isExpired(c)).length ?? 0
  const expiredCount = coupons?.filter(isExpired).length ?? 0
  const totalUses = coupons?.reduce((sum, c) => sum + c.usedCount, 0) ?? 0

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `obpark_coupons_${new Date().toISOString().slice(0, 10)}.csv`,
    })
  }, [])

  // Cell Renderers with strict Y-axis vertical centering
  const CodeCellRenderer = useCallback((props: CustomCellRendererProps<Coupon>) => {
    const code = props.value || '—'
    return (
      <div className="flex items-center w-full h-full">
        <span className="inline-flex items-center font-mono font-bold text-gray-900 text-sm bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200 truncate">
          {code}
        </span>
      </div>
    )
  }, [])

  const DescriptionCellRenderer = useCallback((props: CustomCellRendererProps<Coupon>) => {
    const desc = props.value || '—'
    return (
      <div className="flex items-center w-full h-full text-sm text-gray-600 truncate" title={desc}>
        {desc}
      </div>
    )
  }, [])

  const DiscountCellRenderer = useCallback((props: CustomCellRendererProps<Coupon>) => {
    const c = props.data
    if (!c) return null
    const text =
      c.discountType === 'FLAT'
        ? `₹${Number(c.discountValue).toLocaleString('en-IN')} off`
        : `${c.discountValue}% off`
    return (
      <div className="flex items-center w-full h-full font-semibold text-gray-900 text-sm">
        {text}
      </div>
    )
  }, [])

  const MinOrderCellRenderer = useCallback((props: CustomCellRendererProps<Coupon>) => {
    const c = props.data
    if (!c) return null
    const text = c.minOrderValue ? `₹${Number(c.minOrderValue).toLocaleString('en-IN')}` : '—'
    return (
      <div className="flex items-center w-full h-full text-gray-600 font-mono text-sm">
        {text}
      </div>
    )
  }, [])

  const UsesCellRenderer = useCallback((props: CustomCellRendererProps<Coupon>) => {
    const c = props.data
    if (!c) return null
    const text = `${c.usedCount}${c.maxUses ? `/${c.maxUses}` : ''}`
    return (
      <div className="flex items-center w-full h-full text-gray-800 text-sm font-mono">
        {text}
      </div>
    )
  }, [])

  const ExpiresCellRenderer = useCallback((props: CustomCellRendererProps<Coupon>) => {
    const c = props.data
    if (!c) return null
    const text = c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'Never'
    return (
      <div className="flex items-center w-full h-full text-gray-500 text-xs font-mono">
        {text}
      </div>
    )
  }, [])

  const StatusCellRenderer = useCallback((props: CustomCellRendererProps<Coupon>) => {
    const c = props.data
    if (!c) return null
    const expired = isExpired(c)
    const dotColor = expired ? 'bg-gray-400' : c.isActive ? 'bg-emerald-500' : 'bg-rose-500'
    const badgeStyle = expired
      ? 'bg-gray-100 text-gray-600 border-gray-200'
      : c.isActive
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-rose-50 text-rose-600 border-rose-200'
    const statusText = expired ? 'Expired' : c.isActive ? 'Active' : 'Disabled'

    return (
      <div className="flex items-center w-full h-full">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${badgeStyle}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          {statusText}
        </span>
      </div>
    )
  }, [])

  const ActionCellRenderer = useCallback(
    (props: CustomCellRendererProps<Coupon>) => {
      const c = props.data
      if (!c) return null
      const expired = isExpired(c)

      return (
        <div className="flex items-center justify-end gap-2 w-full h-full pr-2">
          <button
            onClick={() => toggleCoupon.mutate(c.id)}
            disabled={expired || toggleCoupon.isPending}
            className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium disabled:opacity-40 ${
              c.isActive
                ? 'border-red-200 text-red-500 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
            type="button"
          >
            {c.isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCoupon(c.id, c.code)}
            disabled={deleteCoupon.isPending}
            title="Delete coupon"
            aria-label={`Delete coupon ${c.code}`}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    },
    [toggleCoupon, deleteCoupon, handleDeleteCoupon]
  )

  const colDefs = useMemo<ColDef<Coupon>[]>(() => {
    return [
      {
        headerName: 'Code',
        field: 'code',
        flex: 1.2,
        minWidth: 120,
        cellRenderer: CodeCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Description',
        field: 'description',
        flex: 1.8,
        minWidth: 150,
        valueGetter: (params) => params.data?.description || '—',
        cellRenderer: DescriptionCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Discount',
        field: 'discountValue',
        flex: 1.1,
        minWidth: 110,
        cellRenderer: DiscountCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Min Order',
        field: 'minOrderValue',
        flex: 1,
        minWidth: 100,
        cellRenderer: MinOrderCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Uses',
        field: 'usedCount',
        flex: 1,
        minWidth: 90,
        cellRenderer: UsesCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Expires',
        field: 'expiresAt',
        flex: 1,
        minWidth: 110,
        cellRenderer: ExpiresCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agDateColumnFilter',
      },
      {
        headerName: 'Status',
        field: 'isActive',
        flex: 1,
        minWidth: 110,
        cellRenderer: StatusCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Action',
        width: 150,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        cellClass: 'flex items-center justify-end',
        headerClass: 'text-right',
        cellRenderer: ActionCellRenderer,
      },
    ]
  }, [
    CodeCellRenderer,
    DescriptionCellRenderer,
    DiscountCellRenderer,
    MinOrderCellRenderer,
    UsesCellRenderer,
    ExpiresCellRenderer,
    StatusCellRenderer,
    ActionCellRenderer,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Coupons" onMenuClick={() => setDrawerOpen(true)} />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className={`${microgrammaBold.className} font-semibold text-[1.125rem] text-gray-800`}>
            Coupon List
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-95 transition-all shadow-xs"
            style={{ backgroundColor: '#074139' }}
          >
            <Plus className="h-4 w-4" />
            <span>Add Coupon</span>
          </button>
        </div>

        {/* KPI cards — all real, computed from actual coupon list */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Coupons', value: total },
            { label: 'Active Coupons', value: activeCount },
            { label: 'Expired Coupons', value: expiredCount },
            { label: 'Total Redemptions', value: totalUses },
          ].map((k) => (
            <div key={k.label} className="bg-white border rounded-xl p-5 shadow-md">
              <div className="flex items-start justify-between">
                <p className={`${microgrammaBold.className} text-[1rem] font-semibold text-gray-700`}>{k.label}</p>
                <MoreVertical className="h-4 w-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{isLoading ? '—' : k.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Last 7 days</p>
            </div>
          ))}
        </div>

        {/* Filter tabs + table */}
        <div className="bg-white border rounded-xl p-4 shadow-md space-y-4">
          {/* Scoped CSS enforcing vertical Y-axis centering */}
          <style>{`
            .ag-grid-coupons .ag-cell {
              display: flex !important;
              align-items: center !important;
            }
            .ag-grid-coupons .ag-cell-wrapper {
              display: flex !important;
              align-items: center !important;
              height: 100% !important;
              width: 100% !important;
            }
            .ag-grid-coupons .ag-cell-value {
              display: flex !important;
              align-items: center !important;
              height: 100% !important;
              width: 100% !important;
            }
            .ag-grid-coupons .ag-react-container {
              display: flex !important;
              align-items: center !important;
              height: 100% !important;
              width: 100% !important;
            }
            .ag-grid-coupons .ag-header-cell-label {
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
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                  style={activeTab === tab ? { color: '#074139' } : {}}
                >
                  {tab === 'All Coupons' ? `All Coupons (${total})` : tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search coupon code..."
                  className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-48 focus:border-[#074139]"
                />
              </div>

              <button
                onClick={() => setShowFloatingFilters((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showFloatingFilters
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'text-gray-600 hover:bg-gray-50 border-gray-200'
                }`}
                title="Toggle column filters"
                type="button"
              >
                <Filter className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleExportCsv}
                disabled={!coupons?.length}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Export coupons to CSV"
                type="button"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </button>
            </div>
          </div>

          <div
            className="ag-grid-coupons w-full rounded-xl overflow-hidden border border-gray-200"
            style={{ height: '520px' }}
          >
            <AgGridReact<Coupon>
              ref={gridRef}
              theme={obparkGridTheme}
              rowData={filtered}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              quickFilterText={search}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              rowHeight={48}
              headerHeight={36}
              loading={isLoading}
              animateRows={true}
              enableCellTextSelection={true}
              overlayNoRowsTemplate="<div class='p-8 text-center text-gray-400 text-sm'>No coupons found</div>"
              overlayLoadingTemplate="<div class='p-8 text-center text-emerald-800 text-sm font-medium'>Loading coupons...</div>"
            />
          </div>
        </div>
      </div>

      {/* Create coupon modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-xl p-6 space-y-5 shadow-xl z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className={`${microgrammaBold.className} font-bold text-lg`} style={{ color: '#074139' }}>
                Create Coupon
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Coupon Code</label>
                <input
                  {...register('code', { required: true })}
                  placeholder="OBRIVE100"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none uppercase font-mono tracking-wider focus:border-[#074139]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Description</label>
                <input
                  {...register('description')}
                  placeholder="₹100 off on orders above ₹500"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Discount Type</label>
                  <select
                    {...register('discountType')}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                  >
                    <option value="FLAT">Flat (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-1.5 block">
                    {discountType === 'FLAT' ? 'Amount (₹)' : 'Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('discountValue', { required: true })}
                    placeholder={discountType === 'FLAT' ? '100' : '10'}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Min Order Value (₹)</label>
                  <input
                    type="number"
                    step="any"
                    {...register('minOrderValue')}
                    placeholder="500"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Max Uses</label>
                  <input
                    type="number"
                    {...register('maxUses')}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Expiry Date</label>
                <input
                  type="date"
                  {...register('expiresAt')}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                />
              </div>

              {createCoupon.isError && (
                <p className="text-xs text-red-500">
                  Something went wrong — check that the code isn't already in use.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createCoupon.isPending}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-colors shadow-xs"
                  style={{ backgroundColor: '#074139' }}
                >
                  {createCoupon.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {createCoupon.isPending ? 'Creating...' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-lg text-sm border font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
