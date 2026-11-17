'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import {
  Pencil,
  Trash2,
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  X,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  GridReadyEvent,
} from 'ag-grid-community'
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react'
import { useAdminProducts, useDeleteProduct, AdminProduct } from '@/hooks/useAdminProducts'
import { getFullImageUrl } from '@/lib/utils'
import { dialog } from '@/lib/dialog'
import { EditProductModal } from './EditProductModal'

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

export function ProductListTable() {
  const [quickFilterText, setQuickFilterText] = useState('')
  const [showFloatingFilters, setShowFloatingFilters] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [filteredCount, setFilteredCount] = useState<number | null>(null)

  const gridRef = useRef<AgGridReact<AdminProduct>>(null)
  const queryClient = useQueryClient()

  // Fetch up to 1000 products for complete client-side sorting, filtering & pagination
  const { data, isLoading, isFetching } = useAdminProducts(undefined, 1000)
  const deleteProduct = useDeleteProduct()

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      const confirmed = await dialog.confirm({
        title: 'Delete Product',
        message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        confirmText: 'Delete Product',
        cancelText: 'Cancel',
        variant: 'danger',
      })
      if (!confirmed) return
      deleteProduct.mutate(id)
    },
    [deleteProduct]
  )

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
  }, [queryClient])

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `obpark_products_${new Date().toISOString().slice(0, 10)}.csv`,
    })
  }, [])

  const onGridReady = useCallback((params: GridReadyEvent<AdminProduct>) => {
    params.api.sizeColumnsToFit()
  }, [])

  const onFilterChanged = useCallback(() => {
    if (gridRef.current?.api) {
      setFilteredCount(gridRef.current.api.getDisplayedRowCount())
    }
  }, [])

  // Cell Renderers with strict vertical Y-axis centering
  const ProductCellRenderer = useCallback(
    (props: CustomCellRendererProps<AdminProduct>) => {
      const p = props.data
      if (!p) return null
      const displayName = p.productName || p.name || 'Untitled Product'
      const primaryImage = p.imagePath || (p.images && p.images[0]) || ''

      return (
        <div className="flex items-center gap-2.5 w-full h-full py-1">
          {primaryImage ? (
            <img
              src={getFullImageUrl(primaryImage)}
              alt=""
              className="w-8 h-8 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400 shrink-0">
              <Package className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div className="min-w-0 flex-1 flex flex-col justify-center leading-tight">
            <p className="font-semibold text-gray-900 truncate text-sm" title={displayName}>
              {displayName}
            </p>
            {p.productHeading ? (
              <p className="text-xs text-gray-400 truncate mt-0.5" title={p.productHeading}>
                {p.productHeading}
              </p>
            ) : p.brand ? (
              <p className="text-xs text-gray-400 truncate mt-0.5">{p.brand}</p>
            ) : null}
          </div>
        </div>
      )
    },
    []
  )

  const ProductIdCellRenderer = useCallback(
    (props: CustomCellRendererProps<AdminProduct>) => {
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

  const CategoryCellRenderer = useCallback(
    (props: CustomCellRendererProps<AdminProduct>) => {
      const val = props.value || '—'
      return (
        <div className="flex items-center w-full h-full">
          <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-100 truncate">
            {val}
          </span>
        </div>
      )
    },
    []
  )

  const BaseCostCellRenderer = useCallback(
    (props: CustomCellRendererProps<AdminProduct>) => {
      const num = Number(props.value ?? 0)
      return (
        <div className="flex items-center w-full h-full text-gray-700 font-medium font-mono text-sm">
          ₹{num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )
    },
    []
  )

  const TaxCellRenderer = useCallback(
    (props: CustomCellRendererProps<AdminProduct>) => {
      const p = props.data
      if (!p) return null
      const hsn = p.hsnCode || p.taxCode || '—'
      const rate = p.gstRate !== undefined ? `${p.gstRate}%` : '18%'
      return (
        <div className="flex items-center w-full h-full">
          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
            {hsn} ({rate})
          </span>
        </div>
      )
    },
    []
  )

  const PriceCellRenderer = useCallback(
    (props: CustomCellRendererProps<AdminProduct>) => {
      const num = Number(props.value ?? 0)
      return (
        <div className="flex items-center w-full h-full font-bold text-emerald-800 font-mono text-sm">
          ₹{num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )
    },
    []
  )

  const ActionCellRenderer = useCallback(
    (props: CustomCellRendererProps<AdminProduct>) => {
      const p = props.data
      if (!p) return null
      const displayName = p.productName || p.name || 'Untitled Product'

      return (
        <div className="flex items-center justify-center gap-1.5 w-full h-full">
          <button
            onClick={() => setEditingProduct(p)}
            className="text-gray-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            title="Edit Product"
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(p.id, displayName)}
            disabled={deleteProduct.isPending}
            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
            title="Delete Product"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    },
    [handleDelete, deleteProduct.isPending]
  )

  // Column definitions with cellClass ensuring flex vertical centering
  const colDefs = useMemo<ColDef<AdminProduct>[]>(() => {
    return [
      {
        headerName: 'Product',
        field: 'productName',
        flex: 2.2,
        minWidth: 260,
        cellRenderer: ProductCellRenderer,
        cellClass: 'flex items-center',
        valueGetter: (params) => params.data?.productName || params.data?.name || '',
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith', 'equals'],
          debounceMs: 200,
        },
      },
      {
        headerName: 'Product ID',
        field: 'productId',
        flex: 1.1,
        minWidth: 140,
        cellClass: 'flex items-center',
        valueGetter: (params) => params.data?.productId || params.data?.sku || '—',
        cellRenderer: ProductIdCellRenderer,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Category',
        field: 'category',
        flex: 1.2,
        minWidth: 140,
        cellClass: 'flex items-center',
        valueGetter: (params) =>
          params.data?.category?.categoryName || params.data?.category?.name || '—',
        cellRenderer: CategoryCellRenderer,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Base Cost',
        field: 'productCost',
        flex: 1,
        minWidth: 120,
        cellClass: 'flex items-center',
        valueGetter: (params) => Number(params.data?.productCost ?? params.data?.basePrice ?? 0),
        cellRenderer: BaseCostCellRenderer,
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'HSN / Tax',
        headerTooltip: 'Harmonized System of Nomenclature & GST Rate',
        flex: 1.1,
        minWidth: 130,
        cellClass: 'flex items-center',
        valueGetter: (params) => {
          const hsn = params.data?.hsnCode || params.data?.taxCode || '—'
          const rate = params.data?.gstRate !== undefined ? `${params.data.gstRate}%` : '18%'
          return `${hsn} (${rate})`
        },
        cellRenderer: TaxCellRenderer,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Selling Price',
        field: 'price',
        flex: 1.1,
        minWidth: 130,
        cellClass: 'flex items-center',
        valueGetter: (params) => Number(params.data?.price ?? 0),
        cellRenderer: PriceCellRenderer,
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Action',
        width: 100,
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
    ProductCellRenderer,
    ProductIdCellRenderer,
    CategoryCellRenderer,
    BaseCostCellRenderer,
    TaxCellRenderer,
    PriceCellRenderer,
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

  const products = data?.products || []
  const totalProducts = data?.total ?? products.length

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
      {/* Scoped CSS to enforce exact vertical Y-axis centering across all AG Grid cells & wrappers */}
      <style>{`
        .ag-grid-obpark .ag-cell {
          display: flex !important;
          align-items: center !important;
        }
        .ag-grid-obpark .ag-cell-wrapper {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .ag-grid-obpark .ag-cell-value {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .ag-grid-obpark .ag-react-container {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .ag-grid-obpark .ag-header-cell-label {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
        }
      `}</style>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Filter Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              placeholder="Search products across all columns..."
              className="pl-8 pr-7 py-2 rounded-lg bg-gray-50 border text-xs outline-none w-72 focus:bg-white focus:ring-1 focus:ring-emerald-700 transition-all"
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              showFloatingFilters
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'text-gray-600 hover:bg-gray-50 border-gray-200'
            }`}
            title="Toggle column filter inputs"
            type="button"
          >
            <Filter className="h-3.5 w-3.5" />
            {showFloatingFilters ? 'Hide Column Filters' : 'Column Filters'}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            disabled={!products.length}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Export products to CSV"
            type="button"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh product list"
            type="button"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge count */}
          <div className="text-xs text-gray-500">
            {filteredCount !== null && filteredCount !== products.length ? (
              <span>
                Filtered: <strong className="text-gray-800">{filteredCount}</strong> of{' '}
                <strong className="text-gray-800">{products.length}</strong>
              </span>
            ) : (
              <span>
                Total: <strong className="text-gray-800">{totalProducts}</strong> products
              </span>
            )}
          </div>

          <Link
            href="/admin/products/add"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white font-medium hover:opacity-95 transition-opacity shadow-sm"
            style={{ backgroundColor: '#074139' }}
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* AG Grid Container */}
      <div
        className="ag-grid-obpark w-full rounded-xl overflow-hidden border border-gray-200"
        style={{ height: 'calc(100vh - 168px)', minHeight: '364px' }}
      >
        <AgGridReact<AdminProduct>
          ref={gridRef}
          theme={obparkGridTheme}
          rowData={products}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          rowHeight={52}
          headerHeight={36}
          loading={isLoading}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          animateRows={true}
          enableCellTextSelection={true}
          overlayNoRowsTemplate="<div class='p-8 text-center text-gray-400 text-sm'>No products found</div>"
          overlayLoadingTemplate="<div class='p-8 text-center text-emerald-800 text-sm font-medium'>Loading products...</div>"
        />
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}
