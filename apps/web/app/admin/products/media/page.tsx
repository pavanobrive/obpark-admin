'use client'

import { useState } from 'react'
import { Header } from '@/components/admin/layout/Header'
import { ProductMediaGrid } from '@/components/admin/products/ProductMediaGrid'

export default function ProductMediaPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Product Media" onMenuClick={() => setDrawerOpen(true)} />
      <div className="p-6 space-y-6">
        <ProductMediaGrid />
      </div>
    </div>
  )
}