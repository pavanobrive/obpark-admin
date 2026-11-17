'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import {
  MoreVertical,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Download,
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
import { useTransactions, useTransactionSummary } from '@/hooks/useTransactions'

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
  rowHeight: 48,
  headerHeight: 36,
})

const TABS = ['All order', 'Complete', 'Pending', 'Failed']

interface TransactionItem {
  id: string
  customerId?: string
  name: string
  date: string
  total: number
  method: string
  status: string
}

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState('All order')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showFloatingFilters, setShowFloatingFilters] = useState(false)
  const gridRef = useRef<AgGridReact<TransactionItem>>(null)

  const { data: summary } = useTransactionSummary()
  const { data, isLoading, isError } = useTransactions()
  const transactions = (data?.transactions ?? []) as TransactionItem[]

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => activeTab === 'All order' || t.status === activeTab)
      .filter((t) => !search.trim() || t.name?.toLowerCase().includes(search.toLowerCase()))
  }, [transactions, activeTab, search])

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `obpark_transactions_${new Date().toISOString().slice(0, 10)}.csv`,
    })
  }, [])

  // Cell Renderers with strict Y-axis vertical centering
  const CustomerIdCellRenderer = useCallback((props: CustomCellRendererProps<TransactionItem>) => {
    const t = props.data
    const id = t?.customerId?.slice(0, 8) ?? '—'
    return (
      <div className="flex items-center w-full h-full">
        <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 truncate">
          {id}
        </span>
      </div>
    )
  }, [])

  const NameCellRenderer = useCallback((props: CustomCellRendererProps<TransactionItem>) => {
    const name = props.value || '—'
    return (
      <div className="flex items-center w-full h-full font-semibold text-gray-800 text-sm truncate" title={name}>
        {name}
      </div>
    )
  }, [])

  const DateCellRenderer = useCallback((props: CustomCellRendererProps<TransactionItem>) => {
    const val = props.value
    const d = val ? new Date(val).toLocaleDateString('en-IN') : '—'
    return (
      <div className="flex items-center w-full h-full text-gray-600 font-mono text-sm">
        {d}
      </div>
    )
  }, [])

  const TotalCellRenderer = useCallback((props: CustomCellRendererProps<TransactionItem>) => {
    const num = Number(props.value ?? 0)
    return (
      <div className="flex items-center w-full h-full font-bold text-gray-800 font-mono text-sm">
        ₹{num.toLocaleString('en-IN')}
      </div>
    )
  }, [])

  const MethodCellRenderer = useCallback((props: CustomCellRendererProps<TransactionItem>) => {
    const m = props.value || '—'
    return (
      <div className="flex items-center w-full h-full text-gray-700 text-sm">
        {m}
      </div>
    )
  }, [])

  const StatusCellRenderer = useCallback((props: CustomCellRendererProps<TransactionItem>) => {
    const status = props.value || 'Pending'
    const isComplete = status === 'Complete'
    const isPending = status === 'Pending'

    const dotColor = isComplete
      ? 'bg-emerald-500'
      : isPending
      ? 'bg-amber-500'
      : 'bg-rose-500'

    const badgeStyle = isComplete
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : isPending
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200'

    return (
      <div className="flex items-center w-full h-full">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${badgeStyle}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          {status}
        </span>
      </div>
    )
  }, [])

  const ActionCellRenderer = useCallback((props: CustomCellRendererProps<TransactionItem>) => {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <button
          onClick={() => {}}
          className="text-[#074139] hover:text-[#052e28] text-xs font-semibold hover:underline"
          type="button"
        >
          View Details
        </button>
      </div>
    )
  }, [])

  const colDefs = useMemo<ColDef<TransactionItem>[]>(() => {
    return [
      {
        headerName: 'Customer Id',
        field: 'customerId',
        flex: 1.1,
        minWidth: 120,
        cellRenderer: CustomerIdCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Name',
        field: 'name',
        flex: 1.5,
        minWidth: 150,
        cellRenderer: NameCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Date',
        field: 'date',
        flex: 1,
        minWidth: 110,
        cellRenderer: DateCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agDateColumnFilter',
      },
      {
        headerName: 'Total',
        field: 'total',
        flex: 1.1,
        minWidth: 110,
        cellRenderer: TotalCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Method',
        field: 'method',
        flex: 1.1,
        minWidth: 110,
        cellRenderer: MethodCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Status',
        field: 'status',
        flex: 1.1,
        minWidth: 115,
        cellRenderer: StatusCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Action',
        width: 110,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        cellClass: 'flex items-center justify-center',
        headerClass: 'text-center',
        cellRenderer: ActionCellRenderer,
      },
    ]
  }, [
    CustomerIdCellRenderer,
    NameCellRenderer,
    DateCellRenderer,
    TotalCellRenderer,
    MethodCellRenderer,
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

  const kpis = [
    { label: 'Total Revenue', value: summary ? `₹${summary.totalRevenue.toLocaleString('en-IN')}` : '—' },
    { label: 'Completed Transactions', value: summary?.completed ?? '—' },
    { label: 'Pending Transactions', value: summary?.pending ?? '—' },
    { label: 'Failed Transactions', value: summary?.failed ?? '—' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Transactions" onMenuClick={() => setDrawerOpen(true)} />

      <div className="p-6 space-y-6">
        {/* KPI cards + Payment method */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-white border rounded-xl p-5 shadow-md">
                <div className="flex items-start justify-between">
                  <p className={`${microgrammaBold.className} text-[1rem] font-semibold text-gray-700`}>{k.label}</p>
                  <MoreVertical className="h-4 w-4 text-gray-300" />
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-1">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Payment Method card */}
          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className={`${microgrammaBold.className} font-semibold text-gray-800 text-[1rem]`}>Payment Method</p>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <div className="rounded-xl p-4 text-white mb-3" style={{ background: 'linear-gradient(135deg, #074139, #0f6b5c)' }}>
              <p className="text-xs opacity-80 mb-4">Razorpay / UPI Gateway</p>
              <p className="text-lg tracking-widest mb-3">•••• •••• •••• 2345</p>
              <div className="flex justify-between text-xs">
                <span>Obrive Merchant</span>
                <span>Active</span>
              </div>
            </div>
            <button className="w-full py-2 rounded-lg border text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
              <Plus className="h-4 w-4" /> Add Payment Method
            </button>
          </div>
        </div>

        {/* Filter tabs + table */}
        <div className="bg-white border rounded-xl p-4 shadow-md space-y-4">
          {/* Scoped CSS enforcing vertical Y-axis centering */}
          <style>{`
            .ag-grid-transactions .ag-cell {
              display: flex !important;
              align-items: center !important;
            }
            .ag-grid-transactions .ag-cell-wrapper {
              display: flex !important;
              align-items: center !important;
              height: 100% !important;
              width: 100% !important;
            }
            .ag-grid-transactions .ag-cell-value {
              display: flex !important;
              align-items: center !important;
              height: 100% !important;
              width: 100% !important;
            }
            .ag-grid-transactions .ag-react-container {
              display: flex !important;
              align-items: center !important;
              height: 100% !important;
              width: 100% !important;
            }
            .ag-grid-transactions .ag-header-cell-label {
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
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search payment history..."
                  className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-48 focus:border-[#074139]"
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
                disabled={!filtered.length}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Export transactions to CSV"
                type="button"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </button>
            </div>
          </div>

          <div
            className="ag-grid-transactions w-full rounded-xl overflow-hidden border border-gray-200"
            style={{ height: '520px' }}
          >
            <style jsx global>{`
              .ag-grid-transactions .ag-cell,
              .ag-grid-transactions .ag-cell-wrapper,
              .ag-grid-transactions .ag-cell-value,
              .ag-grid-transactions .ag-react-container,
              .ag-grid-transactions .ag-header-cell-label {
                display: flex !important;
                align-items: center !important;
                height: 100% !important;
              }
            `}</style>
            <AgGridReact<TransactionItem>
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
              overlayNoRowsTemplate="<div class='p-8 text-center text-gray-400 text-sm'>No transactions found</div>"
              overlayLoadingTemplate="<div class='p-8 text-center text-emerald-800 text-sm font-medium'>Loading transactions...</div>"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
