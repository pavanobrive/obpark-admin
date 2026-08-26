'use client'

import { useState } from 'react'
import { Search, ImageOff } from 'lucide-react'
import { useAdminProducts } from '@/hooks/useAdminProducts'

export function ProductMediaGrid() {
  const { data, isLoading } = useAdminProducts()
  const [search, setSearch] = useState('')

  const allImages = (data?.products ?? [])
    .filter((p: any) => p.images && p.images.length > 0)
    .flatMap((p: any) => p.images.map((url: string, i: number) => ({
      url,
      productName: p.name,
      productId: p.id,
      key: `${p.id}-${i}`,
    })))
    .filter((img) => img.productName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="font-semibold text-gray-800">Product Images</h3>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product" className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-44" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : allImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ImageOff className="h-8 w-8 mb-2" />
            <p className="text-sm">No product images yet</p>
            <p className="text-xs mt-1">Upload images from the Add Product page</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {allImages.map((img) => {
              return (
                <a key={img.key} href={img.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-lg bg-gray-100 overflow-hidden block">
                  <img src={img.url} alt={img.productName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] truncate">{img.productName}</p>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}