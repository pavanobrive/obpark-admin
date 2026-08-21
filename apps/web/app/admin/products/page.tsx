'use client'

import { useState } from 'react'
import { Header } from '@/components/admin/layout/Header'
import { ProductListTable } from '@/components/admin/products/ProductListTable'

export default function ProductListPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Product List" onMenuClick={() => setDrawerOpen(true)} />
      <div className="p-6 space-y-6">
        <ProductListTable />
      </div>
    </div>
  )
}