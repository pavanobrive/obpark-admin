'use client'

import { useState } from 'react'
import { Pencil, Trash2, Search, Filter, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAdminProducts, useDeleteProduct, AdminProduct } from '@/hooks/useAdminProducts'
import { EditProductModal } from './EditProductModal'

export function ProductListTable() {
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const { data, isLoading } = useAdminProducts(search)
  const deleteProduct = useDeleteProduct()

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    deleteProduct.mutate(id)
  }

  return (
    <div className="bg-white border rounded-xl p-4 shadow-md">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or brand"
            className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border text-gray-500 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
          </button>
          <Link
            href="/admin/products/add"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white font-medium"
            style={{ backgroundColor: '#074139' }}
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-600 bg-green-50">
              <th className="px-3 py-2.5 font-medium rounded-l-lg">Product</th>
              <th className="px-3 py-2.5 font-medium">Product ID</th>
              <th className="px-3 py-2.5 font-medium">Category</th>
              <th className="px-3 py-2.5 font-medium">Base Cost</th>
              <th className="px-3 py-2.5 font-medium">HSN / Tax</th>
              <th className="px-3 py-2.5 font-medium">Selling Price</th>
              <th className="px-3 py-2.5 font-medium rounded-r-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="py-3">
                    <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : !data?.products?.length ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                  No products found
                </td>
              </tr>
            ) : (
              data.products.map((p) => {
                const displayName = p.productName || p.name || 'Untitled Product'
                const primaryImage = p.imagePath || (p.images && p.images[0]) || ''
                const hsn = p.hsnCode || p.taxCode || '—'
                const rate = p.gstRate !== undefined ? `${p.gstRate}%` : '18%'

                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border flex items-center justify-center text-xs text-gray-400 shrink-0">
                            📦
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{displayName}</p>
                          {p.productHeading && (
                            <p className="text-[11px] text-gray-400 line-clamp-1">{p.productHeading}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-gray-500 font-mono text-xs">
                      {p.productId || p.sku}
                    </td>

                    <td className="px-3 py-3 text-gray-600">
                      {p.category?.categoryName || p.category?.name || '—'}
                    </td>

                    <td className="px-3 py-3 text-gray-600">
                      ₹{Number(p.productCost ?? p.basePrice ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-3 py-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                        {hsn} ({rate})
                      </span>
                    </td>

                    <td className="px-3 py-3 font-semibold text-emerald-800">
                      ₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="text-gray-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Edit Product"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, displayName)}
                          disabled={deleteProduct.isPending}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}
