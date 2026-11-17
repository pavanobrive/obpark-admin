'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  X,
  Eye,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  GridReadyEvent,
  RowClickedEvent,
} from 'ag-grid-community'
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react'
import type { Customer } from './types'
import { CustomerAvatar } from './CustomerAvatar'

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
  rowHeight: 52,
  headerHeight: 36,
})

interface CustomerTableProps {
  customers: Customer[]
  isLoading: boolean
  selectedId: string | null
  onSelect: (customer: Customer) => void
  containerHeight?: string
}

export function CustomerTable({
  customers,
  isLoading,
  selectedId,
  onSelect,
  containerHeight,
}: CustomerTableProps) {
  const [quickFilterText, setQuickFilterText] = useState('')
  const [showFloatingFilters, setShowFloatingFilters] = useState(false)
  const [filteredCount, setFilteredCount] = useState<number | null>(null)

  const gridRef = useRef<AgGridReact<Customer>>(null)
  const queryClient = useQueryClient()

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
  }, [queryClient])

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `obpark_customers_${new Date().toISOString().slice(0, 10)}.csv`,
    })
  }, [])

  const onGridReady = useCallback(
    (params: GridReadyEvent<Customer>) => {
      params.api.sizeColumnsToFit()
      if (selectedId) {
        params.api.forEachNode((node) => {
          if (node.data && (node.data.id + node.data.name === selectedId || node.data.id === selectedId)) {
            node.setSelected(true)
          }
        })
      }
    },
    [selectedId]
  )

  // Synchronize selection highlight when selectedId changes externally
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.forEachNode((node) => {
        const isMatch = Boolean(
          node.data &&
            (node.data.id + node.data.name === selectedId || node.data.id === selectedId)
        )
        if (node.isSelected() !== isMatch) {
          node.setSelected(isMatch)
        }
      })
    }
  }, [selectedId])

  const onFilterChanged = useCallback(() => {
    if (gridRef.current?.api) {
      setFilteredCount(gridRef.current.api.getDisplayedRowCount())
    }
  }, [])

  const onRowClicked = useCallback(
    (event: RowClickedEvent<Customer>) => {
      if (event.data) {
        onSelect(event.data)
      }
    },
    [onSelect]
  )

  // Cell Renderers with strict Y-axis vertical centering
  const CustomerCellRenderer = useCallback(
    (props: CustomCellRendererProps<Customer>) => {
      const c = props.data
      if (!c) return null

      return (
        <div className="flex items-center gap-2.5 w-full h-full py-1">
          <CustomerAvatar src={c.avatar} name={c.name} size="sm" />
          <div className="min-w-0 flex-1 flex flex-col justify-center leading-tight">
            <p className="font-semibold text-gray-900 text-sm truncate" title={c.name}>
              {c.name}
            </p>
            {c.email && c.email !== '—' && (
              <p className="text-xs text-gray-400 truncate mt-0.5" title={c.email}>
                {c.email}
              </p>
            )}
          </div>
        </div>
      )
    },
    []
  )

  const CustomerIdCellRenderer = useCallback(
    (props: CustomCellRendererProps<Customer>) => {
      const val = props.value || '—'
      return (
        <div className="flex items-center w-full h-full">
          <span className="inline-flex items-center font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 truncate">
            {val}
          </span>
        </div>
      )
    },
    []
  )

  const PhoneCellRenderer = useCallback(
    (props: CustomCellRendererProps<Customer>) => {
      const val = props.value || '—'
      return (
        <div className="flex items-center w-full h-full text-xs font-mono font-medium text-gray-700 truncate">
          {val}
        </div>
      )
    },
    []
  )

  const OrderCountCellRenderer = useCallback(
    (props: CustomCellRendererProps<Customer>) => {
      const count = Number(props.value ?? 0)
      return (
        <div className="flex items-center justify-center w-full h-full">
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 min-w-7 font-mono">
            {count}
          </span>
        </div>
      )
    },
    []
  )

  const TotalSpendCellRenderer = useCallback(
    (props: CustomCellRendererProps<Customer>) => {
      const num = Number(props.value ?? 0)
      return (
        <div className="flex items-center w-full h-full font-bold text-emerald-800 font-mono text-sm">
          ₹{num.toLocaleString('en-IN')}
        </div>
      )
    },
    []
  )

  const StatusCellRenderer = useCallback(
    (props: CustomCellRendererProps<Customer>) => {
      const status = props.value || 'Active'
      const isVIP = status === 'VIP'
      const isActive = status === 'Active'

      const dotColor = isActive
        ? 'bg-emerald-500'
        : isVIP
        ? 'bg-amber-500'
        : 'bg-rose-500'

      const badgeStyle = isActive
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : isVIP
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-rose-50 text-rose-700 border-rose-200'

      return (
        <div className="flex items-center w-full h-full">
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${badgeStyle}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            {status}
          </span>
        </div>
      )
    },
    []
  )

  const ActionCellRenderer = useCallback(
    (props: CustomCellRendererProps<Customer>) => {
      const c = props.data
      if (!c) return null

      return (
        <div className="flex items-center justify-center w-full h-full">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(c)
            }}
            className="text-gray-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            title="View customer profile"
            type="button"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      )
    },
    [onSelect]
  )

  // Column definitions
  const colDefs = useMemo<ColDef<Customer>[]>(() => {
    return [
      {
        headerName: 'Customer',
        field: 'name',
        flex: 2,
        minWidth: 190,
        cellRenderer: CustomerCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'equals'],
          debounceMs: 200,
        },
      },
      {
        headerName: 'Customer ID',
        field: 'id',
        flex: 1.1,
        minWidth: 130,
        cellRenderer: CustomerIdCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Phone',
        field: 'phone',
        flex: 1.1,
        minWidth: 130,
        cellRenderer: PhoneCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Orders',
        field: 'orderCount',
        flex: 0.8,
        minWidth: 90,
        cellRenderer: OrderCountCellRenderer,
        cellClass: 'flex items-center justify-center',
        headerClass: 'text-center',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Total Spend',
        field: 'totalSpend',
        flex: 1.1,
        minWidth: 120,
        cellRenderer: TotalSpendCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Status',
        field: 'status',
        flex: 1,
        minWidth: 110,
        cellRenderer: StatusCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Action',
        width: 75,
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
    CustomerCellRenderer,
    CustomerIdCellRenderer,
    PhoneCellRenderer,
    OrderCountCellRenderer,
    TotalSpendCellRenderer,
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
    <div className="lg:col-span-2 bg-white border rounded-xl p-4 shadow-sm space-y-4">
      {/* Scoped CSS enforcing vertical Y-axis centering across all AG Grid cells & wrappers */}
      <style>{`
        .ag-grid-customers .ag-cell {
          display: flex !important;
          align-items: center !important;
        }
        .ag-grid-customers .ag-cell-wrapper {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .ag-grid-customers .ag-cell-value {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .ag-grid-customers .ag-react-container {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .ag-grid-customers .ag-header-cell-label {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
        }
        .ag-grid-customers .ag-row {
          cursor: pointer !important;
        }
      `}</style>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Filter Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              placeholder="Search customers..."
              className="pl-8 pr-7 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-56 focus:bg-white focus:ring-1 focus:ring-emerald-700 transition-all"
            />
            {quickFilterText && (
              <button
                onClick={() => setQuickFilterText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Floating Filters */}
          <button
            onClick={() => setShowFloatingFilters((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showFloatingFilters
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'text-gray-600 hover:bg-gray-50 border-gray-200'
            }`}
            title="Toggle column filter inputs"
            type="button"
          >
            <Filter className="h-3.5 w-3.5" />
            {showFloatingFilters ? 'Hide Filters' : 'Filters'}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            disabled={!customers.length}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Export customers to CSV"
            type="button"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh customer list"
            type="button"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Counter Badge */}
        <div className="text-xs text-gray-500">
          {filteredCount !== null && filteredCount !== customers.length ? (
            <span>
              Filtered: <strong className="text-gray-800">{filteredCount}</strong> of{' '}
              <strong className="text-gray-800">{customers.length}</strong>
            </span>
          ) : (
            <span>
              Total: <strong className="text-gray-800">{customers.length}</strong> customers
            </span>
          )}
        </div>
      </div>

      {/* AG Grid Container */}
      <div
        className="ag-grid-customers w-full rounded-xl overflow-hidden border border-gray-200"
        style={{ height: containerHeight || 'calc(100vh - 220px)', minHeight: '440px' }}
      >
        <AgGridReact<Customer>
          ref={gridRef}
          theme={obparkGridTheme}
          rowData={customers}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          rowHeight={52}
          headerHeight={36}
          loading={isLoading}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onRowClicked={onRowClicked}
          rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
          animateRows={true}
          enableCellTextSelection={true}
          overlayNoRowsTemplate="<div class='p-8 text-center text-gray-400 text-sm'>No customers found</div>"
          overlayLoadingTemplate="<div class='p-8 text-center text-emerald-800 text-sm font-medium'>Loading customers...</div>"
        />
      </div>
    </div>
  )
}
