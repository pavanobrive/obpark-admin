'use client'

import { Upload, Trash2, Search } from 'lucide-react'
import { useAdminProducts } from '@/hooks/useAdminProducts'

// TODO: no media-library model exists in backend at all — this is entirely placeholder.
// Real version needs: a MediaAsset table (or reuse Product.images[] you already store),
// an upload endpoint (S3 presigned URL — you already planned this for Week 3 admin product images),
// and a way to see which products use which image.
export function ProductMediaGrid() {
  const { data, isLoading } = useAdminProducts()

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2.5 rounded-lg">
        No dedicated media library exists in the backend yet — showing product thumbnails as a stand-in. Real version needs an upload endpoint and asset table.
      </div>

      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="font-semibold text-gray-800">Product Images</h3>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input placeholder="Search media" className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-44" />
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white font-medium" style={{ backgroundColor: '#074139' }}>
              <Upload className="h-4 w-4" /> Upload
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : !data?.products?.length ? (
          <p className="text-sm text-gray-400 text-center py-10">No product images yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.products.map((p) => (
              <div key={p.id} className="group relative aspect-square rounded-lg bg-gray-100 overflow-hidden">
                <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[10px] truncate">{p.name}</p>
                </div>
                <button
                  aria-label={`Remove image for ${p.name}`}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}