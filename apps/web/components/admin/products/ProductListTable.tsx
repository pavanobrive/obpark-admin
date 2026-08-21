'use client'

import { useState } from 'react'
import { Pencil, Archive, Search, Filter, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAdminProducts, useArchiveProduct } from '@/hooks/useAdminProducts'

export function ProductListTable() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAdminProducts(search)
  const archiveProduct = useArchiveProduct()

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU"
            className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-56"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border text-gray-500"><Filter className="h-4 w-4" /></button>
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
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-600 bg-green-50">
              <th className="px-3 py-2.5 font-medium rounded-l-lg">Name</th>
              <th className="px-3 py-2.5 font-medium">SKU</th>
              <th className="px-3 py-2.5 font-medium">Category</th>
              <th className="px-3 py-2.5 font-medium">Price</th>
              <th className="px-3 py-2.5 font-medium">Stock</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium rounded-r-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : !data?.products?.length ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">No products found</td></tr>
            ) : (
              data.products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-3 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-3 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-3 py-3 text-gray-600">{p.category?.name ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-700">₹{Number(p.basePrice).toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-gray-700">{p.stock}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                      {p.isActive && (
                        <button
                          onClick={() => archiveProduct.mutate(p.id)}
                          disabled={archiveProduct.isPending}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}